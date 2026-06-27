/* ============================================================
   cloud.js — capa de comunidad (Fase 1: cuentas + sync en la nube).
   Integra con Supabase vía fetch puro (sin dependencias). Config-driven:
   si no hay url+anonKey configuradas, FC.cloud queda inerte y la app
   funciona 100% local. Expone FC.cloud.
   ============================================================ */
(function () {
  window.FC = window.FC || {};
  const S = FC.store;
  const SESSION_KEY = "carrerafc:cloud:session"; // tokens FUERA de db: el export/import nunca los filtra
  const C = {};

  /* ---------- config ---------- */
  // Credenciales públicas de la comunidad (anon key — segura en navegador con RLS activo).
  // Los usuarios no necesitan configurar nada; se conectan automáticamente a la comunidad.
  const DEFAULT_CFG = {
    url: "https://tqyehsahytpdafehapoi.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeWVoc2FoeXRwZGFmZWhhcG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDk0NDgsImV4cCI6MjA5NzI4NTQ0OH0.QzeS_10TrqyErxYHPoEQGZ3YahPUygbOQ5t5AmyAtzw",
  };
  C.config = () => {
    const stored = S.settings().cloud || {};
    if (stored.url && stored.anonKey) return stored;
    return { url: DEFAULT_CFG.url, anonKey: DEFAULT_CFG.anonKey, lastBackup: stored.lastBackup || null, shares: stored.shares || {} };
  };
  C.isConfigured = () => true;
  C.validUrl = (u) => /^https:\/\/[a-z0-9-]+\.supabase\.(co|in|net)$/i.test(String(u || "").trim());
  C.setConfig = (url, anonKey) => {
    url = String(url || "").trim().replace(/\/+$/, "");
    const cur = S.settings().cloud || {};
    S.settings().cloud = { url, anonKey: String(anonKey || "").trim(), lastBackup: cur.lastBackup || null, shares: cur.shares || {} };
    S.save();
  };
  C.disconnect = () => { delete S.settings().cloud; S.save(); C.logout(); };

  /* ---------- sesión (clave de localStorage propia, no en db) ---------- */
  let session = null;
  function loadSession() { try { session = JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch (e) { session = null; } return session; }
  function saveSession(s) { session = s; try { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); } catch (e) { } }
  C.user = () => (session && session.user) ? session.user : null;
  C.isLoggedIn = () => !!(session && session.access_token);
  C.myOwnerId = () => (C.user() || {}).id || null;
  C.logout = () => saveSession(null);

  /* ---------- fetch de bajo nivel a la API de Supabase ---------- */
  async function apiWith(cfg, path, opts) {
    if (!cfg || !cfg.url) throw new Error("Nube no configurada");
    opts = opts || {};
    const headers = Object.assign({ apikey: cfg.anonKey, "Content-Type": "application/json" }, opts.headers || {});
    if (opts.auth && session && session.access_token) headers.Authorization = "Bearer " + session.access_token;
    let res;
    try { res = await fetch(cfg.url + path, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined }); }
    catch (e) { throw new Error("Sin conexión con la nube (¿url correcta? ¿CORS?)"); }
    const txt = await res.text();
    let data = null; try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = txt; }
    if (res.status === 503) { const err = new Error("El servidor de comunidad está pausado por inactividad. Tus datos locales funcionan con normalidad."); err.code = "SUPABASE_PAUSED"; throw err; }
    if (!res.ok) throw new Error((data && (data.msg || data.error_description || data.message || data.error)) || ("Error " + res.status));
    return data;
  }
  function api(path, opts) { return apiWith(C.config(), path, opts); }

  /* ---------- auth passwordless (código OTP por email) ---------- */
  C.sendCode = (email) => api("/auth/v1/otp?redirect_to=" + encodeURIComponent("https://juzalex30.github.io/Career-Mode-webapp/"), { method: "POST", body: { email: String(email || "").trim(), create_user: true } });
  // verifyCode: el usuario teclea el código de 6 dígitos del email (en vez de pulsar el enlace).
  // Inicia sesión directamente sin depender del redirect. Tras éxito, deja la sesión lista.
  C.verifyCode = async (email, token) => {
    const data = await api("/auth/v1/verify", { method: "POST", body: { type: "email", email: String(email || "").trim(), token: String(token || "").trim() } });
    if (!data || !data.access_token) throw new Error("Código no válido o caducado");
    saveSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token || "",
      expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000,
      user: data.user ? { id: data.user.id, email: data.user.email || "" } : { id: null, email: String(email || "").trim() },
    });
    if (!session.user || !session.user.id) await C.fetchUser();
    return C.user();
  };
  // handleMagicLink: procesa el hash #access_token=... que Supabase añade al redirect tras el clic en el email.
  C.handleMagicLink = (hash) => {
    try {
      const params = new URLSearchParams(String(hash || "").replace(/^#/, ""));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token") || "";
      const expires_in = params.get("expires_in");
      if (!access_token) return false;
      saveSession({ access_token, refresh_token, expires_at: Date.now() + (Number(expires_in) || 3600) * 1000, user: { id: null, email: null } });
      return true;
    } catch (e) { return false; }
  };
  // Rellena los datos del usuario en sesión (llamar tras handleMagicLink).
  C.fetchUser = async () => {
    try {
      const data = await api("/auth/v1/user", { auth: true });
      if (data && data.id && session) saveSession(Object.assign({}, session, { user: { id: data.id, email: data.email || "" } }));
      return data || null;
    } catch (e) { return null; }
  };
  async function ensureFresh() {
    if (!session || !session.access_token) return false;
    if (Date.now() < (session.expires_at || 0) - 60000) return true;
    if (!session.refresh_token) { saveSession(null); return false; }
    try {
      const data = await api("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: session.refresh_token } });
      if (data && data.access_token) {
        saveSession({ access_token: data.access_token, refresh_token: data.refresh_token || session.refresh_token, expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000, user: session.user });
        return true;
      }
    } catch (e) { saveSession(null); }
    return false;
  }

  /* ---------- sync de carreras (direccional y explícito) ---------- */
  function row(c) { return { user_id: (session.user || {}).id, id: c.id, name: c.clubName || c.name || "Carrera", data: c, updated_at: new Date().toISOString() }; }
  C.push = async () => { // local -> nube (upsert de TODAS las carreras)
    if (!(await ensureFresh())) throw new Error("Inicia sesión primero");
    const rows = S.careersList().map(row);
    if (!rows.length) return { pushed: 0 };
    await api("/rest/v1/careers?on_conflict=user_id,id", { method: "POST", auth: true, headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: rows });
    const cfg = S.settings().cloud || {}; cfg.lastBackup = Date.now(); S.settings().cloud = cfg; S.save();
    return { pushed: rows.length };
  };
  C.pull = async () => { // nube -> local (añade/reemplaza; nunca borra carreras locales)
    if (!(await ensureFresh())) throw new Error("Inicia sesión primero");
    const rows = await api("/rest/v1/careers?select=id,data,updated_at", { method: "GET", auth: true });
    let n = 0;
    (rows || []).forEach(r => { if (r && r.data && r.data.id) { S.upsertCareer(r.data, true); n++; } });
    if (n) S.emit();
    return { pulled: n };
  };
  C.cloudCount = async () => {
    if (!(await ensureFresh())) throw new Error("Inicia sesión primero");
    const rows = await api("/rest/v1/careers?select=id", { method: "GET", auth: true });
    return (rows || []).length;
  };

  /* ---------- compartir carrera (Fase 2a): solo un RESUMEN público, nunca la carrera completa ---------- */
  function genCode() { let s = ""; for (let i = 0; i < 10; i++) s += "abcdefghijkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 32)]; return s; }
  C.isShared = (careerId) => !!((C.config().shares || {})[careerId]);
  C.shareLink = (code) => { const cfg = C.config(); const b = btoa(JSON.stringify({ c: code, u: cfg.url, k: cfg.anonKey })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); return location.origin + location.pathname + "#share=" + b; };
  C.careerSummary = (c) => {
    const seasons = c.seasons || [];
    let bestPoints = 0, bestSeason = null, w = 0, d = 0, l = 0;
    seasons.forEach(s => { const sm = S.seasonSummary(c, s); w += sm.w; d += sm.d; l += sm.l; if (sm.points > bestPoints) { bestPoints = sm.points; bestSeason = { label: s.label, points: sm.points, w: sm.w, d: sm.d, l: sm.l }; } });
    const rec = S.allTimeRecords(c);
    const topScorer = (rec && rec.topScorer && rec.topScorer.goals) ? { name: rec.topScorer.name, goals: rec.topScorer.goals } : null;
    const titlesList = (c.trophies || []).filter(t => t.result === "winner").map(t => ({ competition: t.competition, season: t.season }));
    const played = w + d + l;
    return {
      club: c.clubName, league: c.leagueName, manager: c.managerName || "",
      seasons: seasons.length, played, titles: titlesList.length,
      winPct: played ? Math.round(w / played * 100) : 0,
      bestPoints, bestSeason, topScorer, titlesList, bestUnbeaten: (rec && rec.bestUnbeaten) || 0,
    };
  };
  C.publish = async (career) => {
    if (!(await ensureFresh())) throw new Error("Inicia sesión primero");
    const cfg0 = S.settings().cloud || {};
    const sum = C.careerSummary(career);
    const base = { owner_id: session.user.id, club: sum.club, league: sum.league, manager: sum.manager, titles: sum.titles, best_points: sum.bestPoints, summary: sum };
    const post = (code) => api("/rest/v1/shared_careers?on_conflict=share_id", { method: "POST", auth: true, headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: [Object.assign({ share_id: code }, base)] });
    let code = (cfg0.shares || {})[career.id] || genCode();
    try { await post(code); }
    catch (e) { if (!(cfg0.shares || {})[career.id]) { code = genCode(); await post(code); } else throw e; }
    const cfg = S.settings().cloud || {}; cfg.shares = Object.assign({}, cfg.shares, { [career.id]: code }); S.settings().cloud = cfg; S.save();
    return { shareId: code, link: C.shareLink(code) };
  };
  C.unpublish = async (careerId) => {
    if (!(await ensureFresh())) throw new Error("Inicia sesión primero");
    const code = (C.config().shares || {})[careerId];
    if (code) await api("/rest/v1/shared_careers?share_id=eq." + encodeURIComponent(code), { method: "DELETE", auth: true });
    const cfg = S.settings().cloud || {}; const m = Object.assign({}, cfg.shares); delete m[careerId]; cfg.shares = m; S.settings().cloud = cfg; S.save();
    return { ok: true };
  };
  C.getShared = async (code, cfgOverride) => {
    const cfg = cfgOverride || C.config();
    if (!cfg.url) throw new Error("Nube no configurada");
    const rows = await apiWith(cfg, "/rest/v1/shared_careers?select=*&share_id=eq." + encodeURIComponent(String(code || "").trim()), { method: "GET" });
    return (rows && rows[0]) || null;
  };
  // Ranking global (lectura pública con apikey, sin sesión): carreras publicadas ordenadas por títulos.
  C.leaderboard = (limit) => api("/rest/v1/shared_careers?select=share_id,owner_id,club,league,manager,titles,best_points,summary&order=titles.desc,best_points.desc&limit=" + (parseInt(limit, 10) || 20));
  // Feed de actividad (lectura pública): lo último publicado por la comunidad, ordenado por fecha.
  C.activityFeed = (limit) => api("/rest/v1/shared_careers?select=share_id,owner_id,club,league,manager,titles,best_points,summary,created_at&order=created_at.desc&limit=" + (parseInt(limit, 10) || 30));

  /* ---------- perfil público del manager (todas sus carreras publicadas) ---------- */
  C.profileCareers = (ownerId, cfgOverride) => apiWith(cfgOverride || C.config(), "/rest/v1/shared_careers?select=*&owner_id=eq." + encodeURIComponent(String(ownerId || "").trim()) + "&order=titles.desc,best_points.desc", { method: "GET" });
  C.profileLink = (ownerId) => { const cfg = C.config(); const b = btoa(JSON.stringify({ o: ownerId, u: cfg.url, k: cfg.anonKey })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); return location.origin + location.pathname + "#profile=" + b; };

  /* ---------- comentarios en carreras compartidas (públicos en lectura; escribir requiere sesión) ---------- */
  let lastCommentAt = 0; // cooldown de cliente (UX); el rate-limit real es el trigger del servidor
  C.getComments = (shareId, cfgOverride) => apiWith(cfgOverride || C.config(), "/rest/v1/shared_comments?select=id,author,body,created_at,author_id&share_id=eq." + encodeURIComponent(String(shareId || "").trim()) + "&order=created_at.asc", { method: "GET" });
  C.addComment = async (shareId, body) => {
    if (!(await ensureFresh())) throw new Error("Inicia sesión primero");
    const text = String(body || "").trim().slice(0, 500);
    if (text.length < 2) throw new Error("Escribe un comentario un poco más largo");
    if (Date.now() - lastCommentAt < 8000) throw new Error("Espera unos segundos antes de comentar de nuevo");
    const emailFallback = (((C.user() || {}).email) || "Anónimo").split("@")[0];
    const author = (S.settings().displayName || "").trim().slice(0, 30) || emailFallback;
    // author_id explícito (mismo patrón probado que C.publish con owner_id) para no depender solo del default RLS.
    await api("/rest/v1/shared_comments", { method: "POST", auth: true, headers: { Prefer: "return=minimal" }, body: [{ share_id: String(shareId || "").trim(), author_id: session.user.id, author, body: text }] });
    lastCommentAt = Date.now();
    return { ok: true };
  };
  C.deleteComment = async (id) => {
    if (!(await ensureFresh())) throw new Error("Inicia sesión primero");
    await api("/rest/v1/shared_comments?id=eq." + encodeURIComponent(String(id || "").trim()), { method: "DELETE", auth: true });
    return { ok: true };
  };

  /* ---------- RGPD: borrado de cuenta y datos (derecho de supresión) ----------
     Dos niveles: (1) borra SIEMPRE los datos del usuario en la nube vía RLS
     (funciona con la sola sesión); (2) intenta borrar la propia cuenta de
     auth.users mediante una Edge Function con service-role (que el dueño del
     proyecto despliega como `delete-account`). Si la función no está desplegada,
     los datos personales ya quedaron eliminados y devolvemos authDeleted:false. */
  C.deleteAccount = async () => {
    if (!(await ensureFresh())) throw new Error("Inicia sesión primero");
    const uid = (session.user || {}).id;
    if (!uid) throw new Error("No se pudo identificar tu cuenta");
    const eid = encodeURIComponent(uid);
    const minimal = { method: "DELETE", auth: true, headers: { Prefer: "return=minimal" } };
    // 1) Datos del usuario en la nube (PostgREST exige filtro en DELETE → por id propio).
    await api("/rest/v1/shared_comments?author_id=eq." + eid, minimal);
    await api("/rest/v1/shared_careers?owner_id=eq." + eid, minimal);
    await api("/rest/v1/careers?user_id=eq." + eid, minimal);
    // 2) Cuenta de auth (Edge Function con service-role). Opcional/best-effort.
    let authDeleted = false;
    try { await api("/functions/v1/delete-account", { method: "POST", auth: true }); authDeleted = true; }
    catch (e) { authDeleted = false; }
    // 3) Limpiar sesión local y referencias de publicación.
    const s = S.settings().cloud; if (s) { s.shares = {}; S.settings().cloud = s; S.save(); }
    C.logout();
    return { authDeleted };
  };

  // SQL que el usuario ejecuta una vez en Supabase (mostrado en la UI).
  C.SETUP_SQL = [
    "-- 1) Carreras (sync privado por usuario)",
    "create table if not exists careers (",
    "  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,",
    "  id text not null,",
    "  name text,",
    "  data jsonb not null,",
    "  updated_at timestamptz not null default now(),",
    "  primary key (user_id, id)",
    ");",
    "alter table careers enable row level security;",
    "create policy \"own careers\" on careers for all",
    "  using (user_id = auth.uid()) with check (user_id = auth.uid());",
    "",
    "-- 2) Carreras compartidas (resumen público de solo lectura)",
    "create table if not exists shared_careers (",
    "  share_id text primary key,",
    "  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,",
    "  club text, league text, manager text,",
    "  titles int not null default 0,",
    "  best_points int not null default 0,",
    "  summary jsonb not null,",
    "  created_at timestamptz not null default now()",
    ");",
    "alter table shared_careers enable row level security;",
    "create policy \"shared public read\" on shared_careers for select using (true);",
    "create policy \"shared owner write\" on shared_careers for insert with check (owner_id = auth.uid());",
    "create policy \"shared owner update\" on shared_careers for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());",
    "create policy \"shared owner delete\" on shared_careers for delete using (owner_id = auth.uid());",
    "",
    "-- 3) Comentarios en carreras compartidas (lectura pública; escribir requiere sesión)",
    "create table if not exists shared_comments (",
    "  id uuid primary key default gen_random_uuid(),",
    "  share_id text not null references shared_careers(share_id) on delete cascade,",
    "  author_id uuid not null default auth.uid() references auth.users(id) on delete cascade,",
    "  author text,",
    "  body text not null,",
    "  created_at timestamptz not null default now()",
    ");",
    "alter table shared_comments enable row level security;",
    "create policy \"comments public read\" on shared_comments for select using (true);",
    "create policy \"comments owner write\" on shared_comments for insert with check (author_id = auth.uid());",
    "create policy \"comments owner delete\" on shared_comments for delete using (author_id = auth.uid());",
    "create index if not exists shared_comments_share_idx on shared_comments(share_id, created_at);",
    "",
    "-- 4) Permisos base (GRANT) que PostgREST necesita ADEMÁS de las policies RLS.",
    "--    Sin esto, las tablas públicas dan 'permission denied' a los visitantes",
    "--    sin sesión (ranking, feed, enlaces compartidos y comentarios no se ven).",
    "grant select, insert, update, delete on public.careers to authenticated;",
    "grant select on public.shared_careers to anon, authenticated;",
    "grant insert, update, delete on public.shared_careers to authenticated;",
    "grant select on public.shared_comments to anon, authenticated;",
    "grant insert, delete on public.shared_comments to authenticated;",
    "",
    "-- 5) Anti-spam: limites de frecuencia por usuario (rate limiting en servidor).",
    "create or replace function public.check_comment_rate() returns trigger",
    "language plpgsql as $$",
    "declare per_min int; per_hour int;",
    "begin",
    "  select count(*) into per_min from public.shared_comments",
    "    where author_id = new.author_id and created_at > now() - interval '1 minute';",
    "  if per_min >= 5 then raise exception 'Vas muy rapido: espera un momento antes de comentar de nuevo.'; end if;",
    "  select count(*) into per_hour from public.shared_comments",
    "    where author_id = new.author_id and created_at > now() - interval '1 hour';",
    "  if per_hour >= 60 then raise exception 'Has comentado demasiado en la ultima hora. Intentalo mas tarde.'; end if;",
    "  return new;",
    "end; $$;",
    "drop trigger if exists trg_comment_rate on public.shared_comments;",
    "create trigger trg_comment_rate before insert on public.shared_comments",
    "  for each row execute function public.check_comment_rate();",
    "create or replace function public.check_share_limit() returns trigger",
    "language plpgsql as $$",
    "declare total int;",
    "begin",
    "  if exists (select 1 from public.shared_careers where share_id = new.share_id) then return new; end if;",
    "  select count(*) into total from public.shared_careers where owner_id = new.owner_id;",
    "  if total >= 25 then raise exception 'Has alcanzado el maximo de carreras publicadas.'; end if;",
    "  return new;",
    "end; $$;",
    "drop trigger if exists trg_share_limit on public.shared_careers;",
    "create trigger trg_share_limit before insert on public.shared_careers",
    "  for each row execute function public.check_share_limit();",
  ].join("\n");

  loadSession();
  FC.cloud = C;
})();
