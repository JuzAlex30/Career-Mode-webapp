/* build.js — genera un index.html AUTOCONTENIDO (CSS + JS incrustados)
   a partir de los ficheros fuente (styles.css y js/*.js).
   Así el archivo funciona con doble clic en cualquier navegador o visor,
   sin depender de cargar recursos externos (file:// o visores sandbox).

   Uso:  node build.js     (o  npm run build) */
const fs = require("fs");
const path = require("path");
const here = __dirname;
const read = (f) => fs.readFileSync(path.join(here, f), "utf8");

const css = read("styles.css");
const js = ["js/i18n.js", "js/data.js", "js/geo.js", "js/rosters.js", "js/core.js", "js/cloud.js", "js/views.js", "js/tour.js", "js/app.js"].map(read).join("\n\n/* ───────── */\n\n");

// Seguridad: un cierre </script> dentro del JS rompería el bloque inline.
const safeJs = js.replace(/<\/script>/gi, "<\\/script>");

const BODY = `
  <div id="app" class="app">
    <aside class="sidebar" id="sidebar">
      <div class="brand">
        <img src="logo.png" width="40" height="40" style="border-radius:11px;flex:none" alt="Boardhub">
        <div class="brand-text">
          <strong>Boardhub</strong>
          <span data-i18n="brand.tagline">Modo Carrera Companion</span>
        </div>
      </div>
      <div class="career-switch" id="careerSwitch"></div>
      <nav class="nav" id="mainNav">
        <a class="nav-item" data-route="dashboard"><span class="ni-icon" data-icon="home"></span><span data-i18n="nav.dashboard">Panel</span></a>
        <a class="nav-item" data-route="matches"><span class="ni-icon" data-icon="ball"></span><span data-i18n="nav.matches">Partidos</span></a>
        <a class="nav-item" data-route="standings"><span class="ni-icon" data-icon="table"></span><span data-i18n="nav.standings">Clasificación</span></a>
        <a class="nav-item" data-route="rivales"><span class="ni-icon" data-icon="shield"></span><span data-i18n="nav.rivals">Rivales</span></a>
        <div class="nav-label" data-i18n="navlabel.club">Club</div>
        <a class="nav-item" data-route="squad"><span class="ni-icon" data-icon="shirt"></span><span data-i18n="nav.squad">Plantilla</span></a>
        <a class="nav-item" data-route="youth"><span class="ni-icon" data-icon="sprout"></span><span data-i18n="nav.youth">Academia</span></a>
        <a class="nav-item" data-route="finance"><span class="ni-icon" data-icon="coin"></span><span data-i18n="nav.finance">Finanzas</span></a>
        <div class="nav-label" data-i18n="navlabel.career">Carrera</div>
        <a class="nav-item" data-route="challenges"><span class="ni-icon" data-icon="target"></span><span data-i18n="nav.challenges">Retos</span></a>
        <a class="nav-item" data-route="story"><span class="ni-icon" data-icon="news"></span><span data-i18n="nav.story">Narrativa</span></a>
        <a class="nav-item" data-route="viajes"><span class="ni-icon" data-icon="plane"></span><span data-i18n="nav.travel">Viajes</span></a>
        <a class="nav-item" data-route="history"><span class="ni-icon" data-icon="trophy"></span><span data-i18n="nav.history">Historia</span></a>
        <div class="nav-label" data-i18n="navlabel.tools">Herramientas</div>
        <a class="nav-item" data-route="scouting"><span class="ni-icon" data-icon="search"></span><span data-i18n="nav.scouting">Scouting</span></a>
        <a class="nav-item" data-route="tools"><span class="ni-icon" data-icon="dice"></span><span data-i18n="nav.tools">Generador</span></a>
      </nav>
      <div class="nav-bottom">
        <a class="nav-item" data-route="cloud"><span class="ni-icon" data-icon="cloud"></span><span data-i18n="nav.community">Comunidad</span></a>
        <a class="nav-item" data-route="settings"><span class="ni-icon" data-icon="gear"></span><span data-i18n="nav.settings">Ajustes y datos</span></a>
        <div class="lang-switch" id="langSwitch">
          <button type="button" data-lang="es">ES</button>
          <button type="button" data-lang="en">EN</button>
        </div>
        <button class="theme-toggle" id="themeToggle" data-i18n-title="chrome.themeToggle" title="Cambiar tema"><span class="ni-icon" data-icon="moon"></span></button>
        <div class="nav-legal" data-i18n="navlabel.legal">Proyecto de fans no oficial · sin relación con EA Sports, EA Sports FC ni la FIFA</div>
      </div>
    </aside>
    <header class="topbar">
      <button class="icon-btn" id="menuBtn" data-i18n-aria="chrome.menu" aria-label="Menú"><span class="ni-icon" data-icon="menu"></span></button>
      <div class="topbar-title" id="topbarTitle">Panel</div>
      <button class="btn btn-primary btn-sm" id="topbarAddMatch"><span class="ni-icon" data-icon="plus"></span> <span data-i18n="chrome.addMatch">Partido</span></button>
    </header>
    <main class="content" id="content" tabindex="-1"></main>
  </div>
  <div class="modal-overlay" id="modalOverlay" hidden>
    <div class="modal" id="modal" role="dialog" aria-modal="true"></div>
  </div>
  <div class="toast-stack" id="toastStack"></div>`;

const out = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Boardhub · Compañero del Modo Carrera</title>
  <meta name="description" content="El compañero definitivo del Modo Carrera de EA Sports FC: tracking, clasificaciones, retos y la historia de tu club." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://boardhubfc.com/" />
  <meta property="og:title" content="Boardhub · Compañero del Modo Carrera" />
  <meta property="og:description" content="Lleva tu Modo Carrera al siguiente nivel: plantilla, partidos, estadísticas, retos y comunidad." />
  <meta property="og:image" content="https://boardhubfc.com/social.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Boardhub · Compañero del Modo Carrera" />
  <meta name="twitter:description" content="Lleva tu Modo Carrera al siguiente nivel: plantilla, partidos, estadísticas, retos y comunidad." />
  <meta name="twitter:image" content="https://boardhubfc.com/social.png" />
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#00e1a0" />
  <link rel="icon" type="image/svg+xml" href="icon.svg" />
  <link rel="icon" type="image/png" sizes="192x192" href="icon-192.png" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
  <script>if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");</script>
  <style>
${css}
  </style>
</head>
<body data-theme="dark">
${BODY}
  <script>
${safeJs}
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(here, "index.html"), out, "utf8");
console.log("✓ index.html autocontenido generado (" + (out.length / 1024).toFixed(0) + " KB)");

// Sella sw.js con el timestamp del build para que el navegador detecte el nuevo SW en cada deploy.
const swPath = path.join(here, "sw.js");
const swSrc = fs.readFileSync(swPath, "utf8");
const swOut = swSrc.replace(/const CACHE_KEY = "[^"]*"/, 'const CACHE_KEY = "boardhub-v' + Date.now() + '"');
fs.writeFileSync(swPath, swOut, "utf8");
console.log("✓ sw.js cache key actualizado");
