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
const js = ["js/data.js", "js/rosters.js", "js/core.js", "js/cloud.js", "js/views.js", "js/app.js"].map(read).join("\n\n/* ───────── */\n\n");

// Seguridad: un cierre </script> dentro del JS rompería el bloque inline.
const safeJs = js.replace(/<\/script>/gi, "<\\/script>");

const BODY = `
  <div id="app" class="app">
    <aside class="sidebar" id="sidebar">
      <div class="brand">
        <img src="icon.svg" width="40" height="40" style="border-radius:11px;flex:none" alt="Boardroom">
        <div class="brand-text">
          <strong>Boardroom</strong>
          <span>Modo Carrera Companion</span>
        </div>
      </div>
      <div class="career-switch" id="careerSwitch"></div>
      <nav class="nav" id="mainNav">
        <a class="nav-item" data-route="dashboard"><span class="ni-icon" data-icon="home"></span><span>Panel</span></a>
        <a class="nav-item" data-route="matches"><span class="ni-icon" data-icon="ball"></span><span>Partidos</span></a>
        <a class="nav-item" data-route="standings"><span class="ni-icon" data-icon="table"></span><span>Clasificación</span></a>
        <a class="nav-item" data-route="rivales"><span class="ni-icon" data-icon="shield"></span><span>Rivales</span></a>
        <div class="nav-label">Club</div>
        <a class="nav-item" data-route="squad"><span class="ni-icon" data-icon="shirt"></span><span>Plantilla</span></a>
        <a class="nav-item" data-route="youth"><span class="ni-icon" data-icon="sprout"></span><span>Academia</span></a>
        <a class="nav-item" data-route="finance"><span class="ni-icon" data-icon="coin"></span><span>Finanzas</span></a>
        <div class="nav-label">Carrera</div>
        <a class="nav-item" data-route="challenges"><span class="ni-icon" data-icon="target"></span><span>Retos</span></a>
        <a class="nav-item" data-route="story"><span class="ni-icon" data-icon="news"></span><span>Narrativa</span></a>
        <a class="nav-item" data-route="viajes"><span class="ni-icon" data-icon="plane"></span><span>Viajes</span></a>
        <a class="nav-item" data-route="history"><span class="ni-icon" data-icon="trophy"></span><span>Historia</span></a>
        <div class="nav-label">Herramientas</div>
        <a class="nav-item" data-route="scouting"><span class="ni-icon" data-icon="search"></span><span>Scouting</span></a>
        <a class="nav-item" data-route="tools"><span class="ni-icon" data-icon="dice"></span><span>Generador</span></a>
      </nav>
      <div class="nav-bottom">
        <a class="nav-item" data-route="cloud"><span class="ni-icon" data-icon="cloud"></span><span>Comunidad</span></a>
        <a class="nav-item" data-route="settings"><span class="ni-icon" data-icon="gear"></span><span>Ajustes y datos</span></a>
        <button class="theme-toggle" id="themeToggle" title="Cambiar tema"><span class="ni-icon" data-icon="moon"></span></button>
        <div class="nav-legal">Proyecto de fans no oficial · sin relación con EA Sports, EA Sports FC ni la FIFA</div>
      </div>
    </aside>
    <header class="topbar">
      <button class="icon-btn" id="menuBtn" aria-label="Menú"><span class="ni-icon" data-icon="menu"></span></button>
      <div class="topbar-title" id="topbarTitle">Panel</div>
      <button class="btn btn-primary btn-sm" id="topbarAddMatch"><span class="ni-icon" data-icon="plus"></span> Partido</button>
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
  <title>Boardroom · Compañero del Modo Carrera</title>
  <meta name="description" content="El compañero definitivo del Modo Carrera de EA Sports FC: tracking, clasificaciones, retos y la historia de tu club." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://juzalex30.github.io/Career-Mode-webapp/" />
  <meta property="og:title" content="Boardroom · Compañero del Modo Carrera" />
  <meta property="og:description" content="Lleva tu Modo Carrera al siguiente nivel: plantilla, partidos, estadísticas, retos y comunidad." />
  <meta property="og:image" content="https://juzalex30.github.io/Career-Mode-webapp/social.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Boardroom · Compañero del Modo Carrera" />
  <meta name="twitter:description" content="Lleva tu Modo Carrera al siguiente nivel: plantilla, partidos, estadísticas, retos y comunidad." />
  <meta name="twitter:image" content="https://juzalex30.github.io/Career-Mode-webapp/social.png" />
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
