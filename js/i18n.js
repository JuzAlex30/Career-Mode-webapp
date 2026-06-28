/* ============================================================
   i18n.js — capa de idiomas (ES por defecto, EN). Expone FC.i18n y FC.t.
   · FC.t(clave, vars)  → traduce; interpola {var}; fallback a ES y luego a la clave.
   · FC.i18n.set(lang)  → cambia idioma (no persiste; eso lo hace app.js vía settings).
   · FC.i18n.applyDom() → traduce nodos estáticos marcados con data-i18n / -ph / -title.
   El idioma guardado vive en settings (store); app.js lo aplica en boot.
   MIGRACIÓN POR FASES: Fase 1 = chrome + onboarding. El resto de vistas y el
   motor narrativo se migran en fases siguientes (las claves ausentes caen a ES). */
(function () {
  window.FC = window.FC || {};
  const I = {};
  I.LANGS = ["es", "en"];

  const DICT = {
    es: {
      // —— Chrome / marca ——
      "brand.tagline": "Modo Carrera Companion",
      "navlabel.club": "Club",
      "navlabel.career": "Carrera",
      "navlabel.tools": "Herramientas",
      "navlabel.legal": "Proyecto de fans no oficial · sin relación con EA Sports, EA Sports FC ni la FIFA",
      "chrome.themeToggle": "Cambiar tema",
      "chrome.menu": "Menú",
      "chrome.addMatch": "Partido",
      "chrome.langLabel": "Idioma",
      // —— Nav (sidebar) ——
      "nav.dashboard": "Panel",
      "nav.matches": "Partidos",
      "nav.standings": "Clasificación",
      "nav.rivals": "Rivales",
      "nav.squad": "Plantilla",
      "nav.youth": "Academia",
      "nav.finance": "Finanzas",
      "nav.challenges": "Retos",
      "nav.story": "Narrativa",
      "nav.travel": "Viajes",
      "nav.history": "Historia",
      "nav.scouting": "Scouting",
      "nav.tools": "Generador",
      "nav.community": "Comunidad",
      "nav.settings": "Ajustes y datos",
      // —— Títulos de la topbar ——
      "title.dashboard": "Panel",
      "title.matches": "Partidos",
      "title.standings": "Clasificación",
      "title.rivales": "Rivales",
      "title.squad": "Plantilla",
      "title.development": "Desarrollo",
      "title.youth": "Academia",
      "title.finance": "Finanzas",
      "title.challenges": "Retos y logros",
      "title.story": "Narrativa",
      "title.viajes": "Viajes",
      "title.history": "Historia",
      "title.hall": "Salón de la fama",
      "title.scouting": "Scouting",
      "title.tools": "Generador",
      "title.cloud": "Comunidad",
      "title.settings": "Ajustes",
      "title.live": "Modo en vivo",
      // —— Comunes ——
      "common.back": "Volver",
      "common.email": "Email",
      "common.or": "o",
      // —— Legal ——
      "legal.terms": "Términos de uso",
      "legal.privacy": "Privacidad y aviso legal",
      // —— Onboarding · marca ——
      "ob.tagline": "Tu Modo Carrera, contado como una historia",
      "feat.market.t": "Mercado BETMÁXIMA",
      "feat.market.d": "Cuotas, tipsters y boleto en vivo de cada partido",
      "feat.press.t": "Prensa y crónicas",
      "feat.press.d": "Titulares y crónicas generadas de tu temporada",
      "feat.legacy.t": "Tu legado",
      "feat.legacy.d": "Palmarés, récords y línea de tiempo de la carrera",
      "feat.community.t": "Comunidad y nube",
      "feat.community.d": "Guarda en la nube, comparte y compite en el ranking",
      "ob.foot.disclaimer": "Proyecto de fans no oficial · sin afiliación con EA Sports / FIFA · sin dinero real",
      // —— Onboarding · home ——
      "ob.welcome": "Bienvenido",
      "ob.welcome.sub": "Crea una cuenta para guardar tus carreras en la nube y competir en la comunidad, o entra directo y juega en este dispositivo.",
      "ob.createAccount": "Crear cuenta / Iniciar sesión",
      "ob.continueGuest": "Continuar sin cuenta",
      "ob.home.note": "Sin contraseñas: te enviamos un código a tu email. Continuar sin cuenta guarda todo en este navegador.",
      // —— Onboarding · auth ——
      "ob.auth.enterCode": "Introduce tu código",
      "ob.auth.enterEmail": "Entra con tu email",
      "ob.auth.sub": "Te enviaremos un código de acceso de un solo uso. Si ya tienes cuenta, recuperarás tus carreras.",
      "ob.consent.pre": "He leído y acepto los ",
      "ob.consent.mid": " y la ",
      "ob.consent.post": ", y el uso de mi email para el acceso.",
      "ob.sendCode": "Enviar código",
      "ob.auth.sent": "Hemos enviado un código a {email}. Pégalo aquí (o pulsa el enlace del email).",
      "ob.code6": "Código de 6 dígitos",
      "ob.enter": "Entrar",
      "ob.resend": "Reenviar código",
      "ob.changeEmail": "Cambiar email",
      // —— Onboarding · restore ——
      "ob.restore.signedIn": "Sesión iniciada",
      "ob.restore.q": "¿Recuperar tus carreras?",
      "ob.restore.sub": "Trae tus carreras guardadas en la nube a este dispositivo, o empieza una nueva.",
      "ob.restore.bring": "Traer mis carreras de la nube",
      "ob.restore.new": "Empezar una carrera nueva",
      "ob.logout": "Cerrar sesión",
      // —— Onboarding · create ——
      "ob.create.title": "Crea tu carrera",
      "ob.create.sub": "Elige si entrenas un club o diriges una selección nacional.",
      "ob.type.club": "⚽ Club",
      "ob.type.national": "🌍 Selección",
      "ob.club.name": "Nombre del club",
      "ob.club.nameHint": "(tu equipo)",
      "ob.clubPh": "p.ej. Real Oviedo",
      "ob.league": "Liga",
      "ob.customTeams": "Equipos de tu liga",
      "ob.customTeamsHint": "(separa por comas)",
      "ob.customTeamsPh": "Equipo 1, Equipo 2, Equipo 3...",
      "ob.national.team": "Selección nacional",
      "ob.startSeason": "Temporada inicial",
      "ob.managerName": "Nombre de mánager",
      "ob.managerNameHint": "(opcional)",
      "ob.managerPh": "Mánager",
      "ob.startCareer": "Empezar carrera",
      "ob.create.noteLogged": "Tu carrera se guardará también en la nube.",
      "ob.create.noteGuest": "Tus datos se guardan en este navegador. Podrás exportarlos cuando quieras.",
      // —— Onboarding · toasts ——
      "ob.toast.emailInvalid": "Escribe un email válido",
      "ob.toast.mustAccept": "Debes aceptar los términos de uso y la política de privacidad",
      "ob.toast.codeSent": "¡Código enviado! Revisa tu email.",
      "ob.toast.codeError": "No se pudo enviar el código",
      "ob.toast.codePrompt": "Introduce el código del email",
      "ob.toast.signedIn": "¡Sesión iniciada!",
      "ob.toast.codeInvalid": "Código no válido",
      "ob.toast.codeResent": "Código reenviado",
      "ob.toast.restored": "Restauradas {n} carrera(s)",
      "ob.toast.noCloud": "No tienes carreras en la nube todavía",
      "ob.toast.restoreError": "No se pudo restaurar",
      "ob.toast.loggedOut": "Sesión cerrada",
      "ob.toast.pickNational": "Elige una selección",
      "ob.toast.clubName": "Escribe el nombre de tu club",
      "ob.toast.created": "¡Carrera creada! A por la gloria ⚽",
      "ob.fallback.league": "Liga",
      "ob.fallback.national": "{conf} · Selecciones",
      "common.error": "Error",
    },
    en: {
      // —— Chrome / brand ——
      "brand.tagline": "Career Mode Companion",
      "navlabel.club": "Club",
      "navlabel.career": "Career",
      "navlabel.tools": "Tools",
      "navlabel.legal": "Unofficial fan project · not affiliated with EA Sports, EA Sports FC or FIFA",
      "chrome.themeToggle": "Toggle theme",
      "chrome.menu": "Menu",
      "chrome.addMatch": "Match",
      "chrome.langLabel": "Language",
      // —— Nav (sidebar) ——
      "nav.dashboard": "Dashboard",
      "nav.matches": "Matches",
      "nav.standings": "Standings",
      "nav.rivals": "Rivals",
      "nav.squad": "Squad",
      "nav.youth": "Academy",
      "nav.finance": "Finances",
      "nav.challenges": "Challenges",
      "nav.story": "Story",
      "nav.travel": "Travel",
      "nav.history": "History",
      "nav.scouting": "Scouting",
      "nav.tools": "Generator",
      "nav.community": "Community",
      "nav.settings": "Settings & data",
      // —— Topbar titles ——
      "title.dashboard": "Dashboard",
      "title.matches": "Matches",
      "title.standings": "Standings",
      "title.rivales": "Rivals",
      "title.squad": "Squad",
      "title.development": "Development",
      "title.youth": "Academy",
      "title.finance": "Finances",
      "title.challenges": "Challenges & achievements",
      "title.story": "Story",
      "title.viajes": "Travel",
      "title.history": "History",
      "title.hall": "Hall of fame",
      "title.scouting": "Scouting",
      "title.tools": "Generator",
      "title.cloud": "Community",
      "title.settings": "Settings",
      "title.live": "Live mode",
      // —— Common ——
      "common.back": "Back",
      "common.email": "Email",
      "common.or": "or",
      // —— Legal ——
      "legal.terms": "Terms of use",
      "legal.privacy": "Privacy & legal notice",
      // —— Onboarding · brand ——
      "ob.tagline": "Your Career Mode, told as a story",
      "feat.market.t": "BETMÁXIMA market",
      "feat.market.d": "Live odds, tipsters and a bet slip for every match",
      "feat.press.t": "Press & match reports",
      "feat.press.d": "Generated headlines and stories from your season",
      "feat.legacy.t": "Your legacy",
      "feat.legacy.d": "Trophies, records and your career timeline",
      "feat.community.t": "Community & cloud",
      "feat.community.d": "Save to the cloud, share and compete on the ranking",
      "ob.foot.disclaimer": "Unofficial fan project · not affiliated with EA Sports / FIFA · no real money",
      // —— Onboarding · home ——
      "ob.welcome": "Welcome",
      "ob.welcome.sub": "Create an account to save your careers to the cloud and compete in the community, or jump straight in and play on this device.",
      "ob.createAccount": "Create account / Sign in",
      "ob.continueGuest": "Continue without an account",
      "ob.home.note": "No passwords: we email you a code. Continuing without an account keeps everything in this browser.",
      // —— Onboarding · auth ——
      "ob.auth.enterCode": "Enter your code",
      "ob.auth.enterEmail": "Sign in with your email",
      "ob.auth.sub": "We'll send you a one-time access code. If you already have an account, you'll recover your careers.",
      "ob.consent.pre": "I have read and accept the ",
      "ob.consent.mid": " and the ",
      "ob.consent.post": ", and the use of my email for access.",
      "ob.sendCode": "Send code",
      "ob.auth.sent": "We've sent a code to {email}. Paste it here (or click the link in the email).",
      "ob.code6": "6-digit code",
      "ob.enter": "Enter",
      "ob.resend": "Resend code",
      "ob.changeEmail": "Change email",
      // —— Onboarding · restore ——
      "ob.restore.signedIn": "Signed in",
      "ob.restore.q": "Recover your careers?",
      "ob.restore.sub": "Bring your cloud-saved careers to this device, or start a new one.",
      "ob.restore.bring": "Bring my careers from the cloud",
      "ob.restore.new": "Start a new career",
      "ob.logout": "Sign out",
      // —— Onboarding · create ——
      "ob.create.title": "Create your career",
      "ob.create.sub": "Choose whether you manage a club or a national team.",
      "ob.type.club": "⚽ Club",
      "ob.type.national": "🌍 National team",
      "ob.club.name": "Club name",
      "ob.club.nameHint": "(your team)",
      "ob.clubPh": "e.g. Real Oviedo",
      "ob.league": "League",
      "ob.customTeams": "Your league's teams",
      "ob.customTeamsHint": "(comma-separated)",
      "ob.customTeamsPh": "Team 1, Team 2, Team 3...",
      "ob.national.team": "National team",
      "ob.startSeason": "Starting season",
      "ob.managerName": "Manager name",
      "ob.managerNameHint": "(optional)",
      "ob.managerPh": "Manager",
      "ob.startCareer": "Start career",
      "ob.create.noteLogged": "Your career will also be saved to the cloud.",
      "ob.create.noteGuest": "Your data is stored in this browser. You can export it anytime.",
      // —— Onboarding · toasts ——
      "ob.toast.emailInvalid": "Enter a valid email",
      "ob.toast.mustAccept": "You must accept the terms of use and privacy policy",
      "ob.toast.codeSent": "Code sent! Check your email.",
      "ob.toast.codeError": "Couldn't send the code",
      "ob.toast.codePrompt": "Enter the code from the email",
      "ob.toast.signedIn": "Signed in!",
      "ob.toast.codeInvalid": "Invalid code",
      "ob.toast.codeResent": "Code resent",
      "ob.toast.restored": "Restored {n} career(s)",
      "ob.toast.noCloud": "You don't have any careers in the cloud yet",
      "ob.toast.restoreError": "Couldn't restore",
      "ob.toast.loggedOut": "Signed out",
      "ob.toast.pickNational": "Pick a national team",
      "ob.toast.clubName": "Enter your club's name",
      "ob.toast.created": "Career created! Go for glory ⚽",
      "ob.fallback.league": "League",
      "ob.fallback.national": "{conf} · National teams",
      "common.error": "Error",
    },
  };

  let lang = "es";

  I.get = () => lang;
  I.set = (l) => {
    if (!DICT[l]) return;
    lang = l;
    try { document.documentElement.setAttribute("lang", l); } catch (e) { }
  };
  I.t = (key, vars) => {
    let s = DICT[lang] && DICT[lang][key];
    if (s == null) s = DICT.es && DICT.es[key];
    if (s == null) return key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  };
  // Traduce nodos estáticos marcados en el HTML.
  I.applyDom = (root) => {
    const r = root || document;
    r.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = I.t(el.getAttribute("data-i18n")); });
    r.querySelectorAll("[data-i18n-ph]").forEach(el => { el.setAttribute("placeholder", I.t(el.getAttribute("data-i18n-ph"))); });
    r.querySelectorAll("[data-i18n-title]").forEach(el => { el.setAttribute("title", I.t(el.getAttribute("data-i18n-title"))); });
    r.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", I.t(el.getAttribute("data-i18n-aria"))); });
  };

  FC.i18n = I;
  FC.t = I.t;
})();
