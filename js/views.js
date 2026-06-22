/* ============================================================
   views.js — UI y vistas. Expone FC.ui y FC.views
   ============================================================ */
(function () {
  const { util: U, store: S, charts: CH, data: D } = FC;
  const content = () => document.getElementById("content");

  /* ============================================================
     UI helpers
     ============================================================ */
  const UI = {};
  UI.mount = (html) => {
    const c = content();
    c.innerHTML = html;
    U.hydrateIcons(c);
    return c;
  };
  UI.toast = (msg, type) => {
    const stack = document.getElementById("toastStack");
    const t = U.h("div", { class: "toast " + (type || "") }, []);
    t.innerHTML = `<span class="ni-icon" data-icon="${type === "err" ? "close" : type === "ok" ? "check" : "bell"}"></span><span>${U.esc(msg)}</span>`;
    U.hydrateIcons(t);
    stack.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(8px)"; setTimeout(() => t.remove(), 250); }, 2600);
  };
  UI.achievementToast = function(a) {
    const TIER_COLOR = { bronze: "#cd7f32", silver: "#a0aec0", gold: "#ffd02e", legend: "#a855f7" };
    const color = TIER_COLOR[a.tier] || "var(--accent)";
    const tierLabel = (FC.data && FC.data.TIER_LABEL || {})[a.tier] || (a.tier || "");
    let wrap = document.getElementById("achToastWrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.id = "achToastWrap"; wrap.className = "ach-toast-wrap"; document.body.appendChild(wrap); }
    const t = document.createElement("div");
    t.className = "ach-toast" + (a.tier === "legend" ? " legend-tier" : "");
    t.style.setProperty("--ach-color", color);
    t.innerHTML = `<span class="ach-emoji">${a.emoji || "🏅"}</span><div class="ach-body"><div class="ach-tier-chip">${U.esc(tierLabel)}</div><div class="ach-header">¡Logro desbloqueado!</div><div class="ach-name">${U.esc(a.name)}</div><div class="ach-desc">${U.esc(a.desc || "")}</div></div><div class="ach-bar"></div>`;
    wrap.appendChild(t);
    const dismiss = () => { t.style.opacity = "0"; t.style.transform = "translateX(50px)"; setTimeout(() => t.remove(), 260); };
    t.addEventListener("click", dismiss);
    setTimeout(dismiss, 4800);
  };
  UI.closeModal = () => {
    const ov = document.getElementById("modalOverlay");
    ov.hidden = true; document.getElementById("modal").innerHTML = "";
  };
  UI.openModal = (title, bodyHTML, footHTML, opts) => {
    opts = opts || {};
    const ov = document.getElementById("modalOverlay");
    const m = document.getElementById("modal");
    m.className = "modal" + (opts.lg ? " lg" : "");
    m.innerHTML = `
      <div class="modal-head"><h2>${U.esc(title)}</h2><button class="icon-btn sm" data-close><span class="ni-icon" data-icon="close"></span></button></div>
      <div class="modal-body">${bodyHTML}</div>
      ${footHTML ? `<div class="modal-foot">${footHTML}</div>` : ""}`;
    ov.hidden = false;
    U.hydrateIcons(m);
    m.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", UI.closeModal));
    ov.onclick = (e) => { if (e.target === ov) UI.closeModal(); };
    return m;
  };
  UI.confirm = (msg, onYes, danger) => {
    UI.openModal("Confirmar", `<p style="margin:0">${U.esc(msg)}</p>`,
      `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="cfYes">Sí, continuar</button>`);
    document.getElementById("cfYes").addEventListener("click", () => { UI.closeModal(); onYes(); });
  };
  // Tarjeta compartible en PNG (canvas, sin dependencias). spec: {brand,title,subtitle,difficulty?,lines[],chips[],footer,filename}
  UI.downloadCard = (spec) => {
    spec = spec || {};
    const W = 1080, H = 1080, PAD = 80;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    const ACC = "#00e1a0", TEXT = "#eaf1f8", DIM = "#93a6bd";
    const font = (sz, w) => `${w ? w + " " : ""}${sz}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
    const wrap = (text, maxW, sz, w) => { ctx.font = font(sz, w); const words = String(text == null ? "" : text).split(/\s+/); const out = []; let cur = ""; words.forEach(word => { const t = cur ? cur + " " + word : word; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = word; } else cur = t; }); if (cur) out.push(cur); return out; };
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#0c131c"); bg.addColorStop(1, "#0a0f15");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W - 140, 140, 0, W - 140, 140, 560);
    glow.addColorStop(0, "rgba(0,225,160,0.18)"); glow.addColorStop(1, "rgba(0,225,160,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2; rr(PAD / 2, PAD / 2, W - PAD, H - PAD, 40); ctx.stroke();
    const maxW = W - PAD * 2;
    let y = PAD + 36;
    ctx.fillStyle = ACC; ctx.font = font(30, "bold"); ctx.fillText(String(spec.brand || "Carrera FC").toUpperCase(), PAD, y); y += 80;
    ctx.fillStyle = TEXT; wrap(spec.title, maxW, 96, "800").slice(0, 3).forEach(l => { ctx.font = font(96, "800"); ctx.fillText(l, PAD, y); y += 108; });
    if (spec.subtitle) { ctx.fillStyle = DIM; ctx.font = font(42); ctx.fillText(String(spec.subtitle), PAD, y + 4); y += 72; }
    y += 16; ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(PAD + 130, y); ctx.stroke(); y += 58;
    if (spec.difficulty) { ctx.fillStyle = DIM; ctx.font = font(28, "bold"); ctx.fillText("DIFICULTAD", PAD, y); ctx.fillStyle = ACC; ctx.font = font(50); ctx.fillText("★".repeat(spec.difficulty) + "☆".repeat(Math.max(0, 5 - spec.difficulty)), PAD + 240, y + 8); y += 80; }
    ctx.fillStyle = TEXT; (spec.lines || []).forEach(line => wrap(line, maxW, 42).forEach(l => { if (y > H - PAD - 110) return; ctx.font = font(42); ctx.fillText(l, PAD, y); y += 58; }));
    if ((spec.chips || []).length) { y += 18; let cx = PAD, cy = y; ctx.font = font(32, "600"); spec.chips.forEach(ch => { const cw = ctx.measureText(ch).width + 48; if (cx + cw > W - PAD) { cx = PAD; cy += 70; } ctx.fillStyle = "rgba(0,225,160,0.14)"; rr(cx, cy - 40, cw, 56, 28); ctx.fill(); ctx.fillStyle = ACC; ctx.font = font(32, "600"); ctx.fillText(ch, cx + 24, cy); cx += cw + 16; }); }
    ctx.fillStyle = DIM; ctx.font = font(30); ctx.fillText(String(spec.footer || "Mi Modo Carrera · Carrera FC"), PAD, H - PAD + 8);
    const fn = (String(spec.filename || "carrera-fc").replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "carrera-fc") + ".png";
    const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = fn; a.click();
    UI.toast("Imagen descargada", "ok");
  };
  // Visor read-only de una carrera compartida (datos vienen de la nube → escapar todo)
  UI.sharedCardHTML = (row) => {
    const s = (row && row.summary) || {};
    const top = s.topScorer ? U.esc(s.topScorer.name) + " · " + (s.topScorer.goals || 0) + " goles" : "—";
    const trophies = s.titlesList || [];
    return `<div class="flex gap center mb"><div class="career-badge" style="background:${U.safeColor(null, U.colorFor(s.club||""))}">${U.initials(s.club||"?")}</div>
        <div><b style="font-size:18px">${U.esc(s.club||"Club")}</b><br><small class="faint">${U.esc(s.league||"")}${s.manager?" · "+U.esc(s.manager):""}</small></div></div>
      <div class="grid cols-4 keep-2">
        ${statTile("Títulos", s.titles||0, "")}
        ${statTile("Temporadas", s.seasons||0, "")}
        ${statTile("% Victorias", (s.winPct||0)+"%", (s.played||0)+" partidos")}
        ${statTile("Mejor temp.", (s.bestPoints||0)+" pts", s.bestSeason?U.esc(s.bestSeason.label):"")}
      </div>
      <div class="section-title">Palmarés</div>
      ${trophies.length ? `<div class="cc-rules">${trophies.map(t=>`<span class="chip gold">🏆 ${U.esc(t.competition||"")}${t.season?" "+U.esc(t.season):""}</span>`).join("")}</div>` : `<p class="faint">Sin títulos todavía.</p>`}
      <div class="section-title">Estrella del club</div>
      <p style="margin:0">⚽ Máximo goleador: <b>${top}</b></p>
      <p class="faint" style="font-size:12px;margin-top:16px">Carrera compartida desde Carrera FC · solo lectura.</p>`;
  };
  UI.openSharedByCode = async (code, cfgOverride) => {
    if (!code) { UI.toast("Indica un código", "err"); return; }
    try {
      const row = await FC.cloud.getShared(code, cfgOverride);
      if (!row) { UI.toast("No se encontró esa carrera compartida", "err"); return; }
      UI.openSharedModal(row, cfgOverride);
    } catch (e) { UI.toast(e.message || "Error al cargar", "err"); }
  };
  // Visor unificado: tarjeta + perfil del manager + comentarios. Lo usan el ranking, el código y los enlaces.
  UI.openSharedModal = (row, cfg) => {
    if (!row) return;
    const shareId = row.share_id || "", ownerId = row.owner_id || "";
    const extra = ownerId ? `<div style="margin-top:14px"><button class="btn btn-ghost btn-sm" id="sc-profile"><span class="ni-icon" data-icon="cloud"></span> Ver más carreras de este manager</button></div>` : "";
    const body = UI.sharedCardHTML(row) + extra + `<div class="section-title">Comentarios</div><div id="sc-comments"><p class="faint">Cargando…</p></div>`;
    UI.openModal("Carrera compartida", body, '<button class="btn btn-ghost" data-close>Cerrar</button>', { lg: true });
    const modal = document.getElementById("modal");
    const pb = modal && modal.querySelector("#sc-profile");
    if (pb) pb.addEventListener("click", () => UI.openProfileModal(ownerId, cfg));
    if (shareId) UI.renderComments(shareId, cfg);
  };
  // Render (+wiring) de comentarios dentro del visor. body remoto → escapar SIEMPRE con U.esc.
  UI.renderComments = async (shareId, cfg) => {
    const box = document.getElementById("sc-comments");
    if (!box) return;
    const sameProject = !cfg || (FC.cloud.config().url === cfg.url);
    const canComment = FC.cloud.isLoggedIn() && sameProject;
    let list = [];
    try { list = (await FC.cloud.getComments(shareId, cfg)) || []; }
    catch (e) { box.innerHTML = `<p class="faint">No se pudieron cargar los comentarios.</p>`; return; }
    const myId = FC.cloud.myOwnerId();
    const listHTML = list.length
      ? `<div class="list">${list.map(c => `<div class="list-row"><div class="lr-main"><b>${U.esc(c.author || "Anónimo")}</b> <small class="faint">${U.fmtDate(c.created_at)}</small><div style="margin-top:4px;white-space:pre-wrap;word-break:break-word">${U.esc(c.body || "")}</div></div>${(myId && c.author_id === myId) ? `<button class="btn btn-ghost btn-sm" data-delc="${U.esc(c.id)}">Borrar</button>` : ""}</div>`).join("")}</div>`
      : `<p class="faint">Sé el primero en comentar.</p>`;
    const formHTML = canComment
      ? `<div class="field" style="margin-top:12px"><textarea id="sc-input" rows="2" maxlength="500" placeholder="Escribe un comentario…"></textarea></div><button class="btn btn-primary btn-sm" id="sc-send"><span class="ni-icon" data-icon="check"></span> Comentar</button>`
      : `<p class="faint" style="font-size:12px;margin-top:12px">${FC.cloud.isLoggedIn() ? "Solo puedes comentar en carreras de tu propia comunidad." : "Inicia sesión en Comunidad para comentar."}</p>`;
    box.innerHTML = listHTML + formHTML;
    U.hydrateIcons(box);
    box.querySelectorAll("[data-delc]").forEach(b => b.addEventListener("click", () => UI.confirm("¿Borrar tu comentario?", async () => {
      try { await FC.cloud.deleteComment(b.dataset.delc); UI.renderComments(shareId, cfg); } catch (e) { UI.toast(e.message || "Error", "err"); }
    }, true)));
    const send = document.getElementById("sc-send");
    if (send) send.addEventListener("click", async () => {
      const val = (document.getElementById("sc-input") || {}).value || "";
      if (!val.trim()) { UI.toast("Escribe un comentario", "err"); return; }
      send.disabled = true;
      try { await FC.cloud.addComment(shareId, val); UI.renderComments(shareId, cfg); }
      catch (e) { UI.toast(e.message || "Error", "err"); send.disabled = false; }
    });
  };
  // Perfil público: todas las carreras publicadas de un manager (por owner_id).
  UI.openProfileModal = async (ownerId, cfg) => {
    if (!ownerId) return;
    UI.openModal("Perfil del manager", `<div id="pf-body"><p class="faint">Cargando…</p></div>`, '<button class="btn btn-ghost" data-close>Cerrar</button>', { lg: true });
    let rows = [];
    try { rows = (await FC.cloud.profileCareers(ownerId, cfg)) || []; }
    catch (e) { const b = document.getElementById("pf-body"); if (b) b.innerHTML = `<p class="faint">No se pudo cargar el perfil.</p>`; return; }
    const box = document.getElementById("pf-body");
    if (!box) return;
    if (!rows.length) { box.innerHTML = `<p class="faint">Este manager aún no tiene carreras publicadas.</p>`; return; }
    const manager = (rows[0].manager || "").trim();
    const totalTitles = rows.reduce((a, r) => a + (Number(r.titles) || 0), 0);
    box.innerHTML = `<div class="flex gap center mb"><div><b style="font-size:18px">${U.esc(manager || "Manager")}</b><br><small class="faint">${rows.length} carrera(s) · ${totalTitles} título(s) en total</small></div></div>
      <div class="list">${rows.map((r, i) => `<div class="list-row" data-pf="${i}" style="cursor:pointer"><span class="career-badge" style="background:${U.safeColor(null, U.colorFor(r.club || ""))}">${U.initials(r.club || "?")}</span><div class="lr-main"><b>${U.esc(r.club || "Club")}</b><small class="faint">${U.esc(r.league || "")} · ${Number(r.titles) || 0} títulos</small></div></div>`).join("")}</div>`;
    U.hydrateIcons(box);
    box.querySelectorAll("[data-pf]").forEach(el => el.addEventListener("click", () => UI.openSharedModal(rows[+el.dataset.pf], cfg)));
  };
  // Tarjeta compacta del feed de actividad. row de C.activityFeed; datos remotos escapados con U.esc.
  UI.activityCardHTML = (row, i) => {
    const s = row.summary || {};
    const titles = s.titlesList || [];
    const chips = [];
    titles.slice(0, 3).forEach(t => chips.push(`<span class="chip gold">🏆 ${U.esc(t.competition || "")}${t.season ? " " + U.esc(t.season) : ""}</span>`));
    if (titles.length > 3) chips.push(`<span class="chip">+${titles.length - 3}</span>`);
    if (Number(s.bestPoints) > 0) chips.push(`<span class="chip">📈 ${Number(s.bestPoints) || 0} pts</span>`);
    if (s.topScorer && s.topScorer.name) chips.push(`<span class="chip">⚽ ${U.esc(s.topScorer.name)} · ${Number(s.topScorer.goals) || 0}</span>`);
    const who = (s.manager && String(s.manager).trim()) ? U.esc(s.manager) : "Un mánager";
    const club = U.esc(row.club || "su club");
    const headline = (Number(row.titles) || 0) > 0 ? `${who} presume de <b>${club}</b>` : `${who} empieza su aventura con <b>${club}</b>`;
    return `<div class="list-row" data-feed="${i}" style="cursor:pointer;align-items:flex-start">
      <span class="career-badge" style="background:${U.safeColor(null, U.colorFor(row.club || ""))}">${U.initials(row.club || "?")}</span>
      <div class="lr-main"><div>${headline}</div>
        <small class="faint">${U.esc(row.league || "")}${row.created_at ? " · " + U.fmtDate(row.created_at) : ""}</small>
        ${chips.length ? `<div class="cc-rules" style="margin-top:6px">${chips.join("")}</div>` : ""}
      </div></div>`;
  };
  FC.ui = UI;

  /* ============================================================
     ONBOARDING
     ============================================================ */
  function leagueOptions(sel) {
    return D.LEAGUES.map(l => `<option value="${l.id}" ${l.id === sel ? "selected" : ""}>${U.esc(l.name)}${l.country !== "—" ? " · " + U.esc(l.country) : ""}</option>`).join("");
  }
  FC.views = {};
  FC.views.onboarding = function () {
    document.getElementById("app").style.display = "none";
    let host = document.getElementById("onboardHost");
    if (!host) { host = U.h("div", { id: "onboardHost" }, []); document.body.appendChild(host); }
    const thisYear = new Date().getFullYear();
    host.innerHTML = `
      <div class="hero">
        <div class="hero-card card">
          <div class="hero-logo"><div class="brand-mark">CF</div></div>
          <h1>Crea tu carrera</h1>
          <p class="lead">Tu historia del Modo Carrera, guardada para siempre. Empecemos por tu club.</p>
          <div class="field">
            <label>Nombre del club <span class="faint">(tu equipo)</span></label>
            <input type="text" id="ob-club" placeholder="p.ej. Real Oviedo" autofocus />
          </div>
          <div class="field-row">
            <div class="field"><label>Liga</label><select id="ob-league">${leagueOptions("esp-laliga")}</select></div>
            <div class="field"><label>Temporada inicial</label><input type="number" id="ob-year" value="${thisYear}" min="2000" max="2100" /></div>
          </div>
          <div class="field" id="ob-custom-wrap" hidden>
            <label>Equipos de tu liga <span class="faint">(separa por comas)</span></label>
            <textarea id="ob-teams" placeholder="Equipo 1, Equipo 2, Equipo 3..."></textarea>
          </div>
          <div class="field"><label>Tu nombre de mánager <span class="faint">(opcional)</span></label><input type="text" id="ob-manager" placeholder="Mánager" /></div>
          <button class="btn btn-primary btn-lg btn-block" id="ob-create">Empezar carrera</button>
          <p class="faint text-c" style="margin:14px 0 0;font-size:12px">Tus datos se guardan en este navegador. Podrás exportarlos cuando quieras.</p>
        </div>
      </div>`;
    const leagueSel = host.querySelector("#ob-league");
    const customWrap = host.querySelector("#ob-custom-wrap");
    leagueSel.addEventListener("change", () => { customWrap.hidden = leagueSel.value !== "custom"; });
    host.querySelector("#ob-create").addEventListener("click", () => {
      const club = host.querySelector("#ob-club").value.trim();
      if (!club) { UI.toast("Escribe el nombre de tu club", "err"); return; }
      const lid = leagueSel.value;
      const league = D.LEAGUES.find(l => l.id === lid);
      let teams = league ? league.teams.slice() : [];
      if (lid === "custom") teams = host.querySelector("#ob-teams").value.split(",").map(s => s.trim()).filter(Boolean);
      if (!teams.includes(club)) teams.unshift(club);
      S.createCareer({
        name: club, clubName: club, leagueId: lid, leagueName: league ? league.name : "Liga",
        country: league ? league.country : "", teams,
        managerName: host.querySelector("#ob-manager").value.trim(),
        startYear: Number(host.querySelector("#ob-year").value) || new Date().getFullYear(),
      });
      host.remove();
      document.getElementById("app").style.display = "";
      UI.toast("¡Carrera creada! A por la gloria ⚽", "ok");
      FC.router.go("dashboard");
    });
  };

  /* ============================================================
     Partido (modal compartido)
     ============================================================ */
  function playersDatalist(c, id) {
    return `<datalist id="${id}">${(c.players || []).map(p => `<option value="${U.esc(p.name)}">`).join("")}</datalist>`;
  }
  // ---- Alineación visual: helpers ----
  function _pitchLayout(formationName, slots) {
    const nums = formationName.split("-").map(Number).filter(n => n > 0);
    const lines = [[{ pos: slots[0] || "GK", i: 0 }]];
    let idx = 1;
    nums.forEach(n => {
      const line = [];
      for (let j = 0; j < n && idx < slots.length; j++, idx++) line.push({ pos: slots[idx], i: idx });
      if (line.length) lines.push(line);
    });
    const totalLines = lines.length;
    const result = [];
    lines.forEach((line, li) => {
      const y = totalLines < 2 ? 140 : Math.round(248 - (li / (totalLines - 1)) * 216);
      line.forEach(({ pos, i }, xi) => {
        result.push({ pos, i, x: Math.round((xi + 1) / (line.length + 1) * 200), y });
      });
    });
    return result;
  }

  function _pitchSvgEl(formationName, slots, lineupArr) {
    const positions = _pitchLayout(formationName, slots);
    const circles = positions.map(({ pos, i, x, y }) => {
      const name = ((lineupArr || [])[i] || {}).name || "";
      const has = !!name;
      const label = name ? name.split(/\s+/).pop().slice(0, 8) : "";
      return `<g class="pitch-slot" data-slot="${i}">
        <circle cx="${x}" cy="${y}" r="14" fill="${has ? "rgba(0,212,170,0.88)" : "rgba(255,255,255,0.12)"}" stroke="${has ? "#00d4aa" : "rgba(255,255,255,0.28)"}" stroke-width="1.5"/>
        <text x="${x}" y="${y - 2}" text-anchor="middle" font-size="6.5" fill="${has ? "#001a15" : "rgba(255,255,255,0.5)"}" font-weight="700" font-family="system-ui">${U.esc(pos)}</text>
        <text x="${x}" y="${y + 9}" text-anchor="middle" font-size="${label.length > 6 ? "6" : "7.5"}" fill="${has ? "#001a15" : "rgba(255,255,255,0.28)"}" font-weight="${has ? "700" : "400"}" font-family="system-ui">${U.esc(label)}</text>
      </g>`;
    }).join("");
    return `<svg id="m-pitch-svg" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:200px;display:block;margin:0 auto;border-radius:4px;flex-shrink:0">
      <rect width="200" height="280" fill="#1a4a12"/>
      <rect x="6" y="6" width="188" height="268" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
      <line x1="6" y1="140" x2="194" y2="140" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
      <circle cx="100" cy="140" r="27" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
      <circle cx="100" cy="140" r="2" fill="rgba(255,255,255,0.2)"/>
      <rect x="54" y="6" width="92" height="48" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
      <rect x="54" y="226" width="92" height="48" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
      <rect x="78" y="6" width="44" height="18" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
      <rect x="78" y="256" width="44" height="18" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
      <circle cx="100" cy="60" r="2.5" fill="rgba(255,255,255,0.14)"/>
      <circle cx="100" cy="220" r="2.5" fill="rgba(255,255,255,0.14)"/>
      ${circles}
    </svg>`;
  }

  function _pitchUI(formationName, slots, lineupArr, dlId) {
    const inputs = slots.map((pos, i) => {
      const lu = (lineupArr || [])[i] || {};
      return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        <span class="chip" style="min-width:36px;text-align:center;font-size:10px;flex-shrink:0">${U.esc(pos)}</span>
        <input type="text" class="lu-inp" data-slot="${i}" ${dlId ? `list="${dlId}"` : ""} value="${U.esc(lu.name || "")}" placeholder="Jugador" style="flex:1;padding:3px 8px;font-size:13px"/>
      </div>`;
    }).join("");
    return `<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start">
      ${_pitchSvgEl(formationName, slots, lineupArr)}
      <div style="flex:1;min-width:150px;padding-top:2px">${inputs}</div>
    </div>`;
  }

  function _syncPitchSlot(slotIdx, name) {
    const svg = document.getElementById("m-pitch-svg");
    if (!svg) return;
    const g = svg.querySelector(`.pitch-slot[data-slot="${slotIdx}"]`);
    if (!g) return;
    const circle = g.querySelector("circle");
    const texts = [...g.querySelectorAll("text")];
    const has = !!name;
    const label = name ? name.split(/\s+/).pop().slice(0, 8) : "";
    if (circle) {
      circle.setAttribute("fill", has ? "rgba(0,212,170,0.88)" : "rgba(255,255,255,0.12)");
      circle.setAttribute("stroke", has ? "#00d4aa" : "rgba(255,255,255,0.28)");
    }
    if (texts[0]) texts[0].setAttribute("fill", has ? "#001a15" : "rgba(255,255,255,0.5)");
    if (texts[1]) {
      texts[1].textContent = label;
      texts[1].setAttribute("fill", has ? "#001a15" : "rgba(255,255,255,0.28)");
      texts[1].setAttribute("font-weight", has ? "700" : "400");
      texts[1].setAttribute("font-size", label.length > 6 ? "6" : "7.5");
    }
  }

  UI.openMatchModal = function (c, existing, opts) {
    opts = opts || {};
    const season = S.currentSeason(c);
    const teams = (season.teams || []).filter(t => t !== c.clubName);
    const ex = existing || {};
    // Prefill de goles al editar: derivar del marcador real (perspectiva del usuario)
    // si el caller no pasó _gf/_ga. NO se muta el partido (se usan variables locales).
    let gfVal = ex._gf, gaVal = ex._ga;
    if ((gfVal == null || gaVal == null) && existing && S.isPlayed(existing)) {
      const g = S.userGoals(c, existing);
      if (g) { if (gfVal == null) gfVal = g.for; if (gaVal == null) gaVal = g.against; }
    }
    const isHome = ex.home ? ex.home === c.clubName : true;
    const oppName = ex.home ? (ex.home === c.clubName ? ex.away : ex.home) : "";
    // Modo: "result" (con marcador) o "schedule" (partido futuro sin jugar).
    let mode = opts.mode || (existing && !S.isPlayed(existing) ? "schedule" : "result");
    const dlId = "dl-players";
    const body = `
      ${playersDatalist(c, dlId)}
      <div class="field"><label>Tipo de partido</label>
        <div class="seg" id="m-mode">
          <button type="button" data-m="result" class="${mode==="result"?"active":""}">Resultado</button>
          <button type="button" data-m="schedule" class="${mode==="schedule"?"active":""}">Próximo (sin jugar)</button>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Competición</label><select id="m-comp">${D.COMPETITIONS.map(x => `<option ${x === (ex.competition||"Liga") ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        <div class="field"><label>Jornada / ronda</label><input type="text" id="m-round" value="${U.esc(ex.round||"")}" placeholder="p.ej. J5 / Octavos"/></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Fecha</label><input type="date" id="m-date" value="${ex.date||""}"/></div>
        <div class="field"><label>Condición</label>
          <div class="seg" id="m-venue">
            <button type="button" data-v="home" class="${isHome?"active":""}">Local</button>
            <button type="button" data-v="away" class="${!isHome?"active":""}">Visitante</button>
          </div>
        </div>
      </div>
      <div class="field"><label>Rival</label>
        <input type="text" id="m-opp" list="dl-teams" value="${U.esc(oppName)}" placeholder="Nombre del rival"/>
        <datalist id="dl-teams">${teams.map(t => `<option value="${U.esc(t)}">`).join("")}</datalist>
      </div>
      <div id="m-result-fields"${mode==="schedule"?" hidden":""}>
      <div class="field-row">
        <div class="field"><label>Goles ${U.esc(c.clubName)}</label><input type="number" id="m-gf" min="0" value="${gfVal!=null?gfVal:""}"/></div>
        <div class="field"><label>Goles rival</label><input type="number" id="m-ga" min="0" value="${gaVal!=null?gaVal:""}"/></div>
      </div>
      <div class="section-title" style="margin:8px 2px">Goleadores de tu equipo</div>
      <div id="m-scorers"></div>
      <button type="button" class="btn btn-ghost btn-sm" id="m-add-scorer"><span class="ni-icon" data-icon="plus"></span> Añadir gol</button>
      <div class="field" style="margin-top:16px"><label>Jugador del partido (MOTM)</label><input type="text" id="m-motm" list="${dlId}" value="${U.esc(ex.motm||"")}" placeholder="Nombre"/></div>
      <div class="field" style="margin-top:12px"><label>Formación utilizada (opcional)</label>
        <select id="m-formation"><option value="">— Sin especificar —</option>
          ${Object.keys(FC.data.FORMATIONS||{}).map(f => `<option value="${U.esc(f)}"${ex.formation===f?' selected':''}>▶ ${U.esc(f)}</option>`).join("")}
        </select></div>
      <details id="m-lineup-det" style="margin-top:16px"${(ex.lineup&&ex.lineup.length&&ex.formation)?' open':''}>
        <summary style="cursor:pointer;user-select:none;font-weight:600;padding:6px 0;color:var(--accent)">＋ Alineación (opcional)</summary>
        <div id="m-lineup-body" style="margin-top:10px">
          <p class="faint" style="font-size:13px">Selecciona primero una formación.</p>
        </div>
      </details>
      <details style="margin-top:16px">
        <summary style="cursor:pointer;user-select:none;font-weight:600;padding:6px 0;color:var(--accent)">＋ Valoraciones de jugadores (opcional)</summary>
        <div style="margin-top:8px">
          <div style="display:flex;gap:4px;font-size:11px;color:var(--text2);padding:0 2px 6px;font-weight:600">
            <span style="flex:3">Jugador</span><span style="flex:2">Nota (1-10)</span><span style="flex:1.5">Minutos</span><span style="width:34px"></span>
          </div>
          <div id="m-ratings"></div>
          <button type="button" class="btn btn-ghost btn-sm" id="m-add-rating"><span class="ni-icon" data-icon="plus"></span> Añadir jugador</button>
        </div>
      </details>
      ${(function(){
        const st = ex.stats || {};
        const v = (x) => (x == null ? "" : x);
        const pair = (key, label, step) => {
          const p = Array.isArray(st[key]) ? st[key] : [];
          return `<div class="field-row">
            <div class="field"><label>${label} · tú</label><input type="number" min="0" ${step?`step="${step}"`:""} id="ms-${key}-f" value="${v(p[0])}"/></div>
            <div class="field"><label>${label} · rival</label><input type="number" min="0" ${step?`step="${step}"`:""} id="ms-${key}-a" value="${v(p[1])}"/></div>
          </div>`;
        };
        return `<details style="margin-top:16px">
          <summary style="cursor:pointer;user-select:none;font-weight:600;padding:6px 0;color:var(--accent)">＋ Estadísticas avanzadas (opcional)</summary>
          <div style="margin-top:6px">
            <div class="field-row"><div class="field"><label>Posesión tuya (%)</label><input type="number" min="0" max="100" id="ms-poss" value="${v(st.possession)}"/></div><div class="field"></div></div>
            ${pair("shots","Remates")}
            ${pair("sot","Tiros a puerta")}
            ${pair("xg","xG","0.1")}
            ${pair("corners","Córners")}
            ${pair("fouls","Faltas")}
            ${pair("yellow","Amarillas")}
            ${pair("red","Rojas")}
            ${pair("pens","Penaltis")}
          </div>
        </details>`;
      })()}
      </div>
    `;
    const title = mode === "schedule"
      ? (existing ? "Editar próximo partido" : "Programar partido")
      : (existing && !S.isPlayed(existing) ? "Registrar resultado" : existing ? "Editar partido" : "Registrar partido");
    UI.openModal(title, body,
      `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="m-save"><span class="ni-icon" data-icon="check"></span> Guardar</button>`, { lg: true });

    const scorersBox = document.getElementById("m-scorers");
    function addScorerRow(g) {
      g = g || {};
      const row = U.h("div", { class: "field-row three", style: "margin-bottom:8px" }, []);
      row.innerHTML = `
        <input type="text" list="${dlId}" placeholder="Goleador" value="${U.esc(g.scorer||"")}"/>
        <input type="text" list="${dlId}" placeholder="Asistente (opcional)" value="${U.esc(g.assist||"")}"/>
        <button type="button" class="btn btn-ghost btn-sm" title="Quitar"><span class="ni-icon" data-icon="trash"></span></button>`;
      row.querySelector("button").addEventListener("click", () => row.remove());
      scorersBox.appendChild(row);
      U.hydrateIcons(row);
    }
    (ex._scorers || []).forEach(addScorerRow);
    document.getElementById("m-add-scorer").addEventListener("click", () => addScorerRow());

    const ratingsBox = document.getElementById("m-ratings");
    function addRatingRow(r) {
      r = r || {};
      const row = U.h("div", { style: "display:flex;gap:6px;margin-bottom:6px;align-items:center" }, []);
      row.innerHTML = `
        <input type="text" list="${dlId}" placeholder="Jugador" value="${U.esc(r.name||"")}" style="flex:3;min-width:0"/>
        <input type="number" min="1" max="10" step="0.1" placeholder="—" value="${r.rating!=null?r.rating:""}" style="flex:2;min-width:0" title="Nota (1-10)"/>
        <input type="number" min="0" max="120" step="1" placeholder="90" value="${r.minutes!=null?r.minutes:""}" style="flex:1.5;min-width:0" title="Minutos jugados"/>
        <button type="button" class="btn btn-ghost btn-sm" style="flex:none;width:34px;padding:0" title="Quitar"><span class="ni-icon" data-icon="trash"></span></button>`;
      row.querySelector("button").addEventListener("click", () => row.remove());
      ratingsBox.appendChild(row);
      U.hydrateIcons(row);
    }
    (ex.ratings || []).forEach(addRatingRow);
    document.getElementById("m-add-rating").addEventListener("click", () => addRatingRow());

    let venue = isHome ? "home" : "away";
    document.querySelectorAll("#m-venue button").forEach(b => b.addEventListener("click", () => {
      venue = b.dataset.v;
      document.querySelectorAll("#m-venue button").forEach(x => x.classList.toggle("active", x === b));
    }));

    const resultFields = document.getElementById("m-result-fields");
    document.querySelectorAll("#m-mode button").forEach(b => b.addEventListener("click", () => {
      mode = b.dataset.m;
      document.querySelectorAll("#m-mode button").forEach(x => x.classList.toggle("active", x === b));
      if (resultFields) resultFields.hidden = (mode === "schedule");
    }));

    const lineupBody = document.getElementById("m-lineup-body");
    const formEl = document.getElementById("m-formation");
    function renderLineupPitch() {
      const f = formEl.value;
      const slots = f ? ((FC.data.FORMATIONS || {})[f] || []) : [];
      if (!slots.length) { lineupBody.innerHTML = '<p class="faint" style="font-size:13px">Selecciona primero una formación.</p>'; return; }
      const current = slots.map((_, i) => (ex.lineup || [])[i] || {});
      lineupBody.innerHTML = _pitchUI(f, slots, current, dlId);
      lineupBody.querySelectorAll(".lu-inp").forEach(inp => {
        inp.addEventListener("input", () => _syncPitchSlot(Number(inp.dataset.slot), inp.value.trim()));
      });
    }
    formEl.addEventListener("change", renderLineupPitch);
    if (formEl.value) renderLineupPitch();

    document.getElementById("m-save").addEventListener("click", () => {
      const opp = document.getElementById("m-opp").value.trim();
      if (!opp) { UI.toast("Indica el rival", "err"); return; }
      const home = venue === "home" ? c.clubName : opp;
      const away = venue === "home" ? opp : c.clubName;
      const base = {
        seasonId: season.id, competition: document.getElementById("m-comp").value,
        round: document.getElementById("m-round").value.trim(),
        date: document.getElementById("m-date").value, home, away,
      };
      if (mode === "schedule") {
        // Partido futuro: sin marcador ni eventos. Si editamos uno ya jugado y lo
        // pasamos a "Próximo", se limpia su resultado (Object.assign copia undefined).
        const data = Object.assign({}, base, { homeScore: undefined, awayScore: undefined, events: undefined, motm: "", motmId: undefined, stats: undefined, ratings: undefined, formation: undefined, lineup: undefined });
        if (existing) S.updateMatch(c, existing.id, data); else S.addMatch(c, data);
        UI.closeModal();
        UI.toast(existing ? "Partido actualizado" : "Partido programado 📅", "ok");
        return;
      }
      const gf = document.getElementById("m-gf").value, ga = document.getElementById("m-ga").value;
      if (gf === "" || ga === "") { UI.toast("Completa el marcador", "err"); return; }
      const gfN = Number(gf), gaN = Number(ga);
      if (!Number.isFinite(gfN) || !Number.isFinite(gaN) || gfN < 0 || gaN < 0) { UI.toast("El marcador debe ser un número de 0 o más", "err"); return; }
      const homeScore = venue === "home" ? gfN : gaN;
      const awayScore = venue === "home" ? gaN : gfN;
      const events = [];
      U.els("#m-scorers .field-row").forEach(row => {
        const ins = row.querySelectorAll("input");
        const sc = ins[0].value.trim(), as = ins[1].value.trim();
        if (sc) { const p = (c.players||[]).find(x => x.name === sc); events.push({ type:"goal", player: sc, playerId: p && p.id }); }
        if (as) { const p = (c.players||[]).find(x => x.name === as); events.push({ type:"assist", player: as, playerId: p && p.id }); }
      });
      const motm = document.getElementById("m-motm").value.trim();
      const motmP = (c.players||[]).find(x => x.name === motm);
      const formation = document.getElementById("m-formation").value.trim() || undefined;
      // stats avanzadas (opcional, centradas en tu equipo). Vacío total → no se guarda.
      const num = (id) => { const el = document.getElementById(id); const val = el ? el.value.trim() : ""; if (val === "") return null; const n = Number(val); return (Number.isFinite(n) && n >= 0) ? n : null; };
      const pairOf = (key) => { const f = num("ms-" + key + "-f"), a = num("ms-" + key + "-a"); return (f == null && a == null) ? null : [f == null ? 0 : f, a == null ? 0 : a]; };
      const stats = {};
      const poss = num("ms-poss"); if (poss != null) stats.possession = poss;
      ["shots", "sot", "xg", "corners", "fouls", "yellow", "red", "pens"].forEach(k => { const p = pairOf(k); if (p) stats[k] = p; });
      const ratings = [];
      U.els("#m-ratings > div").forEach(row => {
        const ins = row.querySelectorAll("input");
        const name = ins[0].value.trim();
        if (!name) return;
        const rVal = ins[1].value.trim(), mVal = ins[2].value.trim();
        if (!rVal && !mVal) return;
        const entry = { name };
        const pMatch = (c.players||[]).find(x => x.name === name);
        if (pMatch) entry.playerId = pMatch.id;
        if (rVal !== "") { const n = Number(rVal); if (Number.isFinite(n) && n >= 1 && n <= 10) entry.rating = n; }
        if (mVal !== "") { const n = Number(mVal); if (Number.isFinite(n) && n >= 0) entry.minutes = n; }
        ratings.push(entry);
      });
      const luInps = document.querySelectorAll(".lu-inp");
      const lineup = luInps.length ? (() => {
        const slots = formation ? ((FC.data.FORMATIONS || {})[formation] || []) : [];
        const arr = [...luInps].map((inp, i) => {
          const name = inp.value.trim();
          if (!name) return null;
          const pos = slots[i] || "";
          const pMatch = (c.players||[]).find(x => x.name === name);
          return Object.assign({ pos, name }, pMatch ? { playerId: pMatch.id } : {});
        });
        return arr.some(Boolean) ? arr : undefined;
      })() : undefined;
      const data = Object.assign({}, base, {
        homeScore, awayScore,
        events, motm: motm || "", motmId: motmP && motmP.id,
        stats: Object.keys(stats).length ? stats : undefined,
        ratings: ratings.length ? ratings : undefined,
        formation,
        lineup,
      });
      if (existing) S.updateMatch(c, existing.id, data); else S.addMatch(c, data);
      UI.closeModal();
      UI.toast(existing ? "Partido actualizado" : "Partido registrado ⚽", "ok");
    });
  };

  /* ============================================================
     DASHBOARD
     ============================================================ */
  FC.views.dashboard = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const sum = S.seasonSummary(c, season);
    const pos = S.userPosition(c, season.id);
    const ms = S.userMatches(c, season.id).slice().sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
    const last5 = ms.slice(0, 5).map(m => S.userResult(c, m)).reverse();
    // cumulative points sparkline
    const ordered = S.userMatches(c, season.id).filter(m => /liga/i.test(m.competition||"")).sort((a,b)=> new Date(a.date||0)-new Date(b.date||0));
    let cum = 0; const pointsSeries = ordered.map(m => { const r = S.userResult(c, m); cum += r === "W" ? 3 : r === "D" ? 1 : 0; return cum; });

    const objs = season.boardObjectives || [];
    const expiring = (c.players || []).filter(p => p.contractEnd && Number(p.contractEnd) <= season.startYear + 1);
    const activeChallenges = (c.challenges || []).filter(ch => ch.status === "active");
    const violations = activeChallenges.reduce((s, ch) => s + S.ruleViolations(c, ch).length, 0);
    const fin = S.financeSummary(c, season.id);
    const injuries = S.activeInjuries(c);
    const luck = S.luckSummary(c, season.id);
    const pol  = S.politicalCapital(c, season.id);
    const nextM = S.nextMatch(c, season.id);
    const nextRival = nextM ? S.opponentOf(c, nextM) : null;
    const canScout = nextRival && S.rivalHistory(c, nextRival);
    const finAlert = fin.hasBudget
      ? (fin.remaining < 0
          ? alertRow("coin", "Presupuesto excedido en " + U.money(-fin.remaining), "danger", "finance")
          : fin.remaining < fin.budget * 0.1
            ? alertRow("coin", "Te queda " + U.money(fin.remaining) + " de presupuesto", "warn", "finance")
            : alertRow("coin", U.money(fin.remaining) + " de presupuesto disponible", "ok", "finance"))
      : "";

    UI.mount(`
      <div class="page-head">
        <div>
          <h1>${U.esc(c.clubName)}</h1>
          <div class="sub">${U.esc(c.leagueName)} · Temporada ${U.esc(season.label)}${c.managerName ? " · " + U.esc(c.managerName) : ""}</div>
        </div>
        <div class="flex gap center wrap">
          ${seasonSelect(c)}
          <button class="btn btn-ghost" id="dash-live"><span class="ni-icon" data-icon="play"></span> Modo en vivo</button>
          <button class="btn btn-primary" id="dash-add"><span class="ni-icon" data-icon="plus"></span> Registrar partido</button>
        </div>
      </div>

      ${nextM ? `<div class="card next-match" id="dash-next" style="cursor:pointer">
        <div class="nm-left"><span class="ni-icon" data-icon="calendar"></span>
          <div><div class="nm-label">Próximo partido${nextM.date ? " · " + U.fmtDate(nextM.date) : ""}${nextM.competition ? " · " + U.esc(nextM.competition) : ""}${nextM.round ? " " + U.esc(nextM.round) : ""}</div>
          <div class="nm-teams">${U.esc(nextM.home||"—")} <span class="nm-vs">vs</span> ${U.esc(nextM.away||"—")}</div></div>
        </div>
        <div class="flex gap center">
          ${canScout ? `<button class="btn btn-ghost btn-sm" id="dash-next-scout"><span class="ni-icon" data-icon="shield"></span> Analizar</button>` : ""}
          ${nextM.away === c.clubName ? `<button class="btn btn-ghost btn-sm" id="dash-next-trip"><span class="ni-icon" data-icon="plane"></span> Viaje</button>` : ""}
          <button class="btn btn-primary btn-sm" id="dash-next-play"><span class="ni-icon" data-icon="ball"></span> Registrar resultado</button>
        </div>
      </div>` : ""}

      <div class="grid cols-4 keep-2">
        ${statTile("Posición liga", pos ? pos.pos + "º" : "—", pos ? "de " + pos.total : "Registra partidos")}
        ${statTile("Puntos", sum.points, sum.played + " partidos")}
        ${statTile("% Victorias", sum.winPct + "%", sum.w + "V " + sum.d + "E " + sum.l + "D")}
        ${statTile("Goles", sum.gf + ":" + sum.ga, "Dif " + (sum.gd >= 0 ? "+" : "") + sum.gd)}
      </div>

      <div class="grid cols-2" style="margin-top:16px">
        <div class="card">
          <div class="card-head"><h3><span class="ni-icon" data-icon="ball"></span> Últimos partidos</h3>
            <div class="flex gap center">${CH.formBar(last5)}</div></div>
          <div id="dash-fixtures"></div>
        </div>
        <div class="card">
          <div class="card-head"><h3><span class="ni-icon" data-icon="target"></span> Objetivos de la junta</h3>
            <button class="btn btn-ghost btn-sm" id="dash-add-obj"><span class="ni-icon" data-icon="plus"></span></button></div>
          <div id="dash-objs"></div>
        </div>
      </div>

      <div class="grid cols-3 keep-2" style="margin-top:16px">
        <div class="card">
          <div class="card-head"><h3><span class="ni-icon" data-icon="table"></span> Evolución en liga</h3></div>
          ${pointsSeries.length > 1 ? CH.line(pointsSeries, { h: 96 }) : `<p class="faint">Registra partidos de liga para ver tu progresión.</p>`}
          <div class="faint" style="font-size:12px;margin-top:6px">Puntos acumulados</div>
        </div>
        <div class="card">
          <div class="card-head"><h3><span class="ni-icon" data-icon="bell"></span> Alertas</h3></div>
          <div class="list">
            ${luck ? alertRow("growth", luck.diff >= 2 ? ("Rindes +" + f1(luck.diff) + " pts sobre tu xG — puede corregirse") : luck.diff <= -2 ? ("Mereces " + f1(-luck.diff) + " pts más según tu xG — mala suerte") : ("Resultados acordes a tu xG (xPts " + f1(luck.xpts) + ")"), Math.abs(luck.diff) >= 2 ? "warn" : "ok", "matches") : ""}
            ${alertRow("flag", violations ? violations + " infracción(es) de reto activas" : "Sin infracciones de reto", violations ? "danger" : "ok", "challenges")}
            ${alertRow("coin", expiring.length ? expiring.length + " contrato(s) a vencer" : "Sin contratos urgentes", expiring.length ? "warn" : "ok", "squad")}
            ${finAlert}
            ${alertRow("trophy", (c.trophies||[]).filter(t=>t.seasonId===season.id&&t.result==="winner").length + " título(s) esta temporada", "ok", "history")}
            ${injuries.length ? alertRow("bandage", injuries.length + " jugador" + (injuries.length > 1 ? "es" : "") + " lesionado" + (injuries.length > 1 ? "s" : ""), "danger", "squad") : ""}
            ${pol && pol.tension >= 25 ? alertRow("shield", pol.level + " política: " + (pol.events[0] ? pol.events[0].text : "Tensión en el vestuario"), pol.levelTone, "squad") : ""}
          </div>
        </div>
      </div>

      ${(!ms.length && !(c.players||[]).length) ? `
      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3><span class="ni-icon" data-icon="star"></span> Primeros pasos</h3></div>
        <div class="list">
          <div class="list-row" data-goto="squad" style="cursor:pointer">
            <span class="ni-icon" data-icon="shirt" style="color:var(--accent)"></span>
            <div class="lr-main"><b>Añade tu plantilla</b><small class="faint">Registra tus jugadores para seguir sus stats y desarrollo</small></div>
            <span class="ni-icon" data-icon="chevron" style="color:var(--text-dim)"></span>
          </div>
          <div class="list-row" id="dash-first-match" style="cursor:pointer">
            <span class="ni-icon" data-icon="ball" style="color:var(--accent)"></span>
            <div class="lr-main"><b>Registra tu primer partido</b><small class="faint">El Panel, la Clasificación y la Narrativa se alimentan de tus resultados</small></div>
            <span class="ni-icon" data-icon="chevron" style="color:var(--text-dim)"></span>
          </div>
          <div class="list-row" data-goto="challenges" style="cursor:pointer">
            <span class="ni-icon" data-icon="target" style="color:var(--accent)"></span>
            <div class="lr-main"><b>Activa un reto o logro</b><small class="faint">Pon reglas a tu carrera para hacerla más desafiante</small></div>
            <span class="ni-icon" data-icon="chevron" style="color:var(--text-dim)"></span>
          </div>
        </div>
      </div>` : ""}
    `);

    // fixtures
    const fx = document.getElementById("dash-fixtures");
    if (!ms.length) fx.innerHTML = `<p class="faint">Aún no has registrado partidos. Pulsa “Registrar partido”.</p>`;
    else fx.innerHTML = ms.slice(0, 6).map(m => fixtureRow(c, m)).join("");

    // objectives
    renderObjectives(c, season);

    document.getElementById("dash-add").addEventListener("click", () => UI.openMatchModal(c));
    document.getElementById("dash-live").addEventListener("click", () => FC.router.go("live"));
    const nextEl = document.getElementById("dash-next");
    if (nextEl) {
      document.getElementById("dash-next-play").addEventListener("click", (e) => { e.stopPropagation(); UI.openMatchModal(c, nextM, { mode: "result" }); });
      const dns = document.getElementById("dash-next-scout");
      if (dns) dns.addEventListener("click", (e) => { e.stopPropagation(); UI.openRivalDossier(c, nextRival); });
      const dnt = document.getElementById("dash-next-trip");
      if (dnt) dnt.addEventListener("click", (e) => { e.stopPropagation(); UI.openTrip(c, nextM); });
      nextEl.addEventListener("click", () => UI.openMatchModal(c, nextM, { mode: "schedule" }));
    }
    document.getElementById("dash-add-obj").addEventListener("click", () => objectiveModal(c, season));
    const firstMatch = document.getElementById("dash-first-match");
    if (firstMatch) firstMatch.addEventListener("click", () => UI.openMatchModal(c));
    fx.querySelectorAll("[data-match]").forEach(r => r.addEventListener("click", () => UI.openMatchModal(c, findMatch(c, r.dataset.match))));
  };
  function renderObjectives(c, season) {
    const box = document.getElementById("dash-objs");
    const objs = season.boardObjectives || [];
    if (!objs.length) { box.innerHTML = `<p class="faint">Añade los objetivos que te marcó el club esta temporada.</p>`; return; }
    box.innerHTML = objs.map(o => {
      const pct = o.target ? U.clamp(Math.round((Number(o.current) / Number(o.target)) * 100), 0, 100) : (o.current ? 100 : 0);
      return `<div class="obj-row">
        <div class="obj-meta"><b>${U.esc(o.text)}</b>
          <div class="flex between" style="font-size:12px;margin-top:4px"><span class="faint">${U.esc(o.current)}${o.target ? " / " + U.esc(o.target) : ""}${o.unit ? " " + U.esc(o.unit) : ""}</span><span class="faint">${pct}%</span></div>
          <div class="bar ${pct>=100?"":"blue"}"><i style="width:${pct}%"></i></div></div>
        <button class="icon-btn sm" data-del-obj="${o.id}"><span class="ni-icon" data-icon="trash"></span></button>
      </div>`;
    }).join("");
    U.hydrateIcons(box);
    box.querySelectorAll("[data-del-obj]").forEach(b => b.addEventListener("click", () => {
      season.boardObjectives = season.boardObjectives.filter(x => x.id !== b.dataset.delObj); S.emit();
    }));
  }
  function objectiveModal(c, season) {
    UI.openModal("Nuevo objetivo", `
      <div class="field"><label>Objetivo</label><input type="text" id="o-text" placeholder="p.ej. Clasificar para Champions"/></div>
      <div class="field-row three">
        <div class="field"><label>Progreso actual</label><input type="number" id="o-cur" value="0"/></div>
        <div class="field"><label>Meta</label><input type="number" id="o-tar" placeholder="p.ej. 4"/></div>
        <div class="field"><label>Unidad</label><input type="text" id="o-unit" placeholder="puntos / pos."/></div>
      </div>`,
      `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="o-save">Añadir</button>`);
    document.getElementById("o-save").addEventListener("click", () => {
      const text = document.getElementById("o-text").value.trim();
      if (!text) { UI.toast("Escribe el objetivo", "err"); return; }
      (season.boardObjectives || (season.boardObjectives = [])).push({
        id: U.uid(), text, current: Number(document.getElementById("o-cur").value) || 0,
        target: Number(document.getElementById("o-tar").value) || 0, unit: document.getElementById("o-unit").value.trim(),
      });
      S.emit(); UI.closeModal();
    });
  }

  /* ============================================================
     PARTIDOS
     ============================================================ */
  let matchesTab = "list"; // "list" | "calendar" — persiste entre re-renders
  FC.views.matches = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const ms = (c.matches || []).filter(m => m.seasonId === season.id && S.isPlayed(m)).slice().sort((a,b)=> new Date(b.date||0)-new Date(a.date||0));
    const upcoming = S.upcomingMatches(c, season.id);
    const sa = S.statsAverages(c, season.id);
    const statsCard = sa ? `
      <div class="card">
        <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="growth"></span> Estadísticas avanzadas <span class="faint" style="font-weight:400">· ${sa.count} ${sa.count===1?"partido":"partidos"} con datos</span></div>
        ${sa.possession ? statCompareRow("Posesión", sa.possession.f, sa.possession.a, "%") : ""}
        ${sa.shots ? statCompareRow("Remates (media)", sa.shots.f, sa.shots.a) : ""}
        ${sa.sot ? statCompareRow("Tiros a puerta (media)", sa.sot.f, sa.sot.a) : ""}
        ${sa.xg ? statCompareRow("xG (media)", sa.xg.f, sa.xg.a) : ""}
        ${sa.corners ? statCompareRow("Córners (media)", sa.corners.f, sa.corners.a) : ""}
        ${sa.fouls ? statCompareRow("Faltas (media)", sa.fouls.f, sa.fouls.a) : ""}
        ${sa.yellow ? statCompareRow("Amarillas (total)", sa.yellow.f, sa.yellow.a) : ""}
        ${sa.red ? statCompareRow("Rojas (total)", sa.red.f, sa.red.a) : ""}
        ${sa.pens ? statCompareRow("Penaltis (total)", sa.pens.f, sa.pens.a) : ""}
      </div>` : "";
    const luckCard = luckCardHtml(c, season.id);
    const famCard = formationFamiliarityCardHtml(c, season.id);
    const scoringCard = scoringProfileCardHtml(c, season.id);
    const previaCard = upcoming.length ? matchDayReportHtml(c, season.id) : "";
    const listHtml = `
      ${previaCard}
      ${upcoming.length ? `<div class="card">
        <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="calendar"></span> Próximos partidos <span class="faint" style="font-weight:400">· ${upcoming.length}</span></div>
        ${upcoming.map(m => upcomingRow(c, m)).join("")}
      </div>` : ""}
      ${statsCard}
      ${luckCard}
      ${famCard}
      ${scoringCard}
      <div class="card">${ms.length ? ms.map(m => fixtureRow(c, m, true)).join("") : `<div class="empty"><div class="emoji">⚽</div><h3>Sin partidos todavía</h3><p>Registra tu primer partido de la temporada.</p></div>`}</div>`;
    UI.mount(`
      <div class="page-head"><div><h1>Partidos</h1><div class="sub">${U.esc(season.label)} · ${ms.length} registrados${upcoming.length ? " · " + upcoming.length + " programado" + (upcoming.length>1?"s":"") : ""}</div></div>
        <div class="flex gap center wrap">${seasonSelect(c)}<button class="btn btn-ghost" id="mt-sched"><span class="ni-icon" data-icon="calendar"></span> Programar</button><button class="btn btn-primary" id="mt-add"><span class="ni-icon" data-icon="plus"></span> Registrar partido</button></div>
      </div>
      <div class="seg" id="mt-tabs" style="margin-bottom:14px">
        <button type="button" data-t="list" class="${matchesTab==="list"?"active":""}">Lista</button>
        <button type="button" data-t="calendar" class="${matchesTab==="calendar"?"active":""}">Calendario</button>
      </div>
      ${matchesTab === "calendar" ? calendarHtml(c, season) : listHtml}
    `);
    document.querySelectorAll("#mt-tabs button").forEach(b => b.addEventListener("click", () => { matchesTab = b.dataset.t; FC.views.matches(); }));
    document.getElementById("mt-add").addEventListener("click", () => UI.openMatchModal(c));
    document.getElementById("mt-sched").addEventListener("click", () => UI.openMatchModal(c, null, { mode: "schedule" }));
    content().querySelectorAll("[data-match]").forEach(r => r.addEventListener("click", (e) => {
      if (e.target.closest("[data-del-match]")) return;
      UI.openMatchModal(c, findMatch(c, r.dataset.match));
    }));
    content().querySelectorAll("[data-up]").forEach(r => r.addEventListener("click", (e) => {
      if (e.target.closest("[data-del-match]") || e.target.closest("[data-play-match]") || e.target.closest("[data-trip]")) return;
      UI.openMatchModal(c, findMatch(c, r.dataset.up), { mode: "schedule" });
    }));
    content().querySelectorAll("[data-play-match]").forEach(b => b.addEventListener("click", () => {
      UI.openMatchModal(c, findMatch(c, b.dataset.playMatch), { mode: "result" });
    }));
    content().querySelectorAll("[data-trip]").forEach(b => b.addEventListener("click", (e) => {
      e.stopPropagation(); UI.openTrip(c, findMatch(c, b.dataset.trip));
    }));
    content().querySelectorAll("[data-cronica]").forEach(b => b.addEventListener("click", (e) => {
      e.stopPropagation(); UI.openCronica(c, findMatch(c, b.dataset.cronica));
    }));
    content().querySelectorAll("[data-del-match]").forEach(b => b.addEventListener("click", () => {
      UI.confirm("¿Eliminar este partido?", () => { S.deleteMatch(c, b.dataset.delMatch); UI.toast("Partido eliminado"); }, true);
    }));
  };

  /* ============================================================
     VIAJES — mapa real (proyección equirectangular inline, sin
     dependencias) con cada ciudad en su lat/lon, rutas de la
     temporada por resultado, métricas y pasaporte de estadios.
     ============================================================ */
  FC.views.viajes = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const T = c.clubName;
    const home = FC.trips.cityOf(T);
    const leagueTeams = (season.teams || []).filter(t => t !== T);
    const seasonAway = (c.matches || []).filter(m => m.seasonId === season.id && m.away === T && m.home);
    const playedAway = seasonAway.filter(m => S.isPlayed(m)).slice().sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    const upAway = seasonAway.filter(m => !S.isPlayed(m));
    const visited = {}; playedAway.forEach(m => { visited[m.home] = { r: S.userResult(c, m), id: m.id }; });
    const upcoming = {}; upAway.forEach(m => { if (!upcoming[m.home]) upcoming[m.home] = m.id; });

    // Métricas (temporada + vitalicio)
    const allAway = S.userMatches(c).filter(m => m.away === T && m.home);
    let lifeKm = 0, longest = 0, longestCity = "", awayRivals = {}, passport = 0;
    allAway.forEach(m => { const cc = FC.trips.cityOf(m.home), dk = FC.trips.distance(home, cc); lifeKm += dk * 2; if (dk > longest) { longest = dk; longestCity = cc.city; } if (!awayRivals[m.home]) { awayRivals[m.home] = 1; passport++; } });
    let seasonKm = 0; playedAway.forEach(m => seasonKm += FC.trips.distance(home, FC.trips.cityOf(m.home)) * 2);
    const laps = lifeKm / 40075;
    const estVis = leagueTeams.filter(t => visited[t]).length; // rivales de liga visitados esta temporada

    // Proyección equirectangular auto-ajustada a los equipos de la liga.
    const W = 820, H = 500, px = 30, py = 26;
    const cl = (v, a, b) => Math.max(a, Math.min(b, v));
    const allCCs = [home, ...leagueTeams.map(t => FC.trips.cityOf(t))];
    // Excluir outliers geográficos (ej. islas remotas) del bbox para que la zona continental llene el mapa.
    // Se usan los equipos dentro de 2.2× el percentil 75 de distancia al club home.
    const rivalDists = allCCs.slice(1).map(cc => FC.trips.distance(home, cc)).sort((a, b) => a - b);
    const p75 = rivalDists.length ? rivalDists[Math.max(0, Math.floor(rivalDists.length * 0.75))] : Infinity;
    const bboxCCs = rivalDists.length ? allCCs.filter((cc, i) => i === 0 || FC.trips.distance(home, cc) <= p75 * 2.2) : [home];
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    bboxCCs.forEach(cc => { minLat = Math.min(minLat, cc.lat); maxLat = Math.max(maxLat, cc.lat); minLon = Math.min(minLon, cc.lon); maxLon = Math.max(maxLon, cc.lon); });
    const latPad = Math.max((maxLat - minLat) * 0.15, 1.0), lonPad = Math.max((maxLon - minLon) * 0.15, 1.0);
    const LAT0 = minLat - latPad, LAT1 = maxLat + latPad, LON0 = minLon - lonPad, LON1 = maxLon + lonPad;
    const proj = (lat, lon) => [cl(px + (lon - LON0) / (LON1 - LON0) * (W - 2 * px), 4, W - 4), cl(py + (LAT1 - lat) / (LAT1 - LAT0) * (H - 2 * py), 4, H - 4)];
    const acc = (getComputedStyle(document.body).getPropertyValue("--accent") || "").trim() || "#00e1a0";
    const COL = { W: acc, D: "#ffd02e", L: "#ff5470", up: "#1f8fff", faint: "#46586e" };
    const arc = (p1, p2) => { const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2, dd = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]); return `M${p1[0].toFixed(1)},${p1[1].toFixed(1)} Q${mx.toFixed(1)},${(my - Math.max(14, dd * 0.16)).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`; };
    const hp = proj(home.lat, home.lon);

    const lonRange = LON1 - LON0, latRange = LAT1 - LAT0;
    const lonStep = lonRange > 25 ? 10 : lonRange > 12 ? 5 : 2;
    const latStep = latRange > 20 ? 10 : latRange > 10 ? 5 : 2;
    let grat = "";
    for (let lon = Math.ceil(LON0 / lonStep) * lonStep; lon <= LON1; lon += lonStep) { const a = proj(LAT0, lon), b = proj(LAT1, lon); grat += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`; }
    for (let lat = Math.ceil(LAT0 / latStep) * latStep; lat <= LAT1; lat += latStep) { const a = proj(lat, LON0), b = proj(lat, LON1); grat += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`; }

    let faint = "", arcs = "", dots = "", labels = "";
    leagueTeams.forEach(t => { if (visited[t] || upcoming[t]) return; const cc = FC.trips.cityOf(t), p = proj(cc.lat, cc.lon); faint += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6" fill="${COL.faint}"/>`; });
    Object.keys(visited).forEach(riv => { const cc = FC.trips.cityOf(riv), p = proj(cc.lat, cc.lon), col = COL[visited[riv].r] || COL.faint;
      arcs += `<path d="${arc(hp, p)}" fill="none" stroke="${col}" stroke-width="1.8" stroke-opacity=".55" stroke-linecap="round"/>`;
      dots += `<g data-match="${visited[riv].id}" style="cursor:pointer"><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="6" fill="${col}" fill-opacity=".18"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.6" fill="${col}"/></g>`;
      labels += `<text x="${(p[0] + 6).toFixed(1)}" y="${(p[1] + 3.5).toFixed(1)}" fill="#cdd9e6" font-size="10.5">${U.esc(cc.city)}</text>`; });
    Object.keys(upcoming).forEach(riv => { const cc = FC.trips.cityOf(riv), p = proj(cc.lat, cc.lon);
      arcs += `<path d="${arc(hp, p)}" fill="none" stroke="${COL.up}" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round"/>`;
      dots += `<g data-trip="${upcoming[riv]}" style="cursor:pointer"><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="7" fill="${COL.up}" fill-opacity=".2"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="${COL.up}"/></g>`;
      labels += `<text x="${(p[0] + 7).toFixed(1)}" y="${(p[1] + 3.5).toFixed(1)}" fill="${COL.up}" font-size="10.5">${U.esc(cc.city)}</text>`; });
    const homeNode = `<circle cx="${hp[0].toFixed(1)}" cy="${hp[1].toFixed(1)}" r="9" fill="${acc}" fill-opacity=".16"/><circle cx="${hp[0].toFixed(1)}" cy="${hp[1].toFixed(1)}" r="5" fill="${acc}" stroke="#0b1015" stroke-width="1.5"/><text x="${(hp[0] + 9).toFixed(1)}" y="${(hp[1] + 4).toFixed(1)}" fill="#eaf1f8" font-size="12" font-weight="700">${U.esc(home.city)}</text>`;

    const codeOf = (s) => (s || "").replace(/[^A-Za-zÀ-ÿ]/g, "").slice(0, 3).toUpperCase() || "···";
    const stamps = leagueTeams.map(t => { const cc = FC.trips.cityOf(t), on = visited[t]; return `<div class="vstamp${on ? " on" : ""}" title="${U.esc(t)}">${on ? '<span class="ni-icon" data-icon="check"></span>' : ""}${codeOf(cc.city)}</div>`; }).join("");

    const dot = (col) => `<i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${col}"></i>`;
    function tile(label, val, sub) { return `<div class="card stat-tile"><div class="st-glow"></div><div class="st-label">${label}</div><div class="st-value">${val}</div><div class="st-sub">${U.esc(sub)}</div></div>`; }

    // Rendimiento lejos de casa: correlación distancia↔resultado. VITALICIO (sobre
    // allAway = todos los desplazamientos jugados de la carrera); NO depende del seasonSelect.
    const RANGES = [
      { label: "Cercanía", sub: "menos de 300 km", icon: "bus", lo: 0, hi: 300 },
      { label: "Distancia media", sub: "entre 300 y 1.000 km", icon: "plane", lo: 300, hi: 1000 },
      { label: "Lejanía", sub: "más de 1.000 km", icon: "plane", lo: 1000, hi: Infinity },
    ];
    const buckets = RANGES.map(r => ({ ...r, n: 0, w: 0, d: 0, l: 0 }));
    allAway.forEach(m => {
      const dk = Math.round(FC.trips.distance(home, FC.trips.cityOf(m.home))); // redondeo: casa con la regla de la cabina
      const b = buckets.find(x => dk >= x.lo && dk < x.hi); if (!b) return;
      b.n++; const res = S.userResult(c, m);
      if (res === "W") b.w++; else if (res === "D") b.d++; else if (res === "L") b.l++;
    });
    const ppm = (b) => b.n ? (b.w * 3 + b.d) / b.n : 0;
    const homePlayed = S.userMatches(c).filter(m => m.home === T);
    let hw = 0, hd = 0; homePlayed.forEach(m => { const r = S.userResult(c, m); if (r === "W") hw++; else if (r === "D") hd++; });
    const homePPM = homePlayed.length ? (hw * 3 + hd) / homePlayed.length : 0;
    const fmt2 = (n) => n.toFixed(2).replace(".", ",");
    const ppmCol = (p) => p >= 2 ? acc : p >= 1 ? "#ffd02e" : "#ff5470";
    const farRow = (b) => {
      const p = ppm(b), col = ppmCol(p), wp = Math.round(b.w / b.n * 100);
      return `<div class="far-row">
        <div class="far-head"><span class="ni-icon" data-icon="${b.icon}"></span>
          <div class="far-name"><strong>${b.label}</strong><span class="far-sub">${b.sub}</span></div>
          <span class="far-n">${b.n} viaje${b.n === 1 ? "" : "s"}</span></div>
        <div class="far-bar"><div class="far-fill" style="width:${(p / 3 * 100).toFixed(1)}%;background:${col}"></div></div>
        <div class="far-meta"><span class="far-ppm" style="color:${col}">${fmt2(p)} pts/partido</span>
          <span class="far-wdl"><b style="color:${acc}">${b.w}V</b> <b style="color:#ffd02e">${b.d}E</b> <b style="color:#ff5470">${b.l}D</b></span>
          <span class="faint">${wp}% victorias</span></div>
      </div>`;
    };
    const activeBuckets = buckets.filter(b => b.n > 0);
    let farInsight = "";
    const near = buckets[0], far = buckets[2];
    if (near.n >= 2 && far.n >= 2) {
      const pn = ppm(near), pf = ppm(far), diff = pn - pf;
      if (diff >= 0.5) farInsight = `Rindes mejor cerca de casa: <b>${fmt2(pn)}</b> pts/partido en viajes cortos frente a <b>${fmt2(pf)}</b> en los largos. La distancia te pesa.`;
      else if (diff <= -0.5) farInsight = `Curiosamente viajas bien: <b>${fmt2(pf)}</b> pts/partido en los desplazamientos largos frente a <b>${fmt2(pn)}</b> en los cortos.`;
      else farInsight = `Tu rendimiento aguanta la distancia: <b>${fmt2(pn)}</b> pts cerca y <b>${fmt2(pf)}</b> lejos.`;
    }
    const farBody = allAway.length === 0
      ? '<span class="faint">Aún no tienes desplazamientos jugados. Registra partidos como visitante para ver tu rendimiento según la distancia.</span>'
      : `${homePlayed.length ? `<div class="far-ref">En casa promedias <b style="color:${acc}">${fmt2(homePPM)}</b> pts/partido <span class="faint">· referencia</span></div>` : ""}
         <div class="far-grid">${activeBuckets.map(farRow).join("")}</div>
         ${allAway.length < 5 ? '<div class="far-note faint">Muestra pequeña — el patrón se afinará con más desplazamientos.</div>' : ""}
         ${farInsight ? `<div class="far-insight">${farInsight}</div>` : ""}`;

    // Diario de viaje: una postal coleccionable por desplazamiento JUGADO de la temporada,
    // cronológica (playedAway ya viene ordenado asc). El badge V/E/D desambigua el marcador.
    const RESLAB = { W: "V", D: "E", L: "D" };
    const postcard = (m) => {
      const cc = FC.trips.cityOf(m.home);
      const km = Math.round(FC.trips.distance(home, cc));
      const continental = (D.CONTINENTAL || []).some(x => (m.competition || "").includes(x));
      const avion = continental || km >= 300;
      const res = S.userResult(c, m);
      const resWord = res === "W" ? "victoria" : res === "D" ? "empate" : res === "L" ? "derrota" : "";
      return `<div class="postcard res-${res}" data-match="${U.esc(m.id)}" role="button" tabindex="0" aria-label="Revivir el viaje de vuelta de ${U.esc(cc.city)}${resWord ? ", " + resWord : ""}">
        <div class="pc-top"><span class="pc-stamp">${codeOf(cc.city)}</span>
          <span class="pc-mode"><span class="ni-icon" data-icon="${avion ? "plane" : "bus"}"></span> ${km.toLocaleString("es-ES")} km</span></div>
        <div class="pc-city">${U.esc(cc.city)}</div>
        <div class="pc-rival">vs ${U.esc(m.home)}${m.competition ? " · " + U.esc(m.competition) : ""}</div>
        <div class="pc-foot"><span class="pc-res">${RESLAB[res] || "·"}</span><span class="pc-score">${Number(m.homeScore)}-${Number(m.awayScore)}</span><span class="pc-date faint">${U.fmtDate(m.date) || "Sin fecha"}</span></div>
      </div>`;
    };
    const diaryBody = playedAway.length
      ? `<div class="postcards">${playedAway.map(postcard).join("")}</div>`
      : '<span class="faint">Aún no has jugado desplazamientos esta temporada. Cuando juegues fuera, cada viaje dejará su postal aquí.</span>';

    UI.mount(`
      <div class="page-head"><div><h1>Viajes</h1><div class="sub">${U.esc(season.label)} · ${estVis}/${leagueTeams.length} estadios esta temporada${laps >= 1 ? " · " + laps.toFixed(1).replace(".", ",") + " vueltas al mundo" : ""}</div></div>
        <div class="flex gap center wrap">${seasonSelect(c)}</div>
      </div>
      <div class="grid cols-4 keep-2" style="margin-bottom:16px">
        ${tile("Km esta temporada", seasonKm.toLocaleString("es-ES"), playedAway.length + " desplazamiento" + (playedAway.length === 1 ? "" : "s"))}
        ${tile("Vueltas al mundo", laps.toFixed(2).replace(".", ","), Math.round(lifeKm).toLocaleString("es-ES") + " km en tu carrera")}
        ${tile("Estadios", passport, "visitados en tu carrera")}
        ${tile("Viaje más largo", Math.round(longest).toLocaleString("es-ES") + " km", longestCity || "—")}
      </div>
      <div class="card vmap">
        <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Mapa de Europa con las ciudades de tus rivales en su posición geográfica real y tus rutas de la temporada coloreadas por resultado.">
          <rect x="0" y="0" width="${W}" height="${H}" fill="#0b141f"/>
          <g stroke="#1b2738" stroke-width="1">${grat}</g>
          ${faint}${arcs}${dots}${labels}${homeNode}
        </svg>
        <div class="vmap-legend">
          <span>${dot(acc)} Tu club</span><span>${dot(COL.W)} Victoria</span><span>${dot(COL.D)} Empate</span><span>${dot(COL.L)} Derrota</span><span>${dot(COL.up)} Próximo</span><span>${dot(COL.faint)} Sin visitar</span>
        </div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="pin"></span> Pasaporte de estadios <span class="faint" style="font-weight:400">· ${estVis}/${leagueTeams.length} esta temporada</span></div>
        <div class="vstamps">${stamps || '<span class="faint">Esta temporada no tiene rivales registrados.</span>'}</div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="book"></span> Diario de viaje <span class="faint" style="font-weight:400">· ${playedAway.length} viaje${playedAway.length === 1 ? "" : "s"} esta temporada</span></div>
        ${diaryBody}
      </div>
      <div class="card" style="margin-top:16px">
        <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="growth"></span> Rendimiento lejos de casa <span class="faint" style="font-weight:400">· toda tu carrera</span></div>
        ${farBody}
      </div>
    `);
    content().querySelectorAll(".vmap [data-trip]").forEach(g => g.addEventListener("click", () => UI.openTrip(c, findMatch(c, g.dataset.trip))));
    content().querySelectorAll(".vmap [data-match]").forEach(g => g.addEventListener("click", () => UI.openMatchModal(c, findMatch(c, g.dataset.match))));
    content().querySelectorAll(".postcards [data-match]").forEach(g => {
      const open = () => { const m = findMatch(c, g.dataset.match); if (m) UI.openTrip(c, m, { dir: "return" }); }; // revivir el viaje de vuelta
      g.addEventListener("click", open);
      g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  };

  /* ============================================================
     RIVALES — historial cara a cara vitalicio + dossier táctico
     ============================================================ */
  FC.views.rivales = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const list = S.rivalsList(c);
    const nextM = S.nextMatch(c, season.id);
    const nextRival = nextM ? S.opponentOf(c, nextM) : null;
    const nextHist = nextRival ? S.rivalHistory(c, nextRival) : null;

    const nextCard = nextRival ? `<div class="card next-match">
      <div class="nm-left"><span class="ni-icon" data-icon="shield"></span>
        <div><div class="nm-label">Próximo rival${nextM.date ? " · " + U.fmtDate(nextM.date) : ""}${nextM.competition ? " · " + U.esc(nextM.competition) : ""}${nextM.round ? " " + U.esc(nextM.round) : ""}</div>
          <div class="nm-teams">${U.esc(nextRival)}</div>
          <small class="faint">${nextHist ? `${nextHist.all.pj} duelo${nextHist.all.pj === 1 ? "" : "s"} previo${nextHist.all.pj === 1 ? "" : "s"} · ${nextHist.all.w}V-${nextHist.all.d}E-${nextHist.all.l}D` : "Primer enfrentamiento — sin historial todavía"}</small></div>
      </div>
      ${nextHist ? `<button class="btn btn-primary btn-sm" id="rv-next-scout"><span class="ni-icon" data-icon="search"></span> Analizar rival</button>` : ""}
    </div>` : "";

    UI.mount(`
      <div class="page-head"><div><h1>Rivales</h1><div class="sub">Historial y análisis táctico de cada equipo al que te has enfrentado</div></div></div>
      ${nextCard}
      <div class="card">
        <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="table"></span> Cara a cara <span class="faint" style="font-weight:400">· ${list.length} rival${list.length === 1 ? "" : "es"}</span></div>
        ${list.length ? `<div class="list">${list.map(o => rivalRow(c, o)).join("")}</div>` : `<div class="empty"><div class="emoji">🛡️</div><h3>Aún no hay rivales</h3><p>Registra partidos para construir tu historial de enfrentamientos.</p></div>`}
      </div>
    `);
    content().querySelectorAll("[data-rival]").forEach(el => el.addEventListener("click", () => UI.openRivalDossier(c, el.dataset.rival)));
    const sb = document.getElementById("rv-next-scout");
    if (sb) sb.addEventListener("click", () => UI.openRivalDossier(c, nextRival));
  };

  // Dossier táctico de un rival: veredicto + balance + análisis + splits + últimos duelos.
  UI.openRivalDossier = function (c, rival) {
    const d = S.rivalDossier(c, rival);
    if (!d) { UI.toast("Sin enfrentamientos contra " + rival, "err"); return; }
    const h = d.history, a = h.all;
    const tone = { good: "var(--ok)", bad: "var(--danger)", neutral: "var(--text-dim)" };
    const vtone = tone[d.verdict.tone];
    const splitRow = (label, o) => o.pj ? `<div class="flex between center" style="padding:9px 0;border-bottom:1px solid var(--line)">
      <span style="font-size:13px">${U.esc(label)} <span class="faint">· ${o.pj}</span></span>
      <span style="font-size:13px"><b style="color:var(--ok)">${o.w}V</b> <b style="color:var(--warn)">${o.d}E</b> <b style="color:var(--danger)">${o.l}D</b> <span class="faint">· ${o.gf}:${o.ga} · ${f1(o.ppg)} pts</span></span></div>` : "";
    const lastMeetings = h.matches.slice(0, 6).map(m => {
      const r = S.userResult(c, m), cls = r === "W" ? "win" : r === "L" ? "loss" : "";
      return `<div class="fixture" data-rmatch="${m.id}" style="cursor:pointer">
        <span class="fx-comp">${U.esc(m.competition || "")}${m.round ? " · " + U.esc(m.round) : ""}${m.formation ? ` <span class="chip" style="font-size:10px;padding:1px 5px;opacity:.75">${U.esc(m.formation)}</span>` : ""}</span>
        <div class="fx-teams"><span class="t" style="${m.home === c.clubName ? "font-weight:700" : ""}">${U.esc(m.home)}</span>
          <span class="fx-score ${cls}">${m.homeScore}-${m.awayScore}</span>
          <span class="t away" style="${m.away === c.clubName ? "font-weight:700" : ""}">${U.esc(m.away)}</span></div>
        <span class="faint" style="font-size:11px;width:60px;text-align:right">${U.fmtDate(m.date) || ""}</span></div>`;
    }).join("");

    const body = `
      <div class="flex gap center mb">
        <span class="career-badge" style="background:${U.safeColor(null, U.colorFor(rival))}">${U.initials(rival)}</span>
        <div><b style="font-size:18px">${U.esc(rival)}</b><br><small class="faint">${a.pj} enfrentamiento${a.pj === 1 ? "" : "s"} · ${a.w}V-${a.d}E-${a.l}D · ${a.gf}:${a.ga}</small></div>
      </div>
      <div style="border-left:3px solid ${vtone};background:var(--panel);padding:12px 14px;border-radius:8px;margin-bottom:14px">
        <b style="color:${vtone}">${U.esc(d.verdict.title)}</b>
        <div style="font-size:13px;margin-top:4px">${U.esc(d.verdict.text)}</div>
      </div>
      <div class="grid cols-4 keep-2">
        ${statTile("Enfrentamientos", a.pj, "")}
        ${statTile("Balance", a.w + "-" + a.d + "-" + a.l, "V-E-D")}
        ${statTile("Goles", a.gf + ":" + a.ga, "Dif " + (a.gd >= 0 ? "+" : "") + a.gd)}
        ${statTile("% Victorias", a.winPct + "%", f1(a.ppg) + " pts/partido")}
      </div>
      <div class="section-title">Análisis táctico</div>
      ${d.insights.length ? `<div class="list">${d.insights.map(i => `<div class="list-row" style="align-items:flex-start">
        <span class="ni-icon" data-icon="${i.icon}" style="color:${tone[i.tone]};flex-shrink:0;margin-top:2px"></span>
        <div class="lr-main"><b>${U.esc(i.title)}</b><div style="font-size:13px;margin-top:2px;color:var(--text-dim)">${U.esc(i.text)}</div></div>
      </div>`).join("")}</div>` : `<p class="faint">Necesitas más enfrentamientos para un análisis táctico detallado.</p>`}
      ${(h.home.pj || h.away.pj) ? `<div class="section-title">Local vs visitante</div>
        <div class="card" style="margin:0">${splitRow("En casa", h.home)}${splitRow("A domicilio", h.away)}</div>` : ""}
      ${Object.keys(h.byComp).length > 1 ? `<div class="section-title">Por competición</div>
        <div class="card" style="margin:0">${Object.values(h.byComp).sort((x, y) => y.pj - x.pj).map(cb => splitRow(cb.comp, cb)).join("")}</div>` : ""}
      <div class="section-title">Últimos enfrentamientos</div>
      <div class="card" style="margin:0">${lastMeetings}</div>
    `;
    UI.openModal("Dossier · " + rival, body, '<button class="btn btn-ghost" data-close>Cerrar</button>', { lg: true });
    const modal = document.getElementById("modal");
    modal.querySelectorAll("[data-rmatch]").forEach(el => el.addEventListener("click", () => UI.openMatchModal(c, findMatch(c, el.dataset.rmatch))));
  };

  /* ============================================================
     CLASIFICACIÓN + brackets
     ============================================================ */
  FC.views.standings = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const table = S.computeStandings(c, season.id);
    const agg = Object.values(S.playerAggregates(c, season.id));
    const scorers = agg.filter(p => p.goals > 0).sort((a,b)=> b.goals - a.goals).slice(0, 8);
    const assisters = agg.filter(p => p.assists > 0).sort((a,b)=> b.assists - a.assists).slice(0, 8);
    const n = table.length;
    UI.mount(`
      <div class="page-head"><div><h1>Clasificación</h1><div class="sub">${U.esc(season.leagueName||c.leagueName)} · ${U.esc(season.label)}</div></div>
        <div class="flex gap center wrap">${seasonSelect(c)}<button class="btn btn-ghost btn-sm" id="st-fill"><span class="ni-icon" data-icon="plus"></span> Resultado de otro partido</button></div>
      </div>
      <div class="card tight">
        <div class="table-wrap"><table class="tbl"><thead><tr>
          <th>#</th><th>Equipo</th><th class="num">PJ</th><th class="num">G</th><th class="num">E</th><th class="num">P</th><th class="num">GF</th><th class="num">GC</th><th class="num">DG</th><th class="num">Pts</th>
        </tr></thead><tbody>
        ${table.length ? table.map((r, i) => {
          const zone = i === 0 ? "zone-ucl" : i < 4 ? "zone-ucl" : i < 6 ? "zone-uel" : i >= n - 3 ? "zone-rel" : "";
          return `<tr class="${r.team === c.clubName ? "is-user" : ""}">
            <td><span class="pos-cell"><span class="zone-bar ${zone}"></span>${i+1}</span></td>
            <td>${U.esc(r.team)}</td><td class="num">${r.pj}</td><td class="num">${r.pg}</td><td class="num">${r.pe}</td><td class="num">${r.pp}</td>
            <td class="num">${r.gf}</td><td class="num">${r.gc}</td><td class="num">${(r.gf-r.gc>=0?"+":"")+(r.gf-r.gc)}</td><td class="num"><b>${r.pts}</b></td></tr>`;
        }).join("") : `<tr><td colspan="10"><div class="empty" style="padding:30px"><div class="emoji">📊</div><p>La tabla se calcula con los partidos de Liga que registres.</p></div></td></tr>`}
        </tbody></table></div>
      </div>

      <div class="grid cols-2" style="margin-top:16px">
        ${rankCard("Máximos goleadores", scorers, "goals", "⚽")}
        ${rankCard("Máximos asistentes", assisters, "assists", "🅰️")}
      </div>

      <div class="section-title">Generador de cuadros de copa</div>
      <div class="card" id="bracket-card"></div>
    `);
    document.getElementById("st-fill").addEventListener("click", () => UI.openMatchModal(c));
    renderBracket(c);
  };
  function rankCard(title, rows, key, emoji) {
    return `<div class="card"><div class="card-head"><h3>${emoji} ${title}</h3></div>
      ${rows.length ? `<div class="list">${rows.map((p, i) => `<div class="list-row">
        <span class="faint" style="width:18px">${i+1}</span>
        <div class="avatar" style="background:${U.colorFor(p.name)}">${U.initials(p.name)}</div>
        <div class="lr-main"><b>${U.esc(p.name)}</b></div>
        <b style="font-size:18px">${p[key]}</b></div>`).join("")}</div>` : `<p class="faint">Registra goleadores/asistentes en tus partidos.</p>`}</div>`;
  }
  function renderBracket(c) {
    const box = document.getElementById("bracket-card");
    c.bracket = c.bracket || null;
    if (!c.bracket) {
      box.innerHTML = `<p class="muted" style="margin-top:0">Crea un cuadro eliminatorio (copa, torneo ficticio o reto con amigos).</p>
        <div class="field"><label>Equipos (separados por comas) — potencias de 2 ideal (4, 8, 16)</label>
        <textarea id="bk-teams" placeholder="${U.esc((S.currentSeason(c).teams||[]).slice(0,8).join(", "))}"></textarea></div>
        <button class="btn btn-primary" id="bk-make"><span class="ni-icon" data-icon="target"></span> Generar cuadro</button>`;
      U.hydrateIcons(box);
      box.querySelector("#bk-make").addEventListener("click", () => {
        let teams = box.querySelector("#bk-teams").value.split(",").map(s => s.trim()).filter(Boolean);
        if (teams.length < 2) { UI.toast("Añade al menos 2 equipos", "err"); return; }
        // shuffle
        for (let i = teams.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [teams[i], teams[j]] = [teams[j], teams[i]]; }
        let size = 2; while (size < teams.length) size *= 2;
        while (teams.length < size) teams.push("BYE");
        const round = []; for (let i = 0; i < teams.length; i += 2) round.push({ a: teams[i], b: teams[i+1], w: null });
        c.bracket = { rounds: [round] }; S.emit(); renderBracket(c);
      });
      return;
    }
    const b = c.bracket;
    // ensure next rounds exist as winners get set
    const html = b.rounds.map((round, ri) => `
      <div style="min-width:200px">
        <div class="section-title" style="margin:0 0 8px">${roundName(b.rounds.length, ri)}</div>
        ${round.map((tie, ti) => `<div class="card tight" style="margin-bottom:8px;padding:8px">
          ${tieTeam(tie, "a", ri, ti)}${tieTeam(tie, "b", ri, ti)}</div>`).join("")}
      </div>`).join("");
    box.innerHTML = `<div class="flex between center mb"><b>Cuadro</b><button class="btn btn-ghost btn-sm" id="bk-reset"><span class="ni-icon" data-icon="trash"></span> Reiniciar</button></div>
      <div class="scroll-x flex gap" style="align-items:flex-start">${html}</div>`;
    U.hydrateIcons(box);
    box.querySelector("#bk-reset").addEventListener("click", () => { c.bracket = null; S.emit(); renderBracket(c); });
    box.querySelectorAll("[data-pick]").forEach(el => el.addEventListener("click", () => {
      const [ri, ti, side] = el.dataset.pick.split(":");
      const round = b.rounds[+ri]; const tie = round[+ti];
      tie.w = tie[side];
      // build next round if all decided
      if (round.every(t => t.w)) {
        const next = []; for (let i = 0; i < round.length; i += 2) {
          if (round[i+1]) next.push({ a: round[i].w, b: round[i+1].w, w: null });
        }
        b.rounds = b.rounds.slice(0, +ri + 1);
        if (next.length) b.rounds.push(next);
      } else { b.rounds = b.rounds.slice(0, +ri + 1); }
      S.emit(); renderBracket(c);
    }));
  }
  function tieTeam(tie, side, ri, ti) {
    const name = tie[side]; const isW = tie.w && tie.w === name; const bye = name === "BYE";
    return `<div class="flex between center" data-pick="${ri}:${ti}:${side}" style="cursor:${bye?"default":"pointer"};padding:5px 7px;border-radius:7px;${isW?"background:color-mix(in srgb,var(--accent) 16%,transparent)":""}">
      <span style="${bye?"opacity:.4":""}">${U.esc(name||"—")}</span>${isW?'<span class="ni-icon" data-icon="check" style="color:var(--accent)"></span>':""}</div>`;
  }
  function roundName(total, ri) {
    const left = total - ri; if (left === 1) return "Final"; if (left === 2) return "Semifinal"; if (left === 3) return "Cuartos"; if (left === 4) return "Octavos";
    return "Ronda " + (ri + 1);
  }

  /* ============================================================
     MODO EN VIVO — pantalla completa para usar MIENTRAS juegas.
     Botón gigante para registrar, tabla grande y racha. 100% local.
     Es una ruta normal: tras registrar, S.emit re-renderiza y todo se
     actualiza en el sitio (sin salir del modo).
     ============================================================ */
  FC.views.live = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const table = S.computeStandings(c, season.id);
    const sum = S.seasonSummary(c, season);
    const pos = S.userPosition(c, season.id);
    const ms = S.userMatches(c, season.id).slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    const last5 = ms.slice(0, 5).map(m => S.userResult(c, m)).reverse();
    const nextM = S.nextMatch(c, season.id);
    const n = table.length;
    UI.mount(`
      <div class="live-screen">
        <div class="live-top">
          <div class="live-club">
            <span class="career-badge" style="background:${U.safeColor(c.badgeColor, U.colorFor(c.clubName))}">${U.initials(c.clubName)}</span>
            <div class="live-club-meta"><b>${U.esc(c.clubName)}</b><small>${U.esc(season.leagueName || c.leagueName)} · ${U.esc(season.label)}</small></div>
          </div>
          <button class="btn btn-ghost" id="live-exit"><span class="ni-icon" data-icon="close"></span> Salir</button>
        </div>

        ${nextM ? `<div class="live-next"><span class="ni-icon" data-icon="calendar"></span> Próximo: <b>${U.esc(nextM.home||"—")} vs ${U.esc(nextM.away||"—")}</b>${nextM.competition?` · ${U.esc(nextM.competition)}`:""}${nextM.date?` · ${U.fmtDate(nextM.date)}`:""}</div>` : ""}
        <button class="live-add" id="live-add"><span class="ni-icon" data-icon="plus"></span> Registrar resultado</button>

        <div class="live-stats">
          <div class="live-stat"><span class="ls-val">${pos ? pos.pos + "º" : "—"}</span><span class="ls-lbl">Posición</span></div>
          <div class="live-stat"><span class="ls-val">${sum.points}</span><span class="ls-lbl">Puntos</span></div>
          <div class="live-stat"><span class="ls-val">${sum.w}-${sum.d}-${sum.l}</span><span class="ls-lbl">V·E·D</span></div>
          <div class="live-stat"><span class="ls-form">${last5.length ? CH.formBar(last5) : '<span class="faint">—</span>'}</span><span class="ls-lbl">Forma</span></div>
        </div>

        <div class="card tight live-table">
          <div class="table-wrap"><table class="tbl"><thead><tr>
            <th>#</th><th>Equipo</th><th class="num">PJ</th><th class="num">DG</th><th class="num">Pts</th>
          </tr></thead><tbody>
          ${table.length ? table.map((r, i) => {
            const zone = i < 4 ? "zone-ucl" : i < 6 ? "zone-uel" : i >= n - 3 ? "zone-rel" : "";
            return `<tr class="${r.team === c.clubName ? "is-user" : ""}">
              <td><span class="pos-cell"><span class="zone-bar ${zone}"></span>${i + 1}</span></td>
              <td>${U.esc(r.team)}</td><td class="num">${r.pj}</td>
              <td class="num">${(r.gf - r.gc >= 0 ? "+" : "") + (r.gf - r.gc)}</td><td class="num"><b>${r.pts}</b></td></tr>`;
          }).join("") : `<tr><td colspan="5"><div class="empty" style="padding:26px"><div class="emoji">📊</div><p>Registra partidos de Liga para ver la tabla en vivo.</p></div></td></tr>`}
          </tbody></table></div>
        </div>
      </div>
    `);
    document.getElementById("live-exit").addEventListener("click", () => FC.router.go("dashboard"));
    document.getElementById("live-add").addEventListener("click", () => UI.openMatchModal(c, nextM || undefined, nextM ? { mode: "result" } : undefined));
  };

  /* ============================================================
     CABINA EN DIRECTO — transmisión del viaje al partido fuera.
     Overlay a pantalla completa (no es una ruta): se lanza desde la
     tarjeta de un partido visitante. Anima el vehículo por la ruta y
     revela la bitácora; al llegar, abre el modal de registrar resultado.
     ============================================================ */
  // Proyección equirectangular sobre el bbox de los dos puntos (norte arriba),
  // para que origen y destino caigan en su dirección geográfica relativa.
  function projRoute(o, dst, W, H, pad) {
    let latMin = Math.min(o.lat, dst.lat), latMax = Math.max(o.lat, dst.lat);
    let lonMin = Math.min(o.lon, dst.lon), lonMax = Math.max(o.lon, dst.lon);
    const lp = (latMax - latMin) * 0.6 + 1.5, gp = (lonMax - lonMin) * 0.6 + 1.5;
    latMin -= lp; latMax += lp; lonMin -= gp; lonMax += gp;
    return (c) => [
      pad + (c.lon - lonMin) / ((lonMax - lonMin) || 1) * (W - 2 * pad),
      pad + (latMax - c.lat) / ((latMax - latMin) || 1) * (H - 2 * pad),
    ];
  }

  // Crónica del partido: modal ligero con las 3 frases generadas.
  UI.openCronica = function (c, m) {
    if (!c || !m || !FC.store.isPlayed(m)) return;
    const lines = FC.trips.matchCronica(c, m);
    if (!lines || !lines.length) { UI.toast("Sin datos suficientes para generar la crónica", "err"); return; }
    const U = FC.util, S = FC.store;
    const g = S.userGoals(c, m) || { for: 0, against: 0 };
    const res = S.userResult(c, m);
    const rc = res === "W" ? "win" : res === "L" ? "loss" : "";
    const rival = m.home === c.clubName ? m.away : m.home;
    const venue = m.home === c.clubName ? "Local" : "Visitante";
    const scoreLine = `${Number(g.for)}-${Number(g.against)}`;
    const header = `<div style="text-align:center;margin-bottom:16px">
      <div style="font-size:13px;color:var(--text2);margin-bottom:4px">${U.esc(m.competition || "")}${m.round ? " · " + U.esc(m.round) : ""} · ${venue}</div>
      <div style="font-size:28px;font-weight:800;letter-spacing:-1px" class="${rc}">${U.esc(c.clubName)} <span style="color:var(--text2);font-size:20px">${scoreLine}</span> ${U.esc(rival)}</div>
      ${m.date ? `<div style="font-size:12px;color:var(--text2);margin-top:4px">${U.fmtDate(m.date)}</div>` : ""}
    </div>`;
    const lineupSection = (m.lineup && m.lineup.length && m.formation) ? (() => {
      const slots = (FC.data.FORMATIONS || {})[m.formation] || [];
      if (!slots.length) return "";
      return `<div style="margin-top:20px;border-top:1px solid var(--line);padding-top:14px">
        <div style="font-weight:700;font-size:11px;letter-spacing:.05em;color:var(--text2);margin-bottom:10px">ALINEACIÓN · ${U.esc(m.formation)}</div>
        ${_pitchSvgEl(m.formation, slots, m.lineup)}
      </div>`;
    })() : "";
    const body = header + lines.map((l, i) => `
      <p style="margin:${i===0?"0":"12px"} 0 0;line-height:1.6;${i===0?"font-weight:600":"color:var(--text2);"}">${l}</p>`).join("") + lineupSection;
    UI.openModal("Crónica del partido", body, `<button class="btn btn-primary" data-close>Cerrar</button>`);
  };

  UI.openTrip = function (c, m, opts) {
    if (document.querySelector(".trip-cabin")) return; // guarda anti doble-apertura
    const ctx = FC.trips.context(c, m);
    if (!ctx || !ctx.isAway) { UI.toast("Este partido es en casa: no hay viaje", "err"); return; }
    const played = S.isPlayed(m);
    const isReturn = !!(opts && opts.dir === "return") && played; // la vuelta solo existe con resultado
    const beats = isReturn ? FC.trips.returnBeats(ctx, c) : FC.trips.beats(ctx, c);
    const avion = ctx.mode === "avion";
    const startCity = isReturn ? ctx.dest : ctx.origin; // ida: casa→rival · vuelta: rival→casa
    const endCity = isReturn ? ctx.origin : ctx.dest;
    // SVG no resuelve var() en atributos de presentación: resolvemos el acento a hex.
    const _cs = getComputedStyle(document.body);
    const accHex = ((avion ? _cs.getPropertyValue("--accent") : _cs.getPropertyValue("--accent-3")) || "").trim() || (avion ? "#00e1a0" : "#ffd02e");
    const W = 720, H = 220, pad = 48;
    const proj = projRoute(startCity, endCity, W, H, pad);
    const o = proj(startCity), dp = proj(endCity);
    const ctrl = [(o[0] + dp[0]) / 2, Math.min(o[1], dp[1]) - 44];
    const arcD = `M${o[0].toFixed(1)},${o[1].toFixed(1)} Q${ctrl[0].toFixed(1)},${ctrl[1].toFixed(1)} ${dp[0].toFixed(1)},${dp[1].toFixed(1)}`;
    const etaTotal = avion ? Math.round(40 + ctx.dist / 12) : Math.round(10 + ctx.dist / 1.3);
    const steps = isReturn
      ? (avion ? ["Vestuario", "Despegue", "Crucero", "Aproximación", "En casa"] : ["Vestuario", "Carretera", "Crucero", "Aproximación", "En casa"])
      : (avion ? ["Embarque", "Despegue", "Crucero", "Aproximación", "Aterrizaje"] : ["Salida", "Carretera", "Crucero", "Aproximación", "Llegada"]);
    const THRESH = [0, 0.12, 0.3, 0.75, 0.97];
    const rank = FC.trips.travelerRank(ctx.miles);
    // Textos de cuenta atrás: la ida cuenta hacia el pitido; la vuelta, hacia casa.
    const etaPending = (mins) => isReturn ? ("Faltan " + mins + " min para llegar a casa") : ("Faltan " + mins + " min para el pitido inicial");
    const etaDone = isReturn ? ("En casa, en " + U.esc(endCity.city)) : "Sonó el pitido inicial";

    // chips de contexto
    const stakeLabel = { liderato: "Liderato en juego", europa_zona: "Pelea por Europa", descenso: "Lucha por no bajar", media: "Media tabla", copa: "Noche de copa", continental: "Noche europea", final_euro: "¡Final!" }[ctx.stake] || "";
    const stakeCls = (ctx.stake === "descenso") ? "danger" : (ctx.stake === "liderato" || ctx.stake === "continental" || ctx.stake === "final_euro") ? "gold" : "accent";
    const chips = [];
    chips.push(`<span class="chip"><span class="ni-icon" data-icon="${avion ? "plane" : "bus"}"></span> ${avion ? "Avión" : "Autobús"} · ${ctx.dist.toLocaleString("es-ES")} km</span>`);
    if (stakeLabel) chips.push(`<span class="chip ${stakeCls}"><span class="ni-icon" data-icon="target"></span> ${stakeLabel}</span>`);
    if (ctx.streak.unbeaten >= 3) chips.push(`<span class="chip accent"><span class="ni-icon" data-icon="flame"></span> ${ctx.streak.unbeaten} sin perder</span>`);
    if (ctx.h2h.type === "bestia") chips.push(`<span class="chip danger"><span class="ni-icon" data-icon="flame"></span> Bestia negra</span>`);
    else if (ctx.h2h.type === "fortin") chips.push(`<span class="chip accent"><span class="ni-icon" data-icon="flag"></span> Fortín</span>`);
    if (ctx.atmos.night) chips.push(`<span class="chip"><span class="ni-icon" data-icon="moon"></span> Nocturno</span>`);
    const laps = ctx.miles / 40075;
    chips.push(`<span class="chip gold"><span class="ni-icon" data-icon="plane"></span> Viajero ${rank} · ${ctx.miles.toLocaleString("es-ES")} km${laps >= 1 ? " · " + laps.toFixed(1).replace(".", ",") + " vueltas al mundo" : ""}</span>`);
    chips.push(`<span class="chip"><span class="ni-icon" data-icon="pin"></span> ${ctx.passport} estadio${ctx.passport === 1 ? "" : "s"} en el pasaporte</span>`);
    if (ctx.h2h.nthVisit === 1 && !ctx.approx) chips.push(`<span class="chip accent"><span class="ni-icon" data-icon="pin"></span> Nuevo sello</span>`);
    if (ctx.approx) chips.push(`<span class="chip"><span class="ni-icon" data-icon="pin"></span> Ruta aproximada</span>`);
    if (isReturn) { // el marcador, en perspectiva del usuario, encabeza la vuelta
      const rr = S.userResult(c, m), gg = S.userGoals(c, m) || { for: 0, against: 0 };
      const rcls = rr === "W" ? "gold" : rr === "L" ? "danger" : "";
      const rword = rr === "W" ? "Victoria" : rr === "L" ? "Derrota" : "Empate";
      const ricon = rr === "W" ? "medal" : rr === "L" ? "flame" : "target";
      chips.unshift(`<span class="chip ${rcls}"><span class="ni-icon" data-icon="${ricon}"></span> ${rword} ${Number(gg.for)}-${Number(gg.against)}</span>`);
    }

    const beatHtml = beats.map(b => `
      <div class="trip-beat" data-bt="${b.t}">
        <span class="trip-bi tone-${b.tone}"><span class="ni-icon" data-icon="${b.icon}"></span></span>
        <div class="tb-main"><div class="tb-title">${b.title}</div>${b.sub ? `<div class="tb-sub">${b.sub}</div>` : ""}</div>
      </div>`).join("");

    const ov = document.createElement("div");
    ov.className = "live-screen trip-cabin";
    ov.innerHTML = `
      <div class="live-top">
        <div class="live-club">
          <span class="career-badge" style="background:${U.safeColor(c.badgeColor, U.colorFor(c.clubName))}">${U.initials(c.clubName)}</span>
          <div class="live-club-meta"><b>${U.esc(startCity.city)} → ${U.esc(endCity.city)}</b><small>${isReturn ? "Viaje de vuelta · " : ""}vs ${U.esc(ctx.rival)}${m.competition ? " · " + U.esc(m.competition) : ""}${m.round ? " " + U.esc(m.round) : ""}</small></div>
        </div>
        <div class="flex gap center">
          ${played ? `<div class="seg trip-dir" id="trip-dir"><button type="button" data-d="out" class="${!isReturn ? "active" : ""}">Ida</button><button type="button" data-d="return" class="${isReturn ? "active" : ""}">Vuelta</button></div>` : ""}
          <span class="trip-live" id="trip-status"><i class="trip-dot"></i> ${isReturn ? "DE VUELTA" : "EN VIVO"}</span>
          <button class="btn btn-ghost" id="trip-exit"><span class="ni-icon" data-icon="close"></span> Salir</button>
        </div>
      </div>

      <div class="flex gap wrap" style="gap:7px">${chips.join("")}</div>

      <div class="card tight trip-map">
        <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block" aria-hidden="true">
          <rect x="0" y="0" width="${W}" height="${H}" fill="${avion ? "#0a121d" : "#0c1118"}"/>
          <g stroke="#16202e" stroke-width="1"><line x1="0" y1="${H*0.3}" x2="${W}" y2="${H*0.3}"/><line x1="0" y1="${H*0.6}" x2="${W}" y2="${H*0.6}"/></g>
          <path id="trip-remain" d="${arcD}" fill="none" stroke="#2a3a52" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 7"/>
          <path id="trip-travel" d="${arcD}" fill="none" stroke="${accHex}" stroke-width="3" stroke-linecap="round"/>
          <circle cx="${o[0].toFixed(1)}" cy="${o[1].toFixed(1)}" r="7" fill="#93a6bd" fill-opacity="0.2"/><circle cx="${o[0].toFixed(1)}" cy="${o[1].toFixed(1)}" r="4" fill="#93a6bd"/>
          <text x="${(o[0]+9).toFixed(1)}" y="${(o[1]+4).toFixed(1)}" fill="#cdd9e6" font-size="12" font-weight="600">${U.esc(startCity.city)}</text>
          <circle cx="${dp[0].toFixed(1)}" cy="${dp[1].toFixed(1)}" r="9" fill="${accHex}" fill-opacity="0.2"/><circle cx="${dp[0].toFixed(1)}" cy="${dp[1].toFixed(1)}" r="4.5" fill="${accHex}"/>
          <text x="${(dp[0]+10).toFixed(1)}" y="${(dp[1]-7).toFixed(1)}" fill="#eaf1f8" font-size="12" font-weight="700">${U.esc(endCity.city)}</text>
          <foreignObject id="trip-plane" x="0" y="0" width="26" height="26"><div xmlns="http://www.w3.org/1999/xhtml" class="trip-plane-i" style="color:${accHex}">${U.icon(avion ? "plane" : "bus")}</div></foreignObject>
        </svg>
      </div>

      <div class="trip-steps" id="trip-steps">${steps.map((s, i) => `${i ? '<i></i>' : ''}<span data-si="${i}">${s}</span>`).join("")}</div>

      <div class="trip-hud">
        <div class="trip-tile"><span class="tt-lbl">${avion ? "Fase" : "Trayecto"}</span><span class="tt-val" id="trip-phase">${avion ? "Crucero" : "En ruta"}</span></div>
        <div class="trip-tile"><span class="tt-lbl">Velocidad</span><span class="tt-val">${avion ? "812 km/h" : "92 km/h"}</span></div>
        <div class="trip-tile"><span class="tt-lbl">Restante</span><span class="tt-val" id="trip-dist">${ctx.dist.toLocaleString("es-ES")} km</span></div>
      </div>

      <div class="trip-prog">
        <div class="flex between center" style="font-size:13px;margin-bottom:6px"><span id="trip-eta"><span class="ni-icon" data-icon="calendar" style="width:14px;height:14px;vertical-align:-2px"></span> ${etaPending(etaTotal)}</span><span class="faint" id="trip-pct">0%</span></div>
        <div class="bar${avion ? "" : " gold"}"><i id="trip-fill" style="width:0%"></i></div>
      </div>

      <div class="card tight">
        <div class="section-title" style="margin:2px 2px 8px"><span class="ni-icon" data-icon="book"></span> ${isReturn ? "Crónica de la vuelta" : "Bitácora de cabina"}</div>
        <div class="trip-beats">${beatHtml}</div>
      </div>

      <div class="trip-note faint"><span class="ni-icon" data-icon="bell"></span> Todo derivado de tu carrera. Es ambientación: no afecta a tu partida ni al resultado.</div>

      <div class="trip-controls" id="trip-controls">
        <div class="seg" id="trip-speed"><button type="button" data-s="1">1x</button><button type="button" data-s="2" class="active">2x</button><button type="button" data-s="8">8x</button></div>
        <button class="btn btn-ghost" id="trip-skip"><span class="ni-icon" data-icon="play"></span> Saltar al destino</button>
      </div>
    `;
    document.body.appendChild(ov);
    document.body.classList.add("trip-open");
    U.hydrateIcons(ov);

    const travel = ov.querySelector("#trip-travel"), plane = ov.querySelector("#trip-plane"), planeI = plane.firstElementChild;
    const fillEl = ov.querySelector("#trip-fill"), pctEl = ov.querySelector("#trip-pct"), distEl = ov.querySelector("#trip-dist"), etaEl = ov.querySelector("#trip-eta"), phaseEl = ov.querySelector("#trip-phase");
    const stepEls = Array.prototype.slice.call(ov.querySelectorAll("#trip-steps [data-si]"));
    const beatEls = Array.prototype.slice.call(ov.querySelectorAll(".trip-beat"));
    const L = travel.getTotalLength();
    travel.style.strokeDasharray = L;

    function setT(t) {
      travel.style.strokeDashoffset = L * (1 - t);
      const pt = travel.getPointAtLength(L * t), p2 = travel.getPointAtLength(Math.min(L, L * t + 1));
      const ang = Math.atan2(p2.y - pt.y, p2.x - pt.x) * 180 / Math.PI;
      plane.setAttribute("x", (pt.x - 13).toFixed(1)); plane.setAttribute("y", (pt.y - 13).toFixed(1));
      planeI.style.transform = "rotate(" + ang.toFixed(1) + "deg)";
      const pct = Math.round(t * 100);
      fillEl.style.width = pct + "%"; pctEl.textContent = pct + "%";
      distEl.textContent = Math.round(ctx.dist * (1 - t)).toLocaleString("es-ES") + " km";
      etaEl.innerHTML = t >= 1 ? '<span class="ni-icon" data-icon="check" style="width:14px;height:14px;vertical-align:-2px"></span> ' + etaDone
        : '<span class="ni-icon" data-icon="calendar" style="width:14px;height:14px;vertical-align:-2px"></span> ' + etaPending(Math.max(1, Math.round(etaTotal * (1 - t))));
      U.hydrateIcons(etaEl);
      let idx = 0; for (let i = 0; i < THRESH.length; i++) if (t >= THRESH[i]) idx = i;
      stepEls.forEach((el, i) => el.classList.toggle("on", i <= idx));
      phaseEl.textContent = steps[idx];
      beatEls.forEach(el => { if (Number(el.dataset.bt) <= t + 0.001) el.classList.add("show"); });
    }

    let prog = 0, last = null, raf = null, speed = 2, arrived = false;
    function arrive() {
      if (arrived) return; arrived = true;
      if (raf) cancelAnimationFrame(raf);
      prog = 1; setT(1);
      const st = ov.querySelector("#trip-status"); if (st) { st.innerHTML = '<i class="trip-dot off"></i> ' + (isReturn ? "EN CASA" : "LLEGADA"); st.classList.add("arrived"); }
      ov.querySelector("#trip-controls").innerHTML = `<button class="live-add" id="trip-cta"><span class="ni-icon" data-icon="${isReturn ? "check" : "ball"}"></span> ${isReturn ? "Ver resultado del partido" : "Listo para el partido"}</button>`;
      U.hydrateIcons(ov.querySelector("#trip-controls"));
      ov.querySelector("#trip-cta").addEventListener("click", () => { close(); UI.openMatchModal(c, m, { mode: "result" }); });
    }
    function loop(ts) {
      if (last == null) last = ts;
      prog = Math.min(1, prog + (ts - last) * speed / baseDur); last = ts;
      setT(prog);
      if (prog >= 1) { arrive(); return; }
      raf = requestAnimationFrame(loop);
    }
    const baseDur = Math.min(20000, 8000 + ctx.dist * 6);

    function close() {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      ov.remove(); document.body.classList.remove("trip-open");
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    ov.querySelector("#trip-exit").addEventListener("click", close);
    ov.querySelector("#trip-skip").addEventListener("click", () => { prog = 1; setT(1); arrive(); });
    ov.querySelectorAll("#trip-speed button").forEach(b => b.addEventListener("click", () => {
      speed = Number(b.dataset.s) || 1;
      ov.querySelectorAll("#trip-speed button").forEach(x => x.classList.toggle("active", x === b));
    }));
    const dirSeg = ov.querySelector("#trip-dir"); // alternar ida/vuelta: cierra y reabre en la otra dirección
    if (dirSeg) dirSeg.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      const nd = b.dataset.d === "return" ? "return" : "out";
      if ((nd === "return") === isReturn) return;
      close(); UI.openTrip(c, m, { dir: nd });
    }));

    setT(0);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { arrive(); }
    else raf = requestAnimationFrame(loop);
  };

  /* ============================================================
     PLANTILLA
     ============================================================ */
  // Estado de filtros de la Plantilla (módulo: persiste entre re-renders por S.emit).
  let squadView = { q: "", group: "", sort: "pos" };
  let squadTab = "jugadores"; // "jugadores" | "analisis" (pirámide+jerarquía+carga)
  const SQUAD_GROUPS = ["Portería", "Defensa", "Medio", "Banda", "Ataque"];
  const SQUAD_SORTS = [["pos","Posición"],["ovr","OVR"],["pot","Potencial"],["age-asc","Edad ↑"],["age-desc","Edad ↓"],["goals","Goles"],["assists","Asistencias"],["motm","MOTM"]];
  FC.views.squad = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const agg = S.playerAggregates(c, season.id);
    const players = (c.players || []).slice();
    const injuries = S.activeInjuries(c);
    const injuredNames = new Set(injuries.map(i => (i.player||"").trim().toLowerCase()));
    const aggOf = (p) => agg[(p.name||"").trim().toLowerCase()] || {};
    const posIdx = (p) => { const o = D.POS_ORDER[p.position]; return o == null ? 99 : o; }; // GK=0: usar ?? no ||
    const posCmp = (a,b) => posIdx(a) - posIdx(b) || (b.ovr||0) - (a.ovr||0);
    function sortCmp(a, b) {
      const aa = aggOf(a), ab = aggOf(b);
      switch (squadView.sort) {
        case "ovr": return (b.ovr||0)-(a.ovr||0) || posCmp(a,b);
        case "pot": return (b.potential||0)-(a.potential||0) || posCmp(a,b);
        case "age-asc": return (a.age||999)-(b.age||999) || posCmp(a,b);
        case "age-desc": return (b.age||0)-(a.age||0) || posCmp(a,b);
        case "goals": return (ab.goals||0)-(aa.goals||0) || posCmp(a,b);
        case "assists": return (ab.assists||0)-(aa.assists||0) || posCmp(a,b);
        case "motm": return (ab.motm||0)-(aa.motm||0) || posCmp(a,b);
        default: return posCmp(a,b);
      }
    }
    function matches(p) {
      const q = squadView.q.trim().toLowerCase();
      if (q && !((p.name||"").toLowerCase().includes(q) || (p.nationality||"").toLowerCase().includes(q))) return false;
      if (squadView.group && (D.POS_GROUP[p.position] || "") !== squadView.group) return false;
      return true;
    }
    function rowHtml(p) {
      const a = aggOf(p); const injured = injuredNames.has((p.name||"").trim().toLowerCase());
      return `<tr data-player="${p.id}" style="cursor:pointer${injured ? ";background:color-mix(in srgb,var(--danger) 8%,transparent)" : ""}">
        <td><div class="flex gap center"><div class="avatar" style="background:${U.safeColor(p.badge, U.colorFor(p.name))}">${U.initials(p.name)}</div>
          <div><b>${U.esc(p.name)}</b>${injured ? ' <span class="chip" style="background:var(--danger);color:#fff;padding:1px 6px;font-size:10px">lesión</span>' : ""}${p.fromYouth?' <span class="chip accent" style="padding:1px 6px;font-size:10px">cantera</span>':""}<br><small class="faint">${U.esc(p.nationality||"")}</small></div></div></td>
        <td><span class="chip">${U.esc(p.position||"—")}</span></td>
        <td class="num"><span class="ovr ${U.ovrClass(p.ovr)}">${p.ovr||"—"}</span></td>
        <td class="num faint">${p.potential||"—"}</td><td class="num">${p.age||"—"}</td>
        <td class="num">${a.goals||0}</td><td class="num">${a.assists||0}</td><td class="num">${a.motm||0}</td>
        <td><button class="icon-btn sm" data-del-player="${p.id}"><span class="ni-icon" data-icon="trash"></span></button></td></tr>`;
    }
    const rosterHtml = `
      ${injuries.length ? `<div class="card tight" style="margin-bottom:16px">
        <div class="card-head"><h3 style="color:var(--danger)"><span class="ni-icon" data-icon="bandage"></span> Enfermería</h3></div>
        <div class="list">${injuries.map(i => `<div class="list-row">
          <div class="lr-main"><b>${U.esc(i.player)}</b>${i.type ? `<span class="faint" style="margin-left:8px">${U.esc(i.type)}</span>` : ""}${i.matchesOut ? `<span class="chip" style="margin-left:8px">${i.matchesOut} partido${i.matchesOut>1?"s":""}</span>` : ""}</div>
          <button class="btn btn-ghost btn-sm" data-recover="${i.id}">Alta</button>
          <button class="icon-btn sm" data-del-injury="${i.id}"><span class="ni-icon" data-icon="trash"></span></button>
        </div>`).join("")}</div>
      </div>` : ""}
      <div class="card tight">
        ${players.length ? `<div class="squad-toolbar">
          <input type="search" id="sq-search" placeholder="Buscar jugador o país..." value="${U.esc(squadView.q)}"/>
          <select id="sq-group"><option value="">Todas las zonas</option>${SQUAD_GROUPS.map(g=>`<option value="${g}" ${squadView.group===g?"selected":""}>${g}</option>`).join("")}</select>
          <select id="sq-sort">${SQUAD_SORTS.map(([v,l])=>`<option value="${v}" ${squadView.sort===v?"selected":""}>Orden: ${l}</option>`).join("")}</select>
          <span class="faint" id="sq-count" style="margin-left:auto"></span>
        </div>
        <div class="table-wrap"><table class="tbl"><thead><tr>
          <th>Jugador</th><th>Pos</th><th class="num">OVR</th><th class="num">POT</th><th class="num">Edad</th><th class="num">G</th><th class="num">A</th><th class="num">MOTM</th><th></th>
        </tr></thead><tbody id="sq-body"></tbody></table></div>` : `<div class="empty"><div class="emoji">👕</div><h3>Plantilla vacía</h3><p>Añade tus jugadores para seguir sus estadísticas y planificar.</p></div>`}
      </div>`;
    const analysisHtml = `${ageProfileCardHtml(c)}${squadHierarchyCardHtml(c)}${loadCardHtml(c, season.id)}${politicalCapitalCardHtml(c, season.id)}${setPieceCardHtml(c)}`;
    UI.mount(`
      <div class="page-head"><div><h1>Plantilla</h1><div class="sub">${players.length} jugadores · ${U.esc(season.label)}</div></div>
        <div class="flex gap center wrap">
          <button class="btn btn-ghost" id="sq-injury"><span class="ni-icon" data-icon="bandage"></span> Enfermería${injuries.length ? ` <span class="chip" style="background:var(--danger);color:#fff;padding:1px 7px">${injuries.length}</span>` : ""}</button>
          ${(D.SQUADS||{})[c.clubName] ? `<button class="btn btn-ghost" id="sq-import"><span class="ni-icon" data-icon="download"></span> Importar EA FC</button>` : ""}
          <button class="btn btn-primary" id="sq-add"><span class="ni-icon" data-icon="plus"></span> Añadir jugador</button>
        </div>
      </div>
      ${players.length ? `<div class="seg" id="sq-tabs" style="margin-bottom:14px">
        <button type="button" data-t="jugadores" class="${squadTab==="jugadores"?"active":""}">Jugadores</button>
        <button type="button" data-t="analisis" class="${squadTab==="analisis"?"active":""}">Análisis</button>
      </div>` : ""}
      ${(players.length && squadTab === "analisis") ? analysisHtml : rosterHtml}
    `);
    document.querySelectorAll("#sq-tabs button").forEach(b => b.addEventListener("click", () => { squadTab = b.dataset.t; FC.views.squad(); }));
    content().querySelectorAll("#sq-hier [data-player]").forEach(r => r.addEventListener("click", () => UI.openPlayerCard(c, c.players.find(p => p.id === r.dataset.player))));
    content().querySelectorAll("#sq-setpiece .sp-sel").forEach(sel => sel.addEventListener("change", () => S.setSetPieceTaker(c, sel.dataset.role, sel.value || null)));
    function wireRows() {
      const body = document.getElementById("sq-body");
      if (!body) return;
      body.querySelectorAll("[data-player]").forEach(r => r.addEventListener("click", (e) => {
        if (e.target.closest("[data-del-player]")) return;
        UI.openPlayerCard(c, c.players.find(p => p.id === r.dataset.player));
      }));
      body.querySelectorAll("[data-del-player]").forEach(b => b.addEventListener("click", () =>
        UI.confirm("¿Eliminar a este jugador?", () => { S.deletePlayer(c, b.dataset.delPlayer); UI.toast("Jugador eliminado"); }, true)));
    }
    function applyFilters() {
      const body = document.getElementById("sq-body");
      if (!body) return;
      const list = players.filter(matches).sort(sortCmp);
      body.innerHTML = list.length ? list.map(rowHtml).join("") : `<tr><td colspan="9"><div class="empty" style="padding:30px"><div class="emoji">🔍</div><p>Ningún jugador coincide con el filtro.</p></div></td></tr>`;
      U.hydrateIcons(body);
      wireRows();
      const cnt = document.getElementById("sq-count");
      if (cnt) cnt.textContent = (list.length === players.length) ? "" : `${list.length} de ${players.length}`;
    }
    document.getElementById("sq-add").addEventListener("click", () => playerModal(c));
    document.getElementById("sq-injury").addEventListener("click", () => injuryModal(c));
    const sqImport = document.getElementById("sq-import");
    if (sqImport) sqImport.addEventListener("click", () => importSquadModal(c));
    const search = document.getElementById("sq-search");
    if (search) {
      search.addEventListener("input", () => { squadView.q = search.value; applyFilters(); });
      document.getElementById("sq-group").addEventListener("change", (e) => { squadView.group = e.target.value; applyFilters(); });
      document.getElementById("sq-sort").addEventListener("change", (e) => { squadView.sort = e.target.value; applyFilters(); });
      applyFilters();
    }
    content().querySelectorAll("[data-recover]").forEach(b => b.addEventListener("click", () => { S.recoverInjury(c, b.dataset.recover); UI.toast("Jugador recuperado"); }));
    content().querySelectorAll("[data-del-injury]").forEach(b => b.addEventListener("click", () => { S.deleteInjury(c, b.dataset.delInjury); UI.toast("Lesión eliminada"); }));
  };
  // Ficha completa de un jugador: atributos, contribución (temporada y carrera),
  // progresión de OVR e historial de lesiones. Botón "Editar" → playerModal.
  UI.openPlayerCard = function (c, p) {
    if (!p) return;
    const season = S.currentSeason(c);
    const norm = (s) => String(s == null ? "" : s).trim().toLowerCase();
    const nameKey = norm(p.name);
    // Clave canónica espejo de keyOf en playerAggregates: nombre, o "id:" como
    // fallback si no hay nombre. Así la ficha casa con los agregados.
    const key = nameKey || ("id:" + p.id);
    const sAgg = (S.playerAggregates(c, season.id))[key] || { goals:0, assists:0, motm:0, apps:0 };
    const cAgg = (S.playerAggregates(c, null))[key] || { goals:0, assists:0, motm:0, apps:0 };
    // Coincidencia de eventos: por nombre normalizado o por playerId (cubre el
    // caso de un jugador renombrado tras registrar partidos).
    const isMe = (name, id) => (nameKey && norm(name) === nameKey) || (id != null && id === p.id);
    const series = S.playerSeries(c, p);
    const ovrs = series.map(s => s.ovr);
    const cur = ovrs.length ? ovrs[ovrs.length - 1] : (Number(p.ovr) || null);
    const peak = ovrs.length ? Math.max(...ovrs) : cur;
    const first = ovrs.length ? ovrs[0] : cur;
    const improve = (cur != null && first != null) ? cur - first : 0;
    const injuriesAll = (c.injuries || []).filter(i => nameKey && norm(i.player) === nameKey);
    const activeInj = injuriesAll.filter(i => i.active !== false);
    const contribs = [];
    S.userMatches(c).forEach(m => {
      const g = (m.events || []).filter(e => e.type === "goal" && isMe(e.player, e.playerId)).length;
      const a = (m.events || []).filter(e => e.type === "assist" && isMe(e.player, e.playerId)).length;
      const motm = isMe(m.motm, m.motmId);
      const rt = (m.ratings || []).find(r => isMe(r.name, r.playerId));
      if (g || a || motm || rt) contribs.push({ m, g, a, motm, rt });
    });
    contribs.sort((x, y) => new Date(y.m.date || 0) - new Date(x.m.date || 0));
    const body = `
      <div class="pc-head">
        <div class="avatar lg" style="background:${U.safeColor(p.badge, U.colorFor(p.name))}">${U.initials(p.name)}</div>
        <div class="pc-id">
          <div class="pc-name"><b>${U.esc(p.name)}</b>
            <span class="chip">${U.esc(p.position||"—")}</span>
            ${p.fromYouth ? '<span class="chip accent">cantera</span>' : ""}
            ${activeInj.length ? '<span class="chip" style="background:var(--danger);color:#fff">lesión</span>' : ""}
          </div>
          <div class="faint">${U.esc(p.nationality||"—")}${p.age ? " · " + p.age + " años" : ""}${p.squadRole ? " · " + U.esc(p.squadRole) : ""}</div>
        </div>
      </div>
      <div class="grid cols-4 keep-2" style="margin:14px 0">
        ${statTile("OVR", `<span class="ovr ${U.ovrClass(cur)}">${cur||"—"}</span>`, (peak && peak !== cur) ? ("pico " + peak) : "")}
        ${statTile("Potencial", p.potential||"—", improve ? ((improve > 0 ? "+" : "") + improve + " desde inicio") : "")}
        ${statTile("Valor", p.value ? U.money(p.value) : "—", p.wage ? U.money(p.wage) + "/año" : "")}
        ${statTile("Contrato", p.contractEnd ? ("hasta " + U.esc(p.contractEnd)) : "—", "")}
      </div>
      <div class="section-title">Contribución <span class="faint" style="font-weight:400">· ${U.esc(season.label)} · (carrera)</span></div>
      <div class="grid cols-4 keep-2">
        ${statTile("Goles", sAgg.goals||0, (cAgg.goals||0) + " en carrera")}
        ${statTile("Asistencias", sAgg.assists||0, (cAgg.assists||0) + " en carrera")}
        ${statTile("MOTM", sAgg.motm||0, (cAgg.motm||0) + " en carrera")}
        ${statTile("Partidos", sAgg.apps||0, (cAgg.apps||0) + " en carrera")}
      </div>
      ${(sAgg.ratingN || cAgg.ratingN) ? `<div class="grid cols-2 keep-2" style="margin-top:8px">
        ${statTile("Nota media", sAgg.ratingN ? sAgg.avg.toFixed(1) : "—", cAgg.ratingN ? cAgg.avg.toFixed(1) + " en carrera (" + cAgg.ratingN + " partidos)" : "")}
        ${statTile("Minutos", sAgg.minutes ? sAgg.minutes.toLocaleString("es-ES") : "—", cAgg.minutes ? cAgg.minutes.toLocaleString("es-ES") + " en carrera" : "")}
      </div>` : ""}
      ${ovrs.length >= 2 ? `<div class="section-title">Progresión de OVR</div>${CH.line(ovrs, { h: 110, color: improve >= 0 ? "var(--accent)" : "var(--danger)" })}
        <div class="table-wrap" style="margin-top:12px"><table class="tbl"><thead><tr><th>Temporada</th><th class="num">OVR</th><th class="num">Edad</th></tr></thead><tbody>
        ${series.slice().reverse().map(s => `<tr><td>${U.esc(s.label)}${s.current ? ' <span class="chip accent" style="padding:1px 6px;font-size:10px">actual</span>' : ""}</td><td class="num"><span class="ovr ${U.ovrClass(s.ovr)}">${s.ovr}</span></td><td class="num faint">${s.age||"—"}</td></tr>`).join("")}
        </tbody></table></div>` : ""}
      ${contribs.length ? `<div class="section-title">Últimas actuaciones</div>
        <div class="list">${contribs.slice(0, 8).map(({ m, g, a, motm, rt }) => {
          const opp = m.home === c.clubName ? m.away : m.home;
          const gg = S.userGoals(c, m); const r = S.userResult(c, m);
          const rc = r === "W" ? "win" : r === "L" ? "loss" : "";
          return `<div class="list-row">
            <span class="fx-score ${rc}" style="min-width:46px">${gg ? gg.for + "-" + gg.against : ""}</span>
            <div class="lr-main"><b>${U.esc(opp||"—")}</b><small class="faint">${U.esc(m.competition||"")}${m.round ? " · " + U.esc(m.round) : ""}${m.date ? " · " + U.fmtDate(m.date) : ""}</small></div>
            <span class="pc-contrib">${g ? `<span>⚽ ${g}</span>` : ""}${a ? `<span>🅰️ ${a}</span>` : ""}${motm ? `<span>⭐</span>` : ""}${rt && rt.rating != null ? `<span class="chip" style="font-size:11px;padding:1px 6px">${Number(rt.rating).toFixed(1)}</span>` : ""}</span>
          </div>`;
        }).join("")}</div>` : ""}
      ${injuriesAll.length ? `<div class="section-title">Historial de lesiones</div>
        <div class="list">${injuriesAll.slice().reverse().map(i => `<div class="list-row">
          <span class="ni-icon" data-icon="bandage" style="color:var(--danger)"></span>
          <div class="lr-main"><b>${U.esc(i.type||"Lesión")}</b><small class="faint">${i.matchesOut ? i.matchesOut + " partido" + (i.matchesOut > 1 ? "s" : "") : "sin estimación"}${i.active === false ? " · recuperado" : " · activa"}</small></div>
        </div>`).join("")}</div>` : ""}
    `;
    UI.openModal(p.name, body,
      `<button class="btn btn-ghost" data-close>Cerrar</button><button class="btn btn-ghost" id="pc-cmp"><span class="ni-icon" data-icon="table"></span> Comparar</button><button class="btn btn-primary" id="pc-edit"><span class="ni-icon" data-icon="edit"></span> Editar</button>`, { lg: true });
    const editBtn = document.getElementById("pc-edit");
    if (editBtn) editBtn.addEventListener("click", () => { UI.closeModal(); playerModal(c, p); });
    const cmpBtn = document.getElementById("pc-cmp");
    if (cmpBtn) cmpBtn.addEventListener("click", () => { UI.closeModal(); UI.openCompare(c, p); });
  };

  UI.openCompare = function (c, p1) {
    if (!p1) return;
    const season = S.currentSeason(c);
    const norm = (s) => String(s == null ? "" : s).trim().toLowerCase();

    function getStats(p) {
      const nameKey = norm(p.name);
      const key = nameKey || ("id:" + p.id);
      const sAgg = (S.playerAggregates(c, season.id))[key] || {};
      const cAgg = (S.playerAggregates(c, null))[key] || {};
      const series = S.playerSeries(c, p);
      const ovrs = series.map(sv => sv.ovr);
      const cur = ovrs.length ? ovrs[ovrs.length - 1] : (Number(p.ovr) || null);
      const peak = ovrs.length ? Math.max(...ovrs) : cur;
      return { sAgg, cAgg, cur, peak };
    }

    function renderCompare(p2) {
      const st1 = getStats(p1);
      const st2 = p2 ? getStats(p2) : null;

      const pHead = (p, st) => `<div style="flex:1;text-align:center">
        <div class="avatar" style="background:${U.safeColor(p.badge, U.colorFor(p.name))};margin:0 auto 6px">${U.initials(p.name)}</div>
        <div style="font-weight:700;font-size:14px;margin-bottom:2px">${U.esc(p.name)}</div>
        <div class="faint" style="font-size:12px">${U.esc(p.position||"—")}${p.age ? " · " + p.age + " a" : ""}</div>
        <span class="ovr ${U.ovrClass(st.cur)}" style="font-size:20px;font-weight:800;display:block;margin-top:6px">${st.cur||"—"}</span>
      </div>`;

      const header = `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:18px;border-bottom:1px solid var(--line);padding-bottom:14px">
        ${pHead(p1, st1)}
        <div style="align-self:center;font-weight:700;color:var(--text2);font-size:15px;padding:0 4px">vs</div>
        ${p2 ? pHead(p2, st2) : `<div style="flex:1;text-align:center;color:var(--text2);font-size:13px;padding-top:24px">—</div>`}
      </div>`;

      // dir: 1 = higher is better, -1 = lower is better, 0 = no comparison
      const rows = [
        { label: "Potencial",      v1: Number(p1.potential)||0, v2: p2 ? Number(p2.potential)||0 : null, fmt: v => v||"—" },
        { label: "Valor",          v1: p1.value||0, v2: p2 ? p2.value||0 : null, fmt: v => v ? U.money(v) : "—" },
        null,
        { label: "Goles (temp.)",  v1: st1.sAgg.goals||0, v2: st2 ? st2.sAgg.goals||0 : null, fmt: v => v },
        { label: "Asistencias",    v1: st1.sAgg.assists||0, v2: st2 ? st2.sAgg.assists||0 : null, fmt: v => v },
        { label: "MOTM",           v1: st1.sAgg.motm||0, v2: st2 ? st2.sAgg.motm||0 : null, fmt: v => v },
        { label: "Partidos",       v1: st1.sAgg.apps||0, v2: st2 ? st2.sAgg.apps||0 : null, fmt: v => v },
        { label: "Nota media",     v1: st1.sAgg.ratingN ? st1.sAgg.avg : null, v2: st2 && st2.sAgg.ratingN ? st2.sAgg.avg : null, fmt: v => v != null ? Number(v).toFixed(1) : "—" },
        { label: "Minutos",        v1: st1.sAgg.minutes||0, v2: st2 ? st2.sAgg.minutes||0 : null, fmt: v => v ? v.toLocaleString("es-ES") : "—" },
        null,
        { label: "Goles (carrera)", v1: st1.cAgg.goals||0, v2: st2 ? st2.cAgg.goals||0 : null, fmt: v => v },
        { label: "Asist. (carrera)", v1: st1.cAgg.assists||0, v2: st2 ? st2.cAgg.assists||0 : null, fmt: v => v },
        { label: "Partidos (carrera)", v1: st1.cAgg.apps||0, v2: st2 ? st2.cAgg.apps||0 : null, fmt: v => v },
      ];

      const tableRows = rows.map(row => {
        if (!row) return `<tr><td colspan="3" style="padding:4px 0"><hr style="border:none;border-top:1px solid var(--line);margin:0"/></td></tr>`;
        const { label, v1, v2, fmt } = row;
        const hasP2 = p2 != null && v2 != null;
        const win1 = hasP2 && v1 > v2;
        const win2 = hasP2 && v2 > v1;
        const s1 = win1 ? "color:var(--accent);font-weight:700" : win2 ? "color:var(--text2)" : "font-weight:600";
        const s2 = win2 ? "color:var(--accent);font-weight:700" : win1 ? "color:var(--text2)" : "font-weight:600";
        return `<tr>
          <td style="${s1};text-align:right;padding:5px 10px;font-size:13px">${fmt(v1)}</td>
          <td style="text-align:center;padding:5px 4px;font-size:11px;color:var(--text2);white-space:nowrap">${U.esc(label)}</td>
          <td style="${s2};text-align:left;padding:5px 10px;font-size:13px">${p2 ? fmt(v2) : "<span style='color:var(--text2)'>—</span>"}</td>
        </tr>`;
      }).join("");

      return header + `<table style="width:100%;border-collapse:collapse">${tableRows}</table>`;
    }

    const dlHtml = `<datalist id="cmp-dl">${(c.players||[]).filter(q => q.id !== p1.id).map(q => `<option value="${U.esc(q.name)}">`).join("")}</datalist>`;

    UI.openModal("Comparar jugadores",
      `${dlHtml}<div class="field" style="margin-bottom:16px"><label>Comparar ${U.esc(p1.name)} con…</label>
        <input type="text" id="cmp-pick" list="cmp-dl" placeholder="Escribe el nombre del jugador" style="font-size:14px"/>
      </div><div id="cmp-body">${renderCompare(null)}</div>`,
      `<button class="btn btn-ghost" id="cmp-back">← Volver a la ficha</button><button class="btn btn-primary" data-close>Cerrar</button>`, { lg: true });

    document.getElementById("cmp-pick").addEventListener("input", function () {
      const name = this.value.trim().toLowerCase();
      const p2 = (c.players||[]).find(q => q.id !== p1.id && norm(q.name) === name);
      document.getElementById("cmp-body").innerHTML = renderCompare(p2 || null);
    });
    document.getElementById("cmp-back").addEventListener("click", () => { UI.closeModal(); UI.openPlayerCard(c, p1); });
  };

  function importSquadModal(c) {
    const roster = (D.SQUADS || {})[c.clubName];
    if (!roster || !roster.length) { UI.toast("No hay plantilla disponible para este club", "err"); return; }
    const hasPlayers = (c.players || []).length > 0;
    const body = `<p>Se importarán <b>${roster.length} jugadores</b> de <b>${U.esc(c.clubName)}</b> (EA FC 25).</p>
      ${hasPlayers ? `<div class="field" style="margin-top:12px"><label>Plantilla actual (${c.players.length} jugadores)</label>
        <select id="imp-mode">
          <option value="merge">Fusionar (mantener existentes, añadir nuevos)</option>
          <option value="replace">Reemplazar (eliminar todos y cargar de nuevo)</option>
        </select></div>` : ""}`;
    UI.openModal("Importar plantilla EA FC 25", body,
      `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="imp-confirm"><span class="ni-icon" data-icon="download"></span> Importar</button>`);
    document.getElementById("imp-confirm").addEventListener("click", () => {
      const mode = hasPlayers ? (document.getElementById("imp-mode").value) : "replace";
      if (mode === "replace") c.players = [];
      const existing = new Set((c.players||[]).map(p => (p.name||"").trim().toLowerCase()));
      let added = 0;
      roster.forEach(r => {
        if (mode === "merge" && existing.has((r.name||"").trim().toLowerCase())) return;
        S.addPlayer(c, { name: r.name, position: r.pos, age: r.age, ovr: r.ovr, potential: r.potential || 0, nationality: r.nat || "" });
        added++;
      });
      S.save(); UI.closeModal();
      UI.toast(`${added} jugadores importados`, "ok");
    });
  }
  function playerModal(c, ex) {
    ex = ex || {};
    const posOpts = D.POSITIONS.map(p => `<option ${p === ex.position ? "selected" : ""}>${p}</option>`).join("");
    UI.openModal(ex.id ? "Editar jugador" : "Añadir jugador", `
      <div class="field"><label>Nombre</label><input type="text" id="p-name" value="${U.esc(ex.name||"")}"/></div>
      <div class="field-row three">
        <div class="field"><label>Posición</label><select id="p-pos">${posOpts}</select></div>
        <div class="field"><label>Edad</label><input type="number" id="p-age" value="${ex.age||""}"/></div>
        <div class="field"><label>Nacionalidad</label><input type="text" id="p-nat" value="${U.esc(ex.nationality||"")}"/></div>
      </div>
      <div class="field-row three">
        <div class="field"><label>Media (OVR)</label><input type="number" id="p-ovr" min="40" max="99" value="${ex.ovr||""}"/></div>
        <div class="field"><label>Potencial</label><input type="number" id="p-pot" min="40" max="99" value="${ex.potential||""}"/></div>
        <div class="field"><label>Valor (€)</label><input type="number" id="p-val" value="${ex.value||""}"/></div>
      </div>
      <div class="field-row three">
        <div class="field"><label>Fin de contrato (año)</label><input type="number" id="p-con" value="${ex.contractEnd||""}" placeholder="p.ej. 2028"/></div>
        <div class="field"><label>Sueldo (€/año)</label><input type="number" id="p-wage" min="0" value="${ex.wage||""}" placeholder="opcional"/></div>
        <div class="field"><label>Rol en plantilla</label><select id="p-role">
          ${["Estrella","Titular","Rotación","Promesa"].map(r => `<option ${r === ex.squadRole ? "selected" : ""}>${r}</option>`).join("")}</select></div>
      </div>
      <label class="inline-check" style="margin-top:4px"><input type="checkbox" id="p-youth" ${ex.fromYouth ? "checked" : ""}/> Procede de la cantera</label>
      ${!ex.id ? `<div class="divider"></div><label class="inline-check"><input type="checkbox" id="p-sign"/> Registrar como incorporación (para finanzas y retos)</label>
        <div id="p-sign-box" hidden style="margin-top:10px"><div class="field-row three">
          <div class="field"><label>Tipo</label><select id="p-stype"><option value="transfer">Traspaso</option><option value="free">Libre</option><option value="loan">Cesión</option><option value="youth">Cantera</option></select></div>
          <div class="field"><label>Coste (€)</label><input type="number" id="p-fee" value="0"/></div>
          <div class="field"><label>Procedencia</label><input type="text" id="p-from" placeholder="Club"/></div>
        </div></div>` : ""}
    `, `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="p-save">Guardar</button>`, { lg: true });
    const signChk = document.getElementById("p-sign");
    if (signChk) signChk.addEventListener("change", () => { document.getElementById("p-sign-box").hidden = !signChk.checked; });
    document.getElementById("p-save").addEventListener("click", () => {
      const name = document.getElementById("p-name").value.trim();
      if (!name) { UI.toast("Escribe el nombre", "err"); return; }
      const data = {
        name, position: document.getElementById("p-pos").value, age: Number(document.getElementById("p-age").value) || null,
        nationality: document.getElementById("p-nat").value.trim(), ovr: Number(document.getElementById("p-ovr").value) || null,
        potential: Number(document.getElementById("p-pot").value) || null, value: Number(document.getElementById("p-val").value) || 0,
        contractEnd: document.getElementById("p-con").value, squadRole: document.getElementById("p-role").value,
        wage: Number(document.getElementById("p-wage").value) || 0,
        fromYouth: document.getElementById("p-youth").checked,
      };
      if (ex.id) { S.updatePlayer(c, ex.id, data); UI.toast("Jugador actualizado", "ok"); }
      else {
        if (signChk && signChk.checked) data._signing = {
          seasonId: S.currentSeason(c).id, direction: "in", player: name,
          type: document.getElementById("p-stype").value, fee: Number(document.getElementById("p-fee").value) || 0,
          club: document.getElementById("p-from").value.trim(), date: "",
        };
        S.addPlayer(c, data); UI.toast("Jugador añadido", "ok");
      }
      UI.closeModal();
    });
  }

  function injuryModal(c) {
    const players = (c.players || []).map(p => p.name).filter(Boolean);
    UI.openModal("Registrar lesión", `
      <div class="field"><label>Jugador</label>
        <input type="text" id="inj-player" list="dl-inj-players" placeholder="Nombre del jugador"/>
        <datalist id="dl-inj-players">${players.map(n => `<option value="${U.esc(n)}">`).join("")}</datalist>
      </div>
      <div class="field"><label>Tipo de lesión (opcional)</label>
        <input type="text" id="inj-type" placeholder="p.ej. Muscular, Rodilla, Tobillo..."/>
      </div>
      <div class="field"><label>Partidos de baja estimados</label>
        <input type="number" id="inj-out" min="0" value="0" placeholder="0"/>
      </div>`,
      `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="inj-save">Añadir lesión</button>`);
    document.getElementById("inj-save").addEventListener("click", () => {
      const player = document.getElementById("inj-player").value.trim();
      if (!player) { UI.toast("Indica el jugador", "err"); return; }
      S.addInjury(c, { player, type: document.getElementById("inj-type").value.trim(), matchesOut: Number(document.getElementById("inj-out").value) || 0 });
      UI.closeModal();
      UI.toast("Lesión registrada", "ok");
    });
  }

  /* ============================================================
     DESARROLLO DE JUGADORES
     ============================================================ */
  // Mini-sparkline SOLO de trazo (sin gradiente ni id) — evita la colisión del
  // id="lg" de CH.line al pintar muchos en una tabla. Recibe array de números.
  function miniSpark(values, opts) {
    opts = opts || {};
    const w = opts.w || 120, h = opts.h || 30, pad = 3;
    const vals = (values || []).filter(v => Number.isFinite(v));
    if (vals.length < 2) return `<span class="faint" style="font-size:12px">—</span>`;
    const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
    const stepX = (w - pad * 2) / (vals.length - 1);
    const pts = vals.map((v, i) => [pad + i * stepX, h - pad - ((v - min) / range) * (h - pad * 2)]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const col = opts.color || "var(--accent)";
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${w} ${h}" style="width:${w}px;height:${h}px;vertical-align:middle">
      <path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.4" fill="${col}"/></svg>`;
  }
  // Gráfico de dos líneas: puntos reales (sólida) vs esperados/xPts (discontinua).
  // Solo trazo, sin <defs>/id (evita la colisión del id="lg" de CH.line).
  function xptsChart(series) {
    const w = 600, h = 140, pad = 10;
    const pts = (series || []).filter(s => s && Number.isFinite(s.actual) && Number.isFinite(s.xpts));
    if (pts.length < 2) return "";
    const max = Math.max(1, ...pts.map(s => Math.max(s.actual, s.xpts)));
    const stepX = (w - pad * 2) / (pts.length - 1);
    const Y = (v) => h - pad - (v / max) * (h - pad * 2);
    const X = (i) => pad + i * stepX;
    const path = (key) => pts.map((s, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(s[key]).toFixed(1)).join(" ");
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:${h}px">
      <path d="${path("xpts")}" fill="none" stroke="var(--accent-2)" stroke-width="2.2" stroke-dasharray="5 4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${path("actual")}" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  }
  // Color por tono de veredicto de suerte (xPts).
  function luckColor(tone) {
    return tone === "ok" ? "var(--ok)" : tone === "lucky" ? "var(--warn)" : tone === "unlucky" ? "var(--accent-2)" : "var(--text-dim)";
  }
  // Tarjeta "Análisis de rendimiento (xPts)" — usada en Partidos. "" si no hay xG.
  function luckCardHtml(c, seasonId) {
    const l = S.luckSummary(c, seasonId);
    if (!l) return "";
    const d = l.diff;
    let vTone, vText;
    if (d >= 2) { vTone = "lucky"; vText = "Rindes por encima de tu juego: llevas " + f1(d) + " puntos más de los esperados por tu xG. Suele corregirse a la baja."; }
    else if (d <= -2) { vTone = "unlucky"; vText = "Mereces más: te faltan " + f1(-d) + " puntos respecto a tu xG. La suerte debería equilibrarse a tu favor."; }
    else { vTone = "ok"; vText = "Tus resultados reflejan fielmente tu juego (" + (d >= 0 ? "+" : "") + f1(d) + " frente a tu xPts)."; }
    const vCol = luckColor(vTone);
    const finTxt = l.finishing != null ? f1(l.finishing) + "×" : "—";
    const defTxt = l.defending != null ? f1(l.defending) + "×" : "—";
    const matchRows = l.matches.slice(0, 10).map(mm => {
      const col = luckColor(mm.verdict.tone);
      return `<div class="list-row" data-match="${U.esc(String(mm.id))}" style="cursor:pointer">
        <span class="pill-${mm.res.toLowerCase()}">${mm.res}</span>
        <div class="lr-main"><b>${U.esc(mm.rival || "—")}</b><small class="faint">${mm.gf}-${mm.ga} · xG ${f1(mm.xgF)}-${f1(mm.xgA)}</small></div>
        <span class="chip" style="background:transparent;border:1px solid ${col};color:${col};font-weight:700;flex-shrink:0">${mm.verdict.label}</span>
      </div>`;
    }).join("");
    return `<div class="card">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="growth"></span> Análisis de rendimiento <span class="faint" style="font-weight:400">· xPts · ${l.count} ${l.count === 1 ? "partido" : "partidos"} con xG</span></div>
      <div style="border-left:3px solid ${vCol};padding:8px 0 8px 12px;margin-bottom:14px;color:var(--text)">${vText}</div>
      <div class="grid cols-3 keep-2" style="margin-bottom:8px">
        ${statTile("Puntos reales", l.actualPts, l.count + " partidos")}
        ${statTile("Esperados (xPts)", f1(l.xpts), "según tu xG")}
        ${statTile("Diferencia", `<span style="color:${vCol}">${(d >= 0 ? "+" : "") + f1(d)}</span>`, "real − xPts")}
      </div>
      ${l.series.length > 1 ? `<div style="margin:6px 0 4px">${xptsChart(l.series)}</div>
      <div class="flex gap center wrap" style="font-size:12px;margin-bottom:12px">
        <span class="flex gap center"><i style="display:inline-block;width:14px;height:3px;background:var(--accent);border-radius:2px"></i> Puntos reales</span>
        <span class="flex gap center"><i style="display:inline-block;width:14px;height:0;border-top:3px dashed var(--accent-2)"></i> Esperados (xPts)</span>
      </div>` : ""}
      <div class="grid cols-3 keep-2" style="margin-bottom:8px">
        ${statTile("Definición", finTxt, l.gf + " goles · " + f1(l.xgF) + " xG")}
        ${statTile("Solidez atrás", defTxt, l.ga + " encajados · " + f1(l.xgA) + " xGA")}
        ${statTile("PDO", l.pdo != null ? l.pdo : "—", "1000 = media · suerte")}
      </div>
      ${matchRows ? `<div class="section-title">Veredicto por partido</div><div class="list">${matchRows}</div>` : ""}
    </div>`;
  }
  // Tarjeta "Pirámide de edad y recambio" — usada en Plantilla. "" si <5 jugadores con edad.
  function ageProfileCardHtml(c) {
    const ap = S.squadAgeProfile(c);
    if (!ap || ap.count < 5) return "";
    const maxTot = Math.max(1, ...ap.hist.map(b => b.total));
    const seg = (n, col) => n ? `<div style="height:${(n / maxTot * 92).toFixed(1)}px;background:${col}"></div>` : "";
    const bars = ap.hist.map(b => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px">
        <div style="display:flex;flex-direction:column;justify-content:flex-end;height:92px;width:60%;max-width:34px;border-radius:5px 5px 0 0;overflow:hidden;background:var(--panel-3)">
          ${seg(b.declive, "var(--warn)")}${seg(b.pico, "var(--ok)")}${seg(b.joven, "var(--accent-2)")}
        </div>
        <small class="faint" style="font-size:11px">${b.label}</small>
        <small style="font-weight:700;font-size:12px;min-height:14px">${b.total || ""}</small>
      </div>`).join("");
    const chip = (n, label, col) => n ? `<span class="chip" style="background:transparent;border:1px solid ${col};color:${col};font-weight:700;padding:1px 7px;font-size:11px">${n} ${label}</span>` : "";
    const groupRows = ap.byGroup.map(g => `<div class="list-row">
        <div class="lr-main"><b>${g.group}</b><small class="faint">${g.count} jugador${g.count > 1 ? "es" : ""} · media ${f1(g.avg)} años</small></div>
        <span class="flex gap center" style="flex-shrink:0">${chip(g.young, "joven", "var(--accent-2)")}${chip(g.peak, "pico", "var(--ok)")}${chip(g.decline, "declive", "var(--warn)")}</span>
      </div>`).join("");
    const insightRows = ap.insights.map(it => alertRow(it.tone === "ok" ? "check" : it.tone === "danger" ? "flame" : "flag", it.text, it.tone, null)).join("");
    const legend = (col, txt) => `<span class="flex gap center"><i style="width:10px;height:10px;border-radius:2px;background:${col};display:inline-block"></i> ${txt}</span>`;
    return `<div class="card" style="margin-bottom:16px">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="growth"></span> Pirámide de edad y recambio</div>
      <div class="grid cols-3 keep-2" style="margin-bottom:14px">
        ${statTile("Edad media", f1(ap.avg), ap.count + " jugadores")}
        ${statTile("Once tipo", ap.xiAvg != null ? f1(ap.xiAvg) : "—", "media de tus 11 mejores")}
        ${statTile("En declive", ap.phases.declive, "de " + ap.count + " jugadores")}
      </div>
      <div class="flex" style="align-items:flex-end;gap:6px;margin-bottom:10px">${bars}</div>
      <div class="flex gap center wrap" style="font-size:12px;margin-bottom:14px">
        ${legend("var(--accent-2)", "En desarrollo")}${legend("var(--ok)", "En su pico")}${legend("var(--warn)", "En declive")}
      </div>
      <div class="list" style="margin-bottom:6px">${groupRows}</div>
      <div class="list">${insightRows}</div>
    </div>`;
  }
  // Tarjeta "Jerarquía del vestuario" — usada en Plantilla (pestaña Análisis). "" si <2 jugadores.
  function squadHierarchyCardHtml(c) {
    const h = S.squadHierarchy(c);
    if (!h) return "";
    const tierCol = { "Capitán": "var(--accent-3)", "Líder": "var(--accent)", "Referente": "var(--accent-2)", "Rotación": "var(--text-dim)", "Periferia": "var(--text-dim)" };
    const barCls = { "Capitán": "bar gold", "Referente": "bar blue" };
    const rows = h.players.map(p => {
      const col = tierCol[p.tier] || "var(--text-dim)";
      const pct = Math.max(4, Math.round(p.score * 100));
      return `<div class="list-row" data-player="${U.esc(String(p.id))}" style="cursor:pointer">
        <div class="avatar" style="background:${U.safeColor(p.badge, U.colorFor(p.name))}">${U.initials(p.name)}</div>
        <div class="lr-main"><b>${U.esc(p.name)}</b><small class="faint">${U.esc(p.position || "")}${p.age ? " · " + p.age + " a" : ""}${p.fromYouth ? " · cantera" : ""} · ${p.apps} part.</small>
          <div class="${barCls[p.tier] || "bar"}" style="margin-top:6px">${p.tier === "Rotación" || p.tier === "Periferia" ? `<i style="width:${pct}%;background:var(--text-dim)"></i>` : `<i style="width:${pct}%"></i>`}</div></div>
        <span class="chip" style="background:transparent;border:1px solid ${col};color:${col};font-weight:700;flex-shrink:0">${p.tier}</span>
      </div>`;
    }).join("");
    const insightRows = h.insights.map(it => alertRow(it.tone === "warn" ? "flag" : "check", it.text, it.tone, null)).join("");
    return `<div class="card" id="sq-hier" style="margin-bottom:16px">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="shield"></span> Jerarquía del vestuario <span class="faint" style="font-weight:400">· influencia derivada</span></div>
      <div class="list">${rows}</div>
      ${insightRows ? `<div class="list" style="margin-top:6px">${insightRows}</div>` : ""}
    </div>`;
  }
  // Tarjeta "Carga y rotaciones" — usada en Plantilla (pestaña Análisis). Empty-state si no hay minutos.
  function loadCardHtml(c, seasonId) {
    const l = S.loadReport(c, seasonId);
    if (!l) return "";
    if (!l.hasMinutes) return `<div class="card" style="margin-bottom:16px">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="bandage"></span> Carga y rotaciones</div>
      <div class="empty" style="padding:24px"><div class="emoji">⏱️</div><h3>Sin minutos registrados</h3><p>Añade los minutos de tus jugadores en “Valoraciones” al registrar un partido para activar el control de carga y fatiga.</p></div>
    </div>`;
    const maxMin = Math.max(1, ...l.players.map(p => p.minutes));
    const rows = l.players.slice(0, 14).map(p => {
      const pct = Math.max(3, Math.round(p.minutes / maxMin * 100));
      const heavy = p.recent >= 260, hot = p.share >= 85;
      const col = heavy ? "var(--warn)" : hot ? "var(--accent-3)" : "var(--accent)";
      return `<div class="list-row">
        <div class="lr-main"><b>${U.esc(p.name)}${p.inSquad ? "" : ' <span class="faint" style="font-weight:400">(ya no en plantilla)</span>'}</b>
          <small class="faint">${p.minutes.toLocaleString("es-ES")} min · ${p.apps} part.${p.recent ? " · " + p.recent + " min últimos 3" : ""}</small>
          <div class="bar" style="margin-top:6px"><i style="width:${pct}%;background:${col}"></i></div></div>
        <span class="chip" style="background:transparent;border:1px solid var(--line);color:var(--text-dim);font-weight:700;flex-shrink:0">${p.share}%</span>
      </div>`;
    }).join("");
    const insightRows = l.insights.map(it => alertRow(it.tone === "warn" ? "flag" : it.tone === "neutral" ? "calendar" : "check", it.text, it.tone, null)).join("");
    return `<div class="card" style="margin-bottom:16px">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="bandage"></span> Carga y rotaciones <span class="faint" style="font-weight:400">· minutos en ${l.matchesWithMin}/${l.totalMatches} partidos</span></div>
      <div class="list">${rows}</div>
      ${insightRows ? `<div class="list" style="margin-top:6px">${insightRows}</div>` : ""}
    </div>`;
  }
  // Sección "Contratos y masa salarial" — usada en Finanzas. "" si no hay datos.
  function contractSectionHtml(c) {
    const cr = S.contractReport(c);
    if (!cr.hasContracts && !cr.hasWages) return "";
    const M = (n) => U.money(n);
    const startY = cr.startYear;
    const maxYearCount = Math.max(1, ...cr.timeline.map(t => t.count));
    const timelineBars = cr.timeline.map(t => {
      const col = t.year <= startY ? "var(--danger)" : t.year === startY + 1 ? "var(--warn)" : "var(--accent)";
      const ht = Math.max(8, Math.round(t.count / maxYearCount * 80));
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px">
        <small style="font-weight:700;font-size:12px">${t.count}</small>
        <div style="width:60%;max-width:34px;height:${ht}px;background:${col};border-radius:5px 5px 0 0"></div>
        <small class="faint" style="font-size:11px">${t.year}</small>
      </div>`;
    }).join("");
    const expRows = cr.expiringSoon.slice(0, 8).map(p => {
      const col = p.year <= startY ? "var(--danger)" : "var(--warn)";
      return `<div class="list-row">
        <div class="lr-main"><b>${U.esc(p.name)}</b><small class="faint">${U.esc(p.position || "")}${p.ovr ? " · " + p.ovr + " OVR" : ""}${p.wage ? " · " + M(p.wage) + "/año" : ""}</small></div>
        <span class="chip" style="background:transparent;border:1px solid ${col};color:${col};font-weight:700;flex-shrink:0">${p.year <= startY ? "último año" : "vence " + p.year}</span>
      </div>`;
    }).join("");
    const earnRows = cr.topEarners.map(p => `<div class="list-row">
        <div class="lr-main"><b>${U.esc(p.name)}</b><small class="faint">${U.esc(p.position || "")}${p.ovr ? " · " + p.ovr + " OVR" : ""}</small></div>
        <b style="flex-shrink:0">${M(p.wage)}</b></div>`).join("");
    const insightRows = cr.insights.map(it => alertRow(it.tone === "danger" ? "flame" : it.tone === "warn" ? "flag" : "check", it.text, it.tone, null)).join("");
    return `<div class="section-title">Contratos y masa salarial</div>
      <div class="card">
        ${cr.hasWages ? `<div class="grid cols-3 keep-2" style="margin-bottom:14px">
          ${statTile("Masa salarial", M(cr.wageBill), "anual" + (cr.noWage ? " · " + cr.noWage + " sin sueldo" : ""))}
          ${statTile("Sueldo medio", M(cr.avgWage), "")}
          ${statTile("Concentración top-3", cr.topConcentration + "%", "de la masa salarial")}
        </div>` : ""}
        ${cr.timeline.length ? `<div class="section-title" style="margin-top:0">Vencimientos por año</div>
          <div class="flex" style="align-items:flex-end;gap:6px;margin-bottom:14px">${timelineBars}</div>` : ""}
        ${expRows ? `<div class="section-title">Vencimientos próximos</div><div class="list" style="margin-bottom:6px">${expRows}</div>` : ""}
        ${earnRows ? `<div class="section-title">Mayores sueldos</div><div class="list" style="margin-bottom:6px">${earnRows}</div>` : ""}
        ${insightRows ? `<div class="list" style="margin-top:6px">${insightRows}</div>` : ""}
      </div>`;
  }
  // Tarjeta "Estado del vestuario" — previa del partido, usada en Partidos cuando hay próximos.
  function matchDayReportHtml(c, seasonId) {
    const rep = S.matchDayReport(c, seasonId);
    if (!rep) return "";
    const moodCol   = rep.mood === "critical" ? "var(--danger)" : rep.mood === "bad" ? "var(--warn)" : rep.mood === "caution" ? "var(--accent-3)" : "var(--ok)";
    const moodLabel = rep.mood === "critical" ? "Estado crítico" : rep.mood === "bad" ? "Día complicado" : rep.mood === "caution" ? "Con reservas" : "Equipo listo";
    const moodTextCol = (rep.mood === "caution" || rep.mood === "good") ? "#03110c" : "#fff";
    const last5Html = rep.last5.length ? `<span class="flex gap center" style="flex-shrink:0">${CH.formBar(rep.last5)}</span>` : "";
    const signalRows = rep.signals.map(s => alertRow(s.icon, s.text, s.tone, null)).join("");
    return `<div class="card" style="border-left:3px solid ${moodCol};margin-bottom:4px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:${rep.signals.length ? "12px" : "0"}">
        <div class="section-title" style="margin:0"><span class="ni-icon" data-icon="shirt"></span> Estado del vestuario</div>
        <div class="flex gap center">${last5Html}<span class="chip" style="background:${moodCol};color:${moodTextCol};font-weight:700">${moodLabel}</span></div>
      </div>
      ${signalRows ? `<div class="list">${signalRows}</div>` : ""}
    </div>`;
  }

  // Tarjeta "Perfil goleador" — usada en Partidos. "" si <3 partidos.
  function scoringProfileCardHtml(c, seasonId) {
    const sp = S.scoringProfile(c, seasonId);
    if (!sp) return "";
    const haRows = (sp.home.pj && sp.away.pj) ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
        ${statTile("En casa", f1(sp.home.avgGf) + " goles/p", sp.home.pj + " partidos · " + f1(sp.home.avgGa) + " enc.")}
        ${statTile("Fuera", f1(sp.away.avgGf) + " goles/p", sp.away.pj + " partidos · " + f1(sp.away.avgGa) + " enc.")}
      </div>` : "";
    const streakLabel = sp.currentScoringStreak > 0
      ? sp.currentScoringStreak + " con gol"
      : (sp.currentDrought > 0 ? sp.currentDrought + " sin gol" : "—");
    const streakTone = sp.currentDrought >= 2 ? "var(--warn)" : sp.currentScoringStreak >= 3 ? "var(--ok)" : "var(--text)";
    const kpiRow = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
      ${statTile("Marcan", sp.scoredPct + "%", "partidos con gol")}
      ${statTile("Portería a 0", sp.cleanSheetPct + "%", "partidos sin encajar")}
      <div class="stat-tile"><div class="st-value" style="color:${streakTone}">${streakLabel}</div><div class="st-label">racha actual</div></div>
    </div>`;
    const resRows = ["W","D","L"].filter(r => sp.byResult[r].n > 0).map(r => {
      const label = r === "W" ? "Victorias" : r === "D" ? "Empates" : "Derrotas";
      const col = r === "W" ? "var(--ok)" : r === "D" ? "var(--warn)" : "var(--danger)";
      return `<div class="list-row"><span class="chip" style="background:${col};color:${r==="D"?"#000":"#fff"};flex-shrink:0">${label}</span>
        <div class="lr-main faint" style="font-size:13px">${sp.byResult[r].n} partidos</div>
        <b>${f1(sp.byResult[r].avgGf)} goles/p</b></div>`;
    }).join("");
    const compEntries = Object.entries(sp.byComp).sort((a, b) => b[1].pj - a[1].pj);
    const compRows = compEntries.length > 1 ? compEntries.map(([comp, v]) =>
      `<div class="list-row"><div class="lr-main"><b>${U.esc(comp)}</b>
        <small class="faint">${v.pj} part. · ${f1(v.avgGf)} goles/p · ${v.ga} encajados</small></div></div>`
    ).join("") : "";
    const insightRows = sp.insights.map(it =>
      alertRow(it.tone === "warn" ? "flag" : it.tone === "ok" ? "check" : "table", it.text, it.tone, null)
    ).join("");
    return `<div class="card">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="ball"></span> Perfil goleador <span class="faint" style="font-weight:400">· ${sp.count} partidos</span></div>
      ${haRows}${kpiRow}
      ${resRows ? `<div class="section-title" style="font-size:11px;margin:0 0 4px">GOLES POR RESULTADO</div><div class="list" style="margin-bottom:14px">${resRows}</div>` : ""}
      ${compRows ? `<div class="section-title" style="font-size:11px;margin:0 0 4px">POR COMPETICIÓN</div><div class="list" style="margin-bottom:14px">${compRows}</div>` : ""}
      ${insightRows ? `<div class="list">${insightRows}</div>` : ""}
    </div>`;
  }

  // Tarjeta "Familiaridad táctica" — usada en Partidos. "" si <2 partidos con formación.
  function formationFamiliarityCardHtml(c, seasonId) {
    const ff = S.formationFamiliarity(c, seasonId);
    if (!ff) return "";
    const rows = ff.formations.map(o => {
      const isCur = o.name === ff.current;
      const col = o.familiarity >= 70 ? "var(--ok)" : o.familiarity >= 40 ? "var(--warn)" : "var(--danger)";
      return `<div class="list-row">
        <div class="lr-main"><b>${U.esc(o.name)}${isCur ? ' <span class="chip accent" style="padding:1px 6px;font-size:10px">actual</span>' : ""}</b>
          <small class="faint">${o.uses} part. · ${o.w}V ${o.d}E ${o.l}D · ${f1(o.ppg)} pts/p</small>
          <div class="bar" style="margin-top:6px"><i style="width:${o.familiarity}%;background:${col}"></i></div></div>
        <span class="flex gap center" style="flex-shrink:0">${CH.formBar(o.form)}</span>
        <span class="chip" style="background:transparent;border:1px solid ${col};color:${col};font-weight:700;flex-shrink:0">${o.familiarity}</span>
      </div>`;
    }).join("");
    const insightRows = ff.insights.map(it => alertRow(it.tone === "warn" ? "flag" : it.tone === "ok" ? "check" : "table", it.text, it.tone, null)).join("");
    return `<div class="card">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="table"></span> Familiaridad táctica <span class="faint" style="font-weight:400">· cohesión por sistema</span></div>
      <div class="list">${rows}</div>
      ${insightRows ? `<div class="list" style="margin-top:6px">${insightRows}</div>` : ""}
    </div>`;
  }
  // Tarjeta "Mentorías sugeridas" — usada en Desarrollo. "" si no hay material.
  function mentoringCardHtml(c) {
    const m = S.mentoringSuggestions(c);
    if (!m) return "";
    const av = (p) => `<div class="avatar" style="background:${U.safeColor(p.badge, U.colorFor(p.name))}">${U.initials(p.name)}</div>`;
    const half = (p, role, sub) => `<span data-ment="${U.esc(String(p.id))}" style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1;min-width:0">${av(p)}<span class="lr-main"><b>${U.esc(p.name)}</b><small class="faint">${role}${sub}</small></span></span>`;
    const pairRows = m.pairs.map(pr => `<div class="list-row" style="gap:10px">
      ${half(pr.mentor, "mentor", " · " + U.esc(String(pr.mentor.age)) + " a" + (pr.mentor.ovr ? " · " + U.esc(String(pr.mentor.ovr)) + " OVR" : ""))}
      <span class="ni-icon" data-icon="chevron" style="color:var(--accent);flex-shrink:0"></span>
      ${half(pr.mentee, "promesa", " · " + U.esc(String(pr.mentee.age)) + " a" + (pr.mentee.fromYouth ? " · cantera" : ""))}
    </div>`).join("");
    const insightRows = m.insights.map(it => alertRow("growth", it.text, it.tone, null)).join("");
    return `<div class="card" id="dev-mentor" style="margin-top:16px">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="sprout"></span> Mentorías sugeridas</div>
      ${pairRows ? `<div class="list">${pairRows}</div>` : ""}
      ${insightRows ? `<div class="list" style="margin-top:6px">${insightRows}</div>` : ""}
    </div>`;
  }
  // Tarjeta "Especialistas a balón parado" — usada en Plantilla (pestaña Análisis).
  function setPieceCardHtml(c) {
    const players = (c.players || []).filter(p => p && p.name);
    if (players.length < 1) return "";
    const sug = S.setPieceSuggestions(c);
    const sp = c.setPieces || {};
    const validIds = new Set(players.map(p => p.id));
    const roles = [["penalty", "Penaltis", "⚽"], ["freekick", "Faltas directas", "🎯"], ["corner", "Córners", "🚩"]];
    const opts = (selId, sugId) => `<option value="">— sin asignar —</option>` + players.map(p =>
      `<option value="${U.esc(String(p.id))}"${(selId === p.id || (!selId && sugId === p.id)) ? " selected" : ""}>${U.esc(p.name)}${p.position ? " (" + U.esc(p.position) + ")" : ""}${(!selId && sugId === p.id) ? " — sugerido" : ""}</option>`).join("");
    const rows = roles.map(([key, label, emoji]) => {
      const selId = sp[key] && validIds.has(sp[key]) ? sp[key] : null;
      return `<div class="list-row">
        <div class="lr-main"><b>${emoji} ${label}</b>${sug[key] && !selId ? `<small class="faint">sugerencia: ${U.esc(sug[key].name)}</small>` : ""}</div>
        <select class="sp-sel" data-role="${key}" style="flex:1;max-width:220px;padding:5px 8px">${opts(selId, sug[key] && sug[key].id)}</select>
      </div>`;
    }).join("");
    return `<div class="card" id="sq-setpiece" style="margin-bottom:16px">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="target"></span> Especialistas a balón parado</div>
      <div class="list">${rows}</div>
      <p class="faint" style="font-size:11px;margin:10px 0 0">Apunte de planificación (el juego no lo aplica). Sugerencias según goles/asistencias que registres.</p>
    </div>`;
  }

  // Tarjeta "Clima político" — usada en Plantilla (pestaña Análisis).
  function politicalCapitalCardHtml(c, seasonId) {
    const pol = S.politicalCapital(c, seasonId);
    if (!pol) return "";
    const col = pol.levelTone === "danger" ? "var(--danger)" : pol.levelTone === "warn" ? "var(--warn)" : "var(--ok)";
    const eventRows = pol.events.map(e =>
      alertRow("flag", e.text, e.tone, null)
    ).join("");
    const insightRows = pol.insights.map(it =>
      alertRow(it.tone === "danger" ? "bell" : it.tone === "warn" ? "flag" : "check", it.text, it.tone, null)
    ).join("");
    return `<div class="card" id="sq-political" style="margin-bottom:16px">
      <div class="section-title" style="margin-top:0"><span class="ni-icon" data-icon="shield"></span> Clima político <span class="faint" style="font-weight:400">· capital del mánager</span></div>
      <div style="margin:0 0 14px">
        <div class="flex between" style="font-size:12px;margin-bottom:6px">
          <span class="faint">Tensión</span>
          <span class="chip" style="background:${col};color:${pol.levelTone === 'ok' ? '#03110c' : '#fff'};font-weight:700">${pol.level} · ${pol.tension}/100</span>
        </div>
        <div class="bar"><i style="width:${pol.tension}%;background:${col}"></i></div>
      </div>
      ${eventRows ? `<div class="list" style="margin-bottom:8px">${eventRows}</div>` : ""}
      ${insightRows ? `<div class="list">${insightRows}</div>` : ""}
    </div>`;
  }

  FC.views.development = function () {
    const c = S.getActiveCareer();
    const players = (c.players || []).slice().sort((a,b) => (D.POS_ORDER[a.position]||99) - (D.POS_ORDER[b.position]||99) || (b.ovr||0) - (a.ovr||0));
    const anyHistory = players.some(p => (p.ovrHistory || []).length);
    const rows = players.map(p => {
      const series = S.playerSeries(c, p);
      const ovrs = series.map(s => s.ovr);
      const cur = ovrs.length ? ovrs[ovrs.length - 1] : (Number(p.ovr) || null);
      const peak = ovrs.length ? Math.max(...ovrs) : (Number(p.ovr) || null);
      const trend = ovrs.length >= 2 ? ovrs[ovrs.length - 1] - ovrs[ovrs.length - 2] : null;
      return { p, ovrs, cur, peak, trend };
    });
    UI.mount(`
      <div class="page-head">
        <div><h1>Desarrollo de jugadores</h1>
          <div class="sub">${players.length} jugadores · progresión de OVR por temporada</div></div>
        ${seasonSelect(c)}
      </div>
      ${!anyHistory ? `<div class="card" style="margin-bottom:16px"><div class="flex gap center">
        <span class="ni-icon" data-icon="growth" style="color:var(--accent);flex:none"></span>
        <div class="muted" style="font-size:13px">Las curvas se construyen al <b>avanzar de temporada</b> (Ajustes → Nueva temporada): al cerrar cada temporada se guarda el OVR de tus jugadores. Por ahora solo ves su OVR actual.</div></div></div>` : ""}
      <div class="card tight">
        ${players.length ? `<div class="table-wrap"><table class="tbl"><thead><tr>
          <th>Jugador</th><th>Pos</th><th class="num">OVR</th><th class="num">POT</th><th class="num">Pico</th><th class="num">Tendencia</th><th>Progresión</th>
        </tr></thead><tbody>
        ${rows.map(({p, ovrs, cur, peak, trend}) => {
          const trendHtml = trend == null ? `<span class="faint">—</span>`
            : trend > 0 ? `<span class="chip accent">▲ +${trend}</span>`
            : trend < 0 ? `<span class="chip danger">▼ ${trend}</span>`
            : `<span class="chip">= 0</span>`;
          return `<tr data-dev="${p.id}" style="cursor:pointer">
            <td><div class="flex gap center"><div class="avatar" style="background:${U.safeColor(p.badge, U.colorFor(p.name))}">${U.initials(p.name)}</div>
              <div><b>${U.esc(p.name)}</b>${p.fromYouth?' <span class="chip accent" style="padding:1px 6px;font-size:10px">cantera</span>':""}<br><small class="faint">${U.esc(p.age||"—")} años</small></div></div></td>
            <td><span class="chip">${U.esc(p.position||"—")}</span></td>
            <td class="num"><span class="ovr ${U.ovrClass(cur)}">${cur||"—"}</span></td>
            <td class="num faint">${p.potential||"—"}</td>
            <td class="num">${peak||"—"}</td>
            <td class="num">${trendHtml}</td>
            <td>${miniSpark(ovrs)}</td></tr>`;
        }).join("")}
        </tbody></table></div>` : `<div class="empty"><div class="emoji">📈</div><h3>Sin jugadores</h3><p>Añade jugadores en Plantilla para seguir su progresión.</p></div>`}
      </div>
      ${mentoringCardHtml(c)}
    `);
    content().querySelectorAll("[data-dev]").forEach(r => r.addEventListener("click", () => UI.openPlayerCard(c, (c.players||[]).find(p => p.id === r.dataset.dev))));
    content().querySelectorAll("#dev-mentor [data-ment]").forEach(el => el.addEventListener("click", () => UI.openPlayerCard(c, (c.players||[]).find(p => p.id === el.dataset.ment))));
  };

  /* ============================================================
     ACADEMIA JUVENIL
     ============================================================ */
  let ytFilter = "academy"; // estado del filtro (persiste entre re-renders, como en Finanzas)
  FC.views.youth = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const all = (c.youth || []);
    const academyN = all.filter(y => y.status === "academy").length;
    const promotedN = all.filter(y => y.status === "promoted").length;
    UI.mount(`
      <div class="page-head">
        <div><h1>Academia juvenil</h1>
          <div class="sub">${academyN} en la academia · ${promotedN} promovidas · ${U.esc(season.label)}</div></div>
        <button class="btn btn-primary" id="yt-gen"><span class="ni-icon" data-icon="sprout"></span> Generar promesas</button>
      </div>
      ${!all.length ? `<div class="card" style="margin-bottom:16px"><div class="flex gap center">
        <span class="ni-icon" data-icon="sprout" style="color:var(--accent);flex:none"></span>
        <div class="muted" style="font-size:13px">Genera una hornada de promesas de tu cantera. Las que promociones entran en tu Plantilla como jugadores <b>de cantera</b> y cuentan para el reto «Solo cantera» y el logro «Hacedor de leyendas».</div></div></div>` : ""}
      <div class="card tight">
        <div class="flex gap center wrap mb">
          <div class="seg" id="yt-filter">
            <button type="button" data-yf="academy" class="${ytFilter==='academy'?'active':''}">En la academia</button>
            <button type="button" data-yf="promoted" class="${ytFilter==='promoted'?'active':''}">Promovidas</button>
            <button type="button" data-yf="all" class="${ytFilter==='all'?'active':''}">Todas</button>
          </div>
        </div>
        <div class="table-wrap"><table class="tbl"><thead><tr>
          <th>Promesa</th><th>Pos</th><th class="num">Edad</th><th class="num">OVR</th><th class="num">POT</th><th></th>
        </tr></thead><tbody id="yt-rows"></tbody></table></div>
      </div>
    `);
    document.getElementById("yt-gen").addEventListener("click", () => {
      const made = S.generateYouthIntake(c, 3);
      UI.toast(made.length + " promesas generadas 🌱", "ok");
    });
    function paint() {
      const rows = (c.youth || []).filter(y => ytFilter === "all" || y.status === ytFilter)
        .slice().sort((a,b) => (b.potential||0) - (a.potential||0));
      const tb = document.getElementById("yt-rows");
      tb.innerHTML = rows.length ? rows.map(y => {
        const isAcad = y.status === "academy";
        return `<tr>
          <td><div class="flex gap center"><div class="avatar" style="background:${U.colorFor(y.name)}">${U.initials(y.name)}</div>
            <div><b>${U.esc(y.name)}</b><br><small class="faint">${U.esc(y.nationality||"")}${y.scoutNote ? " · " + U.esc(y.scoutNote) : ""}</small></div></div></td>
          <td><span class="chip">${U.esc(y.position||"—")}</span></td>
          <td class="num">${U.esc(y.age||"—")}</td>
          <td class="num"><span class="ovr ${U.ovrClass(y.ovr)}">${y.ovr||"—"}</span></td>
          <td class="num faint">${y.potential||"—"}</td>
          <td class="num">${isAcad
            ? `<div class="flex gap" style="justify-content:flex-end"><button class="btn btn-ghost btn-sm" data-promote="${y.id}"><span class="ni-icon" data-icon="check"></span> Promover</button>
                <button class="icon-btn sm" data-release="${y.id}" title="Descartar"><span class="ni-icon" data-icon="trash"></span></button></div>`
            : `<span class="chip accent">Promovida</span>`}</td></tr>`;
      }).join("") : `<tr><td colspan="6"><div class="empty" style="padding:26px"><div class="emoji">🌱</div><h3>${ytFilter==="promoted"?"Sin promovidas todavía":"Sin promesas"}</h3><p>${ytFilter==="promoted"?"Promueve promesas para verlas aquí.":"Pulsa «Generar promesas» para crear tu primera hornada."}</p></div></td></tr>`;
      U.hydrateIcons(tb);
      tb.querySelectorAll("[data-promote]").forEach(b => b.addEventListener("click", () => {
        const np = S.promoteYouth(c, b.dataset.promote);
        UI.toast(np ? "¡" + np.name + " sube al primer equipo! 🎉" : "No se pudo promover", np ? "ok" : "err");
      }));
      tb.querySelectorAll("[data-release]").forEach(b => b.addEventListener("click", () =>
        UI.confirm("¿Descartar esta promesa?", () => { S.releaseYouth(c, b.dataset.release); UI.toast("Promesa descartada"); }, true)));
    }
    document.querySelectorAll("#yt-filter button").forEach(b => b.addEventListener("click", () => {
      ytFilter = b.dataset.yf; document.querySelectorAll("#yt-filter button").forEach(x => x.classList.toggle("active", x === b)); paint();
    }));
    paint();
  };

  /* ============================================================
     HERRAMIENTAS VIRALES — generador de retos / rebuilds
     ============================================================ */
  let toolRoll = null, toolLeagueId = "", toolMode = "random"; // estado en módulo: no re-rollear en cada render
  function rollShareText(r) {
    const stars = "★".repeat(r.difficulty) + "☆".repeat(5 - r.difficulty);
    return "⚽ RETO MODO CARRERA ⚽\n"
      + "Club: " + r.club + " (" + r.league + ")\n"
      + "Objetivo: " + r.objective.text + " en " + r.seasons + " temporadas\n"
      + (r.twists.length ? "Reglas: " + r.twists.map(t => t.label).join(" · ") + "\n" : "")
      + "Dificultad: " + stars + "\n"
      + "¿Te atreves? #CarreraFC #ModoCarrera";
  }
  function toolCopy(txt) {
    const done = () => UI.toast("Reto copiado 📋", "ok");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => toolFallbackCopy(txt, done));
    else toolFallbackCopy(txt, done);
  }
  function toolFallbackCopy(txt, done) {
    try { const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); done(); }
    catch (e) { UI.toast("Copia el texto del recuadro manualmente", "err"); }
  }
  FC.views.tools = function () {
    const leagues = D.LEAGUES.filter(l => (l.teams || []).length);
    if (!toolRoll) toolRoll = S.rollChallenge({ leagueId: toolLeagueId, mode: toolMode });
    UI.mount(`
      <div class="page-head"><div><h1>Generador de retos</h1>
        <div class="sub">Tira un reto aleatorio, compártelo y actívalo en tu carrera</div></div></div>
      <div class="card tight mb">
        <div class="field-row three" style="margin-bottom:0;align-items:end">
          <div class="field" style="margin:0"><label>Liga del club</label>
            <select id="tool-league"><option value="">Cualquiera</option>
              ${leagues.map(l => `<option value="${l.id}" ${l.id===toolLeagueId?"selected":""}>${U.esc(l.name)}</option>`).join("")}</select></div>
          <div class="field" style="margin:0"><label>Modo</label>
            <select id="tool-mode"><option value="random" ${toolMode==="random"?"selected":""}>Reto aleatorio</option>
              <option value="rebuild" ${toolMode==="rebuild"?"selected":""}>Rebuild (reconstrucción)</option></select></div>
          <div class="field" style="margin:0"><label>&nbsp;</label>
            <button class="btn btn-primary btn-block" id="tool-roll"><span class="ni-icon" data-icon="dice"></span> Generar</button></div>
        </div>
      </div>
      <div id="tool-card"></div>
    `);
    const reroll = () => { toolRoll = S.rollChallenge({ leagueId: toolLeagueId, mode: toolMode }); paintRoll(); };
    document.getElementById("tool-league").addEventListener("change", (e) => { toolLeagueId = e.target.value; reroll(); });
    document.getElementById("tool-mode").addEventListener("change", (e) => { toolMode = e.target.value; reroll(); });
    document.getElementById("tool-roll").addEventListener("click", reroll);
    function paintRoll() {
      const r = toolRoll;
      const stars = [1,2,3,4,5].map(i => `<i class="${i<=r.difficulty?"on":""}"></i>`).join("");
      const box = document.getElementById("tool-card");
      box.innerHTML = `<div class="challenge-card">
        <div class="cc-top"><div class="cc-emoji">${r.mode==="rebuild"?"🔨":"🎲"}</div>
          <div style="flex:1"><div class="st-label">${r.mode==="rebuild"?"Rebuild":"Reto aleatorio"}</div>
            <b style="font-size:20px">${U.esc(r.club)}</b><div class="faint" style="font-size:12px">${U.esc(r.league)}</div></div>
          <div class="difficulty">${stars}</div></div>
        <p style="margin:4px 0;font-size:15px">${r.objective.emoji} <b>${U.esc(r.objective.text)}</b> <span class="faint">en ${r.seasons} temporadas</span></p>
        ${r.twists.length ? `<div class="cc-rules">${r.twists.map(t => `<span class="chip ${t.ruleId?"accent":""}">${t.emoji} ${U.esc(t.label)}</span>`).join("")}</div>` : ""}
        <textarea readonly id="tool-share" style="margin-top:12px;min-height:118px;font-size:12px;line-height:1.5">${U.esc(rollShareText(r))}</textarea>
        <div class="flex gap wrap" style="margin-top:12px">
          <button class="btn btn-primary" id="tool-copy"><span class="ni-icon" data-icon="share"></span> Copiar para compartir</button>
          <button class="btn" id="tool-img"><span class="ni-icon" data-icon="download"></span> Descargar imagen</button>
          <button class="btn" id="tool-activate"><span class="ni-icon" data-icon="target"></span> Activar como reto</button>
          <button class="btn btn-ghost" id="tool-again"><span class="ni-icon" data-icon="dice"></span> Otro</button>
        </div></div>`;
      U.hydrateIcons(box);
      document.getElementById("tool-copy").addEventListener("click", () => toolCopy(rollShareText(r)));
      document.getElementById("tool-img").addEventListener("click", () => UI.downloadCard({
        brand: r.mode === "rebuild" ? "Carrera FC · Rebuild" : "Carrera FC · Reto",
        title: r.club, subtitle: r.league, difficulty: r.difficulty,
        lines: [r.objective.text, "en " + r.seasons + " temporadas"],
        chips: r.twists.map(t => t.label),
        footer: "¿Te atreves? · #CarreraFC #ModoCarrera", filename: "reto-" + r.club,
      }));
      document.getElementById("tool-again").addEventListener("click", reroll);
      document.getElementById("tool-activate").addEventListener("click", () => {
        const cc = S.getActiveCareer();
        const rules = r.twists.filter(t => t.ruleId).map(t => ({ ruleId: t.ruleId, params: t.params || {} }));
        S.addChallenge(cc, { name: r.objective.text, emoji: r.objective.emoji || "🎲", rules, status: "active", startedAt: Date.now(), custom: true });
        UI.toast("Reto activado en tu carrera 🎯", "ok");
      });
    }
    paintRoll();
  };

  /* ============================================================
     NARRATIVA / STORYLINE
     ============================================================ */
  FC.views.story = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const beats = S.storyline(c, season.id);
    const recap = S.seasonRecap(c, season);
    const tone = { good: "var(--accent)", bad: "var(--danger)", neutral: "var(--text-dim)" };
    UI.mount(`
      <div class="page-head">
        <div><h1>Narrativa</h1><div class="sub">La crónica de tu temporada ${U.esc(season.label)}</div></div>
        <div class="flex gap center wrap">${seasonSelect(c)}<button class="btn btn-ghost btn-sm" id="story-img"><span class="ni-icon" data-icon="download"></span> Tarjeta</button></div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="flex gap" style="align-items:flex-start">
          <span class="ni-icon" data-icon="news" style="color:var(--accent);flex:none;margin-top:2px"></span>
          <div style="font-size:14px;line-height:1.5">${U.esc(recap)}</div></div>
      </div>
      <div class="section-title">Titulares</div>
      <div class="card">
        ${beats.length ? `<div class="list">${beats.map(b => `<div class="list-row" style="align-items:flex-start">
          <span class="ni-icon" data-icon="${b.icon}" style="color:${tone[b.tone] || "var(--text-dim)"};flex:none;margin-top:2px"></span>
          <div class="lr-main"><b style="white-space:normal">${b.title}</b><small>${b.sub}</small></div></div>`).join("")}</div>`
          : `<div class="empty"><div class="emoji">📰</div><h3>Sin titulares todavía</h3><p>Registra partidos, fichajes y títulos para que tu historia cobre vida.</p></div>`}
      </div>

      <div class="section-title">Vida de vestuario</div>
      <div class="card">
        <div class="flex between center wrap" style="gap:8px;margin-bottom:4px">
          <p class="faint" style="font-size:13px;margin:0;flex:1;min-width:180px">Sucesos del día a día del club: peleas, liderazgo, rumores de mercado, malestar... usando tu plantilla real.</p>
          <button class="btn btn-primary btn-sm" id="story-incident"><span class="ni-icon" data-icon="dice"></span> Generar suceso</button>
        </div>
        <div id="story-incidents" style="margin-top:10px"></div>
      </div>
    `);
    renderIncidents(c);
    document.getElementById("story-incident").addEventListener("click", () => {
      const inc = FC.incidents.generate(c);
      if (!inc) { UI.toast("Añade jugadores a tu plantilla para que ocurran cosas en el vestuario", "err"); return; }
      S.addIncident(c, inc, true);
      renderIncidents(c);
      UI.toast("Nuevo suceso en el vestuario", "ok");
    });
    document.getElementById("story-img").addEventListener("click", () => UI.downloadCard({
      brand: "Carrera FC · Temporada", title: c.clubName, subtitle: season.label,
      lines: [recap], footer: "Mi Modo Carrera", filename: "temporada-" + c.clubName + "-" + season.label,
    }));
  };
  function renderIncidents(c) {
    const box = document.getElementById("story-incidents");
    if (!box) return;
    const tone = { good: "var(--accent)", bad: "var(--danger)", neutral: "var(--text-dim)" };
    const incs = (c.incidents || []).slice().reverse();
    // title ya viene escapado por _fillT (HTML-safe): se pinta sin re-escapar.
    box.innerHTML = incs.length
      ? `<div class="list">${incs.map(i => `<div class="list-row" style="align-items:flex-start">
          <span class="ni-icon" data-icon="${i.icon || "news"}" style="color:${tone[i.tone] || "var(--text-dim)"};flex:none;margin-top:2px"></span>
          <div class="lr-main"><b style="white-space:normal">${i.title}</b><small>${U.esc(i.label || "")}${i.date ? " · " + U.fmtDate(i.date) : ""}</small></div>
          <button class="icon-btn sm" data-del-inc="${i.id}"><span class="ni-icon" data-icon="trash"></span></button></div>`).join("")}</div>`
      : `<div class="empty" style="padding:18px 0"><div class="emoji">🎭</div><h3>El vestuario está tranquilo</h3><p>Pulsa "Generar suceso" para ver qué se cuece entre tus jugadores.</p></div>`;
    U.hydrateIcons(box);
    box.querySelectorAll("[data-del-inc]").forEach(b => b.addEventListener("click", () => { S.deleteIncident(c, b.dataset.delInc, true); renderIncidents(c); }));
  }

  /* ============================================================
     SALÓN DE LA FAMA (Hall of Fame local, entre carreras)
     ============================================================ */
  FC.views.hall = function () {
    const hof = S.hallOfFame();
    const t = hof.totals;
    const legend = (label, emoji, l, unit) => `<div class="card stat-tile"><div class="st-glow"></div>
      <div class="st-label">${emoji} ${label}</div>
      <div class="st-value" style="font-size:20px">${l ? U.esc(l.name) : "—"}</div>
      <div class="st-sub">${l ? l.value + " " + unit + " · " + U.esc(l.club) : "Sin datos"}</div></div>`;
    UI.mount(`
      <div class="page-head"><div><h1>Salón de la fama</h1><div class="sub">Tu legado en todas tus carreras</div></div></div>
      <div class="grid cols-4 keep-2">
        ${statTile("Carreras", t.careers, "")}
        ${statTile("Temporadas", t.seasons, "")}
        ${statTile("Partidos", t.matches, "")}
        ${statTile("Trofeos", t.trophies, "")}
      </div>

      <div class="section-title">Mejor temporada</div>
      <div class="card">${hof.bestSeason
        ? `<div class="flex between center wrap"><div><b style="font-size:18px">${U.esc(hof.bestSeason.club)}</b> <span class="faint">· ${U.esc(hof.bestSeason.label)}</span>
            <div class="faint" style="font-size:13px;margin-top:4px">${hof.bestSeason.w}V ${hof.bestSeason.d}E ${hof.bestSeason.l}D · ${hof.bestSeason.gf}:${hof.bestSeason.ga} goles</div></div>
            <div class="st-value" style="font-size:28px">${hof.bestSeason.points} <span class="faint" style="font-size:14px">pts</span></div></div>`
        : `<p class="faint">Juega partidos de liga para registrar tu mejor temporada.</p>`}</div>

      <div class="section-title">Leyendas · histórico de todas las carreras</div>
      <div class="grid cols-3 keep-2">
        ${legend("Máximo goleador", "⚽", hof.legends.scorer, "goles")}
        ${legend("Máximo asistente", "🅰️", hof.legends.assister, "asist.")}
        ${legend("Más partidos", "👕", hof.legends.apps, "partidos")}
      </div>

      <div class="section-title">Tus carreras</div>
      <div class="card tight"><div class="table-wrap"><table class="tbl"><thead><tr>
        <th>Club</th><th>Liga</th><th class="num">Temp.</th><th class="num">Trofeos</th><th class="num">Títulos</th>
      </tr></thead><tbody>
      ${hof.careers.map(cc => `<tr>
        <td><div class="flex gap center"><div class="career-badge" style="background:${U.safeColor(cc.badgeColor, U.colorFor(cc.clubName))}">${U.initials(cc.clubName)}</div><b>${U.esc(cc.clubName)}</b></div></td>
        <td class="faint">${U.esc(cc.leagueName||"")}</td>
        <td class="num">${cc.seasons}</td><td class="num">${cc.trophies}</td><td class="num"><b>${cc.titles}</b></td></tr>`).join("")}
      </tbody></table></div></div>
    `);
  };

  /* ============================================================
     FINANZAS Y FICHAJES
     ============================================================ */
  const TRANSFER_RULES = ["max-spend","sell-before-buy","free-agents-only","no-signings","no-loans","youth-only"];
  const TRANSFER_TYPE = { transfer:"Traspaso", free:"Libre", loan:"Cesión", youth:"Cantera" };
  let finLedgerDir = "all", finLedgerQ = ""; // estado del filtro del ledger (persiste entre re-renders)

  FC.views.finance = function () {
    const c = S.getActiveCareer();
    const season = S.currentSeason(c);
    const f = S.financeSummary(c, season.id);
    const M = U.money;
    // saldo acumulado de la temporada (solo movimientos con coste)
    const moves = (c.transfers || []).filter(t => t.seasonId === season.id && (Number(t.fee) || 0) !== 0)
      .slice().sort((a,b) => new Date(a.date||0) - new Date(b.date||0));
    let run = 0; const flow = moves.map(t => { run += (t.direction === "out" ? 1 : -1) * (Number(t.fee)||0); return run; });
    const maxBar = Math.max(f.spent, f.earned, 1);
    const moneyCh = (c.challenges || []).filter(ch => ch.status === "active" && (ch.rules||[]).some(r => TRANSFER_RULES.includes(r.ruleId)));

    UI.mount(`
      <div class="page-head">
        <div><h1>Finanzas y fichajes</h1>
          <div class="sub">${U.esc(season.label)} · ${f.inCount} altas · ${f.outCount} bajas · Balance ${M(f.net)}</div></div>
        <div class="flex gap center wrap">${seasonSelect(c)}
          <button class="btn btn-primary" id="fin-add"><span class="ni-icon" data-icon="plus"></span> Registrar movimiento</button></div>
      </div>

      <div class="card">
        <div class="field-row" style="align-items:end;margin-bottom:0">
          <div class="field" style="margin-bottom:0"><label>Presupuesto de fichajes de la temporada (€)</label>
            <input type="number" id="fin-budget" min="0" value="${f.budget || ""}" placeholder="p.ej. 50000000"/></div>
          <div class="field" style="margin-bottom:0"><label>&nbsp;</label><button class="btn btn-block" id="fin-budget-save"><span class="ni-icon" data-icon="coin"></span> Fijar presupuesto</button></div>
        </div>
        <p class="faint" style="font-size:12px;margin:10px 0 0">El dinero que te dio la junta esta temporada. Registrar aquí un movimiento es independiente de crear el jugador en Plantilla.</p>
      </div>

      <div class="grid cols-4 keep-2" style="margin-top:16px">
        ${statTile("Presupuesto", f.hasBudget ? M(f.budget) : "—", f.hasBudget ? "Fijado por la junta" : "Sin tope fijado")}
        ${statTile("Gastado", M(f.spent), f.inCount + " altas")}
        ${statTile("Ingresado", M(f.earned), f.outCount + " bajas")}
        ${f.hasBudget
          ? `<div class="card stat-tile"><div class="st-glow"></div><div class="st-label">Restante</div>
              <div class="st-value" style="${f.remaining < 0 ? "color:var(--danger)" : ""}">${M(f.remaining)}</div>
              <div class="st-sub">Balance ${f.net >= 0 ? "+" : ""}${M(f.net)}</div></div>`
          : statTile("Balance neto", (f.net >= 0 ? "+" : "") + M(f.net), "Saldo de traspasos")}
      </div>

      <div class="grid cols-2" style="margin-top:16px">
        <div class="card">
          <div class="card-head"><h3><span class="ni-icon" data-icon="coin"></span> Presupuesto consumido</h3></div>
          ${f.hasBudget
            ? `<div class="flex center gap" style="gap:18px">${CH.donut(f.pct, { size: 120, color: f.remaining < 0 ? "var(--danger)" : (f.remaining < f.budget * 0.1 ? "var(--warn)" : "var(--accent)") })}
                <div><div class="st-value" style="font-size:22px;${f.remaining < 0 ? "color:var(--danger)" : ""}">${M(f.remaining)}</div>
                  <div class="faint" style="font-size:12px">restante de ${M(f.budget)}</div></div></div>`
            : `<div class="empty" style="padding:22px"><div class="emoji">💰</div><p>Fija un presupuesto para ver cuánto te queda.</p>
                <button class="btn btn-ghost btn-sm" id="fin-budget-focus">Fijar presupuesto</button></div>`}
        </div>
        <div class="card">
          <div class="card-head"><h3><span class="ni-icon" data-icon="swap"></span> Gasto vs ingreso</h3></div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div><div class="flex between" style="font-size:13px;margin-bottom:6px"><span class="faint">Gastado</span><b>${M(f.spent)}</b></div>
              <div class="bar ${f.remaining != null && f.remaining < 0 ? "danger" : ""}"><i style="width:${Math.round(f.spent/maxBar*100)}%"></i></div></div>
            <div><div class="flex between" style="font-size:13px;margin-bottom:6px"><span class="faint">Ingresado</span><b>${M(f.earned)}</b></div>
              <div class="bar blue"><i style="width:${Math.round(f.earned/maxBar*100)}%"></i></div></div>
          </div>
          <div class="faint" style="font-size:12px;margin-top:14px">
            Mayor fichaje: ${f.topBuy ? U.esc(f.topBuy.player) + " · " + M(f.topBuy.fee) : "—"}<br>
            Mayor venta: ${f.topSale ? U.esc(f.topSale.player) + " · " + M(f.topSale.fee) : "—"}</div>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><h3><span class="ni-icon" data-icon="table"></span> Movimiento de caja</h3></div>
        ${flow.length > 1 ? CH.line(flow, { h: 96, color: f.net >= 0 ? "var(--accent)" : "var(--danger)" }) : `<p class="faint">Registra movimientos con coste para ver la evolución del saldo.</p>`}
        <div class="faint" style="font-size:12px;margin-top:6px">Saldo acumulado de traspasos (ingresos − gastos)</div>
      </div>

      ${contractSectionHtml(c)}

      ${moneyCh.length ? `
      <div class="section-title">Impacto en tus retos</div>
      <div class="card"><div id="fin-rules"></div>
        <p class="faint" style="font-size:11px;margin:10px 0 0">«Tope de gasto» y «Vende antes de comprar» son globales (suman todas las temporadas); los KPIs de arriba son de esta temporada.</p></div>` : ""}

      <div class="section-title">Movimientos</div>
      <div class="card tight">
        <div class="flex gap center wrap mb">
          <div class="seg" id="fin-filter">
            <button type="button" data-fd="all" class="${finLedgerDir==='all'?'active':''}">Todos</button>
            <button type="button" data-fd="in" class="${finLedgerDir==='in'?'active':''}">Altas</button>
            <button type="button" data-fd="out" class="${finLedgerDir==='out'?'active':''}">Bajas</button>
          </div>
          <input type="search" id="fin-q" placeholder="Buscar jugador o club" style="max-width:240px" value="${U.esc(finLedgerQ)}"/>
        </div>
        <div class="table-wrap"><table class="tbl"><thead><tr>
          <th>Fecha</th><th>Mov.</th><th>Jugador</th><th>Tipo</th><th>Procedencia / Destino</th><th class="num">Importe</th><th></th>
        </tr></thead><tbody id="fin-rows"></tbody></table></div>
      </div>
    `);

    document.getElementById("fin-add").addEventListener("click", () => transferModal(c));
    document.getElementById("fin-budget-save").addEventListener("click", () => {
      S.setTransferBudget(c, season.id, document.getElementById("fin-budget").value); UI.toast("Presupuesto fijado", "ok");
    });
    const focusBtn = document.getElementById("fin-budget-focus");
    if (focusBtn) focusBtn.addEventListener("click", () => { const i = document.getElementById("fin-budget"); i.focus(); i.scrollIntoView({ block: "center", behavior: "smooth" }); });

    if (moneyCh.length) renderFinanceRules(c, moneyCh);

    // ledger filtrable: el estado del filtro vive a nivel de módulo (finLedgerDir/
    // finLedgerQ), así sobrevive al re-render global que disparan editar/borrar.
    const all = (c.transfers || []).filter(t => t.seasonId === season.id).slice().sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
    function paintRows() {
      const q = (finLedgerQ || "").toLowerCase();
      const rows = all.filter(t => (finLedgerDir === "all" || t.direction === finLedgerDir)
        && (!q || (t.player||"").toLowerCase().includes(q) || (t.club||"").toLowerCase().includes(q)));
      const tb = document.getElementById("fin-rows");
      tb.innerHTML = rows.length ? rows.map(t => { const isIn = t.direction === "in";
        return `<tr data-tr="${t.id}" style="cursor:pointer">
          <td class="faint">${U.fmtDate(t.date) || "—"}</td>
          <td><span class="chip ${isIn ? "accent" : "danger"}">${isIn ? "Alta" : "Baja"}</span></td>
          <td><b>${U.esc(t.player)}</b></td>
          <td><span class="chip">${U.esc(TRANSFER_TYPE[t.type] || t.type || "—")}</span></td>
          <td class="faint">${U.esc(t.club || "—")}</td>
          <td class="num" style="color:${isIn ? "var(--danger)" : "var(--ok)"};font-variant-numeric:tabular-nums">${isIn ? "−" : "+"}${U.money(t.fee)}</td>
          <td><button class="icon-btn sm" data-del-tr="${t.id}"><span class="ni-icon" data-icon="trash"></span></button></td></tr>`;
      }).join("") : `<tr><td colspan="7"><div class="empty" style="padding:26px"><div class="emoji">💰</div><h3>Sin movimientos</h3><p>Registra altas y bajas para llevar tus finanzas.</p></div></td></tr>`;
      U.hydrateIcons(tb);
      tb.querySelectorAll("[data-del-tr]").forEach(b => b.addEventListener("click", (e) => { e.stopPropagation();
        UI.confirm("¿Eliminar este movimiento?", () => { S.deleteTransfer(c, b.dataset.delTr); UI.toast("Movimiento eliminado"); }, true); }));
      tb.querySelectorAll("[data-tr]").forEach(r => r.addEventListener("click", (e) => {
        if (e.target.closest("[data-del-tr]")) return;
        transferModal(c, all.find(t => t.id === r.dataset.tr)); }));
    }
    document.querySelectorAll("#fin-filter button").forEach(b => b.addEventListener("click", () => {
      finLedgerDir = b.dataset.fd; document.querySelectorAll("#fin-filter button").forEach(x => x.classList.toggle("active", x === b)); paintRows(); }));
    document.getElementById("fin-q").addEventListener("input", (e) => { finLedgerQ = e.target.value; paintRows(); });
    paintRows();
  };

  function renderFinanceRules(c, challenges) {
    const box = document.getElementById("fin-rules");
    if (!box) return;
    box.innerHTML = challenges.map(ch => {
      const viol = S.ruleViolations(c, ch).filter(v => TRANSFER_RULES.includes(v.ruleId));
      const labels = (ch.rules||[]).filter(r => TRANSFER_RULES.includes(r.ruleId)).map(r => D.RULES[r.ruleId] ? D.RULES[r.ruleId].label : r.ruleId);
      return `<div class="list-row" data-goto="challenges" style="cursor:pointer;align-items:flex-start">
        <span class="ni-icon" data-icon="${viol.length ? "flag" : "check"}" style="color:${viol.length ? "var(--danger)" : "var(--accent)"};margin-top:2px"></span>
        <div class="lr-main"><b>${U.esc(ch.name)}</b><small>${U.esc(labels.join(" · "))}</small>
          ${viol.length
            ? viol.map(v => `<div class="faint" style="font-size:12px;margin-top:3px">• ${U.esc(v.text)}</div>`).join("")
            : `<div class="chip accent" style="margin-top:6px"><span class="ni-icon" data-icon="check"></span> Reto limpio</div>`}</div>
        <span class="ni-icon" data-icon="chevron" style="color:var(--text-dim)"></span></div>`;
    }).join("");
    U.hydrateIcons(box);
  }

  function transferModal(c, ex) {
    ex = ex || {};
    const season = S.currentSeason(c);
    const dir0 = ex.direction || "in";
    const typeOpts = [["transfer","Traspaso"],["free","Libre"],["loan","Cesión"],["youth","Cantera"]]
      .map(([v,l]) => `<option value="${v}" ${v===(ex.type||"transfer")?"selected":""}>${l}</option>`).join("");
    UI.openModal(ex.id ? "Editar movimiento" : "Registrar movimiento", `
      ${playersDatalist(c, "dl-tr-players")}
      <div class="field-row">
        <div class="field"><label>Movimiento</label><select id="t-dir">
          <option value="in" ${dir0==="in"?"selected":""}>Alta (entra al club)</option>
          <option value="out" ${dir0==="out"?"selected":""}>Baja (sale del club)</option></select></div>
        <div class="field"><label>Tipo</label><select id="t-type">${typeOpts}</select></div>
      </div>
      <div class="field"><label>Jugador</label><input type="text" id="t-player" list="dl-tr-players" value="${U.esc(ex.player||"")}" placeholder="Nombre del jugador"/></div>
      <div class="field-row">
        <div class="field"><label id="t-fee-label">${dir0==="out"?"Ingreso por venta (€)":"Coste (€)"}</label><input type="number" id="t-fee" min="0" value="${ex.fee!=null?ex.fee:""}" placeholder="0"/></div>
        <div class="field"><label id="t-club-label">${dir0==="out"?"Destino":"Procedencia"}</label><input type="text" id="t-club" value="${U.esc(ex.club||"")}" placeholder="Club"/></div>
      </div>
      <div class="field"><label>Fecha</label><input type="date" id="t-date" value="${ex.date||""}"/></div>
    `, `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="t-save"><span class="ni-icon" data-icon="check"></span> Guardar</button>`);
    const dirSel = document.getElementById("t-dir");
    dirSel.addEventListener("change", () => { const out = dirSel.value === "out";
      document.getElementById("t-fee-label").textContent = out ? "Ingreso por venta (€)" : "Coste (€)";
      document.getElementById("t-club-label").textContent = out ? "Destino" : "Procedencia"; });
    document.getElementById("t-save").addEventListener("click", () => {
      const player = document.getElementById("t-player").value.trim();
      if (!player) { UI.toast("Indica el jugador", "err"); return; }
      const fee = Number(document.getElementById("t-fee").value) || 0;
      if (!Number.isFinite(fee) || fee < 0) { UI.toast("El importe debe ser 0 o más", "err"); return; }
      const data = { seasonId: season.id, direction: dirSel.value, player,
        type: document.getElementById("t-type").value, fee,
        club: document.getElementById("t-club").value.trim(), date: document.getElementById("t-date").value };
      if (ex.id) S.updateTransfer(c, ex.id, data); else S.addTransfer(c, data);
      UI.closeModal(); UI.toast(ex.id ? "Movimiento actualizado" : "Movimiento registrado ⚽", "ok");
    });
  }

  /* ============================================================
     RETOS + LOGROS
     ============================================================ */
  FC.views.challenges = function () {
    const c = S.getActiveCareer();
    const active = (c.challenges || []).filter(ch => ch.status === "active");
    const purity = S.purityStreak(c);
    UI.mount(`
      <div class="page-head"><div><h1>Retos y logros</h1><div class="sub">Pon a prueba tu carrera</div></div>
        <button class="btn btn-primary" id="ch-custom"><span class="ni-icon" data-icon="plus"></span> Reto personalizado</button>
      </div>

      <div class="grid cols-2">
        <div class="purity">
          <div class="ni-icon" data-icon="flame" style="width:34px;height:34px;color:var(--accent)"></div>
          <div><div class="p-num">${purity}</div><div class="faint">${active.length ? "partidos sin infracciones" : "racha de pureza (sin retos activos)"}</div></div>
        </div>
        <div class="card tight flex center" style="justify-content:space-between">
          <div><div class="st-label">Retos activos</div><div class="st-value">${active.length}</div></div>
          <div><div class="st-label">Logros</div><div class="st-value">${(c.achievements||[]).length}<span class="faint" style="font-size:16px">/${D.ACHIEVEMENTS.length}</span></div></div>
        </div>
      </div>

      <div class="section-title">Retos activos</div>
      <div id="ch-active"></div>

      <div class="section-title">Catálogo de retos</div>
      <div class="grid cols-2" id="ch-catalog">
        ${D.CHALLENGES.map(t => `<div class="challenge-card">
          <div class="cc-top"><div class="cc-emoji">${t.emoji}</div>
            <div style="flex:1"><b>${U.esc(t.name)}</b><div class="faint" style="font-size:12px">${U.esc(t.category)}</div></div>
            <div class="difficulty">${[1,2,3,4,5].map(i => `<i class="${i<=t.difficulty?"on":""}"></i>`).join("")}</div></div>
          <div class="muted" style="font-size:13px">${U.esc(t.blurb)}</div>
          ${t.rules.length ? `<div class="cc-rules">${t.rules.map(r => `<span class="chip">${U.esc(D.RULES[r] ? D.RULES[r].label : r)}</span>`).join("")}</div>` : ""}
          <div class="faint" style="font-size:11px">Sugeridos: ${U.esc(t.recommended.join(", "))}</div>
          <button class="btn btn-ghost btn-sm" data-activate="${t.id}"><span class="ni-icon" data-icon="target"></span> Activar reto</button>
        </div>`).join("")}
      </div>

      <div class="section-title">Logros</div>
      <div class="ach-grid">
        ${D.ACHIEVEMENTS.map(a => { const got = (c.achievements||[]).includes(a.id); return `<div class="ach ${got?"":"locked"}">
          <div class="ach-medal tier-${a.tier}">${a.emoji}</div><div class="ach-name">${U.esc(a.name)}</div>
          <div class="ach-desc">${U.esc(a.desc)}</div><div class="chip tier-${a.tier}" style="margin-top:8px;font-size:10px">${D.TIER_LABEL[a.tier]}</div></div>`; }).join("")}
      </div>
    `);
    renderActiveChallenges(c);
    content().querySelectorAll("[data-activate]").forEach(b => b.addEventListener("click", () => activateChallenge(c, b.dataset.activate)));
    document.getElementById("ch-custom").addEventListener("click", () => customChallengeModal(c));
  };
  function renderActiveChallenges(c) {
    const box = document.getElementById("ch-active");
    const active = (c.challenges || []).filter(ch => ch.status === "active");
    if (!active.length) { box.innerHTML = `<p class="faint">No tienes retos activos. Activa uno del catálogo o crea el tuyo.</p>`; return; }
    box.innerHTML = active.map(ch => {
      const viol = S.ruleViolations(c, ch);
      return `<div class="card" style="margin-bottom:12px">
        <div class="flex between center"><div><h3 style="margin:0">${U.esc(ch.name)}</h3>
          <div class="cc-rules" style="margin-top:8px">${(ch.rules||[]).map(r => `<span class="chip">${U.esc(D.RULES[r.ruleId]?D.RULES[r.ruleId].label:r.ruleId)}${r.params&&r.params.nationality?": "+U.esc(r.params.nationality):""}${r.params&&r.params.amount?": "+FC.util.money(r.params.amount):""}${r.params&&r.params.age?": ≤"+U.esc(r.params.age):""}</span>`).join("")}</div></div>
          <div class="flex gap"><button class="icon-btn sm" data-done-ch="${ch.id}" title="Completar"><span class="ni-icon" data-icon="check"></span></button>
            <button class="icon-btn sm" data-del-ch="${ch.id}"><span class="ni-icon" data-icon="trash"></span></button></div></div>
        <div style="margin-top:12px">
          ${viol.length
            ? `<div class="chip danger" style="margin-bottom:8px">${viol.length} infracción(es)</div>${viol.map(v => `<div class="list-row"><span class="ni-icon" data-icon="flag" style="color:var(--danger)"></span><div class="lr-main"><b>${U.esc(v.label)}</b><small>${U.esc(v.text)}</small></div></div>`).join("")}`
            : `<div class="chip accent"><span class="ni-icon" data-icon="check"></span> Reto limpio — sin infracciones</div>`}
        </div></div>`;
    }).join("");
    U.hydrateIcons(box);
    box.querySelectorAll("[data-del-ch]").forEach(b => b.addEventListener("click", () => { S.deleteChallenge(c, b.dataset.delCh); UI.toast("Reto eliminado"); }));
    box.querySelectorAll("[data-done-ch]").forEach(b => b.addEventListener("click", () => { S.updateChallenge(c, b.dataset.doneCh, { status: "done" }); UI.toast("¡Reto completado! 🏆", "ok"); }));
  }
  function ruleParamsFields(ruleIds) {
    let html = "";
    ruleIds.forEach(rid => {
      const def = D.RULES[rid];
      if (def && def.params) def.params.forEach(p => {
        html += `<div class="field"><label>${U.esc(def.label)} — ${U.esc(p.label)}</label><input type="${p.type}" data-param="${rid}:${p.key}" placeholder="${U.esc(p.placeholder||"")}"/></div>`;
      });
    });
    return html;
  }
  function activateChallenge(c, templateId) {
    const t = D.CHALLENGES.find(x => x.id === templateId);
    const paramFields = ruleParamsFields(t.rules);
    UI.openModal("Activar: " + t.name, `
      <p class="muted" style="margin-top:0">${U.esc(t.blurb)}</p>
      ${paramFields || `<p class="faint">Este reto no requiere parámetros. El vigilante seguirá tu progreso.</p>`}`,
      `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="ac-go">Activar</button>`);
    document.getElementById("ac-go").addEventListener("click", () => {
      const rules = t.rules.map(rid => {
        const params = {};
        document.querySelectorAll(`[data-param^="${rid}:"]`).forEach(inp => { params[inp.dataset.param.split(":")[1]] = inp.value; });
        return { ruleId: rid, params };
      });
      S.addChallenge(c, { templateId, name: t.name, emoji: t.emoji, rules, status: "active", startedAt: Date.now() });
      UI.closeModal(); UI.toast("Reto activado 🎯", "ok"); FC.router.go("challenges");
    });
  }
  function customChallengeModal(c) {
    UI.openModal("Reto personalizado", `
      <div class="field"><label>Nombre del reto</label><input type="text" id="cc-name" placeholder="p.ej. Solo españoles sub-21"/></div>
      <div class="section-title" style="margin:6px 2px">Reglas (el vigilante las verificará)</div>
      <div class="list" id="cc-rules">
        ${Object.keys(D.RULES).map(rid => { const def = D.RULES[rid]; return `<label class="list-row" style="cursor:pointer">
          <input type="checkbox" data-rule="${rid}" style="width:18px;height:18px;accent-color:var(--accent)"/>
          <div class="lr-main"><b>${U.esc(def.label)}</b><small>${U.esc(def.desc)}</small></div></label>`; }).join("")}
      </div>
      <div id="cc-params" style="margin-top:10px"></div>
    `, `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="cc-save">Crear reto</button>`, { lg: true });
    const paramsBox = document.getElementById("cc-params");
    function refreshParams() {
      const ids = Array.from(document.querySelectorAll("[data-rule]:checked")).map(i => i.dataset.rule);
      paramsBox.innerHTML = ruleParamsFields(ids);
    }
    document.querySelectorAll("[data-rule]").forEach(i => i.addEventListener("change", refreshParams));
    document.getElementById("cc-save").addEventListener("click", () => {
      const name = document.getElementById("cc-name").value.trim() || "Reto personalizado";
      const ids = Array.from(document.querySelectorAll("[data-rule]:checked")).map(i => i.dataset.rule);
      if (!ids.length) { UI.toast("Selecciona al menos una regla", "err"); return; }
      const rules = ids.map(rid => {
        const params = {};
        document.querySelectorAll(`[data-param^="${rid}:"]`).forEach(inp => { params[inp.dataset.param.split(":")[1]] = inp.value; });
        return { ruleId: rid, params };
      });
      S.addChallenge(c, { name, emoji: "🎯", rules, status: "active", startedAt: Date.now(), custom: true });
      UI.closeModal(); UI.toast("Reto creado 🎯", "ok"); FC.router.go("challenges");
    });
  }

  /* ============================================================
     HISTORIA
     ============================================================ */
  FC.views.history = function () {
    const c = S.getActiveCareer();
    const rec = S.allTimeRecords(c);
    const trophies = (c.trophies || []).slice().sort((a,b) => (b.season||"").localeCompare(a.season||""));
    const seasonsRows = (c.seasons || []).slice().sort(U.by("startYear")).reverse().map(s => { const sm = S.seasonSummary(c, s); const pos = S.userPosition(c, s.id); return { s, sm, pos }; });
    UI.mount(`
      <div class="page-head"><div><h1>Historia del club</h1><div class="sub">Tu legado, temporada a temporada</div></div>
        <div class="flex gap"><button class="btn btn-ghost" id="hs-award"><span class="ni-icon" data-icon="star"></span> Premio</button>
          <button class="btn btn-primary" id="hs-trophy"><span class="ni-icon" data-icon="trophy"></span> Añadir trofeo</button></div>
      </div>

      <div class="section-title">Vitrina de trofeos</div>
      <div class="card">${trophies.length ? `<div class="grid cols-4 keep-2">${trophies.map(t => `<div class="card tight text-c" style="position:relative">
        <button class="icon-btn sm" data-del-trophy="${t.id}" style="position:absolute;top:6px;right:6px"><span class="ni-icon" data-icon="trash"></span></button>
        <div style="font-size:34px">${t.result === "winner" ? "🏆" : t.result === "promotion" ? "⬆️" : "🥈"}</div>
        <b style="display:block;margin-top:4px">${U.esc(t.competition)}</b><small class="faint">${U.esc(t.season||"")} · ${t.result === "winner" ? "Campeón" : t.result === "promotion" ? "Ascenso" : "Subcampeón"}</small></div>`).join("")}</div>`
        : `<div class="empty"><div class="emoji">🏆</div><h3>Vitrina vacía</h3><p>Registra los títulos que vayas ganando.</p></div>`}</div>

      <div class="section-title">Récords históricos</div>
      <div class="grid cols-4 keep-2">
        ${recordTile("Máx. goleador", rec.topScorer, "goals", "⚽")}
        ${recordTile("Máx. asistente", rec.topAssister, "assists", "🅰️")}
        ${recordTile("Más partidos", rec.topApps, "apps", "👕")}
        ${statTile("Racha sin perder", rec.bestUnbeaten, "partidos")}
      </div>
      ${rec.bestWin && rec.bestWin.diff > 0 ? `<div class="card mt"><b>Mayor goleada:</b> ${U.esc(rec.bestWin.match.home)} ${rec.bestWin.match.homeScore}-${rec.bestWin.match.awayScore} ${U.esc(rec.bestWin.match.away)}</div>` : ""}

      <div class="section-title">Premios individuales</div>
      <div class="card">${(c.awards||[]).length ? `<div class="list">${(c.awards||[]).slice().reverse().map(a => `<div class="list-row">
        <span style="font-size:20px">${a.icon||"🏅"}</span><div class="lr-main"><b>${U.esc(a.title)}</b><small>${U.esc(a.player||"")} · ${U.esc(a.season||"")}</small></div>
        <button class="icon-btn sm" data-del-award="${a.id}"><span class="ni-icon" data-icon="trash"></span></button></div>`).join("")}</div>`
        : `<p class="faint">Registra Balón de Oro, Bota de Oro, MVP del mes...</p>`}</div>

      <div class="section-title">Resumen por temporadas</div>
      <div class="card tight"><div class="table-wrap"><table class="tbl"><thead><tr>
        <th>Temporada</th><th>Liga</th><th class="num">Pos</th><th class="num">PJ</th><th class="num">V-E-D</th><th class="num">GF:GC</th><th class="num">Títulos</th>
      </tr></thead><tbody>
      ${seasonsRows.map(({s, sm, pos}) => `<tr><td><b>${U.esc(s.label)}</b></td><td class="faint">${U.esc(s.leagueName||c.leagueName)}</td>
        <td class="num">${pos ? pos.pos + "º" : "—"}</td><td class="num">${sm.played}</td><td class="num">${sm.w}-${sm.d}-${sm.l}</td>
        <td class="num">${sm.gf}:${sm.ga}</td><td class="num">${sm.trophies}</td></tr>`).join("")}
      </tbody></table></div></div>

      ${(function(){
        const played = S.userMatches(c).filter(m => m.formation);
        if (!played.length) return "";
        const counts = {};
        played.forEach(m => { counts[m.formation] = (counts[m.formation] || 0) + 1; });
        const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
        const total = played.length;
        return `<div class="section-title">Formaciones más usadas</div>
          <div class="card tight"><div class="table-wrap"><table class="tbl"><thead><tr><th>Formación</th><th class="num">Partidos</th><th class="num">% uso</th></tr></thead><tbody>
          ${sorted.map(([f, n]) => `<tr><td><b>${U.esc(f)}</b></td><td class="num">${n}</td><td class="num faint">${Math.round(n/total*100)}%</td></tr>`).join("")}
          </tbody></table></div></div>`;
      })()}
      <div class="section-title">Diario de la carrera</div>
      <div class="card"><button class="btn btn-ghost btn-sm mb" id="hs-note"><span class="ni-icon" data-icon="book"></span> Nueva entrada</button>
        <div id="hs-notes"></div></div>
    `);
    renderNotes(c);
    document.getElementById("hs-trophy").addEventListener("click", () => trophyModal(c));
    document.getElementById("hs-award").addEventListener("click", () => awardModal(c));
    document.getElementById("hs-note").addEventListener("click", () => noteModal(c));
    content().querySelectorAll("[data-del-trophy]").forEach(b => b.addEventListener("click", () => { S.deleteTrophy(c, b.dataset.delTrophy); UI.toast("Trofeo eliminado"); }));
    content().querySelectorAll("[data-del-award]").forEach(b => b.addEventListener("click", () => { S.deleteAward(c, b.dataset.delAward); UI.toast("Premio eliminado"); }));
  };
  function recordTile(label, p, key, emoji) {
    return `<div class="card stat-tile"><div class="st-glow"></div><div class="st-label">${emoji} ${label}</div>
      <div class="st-value" style="font-size:20px">${p && p[key] ? U.esc(p.name) : "—"}</div>
      <div class="st-sub">${p && p[key] ? p[key] + (key === "apps" ? " partidos" : key === "goals" ? " goles" : " asist.") : "Sin datos"}</div></div>`;
  }
  function renderNotes(c) {
    const box = document.getElementById("hs-notes");
    const notes = (c.notes || []).slice().reverse();
    box.innerHTML = notes.length ? notes.map(n => `<div class="list-row"><div class="lr-main"><b>${U.esc(n.title)}</b><small>${U.esc(n.season||"")} · ${U.fmtDate(n.date)}</small>
      ${n.body ? `<div class="muted" style="font-size:13px;margin-top:4px">${U.esc(n.body)}</div>` : ""}</div>
      <button class="icon-btn sm" data-del-note="${n.id}"><span class="ni-icon" data-icon="trash"></span></button></div>`).join("")
      : `<p class="faint">Escribe crónicas, momentos clave o decisiones de tu carrera.</p>`;
    U.hydrateIcons(box);
    box.querySelectorAll("[data-del-note]").forEach(b => b.addEventListener("click", () => { S.deleteNote(c, b.dataset.delNote); renderNotes(c); }));
  }
  function trophyModal(c) {
    const season = S.currentSeason(c);
    UI.openModal("Añadir trofeo", `
      <div class="field"><label>Competición</label><input type="text" id="t-comp" list="dl-comp" placeholder="p.ej. LaLiga / Champions"/>
        <datalist id="dl-comp">${D.COMPETITIONS.map(x => `<option value="${x}">`).join("")}</datalist></div>
      <div class="field-row"><div class="field"><label>Temporada</label><select id="t-season">${(c.seasons||[]).map(s => `<option value="${s.label}" ${s.id===season.id?"selected":""}>${U.esc(s.label)}</option>`).join("")}</select></div>
        <div class="field"><label>Resultado</label><select id="t-res"><option value="winner">Campeón 🏆</option><option value="runnerup">Subcampeón 🥈</option><option value="promotion">Ascenso ⬆️</option></select></div></div>
    `, `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="t-save">Guardar</button>`);
    document.getElementById("t-save").addEventListener("click", () => {
      const comp = document.getElementById("t-comp").value.trim();
      if (!comp) { UI.toast("Indica la competición", "err"); return; }
      const label = document.getElementById("t-season").value;
      const s = (c.seasons||[]).find(x => x.label === label);
      S.addTrophy(c, { competition: comp, season: label, seasonId: s ? s.id : season.id, result: document.getElementById("t-res").value });
      UI.closeModal(); UI.toast("Trofeo añadido 🏆", "ok");
    });
  }
  function awardModal(c) {
    const season = S.currentSeason(c);
    UI.openModal("Añadir premio", `
      <div class="field"><label>Premio</label><input type="text" id="a-title" placeholder="p.ej. Balón de Oro / Bota de Oro"/></div>
      <div class="field-row"><div class="field"><label>Jugador</label><input type="text" id="a-player" list="dl-players2" placeholder="Nombre"/>
        <datalist id="dl-players2">${(c.players||[]).map(p => `<option value="${U.esc(p.name)}">`).join("")}</datalist></div>
        <div class="field"><label>Temporada</label><select id="a-season">${(c.seasons||[]).map(s => `<option value="${s.label}" ${s.id===season.id?"selected":""}>${U.esc(s.label)}</option>`).join("")}</select></div></div>
    `, `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="a-save">Guardar</button>`);
    document.getElementById("a-save").addEventListener("click", () => {
      const title = document.getElementById("a-title").value.trim();
      if (!title) { UI.toast("Indica el premio", "err"); return; }
      S.addAward(c, { title, player: document.getElementById("a-player").value.trim(), season: document.getElementById("a-season").value });
      UI.closeModal(); UI.toast("Premio añadido 🏅", "ok");
    });
  }
  function noteModal(c) {
    const season = S.currentSeason(c);
    UI.openModal("Nueva entrada del diario", `
      <div class="field"><label>Título</label><input type="text" id="n-title" placeholder="p.ej. Remontada histórica en Champions"/></div>
      <div class="field"><label>Texto</label><textarea id="n-body" placeholder="Cuenta qué pasó..."></textarea></div>
    `, `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="n-save">Guardar</button>`);
    document.getElementById("n-save").addEventListener("click", () => {
      const title = document.getElementById("n-title").value.trim();
      if (!title) { UI.toast("Escribe un título", "err"); return; }
      S.addNote(c, { title, body: document.getElementById("n-body").value.trim(), season: season.label, date: new Date().toISOString() });
      UI.closeModal(); renderNotes(c); UI.toast("Entrada guardada 📖", "ok");
    });
  }

  /* ============================================================
     SCOUTING (wonderkids)
     ============================================================ */
  FC.views.scouting = function () {
    const c = S.getActiveCareer();
    c.shortlist = c.shortlist || [];
    UI.mount(`
      <div class="page-head"><div><h1>Scouting · Wonderkids</h1><div class="sub">Las mayores promesas de FC 26 · datos de referencia</div></div></div>
      <div class="card tight mb">
        <div class="field-row three" style="margin-bottom:0">
          <div class="field" style="margin:0"><label>Buscar</label><input type="search" id="sc-q" placeholder="Nombre o club"/></div>
          <div class="field" style="margin:0"><label>Posición</label><select id="sc-pos"><option value="">Todas</option>${D.POSITIONS.map(p => `<option>${p}</option>`).join("")}</select></div>
          <div class="field" style="margin:0"><label>Potencial mínimo</label><input type="number" id="sc-pot" value="83" min="70" max="99"/></div>
        </div>
      </div>
      <div class="card tight"><div class="table-wrap"><table class="tbl"><thead><tr>
        <th></th><th>Jugador</th><th>Pos</th><th class="num">Edad</th><th class="num">OVR</th><th class="num">POT</th><th>Club</th><th>País</th>
      </tr></thead><tbody id="sc-rows"></tbody></table></div></div>
      <p class="faint" style="font-size:12px;margin-top:10px">⚠️ Estos son potenciales “de fábrica” de referencia, no los de tu partida concreta. En una versión futura podrás importar los datos reales de tu save (PC).</p>
    `);
    function render() {
      const q = document.getElementById("sc-q").value.toLowerCase();
      const pos = document.getElementById("sc-pos").value;
      const pot = Number(document.getElementById("sc-pot").value) || 0;
      const rows = D.WONDERKIDS.filter(w => (!q || w.name.toLowerCase().includes(q) || w.club.toLowerCase().includes(q)) && (!pos || w.position === pos) && w.potential >= pot)
        .sort((a,b) => b.potential - a.potential);
      document.getElementById("sc-rows").innerHTML = rows.length ? rows.map(w => { const star = c.shortlist.includes(w.name);
        return `<tr><td><button class="icon-btn sm" data-star="${U.esc(w.name)}" style="color:${star?"var(--accent-3)":"var(--text-dim)"}"><span class="ni-icon" data-icon="star"></span></button></td>
        <td><b>${U.esc(w.name)}</b></td><td><span class="chip">${w.position}</span></td><td class="num">${w.age}</td>
        <td class="num"><span class="ovr ${U.ovrClass(w.ovr)}">${w.ovr}</span></td><td class="num"><span class="ovr">${w.potential}</span></td>
        <td class="faint">${U.esc(w.club)}</td><td class="faint">${U.esc(w.nationality)}</td></tr>`; }).join("")
        : `<tr><td colspan="8"><div class="empty" style="padding:24px"><p>Sin resultados con esos filtros.</p></div></td></tr>`;
      U.hydrateIcons(document.getElementById("sc-rows"));
      document.querySelectorAll("[data-star]").forEach(b => b.addEventListener("click", () => {
        const n = b.dataset.star; const i = c.shortlist.indexOf(n);
        if (i >= 0) c.shortlist.splice(i, 1); else c.shortlist.push(n);
        S.emit(); render();
      }));
    }
    ["sc-q","sc-pos","sc-pot"].forEach(id => document.getElementById(id).addEventListener("input", render));
    render();
  };

  /* ============================================================
     AJUSTES Y DATOS
     ============================================================ */
  FC.views.settings = function () {
    const c = S.getActiveCareer();
    UI.mount(`
      <div class="page-head"><div><h1>Ajustes y datos</h1><div class="sub">Gestiona tu carrera y tus datos</div></div></div>

      <div class="section-title">Apariencia</div>
      <div class="card">
        <p class="muted" style="margin-top:0">Color de acento de la app. El tema claro/oscuro se cambia con el botón ☾ del menú.</p>
        <div class="flex gap wrap" id="se-accents">
          ${D.ACCENTS.map(a => `<button class="accent-dot ${(S.settings().accent||"#00e1a0")===a.color?"active":""}" data-accent="${a.color}" title="${U.esc(a.name)}" style="background:${a.color}"></button>`).join("")}
        </div>
      </div>

      <div class="section-title">Carrera actual</div>
      <div class="card">
        <div class="field-row"><div class="field"><label>Nombre del club</label><input type="text" id="se-club" value="${U.esc(c.clubName)}"/></div>
          <div class="field"><label>Mánager</label><input type="text" id="se-manager" value="${U.esc(c.managerName||"")}"/></div></div>
        <div class="flex gap wrap">
          <button class="btn btn-primary" id="se-save">Guardar cambios</button>
          <button class="btn btn-ghost" id="se-newseason"><span class="ni-icon" data-icon="plus"></span> Nueva temporada</button>
          <button class="btn btn-danger" id="se-delete"><span class="ni-icon" data-icon="trash"></span> Eliminar carrera</button>
        </div>
      </div>

      <div class="section-title">Mis carreras</div>
      <div class="card"><div class="list" id="se-careers"></div>
        <button class="btn btn-ghost mt" id="se-new"><span class="ni-icon" data-icon="plus"></span> Crear otra carrera</button></div>

      <div class="section-title">Copia de seguridad</div>
      <div class="card">
        <p class="muted" style="margin-top:0">Tus datos viven en este navegador. Expórtalos para no perderlos nunca o llevarlos a otro dispositivo.</p>
        <div class="flex gap wrap">
          <button class="btn" id="se-export"><span class="ni-icon" data-icon="download"></span> Exportar (.json)</button>
          <button class="btn" id="se-import"><span class="ni-icon" data-icon="upload"></span> Importar</button>
          <input type="file" id="se-file" accept="application/json" hidden/>
        </div>
      </div>

      <div class="section-title">Importar partidos (CSV)</div>
      <div class="card">
        <p class="muted" style="margin-top:0">Pega o sube un CSV de partidos. Cabecera: <code>fecha, competicion, ronda, condicion, rival, gf, ga</code> <span class="faint">— condición = local/visitante · gf = tus goles · ga = los del rival. Sin <code>competicion</code> se asume «Liga».</span></p>
        <div class="field"><label>Temporada destino</label>
          <select id="se-csv-season">${(c.seasons||[]).slice().sort(U.by("startYear")).reverse().map(s => `<option value="${s.id}" ${s.id===c.currentSeasonId?"selected":""}>${U.esc(s.label)}</option>`).join("")}</select></div>
        <div class="field"><textarea id="se-csv-text" placeholder="fecha,competicion,condicion,rival,gf,ga&#10;2025-09-01,Liga,local,Rival CF,3,1&#10;2025-09-08,Liga,visitante,Otro CF,0,2"></textarea></div>
        <div class="flex gap wrap">
          <button class="btn" id="se-csv-upload"><span class="ni-icon" data-icon="upload"></span> Subir .csv</button>
          <button class="btn btn-primary" id="se-csv-import"><span class="ni-icon" data-icon="check"></span> Importar partidos</button>
          <input type="file" id="se-csv-file" accept=".csv,text/csv" hidden/>
        </div>
      </div>

      <div class="section-title">Sobre los datos del Modo Carrera</div>
      <div class="card muted" style="font-size:13px">
        <p style="margin-top:0">EA Sports FC <b>no ofrece una API oficial</b> para el Modo Carrera: los datos están en tu partida. Por eso esta app funciona con <b>entrada manual asistida</b> y nada se sincroniza automáticamente.</p>
        <p style="margin-bottom:0">Ya puedes <b>importar partidos por CSV</b> (arriba). En la hoja de ruta quedan capas que requieren más infraestructura: subir el save de PC (solo lectura), OCR de capturas, y la versión con cuentas en la nube y comunidad (compartir carreras, leaderboards).</p>
      </div>
    `);
    document.getElementById("se-save").addEventListener("click", () => {
      S.updateCareer({ clubName: document.getElementById("se-club").value.trim() || c.clubName, managerName: document.getElementById("se-manager").value.trim() });
      UI.toast("Cambios guardados", "ok");
    });
    document.getElementById("se-newseason").addEventListener("click", () => UI.confirm("¿Avanzar a una nueva temporada? La actual quedará archivada en tu historia.", () => { S.addSeason(c); UI.toast("Nueva temporada iniciada", "ok"); FC.router.go("dashboard"); }));
    document.getElementById("se-delete").addEventListener("click", () => UI.confirm("¿Eliminar esta carrera y todos sus datos? No se puede deshacer.", () => {
      S.deleteCareer(c.id); FC.app.boot();
    }, true));
    document.getElementById("se-new").addEventListener("click", () => { FC.views.onboarding(); });
    // careers list
    const cl = document.getElementById("se-careers");
    cl.innerHTML = S.careersList().map(cc => `<div class="list-row">
      <div class="career-badge" style="background:${U.safeColor(cc.badgeColor, U.colorFor(cc.clubName))}">${U.initials(cc.clubName)}</div>
      <div class="lr-main"><b>${U.esc(cc.clubName)}</b><small>${U.esc(cc.leagueName)} · ${(cc.seasons||[]).length} temp.</small></div>
      ${cc.id === c.id ? `<span class="chip accent">Activa</span>` : `<button class="btn btn-ghost btn-sm" data-switch="${cc.id}">Abrir</button>`}</div>`).join("");
    cl.querySelectorAll("[data-switch]").forEach(b => b.addEventListener("click", () => { S.setActiveCareer(b.dataset.switch); FC.router.go("dashboard"); FC.app.refreshChrome(); }));
    // export/import
    document.getElementById("se-export").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(S.raw(), null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = "carrera-fc-backup.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      UI.toast("Copia exportada", "ok");
    });
    const file = document.getElementById("se-file");
    document.getElementById("se-import").addEventListener("click", () => file.click());
    file.addEventListener("change", () => {
      const f = file.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          if (!data.careers) throw new Error("formato");
          UI.confirm("Importar reemplazará tus datos actuales. ¿Continuar?", () => {
            localStorage.setItem("carrerafc:db:v1", JSON.stringify(data));
            S.load(); FC.app.boot(); UI.toast("Datos importados", "ok");
          });
        } catch (e) { UI.toast("Archivo no válido", "err"); }
      };
      r.readAsText(f);
    });
    // importar partidos por CSV
    const csvFile = document.getElementById("se-csv-file");
    document.getElementById("se-csv-upload").addEventListener("click", () => csvFile.click());
    csvFile.addEventListener("change", () => {
      const f = csvFile.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { document.getElementById("se-csv-text").value = r.result; UI.toast("CSV cargado: revisa y pulsa Importar", "ok"); };
      r.readAsText(f);
    });
    document.getElementById("se-csv-import").addEventListener("click", () => {
      const txt = document.getElementById("se-csv-text").value;
      if (!txt.trim()) { UI.toast("Pega o sube un CSV primero", "err"); return; }
      const res = S.importMatchesCSV(c, txt, document.getElementById("se-csv-season").value);
      if (res.error) { UI.toast(res.error, "err"); return; }
      UI.toast("Importados " + res.added + " partidos" + (res.skipped ? " · " + res.skipped + " omitidos" : ""), "ok");
      if (res.added) FC.router.go("matches");
    });
    // apariencia: acento de color (S.save directo, sin emit → sin re-render)
    document.querySelectorAll("#se-accents .accent-dot").forEach(d => d.addEventListener("click", () => {
      const color = d.dataset.accent;
      S.settings().accent = color; S.save(); FC.app.applyAccent(color);
      document.querySelectorAll("#se-accents .accent-dot").forEach(x => x.classList.toggle("active", x === d));
      UI.toast("Acento actualizado", "ok");
    }));
  };

  /* ============================================================
     COMUNIDAD / NUBE (Fase 1: cuentas + sync)
     ============================================================ */
  let cloudCodeSent = false, cloudPendingEmail = "";
  let cloudFeedRows = null, cloudFeedLoading = false; // caché del feed (módulo: sobrevive a los re-render de S.emit)
  FC.views.cloud = function () {
    const CL = FC.cloud, cfg = CL.config(), configured = CL.isConfigured(), logged = CL.isLoggedIn();
    const rerender = () => FC.views.cloud();
    const fmtBackup = cfg.lastBackup ? U.fmtDate(cfg.lastBackup) : "nunca";
    let body;
    if (!configured) {
      body = `<div class="card">
        <h3 style="margin-top:0"><span class="ni-icon" data-icon="cloud"></span> Conecta tu nube</h3>
        <p class="muted">Guarda tus carreras en la nube y accede desde cualquier dispositivo, con un proyecto gratuito de <b>Supabase</b>. Tus claves se guardan solo en este navegador.</p>
        <div class="field"><label>URL del proyecto</label><input type="text" id="cl-url" placeholder="https://xxxxx.supabase.co"/></div>
        <div class="field"><label>Clave pública (anon key)</label><input type="text" id="cl-key" placeholder="eyJhbGciOi..."/></div>
        <button class="btn btn-primary" id="cl-connect"><span class="ni-icon" data-icon="cloud"></span> Conectar</button>
        <details style="margin-top:16px"><summary class="muted" style="cursor:pointer">¿Cómo preparo Supabase? (una vez)</summary>
          <ol class="muted" style="font-size:13px;line-height:1.7;padding-left:18px;margin-bottom:6px">
            <li>Crea un proyecto gratis en <b>supabase.com</b>.</li>
            <li>En <b>SQL Editor</b>, ejecuta este SQL:</li></ol>
          <textarea readonly style="min-height:172px;font-size:11px">${U.esc(CL.SETUP_SQL)}</textarea>
          <ol class="muted" start="3" style="font-size:13px;line-height:1.7;padding-left:18px">
            <li>En <b>Project Settings → API</b> copia la <b>URL</b> y la <b>anon key</b> y pégalas arriba.</li>
            <li>En <b>Authentication → Email Templates → Magic Link</b> asegúrate de incluir el código <code>{{ .Token }}</code> (login por código).</li></ol>
          <p class="faint" style="font-size:12px">Usa la app por <code>http://localhost:4321</code> o publicada (no por doble-clic / file://) para evitar problemas de CORS.</p>
        </details></div>`;
    } else if (!logged) {
      body = `<div class="card">
        <h3 style="margin-top:0"><span class="ni-icon" data-icon="cloud"></span> Inicia sesión</h3>
        <p class="muted">Acceso sin contraseña: te enviamos un <b>enlace mágico</b> a tu email. Haz clic en él y volverás aquí con la sesión iniciada.</p>
        ${!cloudCodeSent
          ? `<div class="field"><label>Email</label><input type="email" id="cl-email" value="${U.esc(cloudPendingEmail)}" placeholder="tu@email.com"/></div>
             <button class="btn btn-primary" id="cl-send"><span class="ni-icon" data-icon="bell"></span> Enviar enlace</button>`
          : `<div style="background:var(--card-alt,rgba(255,255,255,.06));border-radius:10px;padding:16px;text-align:center">
               <div style="font-size:28px;margin-bottom:8px">📬</div>
               <b>Revisa tu email</b>
               <p class="muted" style="margin:6px 0 0">Hemos enviado un enlace a <b>${U.esc(cloudPendingEmail)}</b>.<br>Haz clic en él — esta página se actualizará sola.</p>
             </div>
             <button class="btn btn-ghost" style="margin-top:10px;width:100%" id="cl-back">Cambiar email</button>`}
        <div class="divider"></div>
        <div class="flex between center"><span class="faint" style="font-size:12px">Conectado a ${U.esc((cfg.url||"").replace(/^https?:\/\//,""))}</span>
          <button class="btn btn-ghost btn-sm" id="cl-disconnect">Desconectar nube</button></div></div>`;
    } else {
      const u = CL.user() || {};
      body = `<div class="card">
        <div class="flex between center wrap"><div><h3 style="margin:0"><span class="ni-icon" data-icon="cloud"></span> Sesión iniciada</h3>
          <div class="faint" style="font-size:13px;margin-top:4px">${U.esc(u.email||"")}</div></div>
          <button class="btn btn-ghost btn-sm" id="cl-logout">Cerrar sesión</button></div>
        <div class="divider"></div>
        <div class="grid cols-2 keep-2">
          ${statTile("Carreras locales", S.careersList().length, "en este navegador")}
          ${statTile("Última copia", fmtBackup, "subida a la nube")}
        </div>
        <div class="flex gap wrap" style="margin-top:14px">
          <button class="btn btn-primary" id="cl-push"><span class="ni-icon" data-icon="upload"></span> Subir a la nube</button>
          <button class="btn" id="cl-pull"><span class="ni-icon" data-icon="download"></span> Restaurar de la nube</button>
          <button class="btn btn-ghost" id="cl-count">Ver carreras en la nube</button>
        </div>
        <p class="faint" style="font-size:12px;margin-top:12px">«Subir» guarda TODAS tus carreras locales en la nube. «Restaurar» trae las de la nube a este dispositivo (añade y reemplaza las que coincidan; no borra las locales).</p>
      </div>
      <div class="section-title">Compartir carreras</div>
      <div class="card">
        <p class="faint" style="font-size:12px;margin-top:0">Publicar genera un enlace público de SOLO LECTURA con el <b>resumen</b> de tu carrera (club, palmarés, récords). No expone notas, plantilla ni finanzas.</p>
        <div class="list" id="cl-shares"></div>
        <div class="divider"></div>
        <p class="faint" style="font-size:12px;margin-top:0">Tu <b>perfil público</b> reúne todas tus carreras publicadas en una sola página.</p>
        <div class="flex gap wrap">
          <button class="btn btn-ghost btn-sm" id="cl-myprofile"><span class="ni-icon" data-icon="cloud"></span> Ver mi perfil público</button>
          <button class="btn btn-ghost btn-sm" id="cl-myprofile-link"><span class="ni-icon" data-icon="share"></span> Copiar enlace de mi perfil</button>
        </div>
      </div>
      <div class="section-title">Ver carrera compartida</div>
      <div class="card">
        <div class="field-row" style="margin-bottom:0;align-items:end">
          <div class="field" style="margin:0"><label>Código de carrera</label><input type="text" id="cl-viewcode" placeholder="p.ej. a1b2c3d4e5"/></div>
          <div class="field" style="margin:0"><label>&nbsp;</label><button class="btn btn-block" id="cl-view"><span class="ni-icon" data-icon="search"></span> Ver</button></div>
        </div>
        <p class="faint" style="font-size:12px;margin:10px 0 0">Publica una carrera (arriba) y aparecerá en el ranking global de abajo.</p>
        <div class="divider"></div>
        <div class="flex" style="justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="cl-disconnect">Desconectar nube</button></div>
      </div>`;
    }
    if (configured) body += `
      <div class="section-title">Actividad reciente</div>
      <div class="card">
        <div class="flex between center" style="gap:8px"><p class="faint" style="font-size:12px;margin:0">Lo último que la comunidad ha publicado. Pulsa una tarjeta para ver la carrera.</p>
          <button class="btn btn-ghost btn-sm" id="cl-feed-refresh"><span class="ni-icon" data-icon="news"></span> Actualizar</button></div>
        <div id="cl-feed" style="margin-top:12px"><p class="faint">Cargando…</p></div>
      </div>
      <div class="section-title">Ranking global · Hall of Fame</div>
      <div class="card">
        <p class="faint" style="font-size:12px;margin-top:0">Las carreras que la comunidad ha publicado, ordenadas por títulos. Pulsa una para ver su resumen.</p>
        <button class="btn" id="cl-lb-load"><span class="ni-icon" data-icon="medal"></span> Cargar ranking</button>
        <div id="cl-lb" style="margin-top:12px"></div>
      </div>`;
    UI.mount(`<div class="page-head"><div><h1>Comunidad</h1><div class="sub">Cuentas y sincronización en la nube</div></div></div>${body}`);

    const busy = (id, fn) => async () => { const el = document.getElementById(id); if (el) el.disabled = true; try { await fn(); } catch (e) { UI.toast(e.message || "Error", "err"); if (el) el.disabled = false; } };
    const $ = (id) => document.getElementById(id);
    if (!configured) {
      $("cl-connect").addEventListener("click", () => {
        const url = $("cl-url").value.trim(), key = $("cl-key").value.trim();
        if (!CL.validUrl(url)) { UI.toast("La URL debe ser https://xxxxx.supabase.co", "err"); return; }
        if (!key) { UI.toast("Pega la clave pública (anon key)", "err"); return; }
        CL.setConfig(url, key); UI.toast("Nube conectada", "ok"); rerender();
      });
    } else if (!logged) {
      if ($("cl-send")) $("cl-send").addEventListener("click", busy("cl-send", async () => {
        const email = $("cl-email").value.trim(); if (!email) { UI.toast("Escribe tu email", "err"); return; }
        await CL.sendCode(email); cloudPendingEmail = email; cloudCodeSent = true; UI.toast("¡Enlace enviado! Revisa tu email.", "ok"); rerender();
      }));
      if ($("cl-back")) $("cl-back").addEventListener("click", () => { cloudCodeSent = false; rerender(); });
      $("cl-disconnect").addEventListener("click", () => UI.confirm("¿Desconectar la nube de este navegador?", () => { CL.disconnect(); cloudCodeSent = false; UI.toast("Nube desconectada"); rerender(); }, true));
    } else {
      $("cl-logout").addEventListener("click", () => { CL.logout(); UI.toast("Sesión cerrada"); rerender(); });
      $("cl-push").addEventListener("click", busy("cl-push", async () => { const r = await CL.push(); UI.toast("Subidas " + r.pushed + " carreras a la nube", "ok"); rerender(); }));
      $("cl-pull").addEventListener("click", () => UI.confirm("Traerá tus carreras de la nube y reemplazará las que coincidan por id. ¿Continuar?", busy("cl-pull", async () => { const r = await CL.pull(); UI.toast("Restauradas " + r.pulled + " carreras", "ok"); FC.app.refreshChrome(); rerender(); })));
      $("cl-count").addEventListener("click", busy("cl-count", async () => { const n = await CL.cloudCount(); UI.toast("Tienes " + n + " carreras en la nube", "ok"); }));
      const renderShares = () => {
        const box = $("cl-shares"); if (!box) return;
        box.innerHTML = S.careersList().map(cc => {
          const shared = CL.isShared(cc.id);
          return `<div class="list-row"><div class="lr-main"><b>${U.esc(cc.clubName)}</b><small class="faint">${shared ? "Compartida" : "No compartida"}</small></div>
            <div class="flex gap">${shared
              ? `<button class="btn btn-ghost btn-sm" data-copylink="${cc.id}"><span class="ni-icon" data-icon="share"></span> Enlace</button><button class="btn btn-ghost btn-sm" data-unpub="${cc.id}">Quitar</button>`
              : `<button class="btn btn-sm" data-pub="${cc.id}"><span class="ni-icon" data-icon="upload"></span> Publicar</button>`}</div></div>`;
        }).join("");
        U.hydrateIcons(box);
        box.querySelectorAll("[data-pub]").forEach(b => b.addEventListener("click", async () => {
          b.disabled = true;
          try { const cc = S.careersList().find(x => x.id === b.dataset.pub); const r = await CL.publish(cc); UI.toast("Publicada · código " + r.shareId, "ok"); renderShares(); }
          catch (e) { UI.toast(e.message || "Error", "err"); b.disabled = false; }
        }));
        box.querySelectorAll("[data-unpub]").forEach(b => b.addEventListener("click", () => UI.confirm("¿Quitar la publicación de esta carrera?", async () => {
          try { await CL.unpublish(b.dataset.unpub); UI.toast("Publicación retirada"); renderShares(); } catch (e) { UI.toast(e.message || "Error", "err"); }
        }, true)));
        box.querySelectorAll("[data-copylink]").forEach(b => b.addEventListener("click", () => {
          const link = CL.shareLink((CL.config().shares || {})[b.dataset.copylink]);
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(() => UI.toast("Enlace copiado 🔗", "ok"), () => UI.toast(link, "ok"));
          else UI.toast(link, "ok");
        }));
      };
      renderShares();
      $("cl-view").addEventListener("click", busy("cl-view", async () => { await UI.openSharedByCode($("cl-viewcode").value.trim()); }));
      if ($("cl-myprofile")) $("cl-myprofile").addEventListener("click", () => { const id = CL.myOwnerId(); if (id) UI.openProfileModal(id, null); else UI.toast("Inicia sesión primero", "err"); });
      if ($("cl-myprofile-link")) $("cl-myprofile-link").addEventListener("click", () => {
        const id = CL.myOwnerId(); if (!id) { UI.toast("Inicia sesión primero", "err"); return; }
        const link = CL.profileLink(id);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(() => UI.toast("Enlace de perfil copiado 🔗", "ok"), () => UI.toast(link, "ok"));
        else UI.toast(link, "ok");
      });
      $("cl-disconnect").addEventListener("click", () => UI.confirm("¿Desconectar la nube de este navegador? (no borra nada de la nube)", () => { CL.disconnect(); UI.toast("Nube desconectada"); rerender(); }, true));
    }
    if (configured && $("cl-lb-load")) {
      let lbRows = [];
      $("cl-lb-load").addEventListener("click", async () => {
        const btn = $("cl-lb-load"); btn.disabled = true;
        try {
          lbRows = await CL.leaderboard(20);
          const box = $("cl-lb");
          box.innerHTML = (lbRows && lbRows.length)
            ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>#</th><th>Club</th><th>Liga</th><th class="num">Títulos</th><th class="num">Mejor pts</th></tr></thead><tbody>
                ${lbRows.map((r, i) => `<tr data-lb="${i}" style="cursor:pointer"><td><b>${i + 1}</b></td>
                  <td><b>${U.esc(r.club || "Club")}</b>${r.manager ? `<br><small class="faint">${U.esc(r.manager)}</small>` : ""}</td>
                  <td class="faint">${U.esc(r.league || "")}</td><td class="num">${Number(r.titles) || 0}</td><td class="num">${Number(r.best_points) || 0}</td></tr>`).join("")}
                </tbody></table></div>`
            : `<p class="faint">Aún no hay carreras publicadas. ¡Publica la tuya y estrena el ranking!</p>`;
          box.querySelectorAll("[data-lb]").forEach(tr => tr.addEventListener("click", () => UI.openSharedModal(lbRows[+tr.dataset.lb], null)));
          btn.disabled = false;
        } catch (e) { UI.toast(e.message || "Error al cargar", "err"); btn.disabled = false; }
      });
    }
    if (configured && $("cl-feed")) {
      const renderFeed = () => {
        const box = $("cl-feed"); if (!box) return;
        const rows = cloudFeedRows || [];
        box.innerHTML = rows.length
          ? `<div class="list">${rows.map((r, i) => UI.activityCardHTML(r, i)).join("")}</div>`
          : `<p class="faint">Aún no hay actividad. ¡Publica tu carrera y estrena el feed!</p>`;
        U.hydrateIcons(box);
        box.querySelectorAll("[data-feed]").forEach(el => el.addEventListener("click", () => { const r = cloudFeedRows && cloudFeedRows[+el.dataset.feed]; if (r) UI.openSharedModal(r, null); }));
      };
      const loadFeed = async () => {
        if (cloudFeedLoading) return;
        cloudFeedLoading = true;
        const box = $("cl-feed"); if (box && !cloudFeedRows) box.innerHTML = `<p class="faint">Cargando…</p>`;
        try { cloudFeedRows = (await CL.activityFeed(30)) || []; }
        catch (e) { if (!cloudFeedRows) { const b = $("cl-feed"); if (b) b.innerHTML = `<p class="faint">No se pudo cargar la actividad.</p>`; } }
        finally { cloudFeedLoading = false; if (cloudFeedRows) renderFeed(); }
      };
      if (cloudFeedRows) renderFeed(); else loadFeed();
      if ($("cl-feed-refresh")) $("cl-feed-refresh").addEventListener("click", () => { cloudFeedRows = null; loadFeed(); });
    }
  };

  /* ============================================================
     Helpers de render compartidos
     ============================================================ */
  function statTile(label, value, sub) {
    return `<div class="card stat-tile"><div class="st-glow"></div><div class="st-label">${label}</div>
      <div class="st-value">${value}</div><div class="st-sub">${sub||""}</div></div>`;
  }
  // Un decimal con coma (formato español): 1.75 → "1,8".
  function f1(n) { return (Math.round(n * 10) / 10).toFixed(1).replace(".", ","); }
  // Fila de la lista de rivales: balance global + forma reciente + pts/partido.
  function rivalRow(c, o) {
    const ppgCol = o.ppg >= 2 ? "var(--ok)" : o.ppg >= 1 ? "var(--warn)" : "var(--danger)";
    return `<div class="list-row" data-rival="${U.esc(o.rival)}" style="cursor:pointer">
      <span class="career-badge" style="background:${U.safeColor(null, U.colorFor(o.rival))}">${U.initials(o.rival)}</span>
      <div class="lr-main"><b>${U.esc(o.rival)}</b>
        <small class="faint">${o.played} duelo${o.played === 1 ? "" : "s"} · <span style="color:var(--ok);font-weight:700">${o.w}V</span> <span style="color:var(--warn);font-weight:700">${o.d}E</span> <span style="color:var(--danger);font-weight:700">${o.l}D</span> · ${o.gf}:${o.ga}</small></div>
      <span class="flex gap center" style="flex-shrink:0">${CH.formBar(o.form)}</span>
      <span class="chip" style="background:transparent;border:1px solid var(--line);color:${ppgCol};font-weight:700;flex-shrink:0">${f1(o.ppg)}</span>
      <span class="ni-icon" data-icon="chevron" style="color:var(--text-dim);flex-shrink:0"></span>
    </div>`;
  }
  // Barra comparativa tú-vs-rival. La barra representa tu cuota del total.
  function statCompareRow(label, f, a, suffix) {
    const fv = Number(f) || 0, av = Number(a) || 0, tot = fv + av;
    const pct = tot ? Math.round(fv / tot * 100) : 50;
    suffix = suffix || "";
    return `<div style="margin-bottom:10px">
      <div class="flex between" style="font-size:12px;margin-bottom:4px"><span><b>${fv}${suffix}</b> tú</span><span class="faint">${U.esc(label)}</span><span class="faint">rival <b style="color:var(--text)">${av}${suffix}</b></span></div>
      <div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }
  function alertRow(icon, text, tone, route) {
    const col = tone === "danger" ? "var(--danger)" : tone === "warn" ? "var(--warn)" : tone === "neutral" ? "var(--text-dim)" : "var(--ok)";
    return `<div class="list-row" ${route ? `data-goto="${route}" style="cursor:pointer"` : ""}>
      <span class="ni-icon" data-icon="${icon}" style="color:${col}"></span><div class="lr-main"><b style="font-weight:500;font-size:13px">${U.esc(text)}</b></div>
      ${route ? '<span class="ni-icon" data-icon="chevron" style="color:var(--text-dim)"></span>' : ""}</div>`;
  }
  function fixtureRow(c, m, withDelete) {
    const g = S.userGoals(c, m); const r = S.userResult(c, m);
    const cls = r === "W" ? "win" : r === "L" ? "loss" : "";
    return `<div class="fixture" data-match="${m.id}" style="cursor:pointer">
      <span class="fx-comp">${U.esc(m.competition||"")}${m.round ? " · " + U.esc(m.round) : ""}${m.stats ? ` <span class="ni-icon" data-icon="growth" style="width:12px;height:12px;vertical-align:-1px;color:var(--accent)"></span>` : ""}${m.formation ? ` <span class="chip" style="font-size:10px;padding:1px 5px;opacity:.75">${U.esc(m.formation)}</span>` : ""}</span>
      <div class="fx-teams"><span class="t ${m.home===c.clubName?"":""}" style="${m.home===c.clubName?"font-weight:700":""}">${U.esc(m.home)}</span>
        <span class="fx-score ${cls}">${m.homeScore}-${m.awayScore}</span>
        <span class="t away" style="${m.away===c.clubName?"font-weight:700":""}">${U.esc(m.away)}</span></div>
      <button class="icon-btn sm" data-cronica="${m.id}" title="Crónica del partido" style="flex-shrink:0"><span class="ni-icon" data-icon="book"></span></button>
      ${withDelete ? `<button class="icon-btn sm" data-del-match="${m.id}"><span class="ni-icon" data-icon="trash"></span></button>` : `<span class="faint" style="font-size:11px;width:60px;text-align:right">${U.fmtDate(m.date)}</span>`}</div>`;
  }
  function upcomingRow(c, m) {
    const home = m.home === c.clubName, away = m.away === c.clubName;
    return `<div class="fixture upcoming" data-up="${m.id}" style="cursor:pointer">
      <span class="fx-comp">${U.esc(m.competition||"")}${m.round ? " · " + U.esc(m.round) : ""}</span>
      <div class="fx-teams"><span class="t" style="${home?"font-weight:700":""}">${U.esc(m.home||"—")}</span>
        <span class="fx-vs">vs</span>
        <span class="t away" style="${away?"font-weight:700":""}">${U.esc(m.away||"—")}</span></div>
      <span class="up-date faint">${m.date ? U.fmtDate(m.date) : "Sin fecha"}</span>
      <div class="up-actions">
        ${away ? `<button class="btn btn-ghost btn-sm" data-trip="${m.id}"><span class="ni-icon" data-icon="plane"></span> Viaje</button>` : ""}
        <button class="btn btn-primary btn-sm" data-play-match="${m.id}"><span class="ni-icon" data-icon="ball"></span> Registrar</button>
        <button class="icon-btn sm" data-del-match="${m.id}"><span class="ni-icon" data-icon="trash"></span></button>
      </div>
    </div>`;
  }
  // Fila del calendario: sirve para jugados (marcador) y programados (vs + Registrar).
  function calRow(c, m, isNext) {
    const played = S.isPlayed(m);
    const home = m.home === c.clubName, away = m.away === c.clubName;
    const r = played ? S.userResult(c, m) : null;
    const rc = r === "W" ? "win" : r === "L" ? "loss" : "";
    const score = played ? `<span class="fx-score ${rc}">${m.homeScore}-${m.awayScore}</span>` : `<span class="fx-vs">vs</span>`;
    return `<div class="fixture${played ? "" : " upcoming"}${isNext ? " is-next" : ""}" ${played ? `data-match="${m.id}"` : `data-up="${m.id}"`} style="cursor:pointer">
      <span class="fx-comp">${U.esc(m.competition||"")}${m.round ? " · " + U.esc(m.round) : ""}</span>
      <div class="fx-teams"><span class="t" style="${home?"font-weight:700":""}">${U.esc(m.home||"—")}</span>
        ${score}
        <span class="t away" style="${away?"font-weight:700":""}">${U.esc(m.away||"—")}</span></div>
      ${!played ? `<button class="btn btn-primary btn-sm" data-play-match="${m.id}"><span class="ni-icon" data-icon="ball"></span> Registrar</button>` : ""}
      <span class="up-date faint">${m.date ? U.fmtDate(m.date) : "Sin fecha"}</span>
    </div>`;
  }
  // Calendario de temporada: todos los partidos (jugados + programados) en orden
  // cronológico, agrupados por mes. El próximo partido se resalta.
  function calendarHtml(c, season) {
    const all = (c.matches || []).filter(m => m.seasonId === season.id && S.isUserMatch(c, m))
      .sort((a, b) => (a.date ? new Date(a.date).getTime() : Infinity) - (b.date ? new Date(b.date).getTime() : Infinity));
    if (!all.length) return `<div class="card"><div class="empty"><div class="emoji">📅</div><h3>Calendario vacío</h3><p>Registra o programa partidos para construir tu calendario de temporada.</p></div></div>`;
    const monthOf = (d) => {
      if (!d) return "Sin fecha";
      const dt = new Date(d); if (isNaN(dt)) return "Sin fecha";
      const s = dt.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
      return s.charAt(0).toUpperCase() + s.slice(1);
    };
    const nextId = (S.nextMatch(c, season.id) || {}).id;
    const groups = [];
    all.forEach(m => {
      const label = monthOf(m.date);
      let g = groups[groups.length - 1];
      if (!g || g.label !== label) { g = { label, items: [] }; groups.push(g); }
      g.items.push(m);
    });
    return groups.map(g => `<div class="cal-month">${g.label}</div><div class="card">${g.items.map(m => calRow(c, m, m.id === nextId)).join("")}</div>`).join("");
  }
  function findMatch(c, id) { return (c.matches || []).find(m => m.id === id); }
  function seasonSelect(c) {
    if ((c.seasons || []).length <= 1) return "";
    return `<select id="season-select" style="width:auto">${(c.seasons||[]).slice().sort(U.by("startYear")).reverse().map(s => `<option value="${s.id}" ${s.id===c.currentSeasonId?"selected":""}>${U.esc(s.label)}</option>`).join("")}</select>`;
  }
  // delegated: season switch + goto
  document.addEventListener("change", (e) => {
    if (e.target && e.target.id === "season-select") {
      const c = S.getActiveCareer(); c.currentSeasonId = e.target.value; S.emit();
    }
  });
  document.addEventListener("click", (e) => {
    const g = e.target.closest && e.target.closest("[data-goto]");
    if (g) FC.router.go(g.dataset.goto);
  });
})();
