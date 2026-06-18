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
      check:(c)=> (c.matches||[]).length >= 1 },
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

  FC.data = D;
})();
