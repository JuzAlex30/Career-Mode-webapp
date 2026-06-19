/* ============================================================
   app.js — bootstrap, navegación, chrome, tema.
   ============================================================ */
(function () {
  const { util: U, store: S, router: R, views: V, ui: UI } = FC;
  const App = {};
  const ROUTES = ["dashboard","matches","standings","squad","development","youth","finance","challenges","story","viajes","history","hall","scouting","tools","cloud","settings","live"];
  const TITLES = { dashboard:"Panel", matches:"Partidos", standings:"Clasificación", squad:"Plantilla", development:"Desarrollo", youth:"Academia", finance:"Finanzas", challenges:"Retos y logros", story:"Narrativa", viajes:"Viajes", history:"Historia", hall:"Salón de la fama", scouting:"Scouting", tools:"Generador", cloud:"Comunidad", settings:"Ajustes", live:"Modo en vivo" };

  // register routes (guard: require active career)
  ROUTES.forEach(name => R.register(name, () => {
    if (!S.getActiveCareer()) { V.onboarding(); return; }
    try { V[name](); } catch (e) { console.error(e); FC.ui.toast("Error al renderizar la vista", "err"); }
    App.refreshChrome();
    window.scrollTo(0, 0);
  }));

  App.refresh = () => R.render();

  App.refreshChrome = () => {
    const c = S.getActiveCareer();
    // career chip
    const cs = document.getElementById("careerSwitch");
    if (c) {
      cs.innerHTML = `<button class="career-chip" id="careerChip">
        <span class="career-badge" style="background:${U.safeColor(c.badgeColor, U.colorFor(c.clubName))}">${U.initials(c.clubName)}</span>
        <span class="cc-meta"><b>${U.esc(c.clubName)}</b><small>${U.esc((S.currentSeason(c)||{}).label||"")}</small></span>
        <span class="ni-icon cc-caret" data-icon="caret"></span></button>`;
      U.hydrateIcons(cs);
      document.getElementById("careerChip").addEventListener("click", () => careerSwitcher());
    } else cs.innerHTML = "";
    // active nav
    const cur = R.current || "dashboard";
    U.els("#mainNav .nav-item, .nav-bottom .nav-item").forEach(a => a.classList.toggle("active", a.dataset.route === cur));
    const tt = document.getElementById("topbarTitle"); if (tt) tt.textContent = TITLES[cur] || "Carrera FC";
    document.body.classList.remove("nav-open");
    // Modo en vivo: pantalla a pantalla completa (oculta chrome y bloquea scroll de fondo).
    document.body.classList.toggle("live-active", cur === "live");
  };

  function careerSwitcher() {
    const c = S.getActiveCareer();
    const list = S.careersList();
    UI.openModal("Cambiar de carrera", `
      <div class="list">${list.map(cc => `<button class="list-row" data-pick="${cc.id}" style="width:100%;text-align:left;background:none;border:none;border-bottom:1px solid var(--line);cursor:pointer">
        <span class="career-badge" style="background:${U.safeColor(cc.badgeColor, U.colorFor(cc.clubName))}">${U.initials(cc.clubName)}</span>
        <span class="lr-main"><b>${U.esc(cc.clubName)}</b><small>${U.esc(cc.leagueName)} · ${(cc.seasons||[]).length} temp.</small></span>
        ${cc.id === c.id ? '<span class="chip accent">Activa</span>' : ''}</button>`).join("")}</div>`,
      `<button class="btn btn-ghost" data-close>Cerrar</button><button class="btn btn-primary" id="cs-new"><span class="ni-icon" data-icon="plus"></span> Nueva carrera</button>`);
    document.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => {
      S.setActiveCareer(b.dataset.pick); UI.closeModal(); R.go("dashboard"); App.refreshChrome();
    }));
    document.getElementById("cs-new").addEventListener("click", () => { UI.closeModal(); V.onboarding(); });
  }

  App.onAchievements = (newly) => {
    newly.forEach((a, i) => setTimeout(() => UI.toast(`🏅 ¡Logro desbloqueado: ${a.name}!`, "ok"), i * 400));
  };

  function applyTheme(t) {
    document.body.dataset.theme = t;
    const icon = document.querySelector("#themeToggle .ni-icon");
    if (icon) { icon.dataset.done = ""; icon.dataset.icon = t === "dark" ? "moon" : "sun"; U.hydrateIcons(document.getElementById("themeToggle")); }
  }
  // Acento personalizado: sobrescribe --accent inline en body (gana sobre el tema).
  App.applyAccent = (color) => {
    if (color) document.body.style.setProperty("--accent", color);
    else document.body.style.removeProperty("--accent");
  };

  // Enlace público de carrera compartida: #share=<base64 {c,u,k}>. Lo consume una
  // sola vez (limpia el hash con replaceState para no disparar el router).
  function parseShareHash() {
    const h = location.hash || "";
    if (h.indexOf("#share=") !== 0) return null;
    let out = null;
    try { let raw = decodeURIComponent(h.slice(7)).replace(/-/g, "+").replace(/_/g, "/"); while (raw.length % 4) raw += "="; const p = JSON.parse(atob(raw)); if (p && p.c) out = { code: p.c, cfg: (p.u && p.k) ? { url: p.u, anonKey: p.k } : null }; } catch (e) { }
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { location.hash = ""; }
    return out;
  }
  function openShare(s) { if (s && FC.ui && FC.ui.openSharedByCode) FC.ui.openSharedByCode(s.code, s.cfg); }

  // Enlace público de perfil de manager: #profile=<base64 {o,u,k}>. Igual que share.
  function parseProfileHash() {
    const h = location.hash || "";
    if (h.indexOf("#profile=") !== 0) return null;
    let out = null;
    try { let raw = decodeURIComponent(h.slice(9)).replace(/-/g, "+").replace(/_/g, "/"); while (raw.length % 4) raw += "="; const p = JSON.parse(atob(raw)); if (p && p.o) out = { ownerId: p.o, cfg: (p.u && p.k) ? { url: p.u, anonKey: p.k } : null }; } catch (e) { }
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { location.hash = ""; }
    return out;
  }
  function openProfile(p) { if (p && FC.ui && FC.ui.openProfileModal) FC.ui.openProfileModal(p.ownerId, p.cfg); }

  // Magic link de Supabase: tras clic en email redirige con #access_token=... en el hash.
  async function handleMagicLinkHash() {
    const h = location.hash || "";
    if (h.indexOf("access_token=") === -1) return false;
    let handled = false;
    try {
      if (FC.cloud && FC.cloud.isConfigured()) {
        handled = FC.cloud.handleMagicLink(h);
        if (handled) await FC.cloud.fetchUser();
      }
    } catch (e) { }
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { location.hash = ""; }
    return handled;
  }

  App.boot = async () => {
    S.load();
    applyTheme(S.settings().theme || "dark");
    App.applyAccent(S.settings().accent);
    const onboardHost = document.getElementById("onboardHost");
    if (onboardHost) onboardHost.remove();
    const magicLink = await handleMagicLinkHash();
    const share = parseShareHash();
    const profile = parseProfileHash();
    if (!S.getActiveCareer()) {
      V.onboarding();
      openShare(share);
      openProfile(profile);
      if (magicLink) FC.ui.toast("¡Sesión iniciada! Ve a Comunidad.", "ok");
      return;
    }
    document.getElementById("app").style.display = "";
    App.refreshChrome();
    R.render();
    openShare(share);
    openProfile(profile);
    if (magicLink) FC.ui.toast("¡Sesión iniciada! Ve a Comunidad.", "ok");
  };

  // ---- wiring (once) ----
  function wire() {
    U.hydrateIcons(document);
    // nav
    U.els("#mainNav .nav-item, .nav-bottom .nav-item").forEach(a => {
      if (!a.dataset.route) return;
      a.tabIndex = 0;
      a.setAttribute("role", "button");
      a.addEventListener("click", () => R.go(a.dataset.route));
      a.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); R.go(a.dataset.route); } });
    });
    // theme
    document.getElementById("themeToggle").addEventListener("click", () => {
      const t = document.body.dataset.theme === "dark" ? "light" : "dark";
      S.settings().theme = t; S.save(); applyTheme(t);
    });
    // mobile
    document.getElementById("menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
    document.getElementById("topbarAddMatch").addEventListener("click", () => {
      const c = S.getActiveCareer(); if (c) UI.openMatchModal(c); else V.onboarding();
    });
    // re-render on store change
    let pending = false;
    S.onChange(() => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; if (S.getActiveCareer()) { R.render(); App.refreshChrome(); } }); });
    // keyboard: Esc cierra el modal; si no hay modal y estás en Modo en vivo, sale a Panel.
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const ov = document.getElementById("modalOverlay");
      if (ov && !ov.hidden) { UI.closeModal(); return; }
      if (R.current === "live") R.go("dashboard");
    });
  }

  FC.app = App;
  document.addEventListener("DOMContentLoaded", () => { wire(); App.boot(); });
})();
