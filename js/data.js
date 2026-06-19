/* ============================================================
   data.js — datos estáticos: ligas seed, wonderkids, posiciones,
   formaciones, catálogo de retos, motor de reglas y logros.
   Se expone en window.FC.data
   ============================================================ */
(function () {
  window.FC = window.FC || {};
  const D = {};

  /* ---------- Posiciones ---------- */
  D.POSITIONS = ["GK","RB","RWB","CB","LB","LWB","CDM","CM","CAM","RM","LM","RW","LW","CF","ST"];
  D.POS_GROUP = {
    GK: "Portería",
    RB: "Defensa", RWB: "Defensa", CB: "Defensa", LB: "Defensa", LWB: "Defensa",
    CDM: "Medio", CM: "Medio", CAM: "Medio",
    RM: "Banda", LM: "Banda", RW: "Banda", LW: "Banda",
    CF: "Ataque", ST: "Ataque",
  };
  D.POS_ORDER = { GK:0, RB:1, RWB:2, CB:3, LB:4, LWB:5, CDM:6, CM:7, CAM:8, RM:9, LM:10, RW:11, LW:12, CF:13, ST:14 };

  /* ---------- Formaciones (slots con posición sugerida) ---------- */
  D.FORMATIONS = {
    "4-3-3":   ["GK","RB","CB","CB","LB","CM","CM","CAM","RW","ST","LW"],
    "4-2-3-1": ["GK","RB","CB","CB","LB","CDM","CDM","CAM","RW","LW","ST"],
    "4-4-2":   ["GK","RB","CB","CB","LB","RM","CM","CM","LM","ST","ST"],
    "4-3-2-1": ["GK","RB","CB","CB","LB","CM","CM","CM","CAM","CAM","ST"],
    "3-5-2":   ["GK","CB","CB","CB","RM","CM","CM","CM","LM","ST","ST"],
    "5-3-2":   ["GK","RWB","CB","CB","CB","LWB","CM","CM","CM","ST","ST"],
    "3-4-3":   ["GK","CB","CB","CB","RM","CM","CM","LM","RW","ST","LW"],
  };

  /* ---------- Competiciones por defecto ---------- */
  D.COMPETITIONS = ["Liga","Copa nacional","Supercopa","Champions","Europa League","Conference","Amistoso"];
  D.CONTINENTAL = ["Champions","Europa League","Conference"];

  /* ---------- Ligas seed (datos 2025/26) ---------- */
  D.LEAGUES = [
    { id: "eng-pl", name: "Premier League", country: "Inglaterra", teams: ["Arsenal","Aston Villa","Bournemouth","Brentford","Brighton","Burnley","Chelsea","Crystal Palace","Everton","Fulham","Leeds United","Liverpool","Manchester City","Manchester United","Newcastle United","Nottingham Forest","Sunderland","Tottenham Hotspur","West Ham United","Wolverhampton Wanderers"] },
    { id: "esp-laliga", name: "LaLiga", country: "España", teams: ["Alavés","Athletic Club","Atlético de Madrid","Barcelona","Celta de Vigo","Elche","Espanyol","Getafe","Girona","Levante","Mallorca","Osasuna","Rayo Vallecano","Real Betis","Real Madrid","Real Oviedo","Real Sociedad","Sevilla","Valencia","Villarreal"] },
    { id: "ita-seriea", name: "Serie A", country: "Italia", teams: ["Atalanta","Bologna","Cagliari","Como","Cremonese","Fiorentina","Genoa","Inter","Juventus","Lazio","Lecce","Milan","Napoli","Parma","Pisa","Roma","Sassuolo","Torino","Udinese","Hellas Verona"] },
    { id: "ger-bundesliga", name: "Bundesliga", country: "Alemania", teams: ["Bayern Múnich","Borussia Dortmund","RB Leipzig","Bayer Leverkusen","Eintracht Frankfurt","VfB Stuttgart","SC Freiburg","Werder Bremen","FC Augsburg","VfL Wolfsburg","Borussia Mönchengladbach","Mainz 05","Union Berlin","TSG Hoffenheim","FC St. Pauli","1. FC Heidenheim","1. FC Köln","Hamburgo SV"] },
    { id: "fra-ligue1", name: "Ligue 1", country: "Francia", teams: ["Paris Saint-Germain","Marsella","Mónaco","Niza","Lille","Lyon","Lens","Rennes","Estrasburgo","Nantes","Brest","Toulouse","Auxerre","Le Havre","Angers","Lorient","Paris FC","Metz"] },
    { id: "custom", name: "Liga personalizada", country: "—", teams: [] },
  ];

  /* ---------- Wonderkids (teaser de scouting) ---------- */
  D.WONDERKIDS = [
    {name:"Lamine Yamal",club:"Barcelona",position:"RW",age:18,ovr:89,potential:95,nationality:"España"},
    {name:"João Neves",club:"Paris Saint-Germain",position:"CM",age:20,ovr:85,potential:92,nationality:"Portugal"},
    {name:"Désiré Doué",club:"Paris Saint-Germain",position:"RW",age:20,ovr:85,potential:91,nationality:"Francia"},
    {name:"Endrick",club:"Real Madrid",position:"ST",age:19,ovr:77,potential:91,nationality:"Brasil"},
    {name:"Estêvão",club:"Chelsea",position:"RW",age:18,ovr:78,potential:89,nationality:"Brasil"},
    {name:"Dean Huijsen",club:"Real Madrid",position:"CB",age:20,ovr:82,potential:89,nationality:"España"},
    {name:"Jorrel Hato",club:"Chelsea",position:"LB",age:19,ovr:78,potential:89,nationality:"Países Bajos"},
    {name:"Jorthy Mokio",club:"Ajax",position:"CDM",age:18,ovr:72,potential:89,nationality:"Bélgica"},
    {name:"Pau Cubarsí",club:"Barcelona",position:"CB",age:18,ovr:82,potential:88,nationality:"España"},
    {name:"Castello Lukeba",club:"RB Leipzig",position:"CB",age:22,ovr:80,potential:88,nationality:"Francia"},
    {name:"Givairo Read",club:"Feyenoord",position:"RB",age:19,ovr:75,potential:88,nationality:"Países Bajos"},
    {name:"Rio Ngumoha",club:"Liverpool",position:"LW",age:17,ovr:68,potential:88,nationality:"Inglaterra"},
    {name:"Geovany Quenda",club:"Sporting CP",position:"RW",age:18,ovr:76,potential:88,nationality:"Portugal"},
    {name:"Francesco Camarda",club:"Lecce",position:"ST",age:17,ovr:65,potential:87,nationality:"Italia"},
    {name:"Warren Zaïre-Emery",club:"Paris Saint-Germain",position:"CM",age:19,ovr:80,potential:87,nationality:"Francia"},
    {name:"Franco Mastantuono",club:"Real Madrid",position:"CAM",age:17,ovr:77,potential:87,nationality:"Argentina"},
    {name:"Mathys Tel",club:"Tottenham Hotspur",position:"ST",age:20,ovr:77,potential:86,nationality:"Francia"},
    {name:"Leny Yoro",club:"Manchester United",position:"CB",age:19,ovr:78,potential:86,nationality:"Francia"},
    {name:"António Silva",club:"Benfica",position:"CB",age:21,ovr:78,potential:86,nationality:"Portugal"},
    {name:"Guillaume Restes",club:"Toulouse",position:"GK",age:20,ovr:78,potential:86,nationality:"Francia"},
    {name:"Lucas Bergvall",club:"Tottenham Hotspur",position:"CM",age:19,ovr:74,potential:86,nationality:"Suecia"},
    {name:"Claudio Echeverri",club:"Bayer Leverkusen",position:"CAM",age:19,ovr:74,potential:85,nationality:"Argentina"},
    {name:"Vitor Roque",club:"Palmeiras",position:"ST",age:20,ovr:77,potential:85,nationality:"Brasil"},
    {name:"Matthieu Epolo",club:"Standard Liège",position:"GK",age:20,ovr:72,potential:85,nationality:"Bélgica"},
    {name:"Assan Ouédraogo",club:"RB Leipzig",position:"CM",age:19,ovr:72,potential:85,nationality:"Alemania"},
    {name:"Kendry Páez",club:"Chelsea",position:"CAM",age:18,ovr:73,potential:84,nationality:"Ecuador"},
    {name:"Roony Bardghji",club:"Barcelona",position:"RW",age:20,ovr:73,potential:84,nationality:"Suecia"},
    {name:"Tyler Dibling",club:"Everton",position:"RM",age:19,ovr:73,potential:84,nationality:"Inglaterra"},
    {name:"Cher Ndour",club:"Fiorentina",position:"CM",age:20,ovr:70,potential:83,nationality:"Italia"},
    {name:"Rome-Jayden Owusu-Oduro",club:"AZ Alkmaar",position:"GK",age:20,ovr:71,potential:84,nationality:"Países Bajos"},
  ];

  /* ============================================================
     MOTOR DE REGLAS (validador-vigilante de retos)
     Cada regla: id, label, desc, params, check(career,params)=>[violations]
     Una violación: { text }
     Las reglas se apoyan en career.transfers y career.players.
     ============================================================ */
  function inSignings(career) {
    return (career.transfers || []).filter(t => t.direction === "in");
  }
  D.RULES = {
    "no-signings": {
      label: "Sin fichajes",
      desc: "No puedes incorporar a nadie de fuera. Solo cantera y agentes libres prohibidos.",
      check(career) {
        return inSignings(career)
          .filter(t => t.type !== "youth")
          .map(t => ({ text: `Fichaje no permitido: ${t.player} (${t.type === "free" ? "libre" : "traspaso"})` }));
      },
    },
    "youth-only": {
      label: "Solo cantera",
      desc: "Toda incorporación debe salir de tu academia juvenil.",
      check(career) {
        return inSignings(career)
          .filter(t => t.type !== "youth")
          .map(t => ({ text: `${t.player} no proviene de la cantera` }));
      },
    },
    "free-agents-only": {
      label: "Solo agentes libres",
      desc: "Solo puedes incorporar agentes libres (ni traspasos ni cesiones).",
      check(career) {
        return inSignings(career)
          .filter(t => t.type !== "youth" && t.type !== "free")
          .map(t => ({ text: `${t.player} no es agente libre (${t.type === "loan" ? "cesión" : "traspaso" + (Number(t.fee) > 0 ? " de " + FC.util.money(t.fee) : "")})` }));
      },
    },
    "no-loans": {
      label: "Sin cesiones",
      desc: "No puedes traer jugadores cedidos.",
      check(career) {
        return inSignings(career)
          .filter(t => t.type === "loan")
          .map(t => ({ text: `${t.player} llegó cedido` }));
      },
    },
    "one-nationality": {
      label: "Una sola nacionalidad",
      desc: "Toda tu plantilla debe compartir la nacionalidad indicada.",
      params: [{ key: "nationality", label: "Nacionalidad permitida", type: "text", placeholder: "p.ej. España" }],
      check(career, p) {
        if (!p || !p.nationality) return [];
        const want = p.nationality.trim().toLowerCase();
        return (career.players || [])
          .filter(pl => (pl.nationality || "").trim().toLowerCase() !== want)
          .map(pl => ({ text: pl.nationality ? `${pl.name} es de ${pl.nationality}, no ${p.nationality}` : `${pl.name} no tiene nacionalidad asignada` }));
      },
    },
    "max-spend": {
      label: "Tope de gasto",
      desc: "Tu gasto total en fichajes no puede superar el límite.",
      params: [{ key: "amount", label: "Gasto máximo (€)", type: "number", placeholder: "p.ej. 50000000" }],
      check(career, p) {
        if (!p || !p.amount) return [];
        const total = inSignings(career).reduce((s, t) => s + (Number(t.fee) || 0), 0);
        const max = Number(p.amount);
        return total > max ? [{ text: `Gasto total ${FC.util.money(total)} supera el tope ${FC.util.money(max)}` }] : [];
      },
    },
    "sell-before-buy": {
      label: "Vende antes de comprar",
      desc: "No puedes gastar más de lo que ingresas por ventas.",
      check(career) {
        const inFees = inSignings(career).reduce((s, t) => s + (Number(t.fee) || 0), 0);
        const outFees = (career.transfers || []).filter(t => t.direction === "out").reduce((s, t) => s + (Number(t.fee) || 0), 0);
        return inFees > outFees
          ? [{ text: `Gastado ${FC.util.money(inFees)} vs ingresado ${FC.util.money(outFees)} (saldo negativo)` }]
          : [];
      },
    },
    "max-age": {
      label: "Solo jóvenes",
      desc: "No puedes tener jugadores por encima de la edad indicada.",
      params: [{ key: "age", label: "Edad máxima", type: "number", placeholder: "p.ej. 23" }],
      check(career, p) {
        if (!p || !p.age) return [];
        const max = Number(p.age);
        return (career.players || [])
          .filter(pl => { const a = Number(pl.age); return !Number.isFinite(a) || a > max; })
          .map(pl => { const a = Number(pl.age); return { text: Number.isFinite(a) ? `${pl.name} tiene ${pl.age} años (máx ${max})` : `${pl.name} no tiene edad asignada` }; });
      },
    },
    "homegrown-honor": {
      label: "Once de la casa (honor)",
      desc: "Alinea solo jugadores formados en el club. No es autoverificable: se confía en tu honor.",
      manual: true,
      check() { return []; },
    },
  };

  /* ============================================================
     CATÁLOGO DE RETOS
     ============================================================ */
  D.CHALLENGES = [
    { id:"road-to-glory", name:"Road to Glory", emoji:"🚀", difficulty:4, category:"Ascenso",
      blurb:"Coge un equipo de las divisiones bajas o un país menor y llévalo a conquistar Europa.",
      recommended:["Wrexham","Le Havre","Pisa","Real Oviedo","Sunderland"],
      rules:[] },
    { id:"youth-academy", name:"Solo Cantera", emoji:"🌱", difficulty:5, category:"Desarrollo",
      blurb:"Tras la primera temporada, solo puedes incorporar jugadores de tu academia juvenil.",
      recommended:["Cualquier club con buena cantera"],
      rules:["youth-only"] },
    { id:"journeyman", name:"Trotamundos", emoji:"🧳", difficulty:3, category:"Mánager",
      blurb:"Gana un título en cada una de las 5 grandes ligas con clubes distintos.",
      recommended:["Empieza en una liga menor"],
      rules:[] },
    { id:"treble", name:"El Triplete", emoji:"🏆", difficulty:4, category:"Títulos",
      blurb:"Gana liga, copa nacional y Champions en una misma temporada.",
      recommended:["Manchester City","Real Madrid","Bayern Múnich","Paris Saint-Germain"],
      rules:[] },
    { id:"fallen-giant", name:"Gigante Caído", emoji:"💔", difficulty:3, category:"Reconstrucción",
      blurb:"Reconstruye un club histórico venido a menos y devuélvelo a lo más alto.",
      recommended:["Sunderland","Hamburgo SV","Real Oviedo","Leeds United","Parma"],
      rules:[] },
    { id:"financial-fairplay", name:"Restricción Financiera", emoji:"💸", difficulty:4, category:"Economía",
      blurb:"Gasta solo lo que ingreses por ventas. Prohibido el dinero fácil.",
      recommended:["Brighton","Girona","Atalanta"],
      rules:["sell-before-buy"] },
    { id:"one-nation", name:"Orgullo Nacional", emoji:"🌍", difficulty:4, category:"Plantilla",
      blurb:"Construye una plantilla con jugadores de una única nacionalidad.",
      recommended:["Athletic Club","cualquier club"],
      rules:["one-nationality"] },
    { id:"wonderkid-factory", name:"Fábrica de Cracks", emoji:"⭐", difficulty:3, category:"Desarrollo",
      blurb:"Fichas jóvenes (<=23) y los conviertes en estrellas. Nada de veteranos.",
      recommended:["Mónaco","RB Leipzig","Benfica"],
      rules:["max-age"] },
    { id:"world-domination", name:"Dominación Mundial", emoji:"👑", difficulty:5, category:"Títulos",
      blurb:"Gana todos los títulos posibles: liga, copa, supercopa, Champions, Mundial de Clubes.",
      recommended:["Cualquier gigante"],
      rules:[] },
    { id:"no-signings", name:"Plantilla Sellada", emoji:"🔒", difficulty:5, category:"Plantilla",
      blurb:"Ni un solo fichaje. Triunfa solo con los que ya tienes (y tu cantera).",
      recommended:["Un grande que ya tenga buena plantilla"],
      rules:["no-signings"] },
  ];

  /* ============================================================
     LOGROS (badges con tiers; check(career)=>bool)
     Se apoyan en helpers de FC.store (evaluados en runtime).
     ============================================================ */
  D.ACHIEVEMENTS = [
    { id:"first-match", name:"Primer pitido", emoji:"🟢", tier:"bronze", desc:"Registra tu primer partido.",
      check:(c)=> FC.store.userMatches(c).length >= 1 },
    { id:"first-win", name:"Estreno triunfal", emoji:"✅", tier:"bronze", desc:"Gana tu primer partido.",
      check:(c)=> FC.store.anyMatch(c, m => FC.store.userResult(c,m) === "W") },
    { id:"big-win", name:"Manita y más", emoji:"🖐️", tier:"bronze", desc:"Gana un partido por 5+ goles de diferencia.",
      check:(c)=> FC.store.anyMatch(c, m => { const r = FC.store.userGoals(c,m); return r && (r.for - r.against) >= 5; }) },
    { id:"clean-sheets-10", name:"Muro", emoji:"🧱", tier:"silver", desc:"Consigue 10 porterías a cero en una temporada.",
      check:(c)=> FC.store.seasonsSome(c, s => s.cleanSheets >= 10) },
    { id:"goal-fest", name:"Goleador de récord", emoji:"⚽", tier:"silver", desc:"Marca 80+ goles de equipo en una temporada.",
      check:(c)=> FC.store.seasonsSome(c, s => s.gf >= 80) },
    { id:"top-scorer-25", name:"Bota de oro", emoji:"🥇", tier:"silver", desc:"Un jugador marca 25+ goles en una temporada.",
      check:(c)=> FC.store.anyPlayerSeason(c, p => p.goals >= 25) },
    { id:"league-title", name:"Campeón de liga", emoji:"🏆", tier:"gold", desc:"Gana un título de liga.",
      check:(c)=> (c.trophies||[]).some(t => /liga/i.test(t.competition || "") && t.result === "winner") },
    { id:"promotion", name:"Ascenso", emoji:"⬆️", tier:"silver", desc:"Logra un ascenso de categoría.",
      check:(c)=> (c.trophies||[]).some(t => t.result === "promotion") },
    { id:"cup-winner", name:"Rey de copas", emoji:"🥤", tier:"gold", desc:"Gana una copa nacional.",
      check:(c)=> (c.trophies||[]).some(t => /copa/i.test(t.competition || "") && t.result === "winner") },
    { id:"continental", name:"Noche europea", emoji:"🌟", tier:"gold", desc:"Gana una competición continental (Champions/Europa/Conference).",
      check:(c)=> (c.trophies||[]).some(t => D.CONTINENTAL.some(cc => (t.competition || "").includes(cc)) && t.result === "winner") },
    { id:"invincible", name:"Los Invencibles", emoji:"🛡️", tier:"legend", desc:"Termina una temporada de liga sin perder (mín. 20 partidos).",
      check:(c)=> FC.store.seasonsSome(c, s => s.leaguePlayed >= 20 && s.leagueLost === 0) },
    { id:"treble", name:"El Triplete", emoji:"👑", tier:"legend", desc:"Gana liga + copa + continental en una misma temporada.",
      check:(c)=> FC.store.seasonsSome(c, s => s.wonLeague && s.wonCup && s.wonContinental) },
    { id:"dynasty", name:"Dinastía", emoji:"🏰", tier:"legend", desc:"Gana la liga 3 temporadas seguidas.",
      check:(c)=> FC.store.consecutiveLeagueTitles(c) >= 3 },
    { id:"centurion", name:"Centurión", emoji:"💯", tier:"gold", desc:"Un jugador alcanza 100 partidos con el club.",
      check:(c)=> FC.store.anyPlayerCareer(c, p => p.apps >= 100) },
    { id:"legend-maker", name:"Hacedor de leyendas", emoji:"📈", tier:"gold", desc:"Un canterano llega a 85+ de media.",
      check:(c)=> (c.players||[]).some(p => p.fromYouth && Number(p.ovr) >= 85) },
    // Logros de viajero (sección Viajes). Distancias por FC.trips (Haversine); equipos
    // sin coordenadas usan el fallback determinista, así que son logros de inmersión.
    { id:"trip-long-haul", name:"Sin escalas", emoji:"🛫", tier:"bronze", desc:"Juega un desplazamiento de 1.000+ km.",
      check:(c)=> { const home = FC.trips.cityOf(c.clubName);
        return FC.store.userMatches(c).some(m => m.away === c.clubName && m.home && FC.trips.distance(home, FC.trips.cityOf(m.home)) >= 1000); } },
    { id:"trip-marathon", name:"Maratoniano", emoji:"🧳", tier:"silver", desc:"Recorre 10.000+ km de viajes en una sola temporada.",
      check:(c)=> { const home = FC.trips.cityOf(c.clubName); const km = {};
        FC.store.userMatches(c).forEach(m => { if (m.away === c.clubName && m.home) km[m.seasonId] = (km[m.seasonId]||0) + FC.trips.distance(home, FC.trips.cityOf(m.home))*2; });
        return Object.values(km).some(v => v >= 10000); } },
    { id:"trip-globetrotter", name:"Trotamundos", emoji:"🌍", tier:"gold", desc:"Visita el estadio de todos los rivales de tu liga en una temporada.",
      check:(c)=> (c.seasons||[]).some(s => { const rivals = (s.teams||[]).filter(t => t !== c.clubName); if (!rivals.length) return false;
        const visited = new Set(); FC.store.userMatches(c, s.id).forEach(m => { if (m.away === c.clubName && m.home) visited.add(m.home); });
        return rivals.every(t => visited.has(t)); }) },
    { id:"trip-world-lap", name:"La vuelta al mundo", emoji:"🌐", tier:"legend", desc:"Acumula 40.075 km de viajes en tu carrera (una vuelta al mundo).",
      check:(c)=> { const home = FC.trips.cityOf(c.clubName); let km = 0;
        FC.store.userMatches(c).forEach(m => { if (m.away === c.clubName && m.home) km += FC.trips.distance(home, FC.trips.cityOf(m.home))*2; });
        return km >= 40075; } },
  ];

  D.TIER_LABEL = { bronze:"Bronce", silver:"Plata", gold:"Oro", legend:"Leyenda" };

  /* ============================================================
     ACADEMIA JUVENIL — pools para generar promesas de cantera
     ============================================================ */
  D.YOUTH_FIRST = ["Adam","Leo","Hugo","Mateo","Lucas","Noah","Iker","Diego","Marco","Bryan","Youssef","Karim","Samuel","Eric","Nico","Pol","Iván","Gael","Thiago","Aarón","Dylan","Rayan","Omar","Luca","Pau","Biel","Izan","Enzo","Dani","Álex","Joel","Unai","Cristian","Saúl","Brahim","Liam","Mohamed","Tariq","Sory","Mamadou"];
  D.YOUTH_LAST = ["García","Martín","López","Sánchez","Romero","Torres","Silva","Costa","Mendes","Ferreira","Diallo","Traoré","Koné","Bamba","Nielsen","Johansson","Müller","Rossi","Bianchi","Novak","Kovač","Popescu","Ahmed","Hassan","Okafor","Dembélé","Fernandes","Pereira","Vidal","Núñez","Castro","Ortega","Reyes","Cano","De Jong","Andersen","Haaland","Lindholm","Yildiz","Camara"];
  D.YOUTH_NATIONS = ["España","Francia","Brasil","Argentina","Italia","Portugal","Inglaterra","Alemania","Países Bajos","Senegal","Marruecos","Nigeria","Bélgica","Croacia","Uruguay","Dinamarca","Serbia","Colombia"];
  D.YOUTH_NOTES = {
    elite: ["Talento generacional. No lo dejes escapar.", "Puede marcar una época en el club.", "Joya total: futuro crack mundial."],
    high: ["Gran proyección, llamado a ser titular.", "Mimbres de internacional. Dale minutos.", "Promesa de primer nivel."],
    mid: ["Promesa interesante con margen de mejora.", "Buen perfil para crecer en el filial.", "Proyecto a medio plazo."],
    low: ["Jugador de rotación en potencia.", "Necesita rodaje; una cesión le vendría bien.", "Apuesta de bajo coste."],
  };

  /* ============================================================
     NARRATIVA — pools de titulares (se rellenan con {placeholders})
     ============================================================ */
  D.STORY = {
    opener:      ["Arranca la temporada {season}", "Comienza una nueva campaña: {season}", "Se levanta el telón: {season}"],
    bigWin:      ["¡Recital del {team}! Goleada al {rival}", "Goleada de época: el {team} arrasa al {rival}", "El {team} se da un festín ante el {rival}"],
    bigLoss:     ["Varapalo: el {rival} pasa por encima del {team}", "Noche para olvidar ante el {rival}", "Pinchazo serio del {team} frente al {rival}"],
    hattrick:    ["Hat-trick de {player}: se sale", "{player} firma un triplete para enmarcar", "Día redondo de {player}: tres dianas"],
    trophyWin:   ["¡CAMPEONES! El {team} conquista {comp}", "El {team} levanta el título de {comp}", "Gloria eterna: {comp} se queda en casa"],
    promotion:   ["¡Ascenso! El {team} sube de categoría", "Misión cumplida: el {team} asciende", "El {team} da el salto: ascenso logrado"],
    runnerup:    ["Subcampeones en {comp}: tan cerca...", "El {team} se queda a las puertas en {comp}", "Plata en {comp} para el {team}"],
    signIn:      ["Fichaje: {player} aterriza en el {team}", "El {team} se refuerza con {player}", "Cara nueva en el vestuario: {player}"],
    signMarquee: ["BOMBAZO: {player} ficha por {fee}", "El {team} ata a {player} por {fee}", "Fichaje estrella: {player} ({fee})"],
    saleOut:     ["{player} hace las maletas rumbo al {club}", "Venta: {player} se marcha al {club}", "Adiós a {player}: ficha por el {club}"],
    youth:       ["De la cantera al primer equipo: sube {player}", "La cantera manda: {player} asciende", "Nueva perla del filial: {player} llega arriba"],
    streak:      ["Racha imbatible: {n} partidos sin perder", "El {team} no sabe perder: {n} seguidos", "Imparables: {n} jornadas invicto"],
    domination:  ["Dominio absoluto del {team}: {poss}% de posesión", "El {team} monopolizó el balón ({poss}%)", "Recital de control: {poss}% de posesión del {team}"],
    clinical:    ["Pegada letal: el {team} fue clínico ante el {rival}", "El {team} ganó con eficacia de killer", "Cirugía fina del {team}: marcó lo justo y ganó"],
    unlucky:     ["El marcador fue injusto con el {team}: mereció más", "El fútbol fue cruel con el {team}", "El {team} generó de sobra, pero no le entró"],
    wasteful:    ["{shots} remates y poco premio: al {team} le faltó puntería", "El {team} disparó mucho y acertó poco", "Dominó los disparos pero no la red: el {team}"],
    redcard:     ["Tarde caliente: el {team} acabó con uno menos", "Drama y expulsión en el partido del {team}", "El {team} sufrió en inferioridad numérica"],
  };

  /* ============================================================
     GENERADOR VIRAL — objetivos y "twists" de reto/rebuild
     ============================================================ */
  D.GEN_OBJECTIVES = [
    { text:"Gana la liga", emoji:"🏆", diff:3 },
    { text:"Gana la Champions", emoji:"🌟", diff:5 },
    { text:"Gánalo todo: el triplete", emoji:"👑", diff:5 },
    { text:"Asciende de categoría", emoji:"⬆️", diff:2 },
    { text:"Termina la liga invicto", emoji:"🛡️", diff:5 },
    { text:"Top 4 y copa nacional", emoji:"🥈", diff:3 },
    { text:"Gana la liga 3 años seguidos", emoji:"🏰", diff:4 },
    { text:"Llega a la final de Champions", emoji:"✨", diff:4 },
    { text:"Mete a 3 canteranos en el once titular", emoji:"🌱", diff:3 },
  ];
  D.GEN_TWISTS = [
    { label:"Solo canteranos", emoji:"🌱", ruleId:"youth-only" },
    { label:"Solo agentes libres", emoji:"🆓", ruleId:"free-agents-only" },
    { label:"Sin fichajes", emoji:"🚫", ruleId:"no-signings" },
    { label:"Sin cesiones", emoji:"↩️", ruleId:"no-loans" },
    { label:"Nadie mayor de 23", emoji:"👶", ruleId:"max-age", params:{ age:23 } },
    { label:"Vende antes de comprar", emoji:"💸", ruleId:"sell-before-buy" },
    { label:"Una sola nacionalidad", emoji:"🌍", ruleId:"one-nationality" },
    { label:"Presupuesto de mileurista (≤5M)", emoji:"🪙", ruleId:"max-spend", params:{ amount:5000000 } },
    { label:"Empieza vendiendo a tu estrella", emoji:"📉" },
    { label:"Asciende desde 2ª división", emoji:"🪜" },
  ];

  /* Acentos de color para personalizar la apariencia */
  D.ACCENTS = [
    { name:"Césped", color:"#00e1a0" },
    { name:"Océano", color:"#1f8fff" },
    { name:"Oro", color:"#ffc24d" },
    { name:"Fuego", color:"#ff5470" },
    { name:"Royal", color:"#b06bff" },
    { name:"Hielo", color:"#22d3ee" },
  ];

  /* ============================================================
     VIAJES — coordenadas de ciudades por equipo (sedes de las ligas
     seed) y pools narrativos de la "Cabina en directo".
     CITIES: "Equipo": [lat, lon, "Ciudad"]. Clave = nombre EXACTO de
     LEAGUES. Equipos personalizados caen a un fallback determinista.
     ============================================================ */
  D.CITIES = {
    // Premier League
    "Arsenal":[51.555,-0.108,"Londres"], "Aston Villa":[52.509,-1.885,"Birmingham"], "Bournemouth":[50.735,-1.838,"Bournemouth"],
    "Brentford":[51.491,-0.289,"Londres"], "Brighton":[50.862,-0.084,"Brighton"], "Burnley":[53.789,-2.230,"Burnley"],
    "Chelsea":[51.482,-0.191,"Londres"], "Crystal Palace":[51.398,-0.086,"Londres"], "Everton":[53.439,-2.966,"Liverpool"],
    "Fulham":[51.475,-0.222,"Londres"], "Leeds United":[53.778,-1.572,"Leeds"], "Liverpool":[53.431,-2.961,"Liverpool"],
    "Manchester City":[53.483,-2.200,"Mánchester"], "Manchester United":[53.463,-2.291,"Mánchester"], "Newcastle United":[54.976,-1.622,"Newcastle"],
    "Nottingham Forest":[52.940,-1.133,"Nottingham"], "Sunderland":[54.914,-1.388,"Sunderland"], "Tottenham Hotspur":[51.604,-0.066,"Londres"],
    "West Ham United":[51.539,-0.017,"Londres"], "Wolverhampton Wanderers":[52.590,-2.130,"Wolverhampton"],
    // LaLiga
    "Alavés":[42.846,-2.672,"Vitoria"], "Athletic Club":[43.264,-2.949,"Bilbao"], "Atlético de Madrid":[40.436,-3.599,"Madrid"],
    "Barcelona":[41.381,2.123,"Barcelona"], "Celta de Vigo":[42.212,-8.740,"Vigo"], "Elche":[38.267,-0.696,"Elche"],
    "Espanyol":[41.348,2.076,"Barcelona"], "Getafe":[40.326,-3.715,"Getafe"], "Girona":[41.961,2.828,"Girona"],
    "Levante":[39.495,-0.364,"Valencia"], "Mallorca":[39.590,2.630,"Palma"], "Osasuna":[42.797,-1.637,"Pamplona"],
    "Rayo Vallecano":[40.392,-3.659,"Madrid"], "Real Betis":[37.356,-5.982,"Sevilla"], "Real Madrid":[40.453,-3.688,"Madrid"],
    "Real Oviedo":[43.360,-5.845,"Oviedo"], "Real Sociedad":[43.301,-1.974,"San Sebastián"], "Sevilla":[37.384,-5.971,"Sevilla"],
    "Valencia":[39.475,-0.358,"Valencia"], "Villarreal":[39.944,-0.103,"Villarreal"],
    // Serie A
    "Atalanta":[45.699,9.677,"Bérgamo"], "Bologna":[44.495,11.343,"Bolonia"], "Cagliari":[39.200,9.137,"Cagliari"],
    "Como":[45.808,9.085,"Como"], "Cremonese":[45.147,10.023,"Cremona"], "Fiorentina":[43.781,11.282,"Florencia"],
    "Genoa":[44.416,8.953,"Génova"], "Inter":[45.478,9.124,"Milán"], "Juventus":[45.110,7.641,"Turín"],
    "Lazio":[41.934,12.455,"Roma"], "Lecce":[40.365,18.210,"Lecce"], "Milan":[45.478,9.124,"Milán"],
    "Napoli":[40.828,14.193,"Nápoles"], "Parma":[44.795,10.338,"Parma"], "Pisa":[43.723,10.402,"Pisa"],
    "Roma":[41.934,12.455,"Roma"], "Sassuolo":[44.714,10.636,"Sassuolo"], "Torino":[45.042,7.650,"Turín"],
    "Udinese":[46.082,13.200,"Udine"], "Hellas Verona":[45.435,10.969,"Verona"],
    // Bundesliga
    "Bayern Múnich":[48.219,11.625,"Múnich"], "Borussia Dortmund":[51.493,7.452,"Dortmund"], "RB Leipzig":[51.346,12.348,"Leipzig"],
    "Bayer Leverkusen":[51.038,7.002,"Leverkusen"], "Eintracht Frankfurt":[50.069,8.646,"Fráncfort"], "VfB Stuttgart":[48.792,9.232,"Stuttgart"],
    "SC Freiburg":[48.022,7.830,"Friburgo"], "Werder Bremen":[53.066,8.838,"Bremen"], "FC Augsburg":[48.323,10.886,"Augsburgo"],
    "VfL Wolfsburg":[52.432,10.804,"Wolfsburgo"], "Borussia Mönchengladbach":[51.175,6.385,"Mönchengladbach"], "Mainz 05":[49.984,8.225,"Maguncia"],
    "Union Berlin":[52.457,13.568,"Berlín"], "TSG Hoffenheim":[49.239,8.888,"Sinsheim"], "FC St. Pauli":[53.555,9.968,"Hamburgo"],
    "1. FC Heidenheim":[48.677,10.139,"Heidenheim"], "1. FC Köln":[50.934,6.875,"Colonia"], "Hamburgo SV":[53.587,9.898,"Hamburgo"],
    // Ligue 1
    "Paris Saint-Germain":[48.841,2.253,"París"], "Marsella":[43.270,5.396,"Marsella"], "Mónaco":[43.728,7.416,"Mónaco"],
    "Niza":[43.705,7.193,"Niza"], "Lille":[50.612,3.130,"Lille"], "Lyon":[45.765,4.982,"Lyon"],
    "Lens":[50.433,2.815,"Lens"], "Rennes":[48.107,-1.713,"Rennes"], "Estrasburgo":[48.560,7.755,"Estrasburgo"],
    "Nantes":[47.256,-1.525,"Nantes"], "Brest":[48.403,-4.462,"Brest"], "Toulouse":[43.583,1.434,"Toulouse"],
    "Auxerre":[47.787,3.589,"Auxerre"], "Le Havre":[49.499,0.170,"Le Havre"], "Angers":[47.460,-0.530,"Angers"],
    "Lorient":[47.749,-3.370,"Lorient"], "Paris FC":[48.826,2.352,"París"], "Metz":[49.110,6.160,"Metz"],
    // Equipos españoles frecuentes (ascensos / Segunda) para reducir el fallback
    "Las Palmas":[28.100,-15.456,"Las Palmas"], "UD Las Palmas":[28.100,-15.456,"Las Palmas"], "Cádiz":[36.502,-6.273,"Cádiz"],
    "Granada":[37.153,-3.596,"Granada"], "Almería":[36.840,-2.435,"Almería"], "UD Almería":[36.840,-2.435,"Almería"],
    "Leganés":[40.340,-3.760,"Leganés"], "CD Leganés":[40.340,-3.760,"Leganés"], "Leganes":[40.340,-3.760,"Leganés"],
    "Celta Vigo":[42.212,-8.740,"Vigo"], "RC Celta":[42.212,-8.740,"Vigo"],
    "Atletico de Madrid":[40.436,-3.599,"Madrid"], "Atletico Madrid":[40.436,-3.599,"Madrid"],
    "Deportivo Alaves":[42.846,-2.672,"Vitoria"], "Alaves":[42.846,-2.672,"Vitoria"],
    "Sporting Gijón":[43.536,-5.637,"Gijón"],
    "Sporting de Gijón":[43.536,-5.637,"Gijón"], "Real Zaragoza":[41.634,-0.902,"Zaragoza"], "Tenerife":[28.469,-16.255,"Tenerife"],
    "Eibar":[43.184,-2.474,"Eibar"], "Real Valladolid":[41.644,-4.761,"Valladolid"], "Valladolid":[41.644,-4.761,"Valladolid"],
    "Málaga":[36.720,-4.420,"Málaga"], "Racing de Santander":[43.427,-3.829,"Santander"], "Deportivo":[43.348,-8.412,"A Coruña"],
    "Deportivo de La Coruña":[43.348,-8.412,"A Coruña"], "Burgos":[42.341,-3.700,"Burgos"], "Huesca":[42.137,-0.409,"Huesca"],
    "Castellón":[39.986,-0.037,"Castellón"], "Mirandés":[42.687,-2.945,"Miranda de Ebro"], "Córdoba":[37.879,-4.779,"Córdoba"],
  };

  /* Pools narrativos de la cabina. Plantillas con {slots} que el motor
     (FC.trips) rellena con datos vivos y escapa con U.esc. Slots:
     {team} {rival} {city} {ocity} {comp} {round} {n} {v} {e} {d}
     {streak} {player} {pos} {goals} {score} {home}. */
  D.TRIP = {
    ambient: {
      avion: {
        despegue: [
          "Ruedas arriba: el {team} pone rumbo a {city}.",
          "Despegamos de {ocity}. Próxima parada, {city}.",
          "El charter del {team} enfila la pista hacia {city}.",
          "Cinturones abrochados: {comp} espera en {city}.",
          "La {tierWord} del {team} despega rumbo a {city}.",
          "Motor encendido: el {team} pone el piloto automático rumbo a {city}.",
          "Asientos, cinturones, {city}: el {team} tiene un partido que ganar.",
          "Pista despejada en {ocity}; lo que espera en {city} ya puede empezar a preocuparse.",
          "La {tierWord} del {team} sube a bordo con la cabeza en {comp}.",
          "Último vistazo a {ocity} antes de que las nubes lo tapen todo: ya solo importa {city}.",
        ],
      },
      bus: {
        salida: [
          "El autocar del {team} arranca rumbo a {city}.",
          "Salida de {ocity}: por carretera hasta {city}.",
          "El bus del equipo enfila la autovía hacia {city}.",
          "En marcha hacia {city}, con {comp} en el horizonte.",
          "La {tierWord} del {team} arranca por carretera hacia {city}.",
          "Asientos ocupados, silencio en el bus: el {team} ya está en modo partido.",
          "Por carretera hasta {city}: el paisaje cambia, la concentración no.",
          "Ventanas empañadas y kilómetros por delante hasta {city}.",
          "En el fondo del bus ya se escucha algo de música; quedan horas para {city}.",
          "Autopista adelante: el {team} lleva {comp} en la cabeza desde el primer peaje.",
        ],
      },
    },
    h2h: {
      bestia: [
        "{n}ª vez en {city} y el {team} aún no sabe lo que es ganar aquí.",
        "Feudo maldito: {d} derrotas del {team} en {city}. Hoy, a romper la racha.",
        "El {team} regresa a {city}, su asignatura pendiente ({v}V {d}D).",
        "Estadio maldito para el {team}: ni una victoria en {d} visitas a {city}.",
        "El {team} no encuentra la tecla en {city}. Visita número {n} para intentarlo.",
      ],
      fortin: [
        "{city} se le da bien al {team}: {v} triunfos en este campo.",
        "Terreno amigo: el {team} suele salir con los tres puntos de {city}.",
        "El {team} vuelve a {city}, donde casi siempre manda ({v}V).",
        "El {team} llega a {city} con buenas sensaciones: aquí casi siempre se saca algo.",
        "{v} veces ha celebrado el {team} en {city}; que sea una más.",
      ],
      equilibrado: [
        "Visita {n} a {city}: historial parejo ({v}V {e}E {d}D).",
        "El {team} ya conoce {city}: ni fortín ni feudo, pura pelea.",
        "Otra cita en {city}; la última acabó {score}.",
        "Historial sin favoritismos en {city}: {v}V {e}E {d}D.",
        "En {city} siempre hay partido; la igualada en el historial lo confirma.",
      ],
      primera: [
        "Primera visita del {team} a {city}. Sin precedentes que pesen.",
        "Estreno en {city}: el {team} pisa este campo por primera vez.",
        "Terreno desconocido: el {team} debuta como visitante en {city}.",
        "El {team} estrena estadio en {city}; sin historia que pese, todo por escribir.",
        "Página en blanco en {city}: el {team} comienza hoy un historial nuevo.",
      ],
    },
    hero: {
      goleador: [
        "En la fila 7 viaja {player}: {goals} goles ya esta temporada.",
        "El {team} confía en {player} ({goals} dianas) para desnivelar en {city}.",
        "{player} llega a {city} en racha: {goals} goles y contando.",
      ],
      canterano: [
        "{player}, de la cantera, mira por la ventanilla rumbo a {city}.",
        "Día grande para {player}: el canterano viaja entre los elegidos.",
        "La casa manda: {player} ({pos}) afronta otra cita lejos del Bernabéu particular.",
      ],
      veterano: [
        "{player}, veterano del vestuario, pone calma rumbo a {city}.",
        "El capitán {player} reparte consejos durante el viaje a {city}.",
        "{player} ya lo ha visto todo; hoy guía al grupo en {city}.",
      ],
      estrella: [
        "{player} ({pos}), la estrella del {team}, encabeza la expedición a {city}.",
        "Todas las miradas en {player} para el duelo de {city}.",
        "El {team} viaja con su mejor arma: {player}.",
      ],
    },
    stake: {
      liderato: [
        "El {team} viaja como líder: ganar en {city} sería un paso de gigante.",
        "Liderato en juego: cada punto en {city} pesa oro.",
        "El {team} viaja con el escudo del líder; {city} es el primer examen de altura.",
        "Mantenerse arriba exige ganar también lejos: el {team} lo sabe en {city}.",
      ],
      europa_zona: [
        "Pelea por Europa: el {team} no puede dejarse puntos en {city}.",
        "Zona noble en disputa; el {team} se la juega en {city}.",
        "Un triunfo en {city} pondría al {team} un paso más cerca de Europa.",
        "La zona noble de la tabla está al alcance; el {team} no puede fallar en {city}.",
      ],
      descenso: [
        "Partido de seis puntos: el {team} se juega la permanencia en {city}.",
        "Sin red: el {team} necesita arañar algo en {city} para respirar.",
        "La tabla aprieta; el {team} necesita los tres puntos de {city} para respirar.",
        "Salir del pozo exige ganar fuera: el {team} se lo juega esta tarde en {city}.",
      ],
      media: [
        "Sin presión en la tabla, el {team} viaja a {city} a competir y crecer.",
        "Jornada de media tabla en {city}: orgullo y oficio.",
        "Sin presión extra, el {team} sale a {city} a demostrar su oficio.",
        "Partido de media temporada en {city}: nada que perder, mucho que ganar.",
      ],
      copa: [
        "Noche de copa en {city}: o pasas, o a casa.",
        "Eliminatoria en {city}: no hay mañana si se falla.",
        "En copa no hay segunda oportunidad: el {team} o gana en {city} o se va a casa.",
        "Duelo único en {city}: el {team} sabe que perder significa eliminación.",
      ],
      continental: [
        "Noche europea en {city}: {comp} no perdona.",
        "Luces de {comp} en {city}; el {team} sale a por una gesta.",
        "La música de {comp} ya suena en cabeza; el {team} no viaja a {city} de turismo.",
        "{comp}: el {team} busca en {city} otro paso firme en Europa.",
      ],
      final_euro: [
        "Final continental en {city}. El {team} ante la historia.",
        "{comp}: el {team} viaja a {city} a por la gloria eterna.",
      ],
    },
    atmosfera: {
      nieve: [
        "Nieve sobre el norte: frío de verdad esperando en {city}.",
        "Cielo plomizo y copos; en {city} se jugará con guantes.",
        "Alerta meteorológica en {city}; la nieve puede decidir cómo se juega.",
        "Copos en el horizonte: el {team} lleva los botines de más agarre para {city}.",
      ],
      frio: [
        "Frío invernal en {city}: el aliento se ve sobre el césped.",
        "Tarde gélida en {city}; a entrar en calor pronto.",
        "Cero grados previstos en {city}; el calentamiento será más necesario que nunca.",
        "Tarde de invierno duro en {city}: los que menos teman el frío dominarán.",
      ],
      calor: [
        "Calor de verano en {city}: tarde pesada, hidratación al máximo.",
        "Bochorno en {city}; el ritmo lo marcará el termómetro.",
        "Alerta por calor en {city}; quien mueva más el balón sufrirá menos.",
        "Verano en {city}: tarde de hidratación y ritmo corto.",
      ],
      lluvia: [
        "Llueve en {city}: el balón correrá rápido sobre el verde.",
        "Césped mojado en {city}; cuidado con los resbalones.",
        "Paraguas en el banquillo y balón pesado: llueve en {city}.",
        "Agua desde primera hora en {city}; los balones parados pueden ser clave.",
      ],
      normal: [
        "Tarde tranquila de fútbol en {city}.",
        "Buen tiempo en {city} para rodar el balón.",
        "Tarde de fútbol limpio en {city}: nada que no sea el balón y los once.",
        "Condiciones ideales en {city}; no habrá excusas atmosféricas.",
      ],
    },
    reunion: [
      "Reencuentro: {player} espera enfrente, ahora en el {rival}.",
      "Viejo conocido en {city}: {player} viste hoy los colores del {rival}.",
      "La lista de convocados del {rival} incluye a {player}; el reencuentro está servido.",
      "{player} ya no viste esta camiseta, pero el {team} no olvida lo que hizo por el club.",
      "Verás a {player} enfrente en {city}: un partido con historia antes de que empiece.",
    ],
    rivalry: {
      victima: [
        "El {rival} es tu víctima favorita: {av} victorias en {total} cruces.",
        "Otra cita con el {rival}, ese rival al que el {team} tiene tomada la medida ({av}V de {total}).",
        "Con el {rival}, el {team} siempre encuentra el camino: {av} de {total} partidos ganados.",
        "Hay rivales que inspiran; el {rival} es uno de ellos ({av}V en {total}).",
        "El {rival} llega a {city} como víctima favorita del {team}: {av} triunfos en {total} duelos.",
      ],
      verdugo: [
        "El {rival}, tu verdugo histórico: {al} derrotas en {total} duelos. Toca cambiarlo.",
        "Cuentas pendientes con el {rival} ({al}D en {total}); el {team} viaja con sed de revancha.",
        "Ningún rival incomoda como el {rival}: {al} veces ha ganado al {team}.",
        "El {rival} y sus {al} victorias sobre el {team}; esta tarde se escribe otro capítulo.",
        "{al} derrotas ante el {rival} pesan; el {team} viaja a {city} a saldar esa deuda.",
      ],
      clasico: [
        "Clásico particular: {total} duelos con el {rival} y nunca sobra nada.",
        "El {team} y el {rival}, viejos rivales de {total} batallas. Otra más en {city}.",
        "Ni el {team} ni el {rival} se dan cuartel: {total} partidos, siempre apretados.",
        "{total} enfrentamientos con el {rival} y ninguno se parece al anterior.",
        "El {team} y el {rival} llevan {total} batallas a sus espaldas; la de hoy también contará.",
      ],
    },
    arc: {
      leyenda: [
        "{player} viaja sumando: ya {apps} partidos defendiendo esta camiseta.",
        "Una leyenda a bordo: {player} acumula {apps} encuentros con el {team}.",
        "{player} suma kilómetros: {apps} partidos con esta camiseta y los que quedan.",
        "Partido {apps} de {player} con el {team}; pocas páginas quedan en la leyenda.",
      ],
      veterano: [
        "{player} ya es fijo: {apps} partidos de oficio rumbo a {city}.",
        "Veteranía en la expedición: {apps} duelos lleva {player} con el {team}.",
        "El oficio no se pierde: {apps} duelos lleva {player} y su ritmo de viaje es el de siempre.",
        "{player} conoce estos trayectos de memoria; {apps} partidos con el {team} lo dicen todo.",
      ],
      cantera: [
        "{player} subió del filial y hoy es bandera del proyecto.",
        "De canterano a referente: {player} encabeza el viaje a {city}.",
        "{player} sabe de dónde viene: de la base del {team} a la primera plantilla.",
        "Canterano confirmado: {player} ya es fijo en la expedición.",
      ],
    },
    milestone: [
      "Viaje nº {trip} del {team} lejos de casa. Cuántos kilómetros de historia.",
      "{trip} desplazamientos ya en esta carrera; hoy, otro más rumbo a {city}.",
      "Efeméride viajera: el {team} alcanza su viaje nº {trip} a domicilio.",
      "El {team} suma ya {trip} desplazamientos; cada viaje ha dejado una historia.",
      "{trip} veces ha salido este equipo a defender la camiseta fuera de casa.",
      "Kilómetros, derrotas, victorias, empates: {trip} viajes del {team} y contando.",
    ],
    emergent: {
      norte: [
        "Noche cerrada en el norte y un cielo extraño sobre las nubes; nadie pega ojo.",
        "Luces raras asoman al norte durante el vuelo nocturno; el grupo lo recordará.",
        "El piloto informa de que se sobrevuela Escandinavia; fuera, la oscuridad no parece de este mundo.",
        "Silencio en cabina; el frío del norte se cuela incluso a diez mil metros.",
        "Luces en el horizonte que no son ciudad ni estrella: el norte en todo su misterio.",
      ],
      veterano: [
        "Puede que sea uno de los últimos viajes de {player} a este rincón. Se le nota.",
        "{player}, con la veteranía a cuestas, mira por la ventanilla como quien se despide.",
        "{player} mira las nubes con esa calma que solo dan años de viajes y partidos.",
        "El paso del tiempo se nota en los trayectos; {player} no desperdicia ninguno.",
        "Quizás no sean muchos más viajes para {player}. Hoy, como siempre: el primero en subir al bus.",
      ],
    },
    rare: [
      "Turbulencias leves: el grupo aprieta los reposabrazos y sonríe nervioso.",
      "Retraso en pista; el míster aprovecha para una última charla táctica.",
      "Un jugador no pega ojo en todo el trayecto: nervios de partido grande.",
      "El piloto saluda por megafonía a la afición del {team} que viaja con el equipo.",
      "Cánticos al fondo del pasillo: el viaje se hace corto.",
      "Niebla en la aproximación; el comandante pide calma, todo bajo control.",
      "Maletas en bodega y música en el vestuario: el {team} arranca el modo partido antes de embarcar.",
      "El autocar atraviesa {city} de noche; fuera, la afición local ya empieza a calentar el ambiente.",
      "Escala técnica imprevista: una hora de espera, pero el grupo la aprovecha para repasar el partido.",
      "El míster cierra los ojos en el asiento de delante. Cuando duerme en el viaje, el equipo vuela bien.",
      "Cámara de televisión local en el aeropuerto: el {team} ya es noticia antes de pisar el campo.",
      "Un seguidor del {team} reconoce al equipo en el aeropuerto y pide fotos; la expedición sonríe.",
      "El bus llega al estadio con dos horas de antelación; la quietud del campo vacío ya impone.",
      "Auriculares puestos y último análisis del rival: silencio productivo en el trayecto hacia {city}.",
      "Frenazo brusco en la autovía: un momento de susto, nada más. El chófer pide disculpas; el grupo ríe.",
      "El hotel está a cien metros del estadio; el ruido de la afición del {rival} ya se cuela por las ventanas.",
    ],
    arrival: [
      "Llegada a {city}. El {team} ya pisa el feudo del {rival}.",
      "Fin del trayecto: {city}. A por los tres puntos.",
      "El {team} ya está en {city}. Toca competir.",
      "El {team} aterriza en {city} con tiempo para reconocer el terreno.",
      "Llegada en silencio; mañana no habrá margen de error frente al {rival}.",
      "Bienvenidos a {city}. El {rival} espera. El {team} también.",
      "Hotel, última reunión táctica, a descansar: el ritual de siempre en {city}.",
      "Primer vistazo a {city}: el {team} ya huele la competición.",
    ],
    // VIAJE DE VUELTA: reacciona al resultado ya jugado. {city}=ciudad rival,
    // {home}=ciudad propia, {score}=marcador en perspectiva del usuario (gf-ga).
    vuelta: {
      apertura: {
        win_big: [
          "La expedición del {team} sale de {city} con una goleada en el bolsillo.",
          "Fiesta en la salida de {city}: el {team} se va con un {score} de escándalo.",
          "Pocas veces se vuelve así de {city}; el {team} firmó un partido para enmarcar.",
          "El {team} abandona {city} con la sensación del deber sobradamente cumplido.",
        ],
        win: [
          "El {team} deja {city} con los tres puntos bien atados.",
          "Salida tranquila de {city}: victoria trabajada para el {team}.",
          "Misión cumplida en {city}; el {team} emprende la vuelta con una sonrisa.",
          "El {team} se va de {city} con un {score} de oro.",
        ],
        draw: [
          "El {team} sale de {city} con un punto y sensaciones encontradas.",
          "Reparto de puntos en {city}; el {team} vuelve sin saber muy bien a qué sabe.",
          "Empate en {city}: el {team} se va sin perder, pero con la sensación de que pudo ser más.",
          "Un punto en la maleta; el {team} abandona {city} en tablas.",
        ],
        loss: [
          "Salida silenciosa de {city}: el {team} cae por la mínima.",
          "El {team} deja {city} con las manos vacías y mala cara.",
          "Derrota ajustada en {city}; el {team} emprende la vuelta masticando el enfado.",
          "Poco que celebrar: el {team} se va de {city} con un {score} en contra.",
        ],
        loss_big: [
          "Noche para olvidar en {city}: el {team} sale escaldado tras el {score}.",
          "Silencio absoluto en la salida de {city}; al {team} le pasaron por encima.",
          "El {team} abandona {city} con una goleada a sus espaldas y mucho de que hablar.",
          "Vuelta cuesta arriba desde {city}: el {score} pesa como una losa.",
        ],
      },
      nucleo: {
        win_big: [
          "Dentro del grupo se respira euforia: días así son los que enganchan a esto.",
          "El míster pide calma, pero ni él disimula la sonrisa tras el {score}.",
          "Risas, música y móviles encendidos: el {team} disfruta de una tarde grande.",
          "Una exhibición como la de {city} se recuerda durante semanas en el vestuario.",
        ],
        win: [
          "Sabe a poco en el marcador, pero ganar fuera siempre tiene premio.",
          "El {team} conoce el valor de estos tres puntos lejos de casa.",
          "No fue brillante, pero fue eficaz; el grupo vuelve satisfecho de {city}.",
          "Tres puntos de visitante valen doble, y el vestuario lo sabe.",
        ],
        draw: [
          "En el grupo se debate si el punto sabe a poco o a rescate.",
          "El empate deja un regusto raro: ni alegría ni drama, pura igualdad.",
          "El míster rumia las ocasiones falladas durante todo el trayecto.",
          "Un punto fuera nunca sobra, aunque hoy el {team} esperaba más.",
        ],
        loss: [
          "El silencio lo dice todo: el {team} sabe que esta se escapó por poco.",
          "Caras largas y pocas palabras; la derrota de {city} duele por lo cerca que estuvo.",
          "El míster repasa una y otra vez la jugada que lo cambió todo.",
          "Enfado contenido en el grupo: perder por detalles es lo que más escuece.",
        ],
        loss_big: [
          "Nadie habla. La goleada de {city} obliga a mirarse al espejo.",
          "El {team} encaja el golpe en silencio; hay mucho que corregir.",
          "Viaje largo y amargo: el {score} deja heridas que tardarán en cerrar.",
          "El míster ya piensa en la semana de trabajo que viene; hoy no hay excusas.",
        ],
      },
      especial: {
        gesta_grande: [
          "Noche europea para enmarcar; el {team} vuelve a casa con una gesta bajo el brazo.",
          "De {city} a la historia: el {team} firma una victoria que se contará durante años.",
        ],
        bestia_caida: [
          "Por fin. El {team} rompe la maldición de {city} tras años sin ganar aquí.",
          "Cae el feudo maldito: el {team} se quita una espina clavada en {city}.",
        ],
        verdugo_caido: [
          "Revancha servida: el {team} por fin doblega a su verdugo, el {rival}.",
          "El {rival} dejó de ser un fantasma; el {team} se cobra viejas deudas.",
        ],
        salvacion: [
          "Oxígeno puro: ganar en la pelea por seguir vivos sabe a gloria.",
          "El {team} respira; tres puntos de oro en la lucha por la permanencia.",
        ],
        liderato_tocado: [
          "El liderato tiembla tras caer en {city}; la persecución aprieta.",
          "Pinchazo del líder en {city}; el {team} sabe que no puede repetirlo.",
        ],
        porteria_cero: [
          "Portería a cero y tres puntos: el {team} vuelve con el viaje redondo.",
          "Sin encajar y ganando; así da gusto viajar, piensa el {team}.",
        ],
      },
      cierre: {
        win: [
          "De vuelta en {home} con la satisfacción del trabajo bien hecho.",
          "El {team} llega a casa; a disfrutar de la victoria, que mañana se piensa en lo siguiente.",
          "Fin del viaje en {home}; noches como esta recargan las pilas.",
          "El {team} ya está en {home}, un poco más cerca de sus sueños.",
        ],
        draw: [
          "De vuelta en {home} con un punto y una lista de cosas por mejorar.",
          "El {team} llega a casa; ni tan mal ni tan bien, a seguir.",
          "Fin del trayecto en {home}: el empate ya es pasado, toca pensar en lo que viene.",
          "El {team} pisa {home} recordando que la temporada es muy larga.",
        ],
        loss: [
          "De vuelta en {home}. Toca levantarse: la temporada no espera.",
          "El {team} llega a casa con la derrota a cuestas, pero la cabeza ya en el próximo.",
          "Fin del viaje en {home}; de las noches duras también se aprende.",
          "El {team} pisa {home} con ganas de revancha cuanto antes.",
        ],
      },
    },
    // MEMORIA DE CARRERA: hitos de rivalidad acumulada (all-time, ambas sedes).
    // Se activan en el viaje de ida al alcanzar 5, 10, 15, 20 o 30 cruces históricos.
    // Variables: {team}, {rival}, {n} (número de encuentro).
    memoria: {
      hito_rival: {
        "5": [
          "Quinta vez que se cruzan {team} y {rival}. Ya tienen historia.",
          "Cinco cruces, y cada uno ha sido distinto. El duelo va tomando forma.",
          "El {rival} ya no es un desconocido: cinco capítulos de una rivalidad naciente.",
          "Quinta cita con el {rival}. El {team} empieza a conocer el terreno de memoria.",
        ],
        "10": [
          "Diez duelos entre {team} y {rival}. Esto ya es una rivalidad de verdad.",
          "Dos dígitos de enfrentamientos: {team} y {rival} escriben su décimo capítulo.",
          "Diez cruces dan para hablar de historia; {team} y {rival} ya la tienen.",
          "El décimo choque entre {team} y {rival}: diez capítulos y contando.",
        ],
        "15": [
          "Quince veces frente a frente. El {rival} ya sabe cómo piensa el {team}, y viceversa.",
          "Un capítulo más de un rival que ya forma parte del ADN del {team}.",
          "Quince encuentros no se tienen con cualquiera: el {rival} ya es parte de la historia.",
          "El {team} y el {rival} firman su capítulo número quince. El libro crece.",
        ],
        "20": [
          "Veinte duelos. Este choque ya tiene nombre propio en los libros del club.",
          "{team} vs {rival}: veinte capítulos de una rivalidad que no para de crecer.",
          "Dos décadas de enfrentamientos en números: esto ya es un clásico de verdad.",
          "El vigésimo cara a cara entre {team} y {rival}. Que siga.",
        ],
        "30": [
          "Treinta duelos. Una generación entera de fútbol entre {team} y {rival}.",
          "{team} y {rival}: treinta capítulos y una rivalidad que ya es historia viva.",
          "Treinta veces. Nadie que conozca al {team} puede no conocer al {rival}.",
          "Treinta enfrentamientos: la rivalidad con el {rival} ya forma parte del alma del {team}.",
        ],
      },
    },
  };

  // Crónica del partido: textos para cada partido jugado (casa o fuera).
  // Variables: {team}, {rival}, {score}, {gf}, {ga}, {player}, {comp}.
  D.CRONICA = {
    apertura: {
      win_big: [
        "{team} aplastó a {rival}. El {score} no deja lugar a interpretaciones.",
        "Noche de gala en {comp}: {team} golea {score} y manda un mensaje a toda la liga.",
        "Exhibición. El {team} se pasea por el campo del {rival} y firma un contundente {score}.",
        "Cuatro letras: go-lea-da. El {team} destroza al {rival} con un {score} que asusta.",
      ],
      win: [
        "El {team} suma tres puntos de oro ante el {rival}. {score} en el marcador.",
        "Trabajo cumplido. El {team} despacha al {rival} con un {score} que vale mucho.",
        "Victoria corta, mérito grande: el {team} supera al {rival} ({score}) en un partido exigente.",
        "{team}: 1, obstáculos: 0. El {score} da tres puntos que saben a ración doble.",
      ],
      draw: [
        "Tablas ante el {rival}. El {score} deja sensaciones encontradas en el vestuario del {team}.",
        "Punto y nada más. El {team} no pasa del empate {score} ante un {rival} que cerró bien.",
        "{score}: el marcador no miente, aunque el {team} mereció algo más.",
        "Empate de los que hacen pensar. El {rival} igualó un partido que el {team} creía ganado.",
      ],
      loss: [
        "Derrota para el {team}. El {rival} se impone por {score} en un mal día.",
        "El {rival} gana, el {team} pierde y reflexiona. El {score} duele más de lo que parece.",
        "Partido para olvidar: {score} y tres puntos que se quedaron del lado contrario.",
        "El {team} cayó ({score}). Pasa, duele y se supera. La próxima jornada es una nueva oportunidad.",
      ],
      loss_big: [
        "Noche negra. El {rival} barrió al {team} con un {score} que pide respuesta urgente.",
        "Goleada en contra: {score}. El {team} sale tocado de un partido que se fue de las manos.",
        "{score}. Hay que mirarlo a la cara y aceptarlo: el {team} fue superado en todos los registros.",
        "Un resultado que deja marca: {score}. El {team} paga caro una noche de demasiados errores.",
      ],
    },
    momento: {
      con_goleador: [
        "{player} firmó su tanto en el momento más justo. Ese es el gol de los tres puntos.",
        "El gol de {player} fue el punto de inflexión del partido.",
        "{player} apareció cuando el equipo más lo necesitaba. Una actuación para recordar.",
        "La diana de {player} resumió lo mejor de este {team}: un jugador, un momento, una victoria.",
      ],
      sin_goleador: [
        "El colectivo pesó más que cualquier individuo. Así gana este {team}.",
        "Partido de equipo, victoria de equipo. Sin figuras individuales, pero con carácter de grupo.",
        "Sin un goleador con nombre propio, el {team} encontró el camino igual: unidad.",
        "Cuando el sistema funciona, el nombre del goleador importa menos. El {team} lo sabe.",
      ],
      porteria_cero: [
        "Portería a cero: el {team} añadió una página limpia al libro de la temporada.",
        "La defensa fue la mejor noticia: cero goles encajados y una solidez de fiar.",
        "Cuando no encajas, das pasos de gigante. El {team} lo tiene muy claro.",
        "Muro atrás y eficacia delante. La fórmula que más gusta al cuerpo técnico.",
      ],
    },
    cierre: {
      win: [
        "La racha sigue. Próximo rival, ojo.",
        "El camino continúa. El {team} suma y sigue.",
        "Tres puntos en el bolsillo y el vestuario con ganas de más.",
        "Así se construye algo grande: partido a partido, sin mirar atrás.",
      ],
      draw: [
        "Toca pasar página y enfocar el siguiente partido.",
        "El punto suma, pero el {team} sabe que puede dar más.",
        "En fútbol, un empate puede ser un paso adelante o uno atrás. El tiempo dirá.",
        "A por el próximo. No queda otra.",
      ],
      loss: [
        "Duele ahora; mañana, a entrenar y a responder.",
        "El fútbol siempre da revancha. El {team} la buscará.",
        "Una derrota no hace una temporada. El {team} lo sabe.",
        "Hay que levantarse. Siempre.",
      ],
    },
  };

  FC.data = D;
})();
