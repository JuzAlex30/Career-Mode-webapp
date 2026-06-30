/* ============================================================
   tour.js — tutorial interactivo híbrido: una tarjeta de
   bienvenida emocional + pasos de spotlight sobre la UI real.
   Sin dependencias. Se expone en window.FC.tour
   ============================================================ */
(function () {
  window.FC = window.FC || {};
  const FC = window.FC;
  const T = {};
  const t = (k, v) => FC.t(k, v);

  // Definición de pasos. type "card" = ventana flotante centrada;
  // "spot" = se ilumina un elemento real y la ventana se ancla al lado.
  function buildSteps() {
    return [
      { type: "card", emoji: "👋", key: "welcome" },
      { type: "spot", route: "dashboard", target: "#dash-add", place: "bottom", emoji: "📈", key: "register" },
      { type: "spot", route: "dashboard", target: '[data-route="standings"]', place: "right", emoji: "📊", key: "standings" },
      { type: "spot", route: "dashboard", target: '[data-route="rivales"]', place: "right", emoji: "⚔️", key: "rivals" },
      { type: "spot", route: "dashboard", target: '[data-route="history"]', place: "right", emoji: "🏆", key: "legacy" },
      { type: "spot", route: "dashboard", target: '[data-route="cloud"]', place: "right", emoji: "🌍", key: "community" },
      { type: "card", emoji: "🚀", key: "ready" },
    ];
  }

  let idx = 0, list = [], root = null, reflow = null, keyHandler = null;

  T.isActive = () => !!root;

  T.start = function () {
    if (root) T._teardown();
    list = buildSteps();
    idx = 0;
    root = document.createElement("div");
    root.className = "tour-root";
    root.innerHTML =
      '<div class="tour-overlay" id="tourOverlay"></div>' +
      '<div class="tour-spot" id="tourSpot" hidden></div>' +
      '<div class="tour-pop" id="tourPop" role="dialog" aria-modal="true" aria-live="polite"></div>';
    document.body.appendChild(root);
    document.body.classList.add("tour-on");
    reflow = () => T._draw(list[idx]);
    window.addEventListener("resize", reflow);
    window.addEventListener("scroll", reflow, true);
    keyHandler = (e) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); T.skip(); }
      else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); T.next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); T.back(); }
    };
    document.addEventListener("keydown", keyHandler, true);
    T._render();
  };

  T.next = function () {
    if (idx >= list.length - 1) { T._finish(); return; }
    idx++; T._render();
  };
  T.back = function () { if (idx > 0) { idx--; T._render(); } };
  T.skip = function () { T._finish(); };

  T._finish = function () {
    try { const s = FC.store.settings(); s.tourDone = true; FC.store.save(); } catch (e) { /* noop */ }
    T._teardown();
  };

  T._teardown = function () {
    if (keyHandler) document.removeEventListener("keydown", keyHandler, true);
    if (reflow) { window.removeEventListener("resize", reflow); window.removeEventListener("scroll", reflow, true); }
    document.body.classList.remove("tour-on");
    if (root) root.remove();
    root = null; reflow = null; keyHandler = null;
  };

  T._render = function () {
    const step = list[idx];
    // Si el paso vive en otra ruta, navegamos primero (el tour vive en <body>,
    // así que el re-render de la ruta no lo borra).
    if (step.route && FC.router.current !== step.route) FC.router.go(step.route);
    // Dos frames para garantizar que el DOM de la ruta ya existe antes de medir.
    requestAnimationFrame(() => requestAnimationFrame(() => { if (root) T._draw(step); }));
  };

  T._draw = function (step) {
    if (!root) return;
    const spot = root.querySelector("#tourSpot");
    const pop = root.querySelector("#tourPop");
    const overlay = root.querySelector("#tourOverlay");
    const total = list.length;
    const isFirst = idx === 0, isLast = idx === total - 1;

    const dots = list.map((_, i) => '<span class="tour-dot' + (i === idx ? " on" : "") + '"></span>').join("");
    const skipBtn = !isLast ? '<button class="tour-btn link" data-tour="skip">' + t("tour.skip") + "</button>" : "";
    const backBtn = !isFirst ? '<button class="tour-btn ghost" data-tour="back">' + t("tour.back") + "</button>" : "";
    const nextBtn = '<button class="tour-btn primary" data-tour="next">' + (isLast ? t("tour.finish") : t("tour.next")) + "</button>";

    pop.innerHTML =
      '<div class="tour-emoji">' + (step.emoji || "") + "</div>" +
      '<div class="tour-step">' + t("tour.progress", { n: idx + 1, total: total }) + "</div>" +
      '<div class="tour-title">' + t("tour." + step.key + ".title") + "</div>" +
      '<div class="tour-body">' + t("tour." + step.key + ".body") + "</div>" +
      '<div class="tour-dots">' + dots + "</div>" +
      '<div class="tour-actions"><div class="tour-left">' + skipBtn + "</div>" +
      '<div class="tour-right">' + backBtn + nextBtn + "</div></div>";

    pop.querySelectorAll("[data-tour]").forEach(function (b) {
      b.addEventListener("click", function () {
        const a = b.dataset.tour;
        if (a === "next") T.next(); else if (a === "back") T.back(); else T.skip();
      });
    });

    let el = null;
    if (step.type === "spot" && step.target) el = document.querySelector(step.target);

    if (el) {
      const r = el.getBoundingClientRect();
      const pad = 6;
      spot.hidden = false;
      spot.style.top = (r.top - pad) + "px";
      spot.style.left = (r.left - pad) + "px";
      spot.style.width = (r.width + pad * 2) + "px";
      spot.style.height = (r.height + pad * 2) + "px";
      overlay.classList.remove("solid"); // el oscurecido lo hace el box-shadow del spot
      pop.classList.remove("centered");
      T._placePop(pop, r, step.place || "bottom");
    } else {
      // tarjeta centrada (bienvenida / cierre, o fallback si no se encuentra el target)
      spot.hidden = true;
      overlay.classList.add("solid");
      pop.classList.add("centered");
      pop.style.top = ""; pop.style.left = "";
    }
  };

  // Coloca la ventana junto al elemento iluminado, con margen y recorte a la pantalla.
  T._placePop = function (pop, r, place) {
    const gap = 14;
    const vw = window.innerWidth, vh = window.innerHeight;
    const pw = Math.min(pop.offsetWidth || 320, vw - 24);
    const ph = pop.offsetHeight || 200;
    let top, left;
    if (place === "right") { left = r.right + gap; top = r.top + r.height / 2 - ph / 2; }
    else if (place === "left") { left = r.left - gap - pw; top = r.top + r.height / 2 - ph / 2; }
    else if (place === "top") { top = r.top - gap - ph; left = r.left + r.width / 2 - pw / 2; }
    else { top = r.bottom + gap; left = r.left + r.width / 2 - pw / 2; } // bottom
    // si no cabe a la derecha, lo pasamos debajo
    if (place === "right" && left + pw > vw - 12) { left = r.left; top = r.bottom + gap; }
    left = Math.max(12, Math.min(left, vw - pw - 12));
    top = Math.max(12, Math.min(top, vh - ph - 12));
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  };

  // Lanza el tour solo la primera vez (tras crear la primera carrera).
  T.maybeAutoStart = function () {
    try { if (FC.store.settings().tourDone) return; } catch (e) { return; }
    T.start();
  };

  FC.tour = T;
})();
