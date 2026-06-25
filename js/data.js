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

  /* ---------- Colores oficiales por equipo ---------- */
  D.TEAM_COLORS = {
    // Premier League
    "Arsenal":{primary:"#EF0107",secondary:"#FFFFFF"},
    "Aston Villa":{primary:"#670E36",secondary:"#95BFE5"},
    "Bournemouth":{primary:"#DA291C",secondary:"#000000"},
    "Brentford":{primary:"#E30613",secondary:"#FFFFFF"},
    "Brighton":{primary:"#0057B8",secondary:"#FFFFFF"},
    "Burnley":{primary:"#6C1D45",secondary:"#99D6EA"},
    "Chelsea":{primary:"#034694",secondary:"#FFFFFF"},
    "Crystal Palace":{primary:"#1B458F",secondary:"#C4122E"},
    "Everton":{primary:"#003399",secondary:"#FFFFFF"},
    "Fulham":{primary:"#FFFFFF",secondary:"#000000"},
    "Leeds United":{primary:"#FFFFFF",secondary:"#1D428A"},
    "Liverpool":{primary:"#C8102E",secondary:"#F6EB61"},
    "Manchester City":{primary:"#6CABDD",secondary:"#1C2C5B"},
    "Manchester United":{primary:"#DA291C",secondary:"#FBE122"},
    "Newcastle United":{primary:"#241F20",secondary:"#FFFFFF"},
    "Nottingham Forest":{primary:"#DD0000",secondary:"#FFFFFF"},
    "Sunderland":{primary:"#EB172B",secondary:"#000000"},
    "Tottenham Hotspur":{primary:"#132257",secondary:"#FFFFFF"},
    "West Ham United":{primary:"#7A263A",secondary:"#1BB1E7"},
    "Wolverhampton Wanderers":{primary:"#FDB913",secondary:"#231F20"},
    // LaLiga
    "Alavés":{primary:"#1A4E8F",secondary:"#FFFFFF"},
    "Athletic Club":{primary:"#EE2523",secondary:"#FFFFFF"},
    "Atlético de Madrid":{primary:"#CB3524",secondary:"#2B4196"},
    "Barcelona":{primary:"#A50044",secondary:"#004D98"},
    "Celta de Vigo":{primary:"#6CADDF",secondary:"#FFFFFF"},
    "Elche":{primary:"#007A3D",secondary:"#FFFFFF"},
    "Espanyol":{primary:"#0070B8",secondary:"#FFFFFF"},
    "Getafe":{primary:"#005999",secondary:"#FFFFFF"},
    "Girona":{primary:"#CC0000",secondary:"#FFFFFF"},
    "Levante":{primary:"#044FA0",secondary:"#D2122E"},
    "Mallorca":{primary:"#D2122E",secondary:"#000000"},
    "Osasuna":{primary:"#C8102E",secondary:"#003DA5"},
    "Rayo Vallecano":{primary:"#FFFFFF",secondary:"#E8111A"},
    "Real Betis":{primary:"#00954C",secondary:"#FFFFFF"},
    "Real Madrid":{primary:"#FFFFFF",secondary:"#00529F"},
    "Real Oviedo":{primary:"#003DA5",secondary:"#FFFFFF"},
    "Real Sociedad":{primary:"#0067B1",secondary:"#FFFFFF"},
    "Sevilla":{primary:"#FFFFFF",secondary:"#D2122E"},
    "Valencia":{primary:"#FFFFFF",secondary:"#F4A71D"},
    "Villarreal":{primary:"#F9E300",secondary:"#005689"},
    // Serie A
    "Atalanta":{primary:"#1E3C87",secondary:"#000000"},
    "Bologna":{primary:"#B4121B",secondary:"#002F5F"},
    "Cagliari":{primary:"#C5152B",secondary:"#002F5F"},
    "Como":{primary:"#002B7F",secondary:"#FFFFFF"},
    "Cremonese":{primary:"#D2122E",secondary:"#F4A71D"},
    "Fiorentina":{primary:"#4B1884",secondary:"#FFFFFF"},
    "Genoa":{primary:"#C8102E",secondary:"#002F6C"},
    "Inter":{primary:"#010E80",secondary:"#000000"},
    "Juventus":{primary:"#000000",secondary:"#FFFFFF"},
    "Lazio":{primary:"#87CEEB",secondary:"#FFFFFF"},
    "Lecce":{primary:"#D4AF37",secondary:"#8B0000"},
    "Milan":{primary:"#AC0000",secondary:"#000000"},
    "Napoli":{primary:"#12A0C3",secondary:"#FFFFFF"},
    "Parma":{primary:"#F9E300",secondary:"#002F5F"},
    "Pisa":{primary:"#001F5C",secondary:"#000000"},
    "Roma":{primary:"#8E1F2F",secondary:"#F4A71D"},
    "Sassuolo":{primary:"#00773C",secondary:"#000000"},
    "Torino":{primary:"#6B1929",secondary:"#FFFFFF"},
    "Udinese":{primary:"#000000",secondary:"#FFFFFF"},
    "Hellas Verona":{primary:"#003DA5",secondary:"#F4D01C"},
    // Bundesliga
    "Bayern Múnich":{primary:"#DC052D",secondary:"#FFFFFF"},
    "Borussia Dortmund":{primary:"#FDE100",secondary:"#000000"},
    "RB Leipzig":{primary:"#CC0000",secondary:"#FFFFFF"},
    "Bayer Leverkusen":{primary:"#E32221",secondary:"#000000"},
    "Eintracht Frankfurt":{primary:"#E1000F",secondary:"#000000"},
    "VfB Stuttgart":{primary:"#E32219",secondary:"#FFFFFF"},
    "SC Freiburg":{primary:"#CC0000",secondary:"#000000"},
    "Werder Bremen":{primary:"#1D8348",secondary:"#FFFFFF"},
    "FC Augsburg":{primary:"#BA3733",secondary:"#007A47"},
    "VfL Wolfsburg":{primary:"#65B32E",secondary:"#003D58"},
    "Borussia Mönchengladbach":{primary:"#000000",secondary:"#FFFFFF"},
    "Mainz 05":{primary:"#C41E3A",secondary:"#FFFFFF"},
    "Union Berlin":{primary:"#EB1C24",secondary:"#FFFFFF"},
    "TSG Hoffenheim":{primary:"#0067A5",secondary:"#FFFFFF"},
    "FC St. Pauli":{primary:"#7B3F00",secondary:"#FFFFFF"},
    "1. FC Heidenheim":{primary:"#CC0000",secondary:"#004A97"},
    "1. FC Köln":{primary:"#FFFFFF",secondary:"#E3000F"},
    "Hamburgo SV":{primary:"#005CA9",secondary:"#FFFFFF"},
    // Ligue 1
    "Paris Saint-Germain":{primary:"#004170",secondary:"#DA291C"},
    "Marsella":{primary:"#009FC3",secondary:"#FFFFFF"},
    "Mónaco":{primary:"#CE1126",secondary:"#FFFFFF"},
    "Niza":{primary:"#000000",secondary:"#DD0000"},
    "Lille":{primary:"#E2001A",secondary:"#FFFFFF"},
    "Lyon":{primary:"#002F6C",secondary:"#FFFFFF"},
    "Lens":{primary:"#F0C416",secondary:"#E2001A"},
    "Rennes":{primary:"#000000",secondary:"#E2001A"},
    "Estrasburgo":{primary:"#006AB4",secondary:"#FFFFFF"},
    "Nantes":{primary:"#F4C700",secondary:"#005FAA"},
    "Brest":{primary:"#FFFFFF",secondary:"#E2001A"},
    "Toulouse":{primary:"#6B1FA9",secondary:"#FFFFFF"},
    "Auxerre":{primary:"#FFFFFF",secondary:"#003399"},
    "Le Havre":{primary:"#003189",secondary:"#FFFFFF"},
    "Angers":{primary:"#000000",secondary:"#FFFFFF"},
    "Lorient":{primary:"#F7931E",secondary:"#000000"},
    "Paris FC":{primary:"#003399",secondary:"#FFFFFF"},
    "Metz":{primary:"#7B1127",secondary:"#F4D01C"},
  };

  /* ---------- Fuerza base por club (rating tipo media de equipo, ~60-91) ----------
     Alimenta el simulador del mercado de apuestas: a mayor fuerza, más favorito.
     Mismas claves que TEAM_COLORS (búsqueda difusa). Clubes no catalogados → 72. */
  D.TEAM_STRENGTH = {
    // Premier League
    "Arsenal":88,"Aston Villa":82,"Bournemouth":78,"Brentford":77,"Brighton":80,"Burnley":73,
    "Chelsea":84,"Crystal Palace":78,"Everton":76,"Fulham":77,"Leeds United":75,"Liverpool":88,
    "Manchester City":90,"Manchester United":83,"Newcastle United":83,"Nottingham Forest":78,
    "Sunderland":73,"Tottenham Hotspur":83,"West Ham United":78,"Wolverhampton Wanderers":76,
    // LaLiga
    "Alavés":73,"Athletic Club":81,"Atlético de Madrid":85,"Barcelona":88,"Celta de Vigo":76,
    "Elche":72,"Espanyol":74,"Getafe":75,"Girona":77,"Levante":72,"Mallorca":74,"Osasuna":75,
    "Rayo Vallecano":75,"Real Betis":79,"Real Madrid":90,"Real Oviedo":71,"Real Sociedad":80,
    "Sevilla":78,"Valencia":77,"Villarreal":80,
    // Serie A
    "Atalanta":84,"Bologna":79,"Cagliari":74,"Como":76,"Cremonese":72,"Fiorentina":80,"Genoa":75,
    "Inter":87,"Juventus":84,"Lazio":81,"Lecce":73,"Milan":84,"Napoli":86,"Parma":74,"Pisa":72,
    "Roma":82,"Sassuolo":73,"Torino":77,"Udinese":76,"Hellas Verona":73,
    // Bundesliga
    "Bayern Múnich":89,"Borussia Dortmund":84,"RB Leipzig":83,"Bayer Leverkusen":85,
    "Eintracht Frankfurt":80,"VfB Stuttgart":81,"SC Freiburg":78,"Werder Bremen":77,"FC Augsburg":75,
    "VfL Wolfsburg":77,"Borussia Mönchengladbach":77,"Mainz 05":76,"Union Berlin":76,
    "TSG Hoffenheim":76,"FC St. Pauli":73,"1. FC Heidenheim":73,"1. FC Köln":74,"Hamburgo SV":73,
    // Ligue 1
    "Paris Saint-Germain":89,"Marsella":82,"Mónaco":82,"Niza":79,"Lille":80,"Lyon":80,"Lens":78,
    "Rennes":78,"Estrasburgo":76,"Nantes":75,"Brest":76,"Toulouse":76,"Auxerre":73,"Le Havre":73,
    "Angers":72,"Lorient":73,"Paris FC":73,"Metz":72,
  };

  /* ---------- Casas de apuestas ficticias (pool rotativo, sin repeticiones) ---------- */
  D.BOOKMAKERS = ["BetMáxima","GoolBet","Tipster365","ApuestaTotal","LiniaPro","GolazoBet",
    "OddsArena","JugadaMax","EstadioBet","PrimeraApuesta","MarcaBet","RemonteBet"];

  /* ---------- Tipsters / expertos de apuestas (pool rotativo, sin repeticiones) ---------- */
  D.TIPSTERS = [
    {n:"El Profe Vázquez",p:"YouTube"},{n:"BetAnalysis_ES",p:"Twitter/X"},
    {n:"Carlos Línea",p:"Telegram"},{n:"La Quiniela Pro",p:"Podcast"},
    {n:"Matías Odd",p:"YouTube"},{n:"Rodrigo_Picks",p:"Twitter/X"},
    {n:"El Marcador Exacto",p:"Instagram"},{n:"GoolAnalytics",p:"YouTube"},
    {n:"Rosario Apuesta",p:"Telegram"},{n:"El Pronosticador FC",p:"Podcast"},
    {n:"NúmerosFútbol",p:"Twitter/X"},{n:"Javier Hándicap",p:"YouTube"},
    {n:"EstadísticaBet",p:"Twitter/X"},{n:"La Triple Chance",p:"Podcast"},
    {n:"OddHunter_ES",p:"Telegram"},{n:"Toni Cuota",p:"Instagram"},
    {n:"Apuestas360",p:"YouTube"},{n:"MarcaProno",p:"Twitter/X"},
    {n:"ValueBet_Nando",p:"Telegram"},{n:"El Hándicap Express",p:"Podcast"},
  ];

  /* ---------- Competiciones (catálogo de EA Sports FC 26) ----------
     Agrupadas para el desplegable. Licencias FC 26: UEFA (Champions/Europa/
     Conference/Super Cup) + CONMEBOL (Libertadores/Sudamericana/Recopa) + copas de
     Inglaterra/Italia/Alemania/Francia. FC 26 NO licencia Copa del Rey/Supercopa de
     España (el acuerdo con la RFEF de dic-2025 es patrocinio, no competición; quizá
     en FC 27) ni torneos de selecciones reales: el único es "The World's Game"
     (Mundial NO oficial de 48 selecciones, update post-lanzamiento). Aun así
     incluimos los NOMBRES REALES (Copa del Rey, Mundial, Eurocopa...) para narrar. */
  // Copas/supercopas domésticas reales por país (nombre correcto según tu liga).
  D.DOMESTIC_CUPS = {
    "Inglaterra": ["FA Cup", "Carabao Cup", "Community Shield"],
    "España": ["Copa del Rey", "Supercopa de España"],
    "Italia": ["Coppa Italia", "Supercoppa Italiana"],
    "Alemania": ["DFB-Pokal", "DFL-Supercup"],
    "Francia": ["Coupe de France", "Trophée des Champions"],
    "Países Bajos": ["KNVB Beker", "Johan Cruyff Schaal"],
    "Portugal": ["Taça de Portugal", "Taça da Liga", "Supertaça"],
    "Turquía": ["Copa de Turquía", "Supercopa de Turquía"],
    "Escocia": ["Scottish Cup", "Scottish League Cup"],
    "Irlanda": ["FAI Cup", "President's Cup"],
    "Bélgica": ["Copa de Bélgica", "Supercopa de Bélgica"],
    "Dinamarca": ["Copa de Dinamarca"],
    "Suecia": ["Copa de Suecia"],
    "Noruega": ["Copa de Noruega"],
    "Austria": ["Copa de Austria"],
    "Suiza": ["Copa de Suiza"],
    "Polonia": ["Copa de Polonia", "Supercopa de Polonia"],
    "Arabia Saudí": ["Copa del Rey de Campeones", "Supercopa de Arabia"],
    "EE. UU. / Canadá": ["US Open Cup", "MLS Cup"],
    "México": ["Copa MX", "Campeón de Campeones"],
    "Argentina": ["Copa Argentina", "Trofeo de Campeones"],
    "Australia": ["Australia Cup"],
    "Corea del Sur": ["Copa FA de Corea"],
  };
  // Continentales de CLUBES (UEFA + CONMEBOL): vuelos, logros y palmarés.
  D.CONTINENTAL = ["Champions League", "Europa League", "Conference League", "Supercopa de Europa",
    "Libertadores", "Sudamericana", "Recopa"];
  // Competiciones de SELECCIONES (internacionales): vuelos de selección y narrativa.
  D.INTERNATIONAL = ["Mundial", "Eurocopa", "Copa América", "Nations League", "Finalissima",
    "Clasificación", "Amistoso internacional"];
  // Grupos del desplegable, con las copas del país de la carrera inyectadas.
  D.compGroupsFor = function (country) {
    const dc = (D.DOMESTIC_CUPS[country] || ["Copa nacional", "Supercopa nacional"]).slice();
    return [
      { group: "Doméstico", items: ["Liga"].concat(dc).concat(["Play-off de ascenso", "Amistoso"]) },
      { group: "Europa · UEFA", items: ["UEFA Champions League", "UEFA Europa League", "UEFA Conference League", "Supercopa de Europa"] },
      { group: "Sudamérica · CONMEBOL", items: ["CONMEBOL Libertadores", "CONMEBOL Sudamericana", "Recopa Sudamericana"] },
      { group: "Selecciones", items: ["Mundial", "Eurocopa", "Copa América", "UEFA Nations League", "Finalissima", "Clasificación Mundial", "Clasificación Eurocopa", "Amistoso internacional"] },
      { group: "Femenino", items: ["UEFA Women's Champions League"] },
    ];
  };
  // Lista plana (compatibilidad / datalists). Genérica, sin país.
  D.COMPETITIONS = D.compGroupsFor(null).reduce((a, g) => a.concat(g.items), []);
  // Clasificadores de competición (compartidos por logros, palmarés y viajes).
  D.isContinental = (comp) => { comp = String(comp || ""); return D.CONTINENTAL.some(cc => comp.includes(cc)); };
  D.isInternational = (comp) => { comp = String(comp || ""); return D.INTERNATIONAL.some(cc => comp.includes(cc)); };
  D._cupWord = /(copa|coppa|coupe|pokal|beker|taça|taca|supercup|schaal|\bcup\b)/i;
  D.isDomesticCup = (comp) => { comp = String(comp || ""); return D._cupWord.test(comp) && !D.isContinental(comp) && !D.isInternational(comp); };

  /* ---------- Ligas seed (catálogo de EA Sports FC 26, plantillas 2025/26) ----------
     Cada liga lleva `group` para agrupar el desplegable por región. Las plantillas
     son orientativas (editables por el usuario); priorizan clubes reconocibles. */
  D.LEAGUES = [
    // —— Inglaterra ——
    { id: "eng-pl", name: "Premier League", country: "Inglaterra", group: "Inglaterra", teams: ["Arsenal","Aston Villa","Bournemouth","Brentford","Brighton","Burnley","Chelsea","Crystal Palace","Everton","Fulham","Leeds United","Liverpool","Manchester City","Manchester United","Newcastle United","Nottingham Forest","Sunderland","Tottenham Hotspur","West Ham United","Wolverhampton Wanderers"] },
    { id: "eng-champ", name: "EFL Championship", country: "Inglaterra", group: "Inglaterra", teams: ["Leicester City","Southampton","Ipswich Town","West Bromwich Albion","Norwich City","Coventry City","Middlesbrough","Hull City","Sheffield United","Sheffield Wednesday","Watford","Bristol City","Preston North End","Stoke City","Millwall","Swansea City","Blackburn Rovers","Queens Park Rangers","Derby County","Portsmouth","Oxford United","Wrexham","Charlton Athletic","Birmingham City"] },
    { id: "eng-l1", name: "EFL League One", country: "Inglaterra", group: "Inglaterra", teams: ["Bolton Wanderers","Wigan Athletic","Barnsley","Huddersfield Town","Reading","Stockport County","Wycombe Wanderers","Lincoln City","Leyton Orient","Blackpool","Mansfield Town","Peterborough United","Burton Albion","Northampton Town","Rotherham United","Cardiff City","Plymouth Argyle","Luton Town","Stevenage","Bradford City","Exeter City","Port Vale","Doncaster Rovers","AFC Wimbledon"] },
    { id: "eng-l2", name: "EFL League Two", country: "Inglaterra", group: "Inglaterra", teams: ["Notts County","Bristol Rovers","Walsall","Chesterfield","Gillingham","Milton Keynes Dons","Colchester United","Crewe Alexandra","Salford City","Swindon Town","Bromley","Grimsby Town","Newport County","Crawley Town","Accrington Stanley","Harrogate Town","Tranmere Rovers","Cheltenham Town","Barrow","Fleetwood Town","Barnet","Oldham Athletic","Shrewsbury Town","Cambridge United"] },
    // —— España ——
    { id: "esp-laliga", name: "LaLiga EA Sports", country: "España", group: "España", teams: ["Alavés","Athletic Club","Atlético de Madrid","Barcelona","Celta de Vigo","Elche","Espanyol","Getafe","Girona","Levante","Mallorca","Osasuna","Rayo Vallecano","Real Betis","Real Madrid","Real Oviedo","Real Sociedad","Sevilla","Valencia","Villarreal"] },
    { id: "esp-hypermotion", name: "LaLiga Hypermotion", country: "España", group: "España", teams: ["Almería","Cádiz","Eibar","Granada","Las Palmas","Leganés","Real Valladolid","Huesca","Sporting de Gijón","Real Zaragoza","Racing de Santander","Burgos","Albacete","Mirandés","Castellón","Córdoba","Deportivo de La Coruña","Málaga","Andorra","Cultural Leonesa","Real Sociedad B","Ceuta"] },
    // —— Italia ——
    { id: "ita-seriea", name: "Serie A", country: "Italia", group: "Italia", teams: ["Atalanta","Bologna","Cagliari","Como","Cremonese","Fiorentina","Genoa","Inter","Juventus","Lazio","Lecce","Milan","Napoli","Parma","Pisa","Roma","Sassuolo","Torino","Udinese","Hellas Verona"] },
    // —— Alemania ——
    { id: "ger-bundesliga", name: "Bundesliga", country: "Alemania", group: "Alemania", teams: ["Bayern Múnich","Borussia Dortmund","RB Leipzig","Bayer Leverkusen","Eintracht Frankfurt","VfB Stuttgart","SC Freiburg","Werder Bremen","FC Augsburg","VfL Wolfsburg","Borussia Mönchengladbach","Mainz 05","Union Berlin","TSG Hoffenheim","FC St. Pauli","1. FC Heidenheim","1. FC Köln","Hamburgo SV"] },
    { id: "ger-2bundesliga", name: "2. Bundesliga", country: "Alemania", group: "Alemania", teams: ["Hertha BSC","Schalke 04","Fortuna Düsseldorf","1. FC Nürnberg","Karlsruher SC","Hannover 96","SC Paderborn","SV Darmstadt 98","Holstein Kiel","1. FC Kaiserslautern","Greuther Fürth","SV Elversberg","1. FC Magdeburg","Eintracht Braunschweig","Preußen Münster","Arminia Bielefeld","VfL Bochum","Dynamo Dresden"] },
    // —— Francia ——
    { id: "fra-ligue1", name: "Ligue 1", country: "Francia", group: "Francia", teams: ["Paris Saint-Germain","Marsella","Mónaco","Niza","Lille","Lyon","Lens","Rennes","Estrasburgo","Nantes","Brest","Toulouse","Auxerre","Le Havre","Angers","Lorient","Paris FC","Metz"] },
    { id: "fra-ligue2", name: "Ligue 2", country: "Francia", group: "Francia", teams: ["Saint-Étienne","Guingamp","Bastia","Le Mans","Grenoble","Amiens","Troyes","Laval","Rodez","Pau","Annecy","Clermont Foot","Red Star","Montpellier","Reims","Boulogne","Dunkerque","Nancy"] },
    // —— Resto de Europa ——
    { id: "ned-eredivisie", name: "Eredivisie", country: "Países Bajos", group: "Resto de Europa", teams: ["Ajax","PSV","Feyenoord","AZ Alkmaar","FC Twente","FC Utrecht","Heerenveen","Go Ahead Eagles","Sparta Rotterdam","NEC Nijmegen","FC Groningen","Fortuna Sittard","PEC Zwolle","Heracles Almelo","Telstar","NAC Breda","Excelsior","FC Volendam"] },
    { id: "por-ligaportugal", name: "Liga Portugal", country: "Portugal", group: "Resto de Europa", teams: ["Benfica","Porto","Sporting CP","Braga","Vitória SC","Famalicão","Moreirense","Gil Vicente","Santa Clara","Rio Ave","Estoril","Casa Pia","Arouca","Estrela Amadora","Nacional","AVS","Tondela","Alverca"] },
    { id: "tur-superlig", name: "Süper Lig", country: "Turquía", group: "Resto de Europa", teams: ["Galatasaray","Fenerbahçe","Beşiktaş","Trabzonspor","Başakşehir","Konyaspor","Antalyaspor","Alanyaspor","Kayserispor","Samsunspor","Çaykur Rizespor","Göztepe","Kasımpaşa","Gaziantep FK","Eyüpspor","Karagümrük","Kocaelispor","Gençlerbirliği"] },
    { id: "sco-premiership", name: "Scottish Premiership", country: "Escocia", group: "Resto de Europa", teams: ["Celtic","Rangers","Aberdeen","Heart of Midlothian","Hibernian","Dundee United","Dundee","Motherwell","St Mirren","Kilmarnock","Falkirk","Livingston"] },
    { id: "bel-proleague", name: "Pro League", country: "Bélgica", group: "Resto de Europa", teams: ["Club Brugge","Anderlecht","Royal Antwerp","Genk","Gent","Union Saint-Gilloise","Standard Liège","Cercle Brugge","Charleroi","Mechelen","Westerlo","OH Leuven","Sint-Truiden","Dender","Zulte Waregem","RAAL La Louvière"] },
    { id: "irl-loi", name: "League of Ireland Premier", country: "Irlanda", group: "Resto de Europa", teams: ["Shamrock Rovers","Shelbourne","Derry City","Bohemians","St Patrick's Athletic","Galway United","Drogheda United","Sligo Rovers","Waterford","Cork City"] },
    { id: "den-superliga", name: "Superliga", country: "Dinamarca", group: "Resto de Europa", teams: ["FC Copenhagen","FC Midtjylland","Brøndby","AGF","Nordsjælland","Silkeborg","Viborg","Randers","SønderjyskE","Vejle","OB","Fredericia"] },
    { id: "swe-allsvenskan", name: "Allsvenskan", country: "Suecia", group: "Resto de Europa", teams: ["Malmö FF","AIK","Djurgården","Hammarby","IFK Göteborg","IF Elfsborg","BK Häcken","IFK Norrköping","Öster","Halmstad","Mjällby","GAIS","IK Sirius","Värnamo","Brommapojkarna","Degerfors"] },
    { id: "nor-eliteserien", name: "Eliteserien", country: "Noruega", group: "Resto de Europa", teams: ["Bodø/Glimt","Molde","Rosenborg","Brann","Viking","Bryne","Vålerenga","Strømsgodset","Sarpsborg 08","Tromsø","Haugesund","Fredrikstad","KFUM Oslo","Kristiansund","Sandefjord","HamKam"] },
    { id: "aut-bundesliga", name: "Bundesliga (Austria)", country: "Austria", group: "Resto de Europa", teams: ["Red Bull Salzburg","Sturm Graz","Rapid Wien","Austria Wien","LASK","Wolfsberger AC","TSV Hartberg","WSG Tirol","SV Ried","Blau-Weiß Linz","Grazer AK","SCR Altach"] },
    { id: "sui-superleague", name: "Super League (Suiza)", country: "Suiza", group: "Resto de Europa", teams: ["Young Boys","Basel","Servette","Lugano","FC Zürich","Lausanne-Sport","St. Gallen","Luzern","Sion","Grasshopper","Thun","Winterthur"] },
    { id: "pol-ekstraklasa", name: "Ekstraklasa", country: "Polonia", group: "Resto de Europa", teams: ["Lech Poznań","Legia Warszawa","Jagiellonia Białystok","Raków Częstochowa","Pogoń Szczecin","Górnik Zabrze","Wisła Płock","Cracovia","Widzew Łódź","Piast Gliwice","Korona Kielce","Zagłębie Lubin","Lechia Gdańsk","Motor Lublin","Radomiak Radom","GKS Katowice","Arka Gdynia","Bruk-Bet Termalica"] },
    // —— Resto del mundo ——
    { id: "sau-prolegaue", name: "Roshn Saudi League", country: "Arabia Saudí", group: "Resto del mundo", teams: ["Al-Hilal","Al-Nassr","Al-Ittihad","Al-Ahli","Al-Ettifaq","Al-Shabab","Al-Taawoun","Al-Fateh","Al-Khaleej","Al-Fayha","Al-Riyadh","Al-Qadsiah","Al-Okhdood","Al-Hazem","Damac","Neom","Al-Kholood","Al-Najma"] },
    { id: "usa-mls", name: "MLS", country: "EE. UU. / Canadá", group: "Resto del mundo", teams: ["Inter Miami","LA Galaxy","Los Angeles FC","Seattle Sounders","Atlanta United","Austin FC","Columbus Crew","FC Cincinnati","New York City FC","New York Red Bulls","Philadelphia Union","Toronto FC","Portland Timbers","Sporting Kansas City","Nashville SC","Orlando City","Real Salt Lake","Houston Dynamo","Minnesota United","Chicago Fire","FC Dallas","Colorado Rapids","San Diego FC","St. Louis City","Charlotte FC","D.C. United","New England Revolution","Vancouver Whitecaps","CF Montréal","San Jose Earthquakes"] },
    { id: "mex-ligamx", name: "Liga BBVA MX", country: "México", group: "Resto del mundo", teams: ["Club América","Guadalajara","Cruz Azul","Pumas UNAM","Monterrey","Tigres UANL","Toluca","Santos Laguna","León","Pachuca","Atlas","Necaxa","Querétaro","Puebla","Mazatlán","Atlético San Luis","FC Juárez","Tijuana"] },
    { id: "arg-ligaprofesional", name: "Liga Profesional", country: "Argentina", group: "Resto del mundo", teams: ["River Plate","Boca Juniors","Racing","Independiente","San Lorenzo","Estudiantes","Vélez Sarsfield","Talleres","Argentinos Juniors","Rosario Central","Newell's Old Boys","Lanús","Defensa y Justicia","Huracán","Banfield","Gimnasia y Esgrima","Belgrano","Instituto","Godoy Cruz","Tigre","Platense","Barracas Central","Central Córdoba","Deportivo Riestra","Independiente Rivadavia","Sarmiento","Unión","Atlético Tucumán","Aldosivi","San Martín (San Juan)"] },
    { id: "aus-aleague", name: "A-League Men", country: "Australia", group: "Resto del mundo", teams: ["Melbourne City","Melbourne Victory","Sydney FC","Western Sydney Wanderers","Central Coast Mariners","Adelaide United","Brisbane Roar","Wellington Phoenix","Macarthur FC","Perth Glory","Newcastle Jets","Auckland FC"] },
    { id: "kor-kleague", name: "K League 1", country: "Corea del Sur", group: "Resto del mundo", teams: ["Ulsan HD","Jeonbuk Hyundai Motors","FC Seoul","Pohang Steelers","Gangwon FC","Gwangju FC","Suwon FC","Daejeon Hana Citizen","Gimcheon Sangmu","Jeju SK","FC Anyang","Daegu FC"] },
    // —— Otros ——
    { id: "custom", name: "Liga personalizada", country: "—", group: "Otros", teams: [] },
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
      check:(c)=> (c.trophies||[]).some(t => D.isDomesticCup(t.competition) && t.result === "winner") },
    { id:"continental", name:"Gloria continental", emoji:"🌟", tier:"gold", desc:"Gana una competición continental (Champions, Europa, Conference o Libertadores).",
      check:(c)=> (c.trophies||[]).some(t => D.isContinental(t.competition) && t.result === "winner") },
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
     VESTUARIO — sucesos de la vida del club (FC.incidents).
     Plantillas con {slots} que el motor rellena con jugadores REALES de
     la plantilla y escapa con U.esc. Slots: {p1} {p2} (jugadores),
     {club} (club externo, rumores), {team} (tu club), {pos} (demarcación).
     El motor elige el jugador adecuado por categoría (veterano, joven,
     estrella, suplente) y evita repetir el tipo del último suceso.
     ============================================================ */
  D.VESTUARIO = {
    conflicto: [
      "{p1} y {p2} protagonizaron un rifirrafe en el vestuario tras el entrenamiento.",
      "Tensión en la ciudad deportiva: {p1} y {p2} tuvieron que ser separados.",
      "{p1} y {p2} se enzarzaron en una discusión que encendió al vestuario.",
      "Saltaron chispas entre {p1} y {p2} en el entrenamiento de hoy.",
      "El cuerpo técnico tuvo que mediar entre {p1} y {p2} tras un cruce de palabras.",
      "{p1} y {p2} acabaron a gritos en un ejercicio subido de tono.",
      "Roce entre {p1} y {p2}: en las redes ya hablan de divisiones en el grupo.",
      "Un entrenamiento se calentó de más y {p1} y {p2} casi llegan a las manos.",
    ],
    bajon_minutos: [
      "{p1} no esconde su malestar por la falta de minutos.",
      "{p1} ha pedido explicaciones por su papel de suplente.",
      "El entorno de {p1} desliza que no está cómodo con su rol.",
      "{p1} se plantea su futuro si la situación no cambia.",
      "Cara larga de {p1}: quiere más protagonismo en el once.",
      "{p1} habría comunicado al técnico su deseo de jugar más.",
      "Murmullos sobre {p1}, harto de calentar el banquillo.",
    ],
    liderazgo: [
      "{p1} reunió al grupo para una charla en un momento delicado.",
      "{p1} ejerce de capitán y mete en cintura al vestuario.",
      "Gesto de líder: {p1} dio la cara por sus compañeros ante el técnico.",
      "{p1} tira del carro y mantiene la unidad del equipo.",
      "El vestuario respira el liderazgo silencioso de {p1}.",
      "{p1} se echó al equipo a la espalda en la charla previa.",
      "Cuando las cosas se tuercen, {p1} es el primero en levantar la voz.",
    ],
    promesa: [
      "{p1} está dejando con la boca abierta al cuerpo técnico en los entrenamientos.",
      "La perla {p1} se gana a pulso un sitio en el primer equipo.",
      "{p1} apunta maneras: el filial se le queda pequeño.",
      "Todos hablan de {p1} en la ciudad deportiva.",
      "{p1} entrena con la madurez de un veterano pese a su juventud.",
      "El técnico no le quita ojo a {p1} en cada sesión.",
      "{p1} sorprende a propios y extraños en los entrenamientos.",
    ],
    interes: [
      "El {club} habría preguntado por la situación de {p1}.",
      "{p1} gusta, y mucho, en las oficinas del {club}.",
      "Rumores de mercado: el {club} sigue de cerca a {p1}.",
      "El {club} tantea el terreno por {p1}.",
      "{p1} aparece en la agenda del {club} de cara al mercado.",
      "Sondeo del {club}: quieren saber el precio de {p1}.",
      "Ojeadores del {club} han seguido los últimos partidos de {p1}.",
    ],
    vinculo: [
      "{p1} y {p2} se han vuelto inseparables dentro y fuera del campo.",
      "La sociedad entre {p1} y {p2} también funciona en el vestuario.",
      "{p1} y {p2} comparten hasta el café: el grupo lo agradece.",
      "Buena química entre {p1} y {p2}, y se nota en los entrenos.",
      "{p1} ha tomado a {p2} bajo su ala.",
      "{p1} y {p2} forman la pareja de moda en la ciudad deportiva.",
    ],
    disciplina: [
      "{p1} llegó tarde al entrenamiento y el técnico no se lo perdonó.",
      "Tirón de orejas a {p1} por saltarse el protocolo del club.",
      "{p1} fue apartado un día por un asunto disciplinario.",
      "El club multó a {p1} por llegar tarde a la concentración.",
      "{p1} se ganó una reprimenda por su actitud en el entrenamiento.",
      "Toque de atención interno a {p1}: la disciplina es innegociable.",
    ],
    prensa: [
      "{p1} levantó polvareda con unas declaraciones a la prensa.",
      "Las palabras de {p1} en rueda de prensa dan que hablar.",
      "{p1} encendió a la afición con una entrevista polémica.",
      "Revuelo mediático por unas frases de {p1}.",
      "{p1} tuvo que matizar sus declaraciones del día anterior.",
      "El club pidió calma tras la entrevista de {p1}.",
    ],
    ambiente: [
      "El vestuario del {team} vive un momento de máxima unión.",
      "Ambiente inmejorable en la ciudad deportiva esta semana.",
      "La plantilla organizó una comida para reforzar la piña.",
      "Se respira optimismo en el vestuario del {team}.",
      "El grupo hace piña y el técnico lo agradece.",
      "Buen rollo en los entrenamientos: el {team} está enchufado.",
    ],
    racha_forma: [
      "{p1} atraviesa un estado de forma espectacular.",
      "{p1} no falla una en los entrenamientos: está intratable.",
      "{p1} se ha echado el equipo a la espalda con su nivel.",
      "Momento dulce de {p1}, imparable estos días.",
      "{p1} llega en un momento de forma soberbio.",
    ],
    renovacion: [
      "{p1} transmite su deseo de renovar y seguir muchos años.",
      "{p1} se declara feliz en el club y abre la puerta a ampliar contrato.",
      "Buenas noticias: {p1} quiere quedarse.",
      "{p1} y el club empiezan a negociar una renovación con buen tono.",
      "{p1} repite que este es su sitio: la renovación va por buen camino.",
    ],
  };
  // Clubes "grandes" para rumores de mercado creíbles (slot {club} de interes).
  D.RUMOR_CLUBS = ["Real Madrid", "Barcelona", "Manchester City", "Bayern Múnich", "Paris Saint-Germain",
    "Liverpool", "Manchester United", "Arsenal", "Chelsea", "Juventus", "Inter", "Milan", "Atlético de Madrid",
    "Borussia Dortmund", "Napoli", "Tottenham Hotspur", "Newcastle United", "Marsella", "Atalanta"];

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

  /* ============================================================
     PLANTILLAS DE REFERENCIA — LaLiga y Serie A
     Base: plantillas y ratings de referencia 2024/25 (editables por el usuario).
     { name, pos, age, ovr, nat }
     ============================================================ */
  D.SQUADS = {
    /* ── LaLiga ─────────────────────────────────────────────── */
    "Alavés": [
      {name:"Antonio Sivera",pos:"GK",age:27,ovr:73,nat:"España"},
      {name:"Nahuel Tenaglia",pos:"RB",age:28,ovr:72,nat:"Argentina"},
      {name:"Moussa Diakaby",pos:"CB",age:27,ovr:74,nat:"Francia"},
      {name:"Abqar Abqar",pos:"CB",age:25,ovr:70,nat:"España"},
      {name:"Adriá Pedrosa",pos:"LB",age:26,ovr:72,nat:"España"},
      {name:"Ander Guevara",pos:"CDM",age:26,ovr:74,nat:"España"},
      {name:"Tomás Conechny",pos:"CM",age:24,ovr:71,nat:"Argentina"},
      {name:"Theo Zidane",pos:"CM",age:22,ovr:69,nat:"España"},
      {name:"Kike García",pos:"ST",age:33,ovr:73,nat:"España"},
      {name:"Carlos Benavidez",pos:"CAM",age:22,ovr:70,nat:"Uruguay"},
      {name:"Jon Guridi",pos:"CDM",age:26,ovr:71,nat:"España"},
      {name:"Luis Rioja",pos:"LW",age:29,ovr:72,nat:"España"},
      {name:"Abde Rebbach",pos:"RW",age:22,ovr:70,nat:"Marruecos"},
      {name:"Mamadou Sylla",pos:"ST",age:32,ovr:70,nat:"Guinea"},
      {name:"Aritz Elustondo",pos:"CB",age:32,ovr:71,nat:"España"},
      {name:"Salomón Rondón",pos:"ST",age:34,ovr:71,nat:"Venezuela"},
    ],
    "Athletic Club": [
      {name:"Unai Simón",pos:"GK",age:27,ovr:84,nat:"España"},
      {name:"Óscar de Marcos",pos:"RB",age:34,ovr:76,nat:"España"},
      {name:"Dani Vivian",pos:"CB",age:24,ovr:80,nat:"España"},
      {name:"Yeray Álvarez",pos:"CB",age:29,ovr:79,nat:"España"},
      {name:"Yuri Berchiche",pos:"LB",age:34,ovr:77,nat:"España"},
      {name:"Oier Zarraga",pos:"CDM",age:23,ovr:75,nat:"España"},
      {name:"Mikel Vesga",pos:"CDM",age:30,ovr:76,nat:"España"},
      {name:"Mikel Jauregizar",pos:"CM",age:22,ovr:71,nat:"España"},
      {name:"Alex Berenguer",pos:"LW",age:29,ovr:78,nat:"España"},
      {name:"Nico Williams",pos:"LW",age:22,ovr:84,nat:"España"},
      {name:"Iñaki Williams",pos:"ST",age:30,ovr:81,nat:"España"},
      {name:"Gorka Guruzeta",pos:"ST",age:27,ovr:79,nat:"España"},
      {name:"Aitor Paredes",pos:"CB",age:24,ovr:77,nat:"España"},
      {name:"Unai Gómez",pos:"CM",age:23,ovr:72,nat:"España"},
      {name:"Mikel Balenziaga",pos:"LB",age:35,ovr:73,nat:"España"},
      {name:"Beñat Prados",pos:"RW",age:25,ovr:74,nat:"España"},
    ],
    "Atlético de Madrid": [
      {name:"Jan Oblak",pos:"GK",age:31,ovr:89,nat:"Eslovenia"},
      {name:"Nahuel Molina",pos:"RB",age:26,ovr:82,nat:"Argentina"},
      {name:"Javi Galán",pos:"LB",age:29,ovr:80,nat:"España"},
      {name:"José María Giménez",pos:"CB",age:29,ovr:83,nat:"Uruguay"},
      {name:"Axel Witsel",pos:"CB",age:35,ovr:78,nat:"Bélgica"},
      {name:"Mario Hermoso",pos:"CB",age:29,ovr:80,nat:"España"},
      {name:"Koke",pos:"CM",age:32,ovr:82,nat:"España"},
      {name:"Rodrigo De Paul",pos:"CM",age:30,ovr:83,nat:"Argentina"},
      {name:"Thomas Lemar",pos:"CAM",age:28,ovr:80,nat:"Francia"},
      {name:"Antoine Griezmann",pos:"CAM",age:33,ovr:86,nat:"Francia"},
      {name:"Álvaro Morata",pos:"ST",age:31,ovr:83,nat:"España"},
      {name:"Julián Álvarez",pos:"ST",age:24,ovr:87,nat:"Argentina"},
      {name:"Samuel Lino",pos:"LW",age:24,ovr:77,nat:"Brasil"},
      {name:"Marcos Llorente",pos:"CM",age:29,ovr:82,nat:"España"},
      {name:"César Azpilicueta",pos:"RB",age:34,ovr:78,nat:"España"},
      {name:"Pablo Barrios",pos:"CDM",age:21,ovr:76,nat:"España"},
      {name:"Ángel Correa",pos:"CAM",age:29,ovr:80,nat:"Argentina"},
    ],
    "Barcelona": [
      {name:"Marc-André ter Stegen",pos:"GK",age:32,ovr:89,nat:"Alemania"},
      {name:"Pau Cubarsí",pos:"CB",age:17,ovr:82,nat:"España"},
      {name:"Ronald Araújo",pos:"CB",age:25,ovr:85,nat:"Uruguay"},
      {name:"Andreas Christensen",pos:"CB",age:28,ovr:81,nat:"Dinamarca"},
      {name:"Jules Koundé",pos:"RB",age:25,ovr:86,nat:"Francia"},
      {name:"Alejandro Balde",pos:"LB",age:20,ovr:83,nat:"España"},
      {name:"Frenkie de Jong",pos:"CM",age:27,ovr:85,nat:"Países Bajos"},
      {name:"Pedri",pos:"CM",age:21,ovr:87,nat:"España"},
      {name:"Gavi",pos:"CM",age:20,ovr:86,nat:"España"},
      {name:"Lamine Yamal",pos:"RW",age:17,ovr:89,nat:"España"},
      {name:"Raphinha",pos:"RW",age:27,ovr:84,nat:"Brasil"},
      {name:"Ferran Torres",pos:"LW",age:24,ovr:79,nat:"España"},
      {name:"Robert Lewandowski",pos:"ST",age:36,ovr:87,nat:"Polonia"},
      {name:"Dani Olmo",pos:"CAM",age:26,ovr:85,nat:"España"},
      {name:"Fermín López",pos:"CM",age:21,ovr:78,nat:"España"},
      {name:"Ansu Fati",pos:"LW",age:21,ovr:78,nat:"España"},
      {name:"Iñigo Martínez",pos:"CB",age:33,ovr:81,nat:"España"},
    ],
    "Celta de Vigo": [
      {name:"Iván Villar",pos:"GK",age:26,ovr:75,nat:"España"},
      {name:"Hugo Álvarez",pos:"RB",age:22,ovr:70,nat:"España"},
      {name:"Joseph Aidoo",pos:"CB",age:28,ovr:77,nat:"Ghana"},
      {name:"Unai Núñez",pos:"CB",age:27,ovr:76,nat:"España"},
      {name:"Javi Galán",pos:"LB",age:29,ovr:77,nat:"España"},
      {name:"Fran Beltrán",pos:"CDM",age:26,ovr:78,nat:"España"},
      {name:"Renato Tapia",pos:"CDM",age:29,ovr:77,nat:"Perú"},
      {name:"Oscar Mingueza",pos:"RB",age:24,ovr:78,nat:"España"},
      {name:"Iago Aspas",pos:"ST",age:37,ovr:81,nat:"España"},
      {name:"Borja Iglesias",pos:"ST",age:31,ovr:77,nat:"España"},
      {name:"Jonathan Bamba",pos:"LW",age:27,ovr:76,nat:"Francia"},
      {name:"Anastasios Douvikas",pos:"ST",age:24,ovr:74,nat:"Grecia"},
      {name:"Carles Pérez",pos:"RW",age:25,ovr:75,nat:"España"},
      {name:"Williot Swedberg",pos:"CM",age:20,ovr:72,nat:"Suecia"},
      {name:"Gabri Veiga",pos:"CAM",age:22,ovr:77,nat:"España"},
      {name:"Hugo Mallo",pos:"RB",age:33,ovr:74,nat:"España"},
    ],
    "Elche": [
      {name:"Edgar Badia",pos:"GK",age:32,ovr:73,nat:"España"},
      {name:"Erick Cabaco",pos:"CB",age:28,ovr:70,nat:"Uruguay"},
      {name:"Lucas Boyé",pos:"ST",age:27,ovr:73,nat:"Argentina"},
      {name:"Fidel Chaves",pos:"LW",age:34,ovr:72,nat:"España"},
      {name:"Pedro Bigas",pos:"CB",age:32,ovr:70,nat:"España"},
      {name:"Álex Collado",pos:"CAM",age:24,ovr:72,nat:"España"},
      {name:"Josan",pos:"RB",age:28,ovr:70,nat:"España"},
      {name:"Gonzalo Verdú",pos:"CB",age:33,ovr:70,nat:"España"},
      {name:"Álex Baena",pos:"LW",age:22,ovr:71,nat:"España"},
      {name:"Pere Milla",pos:"RW",age:29,ovr:71,nat:"España"},
      {name:"Sory Kaba",pos:"ST",age:26,ovr:70,nat:"Guinea"},
      {name:"Helibelton Palacios",pos:"RB",age:31,ovr:69,nat:"Colombia"},
      {name:"Omar Mascarell",pos:"CDM",age:32,ovr:72,nat:"España"},
      {name:"Tete Morente",pos:"LM",age:29,ovr:71,nat:"España"},
      {name:"Iván Marcone",pos:"CDM",age:34,ovr:71,nat:"Argentina"},
    ],
    "Espanyol": [
      {name:"Joan García",pos:"GK",age:22,ovr:76,nat:"España"},
      {name:"Alejo Véliz",pos:"ST",age:20,ovr:73,nat:"Argentina"},
      {name:"Carlos Romero",pos:"CB",age:23,ovr:74,nat:"España"},
      {name:"Leandro Cabrera",pos:"CB",age:32,ovr:73,nat:"Uruguay"},
      {name:"Javi Puado",pos:"RW",age:25,ovr:74,nat:"España"},
      {name:"Sergi Gómez",pos:"CB",age:29,ovr:73,nat:"España"},
      {name:"Braithwaite",pos:"ST",age:33,ovr:74,nat:"Dinamarca"},
      {name:"Óscar Gil",pos:"RB",age:24,ovr:74,nat:"España"},
      {name:"Marcelo Diop",pos:"CB",age:25,ovr:71,nat:"España"},
      {name:"Pol Lozano",pos:"CM",age:26,ovr:72,nat:"España"},
      {name:"Luis Baldé",pos:"LW",age:20,ovr:72,nat:"Guinea-Bisáu"},
      {name:"Brian Olivan",pos:"LB",age:26,ovr:72,nat:"España"},
      {name:"Edu Expósito",pos:"CM",age:27,ovr:74,nat:"España"},
      {name:"Irvin Cardona",pos:"ST",age:26,ovr:72,nat:"Francia"},
      {name:"Salvi Sánchez",pos:"RW",age:30,ovr:73,nat:"España"},
      {name:"Adrián Embarba",pos:"LW",age:32,ovr:72,nat:"España"},
    ],
    "Getafe": [
      {name:"David Soria",pos:"GK",age:31,ovr:79,nat:"España"},
      {name:"Damián Suárez",pos:"RB",age:35,ovr:77,nat:"Uruguay"},
      {name:"Domingos Duarte",pos:"CB",age:30,ovr:76,nat:"Portugal"},
      {name:"Stefan Mitrovic",pos:"CB",age:31,ovr:74,nat:"Serbia"},
      {name:"Juan Iglesias",pos:"LB",age:25,ovr:72,nat:"España"},
      {name:"Mauro Arambarri",pos:"CDM",age:28,ovr:79,nat:"Uruguay"},
      {name:"Okay Yokuslu",pos:"CDM",age:30,ovr:77,nat:"Turquía"},
      {name:"Enes Ünal",pos:"ST",age:27,ovr:79,nat:"Turquía"},
      {name:"Borja Mayoral",pos:"ST",age:27,ovr:78,nat:"España"},
      {name:"Mason Greenwood",pos:"RW",age:22,ovr:79,nat:"Inglaterra"},
      {name:"Álvaro Rodríguez",pos:"ST",age:21,ovr:73,nat:"España"},
      {name:"Yellu Santiago",pos:"LW",age:20,ovr:70,nat:"España"},
      {name:"Juan Pérez",pos:"CM",age:24,ovr:72,nat:"España"},
      {name:"Gastón Álvarez",pos:"CB",age:22,ovr:71,nat:"Uruguay"},
      {name:"Diego Rico",pos:"LB",age:31,ovr:73,nat:"España"},
      {name:"Jaime Mata",pos:"ST",age:36,ovr:73,nat:"España"},
    ],
    "Girona": [
      {name:"Paulo Gazzaniga",pos:"GK",age:32,ovr:79,nat:"Argentina"},
      {name:"Yan Couto",pos:"RB",age:22,ovr:80,nat:"Brasil"},
      {name:"David López",pos:"CB",age:33,ovr:77,nat:"España"},
      {name:"Eric García",pos:"CB",age:23,ovr:79,nat:"España"},
      {name:"Miguel Gutiérrez",pos:"LB",age:22,ovr:78,nat:"España"},
      {name:"Aleix García",pos:"CDM",age:26,ovr:82,nat:"España"},
      {name:"Oriol Romeu",pos:"CDM",age:32,ovr:78,nat:"España"},
      {name:"Viktor Tsygankov",pos:"LW",age:26,ovr:78,nat:"Ucrania"},
      {name:"Savinho",pos:"RW",age:20,ovr:79,nat:"Brasil"},
      {name:"Artem Dovbyk",pos:"ST",age:27,ovr:82,nat:"Ucrania"},
      {name:"Castellanos",pos:"ST",age:26,ovr:77,nat:"Argentina"},
      {name:"Toni Villa",pos:"LW",age:26,ovr:74,nat:"España"},
      {name:"Jürgen Savio",pos:"RW",age:22,ovr:73,nat:"Brasil"},
      {name:"Bojan Miovski",pos:"ST",age:25,ovr:77,nat:"Macedonia del Norte"},
      {name:"Pedro Porro",pos:"RB",age:24,ovr:81,nat:"España"},
      {name:"Iván Martín",pos:"CM",age:24,ovr:76,nat:"España"},
    ],
    "Levante": [
      {name:"Andrés Fernández",pos:"GK",age:37,ovr:73,nat:"España"},
      {name:"Rober Pier",pos:"CB",age:31,ovr:70,nat:"España"},
      {name:"Son",pos:"CB",age:28,ovr:69,nat:"España"},
      {name:"Sergio Postigo",pos:"CB",age:34,ovr:70,nat:"España"},
      {name:"Álvaro Brau",pos:"RB",age:22,ovr:68,nat:"España"},
      {name:"José Luis Morales",pos:"LW",age:36,ovr:72,nat:"España"},
      {name:"Jorge de Frutos",pos:"RW",age:27,ovr:72,nat:"España"},
      {name:"Nemanja Radoja",pos:"CDM",age:31,ovr:70,nat:"Serbia"},
      {name:"Roger Brugué",pos:"CM",age:23,ovr:68,nat:"España"},
      {name:"Dani Gómez",pos:"ST",age:25,ovr:72,nat:"España"},
      {name:"Roger Martí",pos:"ST",age:34,ovr:71,nat:"España"},
      {name:"Pablo Martínez",pos:"LB",age:26,ovr:69,nat:"España"},
      {name:"Álex Muñoz",pos:"RB",age:27,ovr:69,nat:"España"},
      {name:"Enis Bardhi",pos:"CAM",age:29,ovr:72,nat:"Macedonia del Norte"},
      {name:"Mickael Malsa",pos:"CM",age:25,ovr:68,nat:"Francia"},
    ],
    "Mallorca": [
      {name:"Predrag Rajkovic",pos:"GK",age:29,ovr:80,nat:"Serbia"},
      {name:"Pablo Maffeo",pos:"RB",age:27,ovr:79,nat:"España"},
      {name:"Antonio Raíllo",pos:"CB",age:31,ovr:76,nat:"España"},
      {name:"Martin Valjent",pos:"CB",age:28,ovr:76,nat:"Eslovaquia"},
      {name:"Jaume Costa",pos:"LB",age:35,ovr:73,nat:"España"},
      {name:"Dani Rodríguez",pos:"CM",age:34,ovr:74,nat:"España"},
      {name:"Robert Navarro",pos:"CM",age:24,ovr:74,nat:"España"},
      {name:"Cyle Larin",pos:"ST",age:29,ovr:75,nat:"Canadá"},
      {name:"Vedat Muriqi",pos:"ST",age:30,ovr:78,nat:"Kosovo"},
      {name:"Abdón Prats",pos:"ST",age:31,ovr:74,nat:"España"},
      {name:"Sergi Darder",pos:"CAM",age:30,ovr:77,nat:"España"},
      {name:"Samú Costa",pos:"CDM",age:24,ovr:74,nat:"Portugal"},
      {name:"Lee Kang-in",pos:"CAM",age:23,ovr:79,nat:"Corea del Sur"},
      {name:"Antonio Sánchez",pos:"CDM",age:26,ovr:72,nat:"España"},
      {name:"Lato",pos:"LB",age:30,ovr:74,nat:"España"},
    ],
    "Osasuna": [
      {name:"Sergio Herrera",pos:"GK",age:30,ovr:78,nat:"España"},
      {name:"Nacho Vidal",pos:"RB",age:29,ovr:75,nat:"España"},
      {name:"David García",pos:"CB",age:29,ovr:78,nat:"España"},
      {name:"Aridane Hernández",pos:"CB",age:33,ovr:75,nat:"España"},
      {name:"Juan Cruz",pos:"LB",age:27,ovr:75,nat:"España"},
      {name:"Lucas Torró",pos:"CDM",age:29,ovr:76,nat:"España"},
      {name:"Jon Moncayola",pos:"CM",age:26,ovr:75,nat:"España"},
      {name:"Rubén García",pos:"LW",age:29,ovr:76,nat:"España"},
      {name:"Ante Budimir",pos:"ST",age:32,ovr:79,nat:"Croacia"},
      {name:"Ezequiel Ávila",pos:"ST",age:24,ovr:73,nat:"Argentina"},
      {name:"Bryan Zaragoza",pos:"LW",age:22,ovr:75,nat:"España"},
      {name:"Abde Ezzalzouli",pos:"RW",age:22,ovr:75,nat:"Marruecos"},
      {name:"Moi Gómez",pos:"CAM",age:28,ovr:74,nat:"España"},
      {name:"Pablo Ibáñez",pos:"CB",age:23,ovr:72,nat:"España"},
      {name:"Chimy Ávila",pos:"ST",age:29,ovr:73,nat:"Argentina"},
      {name:"Aimar Oroz",pos:"CM",age:23,ovr:73,nat:"España"},
    ],
    "Rayo Vallecano": [
      {name:"Stole Dimitrievski",pos:"GK",age:31,ovr:76,nat:"Macedonia del Norte"},
      {name:"Iván Balliu",pos:"RB",age:30,ovr:74,nat:"Albania"},
      {name:"Florian Lejeune",pos:"CB",age:33,ovr:74,nat:"Francia"},
      {name:"Alejandro Catena",pos:"CB",age:30,ovr:74,nat:"España"},
      {name:"Fran García",pos:"LB",age:23,ovr:76,nat:"España"},
      {name:"Óscar Trejo",pos:"CAM",age:35,ovr:75,nat:"Argentina"},
      {name:"Unai López",pos:"CM",age:28,ovr:75,nat:"España"},
      {name:"Jorge Comesaña",pos:"CDM",age:27,ovr:73,nat:"España"},
      {name:"Sergi Guardiola",pos:"ST",age:31,ovr:72,nat:"España"},
      {name:"Raúl de Tomás",pos:"ST",age:29,ovr:76,nat:"España"},
      {name:"Randy Nteka",pos:"LW",age:26,ovr:74,nat:"Francia"},
      {name:"Álvaro García",pos:"RW",age:30,ovr:74,nat:"España"},
      {name:"Pathé Ciss",pos:"CDM",age:30,ovr:73,nat:"Senegal"},
      {name:"Camello",pos:"ST",age:22,ovr:71,nat:"España"},
      {name:"José Pozo",pos:"CM",age:27,ovr:72,nat:"España"},
      {name:"Trebacio",pos:"CB",age:24,ovr:70,nat:"Brasil"},
    ],
    "Real Betis": [
      {name:"Rui Silva",pos:"GK",age:30,ovr:80,nat:"Portugal"},
      {name:"Héctor Bellerín",pos:"RB",age:29,ovr:77,nat:"España"},
      {name:"Natan",pos:"CB",age:23,ovr:76,nat:"Brasil"},
      {name:"Marc Bartra",pos:"CB",age:33,ovr:77,nat:"España"},
      {name:"Ricardo Rodríguez",pos:"LB",age:31,ovr:77,nat:"Suiza"},
      {name:"Johnny Cardoso",pos:"CDM",age:23,ovr:78,nat:"Estados Unidos"},
      {name:"William Carvalho",pos:"CDM",age:32,ovr:78,nat:"Portugal"},
      {name:"Isco",pos:"CAM",age:32,ovr:81,nat:"España"},
      {name:"Ayoze Pérez",pos:"RW",age:30,ovr:77,nat:"España"},
      {name:"Antony",pos:"RW",age:24,ovr:77,nat:"Brasil"},
      {name:"Giovani Lo Celso",pos:"CAM",age:28,ovr:80,nat:"Argentina"},
      {name:"Borja Iglesias",pos:"ST",age:31,ovr:78,nat:"España"},
      {name:"Vitor Roque",pos:"ST",age:19,ovr:77,nat:"Brasil"},
      {name:"Assane Diao",pos:"LW",age:19,ovr:74,nat:"España"},
      {name:"Fornals",pos:"CM",age:28,ovr:78,nat:"España"},
      {name:"Abner Vinicius",pos:"LB",age:23,ovr:74,nat:"Brasil"},
    ],
    "Real Madrid": [
      {name:"Thibaut Courtois",pos:"GK",age:32,ovr:90,nat:"Bélgica"},
      {name:"Dani Carvajal",pos:"RB",age:32,ovr:85,nat:"España"},
      {name:"Éder Militão",pos:"CB",age:26,ovr:86,nat:"Brasil"},
      {name:"Antonio Rüdiger",pos:"CB",age:31,ovr:85,nat:"Alemania"},
      {name:"Ferland Mendy",pos:"LB",age:29,ovr:83,nat:"Francia"},
      {name:"Aurélien Tchouaméni",pos:"CDM",age:24,ovr:84,nat:"Francia"},
      {name:"Luka Modric",pos:"CM",age:38,ovr:85,nat:"Croacia"},
      {name:"Federico Valverde",pos:"CM",age:26,ovr:86,nat:"Uruguay"},
      {name:"Jude Bellingham",pos:"CAM",age:21,ovr:90,nat:"Inglaterra"},
      {name:"Vinícius Jr.",pos:"LW",age:24,ovr:90,nat:"Brasil"},
      {name:"Rodrygo",pos:"RW",age:23,ovr:85,nat:"Brasil"},
      {name:"Kylian Mbappé",pos:"ST",age:25,ovr:91,nat:"Francia"},
      {name:"Endrick",pos:"ST",age:18,ovr:77,nat:"Brasil"},
      {name:"Camavinga",pos:"CM",age:21,ovr:83,nat:"Francia"},
      {name:"Brahim Díaz",pos:"CAM",age:25,ovr:80,nat:"España"},
      {name:"Lucas Vázquez",pos:"RB",age:32,ovr:78,nat:"España"},
      {name:"David Alaba",pos:"CB",age:32,ovr:84,nat:"Austria"},
    ],
    "Real Oviedo": [
      {name:"Axel Werner",pos:"GK",age:25,ovr:72,nat:"Argentina"},
      {name:"Dani Calvo",pos:"CB",age:32,ovr:70,nat:"España"},
      {name:"Cosimo Bertini",pos:"CM",age:23,ovr:70,nat:"Italia"},
      {name:"Lucas Ahijado",pos:"LB",age:24,ovr:68,nat:"España"},
      {name:"Martín Aguirregabiria",pos:"RB",age:30,ovr:71,nat:"España"},
      {name:"Cristian Bustos",pos:"CB",age:27,ovr:69,nat:"España"},
      {name:"Jimmy",pos:"ST",age:32,ovr:71,nat:"España"},
      {name:"Borja Valle",pos:"LW",age:30,ovr:70,nat:"España"},
      {name:"Álvaro Jiménez",pos:"CAM",age:28,ovr:71,nat:"España"},
      {name:"Pombo",pos:"CM",age:30,ovr:71,nat:"España"},
      {name:"Lucca",pos:"ST",age:22,ovr:69,nat:"Brasil"},
      {name:"Bastón",pos:"ST",age:34,ovr:70,nat:"Argentina"},
      {name:"Manu Vallejo",pos:"RW",age:27,ovr:70,nat:"España"},
      {name:"Viti Rozada",pos:"RB",age:22,ovr:68,nat:"España"},
      {name:"Claudio Beauvue",pos:"LW",age:34,ovr:68,nat:"Guadalupe"},
    ],
    "Real Sociedad": [
      {name:"Álex Remiro",pos:"GK",age:29,ovr:84,nat:"España"},
      {name:"Aritz Elustondo",pos:"CB",age:32,ovr:76,nat:"España"},
      {name:"Le Normand",pos:"CB",age:27,ovr:83,nat:"Francia"},
      {name:"Jon Pacheco",pos:"CB",age:22,ovr:75,nat:"España"},
      {name:"Aihen Muñoz",pos:"LB",age:26,ovr:76,nat:"España"},
      {name:"Brais Méndez",pos:"CM",age:27,ovr:82,nat:"España"},
      {name:"Martin Zubimendi",pos:"CDM",age:25,ovr:84,nat:"España"},
      {name:"Mikel Merino",pos:"CM",age:28,ovr:83,nat:"España"},
      {name:"Takefusa Kubo",pos:"RW",age:23,ovr:83,nat:"Japón"},
      {name:"Mikel Oyarzabal",pos:"LW",age:27,ovr:83,nat:"España"},
      {name:"Alexander Sørloth",pos:"ST",age:28,ovr:82,nat:"Noruega"},
      {name:"Ander Barrenetxea",pos:"LW",age:22,ovr:77,nat:"España"},
      {name:"André Silva",pos:"ST",age:29,ovr:78,nat:"Portugal"},
      {name:"Hamari Traoré",pos:"RB",age:30,ovr:77,nat:"Mali"},
      {name:"Pablo Marín",pos:"CM",age:21,ovr:70,nat:"España"},
      {name:"Nacho Zubeldia",pos:"CDM",age:27,ovr:76,nat:"España"},
    ],
    "Sevilla": [
      {name:"Yassine Bounou",pos:"GK",age:33,ovr:85,nat:"Marruecos"},
      {name:"Jesús Navas",pos:"RB",age:38,ovr:77,nat:"España"},
      {name:"Loïc Badé",pos:"CB",age:24,ovr:78,nat:"Francia"},
      {name:"Marcao",pos:"CB",age:28,ovr:76,nat:"Brasil"},
      {name:"Marcos Acuña",pos:"LB",age:32,ovr:79,nat:"Argentina"},
      {name:"Joan Jordán",pos:"CM",age:29,ovr:77,nat:"España"},
      {name:"Gudelj",pos:"CDM",age:32,ovr:76,nat:"Serbia"},
      {name:"Suso",pos:"CAM",age:30,ovr:77,nat:"España"},
      {name:"Lucas Ocampos",pos:"RW",age:30,ovr:81,nat:"Argentina"},
      {name:"Lukébakio",pos:"RW",age:26,ovr:77,nat:"Bélgica"},
      {name:"Youssef En-Nesyri",pos:"ST",age:27,ovr:81,nat:"Marruecos"},
      {name:"Oliver Torres",pos:"CM",age:29,ovr:76,nat:"España"},
      {name:"Bryan Gil",pos:"LW",age:23,ovr:77,nat:"España"},
      {name:"Djibril Sow",pos:"CM",age:27,ovr:77,nat:"Suiza"},
      {name:"Alberto Flores",pos:"RB",age:24,ovr:72,nat:"España"},
      {name:"Isaac Romero",pos:"ST",age:23,ovr:73,nat:"España"},
    ],
    "Valencia": [
      {name:"Giorgi Mamardashvili",pos:"GK",age:23,ovr:83,nat:"Georgia"},
      {name:"Jesús Vázquez",pos:"LB",age:22,ovr:78,nat:"España"},
      {name:"Mouctar Diakhaby",pos:"CB",age:27,ovr:76,nat:"Francia"},
      {name:"Cristhian Mosquera",pos:"CB",age:20,ovr:77,nat:"España"},
      {name:"Dimitri Foulquier",pos:"RB",age:31,ovr:74,nat:"Francia"},
      {name:"André Almeida",pos:"RB",age:33,ovr:73,nat:"Portugal"},
      {name:"Pepelu",pos:"CDM",age:25,ovr:77,nat:"España"},
      {name:"Hugo Guillamon",pos:"CDM",age:24,ovr:76,nat:"España"},
      {name:"Justin Kluivert",pos:"LW",age:25,ovr:77,nat:"Países Bajos"},
      {name:"Javi Guerra",pos:"CM",age:22,ovr:73,nat:"España"},
      {name:"Diego López",pos:"ST",age:22,ovr:72,nat:"España"},
      {name:"Hugo Duro",pos:"ST",age:25,ovr:76,nat:"España"},
      {name:"Rafa Mir",pos:"ST",age:26,ovr:75,nat:"España"},
      {name:"Thierry Correia",pos:"RB",age:25,ovr:74,nat:"Portugal"},
      {name:"Sergi Canós",pos:"RW",age:26,ovr:74,nat:"España"},
      {name:"Genís Montolio",pos:"CM",age:24,ovr:71,nat:"España"},
    ],
    "Villarreal": [
      {name:"Filip Jorgensen",pos:"GK",age:22,ovr:78,nat:"Dinamarca"},
      {name:"Juan Foyth",pos:"RB",age:26,ovr:80,nat:"Argentina"},
      {name:"Raúl Albiol",pos:"CB",age:38,ovr:79,nat:"España"},
      {name:"Pau Torres",pos:"CB",age:27,ovr:84,nat:"España"},
      {name:"Alfonso Pedraza",pos:"LB",age:27,ovr:80,nat:"España"},
      {name:"Santi Comesaña",pos:"CDM",age:26,ovr:76,nat:"España"},
      {name:"Étienne Capoue",pos:"CDM",age:36,ovr:76,nat:"Francia"},
      {name:"Alexander Sørloth",pos:"ST",age:28,ovr:82,nat:"Noruega"},
      {name:"Danjuma",pos:"LW",age:27,ovr:78,nat:"Países Bajos"},
      {name:"Yeremy Pino",pos:"RW",age:22,ovr:80,nat:"España"},
      {name:"Álex Baena",pos:"LW",age:22,ovr:79,nat:"España"},
      {name:"Jorge Cuenca",pos:"CB",age:25,ovr:76,nat:"España"},
      {name:"Ilias Akhomach",pos:"LW",age:20,ovr:73,nat:"Marruecos"},
      {name:"Ayoze Pérez",pos:"RW",age:30,ovr:77,nat:"España"},
      {name:"José Luis Morales",pos:"LW",age:36,ovr:73,nat:"España"},
      {name:"Gerard Moreno",pos:"ST",age:32,ovr:82,nat:"España"},
    ],
    /* ── Serie A ─────────────────────────────────────────────── */
    "Atalanta": [
      {name:"Marco Carnesecchi",pos:"GK",age:24,ovr:81,nat:"Italia"},
      {name:"Davide Zappacosta",pos:"RB",age:31,ovr:79,nat:"Italia"},
      {name:"Berat Djimsiti",pos:"CB",age:30,ovr:80,nat:"Albania"},
      {name:"Isak Hien",pos:"CB",age:24,ovr:79,nat:"Suecia"},
      {name:"Matteo Ruggeri",pos:"LB",age:22,ovr:77,nat:"Italia"},
      {name:"Marten de Roon",pos:"CDM",age:33,ovr:81,nat:"Países Bajos"},
      {name:"Éderson",pos:"CM",age:25,ovr:82,nat:"Brasil"},
      {name:"Mario Pašalić",pos:"CAM",age:29,ovr:81,nat:"Croacia"},
      {name:"Ademola Lookman",pos:"LW",age:26,ovr:83,nat:"Nigeria"},
      {name:"Gianluca Scamacca",pos:"ST",age:25,ovr:81,nat:"Italia"},
      {name:"Teun Koopmeiners",pos:"CM",age:26,ovr:85,nat:"Países Bajos"},
      {name:"Charles De Ketelaere",pos:"CAM",age:23,ovr:82,nat:"Bélgica"},
      {name:"El Bilal Touré",pos:"ST",age:22,ovr:77,nat:"Mali"},
      {name:"Rafael Tolói",pos:"CB",age:34,ovr:77,nat:"Italia"},
      {name:"José Luis Palomino",pos:"CB",age:34,ovr:74,nat:"Argentina"},
      {name:"Sead Kolasinac",pos:"LB",age:31,ovr:77,nat:"Bosnia y Herzegovina"},
    ],
    "Bologna": [
      {name:"Lukasz Skorupski",pos:"GK",age:33,ovr:79,nat:"Polonia"},
      {name:"Wisdom Amey",pos:"RB",age:22,ovr:71,nat:"Italia"},
      {name:"Jhon Lucumí",pos:"CB",age:25,ovr:78,nat:"Colombia"},
      {name:"Sam Beukema",pos:"CB",age:26,ovr:79,nat:"Países Bajos"},
      {name:"Charalampos Lykogiannis",pos:"LB",age:30,ovr:74,nat:"Grecia"},
      {name:"Remo Freuler",pos:"CM",age:32,ovr:81,nat:"Suiza"},
      {name:"Nicola Moro",pos:"CM",age:25,ovr:74,nat:"Italia"},
      {name:"Riccardo Orsolini",pos:"RW",age:27,ovr:79,nat:"Italia"},
      {name:"Marko Arnautovic",pos:"ST",age:35,ovr:78,nat:"Austria"},
      {name:"Joshua Zirkzee",pos:"ST",age:23,ovr:80,nat:"Países Bajos"},
      {name:"Lewis Ferguson",pos:"CDM",age:24,ovr:77,nat:"Escocia"},
      {name:"Michel Aebischer",pos:"CM",age:27,ovr:76,nat:"Suiza"},
      {name:"Nicolás Domínguez",pos:"CM",age:25,ovr:76,nat:"Argentina"},
      {name:"Stefan Posch",pos:"RB",age:26,ovr:75,nat:"Austria"},
      {name:"Dan Ndoye",pos:"LW",age:23,ovr:76,nat:"Suiza"},
      {name:"Victor Kristiansen",pos:"LB",age:22,ovr:74,nat:"Dinamarca"},
    ],
    "Cagliari": [
      {name:"Simone Scuffet",pos:"GK",age:27,ovr:74,nat:"Italia"},
      {name:"Alessandro Mattioli",pos:"RB",age:22,ovr:68,nat:"Italia"},
      {name:"Yerry Mina",pos:"CB",age:29,ovr:75,nat:"Colombia"},
      {name:"Sebastian Walukiewicz",pos:"CB",age:24,ovr:74,nat:"Polonia"},
      {name:"Adam Obert",pos:"LB",age:23,ovr:72,nat:"Eslovaquia"},
      {name:"Razvan Marin",pos:"CM",age:28,ovr:75,nat:"Rumanía"},
      {name:"Gaetano",pos:"CM",age:24,ovr:73,nat:"Italia"},
      {name:"Nicolas Viola",pos:"CAM",age:35,ovr:72,nat:"Italia"},
      {name:"Gianluca Lapadula",pos:"ST",age:34,ovr:74,nat:"Italia"},
      {name:"Leonardo Pavoletti",pos:"ST",age:35,ovr:73,nat:"Italia"},
      {name:"Zito Luvumbo",pos:"LW",age:22,ovr:73,nat:"Angola"},
      {name:"Antoine Makoumbou",pos:"CDM",age:25,ovr:72,nat:"Congo"},
      {name:"Nadir Zortea",pos:"RB",age:24,ovr:71,nat:"Italia"},
      {name:"Jakub Jankto",pos:"LB",age:28,ovr:72,nat:"República Checa"},
      {name:"Paulo Azzi",pos:"RB",age:25,ovr:70,nat:"Italia"},
    ],
    "Como": [
      {name:"Emil Audero",pos:"GK",age:27,ovr:75,nat:"Italia"},
      {name:"Jasmin Cursic",pos:"RB",age:26,ovr:68,nat:"Eslovenia"},
      {name:"Matthijs de Ligt",pos:"CB",age:24,ovr:84,nat:"Países Bajos"},
      {name:"Carlos Augusto",pos:"LB",age:24,ovr:77,nat:"Brasil"},
      {name:"Fodé Ballo-Touré",pos:"LB",age:27,ovr:73,nat:"Senegal"},
      {name:"Sergi Roberto",pos:"CM",age:32,ovr:76,nat:"España"},
      {name:"Patrick Cutrone",pos:"ST",age:26,ovr:73,nat:"Italia"},
      {name:"Cesc Fàbregas",pos:"CM",age:37,ovr:74,nat:"España"},
      {name:"Strahinja Pavlovic",pos:"CB",age:23,ovr:78,nat:"Serbia"},
      {name:"Raphaël Guerreiro",pos:"LB",age:30,ovr:80,nat:"Portugal"},
      {name:"Dele Alli",pos:"CAM",age:28,ovr:72,nat:"Inglaterra"},
      {name:"Álex Moreno",pos:"LB",age:30,ovr:75,nat:"España"},
      {name:"Alieu Fadera",pos:"LW",age:23,ovr:71,nat:"Gambia"},
      {name:"Gabriel Strefezza",pos:"RW",age:27,ovr:73,nat:"Italia"},
      {name:"Pepe Reina",pos:"GK",age:41,ovr:72,nat:"España"},
      {name:"Marco Rios",pos:"CM",age:22,ovr:68,nat:"Italia"},
    ],
    "Cremonese": [
      {name:"Ionut Radu",pos:"GK",age:27,ovr:72,nat:"Rumanía"},
      {name:"Lochoshvili",pos:"CB",age:23,ovr:70,nat:"Georgia"},
      {name:"David Okereke",pos:"ST",age:26,ovr:72,nat:"Nigeria"},
      {name:"Daniel Ciofani",pos:"ST",age:37,ovr:70,nat:"Italia"},
      {name:"Marco Benassi",pos:"CM",age:29,ovr:71,nat:"Italia"},
      {name:"Emanuele Valeri",pos:"LB",age:24,ovr:69,nat:"Italia"},
      {name:"Matteo Bianchetti",pos:"CB",age:33,ovr:70,nat:"Italia"},
      {name:"Luca Zanimacchia",pos:"RW",age:26,ovr:70,nat:"Italia"},
      {name:"Cyriel Dessers",pos:"ST",age:28,ovr:73,nat:"Nigeria"},
      {name:"Nicola Vazquez",pos:"CAM",age:25,ovr:68,nat:"Italia"},
      {name:"Ante Bulic",pos:"CB",age:26,ovr:68,nat:"Croacia"},
      {name:"Moussa Doumbia",pos:"LW",age:27,ovr:68,nat:"Mali"},
      {name:"Francesco Ranocchia",pos:"CM",age:23,ovr:70,nat:"Italia"},
      {name:"Filippo Pickel",pos:"CDM",age:27,ovr:69,nat:"Italia"},
      {name:"Manuel Iori",pos:"CM",age:22,ovr:66,nat:"Italia"},
    ],
    "Fiorentina": [
      {name:"Pietro Terracciano",pos:"GK",age:34,ovr:77,nat:"Italia"},
      {name:"Dodô",pos:"RB",age:25,ovr:81,nat:"Brasil"},
      {name:"Lucas Martínez Quarta",pos:"CB",age:27,ovr:79,nat:"Argentina"},
      {name:"Nikola Milenković",pos:"CB",age:26,ovr:81,nat:"Serbia"},
      {name:"Cristiano Biraghi",pos:"LB",age:31,ovr:78,nat:"Italia"},
      {name:"Sofyan Amrabat",pos:"CDM",age:27,ovr:80,nat:"Marruecos"},
      {name:"Giacomo Bonaventura",pos:"CM",age:34,ovr:78,nat:"Italia"},
      {name:"Rolando Mandragora",pos:"CM",age:27,ovr:77,nat:"Italia"},
      {name:"Nico González",pos:"LW",age:22,ovr:79,nat:"Argentina"},
      {name:"Jonathan Ikoné",pos:"RW",age:26,ovr:77,nat:"Francia"},
      {name:"Luka Jović",pos:"ST",age:26,ovr:78,nat:"Serbia"},
      {name:"Riccardo Sottil",pos:"LW",age:25,ovr:75,nat:"Italia"},
      {name:"Andrea Belotti",pos:"ST",age:30,ovr:78,nat:"Italia"},
      {name:"Gaetano Castrovilli",pos:"CAM",age:27,ovr:76,nat:"Italia"},
      {name:"Oliver Christensen",pos:"GK",age:24,ovr:73,nat:"Dinamarca"},
      {name:"Nicolás Beltran",pos:"CAM",age:22,ovr:71,nat:"Colombia"},
    ],
    "Genoa": [
      {name:"Josep Martínez",pos:"GK",age:26,ovr:78,nat:"España"},
      {name:"Silvan Hefti",pos:"RB",age:27,ovr:74,nat:"Suiza"},
      {name:"Radu Dragusin",pos:"CB",age:22,ovr:78,nat:"Rumanía"},
      {name:"Johan Vásquez",pos:"CB",age:24,ovr:74,nat:"México"},
      {name:"Aaron Martin",pos:"LB",age:27,ovr:75,nat:"España"},
      {name:"Milan Badelj",pos:"CDM",age:35,ovr:74,nat:"Croacia"},
      {name:"Morten Frendrup",pos:"CM",age:23,ovr:75,nat:"Dinamarca"},
      {name:"Albert Guðmundsson",pos:"CAM",age:26,ovr:81,nat:"Islandia"},
      {name:"Mateo Retegui",pos:"ST",age:25,ovr:79,nat:"Italia"},
      {name:"Caleb Ekuban",pos:"ST",age:29,ovr:73,nat:"Ghana"},
      {name:"Massimo Coda",pos:"ST",age:36,ovr:73,nat:"Italia"},
      {name:"Davide Biraschi",pos:"RB",age:29,ovr:72,nat:"Italia"},
      {name:"Francesco Bani",pos:"CB",age:30,ovr:72,nat:"Italia"},
      {name:"Alessandro Vogliacco",pos:"CB",age:26,ovr:71,nat:"Italia"},
      {name:"Samuel Mbangula",pos:"LW",age:21,ovr:71,nat:"Bélgica"},
      {name:"Junior Messias",pos:"RW",age:33,ovr:73,nat:"Brasil"},
    ],
    "Inter": [
      {name:"Yann Sommer",pos:"GK",age:35,ovr:86,nat:"Suiza"},
      {name:"Denzel Dumfries",pos:"RB",age:28,ovr:82,nat:"Países Bajos"},
      {name:"Stefan de Vrij",pos:"CB",age:32,ovr:83,nat:"Países Bajos"},
      {name:"Alessandro Bastoni",pos:"CB",age:25,ovr:86,nat:"Italia"},
      {name:"Federico Dimarco",pos:"LB",age:26,ovr:84,nat:"Italia"},
      {name:"Hakan Çalhanoğlu",pos:"CDM",age:30,ovr:86,nat:"Turquía"},
      {name:"Nicolo Barella",pos:"CM",age:27,ovr:87,nat:"Italia"},
      {name:"Henrikh Mkhitaryan",pos:"CM",age:35,ovr:81,nat:"Armenia"},
      {name:"Marcus Thuram",pos:"ST",age:27,ovr:85,nat:"Francia"},
      {name:"Lautaro Martínez",pos:"ST",age:27,ovr:89,nat:"Argentina"},
      {name:"Mehdi Taremi",pos:"ST",age:32,ovr:81,nat:"Irán"},
      {name:"Carlos Augusto",pos:"LB",age:24,ovr:77,nat:"Brasil"},
      {name:"Matteo Darmian",pos:"RB",age:34,ovr:78,nat:"Italia"},
      {name:"Benjamin Pavard",pos:"CB",age:28,ovr:83,nat:"Francia"},
      {name:"Kristjan Asllani",pos:"CDM",age:22,ovr:77,nat:"Albania"},
      {name:"Davide Frattesi",pos:"CM",age:25,ovr:79,nat:"Italia"},
      {name:"Marko Arnautovic",pos:"ST",age:35,ovr:78,nat:"Austria"},
    ],
    "Juventus": [
      {name:"Wojciech Szczęsny",pos:"GK",age:34,ovr:85,nat:"Polonia"},
      {name:"Danilo",pos:"RB",age:32,ovr:79,nat:"Brasil"},
      {name:"Gleison Bremer",pos:"CB",age:27,ovr:84,nat:"Brasil"},
      {name:"Federico Gatti",pos:"CB",age:26,ovr:79,nat:"Italia"},
      {name:"Andrea Cambiaso",pos:"LB",age:24,ovr:82,nat:"Italia"},
      {name:"Manuel Locatelli",pos:"CDM",age:26,ovr:82,nat:"Italia"},
      {name:"Adrien Rabiot",pos:"CM",age:29,ovr:82,nat:"Francia"},
      {name:"Weston McKennie",pos:"CM",age:25,ovr:78,nat:"Estados Unidos"},
      {name:"Kenan Yıldız",pos:"CAM",age:19,ovr:79,nat:"Turquía"},
      {name:"Federico Chiesa",pos:"RW",age:26,ovr:82,nat:"Italia"},
      {name:"Dušan Vlahović",pos:"ST",age:24,ovr:86,nat:"Serbia"},
      {name:"Arkadiusz Milik",pos:"ST",age:30,ovr:78,nat:"Polonia"},
      {name:"Timothy Weah",pos:"RW",age:24,ovr:76,nat:"Estados Unidos"},
      {name:"Dean Huijsen",pos:"CB",age:19,ovr:76,nat:"España"},
      {name:"Filip Kostic",pos:"LW",age:31,ovr:80,nat:"Serbia"},
      {name:"Fabio Miretti",pos:"CM",age:21,ovr:74,nat:"Italia"},
      {name:"Nicolás González",pos:"LW",age:26,ovr:77,nat:"Argentina"},
    ],
    "Lazio": [
      {name:"Ivan Provedel",pos:"GK",age:30,ovr:81,nat:"Italia"},
      {name:"Elseid Hysaj",pos:"RB",age:30,ovr:75,nat:"Albania"},
      {name:"Patric",pos:"CB",age:32,ovr:74,nat:"España"},
      {name:"Nicolò Casale",pos:"CB",age:26,ovr:77,nat:"Italia"},
      {name:"Marusic",pos:"LB",age:29,ovr:77,nat:"Montenegro"},
      {name:"Danilo Cataldi",pos:"CDM",age:30,ovr:76,nat:"Italia"},
      {name:"Matías Vecino",pos:"CM",age:32,ovr:77,nat:"Uruguay"},
      {name:"Luis Alberto",pos:"CAM",age:31,ovr:82,nat:"España"},
      {name:"Felipe Anderson",pos:"RW",age:31,ovr:80,nat:"Brasil"},
      {name:"Gustav Isaksen",pos:"LW",age:23,ovr:76,nat:"Dinamarca"},
      {name:"Ciro Immobile",pos:"ST",age:34,ovr:84,nat:"Italia"},
      {name:"Pedro",pos:"RW",age:36,ovr:79,nat:"España"},
      {name:"Taty Castellanos",pos:"ST",age:25,ovr:77,nat:"Argentina"},
      {name:"Mattia Zaccagni",pos:"LW",age:29,ovr:80,nat:"Italia"},
      {name:"Daichi Kamada",pos:"CAM",age:27,ovr:80,nat:"Japón"},
      {name:"Luca Pellegrini",pos:"LB",age:25,ovr:74,nat:"Italia"},
    ],
    "Lecce": [
      {name:"Wladimiro Falcone",pos:"GK",age:28,ovr:76,nat:"Italia"},
      {name:"Valentin Gendrey",pos:"RB",age:24,ovr:72,nat:"Francia"},
      {name:"Alexis Blin",pos:"CDM",age:28,ovr:72,nat:"Francia"},
      {name:"Federico Baschirotto",pos:"CB",age:28,ovr:74,nat:"Italia"},
      {name:"Antonino Gallo",pos:"LB",age:24,ovr:72,nat:"Italia"},
      {name:"Rémi Oudin",pos:"CAM",age:27,ovr:72,nat:"Francia"},
      {name:"Pontus Almqvist",pos:"RW",age:24,ovr:71,nat:"Suecia"},
      {name:"Lorenzo Colombo",pos:"ST",age:22,ovr:72,nat:"Italia"},
      {name:"Hamza Rafia",pos:"CM",age:24,ovr:70,nat:"Túnez"},
      {name:"Patrick Dorgu",pos:"LB",age:19,ovr:72,nat:"Dinamarca"},
      {name:"Nikola Krstovic",pos:"ST",age:24,ovr:73,nat:"Montenegro"},
      {name:"Lameck Banda",pos:"LW",age:23,ovr:71,nat:"Zambia"},
      {name:"Mads Hermansen",pos:"GK",age:24,ovr:75,nat:"Dinamarca"},
      {name:"Roberto Piccoli",pos:"ST",age:23,ovr:71,nat:"Italia"},
      {name:"Joan González",pos:"CM",age:20,ovr:69,nat:"España"},
    ],
    "Milan": [
      {name:"Mike Maignan",pos:"GK",age:28,ovr:87,nat:"Francia"},
      {name:"Davide Calabria",pos:"RB",age:27,ovr:80,nat:"Italia"},
      {name:"Malick Thiaw",pos:"CB",age:22,ovr:80,nat:"Alemania"},
      {name:"Fikayo Tomori",pos:"CB",age:26,ovr:82,nat:"Inglaterra"},
      {name:"Theo Hernández",pos:"LB",age:26,ovr:86,nat:"Francia"},
      {name:"Ruben Loftus-Cheek",pos:"CM",age:28,ovr:81,nat:"Inglaterra"},
      {name:"Tijjani Reijnders",pos:"CM",age:25,ovr:83,nat:"Países Bajos"},
      {name:"Yunus Musah",pos:"CM",age:21,ovr:77,nat:"Estados Unidos"},
      {name:"Samuel Chukwueze",pos:"RW",age:25,ovr:79,nat:"Nigeria"},
      {name:"Christian Pulisic",pos:"CAM",age:25,ovr:81,nat:"Estados Unidos"},
      {name:"Olivier Giroud",pos:"ST",age:37,ovr:82,nat:"Francia"},
      {name:"Rafael Leão",pos:"LW",age:25,ovr:85,nat:"Portugal"},
      {name:"Noah Okafor",pos:"LW",age:23,ovr:77,nat:"Suiza"},
      {name:"Strahinja Pavlovic",pos:"CB",age:23,ovr:78,nat:"Serbia"},
      {name:"Álvaro Morata",pos:"ST",age:31,ovr:82,nat:"España"},
      {name:"Emerson Royal",pos:"RB",age:25,ovr:77,nat:"Brasil"},
      {name:"Luka Jović",pos:"ST",age:26,ovr:76,nat:"Serbia"},
    ],
    "Napoli": [
      {name:"Alex Meret",pos:"GK",age:27,ovr:82,nat:"Italia"},
      {name:"Giovanni Di Lorenzo",pos:"RB",age:30,ovr:84,nat:"Italia"},
      {name:"Rrahmani",pos:"CB",age:29,ovr:80,nat:"Kosovo"},
      {name:"Natan",pos:"CB",age:23,ovr:74,nat:"Brasil"},
      {name:"Mathías Olivera",pos:"LB",age:26,ovr:79,nat:"Uruguay"},
      {name:"André-Frank Zambo Anguissa",pos:"CDM",age:28,ovr:83,nat:"Camerún"},
      {name:"Stanislav Lobotka",pos:"CDM",age:29,ovr:84,nat:"Eslovaquia"},
      {name:"Piotr Zielinski",pos:"CM",age:30,ovr:83,nat:"Polonia"},
      {name:"Khvicha Kvaratskhelia",pos:"LW",age:23,ovr:87,nat:"Georgia"},
      {name:"Matteo Politano",pos:"RW",age:30,ovr:79,nat:"Italia"},
      {name:"Victor Osimhen",pos:"ST",age:25,ovr:88,nat:"Nigeria"},
      {name:"Giacomo Raspadori",pos:"ST",age:24,ovr:80,nat:"Italia"},
      {name:"Giovanni Simeone",pos:"ST",age:28,ovr:78,nat:"Argentina"},
      {name:"Cyril Ngonge",pos:"LW",age:24,ovr:73,nat:"Bélgica"},
      {name:"Leo Östigård",pos:"CB",age:24,ovr:76,nat:"Noruega"},
      {name:"Alessio Zerbin",pos:"RW",age:25,ovr:72,nat:"Italia"},
    ],
    "Parma": [
      {name:"Zion Suzuki",pos:"GK",age:22,ovr:72,nat:"Japón"},
      {name:"Simy",pos:"ST",age:32,ovr:72,nat:"Nigeria"},
      {name:"Enrico Del Prato",pos:"CB",age:26,ovr:70,nat:"Italia"},
      {name:"Botond Balogh",pos:"CB",age:24,ovr:70,nat:"Hungría"},
      {name:"Nicolò Delprato",pos:"RB",age:25,ovr:71,nat:"Italia"},
      {name:"Dennis Man",pos:"RW",age:25,ovr:74,nat:"Rumanía"},
      {name:"Valentin Mihaila",pos:"LW",age:23,ovr:73,nat:"Rumanía"},
      {name:"Adrian Bernabé",pos:"CM",age:23,ovr:74,nat:"España"},
      {name:"Woyo Coulibaly",pos:"RB",age:24,ovr:70,nat:"Francia"},
      {name:"Emanuele Valeri",pos:"LB",age:24,ovr:69,nat:"Italia"},
      {name:"Goran Milosevic",pos:"CB",age:27,ovr:69,nat:"Serbia"},
      {name:"Matteo Cancellieri",pos:"LW",age:22,ovr:72,nat:"Italia"},
      {name:"Ange-Yoan Bonny",pos:"ST",age:20,ovr:70,nat:"Francia"},
      {name:"Antoine Hainaut",pos:"CB",age:22,ovr:69,nat:"Bélgica"},
      {name:"Pontus Almqvist",pos:"RW",age:24,ovr:70,nat:"Suecia"},
    ],
    "Pisa": [
      {name:"Zeljko Filipovic",pos:"GK",age:25,ovr:70,nat:"Serbia"},
      {name:"Matteo Tramoni",pos:"LW",age:23,ovr:70,nat:"Francia"},
      {name:"Aristides Mbergani",pos:"CB",age:22,ovr:67,nat:"Italia"},
      {name:"Lind",pos:"ST",age:24,ovr:69,nat:"Dinamarca"},
      {name:"Gabriel Charpentier",pos:"ST",age:24,ovr:70,nat:"Francia"},
      {name:"Jari Vandeputte",pos:"CM",age:28,ovr:70,nat:"Bélgica"},
      {name:"Yannick Esteves",pos:"RB",age:20,ovr:68,nat:"Francia"},
      {name:"Samuele Angori",pos:"LB",age:22,ovr:67,nat:"Italia"},
      {name:"Omar El Azzouzi",pos:"CDM",age:22,ovr:69,nat:"Marruecos"},
      {name:"Paolo Melegoni",pos:"CM",age:24,ovr:70,nat:"Italia"},
      {name:"Alessandro Arena",pos:"RW",age:24,ovr:67,nat:"Italia"},
      {name:"Edoardo Bonfanti",pos:"ST",age:23,ovr:68,nat:"Italia"},
      {name:"Jan Mlakar",pos:"LW",age:26,ovr:69,nat:"Eslovenia"},
      {name:"Matteo Gliozzi",pos:"ST",age:31,ovr:69,nat:"Italia"},
      {name:"Filippo Rinaldi",pos:"CM",age:24,ovr:67,nat:"Italia"},
    ],
    "Roma": [
      {name:"Rui Patrício",pos:"GK",age:36,ovr:81,nat:"Portugal"},
      {name:"Zeki Çelik",pos:"RB",age:27,ovr:78,nat:"Turquía"},
      {name:"Gianluca Mancini",pos:"CB",age:28,ovr:79,nat:"Italia"},
      {name:"Chris Smalling",pos:"CB",age:34,ovr:78,nat:"Inglaterra"},
      {name:"Leonardo Spinazzola",pos:"LB",age:31,ovr:79,nat:"Italia"},
      {name:"Bryan Cristante",pos:"CDM",age:29,ovr:79,nat:"Italia"},
      {name:"Lorenzo Pellegrini",pos:"CAM",age:28,ovr:82,nat:"Italia"},
      {name:"Leandro Paredes",pos:"CDM",age:30,ovr:79,nat:"Argentina"},
      {name:"Paulo Dybala",pos:"CAM",age:30,ovr:85,nat:"Argentina"},
      {name:"Stephan El Shaarawy",pos:"LW",age:31,ovr:79,nat:"Italia"},
      {name:"Romelu Lukaku",pos:"ST",age:31,ovr:83,nat:"Bélgica"},
      {name:"Evan Ndicka",pos:"CB",age:24,ovr:78,nat:"Francia"},
      {name:"Rasmus Kristensen",pos:"RB",age:27,ovr:74,nat:"Dinamarca"},
      {name:"Houssem Aouar",pos:"CM",age:26,ovr:77,nat:"Francia"},
      {name:"Eldor Shomurodov",pos:"ST",age:28,ovr:75,nat:"Uzbekistán"},
      {name:"Tommaso Baldanzi",pos:"CAM",age:21,ovr:74,nat:"Italia"},
    ],
    "Sassuolo": [
      {name:"Andrea Consigli",pos:"GK",age:37,ovr:78,nat:"Italia"},
      {name:"Nadir Zortea",pos:"RB",age:24,ovr:70,nat:"Italia"},
      {name:"Erlic",pos:"CB",age:27,ovr:74,nat:"Croacia"},
      {name:"Ruan Tressoldi",pos:"CB",age:24,ovr:72,nat:"Brasil"},
      {name:"Rogério",pos:"LB",age:26,ovr:73,nat:"Brasil"},
      {name:"Maxime López",pos:"CDM",age:26,ovr:76,nat:"Francia"},
      {name:"Davide Frattesi",pos:"CM",age:24,ovr:79,nat:"Italia"},
      {name:"Domenico Berardi",pos:"RW",age:30,ovr:82,nat:"Italia"},
      {name:"Armand Laurienté",pos:"LW",age:26,ovr:77,nat:"Francia"},
      {name:"Kristian Thorstvedt",pos:"CM",age:25,ovr:74,nat:"Noruega"},
      {name:"Agustin Alvarez Martinez",pos:"ST",age:23,ovr:74,nat:"Uruguay"},
      {name:"Andrea Pinamonti",pos:"ST",age:25,ovr:75,nat:"Italia"},
      {name:"Nedim Bajrami",pos:"CAM",age:24,ovr:74,nat:"Albania"},
      {name:"Myrto Uzuni",pos:"LW",age:27,ovr:73,nat:"Albania"},
      {name:"Luca Marchetti",pos:"GK",age:38,ovr:70,nat:"Italia"},
    ],
    "Torino": [
      {name:"Vanja Milinković-Savić",pos:"GK",age:27,ovr:79,nat:"Serbia"},
      {name:"Valentino Lazaro",pos:"RB",age:27,ovr:75,nat:"Austria"},
      {name:"Alessandro Buongiorno",pos:"CB",age:24,ovr:81,nat:"Italia"},
      {name:"Borna Sosa",pos:"LB",age:26,ovr:76,nat:"Croacia"},
      {name:"Perr Schuurs",pos:"CB",age:24,ovr:77,nat:"Países Bajos"},
      {name:"Samuele Ricci",pos:"CDM",age:23,ovr:78,nat:"Italia"},
      {name:"Ivan Ilic",pos:"CM",age:22,ovr:77,nat:"Serbia"},
      {name:"Nikola Vlasic",pos:"CAM",age:26,ovr:78,nat:"Croacia"},
      {name:"Duvan Zapata",pos:"ST",age:33,ovr:80,nat:"Colombia"},
      {name:"Antonio Sanabria",pos:"ST",age:28,ovr:75,nat:"Paraguay"},
      {name:"Nemanja Radonjic",pos:"LW",age:27,ovr:73,nat:"Serbia"},
      {name:"Ola Aina",pos:"RB",age:28,ovr:74,nat:"Nigeria"},
      {name:"Mergim Vojvoda",pos:"RB",age:28,ovr:73,nat:"Kosovo"},
      {name:"Karol Linetty",pos:"CM",age:29,ovr:74,nat:"Polonia"},
      {name:"Demba Seck",pos:"RW",age:23,ovr:71,nat:"Senegal"},
      {name:"Sasa Lukic",pos:"CM",age:27,ovr:74,nat:"Serbia"},
    ],
    "Udinese": [
      {name:"Marco Silvestri",pos:"GK",age:32,ovr:77,nat:"Italia"},
      {name:"Bram Nuytinck",pos:"CB",age:32,ovr:73,nat:"Países Bajos"},
      {name:"Thomas Kristensen",pos:"RB",age:24,ovr:72,nat:"Dinamarca"},
      {name:"Nehuen Pérez",pos:"CB",age:23,ovr:76,nat:"Argentina"},
      {name:"Adam Masina",pos:"LB",age:30,ovr:72,nat:"Marruecos"},
      {name:"Florian Thauvin",pos:"RW",age:31,ovr:79,nat:"Francia"},
      {name:"Lazar Samardzic",pos:"CM",age:22,ovr:79,nat:"Serbia"},
      {name:"Sandi Lovric",pos:"CM",age:25,ovr:74,nat:"Eslovenia"},
      {name:"Lorenzo Lucca",pos:"ST",age:23,ovr:76,nat:"Italia"},
      {name:"Isaac Success",pos:"ST",age:27,ovr:72,nat:"Nigeria"},
      {name:"Gerard Deulofeu",pos:"RW",age:30,ovr:78,nat:"España"},
      {name:"Jaka Bijol",pos:"CB",age:26,ovr:77,nat:"Eslovenia"},
      {name:"Kingsley Ehizibue",pos:"RB",age:28,ovr:71,nat:"Nigeria"},
      {name:"Destiny Udogie",pos:"LB",age:21,ovr:78,nat:"Italia"},
      {name:"Roberto Pereyra",pos:"CM",age:33,ovr:76,nat:"Argentina"},
      {name:"Tolgay Arslan",pos:"CDM",age:33,ovr:71,nat:"Alemania"},
    ],
    "Hellas Verona": [
      {name:"Lorenzo Montipò",pos:"GK",age:28,ovr:77,nat:"Italia"},
      {name:"Davide Faraoni",pos:"RB",age:31,ovr:73,nat:"Italia"},
      {name:"Isak Hien",pos:"CB",age:24,ovr:76,nat:"Suecia"},
      {name:"Federico Ceccherini",pos:"CB",age:33,ovr:72,nat:"Italia"},
      {name:"Giangiacomo Magnani",pos:"CB",age:27,ovr:72,nat:"Italia"},
      {name:"Josh Doig",pos:"LB",age:22,ovr:73,nat:"Escocia"},
      {name:"Adrien Tamèze",pos:"CDM",age:30,ovr:73,nat:"Francia"},
      {name:"Darko Lazovic",pos:"LM",age:32,ovr:73,nat:"Serbia"},
      {name:"Cyril Ngonge",pos:"LW",age:24,ovr:73,nat:"Bélgica"},
      {name:"Tijani Noslin",pos:"ST",age:24,ovr:72,nat:"Países Bajos"},
      {name:"Thomas Henry",pos:"ST",age:28,ovr:73,nat:"Francia"},
      {name:"Ondřej Duda",pos:"CAM",age:29,ovr:74,nat:"Eslovaquia"},
      {name:"Mattia Folorunsho",pos:"CM",age:25,ovr:73,nat:"Italia"},
      {name:"Milan Djuric",pos:"ST",age:33,ovr:72,nat:"Bosnia y Herzegovina"},
      {name:"Kevin Lasagna",pos:"ST",age:31,ovr:72,nat:"Italia"},
      {name:"Elif Elmas",pos:"CAM",age:25,ovr:75,nat:"Macedonia del Norte"},
    ],
  };

  FC.data = D;
})();
