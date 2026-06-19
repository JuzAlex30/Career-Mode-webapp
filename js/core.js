/* ============================================================
   core.js — util, iconos, charts, store (estado/persistencia/
   derivaciones), router. Expone FC.util, FC.icons, FC.charts,
   FC.store, FC.router.
   ============================================================ */
(function () {
  window.FC = window.FC || {};

  /* ============================================================
     UTIL
     ============================================================ */
  const U = {};
  U.uid = () => "id" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  U.clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  U.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
  U.deep = (o) => JSON.parse(JSON.stringify(o));
  U.sum = (arr, f) => arr.reduce((s, x) => s + (f ? f(x) : x), 0);
  U.by = (k) => (a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0);
  U.initials = (name) => String(name || "?").trim().split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase() || "?";
  U.money = (n) => {
    n = Number(n) || 0;
    const sign = n < 0 ? "-" : "";
    const a = Math.abs(n);
    if (a >= 1e6) return sign + "€" + (a / 1e6).toFixed(a % 1e6 === 0 ? 0 : 1) + "M";
    if (a >= 1e3) return sign + "€" + (a / 1e3).toFixed(a % 1e3 === 0 ? 0 : 0) + "K";
    return sign + "€" + a;
  };
  U.colorFor = (str) => {
    let h = 0; str = String(str || "");
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return `hsl(${h} 62% 46%)`;
  };
  // Devuelve el color solo si tiene forma de color CSS válido (#hex, rgb/hsl(),
  // o un nombre simple); si no, el fallback. Evita que un badgeColor venido de un
  // JSON importado escape del atributo style= e inyecte HTML/CSS.
  U.safeColor = (v, fallback) => {
    v = String(v == null ? "" : v).trim();
    const ok = /^#[0-9a-f]{3,8}$/i.test(v)
      || /^(rgb|hsl)a?\([0-9.,%\s/]+\)$/i.test(v)
      || /^[a-z]{3,20}$/i.test(v);
    return ok ? v : (fallback || "var(--accent)");
  };
  // Genera un escudo SVG con forma de escudo, colores oficiales del equipo e iniciales.
  // Usa D.TEAM_COLORS si el equipo está catalogado; si no, cae al hash de color.
  U.teamCrest = (clubName, size) => {
    size = size || 36;
    const tc = (FC.data && FC.data.TEAM_COLORS && FC.data.TEAM_COLORS[clubName]) || {};
    const primary = U.safeColor(tc.primary, U.colorFor(clubName));
    const secondary = U.safeColor(tc.secondary, "#ffffff");
    const ini = U.initials(clubName);
    const fs = ini.length > 2 ? 10 : 13;
    return `<svg viewBox="0 0 40 46" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;flex-shrink:0">
      <path d="M20 2 L37 7 L37 26 Q37 39 20 44 Q3 39 3 26 L3 7 Z" fill="${primary}" stroke="${secondary}" stroke-width="2"/>
      <path d="M20 7 L32 11 L32 26 Q32 35 20 39 Q8 35 8 26 L8 11 Z" fill="none" stroke="${secondary}" stroke-width="0.8" opacity="0.4"/>
      <text x="20" y="${ini.length > 2 ? 27 : 28}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="${secondary}" font-family="system-ui,sans-serif" letter-spacing="-0.5">${ini}</text>
    </svg>`;
  };
  U.fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return U.esc(d); // fecha no parseable (p.ej. dato importado): escapar por seguridad
    return dt.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  };
  // DOM helpers
  U.el = (sel, root) => (root || document).querySelector(sel);
  U.els = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  U.h = (tag, attrs, children) => {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.startsWith("on") && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(c => e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  };
  U.ovrClass = (o) => (o >= 80 ? "" : o >= 70 ? "mid" : "low");
  FC.util = U;

  /* ============================================================
     ICONOS (SVG inline, trazo)
     ============================================================ */
  const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICONS = {
    home: P('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>'),
    ball: P('<circle cx="12" cy="12" r="9"/><path d="m12 7 3 2.2-1.1 3.6h-3.8L9 9.2 12 7Z"/>'),
    table: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16"/>'),
    shirt: P('<path d="M8 3 4 6l2 3 2-1v12h8V8l2 1 2-3-4-3-2 2H10L8 3Z"/>'),
    target: P('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>'),
    trophy: P('<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 15h6M10 18h4M9 21h6"/>'),
    search: P('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/>'),
    gear: P('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19 5l-2 2M7 17l-2 2M19 19l-2-2M7 7 5 5"/>'),
    moon: P('<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"/>'),
    sun: P('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>'),
    menu: P('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    plus: P('<path d="M12 5v14M5 12h14"/>'),
    close: P('<path d="M6 6l12 12M18 6 6 18"/>'),
    edit: P('<path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3Z"/><path d="M14 6.5 17.5 10"/>'),
    trash: P('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
    chevron: P('<path d="m9 6 6 6-6 6"/>'),
    caret: P('<path d="m6 9 6 6 6-6"/>'),
    check: P('<path d="m5 12 4 4L19 6"/>'),
    flame: P('<path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 1.5 2S12 7 12 3Z"/>'),
    medal: P('<circle cx="12" cy="14" r="6"/><path d="m8 3 4 6 4-6"/>'),
    star: P('<path d="m12 3 2.6 5.6 6.1.7-4.5 4.1 1.2 6L12 17.8 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z"/>'),
    download: P('<path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/>'),
    upload: P('<path d="M12 20V9m0 0 4 4m-4-4-4 4M5 4h14"/>'),
    share: P('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/>'),
    coin: P('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'),
    book: P('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4Z"/><path d="M5 4v16"/>'),
    flag: P('<path d="M5 21V4M5 5h11l-2 4 2 4H5"/>'),
    bell: P('<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>'),
    swap: P('<path d="M7 7h12l-3-3M17 17H5l3 3"/>'),
    growth: P('<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>'),
    sprout: P('<path d="M12 20v-9"/><path d="M12 11C12 7 9 5 5 5c0 4 3 6 7 6Z"/><path d="M12 11c0-3 2-5 6-5 0 3-2 5-6 5Z"/>'),
    news: P('<path d="M4 5h13v14H5a1 1 0 0 1-1-1V5Z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M7 9h7M7 12h7M7 15h5"/>'),
    dice: P('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8.5" cy="8.5" r="1.3"/><circle cx="15.5" cy="8.5" r="1.3"/><circle cx="8.5" cy="15.5" r="1.3"/><circle cx="15.5" cy="15.5" r="1.3"/><circle cx="12" cy="12" r="1.3"/>'),
    cloud: P('<path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 .5 8.5H7Z"/>'),
    play: P('<path d="M7 5v14l11-7L7 5Z"/>'),
    bandage: P('<path d="m9.5 9.5 5 5M10 14l-1.5 1.5a3.5 3.5 0 0 1-5-5L5 9M14 10l1.5-1.5a3.5 3.5 0 0 1 5 5L19 15"/><rect x="7.5" y="7.5" width="9" height="9" rx="2" transform="rotate(45 12 12)"/>'),
    calendar: P('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/>'),
    plane: P('<path d="M21 15.5v-2l-8-5V3.7a1.4 1.4 0 0 0-2.8 0V8.5l-8 5v2l8-2.4V18l-2 1.4V21l3.4-1 3.4 1v-1.6L13 18v-4.9l8 2.4Z"/>'),
    bus: P('<rect x="4" y="4.5" width="16" height="12" rx="2"/><path d="M4 11h16M8 4.5v6.5M16 4.5v6.5"/><path d="M7 16.5v2M17 16.5v2"/>'),
    pin: P('<path d="M12 21s6-5.6 6-10a6 6 0 1 0-12 0c0 4.4 6 10 6 10Z"/><circle cx="12" cy="11" r="2.2"/>'),
    snow: P('<path d="M12 3v18M4.5 7.5 19.5 16.5M19.5 7.5 4.5 16.5M3.5 12h17"/>'),
  };
  FC.icons = ICONS;
  U.icon = (name) => ICONS[name] || "";
  U.hydrateIcons = (root) => U.els("[data-icon]", root).forEach(s => { if (!s.dataset.done) { s.innerHTML = U.icon(s.dataset.icon); s.dataset.done = "1"; } });

  /* ============================================================
     CHARTS (SVG ligero, sin dependencias)
     ============================================================ */
  const C = {};
  C.line = (values, opts) => {
    opts = opts || {};
    const w = opts.w || 320, hh = opts.h || 90, pad = 8;
    if (!values.length) return `<svg viewBox="0 0 ${w} ${hh}"></svg>`;
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    const stepX = (w - pad * 2) / Math.max(1, values.length - 1);
    const pts = values.map((v, i) => [pad + i * stepX, hh - pad - ((v - min) / range) * (hh - pad * 2)]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = d + ` L ${pts[pts.length-1][0].toFixed(1)} ${hh-pad} L ${pad} ${hh-pad} Z`;
    const col = opts.color || "var(--accent)";
    return `<svg viewBox="0 0 ${w} ${hh}" preserveAspectRatio="none" style="width:100%;height:${hh}px">
      <defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".28"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#lg)"/>
      <path d="${d}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      ${pts.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6" fill="${col}"/>`).join("")}
    </svg>`;
  };
  C.donut = (pct, opts) => {
    opts = opts || {}; const sz = opts.size || 78, sw = opts.stroke || 9, r = (sz - sw) / 2, cx = sz / 2;
    const circ = 2 * Math.PI * r; const off = circ * (1 - U.clamp(pct, 0, 100) / 100);
    const col = opts.color || "var(--accent)";
    return `<svg viewBox="0 0 ${sz} ${sz}" style="width:${sz}px;height:${sz}px">
      <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${sw}"/>
      <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"
        stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${cx} ${cx})"/>
      <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-size="${sz*0.26}" font-weight="800" fill="var(--text)">${opts.label != null ? opts.label : Math.round(pct) + "%"}</text>
    </svg>`;
  };
  C.formBar = (results) => results.map(r => `<span class="pill-${r.toLowerCase()}">${r}</span>`).join("");
  FC.charts = C;

  /* ============================================================
     STORE
     ============================================================ */
  const KEY = "carrerafc:db:v1";
  let db = null;
  const listeners = [];

  function blank() {
    return { version: 1, activeCareerId: null, careers: {}, settings: { theme: "dark" } };
  }
  // Garantiza que una carrera (recién cargada o importada a mano) tiene todas
  // sus colecciones como arrays y al menos una temporada válida. Es la defensa
  // central contra JSON antiguo o corrupto: sin esto, las vistas revientan al
  // acceder a season.id, c.matches.find, etc.
  function normalizeCareer(c) {
    if (!c || typeof c !== "object") return c;
    ["players", "matches", "trophies", "awards", "transfers", "challenges", "achievements", "notes", "youth", "injuries"]
      .forEach(k => { if (!Array.isArray(c[k])) c[k] = []; });
    c.players.forEach(p => { if (p && !Array.isArray(p.ovrHistory)) p.ovrHistory = []; });
    if (!Array.isArray(c.seasons)) c.seasons = [];
    if (!c.seasons.length) {
      const startYear = Number(c.startYear) || new Date().getFullYear();
      c.seasons.push({
        id: U.uid(), label: startYear + "/" + String(startYear + 1).slice(-2),
        startYear, leagueId: c.leagueId, leagueName: c.leagueName,
        teams: [], status: "active", position: null, boardObjectives: [], note: "",
      });
    }
    c.seasons.forEach(s => { if (typeof s.transferBudget !== "number" || !isFinite(s.transferBudget)) s.transferBudget = 0; });
    if (!c.seasons.some(s => s.id === c.currentSeasonId)) c.currentSeasonId = c.seasons[0].id;
    if (!c.clubName) c.clubName = c.name || "Mi club";
    return c;
  }
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)) || blank(); }
    catch (e) { db = blank(); }
    if (!db.careers || typeof db.careers !== "object") db.careers = {};
    if (!db.settings) db.settings = { theme: "dark" };
    Object.values(db.careers).forEach(normalizeCareer);
    return db;
  }
  let saveTimer = null;
  function writeNow() {
    clearTimeout(saveTimer); saveTimer = null;
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { console.error("save failed", e); }
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(writeNow, 120);
  }
  // Si hay una escritura pendiente del debounce y el usuario cierra u oculta la
  // pestaña, la volcamos de inmediato para no perder el último cambio.
  function flush() { if (saveTimer) writeNow(); }
  window.addEventListener("beforeunload", flush);
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
  function emit() { save(); listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); }

  const S = {};
  S.load = load;
  S.raw = () => db;
  S.onChange = (fn) => listeners.push(fn);
  S.save = save;
  S.flush = flush;
  S.emit = emit;

  S.settings = () => db.settings;
  S.careersList = () => Object.values(db.careers).sort(U.by("createdAt"));
  S.getActiveCareer = () => db.careers[db.activeCareerId] || null;
  S.setActiveCareer = (id) => { db.activeCareerId = id; emit(); };

  S.createCareer = (data) => {
    const id = U.uid();
    const seasonId = U.uid();
    const startYear = Number(data.startYear) || new Date().getFullYear();
    const season = {
      id: seasonId,
      label: data.seasonLabel || (startYear + "/" + String((startYear + 1)).slice(-2)),
      startYear,
      leagueId: data.leagueId,
      leagueName: data.leagueName,
      teams: (data.teams || []).slice(),
      status: "active",
      position: null,
      boardObjectives: data.boardObjectives || [],
      note: "",
      transferBudget: Number(data.transferBudget) || 0,
    };
    const career = {
      id, name: data.name || data.clubName, clubName: data.clubName,
      leagueId: data.leagueId, leagueName: data.leagueName, country: data.country || "",
      managerName: data.managerName || "", badgeColor: data.badgeColor || U.colorFor(data.clubName),
      createdAt: Date.now(), currentSeasonId: seasonId,
      seasons: [season], players: [], matches: [], trophies: [], awards: [],
      transfers: [], challenges: [], achievements: [], notes: [],
    };
    db.careers[id] = career;
    db.activeCareerId = id;
    emit();
    return career;
  };
  S.updateCareer = (patch) => { const c = S.getActiveCareer(); if (!c) return; Object.assign(c, patch); emit(); };
  S.deleteCareer = (id) => {
    delete db.careers[id];
    if (db.activeCareerId === id) db.activeCareerId = S.careersList()[0] ? S.careersList()[0].id : null;
    emit();
  };
  // Inserta/reemplaza una carrera por id (la normaliza). silent=true para upsert
  // masivo (el llamador hace un único emit() al final). Usado por la sync de nube.
  S.upsertCareer = (obj, silent) => {
    if (!obj || !obj.id) return null;
    normalizeCareer(obj);
    db.careers[obj.id] = obj;
    if (!db.activeCareerId) db.activeCareerId = obj.id;
    if (!silent) emit();
    return obj;
  };

  S.currentSeason = (c) => (c.seasons || []).find(s => s.id === c.currentSeasonId) || (c.seasons || [])[0];
  S.getSeason = (c, id) => (c.seasons || []).find(s => s.id === id);
  S.addSeason = (c, data) => {
    const prev = S.currentSeason(c);
    // snapshot del OVR de cada jugador al cerrar la temporada que termina (alimenta Desarrollo)
    if (prev) (c.players || []).forEach(p => {
      const ovr = Number(p.ovr);
      if (!Number.isFinite(ovr) || ovr <= 0) return;
      p.ovrHistory = p.ovrHistory || [];
      if (!p.ovrHistory.some(h => h.year === prev.startYear))
        p.ovrHistory.push({ year: prev.startYear, label: prev.label, ovr, age: Number(p.age) || null });
    });
    const startYear = (prev ? prev.startYear + 1 : new Date().getFullYear());
    const s = {
      id: U.uid(),
      label: data && data.label || (startYear + "/" + String(startYear + 1).slice(-2)),
      startYear,
      leagueId: data && data.leagueId || (prev && prev.leagueId),
      leagueName: data && data.leagueName || (prev && prev.leagueName),
      teams: (data && data.teams) || (prev ? prev.teams.slice() : []),
      status: "active", position: null, boardObjectives: [], note: "", transferBudget: 0,
    };
    (c.seasons || (c.seasons = [])).forEach(x => x.status = "finished");
    c.seasons.push(s);
    c.currentSeasonId = s.id;
    emit();
    return s;
  };

  // ---- collections CRUD ----
  function pushTo(c, key, obj) { (c[key] || (c[key] = [])).push(obj); }
  S.addMatch = (c, m) => { m.id = m.id || U.uid(); pushTo(c, "matches", m); S.afterChange(c); };
  S.updateMatch = (c, id, patch) => { const m = (c.matches || []).find(x => x.id === id); if (m) Object.assign(m, patch); S.afterChange(c); };
  S.deleteMatch = (c, id) => { c.matches = (c.matches || []).filter(x => x.id !== id); S.afterChange(c); };

  // Medias/totales de stats avanzadas de la temporada (solo partidos con m.stats; null si no hay).
  // stats está centrado en tu equipo: { possession:%, shots:[tú,rival], sot, xg, corners, fouls, yellow, red, pens }.
  S.statsAverages = (c, seasonId) => {
    const ms = S.userMatches(c, seasonId).filter(m => m && m.stats);
    if (!ms.length) return null;
    const r1 = (x) => Math.round(x * 10) / 10;
    const out = { count: ms.length };
    const possVals = ms.map(m => m.stats.possession).filter(v => typeof v === "number" && isFinite(v));
    if (possVals.length) { const avg = possVals.reduce((s, x) => s + x, 0) / possVals.length; out.possession = { f: r1(avg), a: r1(100 - avg) }; }
    const aggPair = (key, mode) => {
      const rows = ms.map(m => m.stats[key]).filter(p => Array.isArray(p));
      if (!rows.length) return null;
      const f = rows.reduce((s, p) => s + (Number(p[0]) || 0), 0);
      const a = rows.reduce((s, p) => s + (Number(p[1]) || 0), 0);
      return mode === "avg" ? { f: r1(f / rows.length), a: r1(a / rows.length) } : { f: r1(f), a: r1(a) };
    };
    ["shots", "sot", "xg", "corners", "fouls"].forEach(k => { const v = aggPair(k, "avg"); if (v) out[k] = v; });
    ["yellow", "red", "pens"].forEach(k => { const v = aggPair(k, "sum"); if (v) out[k] = v; });
    return out;
  };

  // Parser CSV minimal: soporta campos entrecomillados ("" escapa comilla), comas
  // internas, y saltos \n/\r\n. Devuelve filas (arrays de celdas), sin filas vacías.
  function parseCSV(text) {
    text = String(text == null ? "" : text).replace(/^﻿/, "");
    const rows = []; let row = [], field = "", inQ = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQ) {
        if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
        else field += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(field); rows.push(row); row = []; field = ""; }
      else field += ch;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.length && r.some(x => String(x).trim() !== ""));
  }
  // Importa partidos desde CSV a una temporada. Añade en bloque (un solo afterChange).
  S.importMatchesCSV = (c, text, seasonId) => {
    const rows = parseCSV(text);
    if (rows.length < 2) return { added: 0, skipped: 0, total: 0, error: "Necesito una cabecera y al menos una fila." };
    const norm = (s) => String(s || "").trim().toLowerCase();
    const header = rows[0].map(norm);
    const idx = (names) => { for (const n of names) { const i = header.indexOf(n); if (i >= 0) return i; } return -1; };
    const col = {
      date: idx(["fecha", "date"]),
      comp: idx(["competicion", "competición", "competition", "comp"]),
      round: idx(["ronda", "round", "jornada"]),
      venue: idx(["condicion", "condición", "venue", "local", "localidad"]),
      rival: idx(["rival", "oponente", "opponent", "contrincante"]),
      gf: idx(["gf", "golesfavor", "goles_favor", "goles a favor", "favor"]),
      ga: idx(["ga", "golescontra", "goles_contra", "goles en contra", "contra"]),
    };
    if (col.rival < 0 || col.gf < 0 || col.ga < 0) return { added: 0, skipped: 0, total: rows.length - 1, error: "Faltan columnas obligatorias: rival, gf, ga." };
    const season = S.getSeason(c, seasonId) || S.currentSeason(c);
    const sid = season ? season.id : seasonId;
    const T = c.clubName, cell = (r, i) => (i >= 0 && i < r.length) ? String(r[i]).trim() : "";
    let added = 0, skipped = 0;
    for (let k = 1; k < rows.length; k++) {
      const r = rows[k];
      const rival = cell(r, col.rival), gfRaw = cell(r, col.gf), gaRaw = cell(r, col.ga);
      const gf = Number(gfRaw), ga = Number(gaRaw);
      if (!rival || rival.toLowerCase() === String(T).toLowerCase() || gfRaw === "" || gaRaw === "" || !Number.isInteger(gf) || !Number.isInteger(ga) || gf < 0 || ga < 0) { skipped++; continue; }
      const v = norm(cell(r, col.venue));
      const isHome = !(v === "visitante" || v === "away" || v === "v" || v === "fuera"); // default local
      pushTo(c, "matches", {
        id: U.uid(), seasonId: sid, competition: cell(r, col.comp) || "Liga", round: cell(r, col.round), date: cell(r, col.date),
        home: isHome ? T : rival, away: isHome ? rival : T, homeScore: isHome ? gf : ga, awayScore: isHome ? ga : gf, events: [],
      });
      added++;
    }
    if (added) S.afterChange(c);
    return { added, skipped, total: rows.length - 1 };
  };

  S.addPlayer = (c, p) => { p.id = p.id || U.uid(); pushTo(c, "players", p); if (p._signing) S.addTransfer(c, p._signing, true); emit(); };
  S.updatePlayer = (c, id, patch) => { const p = c.players.find(x => x.id === id); if (p) Object.assign(p, patch); emit(); };
  S.deletePlayer = (c, id) => { c.players = c.players.filter(x => x.id !== id); emit(); };

  S.addTransfer = (c, t, silent) => { t.id = t.id || U.uid(); pushTo(c, "transfers", t); if (!silent) S.afterChange(c); };
  S.updateTransfer = (c, id, patch) => { const t = (c.transfers || []).find(x => x.id === id); if (t) Object.assign(t, patch); S.afterChange(c); };
  S.deleteTransfer = (c, id) => { c.transfers = (c.transfers || []).filter(x => x.id !== id); S.afterChange(c); };

  S.addTrophy = (c, t) => { t.id = t.id || U.uid(); pushTo(c, "trophies", t); S.afterChange(c); };
  S.deleteTrophy = (c, id) => { c.trophies = c.trophies.filter(x => x.id !== id); S.afterChange(c); };
  S.addAward = (c, a) => { a.id = a.id || U.uid(); pushTo(c, "awards", a); emit(); };
  S.deleteAward = (c, id) => { c.awards = c.awards.filter(x => x.id !== id); emit(); };

  S.addNote = (c, n) => { n.id = n.id || U.uid(); pushTo(c, "notes", n); emit(); };
  S.deleteNote = (c, id) => { c.notes = c.notes.filter(x => x.id !== id); emit(); };

  S.addChallenge = (c, ch) => { ch.id = ch.id || U.uid(); pushTo(c, "challenges", ch); emit(); };
  S.updateChallenge = (c, id, patch) => { const ch = c.challenges.find(x => x.id === id); if (ch) Object.assign(ch, patch); emit(); };
  S.deleteChallenge = (c, id) => { c.challenges = c.challenges.filter(x => x.id !== id); emit(); };

  /* ---------- LESIONES ---------- */
  S.activeInjuries = (c) => (c.injuries || []).filter(i => i.active !== false);
  S.addInjury = (c, data) => {
    (c.injuries || (c.injuries = [])).push({ id: U.uid(), active: true, player: String(data.player || "").trim(), type: String(data.type || "").trim(), matchesOut: Number(data.matchesOut) || 0, createdAt: Date.now() });
    emit();
  };
  S.recoverInjury = (c, id) => { const i = (c.injuries || []).find(x => x.id === id); if (i) { i.active = false; emit(); } };
  S.deleteInjury = (c, id) => { c.injuries = (c.injuries || []).filter(x => x.id !== id); emit(); };

  // called after data that affects achievements/standings changes
  S.afterChange = (c) => { S.evaluateAchievements(c); emit(); };

  /* ---------- DERIVACIONES ---------- */
  S.isUserMatch = (c, m) => m.home === c.clubName || m.away === c.clubName;
  S.userGoals = (c, m) => {
    if (m.home === c.clubName) return { for: Number(m.homeScore), against: Number(m.awayScore) };
    if (m.away === c.clubName) return { for: Number(m.awayScore), against: Number(m.homeScore) };
    return null;
  };
  S.userResult = (c, m) => {
    const g = S.userGoals(c, m); if (!g) return null;
    return g.for > g.against ? "W" : g.for < g.against ? "L" : "D";
  };
  // Un partido está "jugado" si tiene marcador numérico válido en ambos lados.
  // Los partidos PROGRAMADOS (futuros) viven en c.matches sin marcador.
  S.isPlayed = (m) => {
    if (!m) return false;
    const ok = (v) => v !== "" && v != null && isFinite(Number(v));
    return ok(m.homeScore) && ok(m.awayScore);
  };
  S.userMatches = (c, seasonId) => (c.matches || [])
    .filter(m => S.isUserMatch(c, m) && S.isPlayed(m) && (!seasonId || m.seasonId === seasonId));
  S.anyMatch = (c, fn) => S.userMatches(c).some(m => fn(m));
  // Próximos partidos (programados, aún sin marcador), ordenados por fecha
  // ascendente; los que no tienen fecha van al final.
  S.upcomingMatches = (c, seasonId) => (c.matches || [])
    .filter(m => S.isUserMatch(c, m) && !S.isPlayed(m) && (!seasonId || m.seasonId === seasonId))
    .sort((a, b) => (a.date ? new Date(a.date).getTime() : Infinity) - (b.date ? new Date(b.date).getTime() : Infinity));
  S.nextMatch = (c, seasonId) => S.upcomingMatches(c, seasonId)[0] || null;

  S.computeStandings = (c, seasonId) => {
    const league = (c.matches || []).filter(m => m.seasonId === seasonId && /liga/i.test(m.competition || ""));
    const season = S.getSeason(c, seasonId);
    const tbl = {};
    const ensure = (name) => (tbl[name] || (tbl[name] = { team: name, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, pts:0 }));
    (season && season.teams || []).forEach(ensure);
    league.forEach(m => {
      if (m.home == null || m.away == null || !S.isPlayed(m)) return;
      const hs = Number(m.homeScore), as = Number(m.awayScore);
      const H = ensure(m.home), A = ensure(m.away);
      H.pj++; A.pj++; H.gf += hs; H.gc += as; A.gf += as; A.gc += hs;
      if (hs > as) { H.pg++; A.pp++; H.pts += 3; }
      else if (hs < as) { A.pg++; H.pp++; A.pts += 3; }
      else { H.pe++; A.pe++; H.pts++; A.pts++; }
    });
    return Object.values(tbl).sort((a, b) =>
      b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf || a.team.localeCompare(b.team));
  };
  S.userPosition = (c, seasonId) => {
    const t = S.computeStandings(c, seasonId);
    const i = t.findIndex(r => r.team === c.clubName);
    return i >= 0 ? { pos: i + 1, total: t.length } : null;
  };

  S.seasonSummary = (c, season) => {
    const sid = season.id;
    const ms = S.userMatches(c, sid);
    let w=0,d=0,l=0,gf=0,ga=0,cs=0;
    ms.forEach(m => { const g = S.userGoals(c, m); const r = S.userResult(c, m);
      if (!g) return; gf += g.for; ga += g.against; if (g.against === 0) cs++;
      if (r === "W") w++; else if (r === "D") d++; else l++; });
    const league = ms.filter(m => /liga/i.test(m.competition || ""));
    let lw=0,ld=0,ll=0;
    league.forEach(m => { const r = S.userResult(c, m); if (r==="W") lw++; else if (r==="D") ld++; else ll++; });
    const trophies = (c.trophies || []).filter(t => t.seasonId === sid && t.result === "winner");
    const wonLeague = trophies.some(t => /liga/i.test(t.competition || ""));
    const wonCup = trophies.some(t => /copa/i.test(t.competition || ""));
    const wonContinental = trophies.some(t => FC.data.CONTINENTAL.some(cc => (t.competition || "").includes(cc)));
    const played = w+d+l;
    return {
      season, played, w, d, l, gf, ga, gd: gf - ga, cleanSheets: cs,
      points: w*3+d, winPct: played ? Math.round((w/played)*100) : 0,
      leaguePlayed: league.length, leagueLost: ll, leagueWon: lw, leagueDrawn: ld,
      wonLeague, wonCup, wonContinental,
      trophies: trophies.length,
    };
  };
  S.seasonsSome = (c, fn) => (c.seasons || []).some(s => fn(S.seasonSummary(c, s)));

  // Resumen financiero de UNA temporada, derivado siempre de c.transfers (nunca
  // se persiste). Usa el mismo criterio de fee (Number||0) que el motor de retos,
  // así la vista y las reglas comparten una única fuente de verdad.
  S.financeSummary = (c, seasonId) => {
    const s = S.getSeason(c, seasonId) || {};
    const fee = (t) => Number(t.fee) || 0;
    const byDate = (a, b) => new Date(a.date || 0) - new Date(b.date || 0);
    const ts = (c.transfers || []).filter(t => t.seasonId === seasonId);
    const ins = ts.filter(t => t.direction === "in").sort(byDate);
    const outs = ts.filter(t => t.direction === "out").sort(byDate);
    const budget = Number(s.transferBudget) || 0;
    const spent = ins.reduce((a, t) => a + fee(t), 0);
    const earned = outs.reduce((a, t) => a + fee(t), 0);
    const hasBudget = budget > 0;
    const top = (arr) => arr.reduce((best, t) => (!best || fee(t) > fee(best) ? t : best), null);
    return {
      budget, spent, earned, net: earned - spent,
      remaining: hasBudget ? (budget - spent + earned) : null,
      pct: hasBudget ? U.clamp(Math.round((spent - earned) / budget * 100), 0, 100) : 0,
      hasBudget, ins, outs, inCount: ins.length, outCount: outs.length,
      topBuy: top(ins), topSale: top(outs),
    };
  };
  S.setTransferBudget = (c, seasonId, amount) => {
    const s = S.getSeason(c, seasonId);
    if (s) s.transferBudget = Math.max(0, Number(amount) || 0);
    emit();
  };

  // Serie de OVR de un jugador: histórico de temporadas cerradas + punto "actual"
  // (OVR vivo de la temporada en curso). Devuelve [{label, year, ovr, age, current?}].
  S.playerSeries = (c, player) => {
    const hist = ((player && player.ovrHistory) || []).slice()
      .map(h => ({ label: h.label, year: Number(h.year), ovr: Number(h.ovr), age: h.age != null ? Number(h.age) : null }))
      .filter(p => Number.isFinite(p.ovr))
      .sort((a, b) => a.year - b.year);
    const cur = S.currentSeason(c);
    const ovrNow = Number(player && player.ovr);
    if (cur && Number.isFinite(ovrNow) && !hist.some(h => h.year === cur.startYear))
      hist.push({ label: cur.label, year: cur.startYear, ovr: ovrNow, age: player.age != null ? Number(player.age) : null, current: true });
    return hist;
  };

  /* ---------- ACADEMIA JUVENIL ---------- */
  S.generateYouthIntake = (c, n) => {
    n = n || 3;
    const Y = FC.data;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const cur = S.currentSeason(c);
    const made = [];
    for (let i = 0; i < n; i++) {
      const ovr = 50 + Math.floor(Math.random() * 17);                                  // 50-66
      const potential = U.clamp(ovr + 6 + Math.floor(Math.random() * 22), ovr + 5, 93); // > ovr, tope 93
      const tier = potential >= 88 ? "elite" : potential >= 82 ? "high" : potential >= 74 ? "mid" : "low";
      const y = {
        id: U.uid(),
        name: pick(Y.YOUTH_FIRST) + " " + pick(Y.YOUTH_LAST),
        position: pick(Y.POSITIONS),
        age: 15 + Math.floor(Math.random() * 4),                                         // 15-18
        ovr, potential,
        nationality: pick(Y.YOUTH_NATIONS),
        scoutNote: pick(Y.YOUTH_NOTES[tier]),
        year: cur ? cur.startYear : null,
        seasonLabel: cur ? cur.label : "",
        status: "academy",
      };
      (c.youth || (c.youth = [])).push(y);
      made.push(y);
    }
    emit();
    return made;
  };
  S.promoteYouth = (c, id) => {
    const y = (c.youth || []).find(x => x.id === id);
    if (!y || y.status !== "academy") return null;                  // idempotente
    y.status = "promoted";                                          // marca ANTES de crear: cierra la ventana de doble clic (re-render es async/rAF)
    const np = { name: y.name, position: y.position, age: y.age, nationality: y.nationality,
      ovr: y.ovr, potential: y.potential, fromYouth: true, ovrHistory: [], squadRole: "Promesa" };
    S.addPlayer(c, np);                                             // muta np.id
    y.promotedPlayerId = np.id;
    S.afterChange(c);                                              // reevalúa logros de cantera
    return np;
  };
  S.releaseYouth = (c, id) => { c.youth = (c.youth || []).filter(x => x.id !== id); emit(); };

  /* ---------- NARRATIVA / STORYLINE ---------- */
  // Frase resumen de la temporada (texto plano; la vista lo escapa con U.esc).
  S.seasonRecap = (c, season) => {
    if (!season) return "";
    const sum = S.seasonSummary(c, season);
    if (!sum.played) return `${c.clubName} aún no ha jugado en ${season.label}. La historia está por escribir.`;
    const pos = S.userPosition(c, season.id);
    let s = `${c.clubName} disputó ${sum.played} partidos en ${season.label}: ${sum.w}V ${sum.d}E ${sum.l}D, con ${sum.gf} goles a favor y ${sum.ga} en contra`;
    if (pos) s += `. Acabó ${pos.pos}º de ${pos.total} en la liga`;
    if (sum.trophies > 0) s += `, levantando ${sum.trophies} ${sum.trophies === 1 ? "título" : "títulos"}`;
    s += ".";
    if (sum.wonLeague) s += " ¡Campeones de Liga!";
    else if (sum.winPct >= 70) s += " Una temporada soberbia.";
    else if (sum.winPct < 35) s += " Un curso para olvidar.";
    const sa = S.statsAverages(c, season.id);
    if (sa && sa.possession) s += ` Posesión media del ${sa.possession.f}%.`;
    return s;
  };
  // Feed de titulares DERIVADO de los datos (no persiste nada). title/sub salen
  // ya escapados (HTML-safe): phrase() escapa cada variable y los sub escapan las
  // partes de usuario. La frase se elige de forma DETERMINISTA por hash del id.
  S.storyline = (c, seasonId) => {
    const beats = [];
    const season = S.getSeason(c, seasonId) || S.currentSeason(c);
    if (!season) return beats;
    const sid = season.id, T = c.clubName, esc = U.esc;
    const hash = (s) => { let h = 0; s = String(s || ""); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000; return h; };
    const phrase = (kind, seed, vars) => {
      const pool = (FC.data.STORY && FC.data.STORY[kind]) || ["{team}"];
      return pool[hash(seed) % pool.length].replace(/\{(\w+)\}/g, (_, k) => esc(vars[k] != null ? vars[k] : ""));
    };
    const norm = (s) => String(s == null ? "" : s).trim().toLowerCase();
    const push = (b) => beats.push(b);

    push({ phase: 0, date: 0, tone: "neutral", icon: "book",
      title: phrase("opener", "opener:" + sid, { season: season.label }),
      sub: esc(c.leagueName || season.leagueName || "") });

    const ms = S.userMatches(c, sid);
    ms.forEach(m => {
      const g = S.userGoals(c, m); if (!g) return;
      const diff = g.for - g.against;
      const rival = m.home === T ? m.away : m.home;
      const date = m.date ? new Date(m.date).getTime() : 0;
      const scoreline = `${esc(m.home)} ${Number(m.homeScore)}-${Number(m.awayScore)} ${esc(m.away)}`;
      if (diff >= 3) push({ phase: 1, date, tone: "good", icon: "flame",
        title: phrase("bigWin", "bw:" + m.id, { team: T, rival, gf: g.for, ga: g.against }),
        sub: (m.competition ? esc(m.competition) + " · " : "") + scoreline });
      else if (diff <= -3) push({ phase: 1, date, tone: "bad", icon: "flag",
        title: phrase("bigLoss", "bl:" + m.id, { team: T, rival }),
        sub: (m.competition ? esc(m.competition) + " · " : "") + scoreline });
      const tally = {};
      (m.events || []).forEach(ev => { if (ev.type === "goal" && norm(ev.player)) { const k = norm(ev.player); (tally[k] || (tally[k] = { n: 0, name: ev.player })).n++; } });
      Object.keys(tally).forEach(k => { if (tally[k].n >= 3) push({ phase: 1, date, tone: "good", icon: "star",
        title: phrase("hattrick", "ht:" + m.id + ":" + k, { player: tally[k].name }),
        sub: `${tally[k].n} goles · vs ${esc(rival)}` }); });
      // Beat de stats avanzadas (máximo uno por partido). La roja siempre es noticia;
      // el resto solo en resultados "normales" (los extremos ya tienen su propio beat).
      const st = m.stats;
      if (st) {
        const arr = (k) => Array.isArray(st[k]) ? st[k] : null;
        const red = arr("red"), xg = arr("xg"), shots = arr("shots");
        const res = S.userResult(c, m);
        let kind = null, vars = { team: T, rival }, tone = "good", icon = "growth";
        if (red && Number(red[0]) >= 1) { kind = "redcard"; tone = "bad"; icon = "flag"; }
        else if (Math.abs(diff) < 3) {
          if (xg && res === "W" && Number(xg[0]) + 0.5 < Number(xg[1])) { kind = "clinical"; icon = "star"; }
          else if (xg && (res === "L" || res === "D") && Number(xg[0]) >= Number(xg[1]) + 1) { kind = "unlucky"; tone = "neutral"; }
          else if (shots && Number(shots[0]) >= 18 && g.for <= 1) { kind = "wasteful"; tone = "neutral"; vars.shots = Number(shots[0]); }
          else if (typeof st.possession === "number" && st.possession >= 65) { kind = "domination"; vars.poss = Math.round(st.possession); }
        }
        if (kind) push({ phase: 1, date, tone, icon, title: phrase(kind, "stat:" + kind + ":" + m.id, vars), sub: (m.competition ? esc(m.competition) + " · " : "") + scoreline });
      }
    });

    (c.transfers || []).filter(t => t.seasonId === sid).forEach(t => {
      const fee = Number(t.fee) || 0;
      const date = t.date ? new Date(t.date).getTime() : 0;
      const phase = t.date ? 1 : 0;
      if (t.direction === "in") push({ phase, date, tone: "good", icon: "swap",
        title: phrase(fee >= 30000000 ? "signMarquee" : "signIn", "tin:" + t.id, { team: T, player: t.player, fee: U.money(fee) }),
        sub: (t.club ? "de " + esc(t.club) + " · " : "") + (fee > 0 ? U.money(fee) : "agente libre") });
      else push({ phase, date, tone: "neutral", icon: "swap",
        title: phrase("saleOut", "tout:" + t.id, { player: t.player, club: t.club || "otro club" }),
        sub: (t.club ? "al " + esc(t.club) + " · " : "") + (fee > 0 ? U.money(fee) : "sin coste") });
    });

    (c.youth || []).filter(y => y.status === "promoted" && y.year === season.startYear).forEach(y => {
      push({ phase: 0, date: 0, tone: "good", icon: "sprout",
        title: phrase("youth", "y:" + y.id, { player: y.name }),
        sub: "Cantera · " + esc(y.position || "") });
    });

    const ordered = ms.slice().sort((a, b) => (a.date ? new Date(a.date).getTime() : 0) - (b.date ? new Date(b.date).getTime() : 0));
    let run = 0, best = 0;
    ordered.forEach(m => { const r = S.userResult(c, m); if (r === "L") run = 0; else if (r) { run++; best = Math.max(best, run); } });
    if (best >= 5) push({ phase: 8, date: 0, tone: "good", icon: "flame",
      title: phrase("streak", "streak:" + sid, { team: T, n: best }), sub: "Racha de la temporada" });

    (c.trophies || []).filter(t => t.seasonId === sid).forEach(t => {
      const kind = t.result === "winner" ? "trophyWin" : t.result === "promotion" ? "promotion" : "runnerup";
      push({ phase: 9, date: 0, tone: t.result === "runnerup" ? "neutral" : "good", icon: "trophy",
        title: phrase(kind, "tr:" + t.id, { team: T, comp: t.competition }), sub: esc(t.competition || "") });
    });

    beats.sort((a, b) => (a.phase - b.phase) || (a.date - b.date));
    return beats;
  };

  /* ---------- GENERADOR VIRAL (roll aleatorio, NO usar en render) ---------- */
  S.rollChallenge = (opts) => {
    opts = opts || {};
    const D = FC.data;
    const rnd = (a) => a[Math.floor(Math.random() * a.length)];
    const leagues = D.LEAGUES.filter(l => (l.teams || []).length);
    let league = opts.leagueId ? D.LEAGUES.find(l => l.id === opts.leagueId) : null;
    if (!league || !(league.teams || []).length) league = rnd(leagues);
    const club = rnd(league.teams);
    const mode = opts.mode === "rebuild" ? "rebuild" : "random";
    const twists = [];
    const addTwist = (t) => { if (t && !twists.some(x => x.label === t.label)) twists.push({ label: t.label, emoji: t.emoji, ruleId: t.ruleId || null, params: Object.assign({}, t.params || {}) }); };
    if (mode === "rebuild") addTwist(rnd(D.GEN_TWISTS.filter(t => t.ruleId === "youth-only" || t.ruleId === "max-age")));
    const target = mode === "rebuild" ? 2 : 1 + Math.floor(Math.random() * 2);
    let guard = 0;
    while (twists.length < target && guard++ < 30) addTwist(rnd(D.GEN_TWISTS));
    twists.forEach(t => { if (t.ruleId === "one-nationality") t.params.nationality = rnd(D.YOUTH_NATIONS); });
    const objective = mode === "rebuild" ? rnd(D.GEN_OBJECTIVES.filter(o => o.diff >= 3)) : rnd(D.GEN_OBJECTIVES);
    const seasons = (mode === "rebuild" ? 4 : 2) + Math.floor(Math.random() * 5);
    const difficulty = U.clamp(Math.round(objective.diff + twists.length * 0.8), 1, 5);
    return { mode, club, league: league.name, leagueId: league.id, objective, twists, seasons, difficulty };
  };

  /* ---------- SALÓN DE LA FAMA (agregado entre TODAS las carreras) ---------- */
  S.hallOfFame = () => {
    const careers = S.careersList();
    const totals = { careers: careers.length, seasons: 0, matches: 0, trophies: 0 };
    let bestSeason = null, scorer = null, assister = null, apps = null;
    const list = [];
    careers.forEach(c => {
      totals.seasons += (c.seasons || []).length;
      totals.matches += S.userMatches(c).length;
      totals.trophies += (c.trophies || []).length;
      const titles = (c.trophies || []).filter(t => t.result === "winner").length;
      list.push({ id: c.id, clubName: c.clubName, leagueName: c.leagueName, badgeColor: c.badgeColor, seasons: (c.seasons || []).length, trophies: (c.trophies || []).length, titles });
      (c.seasons || []).forEach(s => {
        const sum = S.seasonSummary(c, s);
        if (sum.played && (!bestSeason || sum.points > bestSeason.points))
          bestSeason = { club: c.clubName, label: s.label, points: sum.points, w: sum.w, d: sum.d, l: sum.l, gf: sum.gf, ga: sum.ga };
      });
      Object.values(S.playerAggregates(c, null)).forEach(p => {
        if (p.goals && (!scorer || p.goals > scorer.value)) scorer = { name: p.name, value: p.goals, club: c.clubName };
        if (p.assists && (!assister || p.assists > assister.value)) assister = { name: p.name, value: p.assists, club: c.clubName };
        if (p.apps && (!apps || p.apps > apps.value)) apps = { name: p.name, value: p.apps, club: c.clubName };
      });
    });
    list.sort((a, b) => b.titles - a.titles || b.trophies - a.trophies || b.seasons - a.seasons);
    return { totals, bestSeason, legends: { scorer, assister, apps }, careers: list };
  };

  // player aggregates; seasonId null => all-time (career)
  S.playerAggregates = (c, seasonId) => {
    const map = {};
    const ms = S.userMatches(c, seasonId);
    // Clave canónica por NOMBRE normalizado (no por playerId): un mismo jugador
    // puede aparecer con id en unos eventos y solo por nombre en otros. Si se
    // agrupara por id se partiría en dos entradas, repartiendo sus partidos y
    // goles y bloqueando logros como Centurión (100 partidos) o Bota de oro.
    const norm = (s) => String(s == null ? "" : s).trim().toLowerCase();
    const keyOf = (name, id) => norm(name) || ("id:" + (id || "?"));
    const ensure = (k, name, id) => {
      if (!map[k]) map[k] = { playerId: id || null, name: name || "?", apps:0, goals:0, assists:0, motm:0, yellows:0, reds:0, ratingSum:0, ratingN:0, minutes:0 };
      else if (id && !map[k].playerId) map[k].playerId = id;
      return map[k];
    };
    ms.forEach(m => {
      const seen = {};
      (m.events || []).forEach(ev => {
        const k = keyOf(ev.player, ev.playerId);
        const a = ensure(k, ev.player, ev.playerId);
        if (ev.type === "goal") a.goals++;
        else if (ev.type === "assist") a.assists++;
        else if (ev.type === "yellow") a.yellows++;
        else if (ev.type === "red") a.reds++;
        seen[k] = true;
      });
      (m.ratings || []).forEach(rt => {
        const k = keyOf(rt.name, rt.playerId);
        const a = ensure(k, rt.name, rt.playerId);
        if (rt.rating) { a.ratingSum += Number(rt.rating); a.ratingN++; }
        if (rt.minutes) a.minutes += Number(rt.minutes);
        seen[k] = true;
      });
      if (m.motm) { const k = keyOf(m.motm, m.motmId); ensure(k, m.motm, m.motmId).motm++; seen[k] = true; }
      Object.keys(seen).forEach(k => { if (map[k]) map[k].apps++; });
    });
    Object.values(map).forEach(a => a.avg = a.ratingN ? (a.ratingSum / a.ratingN) : 0);
    return map;
  };
  S.anyPlayerSeason = (c, fn) => (c.seasons || []).some(s => Object.values(S.playerAggregates(c, s.id)).some(fn));
  S.anyPlayerCareer = (c, fn) => Object.values(S.playerAggregates(c, null)).some(fn);

  S.consecutiveLeagueTitles = (c) => {
    const seasons = (c.seasons || []).slice().sort(U.by("startYear"));
    let best=0, cur=0;
    seasons.forEach(s => { if (S.seasonSummary(c, s).wonLeague) { cur++; best = Math.max(best, cur); } else cur = 0; });
    return best;
  };

  S.allTimeRecords = (c) => {
    const agg = S.playerAggregates(c, null);
    const players = Object.values(agg);
    const topScorer = players.slice().sort((a,b) => b.goals - a.goals)[0];
    const topAssister = players.slice().sort((a,b) => b.assists - a.assists)[0];
    const topApps = players.slice().sort((a,b) => b.apps - a.apps)[0];
    let bestWin = null;
    S.userMatches(c).forEach(m => { const g = S.userGoals(c, m); if (!g || g.for <= g.against) return; const diff = g.for - g.against;
      if (!bestWin || diff > bestWin.diff) bestWin = { diff, match: m, g }; });
    // longest unbeaten run
    const ordered = S.userMatches(c).slice().sort((a,b) => new Date(a.date||0) - new Date(b.date||0));
    let run=0, bestRun=0;
    ordered.forEach(m => { const r = S.userResult(c, m); if (r === "L") run = 0; else { run++; bestRun = Math.max(bestRun, run); } });
    return { topScorer, topAssister, topApps, bestWin, bestUnbeaten: bestRun };
  };

  /* ---------- LOGROS ---------- */
  S.evaluateAchievements = (c) => {
    const unlocked = c.achievements || (c.achievements = []);
    const newly = [];
    FC.data.ACHIEVEMENTS.forEach(a => {
      if (unlocked.includes(a.id)) return;
      let ok = false;
      try { ok = !!a.check(c); } catch (e) { ok = false; }
      if (ok) { unlocked.push(a.id); newly.push(a); }
    });
    if (newly.length && FC.app && FC.app.onAchievements) FC.app.onAchievements(newly);
    return newly;
  };

  /* ---------- RETOS / VIOLACIONES ---------- */
  S.ruleViolations = (c, challenge) => {
    const out = [];
    (challenge.rules || []).forEach(r => {
      const def = FC.data.RULES[r.ruleId];
      if (!def || def.manual) return;
      let v = [];
      try { v = def.check(c, r.params || {}) || []; } catch (e) { v = []; }
      v.forEach(x => out.push({ ruleId: r.ruleId, label: def.label, text: x.text }));
    });
    return out;
  };
  S.purityStreak = (c) => {
    // Sin retos activos no hay "pureza" que medir. Con retos activos: si alguno
    // tiene infracciones devuelve 0; si están todos limpios, el total de partidos
    // jugados (todos cuentan como "sin infracciones").
    const active = (c.challenges || []).filter(ch => ch.status === "active");
    if (!active.length) return 0;
    const totalViol = active.reduce((s, ch) => s + S.ruleViolations(c, ch).length, 0);
    if (totalViol > 0) return 0;
    return S.userMatches(c).length;
  };

  FC.store = S;

  /* ============================================================
     VIAJES — motor de la "Cabina en directo".
     Deriva el contexto de un partido FUERA (rival, distancia, modo de
     transporte, historial en esa sede, racha, stake, tier del club,
     héroe vivo, atmósfera estacional) y compone una bitácora narrativa
     determinista por un hash PROPIO (distinto del de storyline, para no
     "rimar" con el feed). Todo derivado; no persiste nada. Escapa con
     U.esc al interpolar nombres (datos de jugador/rival/ciudad).
     ============================================================ */
  const TRIPS = {};
  const _esc = U.esc;
  const _norm = (s) => String(s == null ? "" : s).trim().toLowerCase();
  const hashCab = (s) => { let h = 7; s = String(s || ""); for (let i = 0; i < s.length; i++) h = (h * 37 + s.charCodeAt(i)) % 1000003; return h; };
  const TIER_LABEL = { recien: "Recién llegado", consolidado: "Club consolidado", potencia: "Potencia", gigante: "Gigante europeo" };
  // Selección determinista con ventana anti-repetición (5 viajes), compartida
  // por la bitácora de IDA y la crónica de VUELTA. Sin estado: deriva del
  // ordinal cronológico del viaje. _fillT interpola {slots} y escapa con U.esc.
  const _pickAR = (pool, k, ordinal) => {
    if (!pool || !pool.length) return "";
    const Lp = pool.length;
    const ch = (i, s) => hashCab("car:" + k + ":" + Lp + ":" + i + (s ? ":" + s : "")) % Lp;
    const recent = {}; let nr = 0;
    for (let j = 1; j <= Math.min(5, ordinal); j++) { const x = ch(ordinal - j, 0); if (!recent[x]) { recent[x] = 1; nr++; } }
    let idx = ch(ordinal, 0), s = 1;
    while (recent[idx] && nr < Lp && s <= 8) { idx = ch(ordinal, s); s++; }
    return pool[idx];
  };
  const _fillT = (pool, k, vars, ordinal) => {
    const tpl = _pickAR(pool, k, ordinal);
    if (!tpl) return "";
    return tpl.replace(/\{(\w+)\}/g, (_, key) => _esc(vars[key] != null ? vars[key] : ""));
  };

  TRIPS.cityOf = (teamName) => {
    const row = (FC.data.CITIES || {})[teamName];
    if (row) return { lat: row[0], lon: row[1], city: row[2], approx: false };
    // Fallback determinista para equipos personalizados: pseudo-coordenadas
    // estables dentro de Europa por hash del nombre (ruta plausible, no real).
    const h = hashCab(teamName || "?");
    return { lat: 36 + (h % 1000) / 1000 * 18, lon: -9 + (Math.floor(h / 7) % 1000) / 1000 * 25, city: teamName || "—", approx: true };
  };
  TRIPS.distance = (a, b) => {
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)));
  };
  TRIPS.travelerRank = (km) => km >= 350000 ? "Platino" : km >= 150000 ? "Oro" : km >= 50000 ? "Plata" : "Bronce";

  TRIPS.pickHero = (c, m) => {
    const players = (c.players || []).filter(p => p && p.name);
    if (!players.length) return null;
    const injured = {}; S.activeInjuries(c).forEach(i => injured[_norm(i.player)] = 1);
    const sold = {}; (c.transfers || []).filter(t => t.direction === "out").forEach(t => sold[_norm(t.player)] = 1);
    const avail = players.filter(p => !injured[_norm(p.name)] && !sold[_norm(p.name)]);
    const pool = avail.length ? avail : players;
    const agg = S.playerAggregates(c, m.seasonId);
    const num = (x) => Number(x) || 0;
    const cands = [];
    const scorer = pool.map(p => ({ p, g: (agg[_norm(p.name)] || {}).goals || num(p.goals) })).sort((a, b) => b.g - a.g)[0];
    if (scorer && scorer.g > 0) cands.push({ role: "goleador", p: scorer.p, goals: scorer.g });
    const youth = pool.filter(p => p.fromYouth).sort((a, b) => num(b.ovr) - num(a.ovr))[0];
    if (youth) cands.push({ role: "canterano", p: youth });
    const vet = pool.slice().sort((a, b) => num(b.age) - num(a.age))[0];
    if (vet && num(vet.age) >= 32) cands.push({ role: "veterano", p: vet });
    const star = pool.slice().sort((a, b) => num(b.ovr) - num(a.ovr))[0];
    if (star) cands.push({ role: "estrella", p: star });
    if (!cands.length) cands.push({ role: "estrella", p: pool[0] });
    const pick = cands[hashCab("hero:" + m.id) % cands.length];
    return { name: pick.p.name, pos: pick.p.position || "", role: pick.role, goals: pick.goals || num(pick.p.goals), ovr: pick.p.ovr, age: pick.p.age };
  };

  TRIPS.atmosphere = (m, dest) => {
    const dt = m.date ? new Date(m.date) : null;
    const month = (dt && !isNaN(dt)) ? dt.getMonth() + 1 : null;
    const night = (hashCab("night:" + m.id) % 100) < 55;
    let kind = "normal";
    if (month != null) {
      const winter = (month === 12 || month <= 2), summer = (month >= 6 && month <= 8);
      if (winter && dest.lat >= 43) kind = "nieve";
      else if (winter) kind = "frio";
      else if (summer && dest.lat <= 40) kind = "calor";
      else if ((hashCab("rain:" + m.id) % 100) < 22) kind = "lluvia";
    }
    return { kind, night, month };
  };

  // Contexto del viaje: null si el partido no es del usuario; {isAway:false}
  // si es en casa (no hay viaje); objeto completo si es fuera.
  TRIPS.context = (c, m) => {
    if (!c || !m) return null;
    const club = c.clubName;
    if (m.home !== club && m.away !== club) return null;
    if (m.away !== club) return { isAway: false };
    const rival = m.home;
    const origin = TRIPS.cityOf(club), dest = TRIPS.cityOf(rival);
    const dist = Math.round(TRIPS.distance(origin, dest));
    const continental = (FC.data.CONTINENTAL || []).some(x => (m.competition || "").includes(x));
    const mode = (continental || dist >= 300) ? "avion" : "bus";
    const played = S.userMatches(c).filter(x => x.id !== m.id);
    const atVenue = played.filter(x => x.home === rival && x.away === club).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    let v = 0, e = 0, d = 0, last = null;
    atVenue.forEach(x => { const r = S.userResult(c, x); if (r === "W") v++; else if (r === "D") e++; else d++; last = x; });
    const nthVisit = atVenue.length + 1;
    let h2hType = "primera";
    if (atVenue.length) h2hType = (v === 0 && d >= 2) ? "bestia" : (v >= 2 && d === 0) ? "fortin" : "equilibrado";
    const before = played.filter(x => !m.date || new Date(x.date || 0) <= new Date(m.date)).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    let unbeaten = 0; for (let i = 0; i < before.length; i++) { if (S.userResult(c, before[i]) === "L") break; unbeaten++; }
    let stake = "media";
    if (continental) stake = /final/i.test(m.round || "") ? "final_euro" : "continental";
    else if (/copa/i.test(m.competition || "")) stake = "copa";
    else { const p = S.userPosition(c, m.seasonId); if (p) stake = p.pos === 1 ? "liderato" : p.pos <= 4 ? "europa_zona" : p.pos >= p.total - 2 ? "descenso" : "media"; }
    // Rivalidad all-time (ambas sedes) con nivel de intensidad acumulado.
    const allVs = played.filter(x => x.home === rival || x.away === rival);
    let av = 0, ae = 0, al = 0; allVs.forEach(x => { const r = S.userResult(c, x); if (r === "W") av++; else if (r === "D") ae++; else al++; });
    const total = allVs.length;
    const level = total >= 6 ? ((av - al >= 3) ? "victima" : (al - av >= 3) ? "verdugo" : "clasico") : total >= 1 ? "conocido" : "nuevo";
    const won = (c.trophies || []).filter(t => t.result === "winner").length, seasons = (c.seasons || []).length;
    const tier = (won >= 8 || seasons >= 8) ? "gigante" : (won >= 3 || seasons >= 4) ? "potencia" : (won >= 1 || seasons >= 2) ? "consolidado" : "recien";
    let miles = 0; const seenRiv = {}; let passport = 0;
    S.userMatches(c).forEach(x => { if (x.away === club && x.home) { miles += TRIPS.distance(origin, TRIPS.cityOf(x.home)) * 2; if (!seenRiv[x.home]) { seenRiv[x.home] = 1; passport++; } } });
    const awayAll = (c.matches || []).filter(x => x.away === club && x.home).slice().sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    const tripNo = Math.max(1, awayAll.findIndex(x => x.id === m.id) + 1);
    const hero = TRIPS.pickHero(c, m);
    if (hero) hero.apps = (S.playerAggregates(c, null)[_norm(hero.name)] || {}).apps || 0;
    return {
      isAway: true, club, rival, origin, dest, dist, mode, continental, approx: origin.approx || dest.approx,
      h2h: { v, e, d, nthVisit, last, type: h2hType }, all: { v: av, e: ae, l: al, total, level },
      streak: { unbeaten }, stake, tier, tierLabel: TIER_LABEL[tier], seasons, passport, tripNo,
      hero, atmos: TRIPS.atmosphere(m, dest), miles: Math.round(miles), m,
    };
  };

  // Bitácora: lista ordenada de beats {phase, t (0..1), tone, icon, title, sub}.
  // Tono cinematográfico: hasta 2 beats memorables + stake + atmósfera + ~25% raro.
  TRIPS.beats = (ctx, c) => {
    if (!ctx || !ctx.isAway) return [];
    const m = ctx.m, T = ctx.club, rival = ctx.rival, P = FC.data.TRIP || {};
    // Ventana anti-repetición: el ordinal cronológico del viaje entre los
    // partidos fuera descorrelaciona viajes consecutivos; re-roll determinista
    // si la plantilla coincide con la de los últimos viajes. Sin estado.
    const ordinal = (ctx.tripNo || 1) - 1; // tripNo (1-based, calculado en context) = ordinal cronológico + 1
    const pickAR = (pool, k) => _pickAR(pool, k, ordinal);
    const fill = (pool, k, vars) => _fillT(pool, k, vars, ordinal);
    const lastScore = ctx.h2h.last ? (Number(ctx.h2h.last.homeScore) + "-" + Number(ctx.h2h.last.awayScore)) : "";
    const tierWord = { recien: "humilde expedición", consolidado: "expedición", potencia: "comitiva", gigante: "caravana de un gigante" }[ctx.tier] || "expedición";
    const vars = {
      team: T, rival, city: ctx.dest.city, ocity: ctx.origin.city, comp: m.competition || "", round: m.round || "", tierWord,
      n: ctx.h2h.nthVisit, v: ctx.h2h.v, e: ctx.h2h.e, d: ctx.h2h.d, streak: ctx.streak.unbeaten,
      total: ctx.all.total, av: ctx.all.v, al: ctx.all.l, trip: ctx.tripNo,
      player: ctx.hero ? ctx.hero.name : "", pos: ctx.hero ? ctx.hero.pos : "", goals: ctx.hero ? ctx.hero.goals : "", apps: ctx.hero ? ctx.hero.apps : "", score: lastScore,
    };
    const beats = [];
    const amb = (P.ambient && P.ambient[ctx.mode]) || {};
    beats.push({ phase: "salida", t: 0.07, tone: "neutral", icon: ctx.mode === "avion" ? "plane" : "bus",
      title: fill(ctx.mode === "avion" ? amb.despegue : amb.salida, "dep", vars), sub: _esc(ctx.origin.city + " → " + ctx.dest.city) });

    const mem = [];
    // Beat de rival: rivalidad all-time si es intensa; si no, head-to-head de la sede.
    // Memoria de carrera: anti-repetición por rival. Los pools h2h/rivalry usan
    // un ordinal específico del rival para no repetir textos entre visitas distintas
    // al mismo campo a lo largo de varias temporadas.
    if (ctx.all.total >= 6) { // total>=6 garantiza level victima/verdugo/clasico
      const lv = ctx.all.level;
      mem.push({ prio: lv === "verdugo" ? 5 : 4, tone: lv === "verdugo" ? "bad" : "good", icon: lv === "verdugo" ? "flame" : "flag",
        key: "riv:" + lv, vars, sub: ctx.all.total + " cruces · " + ctx.all.v + "V " + ctx.all.e + "E " + ctx.all.l + "D",
        pool: (P.rivalry || {})[lv], rivalOrd: ctx.all.total });
    } else {
      const t = ctx.h2h.type;
      mem.push({ prio: t === "bestia" ? 5 : t === "fortin" ? 4 : t === "primera" ? 2 : 3, tone: t === "bestia" ? "bad" : "good",
        icon: t === "bestia" ? "flame" : "flag", key: "h2h", vars,
        sub: t === "primera" ? "Primera visita" : (ctx.h2h.nthVisit + "ª visita · " + ctx.h2h.v + "V " + ctx.h2h.e + "E " + ctx.h2h.d + "D aquí"),
        pool: (P.h2h || {})[t], rivalOrd: ctx.h2h.nthVisit - 1 });
    }
    // Beat de protagonista: arco biográfico si hay hito de partidos; si no, foco normal.
    if (ctx.hero) {
      const r = ctx.hero.role, ap = ctx.hero.apps || 0;
      const arc = ap >= 100 ? "leyenda" : ap >= 50 ? "veterano" : (r === "canterano" && ctx.seasons >= 3) ? "cantera" : null;
      if (arc) mem.push({ prio: arc === "leyenda" ? 5 : 4, tone: "good", icon: "medal", key: "arc:" + arc, vars,
        sub: ap ? (ap + " partidos con el club") : "Hecho en casa", pool: (P.arc || {})[arc] });
      else mem.push({ prio: (r === "canterano" || r === "goleador") ? 4 : 3, tone: "good", icon: "star", key: "hero", vars,
        sub: (r === "goleador" && ctx.hero.goals) ? (ctx.hero.goals + " goles esta temporada") : _esc(ctx.hero.pos || ""),
        pool: (P.hero || {})[r] || (P.hero || {}).estrella });
    }
    const exOut = (c.transfers || []).filter(x => x.direction === "out" && _norm(x.club) === _norm(rival));
    if (exOut.length) mem.push({ prio: 4, tone: "neutral", icon: "swap", key: "reu",
      vars: Object.assign({}, vars, { player: exOut[0].player }), sub: "Viejo conocido", pool: P.reunion });

    mem.sort((a, b) => b.prio - a.prio);
    mem.slice(0, 2).forEach((b, i) => beats.push({ phase: i === 0 ? "crucero" : "aproximacion", t: i === 0 ? 0.4 : 0.66,
      tone: b.tone, icon: b.icon,
      title: _fillT(b.pool, b.key, b.vars, b.rivalOrd != null ? b.rivalOrd : ordinal),
      sub: b.sub }));

    // Memoria de carrera: beat de hito de rivalidad al cruzar 5, 10, 15, 20 o 30
    // encuentros all-time con el mismo rival. Solo uno por viaje, nunca solapa stake.
    const encN = ctx.all.total + 1; // este partido es el Nº encN vs este rival
    const MEM = (P.memoria || {}).hito_rival;
    const HITOS = [5, 10, 15, 20, 30];
    if (MEM && HITOS.includes(encN)) {
      const hPool = MEM[String(encN)];
      if (hPool && hPool.length) beats.push({ phase: "crucero", t: 0.48, tone: "good", icon: "medal",
        title: _fillT(hPool, "hm:" + encN, Object.assign({ n: encN }, vars), ordinal),
        sub: encN + "º encuentro entre ambos clubes" });
    }

    const sp = (P.stake || {})[ctx.stake];
    if (sp) beats.push({ phase: "crucero", t: 0.52, tone: ctx.stake === "descenso" ? "bad" : "neutral", icon: "target",
      title: fill(sp, "stake", vars), sub: ctx.tier !== "recien" ? ctx.tierLabel : "" });

    const ap = (P.atmosfera || {})[ctx.atmos.kind] || (P.atmosfera || {}).normal;
    if (ap) beats.push({ phase: "aproximacion", t: 0.78, tone: "neutral", icon: ctx.atmos.kind === "nieve" ? "snow" : "cloud",
      title: fill(ap, "atm", vars), sub: ctx.atmos.night ? "Partido nocturno" : "" });

    // Hito de carrera racionado: viaje nº 25 y cada 50 (≈0-3 en una carrera larga).
    const milestoneHere = (ctx.tripNo === 25 || (ctx.tripNo >= 50 && ctx.tripNo % 50 === 0));
    if (milestoneHere && P.milestone) beats.push({ phase: "crucero", t: 0.46, tone: "good", icon: "medal",
      title: fill(P.milestone, "mile", vars), sub: "Hito de carrera" });

    // Dosificación adaptativa: un evento cada ~5 viajes, nunca dos seguidos ni
    // sequías largas (derivado del ordinal). Emergentes condicionados: noche
    // polar al norte / posible último viaje del veterano.
    const baseOffset = hashCab("rb:" + T) % 5;
    if (!milestoneHere && ((ordinal + baseOffset) % 5 === 0)) {
      const mo = ctx.atmos.month, winter = mo && (mo === 12 || mo <= 2);
      let pool = P.rare, tone = "neutral";
      if (winter && ctx.atmos.night && ctx.dest.lat >= 52 && P.emergent && P.emergent.norte) pool = P.emergent.norte;
      else if (ctx.hero && Number(ctx.hero.age) >= 35 && P.emergent && P.emergent.veterano) { pool = P.emergent.veterano; tone = "good"; }
      if (pool && pool.length) beats.push({ phase: "crucero", t: 0.6, tone: tone, icon: "flame", title: fill(pool, "rfill", vars), sub: "Imprevisto del viaje" });
    }

    beats.push({ phase: "aterrizaje", t: 0.99, tone: "good", icon: "flag", title: fill(P.arrival, "arr", vars), sub: _esc("vs " + rival) });
    beats.sort((a, b) => a.t - b.t);
    return beats.filter(b => b.title); // descarta beats sin texto (pool ausente)
  };

  // Crónica del VIAJE DE VUELTA: cierra el arco (ida → partido → vuelta)
  // reaccionando al resultado YA jugado. [] si el partido aún no tiene marcador.
  // Buckets por resultado y margen: win_big/win/draw/loss/loss_big.
  TRIPS.returnBeats = (ctx, c) => {
    if (!ctx || !ctx.isAway) return [];
    const m = ctx.m, T = ctx.club, rival = ctx.rival, V = (FC.data.TRIP || {}).vuelta || {};
    const res = S.userResult(c, m);
    if (!res) return [];
    const g = S.userGoals(c, m) || { for: 0, against: 0 };
    const gf = Number(g.for) || 0, ga = Number(g.against) || 0, margin = gf - ga;
    const bucket = res === "W" ? (margin >= 3 ? "win_big" : "win") : res === "D" ? "draw" : (margin <= -3 ? "loss_big" : "loss");
    const ord = (ctx.tripNo || 1) - 1;
    const tone = res === "W" ? "good" : res === "D" ? "neutral" : "bad";
    const vars = { team: T, rival, city: ctx.dest.city, home: ctx.origin.city, score: gf + "-" + ga, gf, ga };
    const beats = [];
    const ap = (V.apertura || {})[bucket];
    if (ap) beats.push({ phase: "salida", t: 0.08, tone, icon: ctx.mode === "avion" ? "plane" : "bus",
      title: _fillT(ap, "vap", vars, ord), sub: _esc(ctx.dest.city + " → " + ctx.origin.city) });
    const nu = (V.nucleo || {})[bucket];
    if (nu) beats.push({ phase: "crucero", t: 0.42, tone, icon: res === "W" ? "flame" : res === "D" ? "target" : "cloud",
      title: _fillT(nu, "vnu", vars, ord), sub: "" });
    // Beat situacional: una sola "lectura del partido", elegida por prioridad
    // narrativa. Usa el historial PREVIO (ctx) y el resultado de hoy.
    let espKey = "";
    if (res === "W" && (ctx.stake === "continental" || ctx.stake === "final_euro")) espKey = "gesta_grande";
    else if (res === "W" && ctx.h2h.type === "bestia") espKey = "bestia_caida";
    else if (res === "W" && ctx.all.level === "verdugo") espKey = "verdugo_caido";
    else if (res === "W" && ctx.stake === "descenso") espKey = "salvacion";
    else if (res === "L" && ctx.stake === "liderato") espKey = "liderato_tocado";
    else if (res === "W" && ga === 0) espKey = "porteria_cero";
    const esp = espKey ? (V.especial || {})[espKey] : null;
    if (esp) beats.push({ phase: "crucero", t: 0.62, tone: res === "W" ? "good" : "bad", icon: res === "W" ? "medal" : "flame",
      title: _fillT(esp, "vesp:" + espKey, vars, ord), sub: "Lectura del partido" });
    const ci = (V.cierre || {})[res === "W" ? "win" : res === "D" ? "draw" : "loss"];
    if (ci) beats.push({ phase: "aterrizaje", t: 0.96, tone, icon: "home",
      title: _fillT(ci, "vci", vars, ord), sub: _esc("De vuelta en " + ctx.origin.city) });
    beats.sort((a, b) => a.t - b.t);
    return beats.filter(b => b.title);
  };

  // Crónica del partido: genera 3 frases narrativas para cualquier partido jugado
  // (casa o fuera). Devuelve array de strings, o [] si faltan datos.
  TRIPS.matchCronica = (c, m) => {
    if (!c || !m || !S.isPlayed(m)) return [];
    const res = S.userResult(c, m);
    if (!res) return [];
    const g = S.userGoals(c, m) || { for: 0, against: 0 };
    const gf = Number(g.for) || 0, ga = Number(g.against) || 0, margin = gf - ga;
    const bucket = res === "W" ? (margin >= 3 ? "win_big" : "win") : res === "D" ? "draw" : (margin <= -3 ? "loss_big" : "loss");
    const team = c.clubName, rival = m.home === team ? m.away : m.home;
    const vars = { team, rival, score: gf + "-" + ga, gf, ga, comp: m.competition || "" };
    const allPlayed = S.userMatches(c).slice().sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    const ord = Math.max(0, allPlayed.findIndex(x => x.id === m.id));
    const Cr = FC.data.CRONICA || {};
    const ap = _fillT((Cr.apertura || {})[bucket], "cra:" + bucket, vars, ord);
    const scorers = (m.events || []).filter(e => e.type === "goal");
    vars.player = scorers.length ? _esc(scorers[0].player || "") : "";
    const moKey = vars.player ? "con_goleador" : (ga === 0 && res === "W" ? "porteria_cero" : "sin_goleador");
    const mo = _fillT((Cr.momento || {})[moKey], "crm:" + moKey, vars, ord);
    const ci = _fillT((Cr.cierre || {})[res === "W" ? "win" : res === "D" ? "draw" : "loss"], "crc", vars, ord);
    return [ap, mo, ci].filter(Boolean);
  };

  FC.trips = TRIPS;

  /* ============================================================
     ROUTER (hash)
     ============================================================ */
  const R = { routes: {}, current: null };
  R.register = (name, fn) => { R.routes[name] = fn; };
  R.go = (name) => { if (location.hash !== "#" + name) location.hash = "#" + name; else R.render(); };
  R.render = () => {
    const name = (location.hash || "#dashboard").slice(1).split("?")[0] || "dashboard";
    R.current = name;
    const fn = R.routes[name] || R.routes["dashboard"];
    if (fn) fn();
  };
  window.addEventListener("hashchange", R.render);
  FC.router = R;
})();
