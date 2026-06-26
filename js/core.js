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
  // Normaliza un nombre de equipo (minúsculas, sin acentos ni símbolos).
  U._normTeam = (s) => String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]/g," ").replace(/\s+/g," ").trim();
  // Busca una clave de equipo en un mapa: exacto → normalizado → contiene (≥5 chars).
  U._findTeam = (map, name) => {
    if (!map) return null;
    if (map[name] != null) return map[name];
    const n = U._normTeam(name);
    for (const k in map) { if (U._normTeam(k) === n) return map[k]; }
    for (const k in map) { const kn = U._normTeam(k); if (kn.length >= 5 && (n.includes(kn) || kn.includes(n))) return map[k]; }
    return null;
  };
  U._tcFind = (name) => U._findTeam(FC.data && FC.data.TEAM_COLORS, name);
  // Devuelve "#ffffff" o "#111111" según la luminancia percibida del color de fondo.
  U.textOn = (bg) => {
    const m = String(bg).match(/^#([0-9a-f]{3,6})$/i);
    if (!m) return "#ffffff";
    const h = m[1].length === 3 ? m[1].split("").map(c=>c+c).join("") : m[1];
    return 0.2126*(parseInt(h.slice(0,2),16)/255)+0.7152*(parseInt(h.slice(2,4),16)/255)+0.0722*(parseInt(h.slice(4,6),16)/255) < 0.5 ? "#ffffff" : "#111111";
  };
  // {bg, text} para un equipo. badgeOverride respeta el color guardado por el usuario.
  U.teamColors = (name, badgeOverride) => {
    const tc = U._tcFind(name) || {};
    const bg = U.safeColor(badgeOverride, U.safeColor(tc.primary, U.colorFor(name)));
    return {bg, text: U.textOn(bg)};
  };
  // Genera un escudo SVG con forma de escudo, colores oficiales del equipo e iniciales.
  U.teamCrest = (clubName, size) => {
    size = size || 36;
    const tc = U._tcFind(clubName) || {};
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
    shield: P('<path d="M12 3 5 6v5c0 4.3 2.9 7.7 7 9 4.1-1.3 7-4.7 7-9V6l-7-3Z"/>'),
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
    if (!c.setPieces || typeof c.setPieces !== "object" || Array.isArray(c.setPieces)) c.setPieces = {};
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
      isNational: !!data.isNational,
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

  // Agrega las stats avanzadas de un conjunto de partidos (solo los que tienen m.stats; null si ninguno).
  // stats está centrado en tu equipo: { possession:%, shots:[tú,rival], sot, xg, corners, fouls, yellow, red, pens }.
  function statsAggregate(ms) {
    ms = (ms || []).filter(m => m && m.stats);
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
  }
  // Medias/totales de stats avanzadas de la temporada (null si no hay partidos con datos).
  S.statsAverages = (c, seasonId) => statsAggregate(S.userMatches(c, seasonId));

  /* ---------- ANÁLISIS DE RENDIMIENTO (xPts / suerte) ----------
     Puntos esperados a partir del xG de cada lado (modelo de Poisson):
     revela si tus resultados van por encima/por debajo de tu juego real.
     Todo derivado de match.stats.xg ([tú,rival]); funciones puras. */
  function _poisson(k, lambda) {
    if (lambda <= 0) return k === 0 ? 1 : 0;
    let p = Math.exp(-lambda);
    for (let i = 1; i <= k; i++) p *= lambda / i;
    return p;
  }
  // Puntos esperados de un partido según el xG de ambos lados.
  S.matchXpts = (xgF, xgA) => {
    const lf = Math.max(0, Number(xgF) || 0), la = Math.max(0, Number(xgA) || 0);
    const MAX = 10, pf = [], pa = [];
    for (let i = 0; i <= MAX; i++) { pf[i] = _poisson(i, lf); pa[i] = _poisson(i, la); }
    let pW = 0, pD = 0, pL = 0;
    for (let i = 0; i <= MAX; i++) for (let j = 0; j <= MAX; j++) {
      const p = pf[i] * pa[j];
      if (i > j) pW += p; else if (i === j) pD += p; else pL += p;
    }
    return { xpts: pW * 3 + pD, pW, pD, pL };
  };
  // Veredicto de "suerte" de un partido: compara resultado real con el xG.
  function _luckVerdict(res, gf, ga, xf, xa) {
    const xd = xf - xa;
    if (res === "W") {
      if (xd <= -1) return { label: "Victoria con fortuna", tone: "lucky" };
      if (xd >= 0.3) return { label: "Victoria merecida", tone: "ok" };
      return { label: "Victoria ajustada", tone: "ok" };
    }
    if (res === "D") {
      if (xd >= 1) return { label: "2 puntos perdidos", tone: "unlucky" };
      if (xd <= -1) return { label: "Empate de oro", tone: "lucky" };
      return { label: "Empate justo", tone: "neutral" };
    }
    if (xd >= 1) return { label: "Mereciste más", tone: "unlucky" };
    if (xd <= -0.3) return { label: "Derrota merecida", tone: "neutral" };
    return { label: "Derrota ajustada", tone: "neutral" };
  }
  // Análisis de suerte de la temporada (o vitalicio si seasonId es null).
  // null si ningún partido registra xG. PDO = (%definición + %paradas)·1000.
  S.luckSummary = (c, seasonId) => {
    const ms = S.userMatches(c, seasonId)
      .filter(m => m.stats && Array.isArray(m.stats.xg))
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    if (!ms.length) return null;
    const r1 = (x) => Math.round(x * 10) / 10;
    let actualPts = 0, xpts = 0, gf = 0, ga = 0, xgF = 0, xgA = 0, sotF = 0, sotA = 0;
    const series = [], matches = [];
    ms.forEach(m => {
      const g = S.userGoals(c, m), res = S.userResult(c, m);
      const xf = Math.max(0, Number(m.stats.xg[0]) || 0), xa = Math.max(0, Number(m.stats.xg[1]) || 0);
      const pts = res === "W" ? 3 : res === "D" ? 1 : 0;
      const xp = S.matchXpts(xf, xa).xpts;
      actualPts += pts; xpts += xp;
      gf += g.for; ga += g.against; xgF += xf; xgA += xa;
      if (Array.isArray(m.stats.sot)) { sotF += Number(m.stats.sot[0]) || 0; sotA += Number(m.stats.sot[1]) || 0; }
      series.push({ actual: actualPts, xpts: r1(xpts) });
      matches.push({ id: m.id, date: m.date, rival: S.opponentOf(c, m), res, gf: g.for, ga: g.against, xgF: r1(xf), xgA: r1(xa), xpts: xp, verdict: _luckVerdict(res, g.for, g.against, xf, xa) });
    });
    const shootPct = sotF ? gf / sotF : 0;
    const savePct = sotA ? (sotA - ga) / sotA : 0;
    return {
      count: ms.length, actualPts, xpts: r1(xpts), diff: r1(actualPts - xpts),
      gf, ga, xgF: r1(xgF), xgA: r1(xgA),
      finishing: xgF ? gf / xgF : null, defending: xgA ? ga / xgA : null,
      pdo: (sotF && sotA) ? Math.round((shootPct + savePct) * 1000) : null,
      series, matches: matches.reverse(),
    };
  };

  /* ---------- PERFIL DE EDAD DE LA PLANTILLA (pirámide + recambio) ----------
     Curva de edad real por demarcación: extremos/banda pican antes y caen
     pronto; centrales y porteros aguantan más. Solo usa age + position. */
  const AGE_PEAK = { "Portería": [28, 34], "Defensa": [27, 32], "Medio": [25, 30], "Banda": [24, 28], "Ataque": [25, 30], default: [25, 30] };
  S.squadAgeProfile = (c) => {
    const players = (c.players || []).filter(p => Number(p.age) > 0);
    if (!players.length) return null;
    const peakOf = (p) => AGE_PEAK[FC.data.POS_GROUP[p.position] || "default"] || AGE_PEAK.default;
    const phaseOf = (p) => { const pk = peakOf(p), a = Number(p.age); return a < pk[0] ? "joven" : a > pk[1] ? "declive" : "pico"; };
    const fmt = (n) => (Math.round(n * 10) / 10).toString().replace(".", ",");
    const BANDS = [[0, 20, "≤20"], [21, 23, "21-23"], [24, 26, "24-26"], [27, 29, "27-29"], [30, 32, "30-32"], [33, 99, "33+"]];
    const hist = BANDS.map(b => ({ label: b[2], joven: 0, pico: 0, declive: 0, total: 0 }));
    const phases = { joven: 0, pico: 0, declive: 0 };
    let sum = 0;
    players.forEach(p => {
      const a = Number(p.age); sum += a;
      const ph = phaseOf(p); phases[ph]++;
      const ba = Math.floor(a);
      const bi = BANDS.findIndex(b => ba >= b[0] && ba <= b[1]);
      if (bi >= 0) { hist[bi][ph]++; hist[bi].total++; }
    });
    const avg = sum / players.length;
    const byGroup = ["Portería", "Defensa", "Medio", "Banda", "Ataque"].map(g => {
      const ps = players.filter(p => (FC.data.POS_GROUP[p.position] || "") === g);
      if (!ps.length) return null;
      const gsum = ps.reduce((s, p) => s + Number(p.age), 0);
      const decline = ps.filter(p => phaseOf(p) === "declive").length;
      const young = ps.filter(p => phaseOf(p) === "joven").length;
      return { group: g, count: ps.length, avg: gsum / ps.length, decline, young, peak: ps.length - decline - young };
    }).filter(Boolean);
    const xi = players.slice().sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0)).slice(0, 11);
    const xiAvg = xi.length ? xi.reduce((s, p) => s + Number(p.age), 0) / xi.length : null;
    const proj2 = players.filter(p => { const pk = peakOf(p), a = Number(p.age); return a <= pk[1] && a + 2 > pk[1]; }).length;
    // Avisos de entrenador (priorizados).
    const insights = [];
    const refAge = xiAvg != null ? xiAvg : avg;
    if (refAge >= 30) insights.push({ tone: "danger", text: "Tu once tipo es muy veterano (media " + fmt(refAge) + " años): el recambio es urgente." });
    else if (refAge >= 28.5) insights.push({ tone: "warn", text: "Tu once tipo envejece (media " + fmt(refAge) + " años): planifica el recambio." });
    byGroup.forEach(g => {
      if (g.count >= 3 && g.decline >= Math.ceil(g.count / 2)) insights.push({ tone: "warn", text: g.group + ": " + g.decline + " de " + g.count + " en fase de declive — prioriza fichar o promocionar." });
      else if (g.count >= 3 && g.young === 0 && g.avg >= 29) insights.push({ tone: "warn", text: g.group + ": sin relevo joven y edad media " + fmt(g.avg) + " — busca futuro." });
    });
    if (phases.joven === 0 && players.length >= 10) insights.push({ tone: "warn", text: "No tienes jugadores jóvenes en desarrollo: la plantilla no se está renovando." });
    if (proj2 >= 3) insights.push({ tone: "warn", text: "En 2 temporadas, " + proj2 + (proj2 > 1 ? " jugadores actuales entrarán" : " jugador actual entrará") + " en declive." });
    if (!insights.length) insights.push(avg <= 23.5
      ? { tone: "ok", text: "Plantilla muy joven (media " + fmt(avg) + "): poca veteranía pero enorme margen de crecimiento." }
      : { tone: "ok", text: "Pirámide de edad equilibrada (media " + fmt(avg) + "): base joven con un núcleo en su pico." });
    return { count: players.length, avg, xiAvg, hist, phases, byGroup, insights, proj2 };
  };

  /* ---------- JERARQUÍA DEL VESTUARIO (líderes/núcleo/periferia) ----------
     Influencia derivada (estilo FM): ovr + rol + apps(antigüedad proxy) +
     veteranía + nota media + arraigo de cantera. Todo normalizado a la plantilla. */
  S.squadHierarchy = (c) => {
    const players = (c.players || []).filter(p => p && (p.name || p.id));
    if (players.length < 2) return null;
    const agg = S.playerAggregates(c, null);
    const aggOf = (p) => agg[(p.name || "").trim().toLowerCase()] || {};
    const maxApps = Math.max(1, ...players.map(p => Number(aggOf(p).apps) || 0));
    const maxOvr = Math.max(1, ...players.map(p => Number(p.ovr) || 0));
    const roleW = { "Estrella": 1, "Titular": 0.7, "Rotación": 0.4, "Promesa": 0.2 };
    const ageRamp = (a) => { a = Number(a); if (!a) return 0; if (a < 21) return 0.1; if (a < 25) return 0.4; if (a < 30) return 0.8; if (a < 34) return 1; return 0.9; };
    const scored = players.map(p => {
      const a = aggOf(p);
      const apps = Number(a.apps) || 0;
      const ovrN = (Number(p.ovr) || 0) / maxOvr;
      const roleN = roleW[p.squadRole] != null ? roleW[p.squadRole] : 0.4;
      const appsN = apps / maxApps;
      const ageN = ageRamp(p.age);
      const ratingN = (a.ratingN > 0) ? Math.max(0, Math.min(1, (a.avg - 5) / 5)) : null;
      let score = ovrN * 0.30 + roleN * 0.22 + appsN * 0.18 + ageN * 0.15, wsum = 0.85;
      if (ratingN != null) { score += ratingN * 0.10; wsum += 0.10; }
      score = score / wsum;
      if (p.fromYouth) score = Math.min(1, score + 0.05);
      return { id: p.id, name: p.name || "?", position: p.position || "", age: Number(p.age) || null, ovr: Number(p.ovr) || null, squadRole: p.squadRole || "", fromYouth: !!p.fromYouth, badge: p.badge, apps, avg: a.ratingN > 0 ? a.avg : null, score };
    }).sort((x, y) => y.score - x.score || (y.ovr || 0) - (x.ovr || 0) || y.apps - x.apps || String(x.name).localeCompare(String(y.name)));
    const n = scored.length;
    scored.forEach((p, i) => {
      p.tier = i === 0 ? "Capitán"
        : i < Math.max(2, Math.round(n * 0.15)) ? "Líder"
        : i < Math.max(3, Math.round(n * 0.45)) ? "Referente"
        : i < Math.round(n * 0.8) ? "Rotación" : "Periferia";
    });
    const captain = scored[0];
    const leaders = scored.filter(p => p.tier === "Capitán" || p.tier === "Líder");
    const youngLeader = leaders.some(p => p.age && p.age <= 23);
    const insights = [];
    if (captain) insights.push({ tone: "ok", text: captain.name + " es tu jugador más influyente: el líder natural del vestuario." });
    if (captain && captain.squadRole && captain.squadRole !== "Estrella") insights.push({ tone: "neutral", text: "Plantéate darle galones de capitán a " + captain.name + " (rol actual: " + captain.squadRole + ")." });
    if (!youngLeader) insights.push({ tone: "warn", text: "No hay liderazgo joven (≤23 años): el vestuario se apoya solo en veteranos." });
    return { count: n, captain, leaders, youngLeader, players: scored, insights };
  };

  /* ---------- ÍNDICE DE ADAPTACIÓN AL CLUB ----------
     Mide cuánto se ha "asentado" cada jugador: apps all-time como proxy de
     tiempo en el club, bonificado por cantera y rol. Sin fecha de fichaje en
     el modelo, las apps son el mejor indicador disponible. */
  S.playerAdaptation = (c) => {
    const players = (c.players || []).filter(p => p && (p.name || p.id));
    if (!players.length) return null;
    const agg = S.playerAggregates(c, null);
    const results = players.map(p => {
      const key  = (p.name || "").trim().toLowerCase();
      const apps = (agg[key] && agg[key].apps) || 0;
      let score  = Math.min(apps / 20, 1) * 70;
      if (!!p.fromYouth) score += 20;
      if (p.squadRole === "Estrella") score += 10;
      else if (p.squadRole === "Titular") score += 5;
      score = Math.round(Math.min(100, score));
      const level = score >= 80 ? "Arraigado" : score >= 50 ? "Integrado" : score >= 25 ? "Adaptándose" : "Recién llegado";
      const tone  = score >= 80 ? "ok" : score >= 50 ? "neutral" : score >= 25 ? "warn" : "danger";
      return { id: p.id, name: p.name, apps, score, level, tone, fromYouth: !!p.fromYouth, position: p.position, age: p.age, ovr: p.ovr, badge: p.badge };
    }).sort((a, b) => b.score - a.score);
    const low = results.filter(p => p.score < 25);
    const high = results.filter(p => p.score >= 80);
    const insights = [];
    if (low.length)
      insights.push({ tone: "warn", text: low.length + " jugador" + (low.length > 1 ? "es" : "") + " aún no " + (low.length > 1 ? "están" : "está") + " integrado" + (low.length > 1 ? "s" : "") + ": " + low.slice(0, 3).map(p => p.name).join(", ") + "." });
    if (high.length >= 5)
      insights.push({ tone: "ok", text: "Núcleo sólido: " + high.length + " jugadores con alta adaptación al club." });
    if (!insights.length)
      insights.push({ tone: "neutral", text: "Plantilla en proceso de consolidación. Dale tiempo para que los fichajes se asienten." });
    return { players: results, insights };
  };

  /* ---------- CARGA Y ROTACIONES (gestión de minutos/fatiga) ----------
     Derivado de m.ratings[].minutes (opt-in) + m.date. Mide reparto de
     minutos, sobre-dependencia, carga reciente y congestión de calendario.
     El denominador es la suma REAL de minutos registrados (honesto con datos
     parciales); expone la cobertura. null/empty-state si no hay minutos. */
  S.loadReport = (c, seasonId) => {
    const ms = S.userMatches(c, seasonId).slice().sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    const matchesWithMin = ms.filter(m => (m.ratings || []).some(r => Number(r.minutes) > 0));
    if (!matchesWithMin.length) return { hasMinutes: false, totalMatches: ms.length };
    const agg = S.playerAggregates(c, seasonId);
    const squadNames = new Set((c.players || []).map(p => (p.name || "").trim().toLowerCase()));
    const totalMin = Object.values(agg).reduce((s, a) => s + (Number(a.minutes) || 0), 0);
    const recentMs = matchesWithMin.slice(-3);
    const recentMin = {};
    recentMs.forEach(m => (m.ratings || []).forEach(r => { const k = (r.name || "").trim().toLowerCase(); const mn = Number(r.minutes) || 0; if (mn > 0) recentMin[k] = (recentMin[k] || 0) + mn; }));
    const players = Object.values(agg).filter(a => (Number(a.minutes) || 0) > 0).map(a => ({
      name: a.name, minutes: Number(a.minutes) || 0, apps: a.apps,
      share: totalMin ? Math.round((Number(a.minutes) || 0) / totalMin * 100) : 0,
      recent: recentMin[(a.name || "").trim().toLowerCase()] || 0,
      inSquad: squadNames.has((a.name || "").trim().toLowerCase()),
    })).sort((x, y) => y.minutes - x.minutes);
    // Congestión pasada: parejas consecutivas con <4 días (solo fechas válidas).
    const dated = ms.filter(m => isFinite(new Date(m.date).getTime())).sort((a, b) => new Date(a.date) - new Date(b.date));
    const congestion = [];
    for (let i = 1; i < dated.length; i++) { const days = Math.round((new Date(dated[i].date) - new Date(dated[i - 1].date)) / 86400000); if (days >= 0 && days < 4) congestion.push({ a: dated[i - 1], b: dated[i], days }); }
    // Congestión futura (accionable): próximos partidos con poco descanso.
    const up = S.upcomingMatches(c, seasonId).filter(m => isFinite(new Date(m.date).getTime()));
    const upcomingTight = [];
    let prev = dated[dated.length - 1];
    up.forEach(m => { if (prev) { const days = Math.round((new Date(m.date) - new Date(prev.date)) / 86400000); if (days >= 0 && days < 4) upcomingTight.push({ a: prev, b: m, days }); } prev = m; });
    const insights = [];
    const top = players.find(p => p.inSquad) || players[0];
    if (top && top.inSquad && top.share >= 92 && players.length > 1) insights.push({ tone: "warn", text: top.name + " ha jugado el " + top.share + "% de los minutos registrados: riesgo de sobrecarga, plantéate rotarlo." });
    players.filter(p => p.recent >= 260 && p.inSquad).slice(0, 2).forEach(p => insights.push({ tone: "warn", text: p.name + " acumula " + p.recent + " min en los últimos 3 partidos: vigila su fatiga." }));
    if (upcomingTight.length) insights.push({ tone: "warn", text: "Calendario apretado a la vista: " + upcomingTight.length + " partido(s) con menos de 4 días de descanso — prepara rotaciones." });
    else if (congestion.length) insights.push({ tone: "neutral", text: congestion.length + " tramo(s) de calendario apretado esta temporada (<4 días entre partidos)." });
    if (!insights.length) insights.push({ tone: "ok", text: "Reparto de minutos saludable, sin sobrecargas evidentes." });
    return { hasMinutes: true, totalMatches: ms.length, matchesWithMin: matchesWithMin.length, totalMin, players, congestion, upcomingTight, insights };
  };

  /* ---------- CONTRATOS Y MASA SALARIAL (planificación) ----------
     Vencimientos por año (olas/Bosman) + masa salarial (sueldo opcional por
     jugador). Sin ratio sobre ingresos (no hay dato de facturación del club). */
  S.contractReport = (c) => {
    const players = (c.players || []).filter(p => p && (p.name || p.id));
    const startYear = (S.currentSeason(c) || {}).startYear || new Date().getFullYear();
    const yearOf = (p) => { const y = parseInt(p.contractEnd, 10); return (Number.isFinite(y) && y >= 1990 && y <= 2100) ? y : null; };
    const wageOf = (p) => Number(p.wage) || 0;
    const withContract = players.filter(p => yearOf(p) != null);
    const byYear = {};
    withContract.forEach(p => { const y = yearOf(p); (byYear[y] || (byYear[y] = [])).push(p); });
    const timeline = Object.keys(byYear).map(Number).sort((a, b) => a - b)
      .map(y => ({ year: y, count: byYear[y].length, players: byYear[y].map(p => p.name) }));
    const expiringSoon = withContract.filter(p => yearOf(p) <= startYear + 1)
      .sort((a, b) => yearOf(a) - yearOf(b))
      .map(p => ({ name: p.name, year: yearOf(p), position: p.position, ovr: p.ovr, wage: wageOf(p) }));
    const withWage = players.filter(p => wageOf(p) > 0);
    const wageBill = withWage.reduce((s, p) => s + wageOf(p), 0);
    const topEarners = withWage.slice().sort((a, b) => wageOf(b) - wageOf(a)).slice(0, 8)
      .map(p => ({ name: p.name, wage: wageOf(p), position: p.position, ovr: p.ovr }));
    const topConcentration = (wageBill && topEarners.length) ? Math.round(topEarners.slice(0, 3).reduce((s, p) => s + p.wage, 0) / wageBill * 100) : 0;
    const insights = [];
    const nextYear = startYear + 1;
    const expThis = withContract.filter(p => yearOf(p) === startYear).length;
    const expNext = withContract.filter(p => yearOf(p) === nextYear).length;
    if (expThis) insights.push({ tone: "danger", text: expThis + " jugador(es) acaban contrato este año: renueva o traspasa antes de perderlos gratis." });
    if (expNext >= 3) insights.push({ tone: "warn", text: "Ola de vencimientos: " + expNext + " contratos expiran en " + nextYear + " (riesgo Bosman)." });
    if (withWage.length && topConcentration >= 50) insights.push({ tone: "warn", text: "El " + topConcentration + "% de tu masa salarial se concentra en solo 3 jugadores." });
    if (players.length - withContract.length) insights.push({ tone: "neutral", text: (players.length - withContract.length) + " jugador(es) sin fin de contrato registrado." });
    return {
      hasContracts: withContract.length > 0, hasWages: withWage.length > 0,
      startYear, timeline, expiringSoon,
      wageBill, avgWage: withWage.length ? wageBill / withWage.length : 0,
      topEarners, topConcentration, noWage: players.length - withWage.length, insights,
    };
  };

  /* ---------- FAMILIARIDAD TÁCTICA (cohesión por sistema) ----------
     La cohesión sube al repetir formación y baja al cambiar/rotar de sistema.
     Derivado de m.formation + fechas; índice 0-100 que satura ~6 partidos. */
  S.formationFamiliarity = (c, seasonId) => {
    const ms = S.userMatches(c, seasonId).filter(m => m.formation)
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    if (ms.length < 2) return null;
    const map = {};
    ms.forEach(m => {
      const o = map[m.formation] || (map[m.formation] = { name: m.formation, uses: 0, w: 0, d: 0, l: 0, _res: [] });
      o.uses++; const r = S.userResult(c, m);
      if (r === "W") o.w++; else if (r === "D") o.d++; else o.l++;
      o._res.push({ date: m.date, res: r });
    });
    const last = ms[ms.length - 1].formation;
    let streak = 0;
    for (let i = ms.length - 1; i >= 0; i--) { if (ms[i].formation === last) streak++; else break; }
    const recent = ms.slice(-6).map(m => m.formation);
    const list = Object.values(map).map(o => {
      const recentUses = recent.filter(f => f === o.name).length;
      let fam = Math.round(Math.min(6, o.uses) / 6 * 55 + recentUses / 6 * 45);
      if (o.name === last) fam = Math.max(fam, Math.min(100, 45 + streak * 11));
      o.familiarity = Math.min(100, fam);
      o.ppg = o.uses ? (o.w * 3 + o.d) / o.uses : 0;
      o.form = o._res.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5).map(x => x.res);
      delete o._res;
      return o;
    }).sort((a, b) => b.uses - a.uses || b.familiarity - a.familiarity);
    const main = list[0];
    const cur = list.find(o => o.name === last);
    const insights = [];
    if (main && main.uses >= 4 && main.familiarity >= 70) insights.push({ tone: "ok", text: "Tu equipo domina el " + main.name + " (" + main.uses + " partidos): automatismos asentados." });
    if (list.length >= 4 && ms.length <= list.length * 2) insights.push({ tone: "warn", text: "Cambias mucho de sistema (" + list.length + " formaciones distintas): a tu equipo le cuesta asentar automatismos." });
    if (cur && cur.uses <= 1) insights.push({ tone: "warn", text: "Estrenas el " + last + ": familiaridad baja, dale continuidad para que cuaje." });
    if (!insights.length && main) insights.push({ tone: "neutral", text: "Tu sistema de referencia es el " + main.name + "." });
    return { current: last, streak, total: ms.length, formations: list, insights };
  };

  /* ---------- PERFIL GOLEADOR ----------
     Analiza el patrón de goles del usuario: home/away, goles por resultado,
     consistencia anotadora, rachas y sequías, y desglose por competición.
     Devuelve null si hay menos de 3 partidos con marcador. */
  S.scoringProfile = (c, seasonId) => {
    const ms = S.userMatches(c, seasonId)
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    if (ms.length < 3) return null;
    const r1 = (n) => Math.round(n * 10) / 10;
    const home = { pj: 0, gf: 0, ga: 0 };
    const away = { pj: 0, gf: 0, ga: 0 };
    const byResult = { W: { n: 0, gf: 0 }, D: { n: 0, gf: 0 }, L: { n: 0, gf: 0 } };
    const byComp = {};
    let scoredCount = 0, cleanSheetCount = 0;
    let curStreak = 0, bestStreak = 0, curDrought = 0, longestDrought = 0;
    ms.forEach(m => {
      const g = S.userGoals(c, m);
      if (!g) return;
      const gf = g.for, ga = g.against;
      const res = S.userResult(c, m);
      const isHome = m.home === c.clubName;
      const comp = m.competition || "Otros";
      if (isHome) { home.pj++; home.gf += gf; home.ga += ga; }
      else { away.pj++; away.gf += gf; away.ga += ga; }
      if (res && byResult[res]) { byResult[res].n++; byResult[res].gf += gf; }
      if (gf > 0) scoredCount++;
      if (ga === 0) cleanSheetCount++;
      if (gf > 0) { curStreak++; if (curStreak > bestStreak) bestStreak = curStreak; curDrought = 0; }
      else { curDrought++; if (curDrought > longestDrought) longestDrought = curDrought; curStreak = 0; }
      if (!byComp[comp]) byComp[comp] = { pj: 0, gf: 0, ga: 0 };
      byComp[comp].pj++; byComp[comp].gf += gf; byComp[comp].ga += ga;
    });
    const count = ms.length;
    const homeAvg = home.pj ? home.gf / home.pj : 0;
    const awayAvg = away.pj ? away.gf / away.pj : 0;
    const insights = [];
    if (home.pj >= 3 && away.pj >= 3) {
      if (homeAvg >= awayAvg + 0.5) insights.push({ tone: "ok", text: "Marcas más en casa (" + r1(homeAvg) + " goles/p) que fuera (" + r1(awayAvg) + "). Fuerte fortín local." });
      else if (awayAvg >= homeAvg + 0.5) insights.push({ tone: "ok", text: "Marcas más fuera (" + r1(awayAvg) + " goles/p) que en casa (" + r1(homeAvg) + "). Equipo que sale a proponer." });
    }
    if (bestStreak >= 5) insights.push({ tone: "ok", text: "Racha de " + bestStreak + " partidos consecutivos marcando: gran fluidez ofensiva." });
    if (curDrought >= 3) insights.push({ tone: "warn", text: "Llevas " + curDrought + " partidos sin marcar. El ataque necesita reactivarse." });
    else if (curDrought >= 2) insights.push({ tone: "warn", text: "Llevas " + curDrought + " partidos sin anotar. Vigila el ataque." });
    if (curStreak >= 4) insights.push({ tone: "ok", text: "Llevas " + curStreak + " partidos seguidos marcando. Buen momento goleador." });
    if (longestDrought >= 4) insights.push({ tone: "warn", text: "Tu peor sequía fue de " + longestDrought + " partidos sin marcar. El ataque tiene altibajos." });
    if (!insights.length) insights.push({ tone: "neutral", text: "Perfil goleador equilibrado para el volumen de partidos registrados." });
    return {
      home: { ...home, avgGf: r1(home.pj ? home.gf / home.pj : 0), avgGa: r1(home.pj ? home.ga / home.pj : 0) },
      away: { ...away, avgGf: r1(away.pj ? away.gf / away.pj : 0), avgGa: r1(away.pj ? away.ga / away.pj : 0) },
      byResult: {
        W: { ...byResult.W, avgGf: r1(byResult.W.n ? byResult.W.gf / byResult.W.n : 0) },
        D: { ...byResult.D, avgGf: r1(byResult.D.n ? byResult.D.gf / byResult.D.n : 0) },
        L: { ...byResult.L, avgGf: r1(byResult.L.n ? byResult.L.gf / byResult.L.n : 0) },
      },
      scoredPct: Math.round(scoredCount / count * 100),
      cleanSheetPct: Math.round(cleanSheetCount / count * 100),
      currentScoringStreak: curStreak,
      bestScoringStreak: bestStreak,
      currentDrought: curDrought,
      longestDrought,
      byComp: Object.fromEntries(Object.entries(byComp).map(([k, v]) => [k, { ...v, avgGf: r1(v.pj ? v.gf / v.pj : 0) }])),
      count,
      insights
    };
  };

  /* ---------- MENTORÍAS (planificador veterano → promesa) ----------
     Empareja un veterano influyente con una promesa con margen de mejora,
     preferentemente de la misma línea. Es una GUÍA de plantilla: el juego no
     la aplica, pero ayuda a planificar quién forma a tus jóvenes. */
  S.mentoringSuggestions = (c) => {
    const players = (c.players || []).filter(p => p && (p.name || p.id) && Number(p.age));
    if (players.length < 2) return null;
    const grp = (p) => FC.data.POS_GROUP[p.position] || "Otros";
    const mentors = players.filter(p => (Number(p.age) >= 28 || p.squadRole === "Estrella") && (Number(p.ovr) || 0) >= 78)
      .sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0));
    const mentees = players.filter(p => (Number(p.age) <= 21 || p.fromYouth) && ((Number(p.potential) || 0) - (Number(p.ovr) || 0) >= 3))
      .sort((a, b) => ((Number(b.potential) || 0) - (Number(b.ovr) || 0)) - ((Number(a.potential) || 0) - (Number(a.ovr) || 0)));
    if (!mentors.length || !mentees.length) {
      return { pairs: [], insights: [{ tone: "neutral", text: !mentors.length ? "Sin veteranos de referencia (28+ años o estrellas con OVR alto) para ejercer de mentores." : "Sin jóvenes con margen de mejora para tutelar ahora mismo." }] };
    }
    const used = {}, pairs = [];
    mentees.slice(0, 8).forEach(mentee => {
      const line = grp(mentee);
      let mentor = mentors.find(m => grp(m) === line && (used[m.id] || 0) < 2 && m.id !== mentee.id)
        || mentors.find(m => (used[m.id] || 0) < 2 && m.id !== mentee.id);
      if (!mentor) return;
      used[mentor.id] = (used[mentor.id] || 0) + 1;
      const sameLine = grp(mentor) === line;
      const gap = (Number(mentee.potential) || 0) - (Number(mentee.ovr) || 0);
      pairs.push({ mentor, mentee, sameLine, gap, reason: (sameLine ? "Misma línea (" + line + "). " : "") + "Margen de +" + gap + " hasta su potencial." });
    });
    return { pairs, insights: [{ tone: "neutral", text: "Las mentorías son una guía de planificación: el juego no las aplica, pero te orientan sobre quién debe formar a tus promesas." }] };
  };

  /* ---------- RED DE INFLUENCIA ----------
     Agrupa la plantilla en "órbitas": cada figura clave (Capitán/Líder/Referente)
     con los jugadores que caen en su esfera de influencia (misma línea y joven,
     de cantera, o emparejado como mentee suyo). Devuelve null si <3 jugadores. */
  S.influenceNetwork = (c) => {
    const players = (c.players || []).filter(p => p && (p.name || p.id));
    if (players.length < 3) return null;
    const h = S.squadHierarchy(c);
    if (!h || !h.players.length) return null;
    const grp = (p) => FC.data.POS_GROUP[p.position] || "Otros";
    const mentoring = S.mentoringSuggestions(c);
    const menteeOf = {};
    if (mentoring) mentoring.pairs.forEach(pr => { menteeOf[pr.mentee.id] = pr.mentor.id; });
    const figures = h.players.filter(p => p.tier === "Capitán" || p.tier === "Líder" || p.tier === "Referente");
    if (!figures.length) return null;
    const figureIds = new Set(figures.map(f => f.id));
    const allInOrbit = new Set();
    const groups = figures.map(ldr => {
      const ldrGrp = grp(ldr);
      const candidates = h.players.filter(p => {
        if (p.id === ldr.id || figureIds.has(p.id) || allInOrbit.has(p.id)) return false;
        const isMentee   = menteeOf[p.id] === ldr.id;
        const sameLine   = grp(p) === ldrGrp && Number(p.age) <= 23;
        const isYouthAny = !!p.fromYouth && Number(p.age) <= 24;
        return isMentee || sameLine || isYouthAny;
      });
      const orbit = candidates.map(p => {
        allInOrbit.add(p.id);
        const isMentee   = menteeOf[p.id] === ldr.id;
        const sameLine   = grp(p) === ldrGrp && Number(p.age) <= 23;
        const isYouthAny = !!p.fromYouth && Number(p.age) <= 24;
        const reasons = [];
        if (isMentee)              reasons.push("mentoría");
        if (sameLine)              reasons.push("línea");
        if (isYouthAny && !sameLine) reasons.push("cantera");
        return { id: p.id, name: p.name, tier: p.tier, age: p.age, ovr: p.ovr, badge: p.badge, reasons };
      });
      return { leader: ldr, orbit };
    }).filter(g => g.orbit.length > 0);
    if (!groups.length) return null;
    return { groups };
  };

  /* ---------- ESPECIALISTAS A BALÓN PARADO ----------
     Sugiere lanzadores por stats derivadas (sin atributos de remate). Las
     elecciones del usuario se persisten en c.setPieces (objeto, por id). */
  S.setPieceSuggestions = (c) => {
    const agg = S.playerAggregates(c, null);
    const players = (c.players || []).filter(p => p && (p.name || p.id));
    const byName = (nm) => agg[(nm || "").trim().toLowerCase()] || {};
    const attackers = players.filter(p => ["Banda", "Ataque", "Medio"].includes(FC.data.POS_GROUP[p.position] || ""));
    const topBy = (pool, key) => pool.slice().sort((a, b) => (byName(b.name)[key] || 0) - (byName(a.name)[key] || 0) || (Number(b.ovr) || 0) - (Number(a.ovr) || 0))[0] || null;
    const scorer = topBy(players, "goals");
    const assister = topBy(players, "assists");
    const bestAtt = attackers.slice().sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0))[0] || null;
    const pick = (p) => p ? { id: p.id, name: p.name } : null;
    return {
      penalty: pick(scorer && (byName(scorer.name).goals ? scorer : bestAtt) || bestAtt),
      freekick: pick(bestAtt || scorer),
      corner: pick(assister && byName(assister.name).assists ? assister : bestAtt),
    };
  };
  S.setSetPieceTaker = (c, role, playerId) => {
    if (!c.setPieces || typeof c.setPieces !== "object") c.setPieces = {};
    if (playerId) c.setPieces[role] = playerId; else delete c.setPieces[role];
    emit();
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

  // silent: persiste sin emit() para que la vista refresque solo su sección
  // (evita el scrollTo(0,0) del re-render global al generar/borrar un suceso).
  S.addIncident = (c, inc, silent) => { inc.id = inc.id || U.uid(); pushTo(c, "incidents", inc); if (silent) save(); else emit(); };
  S.deleteIncident = (c, id, silent) => { c.incidents = (c.incidents || []).filter(x => x.id !== id); if (silent) save(); else emit(); };

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

  /* ---------- RIVALES (historial cara a cara + dossier táctico) ----------
     Todo derivado de c.matches (nunca se persiste). El "rival" de un partido
     tuyo es el equipo que no eres tú. El historial es VITALICIO (todas las
     temporadas) salvo que se indique. */
  S.opponentOf = (c, m) => m.home === c.clubName ? m.away : m.away === c.clubName ? m.home : null;
  // Partidos jugados contra un rival, del más reciente al más antiguo.
  S.rivalMatches = (c, rival) => S.userMatches(c)
    .filter(m => S.opponentOf(c, m) === rival)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const _enrichRec = (o) => { o.pts = o.w * 3 + o.d; o.gd = o.gf - o.ga; o.ppg = o.pj ? o.pts / o.pj : 0; o.winPct = o.pj ? Math.round(o.w / o.pj * 100) : 0; return o; };
  const _blankRec = () => ({ pj: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 });

  // Lista de todos los rivales con su balance global, ordenada por nº de duelos.
  S.rivalsList = (c) => {
    const map = {};
    S.userMatches(c).forEach(m => {
      const rival = S.opponentOf(c, m); if (!rival) return;
      const g = S.userGoals(c, m), res = S.userResult(c, m);
      const o = map[rival] || (map[rival] = Object.assign({ rival, played: 0, _res: [] }, _blankRec()));
      o.pj++; o.played++; o.gf += g.for; o.ga += g.against;
      if (res === "W") o.w++; else if (res === "D") o.d++; else o.l++;
      o._res.push({ date: m.date, res });
    });
    return Object.values(map).map(o => {
      _enrichRec(o);
      o.form = o._res.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5).map(x => x.res);
      delete o._res;
      return o;
    }).sort((a, b) => b.played - a.played || b.ppg - a.ppg || a.rival.localeCompare(b.rival));
  };

  // Historial completo contra un rival: balance global + local/visitante + por
  // competición + por formación + racha + mayor goleada a favor/contra + stats.
  S.rivalHistory = (c, rival) => {
    const ms = S.rivalMatches(c, rival);
    if (!ms.length) return null;
    const all = _blankRec(), home = _blankRec(), away = _blankRec();
    const byComp = {}, formations = {};
    let cleanSheets = 0, failedToScore = 0, biggestWin = null, biggestLoss = null;
    ms.forEach(m => {
      const g = S.userGoals(c, m), res = S.userResult(c, m), diff = g.for - g.against;
      const venue = m.home === c.clubName ? home : away;
      [all, venue].forEach(o => { o.pj++; o.gf += g.for; o.ga += g.against; if (res === "W") o.w++; else if (res === "D") o.d++; else o.l++; });
      if (g.against === 0) cleanSheets++;
      if (g.for === 0) failedToScore++;
      const comp = m.competition || "Otros";
      const cb = byComp[comp] || (byComp[comp] = Object.assign({ comp }, _blankRec()));
      cb.pj++; cb.gf += g.for; cb.ga += g.against; if (res === "W") cb.w++; else if (res === "D") cb.d++; else cb.l++;
      if (m.formation) { const f = formations[m.formation] || (formations[m.formation] = Object.assign({ name: m.formation }, _blankRec())); f.pj++; f.gf += g.for; f.ga += g.against; if (res === "W") f.w++; else if (res === "D") f.d++; else f.l++; }
      if (res === "W" && (!biggestWin || diff > biggestWin._d)) biggestWin = { _d: diff, m };
      if (res === "L" && (!biggestLoss || diff < biggestLoss._d)) biggestLoss = { _d: diff, m };
    });
    [all, home, away].forEach(_enrichRec);
    Object.values(byComp).forEach(_enrichRec);
    Object.values(formations).forEach(_enrichRec);
    // Racha desde el partido más reciente (ms viene del más nuevo al más viejo).
    const resOf = (m) => S.userResult(c, m);
    let sameType = resOf(ms[0]), sameN = 0, unbeaten = 0, winless = 0;
    for (const m of ms) { if (resOf(m) === sameType) sameN++; else break; }
    for (const m of ms) { const r = resOf(m); if (r === "W" || r === "D") unbeaten++; else break; }
    for (const m of ms) { const r = resOf(m); if (r === "L" || r === "D") winless++; else break; }
    return {
      rival, matches: ms, all, home, away, byComp, formations,
      form: ms.slice(0, 5).map(resOf),
      streak: { type: sameType, n: sameN, unbeaten, winless },
      biggestWin: biggestWin && biggestWin.m, biggestLoss: biggestLoss && biggestLoss.m,
      cleanSheets, failedToScore, stats: statsAggregate(ms),
    };
  };

  // Dossier táctico tipo entrenador: lee el historial y produce un veredicto +
  // observaciones con recomendaciones concretas para adaptar el plan de partido.
  S.rivalDossier = (c, rival) => {
    const h = S.rivalHistory(c, rival);
    if (!h) return null;
    const a = h.all, st = h.stats;
    const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace(".", ",");
    const gfpg = a.pj ? a.gf / a.pj : 0, gapg = a.pj ? a.ga / a.pj : 0;
    const insights = [];
    const add = (tone, icon, title, text) => insights.push({ tone, icon, title, text });

    // Veredicto general.
    let verdict;
    if (a.pj >= 2 && a.ppg >= 2.0) verdict = { tone: "good", title: "Rival propicio", text: `Dominas el cara a cara: ${a.w}V-${a.d}E-${a.l}D y ${f1(a.ppg)} pts por partido. Sal a por ellos con tu plan habitual.` };
    else if (a.pj >= 2 && a.ppg <= 1.0) verdict = { tone: "bad", title: "Bestia negra", text: `Se te atraganta: solo ${f1(a.ppg)} pts por partido (${a.w}V-${a.d}E-${a.l}D). Toca plantear el duelo con cabeza.` };
    else if (a.pj >= 2) verdict = { tone: "neutral", title: "Duelo igualado", text: `Enfrentamiento parejo: ${a.w}V-${a.d}E-${a.l}D, ${f1(a.ppg)} pts/partido. Los detalles deciden.` };
    else verdict = { tone: "neutral", title: "Primer análisis", text: `Solo os habéis enfrentado ${a.pj} vez. El análisis táctico se afinará con más duelos.` };

    // Localía.
    if (h.home.pj >= 2 && h.away.pj >= 2) {
      if (h.home.ppg - h.away.ppg >= 0.7) add("bad", "plane", "Sufres a domicilio", `En su campo promedias ${f1(h.away.ppg)} pts (${h.away.w}V-${h.away.d}E-${h.away.l}D) frente a ${f1(h.home.ppg)} en casa. Plantea la visita con prudencia: no encajar primero y atacar las transiciones.`);
      else if (h.away.ppg - h.home.ppg >= 0.7) add("good", "plane", "Mejor en su campo", `Curiosamente rindes más fuera (${f1(h.away.ppg)} pts) que en casa (${f1(h.home.ppg)}). Cuando ellos te visiten, no te confíes.`);
    }
    // Defensa.
    if (a.pj >= 3 && gapg >= 2) add("bad", "flame", "Defensa vulnerable", `Les encajas ${f1(gapg)} goles por partido. Refuerza el centro con un pivote extra y vigila las espaldas de tus laterales.`);
    if (a.pj >= 3 && h.cleanSheets / a.pj >= 0.5) add("good", "check", "Muro defensivo", `Dejas la portería a cero en ${h.cleanSheets} de ${a.pj} duelos. Tu bloque les anula: mantén la solidez.`);
    // Ataque.
    if (a.pj >= 3 && gfpg < 1) add("bad", "target", "Te cuesta crear", `Solo marcas ${f1(gfpg)} goles por partido${h.failedToScore ? ` y te quedaste a cero en ${h.failedToScore}` : ""}. Busca amplitud con extremos y aprieta el balón parado.`);
    if (a.pj >= 3 && gfpg >= 2.2) add("good", "flame", "Les haces daño", `Promedias ${f1(gfpg)} goles por partido. Tu ataque les funciona: mantén la verticalidad y la presión alta.`);
    // Racha reciente.
    if (h.streak.unbeaten >= 3) add("good", "growth", "Racha a favor", `Llevas ${h.streak.unbeaten} partidos sin perderles. Llegas con la moral alta.`);
    else if (h.streak.winless >= 3) add("bad", "growth", "Racha en contra", `Acumulas ${h.streak.winless} duelos sin ganarles. Cambia algo del plan que venías usando.`);
    // Stats avanzadas (si hay datos registrados en esos partidos).
    if (st) {
      if (st.possession) {
        if (st.possession.f < 45) add("neutral", "ball", "Te quitan el balón", `Solo tienes el ${f1(st.possession.f)}% de posesión de media. Asume un bloque medio y sal rápido al contraataque en vez de forzar la posesión.`);
        else if (st.possession.f > 58) add("neutral", "ball", "Dominas el balón", `Acaparas el ${f1(st.possession.f)}% de posesión. Cuidado con dejar espacios a la espalda cuando subas líneas.`);
      }
      if (st.shots && st.shots.a - st.shots.f >= 3) add("bad", "target", "Te rematan más", `Reciben ${f1(st.shots.a)} remates de media por ${f1(st.shots.f)} tuyos. Ajusta el repliegue y cierra el centro del área.`);
      if (st.xg && st.xg.a > st.xg.f + 0.3) add("bad", "growth", "Generan más peligro", `Su xG medio (${f1(st.xg.a)}) supera al tuyo (${f1(st.xg.f)}). Concedes ocasiones más claras de las que creas.`);
      if (st.corners && st.corners.a - st.corners.f >= 3) add("neutral", "flag", "Peligro a balón parado", `Te sacan ${f1(st.corners.a)} córners de media. Refuerza el marcaje en estrategia defensiva.`);
      const reds = st.red ? (Number(st.red.f) || 0) + (Number(st.red.a) || 0) : 0;
      if (reds > 0 || (st.fouls && st.fouls.f >= 14)) add("neutral", "flag", "Partidos calientes", `Son duelos intensos${reds > 0 ? " (ya ha habido expulsiones)" : ""}. Gestiona las entradas y evita amonestaciones tempranas.`);
    }
    // Formación más fiable / a evitar.
    const forms = Object.values(h.formations).filter(f => f.pj >= 2);
    let bestFormation = null;
    if (forms.length) {
      bestFormation = forms.slice().sort((x, y) => y.ppg - x.ppg || y.pj - x.pj)[0];
      if (forms.length > 1 || bestFormation.ppg >= 1.5) add("good", "shirt", "Tu mejor sistema", `Con el ${bestFormation.name} promedias ${f1(bestFormation.ppg)} pts en ${bestFormation.pj} partidos contra ellos. Es tu apuesta más fiable.`);
      const worst = forms.slice().sort((x, y) => x.ppg - y.ppg)[0];
      if (forms.length >= 2 && worst.ppg <= 0.75 && worst.name !== bestFormation.name) add("bad", "shirt", "Sistema a evitar", `El ${worst.name} no te ha funcionado (${f1(worst.ppg)} pts en ${worst.pj}). Plantéate otro dibujo.`);
    }
    return { rival, verdict, insights, bestFormation, sample: a.pj, history: h };
  };

  /* ============================================================
     MERCADO DE APUESTAS (simulación determinista)
     Cuotas, dinero del público y movimiento de línea derivados de la
     FUERZA de cada equipo + el motor Poisson. Funciones puras; nada se
     persiste y el mismo partido produce siempre el mismo mercado.
     ============================================================ */
  /* Fuerza 0-100 de un equipo (modelo prior-anclado + evidencia ponderada por
     confianza, estilo SPI/Elo).
     · TU club: OVR de tu once + forma reciente (lo conoces con precisión).
     · Rival: mezcla el CATÁLOGO (prior) con la fuerza IMPLÍCITA por TUS
       resultados contra él, ponderada por la confianza acumulada. La evidencia
       DECAE por temporada: los duelos recientes mandan y, si dejas de jugar a un
       rival, su rating revierte solo hacia el catálogo (la "deriva" correcta a
       la Glicko: lo que crece con el tiempo es la desconfianza, no el número).
     Determinista y puro: se recalcula del historial; nada se persiste. */
  const ELO = { DECAY: 0.55, KCONF: 3, PTS_PER_GOAL: 8, HOME_ADV: 4.5, GD_CAP: 3 };
  // Memo: clave = objeto carrera (WeakMap → NUNCA se serializa, cero fugas al
  // export/nube). Una sola pasada por carrera+plantilla; lookups O(1) después.
  const _ratingsCache = new WeakMap();

  // Fuerza de TU club. Sin Elo (rompe la recursión y es mejor evidencia que el Elo).
  S.selfStrength = (c) => {
    const DD = FC.data || {};
    const base = U._findTeam(DD.TEAM_STRENGTH, c.clubName); // null si no catalogado
    let strength = base != null ? base : 72;
    const xi = (c.players || []).map(p => Number(p.ovr) || 0).filter(o => o > 0)
      .sort((a, b) => b - a).slice(0, 11);
    if (xi.length >= 7) {
      const avg = xi.reduce((s, o) => s + o, 0) / xi.length;
      const squad = Math.max(50, Math.min(94, avg + 2)); // la media de equipo supera al OVR medio
      strength = base != null ? base * 0.45 + squad * 0.55 : squad;
    }
    const ms = S.userMatches(c).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5);
    if (ms.length >= 3) {
      let pts = 0;
      ms.forEach(m => { const r = S.userResult(c, m); pts += r === "W" ? 3 : r === "D" ? 1 : 0; });
      strength += Math.max(-5, Math.min(5, (pts / ms.length - 1.4) * 3.2));
    }
    return Math.max(45, Math.min(96, strength));
  };

  // Mapa { rival -> { obs, conf } } a partir de TUS resultados, en UNA pasada.
  // obs = fuerza observada (media de fuerzas implícitas, ponderada por decaimiento);
  // conf = confianza 0..1 (sube con nº de duelos recientes, baja sola con el tiempo).
  S.teamRatings = (c) => {
    const matches = c.matches || [], players = c.players || [];
    // Firma de invalidación numérica y barata (cambia con marcadores y OVRs).
    let sig = players.length * 131 + matches.length;
    for (let i = 0; i < players.length; i++) sig = (sig * 31 + (Number(players[i].ovr) || 0)) % 2147483647;
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      sig = (sig * 33 + (Number(m.homeScore) || 0) * 7 + (Number(m.awayScore) || 0) * 13 + (S.isPlayed(m) ? 1 : 0)) % 2147483647;
    }
    const cached = _ratingsCache.get(c);
    if (cached && cached.sig === sig) return cached.map;

    const curYear = (S.currentSeason(c) || {}).startYear || 0;
    const yearOf = {};
    (c.seasons || []).forEach(s => { yearOf[s.id] = s.startYear; });
    const sU = S.selfStrength(c);
    const acc = {}; // rival -> { sw, sval }
    matches.forEach(m => {
      if (!S.isUserMatch(c, m) || !S.isPlayed(m)) return;
      const rival = S.opponentOf(c, m); if (!rival) return;
      const g = S.userGoals(c, m); if (!g) return;
      const gd = Math.max(-ELO.GD_CAP, Math.min(ELO.GD_CAP, (Number(g.for) || 0) - (Number(g.against) || 0)));
      const wasHome = m.home === c.clubName;
      // Fuerza implícita del rival según ESTE resultado: si te gano/empata fuerte,
      // jugó como un equipo fuerte. La ventaja de campo descuenta lo "esperado".
      const implied = Math.max(45, Math.min(96,
        sU - gd * ELO.PTS_PER_GOAL + (wasHome ? ELO.HOME_ADV : -ELO.HOME_ADV)));
      const sy = yearOf[m.seasonId];
      const seasonsAgo = (typeof sy === "number" && curYear) ? Math.max(0, curYear - sy) : 0;
      const w = Math.pow(ELO.DECAY, seasonsAgo); // duelos recientes pesan más
      const a = acc[rival] || (acc[rival] = { sw: 0, sval: 0 });
      a.sw += w; a.sval += w * implied;
    });
    const map = {};
    Object.keys(acc).forEach(name => {
      const a = acc[name];
      map[name] = { obs: a.sval / a.sw, conf: a.sw / (a.sw + ELO.KCONF) };
    });
    _ratingsCache.set(c, { sig, map });
    return map;
  };

  S.teamStrength = (c, teamName) => {
    if (teamName === c.clubName) return S.selfStrength(c);
    const base = U._findTeam((FC.data || {}).TEAM_STRENGTH, teamName); // null si no catalogado
    const prior = base != null ? base : 72;
    const r = S.teamRatings(c)[teamName];
    // Mezcla prior↔observado ponderada por confianza (sin datos → catálogo puro).
    const strength = r ? prior * (1 - r.conf) + r.obs * r.conf : prior;
    return Math.max(45, Math.min(96, strength));
  };

  // Mercado completo de un partido (jugado o programado): 1X2, comparativa de
  // casas, favorito, dinero del público y movimiento de línea. Determinista.
  S.matchOdds = (c, m) => {
    if (!m || m.home == null || m.away == null || m.home === "" || m.away === "") return null;
    const home = m.home, away = m.away, DD = FC.data || {};
    const hsh = (s) => { let v = 7; s = String(s || ""); for (let i = 0; i < s.length; i++) v = (v * 31 + s.charCodeAt(i)) % 100003; return v; };
    const seed = hsh(home + "|" + away + "|" + (m.date || "") + "|" + (m.id || "") + "|" + (m.seasonId || ""));
    const rng = (k, lo, hi) => lo + (Math.abs(hsh(seed + ":" + k)) % 1000) / 1000 * (hi - lo);

    // 1) Fuerzas → goles esperados (Poisson) → probabilidades 1X2.
    const sH = S.teamStrength(c, home), sA = S.teamStrength(c, away);
    const HOME_ADV = 4.5, GOAL_SCALE = 13;
    const total = Math.max(2.2, Math.min(3.35, 2.6 + (sH + sA - 154) / 120));
    const sup = Math.max(-1.9, Math.min(1.9, (sH + HOME_ADV - sA) / GOAL_SCALE));
    const lamH = Math.max(0.3, total / 2 + sup / 2);
    const lamA = Math.max(0.3, total / 2 - sup / 2);
    const xp = S.matchXpts(lamH, lamA);
    let pH = xp.pW, pD = xp.pD, pA = xp.pL;
    const psum = pH + pD + pA; pH /= psum; pD /= psum; pA /= psum;

    // 2) Probabilidad → cuota con margen de casa, redondeada a pasos creíbles.
    const snap = (o) => o < 2 ? Math.round(o * 100) / 100 : o < 4 ? Math.round(o * 20) / 20 : o < 10 ? Math.round(o * 10) / 10 : Math.round(o * 2) / 2;
    const oddFrom = (p, mg) => snap(Math.max(1.02, (1 / Math.max(0.001, p)) / (1 + mg)));
    const MARGIN = 0.065;

    // 3) Tres casas del pool, cada una con su margen. El consenso es su media y
    //    la "mejor cuota" el máximo, de modo que best ≥ consenso (coherente).
    const pool = (DD.BOOKMAKERS || ["Casa A", "Casa B", "Casa C"]).slice();
    const margins = [MARGIN - 0.012, MARGIN + 0.004, MARGIN + 0.02]; // una casa más sharp, otra más cara
    const books = [], used = {};
    for (let i = 0; i < 3; i++) {
      let idx = Math.abs(hsh(seed + "#" + i)) % pool.length, guard = 0;
      while (used[idx] && guard++ < pool.length) idx = (idx + 1) % pool.length;
      used[idx] = 1;
      const mg = margins[i] + rng("mg" + i, -0.004, 0.004);
      const jit = (p, k) => snap(Math.max(1.02, oddFrom(p, mg) * (1 + rng("j" + i + k, -0.012, 0.012))));
      books.push({ name: pool[idx], home: jit(pH, "h"), draw: jit(pD, "d"), away: jit(pA, "a") });
    }
    const avgOdd = (key) => snap(books.reduce((s, b) => s + b[key], 0) / books.length);
    const consensus = { home: avgOdd("home"), draw: avgOdd("draw"), away: avgOdd("away") };
    const best = { home: Math.max(...books.map(b => b.home)), draw: Math.max(...books.map(b => b.draw)), away: Math.max(...books.map(b => b.away)) };

    // 4) Dinero del público: probabilidad + sesgo al favorito + ruido.
    const favSide = pH >= pA ? "home" : "away";
    const wH = Math.pow(pH, 0.92) * (favSide === "home" ? 1.28 : 1) * (1 + rng("ph", -0.05, 0.05));
    const wD = Math.pow(pD, 1.05) * 0.8 * (1 + rng("pd", -0.05, 0.05));
    const wA = Math.pow(pA, 0.92) * (favSide === "away" ? 1.28 : 1) * (1 + rng("pa", -0.05, 0.05));
    const wsum = wH + wD + wA;
    let hub = Math.round(wH / wsum * 100), dub = Math.round(wD / wsum * 100), aub = 100 - hub - dub;
    if (aub < 0) { hub += aub; aub = 0; }
    const publik = { home: hub, draw: dub, away: aub };
    const relevance = (sH + sA) / 2;
    const volume = Math.round((1500 + (relevance - 60) * 220 + Math.max(pH, pA) * 5200) * (0.75 + rng("vol", 0, 0.5)));

    // 5) Movimiento de línea: donde entra el dinero, la cuota se acorta.
    const move = (k, oddNow, handle, prob) => {
      if (handle >= 45 && handle > prob * 100 + 4) return { open: snap(oddNow * (1 + rng("o" + k, 0.04, 0.09))), now: oddNow, dir: "down" };
      if (handle <= 18 || handle < prob * 100 - 5) return { open: snap(oddNow * (1 - rng("o" + k, 0.04, 0.08))), now: oddNow, dir: "up" };
      return { open: oddNow, now: oddNow, dir: "flat" };
    };
    const movement = { home: move("h", consensus.home, publik.home, pH), draw: move("d", consensus.draw, publik.draw, pD), away: move("a", consensus.away, publik.away, pA) };

    const even = Math.abs(pH - pA) < 0.06;
    const fav = even ? { even: true }
      : (pH >= pA ? { side: "home", name: home, prob: Math.round(100 / consensus.home) }
                  : { side: "away", name: away, prob: Math.round(100 / consensus.away) });

    // 6) Mercados derivados (alimentan combinada y cuota mejorada): Poisson del total + BTTS.
    const pois = (k, l) => { if (l <= 0) return k === 0 ? 1 : 0; let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
    let pO15 = 0, pO25 = 0, pBtts = 0; const MG = 8;
    for (let i = 0; i <= MG; i++) for (let j = 0; j <= MG; j++) { const pp = pois(i, lamH) * pois(j, lamA); if (i + j >= 2) pO15 += pp; if (i + j >= 3) pO25 += pp; if (i >= 1 && j >= 1) pBtts += pp; }
    const extras = {
      over15: oddFrom(pO15, MARGIN), under15: oddFrom(1 - pO15, MARGIN),
      over25: oddFrom(pO25, MARGIN), under25: oddFrom(1 - pO25, MARGIN),
      bttsYes: oddFrom(pBtts, MARGIN), bttsNo: oddFrom(1 - pBtts, MARGIN),
    };
    // Cuota mejorada (incentivo): potencia la mejor cuota del favorito.
    const favKey = fav.even ? "home" : fav.side;
    const fromOdd = best[favKey];
    const boost = { sel: favKey, label: favKey === "draw" ? "Empate" : (favKey === "home" ? home : away), from: fromOdd, to: snap(fromOdd * (1.12 + rng("boost", 0, 0.13))) };
    // Combinada sugerida del día (2 patas).
    const combo = { legs: [
      { sel: favKey, text: "Gana " + (fav.even ? home : fav.name), odd: consensus[favKey] },
      { sel: "over15", text: "Más de 1.5 goles", odd: extras.over15 },
    ] };
    combo.odd = snap(combo.legs[0].odd * combo.legs[1].odd);

    // 7) Marcador exacto: top 5 resultados Poisson más probables.
    const scores = [];
    for (let i = 0; i <= 5; i++) for (let j = 0; j <= 5; j++) {
      const pp = pois(i, lamH) * pois(j, lamA);
      scores.push({ h:i, a:j, prob:pp, odd:snap(oddFrom(pp, MARGIN + 0.045)) });
    }
    scores.sort((a,b) => b.prob - a.prob);
    const exactScore = scores.slice(0, 5);

    // 8) Panel de tipsters (4 del pool rotativo, picks deterministas con varianza).
    const tipPool = (DD.TIPSTERS || []).slice();
    const tipsters = [], usedT = {};
    const tipTexts = {
      home: [
        home + " en casa es otro equipo. No me la juego en contra.",
        "Los números me cuadran para el local. Con el " + home + ".",
        "Factor campo decisivo hoy. Mi dinero va al " + home + ".",
        "Locales con buenas sensaciones en las últimas jornadas.",
      ],
      draw: [
        "Partido muy igualado. El empate tiene valor aquí.",
        "No veo clara la victoria de ninguno. Jugada táctica: la X.",
        "Fuerzas parejas. En este tipo de partidos la X siempre aparece.",
        "Cuota de empate interesante dado el contexto del partido.",
      ],
      away: [
        away + " llega en mejor momento. Me la juego por ellos.",
        "Cuota del visitante con valor real según mis modelos.",
        "Las sensaciones del " + away + " fuera de casa me convencen.",
        "Datos de los últimos viajes del " + away + " muy sólidos.",
      ],
    };
    for (let i = 0; i < 4; i++) {
      if (!tipPool.length) break;
      let idx = Math.abs(hsh(seed + "tip" + i)) % tipPool.length, g = 0;
      while (usedT[idx] && g++ < tipPool.length) idx = (idx + 1) % tipPool.length;
      usedT[idx] = 1;
      const t = tipPool[idx];
      const tNoise = rng("tnoise" + i, -0.1, 0.1);
      const aH = Math.max(0, pH + (i % 2 === 0 ? tNoise : -tNoise * 0.6));
      const aA = Math.max(0, pA + (i % 2 === 1 ? tNoise : -tNoise * 0.6));
      const aD = Math.max(0, 1 - aH - aA);
      const r = Math.abs(hsh(seed + "tipR" + i)) % 100;
      const pick = r < aH * 100 ? "home" : r < (aH + aD) * 100 ? "draw" : "away";
      const conf = 60 + Math.round(rng("tconf" + i, 0, 29));
      const txtIdx = Math.abs(hsh(seed + "tipT" + i)) % 4;
      tipsters.push({ name: t.n, platform: t.p, pick, conf, text: tipTexts[pick][txtIdx] });
    }

    return {
      home, away, isUserHome: home === c.clubName, isUserAway: away === c.clubName,
      strength: { home: Math.round(sH), away: Math.round(sA) },
      prob: { home: pH, draw: pD, away: pA },
      consensus, books, best, public: publik, volume, movement, fav, extras, boost, combo,
      exactScore, tipsters,
    };
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
    const wonCup = trophies.some(t => FC.data.isDomesticCup(t.competition));
    const wonContinental = trophies.some(t => FC.data.isContinental(t.competition));
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

  /* ---------- RESUMEN DE TEMPORADA (veredicto de la junta) ----------
     Análisis completo de una temporada, redactado como si lo emitiera la
     junta directiva: nota global, comparación con la campaña anterior,
     mejores actuaciones, mejor/peor partido, luces y sombras, y consejos
     concretos para la próxima temporada. Todo derivado de los partidos. */
  S.seasonReview = (c, seasonId) => {
    const season = S.getSeason(c, seasonId) || S.currentSeason(c);
    if (!season) return null;
    const sm = S.seasonSummary(c, season);
    if (!sm.played) return null;
    const pos  = S.userPosition(c, season.id);
    const isCurrent = season.id === c.currentSeasonId;
    // Temporada anterior (mayor startYear por debajo de la actual).
    const prevSeason = (c.seasons || []).filter(s => s.startYear < season.startYear).sort(U.by("startYear")).pop() || null;
    const prevSm  = prevSeason ? S.seasonSummary(c, prevSeason) : null;
    const prevPos = prevSeason ? S.userPosition(c, prevSeason.id) : null;
    const agg = S.playerAggregates(c, season.id);
    const players = Object.values(agg);
    const sp  = S.scoringProfile(c, season.id);
    const ms  = S.userMatches(c, season.id);
    const gpg  = sm.played ? sm.gf / sm.played : 0;   // goles a favor por partido
    const gapg = sm.played ? sm.ga / sm.played : 0;   // goles en contra por partido
    // Puntos por partido local vs visitante (para el consejo de rendimiento fuera).
    let _hp = 0, _hn = 0, _ap = 0, _an = 0;
    ms.forEach(m => {
      const r = S.userResult(c, m); if (!r) return;
      const pts = r === "W" ? 3 : r === "D" ? 1 : 0;
      if (m.home === c.clubName) { _hp += pts; _hn++; } else { _ap += pts; _an++; }
    });
    const homePpg = _hn ? _hp / _hn : 0, awayPpg = _an ? _ap / _an : 0;
    const venueGap = (_hn >= 3 && _an >= 3) ? (homePpg - awayPpg) : 0;

    // Objetivos de la junta (progreso manual current/target).
    const objectives = (season.boardObjectives || []).map(o => {
      const target = Number(o.target) || 0, current = Number(o.current) || 0;
      const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
      return { text: o.text, current, target, unit: o.unit || "", pct, met: target > 0 && current >= target };
    });
    const objMet = objectives.filter(o => o.met).length;
    const objTotal = objectives.length;

    // Mejor y peor partido de la temporada (por diferencia de goles).
    let bestMatch = null, worstMatch = null;
    ms.forEach(m => {
      const g = S.userGoals(c, m); if (!g) return;
      const r = S.userResult(c, m), diff = g.for - g.against;
      if (r === "W" && (!bestMatch  || diff > bestMatch.diff))  bestMatch  = { diff, m, g };
      if (r === "L" && (!worstMatch || diff < worstMatch.diff)) worstMatch = { diff, m, g };
    });

    // Mejores actuaciones individuales.
    const byGoals  = players.slice().sort((a, b) => b.goals - a.goals);
    const topScorer   = byGoals[0] && byGoals[0].goals > 0 ? byGoals[0] : null;
    const topAssister = players.slice().sort((a, b) => b.assists - a.assists)[0];
    const bestRated   = players.filter(p => p.ratingN >= 3).sort((a, b) => b.avg - a.avg)[0] || null;
    const workhorse   = players.slice().sort((a, b) => b.apps - a.apps)[0] || null;
    const topAssisterV = topAssister && topAssister.assists > 0 ? topAssister : null;

    // Nota global (0-100) → grado y tono.
    let score = 0;
    score += Math.min(40, sm.winPct * 0.4);
    score += objTotal ? (objMet / objTotal) * 28 : 14;
    score += Math.min(22, sm.trophies * 13 + (sm.wonContinental ? 9 : 0));
    if (pos && pos.total > 1) score += (1 - (pos.pos - 1) / (pos.total - 1)) * 10;
    else score += 5;
    score = Math.max(0, Math.min(100, Math.round(score)));
    const grade =
      score >= 80 ? { label: "Sobresaliente", tone: "good",    emoji: "🏆", letter: "A" } :
      score >= 65 ? { label: "Notable",        tone: "good",    emoji: "👏", letter: "B" } :
      score >= 50 ? { label: "Aprobado",        tone: "neutral", emoji: "🙂", letter: "C" } :
      score >= 35 ? { label: "Insuficiente",    tone: "warn",    emoji: "😕", letter: "D" } :
                    { label: "Decepcionante",   tone: "bad",     emoji: "💢", letter: "E" };

    // Comparación con la temporada anterior.
    const deltas = prevSm ? {
      points: sm.points - prevSm.points,
      winPct: sm.winPct - prevSm.winPct,
      gd: sm.gd - prevSm.gd,
      pos: (pos && prevPos) ? (prevPos.pos - pos.pos) : null, // + = mejora (sube en la tabla)
      label: prevSeason.label,
    } : null;

    // Veredicto redactado de la junta (referencia datos reales).
    const posStr = pos ? pos.pos + "º de " + pos.total : null;
    const trophyStr = sm.trophies > 0 ? (sm.trophies === 1 ? "un título" : sm.trophies + " títulos") : null;
    const objStr = objTotal ? objMet + " de " + objTotal + " objetivos" : null;
    let verdictTitle, verdictText;
    const base = "La junta directiva ha analizado la temporada " + season.label + ". ";
    if (grade.tone === "good" && sm.trophies > 0) {
      verdictTitle = "Temporada para enmarcar";
      verdictText = base + "El balance de " + sm.w + "V-" + sm.d + "E-" + sm.l + "D" + (posStr ? ", el " + posStr + " en liga" : "") + " y " + trophyStr + " confirman un curso brillante. El club está orgulloso del trabajo realizado y espera que esta exigencia se mantenga.";
    } else if (grade.tone === "good") {
      verdictTitle = "Curso muy satisfactorio";
      verdictText = base + "Con " + sm.points + " puntos" + (posStr ? " y un " + posStr : "") + ", el equipo ha competido a gran nivel" + (objStr ? " (" + objStr + " cumplidos)" : "") + ". La dirección valora la solidez mostrada y confía en dar el siguiente paso.";
    } else if (grade.tone === "neutral") {
      verdictTitle = "Balance aceptable, con margen de mejora";
      verdictText = base + "El " + sm.winPct + "% de victorias" + (posStr ? " y el " + posStr : "") + " dejan una sensación agridulce" + (objStr ? ": " + objStr + " cumplidos" : "") + ". La junta espera un salto de competitividad la próxima campaña.";
    } else if (grade.tone === "warn") {
      verdictTitle = "Temporada por debajo de las expectativas";
      verdictText = base + "Los números — " + sm.w + "V-" + sm.d + "E-" + sm.l + "D" + (posStr ? ", " + posStr : "") + " — se quedan cortos para las aspiraciones del club" + (objStr && objMet < objTotal ? " (solo " + objStr + " cumplidos)" : "") + ". Se exige una reacción clara y un proyecto más sólido.";
    } else {
      verdictTitle = "La dirección exige un cambio de rumbo";
      verdictText = base + "Con apenas " + sm.points + " puntos" + (posStr ? " y un preocupante " + posStr : "") + ", la temporada no ha estado a la altura. La junta reclama medidas inmediatas para enderezar el proyecto deportivo.";
    }

    // Luces, sombras y consejos (derivados de los datos).
    const highlights = [], concerns = [], advice = [];
    const totalGoals = sm.gf;
    if (sm.wonLeague)       highlights.push({ icon: "trophy", text: "Campeones de liga: el mayor de los éxitos." });
    if (sm.wonContinental)  highlights.push({ icon: "trophy", text: "Gloria continental para las vitrinas del club." });
    if (sm.wonCup)          highlights.push({ icon: "trophy", text: "Título de copa que engrandece la temporada." });
    if (sm.cleanSheets >= Math.max(5, Math.round(sm.played * 0.35))) highlights.push({ icon: "shield", text: sm.cleanSheets + " porterías a cero: la solidez defensiva fue una seña de identidad." });
    if (gpg >= 2)           highlights.push({ icon: "ball", text: "Ataque demoledor: " + (Math.round(gpg * 10) / 10).toString().replace(".", ",") + " goles por partido de media." });
    if (sp && sp.bestScoringStreak >= 5) highlights.push({ icon: "growth", text: "Una racha de " + sp.bestScoringStreak + " partidos seguidos marcando." });
    if (topScorer)          highlights.push({ icon: "star", text: topScorer.name + " brilló con " + topScorer.goals + " goles esta temporada." });
    if (deltas && deltas.pos != null && deltas.pos >= 2) highlights.push({ icon: "growth", text: "El equipo ha escalado " + deltas.pos + " puestos respecto a la temporada anterior." });

    if (gapg >= 1.5)        concerns.push({ icon: "flame", text: "Defensa frágil: " + (Math.round(gapg * 10) / 10).toString().replace(".", ",") + " goles encajados por partido." });
    if (gpg < 1)            concerns.push({ icon: "target", text: "Pegada escasa: menos de un gol por partido de media." });
    if (sp && sp.longestDrought >= 4) concerns.push({ icon: "target", text: "Una sequía de " + sp.longestDrought + " partidos sin marcar lastró al equipo." });
    if (objTotal && objMet < objTotal) concerns.push({ icon: "flag", text: (objTotal - objMet) + " de " + objTotal + " objetivos de la junta quedaron sin cumplir." });
    if (sm.l > sm.w)        concerns.push({ icon: "growth", text: "Más derrotas (" + sm.l + ") que victorias (" + sm.w + "): falta regularidad." });
    if (deltas && deltas.pos != null && deltas.pos <= -2) concerns.push({ icon: "growth", text: "El equipo ha caído " + Math.abs(deltas.pos) + " puestos respecto al curso anterior." });

    // Consejos concretos para la próxima temporada.
    if (gapg >= 1.4)        advice.push({ icon: "shield", title: "Reforzad la defensa", text: "Encajáis " + (Math.round(gapg * 10) / 10).toString().replace(".", ",") + " goles por partido. Un central de garantías o un pivote defensivo cambiarían la cara del equipo." });
    if (gpg < 1.2)          advice.push({ icon: "target", title: "Buscad más pegada", text: "El ataque se queda en " + (Math.round(gpg * 10) / 10).toString().replace(".", ",") + " goles por partido. Hace falta un delantero diferencial que resuelva los partidos cerrados." });
    if (topScorer && totalGoals > 0 && (topScorer.goals / totalGoals) >= 0.4) advice.push({ icon: "growth", title: "Repartid el gol", text: "El " + Math.round(topScorer.goals / totalGoals * 100) + "% de los goles los firmó " + topScorer.name + ". Si se lesiona o baja su nivel, el equipo se resiente. Distribuid la responsabilidad goleadora." });
    if (venueGap >= 0.8) advice.push({ icon: "plane", title: "Mejorad lejos de casa", text: "Sumáis " + (Math.round(homePpg * 10) / 10).toString().replace(".", ",") + " pts por partido como local frente a " + (Math.round(awayPpg * 10) / 10).toString().replace(".", ",") + " a domicilio. Trabajad un plan específico para fuera: ahí se escapan muchos puntos." });
    if (objTotal && objMet < objTotal) advice.push({ icon: "flag", title: "Cumplid los objetivos marcados", text: "La junta fijó metas que no se alcanzaron. La próxima temporada se evaluará con la misma vara: planificad el plantel para llegar a ellas." });
    if (workhorse && workhorse.apps >= sm.played * 0.95 && sm.played >= 10) advice.push({ icon: "bandage", title: "Dad profundidad a la plantilla", text: workhorse.name + " ha jugado casi todo. Un plantel corto se desgasta en el tramo final: incorporad relevos de garantías." });
    if (!advice.length) advice.push({ icon: "growth", title: "Mantened el rumbo", text: "El proyecto funciona. Conservad el bloque, haced retoques quirúrgicos y aspirad a un poco más sin romper lo que ya da resultados." });

    return {
      season, summary: sm, pos, isCurrent,
      prevSeason, prevSm, prevPos, deltas,
      objectives, objMet, objTotal,
      bestMatch, worstMatch,
      topScorer, topAssister: topAssisterV, bestRated, workhorse,
      score, grade, verdictTitle, verdictText,
      highlights, concerns, advice,
    };
  };

  /* ---------- LÍNEA DE TIEMPO DE LA CARRERA ----------
     Hitos cronológicos derivados: una entrada por temporada con su
     resultado deportivo (posición, títulos, premios) y un descriptor
     redactado. Pensada para visualizarse como timeline vertical. */
  S.careerTimeline = (c) => {
    const seasons = (c.seasons || []).slice().sort(U.by("startYear"));
    if (!seasons.length) return [];
    return seasons.map((s, idx) => {
      const sm = S.seasonSummary(c, s);
      const pos = S.userPosition(c, s.id);
      const trophies = (c.trophies || []).filter(t => t.seasonId === s.id);
      const awards = (c.awards || []).filter(a => a.season === s.label);
      const badges = trophies.map(t => t.result === "winner" ? "🏆" : t.result === "promotion" ? "⬆️" : "🥈").concat(awards.map(a => a.icon || "🏅"));
      let icon = "calendar", tone = "neutral", title;
      if (sm.wonLeague)               { title = "Campeones de liga"; icon = "trophy"; tone = "good"; }
      else if (sm.wonContinental)     { title = "Gloria continental"; icon = "trophy"; tone = "good"; }
      else if (trophies.some(t => t.result === "promotion")) { title = "Ascenso de categoría"; icon = "growth"; tone = "good"; }
      else if (sm.wonCup)             { title = "Título de copa"; icon = "trophy"; tone = "good"; }
      else if (trophies.some(t => t.result === "runnerup")) { title = "Subcampeonato"; icon = "star"; tone = "neutral"; }
      else if (pos && pos.pos <= 3)   { title = "Temporada en el podio"; icon = "growth"; tone = "good"; }
      else if (pos && pos.total > 4 && pos.pos > pos.total - 3) { title = "Lucha por la permanencia"; icon = "flame"; tone = "bad"; }
      else if (pos && pos.total > 1 && pos.pos <= Math.ceil(pos.total / 2)) { title = "Campaña en la zona alta"; icon = "shield"; tone = "neutral"; }
      else if (idx === 0)             { title = "Inicio de la andadura"; icon = "flag"; tone = "neutral"; }
      else                            { title = "Temporada de transición"; icon = "calendar"; tone = "neutral"; }
      const sub = (pos ? pos.pos + "º · " : "") + sm.points + " pts · " + sm.w + "V-" + sm.d + "E-" + sm.l + "D · " + sm.gf + ":" + sm.ga + (awards.length ? " · " + awards.length + " premio" + (awards.length > 1 ? "s" : "") : "");
      return { seasonId: s.id, label: s.label, startYear: s.startYear, icon, tone, title, sub, badges, isCurrent: s.id === c.currentSeasonId };
    });
  };

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
      // Beat de partido especial (derbi / final / clásico)
      if (m.tag && (m.tag === "derbi" || m.tag === "final" || m.tag === "clasico")) {
        const res = S.userResult(c, m);
        if (res) {
          const poolKey = m.tag + "_" + res;
          const tagIcon = m.tag === "final" ? "trophy" : m.tag === "clasico" ? "star" : "flame";
          const tagTone = res === "W" ? "good" : res === "L" ? "bad" : "neutral";
          push({ phase: 1, date, tone: tagTone, icon: tagIcon,
            title: phrase(poolKey, "tag:" + m.tag + ":" + m.id, { team: T, rival, gf: g.for, ga: g.against }),
            sub: (m.competition ? esc(m.competition) + " · " : "") + scoreline });
        }
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
    // longest unbeaten run + longest win streak
    const ordered = S.userMatches(c).slice().sort((a,b) => new Date(a.date||0) - new Date(b.date||0));
    let run=0, bestRun=0, wrun=0, bestWrun=0;
    ordered.forEach(m => {
      const r = S.userResult(c, m);
      if (r === "L") { run = 0; wrun = 0; } else { run++; bestRun = Math.max(bestRun, run); if (r === "W") { wrun++; bestWrun = Math.max(bestWrun, wrun); } else wrun = 0; }
    });
    // best season by points
    let bestSeason = null;
    (c.seasons || []).forEach(season => {
      const ms = S.userMatches(c, season.id);
      if (!ms.length) return;
      const wins = ms.filter(m => S.userResult(c, m) === "W").length;
      const pts  = ms.reduce((s, m) => { const r = S.userResult(c, m); return s + (r === "W" ? 3 : r === "D" ? 1 : 0); }, 0);
      const gf   = ms.reduce((s, m) => { const g = S.userGoals(c, m); return s + (g ? g.for : 0); }, 0);
      if (!bestSeason || pts > bestSeason.pts) bestSeason = { label: season.label, wins, pts, gf };
    });
    return { topScorer, topAssister, topApps, bestWin, bestUnbeaten: bestRun, bestWinStreak: bestWrun, bestSeason };
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

  /* ---------- CAPITAL POLÍTICO ----------
     Deriva la tensión política (0-100) del manager a partir de:
     – Líderes/Capitán ausentes en los últimos partidos con ratings
     – Figuras clave perdiendo protagonismo respecto a partidos anteriores
     – Jugadores con contrato a vencer que no están jugando
     Devuelve null si no hay suficientes datos (< 3 partidos con ratings). */
  S.politicalCapital = (c, seasonId) => {
    const players = (c.players || []).filter(p => p && (p.name || p.id));
    if (players.length < 2) return null;
    const h = S.squadHierarchy(c);
    if (!h || !h.players.length) return null;
    const norm = (s) => (s || "").trim().toLowerCase();
    const ms = S.userMatches(c, seasonId)
      .filter(m => (m.ratings || []).length > 0)
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    if (ms.length < 3) return null;

    // Set de nombres que aparecen en los ratings de cada partido
    const matchNames = ms.map(m =>
      new Set((m.ratings || []).filter(r => r.name).map(r => norm(r.name)))
    );
    const recent3 = matchNames.slice(-3);
    const prev3   = matchNames.slice(-6, -3);

    const leaders = h.players.filter(p => p.tier === "Capitán" || p.tier === "Líder");
    let tension = 0;
    const events = [];

    leaders.forEach(lp => {
      const key = norm(lp.name);
      const inRecent = recent3.filter(s => s.has(key)).length;
      const inPrev   = prev3.length ? prev3.filter(s => s.has(key)).length : null;

      if (inRecent === 0) {
        // Ausente en los últimos 3 partidos con ratings
        tension += lp.tier === "Capitán" ? 30 : 18;
        events.push({
          tone: lp.tier === "Capitán" ? "danger" : "warn",
          text: lp.tier === "Capitán"
            ? lp.name + " (Capitán) lleva 3 partidos fuera del XI. El vestuario está al rojo vivo."
            : lp.name + " (Líder) ha desaparecido de las alineaciones. Hay rumores de tensión."
        });
      } else if (inPrev !== null && inPrev >= 2 && inRecent === 1) {
        // Perdiendo protagonismo: antes fijo, ahora residual
        tension += lp.tier === "Capitán" ? 15 : 8;
        events.push({
          tone: "warn",
          text: lp.name + " está perdiendo protagonismo. Era titular fijo y ahora apenas juega."
        });
      }
    });

    // Figura con contrato a vencer sin minutos recientes → percepción de marginación
    const curYear = Number(((S.currentSeason(c)) || {}).startYear || 0);
    if (curYear) {
      players.forEach(p => {
        const yr = parseInt(p.contractEnd || "");
        if (!Number.isFinite(yr) || yr < 1990 || yr > 2100) return;
        if (yr - curYear > 1) return;
        if (p.squadRole !== "Estrella" && p.squadRole !== "Titular") return;
        const key = norm(p.name);
        if (events.some(e => e.text.startsWith(p.name))) return; // ya flagueado
        const inRecent = recent3.filter(s => s.has(key)).length;
        if (inRecent === 0) {
          tension += 10;
          events.push({
            tone: "warn",
            text: p.name + " acaba contrato este año y no está jugando. El vestuario lo interpreta como una señal."
          });
        }
      });
    }

    tension = Math.min(100, tension);
    const level     = tension >= 60 ? "Crisis" : tension >= 25 ? "Tensión" : "Estable";
    const levelTone = tension >= 60 ? "danger"  : tension >= 25 ? "warn"    : "ok";

    const insights = [];
    if (tension >= 60)
      insights.push({ tone: "danger", text: "El vestuario está en crisis. La directiva podría intervenir si no atajas la situación." });
    else if (tension >= 25)
      insights.push({ tone: "warn", text: "Hay tensión en el ambiente. Da minutos a tus referentes antes de que escale." });
    else if (!events.length)
      insights.push({ tone: "ok", text: "El clima político es estable. Tus referentes tienen el protagonismo que merecen." });
    else
      insights.push({ tone: "neutral", text: "Situación bajo control, pero vigila la gestión de tus figuras de peso." });

    return { tension, level, levelTone, events, insights };
  };

  /* ---------- INFORME PREVIA DE PARTIDO ----------
     Consolida en un único objeto el estado actual del vestuario:
     tensión política, sobrecarga, lesiones activas, racha reciente y
     sequía/racha goleadora. Pensado para mostrarse antes de registrar
     el resultado del partido. Devuelve null si no hay datos relevantes. */
  S.matchDayReport = (c, seasonId) => {
    const pol  = S.politicalCapital(c, seasonId);
    const load = S.loadReport(c, seasonId);
    const sp   = S.scoringProfile(c, seasonId);
    const injuries = S.activeInjuries(c);
    const playerNorms = new Set((c.players || []).map(p => (p.name || "").trim().toLowerCase()));
    const activeInjured = injuries.filter(i => i.player && playerNorms.has((i.player || "").trim().toLowerCase()));
    const overloaded = (load && load.hasMinutes)
      ? load.players.filter(p => p.inSquad && (p.share || 0) >= 90).slice(0, 3)
      : [];
    const last5 = S.userMatches(c, seasonId)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5).map(m => S.userResult(c, m)).filter(Boolean).reverse();
    const drought = sp ? sp.currentDrought : 0;
    const scoringStreak = sp ? sp.currentScoringStreak : 0;
    const signals = [];
    if (pol && pol.tension >= 25)
      signals.push({ tone: pol.levelTone, icon: "shield", text: pol.level + " política: " + (pol.events[0] ? pol.events[0].text : "Tensión en el vestuario.") });
    if (overloaded.length)
      signals.push({ tone: "warn", icon: "bandage", text: "Sobrecarga: " + overloaded.map(p => p.name).join(", ") + " acumulan demasiados minutos." });
    if (activeInjured.length)
      signals.push({ tone: "danger", icon: "bandage", text: activeInjured.length + " jugador" + (activeInjured.length > 1 ? "es" : "") + " en enfermería: " + activeInjured.map(i => i.player).join(", ") + "." });
    if (drought >= 2)
      signals.push({ tone: "warn", icon: "ball", text: "Sequía de " + drought + " partidos sin marcar. El ataque necesita activarse." });
    else if (scoringStreak >= 3)
      signals.push({ tone: "ok", icon: "ball", text: "Llevas " + scoringStreak + " partidos consecutivos marcando. Buen momento ofensivo." });
    if (!last5.length && !signals.length) return null;
    const warns = signals.filter(s => s.tone === "warn" || s.tone === "danger").length;
    const mood  = warns >= 3 ? "critical" : warns >= 2 ? "bad" : warns === 1 ? "caution" : "good";
    return { last5, signals, mood, drought, scoringStreak, overloaded, injured: activeInjured };
  };

  /* ---------- SALA DE PRENSA ----------
     Genera artículos ficticios (crónica, vestuario, racha) para 3 medios
     inventados con sesgos editoriales distintos. Totalmente determinista:
     el mismo historial produce siempre los mismos artículos. */
  S.pressRoom = (c, seasonId) => {
    const season = (c.seasons || []).find(s => s.id === seasonId) || S.currentSeason(c);
    if (!season || !c.clubName) return null;
    const club = c.clubName;
    const played = S.userMatches(c, seasonId)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    if (!played.length) return null;
    const pol  = S.politicalCapital(c, seasonId);
    const sp   = S.scoringProfile(c, seasonId);
    const hier = S.squadHierarchy(c);
    const captain = hier && hier.captain ? hier.captain.name : null;
    const h    = (s) => { let v = 7; s = String(s || ""); for (let i = 0; i < s.length; i++) v = (v * 31 + s.charCodeAt(i)) % 100003; return v; };
    const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
    const articles = [];

    /* ---- CRÓNICA del último partido ---- */
    const lastM = played[0];
    const res   = S.userResult(c, lastM);
    const gls   = S.userGoals(c, lastM);
    const rival = S.opponentOf(c, lastM) || "el rival";
    const isHome = lastM.home === club;
    const locacion = isHome ? "en casa" : "a domicilio";
    const score = gls ? gls.for + "-" + gls.against : null;
    const ratings = (lastM.ratings || []).filter(r => r.name && r.rating).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const mvpName = ratings[0] ? ratings[0].name : null;
    const comp  = lastM.competition || "la competición";
    const seed  = h((lastM.id || "x") + (rival || ""));

    if (res) {
      const mkStats = () => gls ? { gf: gls.for, ga: gls.against, rival, locacion, mvp: mvpName, comp } : null;
      const goleada = gls && res === "W" && (gls.for - gls.against) >= 3;
      const golazo  = gls && res === "L" && (gls.against - gls.for) >= 3;

      /* ---- DIANA ---- */
      const dTitW = goleada
        ? pick(["¡GOLEADA HISTÓRICA!", "¡SHOW TOTAL!", "¡SIN PIEDAD!", "¡APLASTANTE!", "¡NOCHE PERFECTA!"], seed)
        : pick(["IMPARABLE", "ESPECTACULAR", "¡A POR TODOS!", "QUÉ GRANDE ERES", "GANAMOS Y SOÑAMOS", "¡ESTO ES FÚTBOL!", "¡TRES PUNTOS DE ORO!", "¡QUÉ PARTIDO!"], seed);
      const dTitD = pick(["SE NOS ESCAPA", "EMPATE QUE DUELE", "MEDIO PASO ATRÁS", "LA IGUALADA SABE A POCO", "¿CUÁNDO METEMOS GOL?", "OPORTUNIDAD PERDIDA", "DOS PUNTOS TIRADOS"], seed);
      const dTitL = golazo
        ? pick(["¡HUMILLACIÓN TOTAL!", "¡VERGÜENZA!", "¡CATÁSTROFE SIN PALIATIVOS!", "¡DESASTRE MAYÚSCULO!"], seed)
        : pick(["CATÁSTROFE", "¡ESTO ES UN DESASTRE!", "HUNDIDOS", "TODO SE DERRUMBA", "LA NOCHE NEGRA", "¡SE ACABÓ LA PACIENCIA!", "SIN ARGUMENTOS, SIN IDEAS"], seed);
      const dTit = res === "W" ? dTitW : res === "D" ? dTitD : dTitL;

      const dSubW = [
        "Victoria contundente del " + club + " que desata la euforia de la afición",
        "El " + club + " no da tregua y vuelve a ganar" + (score ? " (" + score + ")" : ""),
        "Tres puntos de oro que lanzan al equipo hacia lo más alto",
        (mvpName ? mvpName + " conduce al " + club : "El " + club) + " al éxito " + locacion,
        "Sin discusión: el " + club + " fue el mejor " + locacion + " y lo demostró",
        "El " + club + " golea, gusta y gana: noche para enmarcar ante " + rival,
        rival + " no tuvo respuesta: el " + club + " fue una apisonadora",
      ];
      const dSubD = [
        "El " + club + " no puede con " + rival + " y regala un punto que duele",
        "El empate frena el vuelo de un equipo que merecía más",
        "Reparto de puntos que sabe a frustración después de lo visto " + locacion,
        "El " + club + " no encontró el gol y se come un empate que no buscaba",
        "Tablas en un duelo que el " + club + " debería haber ganado con su juego",
        "Dos puntos menos que se podrían necesitar al final de temporada",
        "El gol llega, llega… pero no llega. El " + club + " se desespera ante " + rival,
      ];
      const dSubL = [
        "El " + club + " se hunde ante " + rival + " en una noche para olvidar rápido",
        "Otra derrota que pone en duda el rumbo del equipo",
        "Sin argumentos: el " + club + " vuelve a casa con las manos vacías",
        "El " + club + " cae " + locacion + " y la situación empieza a preocupar",
        "Noche negra para los seguidores del " + club + ": sin ideas, sin gol, sin resultado",
        rival + " no tuvo piedad y el " + club + " no supo responder en ningún momento",
        "La peor versión del " + club + " apareció ante " + rival + " y el marcador lo refleja",
      ];
      const dSub = res === "W" ? pick(dSubW, seed + 11) : res === "D" ? pick(dSubD, seed + 11) : pick(dSubL, seed + 11);

      const dCW = [
        ["Noche redonda para el " + club + ". El marcador" + (score ? " (" + score + ")" : "") + " refleja la diferencia " + locacion + ", donde el equipo controló el encuentro de principio a fin.", mvpName ? mvpName + " fue la gran figura, decisivo en cada balón que tocó." : "Un colectivo imperial, sólido en todas sus líneas.", "Con esta victoria, el equipo manda un mensaje claro al resto de la tabla."],
        ["Goleada y lección de fútbol. El " + club + " firmó una actuación para enmarcar ante " + rival + " y deja claro que está en un gran momento de forma.", "La afición se marchó con una sonrisa y mucho optimismo de cara al futuro.", mvpName ? "Nadie quiso llevarse más protagonismo que " + mvpName + ", estelar de principio a fin." : "El colectivo, por encima de todo lo demás."],
        ["El " + club + " salió a matar desde el primer minuto y lo consiguió. " + rival + " no supo frenar la embestida.", mvpName ? mvpName + " marcó las diferencias cuando el partido lo requería." : "Un once compacto que supo leer el partido a la perfección.", "El técnico puede estar muy satisfecho: el equipo ejecutó el plan sin fisuras."],
        ["Tres puntos que valen mucho. El " + club + " sufrió lo justo " + locacion + " para llevarse el botín completo.", "El vestuario celebra una victoria que da moral y puntos en la clasificación.", mvpName ? "Especial mención para " + mvpName + ", que elevó su nivel cuando el equipo lo necesitaba." : "Una actuación de equipo en mayúsculas que debe repetirse."],
      ];
      const dCD = [
        ["El " + club + " no pasó del empate ante " + rival + " pese a merecer más. El marcador" + (score ? " (" + score + ")" : "") + " deja una sensación agridulce que costará digerir.", "Tuvo las ocasiones para llevarse los tres puntos, pero el gol no llegó en los momentos clave.", "Dos puntos perdidos que podrían pesar al final de la temporada."],
        ["Repartición de puntos en un duelo que pudo ser victoria. El " + club + " no encontró el camino al gol cuando más lo necesitaba.", "El empate no satisface a nadie en el vestuario y la afición lo sabe.", "Toca reponerse y mirar al próximo compromiso con ambición renovada."],
        ["El " + club + " dominó pero no mató. " + rival + " aprovechó la falta de contundencia para escapar con un punto que no merecía.", "El marcador pudo y debió decir más, pero el fútbol es así de ingrato a veces.", "El técnico tendrá trabajo esta semana para corregir la falta de puntería de su equipo."],
        ["Un punto que sabe a muy poco. El " + club + " tuvo el partido en la mano y no supo cerrarlo con autoridad.", "La afición se marcha frustrada de las gradas, con la sensación clara de que hay mucho más.", "El equipo necesita dar un paso adelante en la eficacia si quiere luchar por lo que merece."],
      ];
      const dCL = [
        ["No hubo piedad. El " + club + " cayó ante " + rival + (score ? " (" + score + ")" : "") + " en un partido para olvidar lo antes posible.", "El equipo no apareció en la primera parte y el trabajo de remontar fue demasiado para los suyos.", "Las dudas vuelven a rodear al equipo en el peor momento de la temporada."],
        ["Derrota dolorosa. El " + club + " volvió a perder y la preocupación empieza a instalarse en el entorno.", "Sin ideas, sin gol, sin reacción: el equipo necesita respuestas urgentes antes de que sea tarde.", "El vestuario deberá dar un paso al frente si no quiere que la situación se complique más."],
        [rival + " fue muy superior. El " + club + " no tuvo argumentos para competir y el marcador lo dejó en evidencia.", "La derrota genera un debate inevitable sobre el rendimiento colectivo del equipo.", "Toca hacer autocrítica y volver a la senda ganadora cuanto antes, no hay tiempo que perder."],
        ["Mal día, peor resultado. El " + club + " no estuvo a la altura y lo pagó caro ante un " + rival + " que aprovechó todo lo que le dieron.", "El técnico tendrá que remover el grupo para sacar una reacción antes de que sea demasiado tarde.", "La afición espera una respuesta clara; el equipo está obligado a darla."],
      ];
      const dCuerpo = res === "W" ? pick(dCW, seed + 22) : res === "D" ? pick(dCD, seed + 22) : pick(dCL, seed + 22);
      articles.push({ medio: "DIANA", sesgo: "sensacionalista", tipo: "cronica", resultado: res, titular: dTit, entradilla: dSub, cuerpo: dCuerpo, firma: pick(["Redacción DIANA", "J. Blanes · DIANA", "M. Ortega · DIANA", "F. Sánchez · DIANA", "Equipo deportes · DIANA"], seed + 33), recuadroStats: mkStats() });

      /* ---- Crónica ---- */
      const cTitW = [
        club + " suma ante " + rival + " con autoridad y sigue soñando",
        "Victoria sólida del " + club + " que consolida su posición en la tabla",
        "El " + club + " no falla " + locacion + ": tres puntos clave ante " + rival,
        rival + " sucumbe ante un " + club + " que impone su ley " + locacion,
        "El " + club + " firma su guión y derrota a " + rival + " con solvencia en " + comp,
        (mvpName ? mvpName + " lidera al " : "Un gran ") + club + " hacia otra victoria en " + comp,
        "El " + club + " es un rodillo: nueva victoria ante " + rival + " que consolida su candidatura",
      ];
      const cTitD = [
        "El " + club + " y " + rival + " se reparten los puntos en un duelo sin resolución",
        "Empate que deja al " + club + " con la miel en los labios tras dominar el partido",
        "Reparto equitativo que no satisface a ninguno de los dos equipos",
        "El " + club + " no logra romper el cerrojo de " + rival + " y firma tablas",
        "Un punto que sabe a poco para el " + club + " tras sus méritos sobre el campo " + locacion,
        "Equilibrio sin ganador: " + club + " y " + rival + " no se hacen daño en " + comp,
        "El " + club + " acumula otro empate que ralentiza su marcha en la tabla",
      ];
      const cTitL = [
        "Derrota del " + club + " ante " + rival + " que abre el debate en el entorno",
        "El " + club + " cae " + locacion + " y genera incertidumbre de cara al tramo decisivo",
        rival + " vence al " + club + " con una actuación que deja muchas preguntas",
        "El " + club + " no encuentra soluciones y " + rival + " lo castiga sin contemplaciones",
        "Tres puntos para " + rival + " que agravan los problemas del " + club + " en " + comp,
        "Una derrota que duele: el " + club + " no estuvo a la altura de las circunstancias",
        "El " + club + " pierde ante " + rival + " y la autocrítica vuelve a ser obligatoria",
      ];
      const cTit = res === "W" ? pick(cTitW, seed + 110) : res === "D" ? pick(cTitD, seed + 110) : pick(cTitL, seed + 110);

      const cEntW = pick([
        "El conjunto puso el partido bajo control desde el primer cuarto de hora y no dio opción al rival.",
        "La superioridad del " + club + " fue evidente durante los noventa minutos " + locacion + ".",
        "Una victoria merecida que llega en el momento ideal para el " + club + " en " + comp + ".",
        (mvpName ? mvpName + " y los suyos" : "El equipo") + " ofrecieron una versión muy sólida ante un " + rival + " que poco pudo hacer.",
        "Tres puntos que reflejan el buen estado de forma de un " + club + " que se afirma semana a semana.",
        "El " + club + " fue mejor en todos los registros y el resultado es la consecuencia lógica de ello.",
      ], seed + 120);
      const cEntD = pick([
        "Un partido equilibrado donde ninguno de los dos equipos logró imponer su juego durante los noventa minutos.",
        "El " + club + " tuvo más, pero no encontró la precisión necesaria para romper la resistencia de " + rival + ".",
        "Empate que deja sensaciones encontradas: el juego estuvo, el gol no llegó cuando se necesitaba.",
        "Ni vencedor ni vencido en un duelo donde la tensión superó a las oportunidades claras de gol.",
        "El " + club + " dominó sin traducirlo en goles, y " + rival + " supo aprovechar ese empate para llevarse su punto.",
        "Un empate que puede leerse como un punto ganado o como dos perdidos, según el cristal con que se mire.",
      ], seed + 120);
      const cEntL = pick([
        "La derrota pone de manifiesto las dificultades que atraviesa el equipo para mantener el nivel reciente.",
        rival + " fue superior en los aspectos tácticos clave y el " + club + " no encontró respuesta en ningún momento.",
        "Un resultado que duele y que obliga a un análisis profundo del momento que atraviesa el equipo.",
        "El " + club + " no estuvo a la altura y pagó cara su falta de intensidad frente a un " + rival + " muy efectivo.",
        "La derrota " + locacion + " deja al " + club + " con preguntas sin responder de cara a los próximos compromisos.",
        "Mala tarde en todos los sentidos: juego, actitud y resultado. El " + club + " deberá hacer autocrítica.",
      ], seed + 120);
      const cEnt = res === "W" ? cEntW : res === "D" ? cEntD : cEntL;

      const cCW = [
        ["El " + club + " resolvió el encuentro ante " + rival + " con solidez y madurez. El resultado" + (score ? " (" + score + ")" : "") + " refleja la diferencia entre ambos contendientes.", mvpName ? mvpName + " volvió a ser el hilo conductor de un equipo que sabe lo que quiere." : "El conjunto mostró la cohesión que le caracteriza en sus mejores momentos.", "Los tres puntos consolidan una dinámica positiva que el técnico querrá mantener."],
        ["Dominio, claridad de ideas y eficacia. El " + club + " volvió a demostrar que cuando está bien es muy difícil de batir.", "El plan de partido funcionó a la perfección: presión alta, salida rápida y contundencia en el área.", mvpName ? mvpName + " fue el faro que guió al equipo en los momentos de mayor exigencia táctica." : "El once fue un bloque compacto, con todos remando en la misma dirección."],
        ["Partido controlado de principio a fin. El " + club + " no necesitó arriesgar para llevarse los tres puntos ante un " + rival + " que apenas inquietó.", "La solidez defensiva fue la base sobre la que se construyó la victoria.", "Con este triunfo, el equipo sigue avanzando en " + comp + " con paso firme y sin fisuras."],
        [rival + " llegó con intenciones, pero el " + club + " las desbarató con autoridad y contundencia. El resultado habla solo.", mvpName ? "La figura: " + mvpName + ", que dictó el ritmo durante los 90 minutos con una actuación impecable." : "Un rendimiento colectivo que hace muy difícil señalar a un solo protagonista.", "Victoria que suma en lo deportivo y en lo anímico de cara a lo que está por venir."],
      ];
      const cCD = [
        ["El " + club + " no pudo romper el cerrojo de " + rival + " pese a tener el balón y las intenciones.", "La falta de puntería en los metros finales volvió a aparecer en el momento más inoportuno.", "Con los deberes a medias, el equipo tendrá que buscar soluciones de cara al próximo partido."],
        ["Dominio estéril para el " + club + ", que acumuló méritos sin traducirlos en goles ante un " + rival + " bien organizado atrás.", "El empate no es una catástrofe, pero el equipo se exige más a sí mismo en estas circunstancias.", "El entrenador tendrá trabajo esta semana para encontrar el remate que le falta al equipo."],
        ["Un partido que pudo y debió ganar el " + club + ". Las ocasiones estuvieron, el gol no llegó en los momentos clave.", "El empate puede entenderse, pero la sensación de que se dejaron dos puntos es inevitable en el entorno.", "Habrá que analizar fríamente qué ocurrió en los metros finales."],
        ["El " + club + " y " + rival + " se repartieron los puntos en un duelo donde la intensidad superó a la calidad ofensiva.", "El equipo compitió, pero no tuvo la chispa necesaria para desequilibrar la balanza a su favor.", "Un resultado que no cierra puertas, pero tampoco las abre todo lo que se esperaba."],
      ];
      const cCL = [
        [rival + " fue superior en los momentos decisivos y el " + club + " no tuvo respuesta para ello.", "El equipo acusó las carencias en las transiciones defensivas, aspecto que el cuerpo técnico deberá corregir.", "La derrota obliga a reflexionar sobre el camino a seguir en los próximos compromisos."],
        ["El " + club + " no tuvo su mejor tarde. " + rival + " lo saboreó y fue más equipo en los momentos que más importaban.", "La derrota genera preguntas que deben responderse pronto si el equipo no quiere verse arrastrado por la inercia negativa.", "Toca mirar hacia adelante: la respuesta del grupo definirá mucho de lo que viene."],
        ["Una tarde para olvidar. El " + club + " no encontró argumentos ante un " + rival + " que aprovechó cada error.", "El análisis táctico apunta a problemas en la presión y en la salida de balón que ya son recurrentes.", "El técnico tendrá que tomar decisiones claras para que esto no vuelva a repetirse."],
        ["Derrota que duele en el marcador y en el juego. " + rival + " fue claramente mejor y el " + club + " lo sabe.", "La autocrítica debe ser el punto de partida para la reacción del equipo.", "En " + comp + ", cada punto perdido puede costar caro al final de la temporada."],
      ];
      const cCuerpo = res === "W" ? pick(cCW, seed + 122) : res === "D" ? pick(cCD, seed + 122) : pick(cCL, seed + 122);
      articles.push({ medio: "Crónica", sesgo: "analítico", tipo: "cronica", resultado: res, titular: cTit, entradilla: cEnt, cuerpo: cCuerpo, firma: pick(["A. Serrano · Crónica", "P. Llorente · Crónica", "Redacción deportes", "I. Mayoral · Crónica", "C. Fuentes · Crónica", "J. Rodríguez · Crónica"], seed + 133), recuadroStats: mkStats() });

      /* ---- GolDirecto ---- */
      const gTitW = [
        "¡VICTORIA! El " + club + (score ? " gana " + score : " gana") + " y no para",
        club + (score ? " " + score : "") + " ante " + rival + ": tres puntos de oro",
        "El " + club + " arrolla a " + rival + " y mira hacia arriba",
        (mvpName ? mvpName + " inspira al " : "El ") + club + " y suma otro triunfo en " + comp,
        "Sin piedad: el " + club + " despacha a " + rival + (score ? " (" + score + ")" : "") + " con autoridad",
        club + " gana y sigue: otra victoria para afirmarse en la tabla",
        "El " + club + " hace los deberes y pone de vuelta a " + rival + " en " + comp,
      ];
      const gTitD = [
        club + (score ? " " + score : "") + " ante " + rival + ": empate que sabe a poco",
        "El " + club + " no puede con " + rival + " y firma tablas",
        "Empate sin brillo entre " + club + " y " + rival + " en " + comp,
        "El " + club + " se deja dos puntos ante " + rival + " en un partido que controló",
        "Ni para unos ni para otros: " + club + " y " + rival + " firman tablas sin goles",
        "El gol no llega: " + club + " empata y mira la tabla con preocupación creciente",
        "Reparto equitativo que no convence a nadie en el camp del " + club,
      ];
      const gTitL = [
        club + (score ? " " + score : "") + " ante " + rival + ": derrota que duele",
        rival + " vence al " + club + " y complica la situación en " + comp,
        "El " + club + " pierde ante " + rival + " y enciende todas las alarmas",
        "Palo duro: el " + club + " cae " + locacion + " sin argumentos",
        "El " + club + " no da la talla: " + rival + " gana con comodidad " + locacion,
        "Otra derrota del " + club + ": la situación empieza a preocupar seriamente",
        "Tres puntos para " + rival + ": el " + club + " sigue sin encontrar su mejor versión",
      ];
      const gTit = res === "W" ? pick(gTitW, seed + 220) : res === "D" ? pick(gTitD, seed + 220) : pick(gTitL, seed + 220);

      const gEntW = pick([
        (mvpName ? mvpName + " brilla y " : "El equipo ") + "le da al " + club + " una victoria clave en " + comp + ".",
        "El " + club + " no falla y suma tres puntos vitales " + locacion + " ante un " + rival + " sin respuesta.",
        "Otro triunfo para el " + club + ", que sigue demostrando que este año tiene algo especial.",
        "Victoria clara del " + club + " ante un " + rival + " que no tuvo argumentos para competir de igual a igual.",
        "El " + club + " gana, convence y sigue hacia arriba. El mejor resumen posible de una gran noche.",
        (score ? club + " " + score + " " + rival + ": " : "") + "los tres puntos son del " + club + " y la clasificación lo refleja.",
      ], seed + 230);
      const gEntD = pick([
        "Los dos equipos se reparten los puntos " + locacion + ". El " + club + " tendrá que analizar una actuación por debajo de su nivel.",
        "Empate que no satisface al " + club + ", que acumula otro punto y mira la tabla con cautela.",
        "El " + club + " no encontró el gol ante " + rival + " y se lleva un punto que sabe a muy poco.",
        "Un punto que no convence a nadie. El " + club + " mereció más y no supo finiquitarlo cuando debía.",
        "Tablas en " + comp + ": " + club + " y " + rival + " no se hacen daño pero tampoco se ayudan.",
        "El " + club + " generó, dominó y no marcó. El fútbol puede ser así de cruel a veces.",
      ], seed + 230);
      const gEntL = pick([
        "Noche difícil para el " + club + ", superado por " + rival + " en un partido que nunca controló del todo.",
        "El " + club + " cae y se complica la vida en " + comp + ". " + rival + " fue mejor en todos los aspectos.",
        "Sin reacción y sin gol: el " + club + " suma otra derrota que genera preguntas difíciles de responder.",
        "El " + club + " no apareció cuando debía y " + rival + " lo aprovechó para llevarse los tres puntos sin mucho esfuerzo.",
        "Derrota clara del " + club + " que deja mucho que pensar de cara a los próximos partidos en " + comp + ".",
        rival + " dominó los aspectos clave y el " + club + " no supo plantarle cara en ningún momento del partido.",
      ], seed + 230);
      const gEnt = res === "W" ? gEntW : res === "D" ? gEntD : gEntL;
      articles.push({ medio: "GolDirecto", sesgo: "digital", tipo: "cronica", resultado: res, titular: gTit, entradilla: gEnt, cuerpo: [], firma: pick(["Redacción GD", "GolDirecto", "M.G. · GolDirecto", "Redacción · GolDirecto.es", "Staff GD · Redacción"], seed + 243), recuadroStats: mkStats() });

      /* ---- DXT24 ---- */
      const dxtChyronW = [
        club + " vence a " + rival + (score ? " (" + score + ")" : ""),
        "Victoria del " + club + " ante " + rival + " en " + comp,
        club + " gana y escala posiciones en la clasificación",
        "El " + club + " suma tres puntos clave " + locacion + " ante " + rival,
        (mvpName ? mvpName + " lidera la victoria del " : "El ") + club + " ante " + rival,
        "Triunfo del " + club + " que refuerza su posición en " + comp,
      ];
      const dxtChyronD = [
        club + " y " + rival + " empatan" + (score ? " (" + score + ")" : ""),
        "Reparto de puntos entre " + club + " y " + rival + " en " + comp,
        "El " + club + " frena ante " + rival + ": empate sin goles en " + comp,
        "Tablas en " + comp + ": " + club + " y " + rival + " no se hacen daño",
        "El " + club + " no puede con " + rival + " y se lleva solo un punto " + locacion,
      ];
      const dxtChyronL = [
        rival + " derrota al " + club + (score ? " (" + score + ")" : ""),
        club + " cae ante " + rival + " en " + comp,
        "El " + club + " pierde " + locacion + " y cede terreno en la clasificación",
        "Derrota del " + club + ": " + rival + " se impone con autoridad en " + comp,
        rival + " supera al " + club + " y suma tres puntos en " + comp,
      ];
      const dxtChyron = res === "W" ? pick(dxtChyronW, seed + 300) : res === "D" ? pick(dxtChyronD, seed + 300) : pick(dxtChyronL, seed + 300);

      const dxtTickerW = pick([
        (score ? club + " " + score + " " + rival : club + " gana " + locacion) + (mvpName ? "  ·  MVP: " + mvpName : "") + "  ·  " + comp + "  ·  Próxima jornada: el " + club + " busca continuar la racha  ·  Análisis en DXT24.com",
        club + " sigue en racha  ·  " + (score ? "Marcador: " + score : "Victoria " + locacion) + "  ·  " + (mvpName ? "Destacado: " + mvpName + "  ·  " : "") + comp + "  ·  Más información en DXT24.com",
        "Tres puntos para el " + club + "  ·  " + (score ? club + " " + score + " " + rival : "Victoria " + locacion) + "  ·  " + comp + "  ·  Toda la actualidad deportiva en DXT24.com",
      ], seed + 310);
      const dxtTickerD = pick([
        club + " " + (score || "0-0") + " " + rival + "  ·  Empate en " + comp + "  ·  El " + club + " deja escapar puntos " + locacion + "  ·  DXT24.com",
        "Tablas entre " + club + " y " + rival + "  ·  " + comp + "  ·  Sin goles en un duelo muy igualado  ·  Análisis completo en DXT24.com",
        "Empate sin goles: " + club + " y " + rival + "  ·  " + comp + "  ·  El " + club + " acumula un punto más  ·  DXT24.com",
      ], seed + 310);
      const dxtTickerL = pick([
        rival + " gana al " + club + (score ? " (" + score + ")" : "") + "  ·  Derrota del " + club + " en " + comp + "  ·  " + (mvpName ? mvpName + " no pudo evitarlo  ·  " : "") + "Reacción necesaria  ·  DXT24.com",
        "El " + club + " cae ante " + rival + "  ·  " + comp + "  ·  Derrota que genera debate en el entorno  ·  Todo en DXT24.com",
        "Tres puntos para " + rival + "  ·  El " + club + " pierde " + locacion + "  ·  " + comp + "  ·  Análisis en DXT24.com",
      ], seed + 310);
      const dxtTicker = res === "W" ? dxtTickerW : res === "D" ? dxtTickerD : dxtTickerL;
      articles.push({ medio: "DXT24", sesgo: "neutro", tipo: "cronica", resultado: res, titular: dxtChyron, entradilla: "", cuerpo: [], firma: "DXT24 · Deportes", recuadroStats: mkStats(), ticker: dxtTicker });

      /* ---- Zona Mixta ---- */
      const zmPregW = pick([
        "¿Puede el " + club + " pelear por el título?",
        "¿Es este " + club + " el mejor en años?",
        "¿Merece el técnico renovar tras esta victoria?",
        (mvpName ? "¿Está " + mvpName + " en su mejor momento de la carrera?" : "¿Llega el " + club + " en el mejor momento posible?"),
        "¿Por qué el " + club + " es tan difícil de batir " + locacion + "?",
        "¿Es este " + club + " candidato real o solo aprovecha el momento?",
        "¿Qué techo tiene este " + club + " si sigue jugando así?",
      ], seed + 400);
      const zmPregD = pick([
        "¿Le falta gol al " + club + "?",
        "¿Está el " + club + " por debajo de sus posibilidades reales?",
        "¿Es el empate un paso atrás o un punto ganado?",
        "¿Tiene el " + club + " un problema de mentalidad para cerrar partidos?",
        "¿Cuándo aprenderá el " + club + " a ganar los partidos que domina?",
        "¿Tiene solución la falta de puntería del " + club + "?",
        "¿El problema del " + club + " es táctico o es de actitud?",
      ], seed + 400);
      const zmPregL = pick([
        "¿Debe cambiar el técnico el sistema tras esta derrota?",
        "¿Está el " + club + " en crisis real?",
        "¿Cuántas derrotas más puede aguantar el entrenador?",
        "¿Es " + rival + " superior o es que el " + club + " no da la talla?",
        "¿Ha llegado el momento de tomar decisiones difíciles en el " + club + "?",
        "¿Qué falla en el " + club + " para no competir ante equipos como " + rival + "?",
        "¿Tiene el " + club + " plantilla para lo que se le pide en " + comp + "?",
      ], seed + 400);
      const zmPregunta = res === "W" ? zmPregW : res === "D" ? zmPregD : zmPregL;
      const zmPollSi = 45 + (h("poll:" + lastM.id) % 40);

      const zmOpsW = [
        [["Marta Ríos", "Cuando un equipo domina así, la calidad habla por sí sola. Esta victoria dice mucho."], ["J. Cana", "He visto plantillas mejores ganar menos. El mérito es del técnico, sin duda."]],
        [["Marta Ríos", "No me sorprende. Este equipo lleva semanas demostrando que está muy por encima del nivel medio."], ["J. Cana", (mvpName ? mvpName + " es el alma del equipo" : "El bloque es el alma del equipo") + ". Cuando aparece así, son imbatibles."]],
        [["Marta Ríos", "El " + club + " juega con una confianza brutal. Es el equipo del momento, sin discusión."], ["J. Cana", "A mí me gusta que ganar no les pesa. Salen al campo a dominar y lo hacen. Eso no es fácil."]],
        [["Marta Ríos", "Tres puntos que valen mucho más que tres puntos. El " + club + " está enviando un mensaje al resto."], ["J. Cana", "En el fútbol el que gana tiene razón. Y hoy el " + club + " ganó con toda la razón del mundo."]],
        [["Marta Ríos", "Lo que más me impresiona es la solidez. No te dan nada, y eso habla muy bien del técnico."], ["J. Cana", "Yo he jugado en equipos así. Cuando confías en el sistema, el sistema te da victorias. Así es esto."]],
      ];
      const zmOpsD = [
        [["Marta Ríos", "El empate no refleja el juego. Este equipo merece más y todos lo sabemos."], ["J. Cana", "Sin gol no hay paraíso. El " + club + " tiene que encontrar la solución arriba ya."]],
        [["Marta Ríos", "Dominas, metes, ganas. Si dominas, no metes y no ganas, algo falla. Es matemática básica."], ["J. Cana", "El " + club + " tiene jugadores para ganar estos partidos. El problema es de cabeza, no de calidad."]],
        [["Marta Ríos", "Hay que dar más crédito a " + rival + ". No es fácil salir de casa con un punto."], ["J. Cana", "Yo me quedo con que el " + club + " tuvo el partido. La eficacia es un problema que se trabaja en el campo."]],
        [["Marta Ríos", "Preocupante. El " + club + " lleva tiempo fallando estas oportunidades y eso acaba pasando factura."], ["J. Cana", "No exageraría. Un empate no es el fin del mundo. El problema es si se repite la semana que viene."]],
        [["Marta Ríos", "El " + club + " necesita un goleador que marque la diferencia. Sin eso, estos empates seguirán."], ["J. Cana", "He marcado muchos goles en mi carrera. Cuando el equipo no te genera ocasiones claras, es difícil para cualquiera."]],
      ];
      const zmOpsL = [
        [["Marta Ríos", "No hay excusas. El equipo no apareció en los momentos clave del partido."], ["J. Cana", "Hay que mirar al espejo. Esto no puede repetirse. El " + club + " tiene más nivel que esto."]],
        [["Marta Ríos", rival + " fue mejor. Y cuando el rival es mejor, hay que reconocerlo y aprender de ello."], ["J. Cana", "Me preocupa la falta de reacción. Un equipo grande reacciona. Este no lo hizo hoy."]],
        [["Marta Ríos", "El problema no es perder con " + rival + ". El problema es cómo se perdió y sin dar la cara."], ["J. Cana", "Yo no pondría el foco en el técnico aún. Pero si esto sigue, las preguntas son inevitables."]],
        [["Marta Ríos", "El " + club + " necesita respuestas urgentes. El equipo ha dado señales de alarma durante todo el partido."], ["J. Cana", "He jugado en vestuarios así. Lo que necesitan ahora es cerrar filas y no buscar culpables fuera."]],
        [["Marta Ríos", "La actitud me preocupa más que el resultado. Un equipo que no corre no puede ganar en " + comp + "."], ["J. Cana", "Yo he sufrido rachas así. La salida es el trabajo diario y la confianza del técnico en su gente."]],
      ];
      const zmOpiniones = res === "W" ? pick(zmOpsW, seed + 410) : res === "D" ? pick(zmOpsD, seed + 410) : pick(zmOpsL, seed + 410);
      articles.push({ medio: "Zona Mixta", sesgo: "debate", tipo: "cronica", resultado: res, titular: zmPregunta, entradilla: "", cuerpo: [], firma: "Zona Mixta · Canal 5", recuadroStats: null, pollSi: zmPollSi, opiniones: zmOpiniones });
    }

    /* ---- VESTUARIO (tensión política) ---- */
    if (pol && pol.tension >= 25) {
      const s2 = h("pol:" + (captain || "x") + pol.level);
      const capStr = captain || "el capitán";
      const crisis = pol.tension >= 60;
      const evt0text = pol.events[0] ? pol.events[0].text : "La gestión de los minutos genera tensión interna.";

      /* DIANA vestuario */
      const dVTitC = pick(["GUERRA EN EL VESTUARIO", "SE ACABA LA PACIENCIA", "EL VESTUARIO ESTALLA", "CAOS TOTAL", "TODOS CONTRA EL TÉCNICO", "¡SE ROMPE EL VESTUARIO!"], s2);
      const dVTitN = pick(["TENSIÓN EN EL VESTUARIO", "RUMORES DE CRISIS", "EL AMBIENTE SE ENRARECE", "ALGO SE CUECE", "¿HAY FISURAS EN EL GRUPO?", "SE HABLA DE MALESTAR"], s2);
      const dVEntC = pick([
        "La situación en el vestuario del " + club + " ha llegado a un punto de no retorno. Las decisiones técnicas con " + capStr + " encenden la mecha.",
        "El " + club + " vive horas convulsas. Fuentes internas confirman que el malestar ya es imposible de ocultar.",
        "El técnico del " + club + " enfrenta una rebelión silenciosa. " + capStr + " es el nombre en boca de todos.",
        "Crisis total en el " + club + ": el vestuario ha roto la barrera del respeto y nadie sabe cómo acabará esto.",
      ], s2 + 5);
      const dVEntN = pick([
        "El clima interno en el " + club + " no es el ideal. Fuentes del vestuario hablan de malestar creciente.",
        "No todo es paz en el vestuario del " + club + ". Hay tensiones que el equipo intenta mantener en la sombra.",
        "Rumores de descontento en el " + club + ". El ambiente entre jugadores y cuerpo técnico no es el mejor.",
        "Se habla de malestar en el " + club + ", aunque el club intenta restar importancia a la situación.",
      ], s2 + 5);
      const dVCuerpoC = pick([
        [evt0text, "La directiva sigue la situación de cerca y no descarta intervenir si las cosas siguen así.", "El próximo partido será una prueba de fuego para la cohesión del equipo."],
        [evt0text, "Los mensajes del técnico no convencen a todos. La fractura interna es real y visible.", "Si el equipo no gana el próximo partido, las preguntas serán inevitables para todos."],
        [evt0text, capStr + " no habla públicamente, pero su silencio dice mucho sobre la situación.", "En el fútbol, los problemas del vestuario terminan siempre afectando al campo."],
        [evt0text, "El entorno del club pide soluciones urgentes. La paciencia tiene un límite.", "Las próximas horas serán clave para saber si el técnico tiene el respaldo de la plantilla."],
      ], s2 + 15);
      const dVCuerpoN = pick([
        [evt0text, "El técnico resta importancia a los rumores y confía en la unidad del grupo.", "El próximo partido será una prueba de fuego para la cohesión del equipo."],
        [evt0text, "El " + club + " intenta mantener la calma, pero los rumores no desaparecen con facilidad.", "Con tensión o sin ella, el vestuario sabe que los resultados son la única medicina real."],
        [evt0text, "El entorno del " + club + " pide cautela y confía en que el grupo mantendrá la unidad.", "Nada nuevo bajo el sol: en todos los clubs hay momentos así en el transcurso de la temporada."],
        [evt0text, "La plantilla trabaja con normalidad, pero las fuentes cercanas al club admiten que el ambiente no es ideal.", "La mejor respuesta del vestuario siempre es la misma: rendir sobre el campo."],
      ], s2 + 15);
      articles.push({ medio: "DIANA", sesgo: "sensacionalista", tipo: "vestuario", titular: crisis ? dVTitC : dVTitN, entradilla: crisis ? dVEntC : dVEntN, cuerpo: crisis ? dVCuerpoC : dVCuerpoN, firma: pick(["J. Blanes · DIANA", "Redacción DIANA", "M. Ortega · DIANA", "Exclusiva DIANA"], s2 + 1), recuadroStats: null });

      /* Crónica vestuario */
      const cVTitC = pick([
        "El entorno del " + club + " pone bajo lupa las decisiones técnicas con los referentes del vestuario",
        "La gestión del grupo humano centra la preocupación interna del " + club + " en un momento delicado",
        "El " + club + " enfrenta su mayor reto extradeportivo de la temporada",
        "El " + club + " vive una semana complicada: el equilibrio del vestuario está en juego",
      ], s2 + 50);
      const cVTitN = pick([
        "El " + club + " gestiona las tensiones internas con discreción de cara al próximo partido",
        "Ruido en el " + club + ": la gestión de los minutos genera debate interno en el vestuario",
        "El " + club + " convive con la tensión y mantiene el foco en lo deportivo",
        "El " + club + " minimiza los rumores pero el ambiente interno requiere atención",
      ], s2 + 50);
      const cVEntC = pick([
        "La gestión de los líderes del vestuario centra el debate interno en el " + club + ". La situación requiere una respuesta a corto plazo.",
        "El " + club + " vive una de sus semanas más complicadas en lo extradeportivo. El equilibrio del grupo está en juego.",
        "Las decisiones técnicas sobre figuras clave han tensado el ambiente en el " + club + " hasta un punto preocupante.",
        "El " + club + " necesita atajar cuanto antes una situación que ya afecta al rendimiento colectivo.",
      ], s2 + 60);
      const cVEntN = pick([
        "No todo son buenas noticias en el " + club + ". Bajo la superficie hay tensiones que el cuerpo técnico gestiona con discreción.",
        "El " + club + " convive con el ruido interno sin perder la concentración en lo deportivo, aunque la situación requiere atención.",
        "La gestión del vestuario siempre es un factor clave en el éxito de un equipo. El " + club + " lo sabe y trabaja en silencio.",
        "Pequeñas grietas en la estructura interna del " + club + " que el cuerpo técnico trabaja para cerrar antes de que crezcan.",
      ], s2 + 60);
      const cVCuerpoC = pick([
        [evt0text, "El técnico deberá equilibrar las necesidades deportivas con la gestión del grupo humano.", "En clubes de este nivel, la cohesión del vestuario es tan determinante como el resultado sobre el campo."],
        [evt0text, "La situación exige una respuesta clara. El silencio no es una opción cuando el ambiente se deteriora.", "El entorno del club observa con atención cómo el técnico gestiona una de sus pruebas más difíciles."],
        [evt0text, "Las decisiones técnicas siempre tienen un coste emocional. La clave es que ese coste no se traslade al campo.", "El " + club + " tiene talento suficiente para superar este bache, pero necesita reencauzar el ambiente interno."],
        [evt0text, "La directiva está al tanto y espera que el técnico encuentre la fórmula para reconducir la situación.", "El fútbol tiene estos baches, pero ignorarlos nunca es la solución."],
      ], s2 + 70);
      const cVCuerpoN = pick([
        [evt0text, "El técnico deberá equilibrar las necesidades deportivas con la gestión del grupo humano.", "En clubes de este nivel, la cohesión del vestuario es tan determinante como el resultado sobre el campo."],
        [evt0text, "Un vestuario unido es la base de cualquier proyecto deportivo. El " + club + " trabaja para que así siga siendo.", "Los resultados sobre el campo son, a la larga, la mejor medicina para estas tensiones internas."],
        [evt0text, "El entrenador confía en su plantilla y en la capacidad del grupo para resolver sus diferencias internamente.", "El " + club + " ha demostrado este año que sabe gestionar la adversidad. Esto no será diferente."],
        [evt0text, "Nada que no se haya visto antes en clubes de este nivel. La clave es la respuesta colectiva en el campo.", "El técnico apuesta por el diálogo interno como vía para reconducir la situación."],
      ], s2 + 70);
      articles.push({ medio: "Crónica", sesgo: "analítico", tipo: "vestuario", titular: crisis ? cVTitC : cVTitN, entradilla: crisis ? cVEntC : cVEntN, cuerpo: crisis ? cVCuerpoC : cVCuerpoN, firma: pick(["P. Llorente · Crónica", "A. Serrano · Crónica", "I. Mayoral · Crónica", "C. Fuentes · Crónica"], s2 + 2), recuadroStats: null });

      /* GolDirecto vestuario */
      const gVTitC = pick([
        "🚨 Crisis en el " + club + ": el vestuario al límite por las decisiones técnicas",
        "⚡ Tensión máxima en el " + club + ": el grupo está roto por dentro",
        "🔥 El " + club + " arde por dentro: " + capStr + " en el ojo del huracán",
        "💥 El vestuario del " + club + " estalla: nadie lo niega ya",
      ], s2 + 80);
      const gVTitN = pick([
        "El " + club + " navega entre rumores de tensión interna",
        "Malestar en el vestuario del " + club + ": las decisiones técnicas generan debate",
        "Se habla de tensiones en el " + club + ": ¿hay un problema real?",
        "Ruido interno en el " + club + ": el ambiente no es el mejor, según fuentes",
      ], s2 + 80);
      const gVEntC = pick([
        evt0text,
        "Las fuentes internas del " + club + " hablan de un vestuario al límite. La situación se ha complicado en los últimos días.",
        "La tensión en el " + club + " ha alcanzado un punto crítico. El entorno del club pide soluciones inmediatas.",
        "Nadie en el " + club + " lo dice en voz alta, pero el problema existe y el campo lo acabará reflejando.",
      ], s2 + 90);
      const gVEntN = pick([
        evt0text,
        "El " + club + " intenta gestionar con discreción una situación que ya no es del todo un secreto.",
        "Rumores que no desaparecen en el entorno del " + club + ". ¿Hay humo sin fuego?",
        "El " + club + " pide calma, pero las fuentes cercanas a la plantilla hablan de un ambiente tenso.",
      ], s2 + 90);
      articles.push({ medio: "GolDirecto", sesgo: "digital", tipo: "vestuario", titular: crisis ? gVTitC : gVTitN, entradilla: crisis ? gVEntC : gVEntN, cuerpo: [], firma: pick(["Redacción GD", "GolDirecto", "M.G. · GolDirecto", "Staff GD"], s2 + 3), recuadroStats: null });

      /* DXT24 vestuario */
      const dxtVTitC = pick([
        "Tensión interna en el " + club + ": el vestuario vive su peor momento de la temporada",
        "Crisis extradeportiva en el " + club + ": el técnico bajo presión creciente",
        "El " + club + " gestiona una grave situación interna que ya no puede ignorar",
        "Alarma en el " + club + ": el vestuario ha llegado a un punto de no retorno",
      ], s2 + 100);
      const dxtVTitN = pick([
        "El " + club + " gestiona rumores de tensión interna con discreción",
        "Tensión moderada en el entorno del " + club + ": el club pide calma y trabajo",
        "El " + club + " convive con el ruido extradeportivo sin perder el foco competitivo",
        "Pequeñas tensiones internas en el " + club + " que el cuerpo técnico trabaja para resolver",
      ], s2 + 100);
      const dxtVTicker = pick([
        evt0text + "  ·  " + club + "  ·  Más información en DXT24.com",
        club + " · Situación interna  ·  " + evt0text + "  ·  Análisis en DXT24.com",
        "Informe interno: " + club + "  ·  " + evt0text + "  ·  DXT24.com",
      ], s2 + 110);
      articles.push({ medio: "DXT24", sesgo: "neutro", tipo: "vestuario", titular: crisis ? dxtVTitC : dxtVTitN, entradilla: "", cuerpo: [], firma: "DXT24 · Deportes", recuadroStats: null, ticker: dxtVTicker });

      /* Zona Mixta vestuario */
      const zmPregVC = pick(["¿Debe la directiva intervenir ya?", "¿Puede el técnico sobrevivir a esta crisis?", "¿Es irreversible la situación en el " + club + "?", "¿Ha perdido el técnico el vestuario?", "¿Se acerca el final de este proyecto?"], s2 + 5);
      const zmPregVN = pick(["¿Cuánto puede aguantar el vestuario?", "¿Tiene razón el técnico en sus decisiones?", "¿Es " + capStr + " parte del problema?", "¿Exagera la prensa o hay problema real en el " + club + "?", "¿Debe el técnico cambiar su forma de gestionar el grupo?"], s2 + 5);
      const zmPollVest = 38 + (h("pollv:" + (captain || "x")) % 44);
      const zmOpsVC = pick([
        [["Marta Ríos", "Esto ya no es un vestuario, es un polvorín. Alguien tiene que poner orden, y rápido."], ["J. Cana", "He vivido vestuarios así. Si no se ataja rápido, el problema crece y llega al campo."]],
        [["Marta Ríos", "La figura de " + capStr + " es clave aquí. Si el capitán no tira del carro, nadie lo hará."], ["J. Cana", "He visto vestuarios estallar por menos. La clave es cortar esto de raíz antes de que sea tarde."]],
        [["Marta Ríos", "El técnico tiene que dar la cara. Un vestuario roto es su responsabilidad, no de los jugadores."], ["J. Cana", "Yo he sido jugador. Cuando el técnico pierde el grupo, lo nota el campo. Aquí ya se nota."]],
        [["Marta Ríos", "La directiva no puede mirar para otro lado. Esto requiere una intervención clara y urgente."], ["J. Cana", "El problema con los vestuarios rotos es que en el campo se ve todo. Y eso no tiene solución rápida."]],
      ], s2 + 20);
      const zmOpsVN = pick([
        [["Marta Ríos", "Hay tensión, sí, pero no hay que dramatizar. El fútbol tiene estas cosas y se supera."], ["J. Cana", "El técnico tiene que hablar con los jugadores. Las cosas se resuelven dentro, no en la prensa."]],
        [["Marta Ríos", "Tampoco hay que hacer una montaña de esto. Los vestuarios tienen sus dinámicas y hay que respetarlas."], ["J. Cana", "Mientras el resultado acompañe, estas tensiones se gestionan. El problema es cuando no acompaña."]],
        [["Marta Ríos", "El " + club + " necesita liderazgo ahora mismo. Y ese liderazgo tiene que venir desde el vestuario."], ["J. Cana", "Lo que me preocupa no es la tensión en sí, sino si terminará afectando al rendimiento colectivo."]],
        [["Marta Ríos", "Cada vestuario tiene sus momentos. Lo importante es cómo el técnico los gestiona y los cierra."], ["J. Cana", "Yo he pasado por esto. Un partido ganado lo soluciona todo. El campo siempre tiene la última palabra."]],
      ], s2 + 20);
      articles.push({ medio: "Zona Mixta", sesgo: "debate", tipo: "vestuario", titular: crisis ? zmPregVC : zmPregVN, entradilla: "", cuerpo: [], firma: "Zona Mixta · Canal 5", recuadroStats: null, pollSi: zmPollVest, opiniones: crisis ? zmOpsVC : zmOpsVN });
    }

    /* ---- RACHA (sequía o buena racha goleadora) ---- */
    if (sp && sp.currentDrought >= 2) {
      const n = sp.currentDrought;
      const s3 = h("drought:" + n + club);
      const dRTit = n >= 4
        ? pick(["¡EL ATAQUE SE MUERE!", "¡SIN GOL Y SIN IDEAS!", "¿DÓNDE ESTÁ EL GOL?", "ALARMA MÁXIMA ARRIBA", "¡INENCONTRABLE!", "¡" + n + " PARTIDOS SIN MARCAR!"], s3)
        : pick(["SEQUÍA GOLEADORA: ¿CUÁNDO ACABA?", "¡QUÉ CRISIS ARRIBA!", "SIN PUNTERÍA Y SIN GOLES", "EL GOL HA DESAPARECIDO", "¡NECESITAMOS UN GOL!", "TRES PARTIDOS Y CERO GOLES: INACEPTABLE"], s3);
      const dREnt = pick([
        "El " + club + " lleva " + n + " partidos sin ver portería. Una estadística alarmante que el técnico debe resolver ya.",
        n + " encuentros seguidos sin marcar: el " + club + " tiene un problema serio arriba que no encuentra solución.",
        "La falta de gol del " + club + " lleva " + n + " partidos siendo el tema principal del entorno. ¿Cuándo acaba esto?",
        n + " jornadas y cero goles del " + club + ". La paciencia de la afición tiene un límite.",
      ], s3 + 10);
      const dRCuerpo = pick([
        ["El equipo ha generado ocasiones, pero la puntería ha desaparecido en el momento más inoportuno.", "La sequía de " + n + " encuentros sin marcar es la peor del curso y levanta ampollas entre la afición.", "¿Cambio de sistema? El análisis es urgente."],
        ["Generar sin marcar es el resumen de los últimos " + n + " partidos del " + club + ". El problema es mental tanto como técnico.", "La afición empieza a perder la paciencia con un ataque que no encuentra el camino al gol.", "El técnico tiene trabajo: hace falta una solución antes de que esta racha condicione la temporada."],
        ["Sin gol durante " + n + " partidos, el " + club + " necesita urgentemente reencontrar su mejor versión ofensiva.", "Los defensas rivales han descifrado el código del equipo. Toca reinventarse.", "La presión aumenta: el próximo partido es ya una final para el ataque."],
        ["El gol no llega y la clasificación lo empieza a notar. " + n + " partidos en blanco es demasiado en cualquier competición.", "Más allá de los números, la falta de confianza arriba se ha convertido en el mayor enemigo del " + club + ".", "El equipo necesita un gol, pero sobre todo necesita encontrar la mentalidad ganadora que le falta."],
      ], s3 + 20);
      articles.push({ medio: "DIANA", sesgo: "sensacionalista", tipo: "racha", titular: dRTit, entradilla: dREnt, cuerpo: dRCuerpo, firma: pick(["Redacción DIANA", "J. Blanes · DIANA", "M. Ortega · DIANA", "F. Sánchez · DIANA"], s3 + 30), recuadroStats: null });

      const gRTit = pick([
        n + " partidos sin marcar: el " + club + " busca el gol perdido",
        "La sequía goleadora del " + club + " ya dura " + n + " partidos: ¿dónde está el gol?",
        "Alarma ofensiva en el " + club + ": " + n + " jornadas seguidas sin anotar",
        "El " + club + " no marca desde hace " + n + " partidos: SOS ofensivo",
        n + " en blanco: el " + club + " no ve portería y el debate crece",
      ], s3 + 40);
      const gREnt = pick([
        "La sequía ofensiva del " + club + " se convierte en el tema del día. ¿Cuándo llegará el próximo tanto?",
        n + " partidos seguidos sin gol: el " + club + " tiene un problema que ya no puede ignorar.",
        "El " + club + " lleva " + n + " encuentros sin marcar. La situación exige soluciones inmediatas.",
        "La estadística no perdona: " + n + " jornadas en blanco y el debate sobre el ataque del " + club + " está servido.",
      ], s3 + 50);
      articles.push({ medio: "GolDirecto", sesgo: "digital", tipo: "racha", titular: gRTit, entradilla: gREnt, cuerpo: [], firma: pick(["Redacción GD", "GolDirecto", "M.G. · GolDirecto", "Staff GD"], s3 + 60), recuadroStats: null });

    } else if (sp && sp.currentScoringStreak >= 3) {
      const n = sp.currentScoringStreak;
      const s3 = h("streak:" + n + club);
      const dSTit = n >= 5
        ? pick(["¡IMPARABLE! " + n + " PARTIDOS MARCANDO", "¡GOLESCOPIO ACTIVADO!", "¡NO PARAN DE MARCAR!", "¡" + n + " SEGUIDOS CON GOL! ¡BRUTAL!"], s3)
        : pick(["EN ESTADO DE GRACIA: " + n + " SEGUIDOS CON GOL", "¡EL GOLEADOR DESPERTÓ!", "RACHA BRUTAL: " + n + " CON GOL", "VAYA RACHA ARRIBA: " + n + " PARTIDOS MARCANDO"], s3);
      const dSEnt = pick([
        "El " + club + " lleva " + n + " partidos consecutivos marcando. Una racha que ilusiona y pone al equipo en el punto de mira.",
        n + " partidos seguidos anotando: el ataque del " + club + " vive su mejor momento de la temporada.",
        "Sin frenar. El " + club + " marca en cada partido que juega y el rival de turno no encuentra el antídoto.",
        "La racha ofensiva del " + club + " ya son " + n + " partidos. Un dato que debería asustar a sus rivales.",
      ], s3 + 10);
      const dSCuerpo = pick([
        ["El ataque del " + club + " vive un momento dulce que el equipo debe aprovechar para seguir escalando posiciones.", "Con " + n + " encuentros seguidos viendo portería, la confianza ofensiva está por las nubes.", "Mantener esta dinámica sería un auténtico regalo de cara al tramo decisivo de la temporada."],
        ["Cuando el gol llega con tanta facilidad, todo fluye mejor. El " + club + " lo sabe y se alimenta de ello.", "La racha goleadora ha coincidido con los mejores resultados del equipo. No es casualidad.", "El reto ahora es mantener la pólvora seca y no confiarse: los rivales se adaptan rápido."],
        ["Los números no mienten: " + n + " partidos marcando es una rareza que hay que celebrar y aprovechar.", "El equipo ha encontrado una dinámica ofensiva que le hace casi imparable por el momento.", "La clave está en seguir con los pies en el suelo: la racha se mantiene con trabajo, no con euforia."],
        ["Es la racha del año. El " + club + " lleva " + n + " partidos marcando y la afición sueña con algo grande.", "Los goles son confianza y la confianza genera más goles. El " + club + " está en ese ciclo virtuoso.", "Ojalá dure: cuando un equipo marca en todos sus partidos, el vestuario vuela."],
      ], s3 + 20);
      articles.push({ medio: "DIANA", sesgo: "sensacionalista", tipo: "racha", titular: dSTit, entradilla: dSEnt, cuerpo: dSCuerpo, firma: pick(["Redacción DIANA", "J. Blanes · DIANA", "M. Ortega · DIANA", "F. Sánchez · DIANA"], s3 + 30), recuadroStats: null });
    }

    if (!articles.length) return null;
    return { articles, club, season: season.label };
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
    const continental = FC.data.isContinental(m.competition) || FC.data.isInternational(m.competition);
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
    else if (FC.data.isDomesticCup(m.competition)) stake = "copa";
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
     VESTUARIO — generador de sucesos del club (vida de plantilla).
     A diferencia de las crónicas (derivadas y efímeras), un suceso se
     PERSISTE en c.incidents para construir un timeline "a lo largo del
     tiempo". El motor elige categoría (sin repetir la última), escoge
     jugadores REALES según el tipo y rellena la plantilla con _fillT
     (anti-repetición por ordinal, escapa con U.esc). Reutiliza hashCab.
     ============================================================ */
  FC.incidents = (function () {
    // need: nº de jugadores que requiere · pick: criterio de selección ·
    // club: usa un club externo (rumor de mercado) · tone/icon/label: UI.
    const CATS = [
      { key: "conflicto",     need: 2, tone: "bad",     icon: "flame",  label: "Tensión en el vestuario" },
      { key: "bajon_minutos", need: 1, tone: "bad",     icon: "cloud",  label: "Malestar", pick: "suplente" },
      { key: "liderazgo",     need: 1, tone: "good",    icon: "medal",  label: "Liderazgo", pick: "veterano" },
      { key: "promesa",       need: 1, tone: "good",    icon: "sprout", label: "Cantera", pick: "joven" },
      { key: "interes",       need: 1, tone: "neutral", icon: "swap",   label: "Mercado", pick: "estrella", club: true },
      { key: "vinculo",       need: 2, tone: "good",    icon: "star",   label: "Vestuario" },
      { key: "disciplina",    need: 1, tone: "bad",     icon: "flag",   label: "Disciplina" },
      { key: "prensa",        need: 1, tone: "neutral", icon: "news",   label: "Prensa" },
      { key: "ambiente",      need: 0, tone: "good",    icon: "target", label: "Ambiente" },
      { key: "racha_forma",   need: 1, tone: "good",    icon: "flame",  label: "Estado de forma", pick: "estrella" },
      { key: "renovacion",    need: 1, tone: "good",    icon: "check",  label: "Renovación" },
    ];
    const num = (x) => Number(x) || 0;
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    // Subconjunto candidato según criterio (tercio superior/inferior por edad
    // u OVR) para que la selección sea plausible; el jugador final se sortea al
    // azar dentro de ese subconjunto (un suceso es una acción puntual, no una
    // derivación: el sorteo real da variedad como en la vida del vestuario).
    function pickPlayer(players, criterion, exclude) {
      const avail = players.filter(p => p && p.name && !exclude.has(p.id));
      if (!avail.length) return null;
      const third = (arr) => arr.slice(0, Math.max(1, Math.ceil(arr.length / 3)));
      let pool = avail;
      if (criterion === "veterano") { const v = avail.filter(p => num(p.age) >= 30); pool = v.length ? v : third(avail.slice().sort((a, b) => num(b.age) - num(a.age))); }
      else if (criterion === "joven") { const v = avail.filter(p => p.fromYouth || (num(p.age) > 0 && num(p.age) <= 21)); pool = v.length ? v : third(avail.slice().sort((a, b) => num(a.age) - num(b.age))); }
      else if (criterion === "estrella") pool = third(avail.slice().sort((a, b) => num(b.ovr) - num(a.ovr)));
      else if (criterion === "suplente") pool = third(avail.slice().sort((a, b) => num(a.ovr) - num(b.ovr)));
      return rnd(pool);
    }
    // Genera UN suceso plausible (sin persistir). null si no hay datos mínimos.
    function generate(c) {
      if (!c) return null;
      const players = (c.players || []).filter(p => p && p.name);
      const ordinal = (c.incidents || []).length;
      const lastType = ordinal ? c.incidents[ordinal - 1].type : "";
      let cands = CATS.filter(cat => players.length >= cat.need);
      if (!cands.length) return null;
      const noRepeat = cands.filter(cat => cat.key !== lastType);
      if (noRepeat.length) cands = noRepeat;
      const cat = rnd(cands);
      const exclude = new Set();
      const chosen = [];
      for (let i = 0; i < cat.need; i++) {
        const p = pickPlayer(players, cat.pick, exclude);
        if (!p) break;
        exclude.add(p.id); chosen.push(p);
      }
      if (chosen.length < cat.need) return null;
      const vars = { team: c.clubName, pos: chosen[0] ? (chosen[0].position || "") : "" };
      if (chosen[0]) vars.p1 = chosen[0].name;
      if (chosen[1]) vars.p2 = chosen[1].name;
      if (cat.club) {
        const clubs = (FC.data.RUMOR_CLUBS || []).filter(x => _norm(x) !== _norm(c.clubName));
        vars.club = clubs.length ? rnd(clubs) : "otro club";
      }
      const title = _fillT((FC.data.VESTUARIO || {})[cat.key], "ves:" + cat.key, vars, ordinal);
      if (!title) return null;
      // Fecha narrativa: la del último partido jugado de la temporada (fecha
      // ficticia coherente con la carrera); "" si aún no se ha jugado.
      const season = S.currentSeason(c);
      const played = S.userMatches(c, season ? season.id : undefined).filter(m => S.isPlayed(m))
        .slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      return {
        type: cat.key, tone: cat.tone, icon: cat.icon, label: cat.label, title,
        players: chosen.map(p => ({ id: p.id, name: p.name })),
        seasonId: season ? season.id : null, date: (played[0] && played[0].date) || "", createdAt: Date.now(),
      };
    }
    return { generate, CATS };
  })();

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
