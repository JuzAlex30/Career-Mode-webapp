# ⚽ Carrera FC — Compañero del Modo Carrera de EA Sports FC

Una web/app para **vivir, gestionar y conservar** tu Modo Carrera (modo Mánager) de EA Sports FC.
Convierte cada partida en una historia persistente: registra partidos, mira tu clasificación
autocalculada, supera retos con un vigilante de reglas y construye el legado de tu club.

> Hecho para FC 26 (y preparado para futuras ediciones). Funciona sin instalar nada.

---

## 🚀 Cómo abrirla

**Opción A — Doble clic (lo más fácil)**
`index.html` es **un único archivo autocontenido** (lleva el CSS y el JS dentro), así que
funciona con doble clic en cualquier navegador (Chrome, Edge, Firefox…). Si te abre un visor
raro y se ve sin estilos, ábrelo con Chrome o Edge (clic derecho → *Abrir con*).

**Opción B — Con servidor local**
Necesitas [Node.js](https://nodejs.org) instalado. En esta carpeta:

```bash
npm start
```

Y abre `http://localhost:4321`.

Tus datos se guardan en el navegador. Usa **Ajustes → Exportar** para hacer copias de
seguridad o llevarte tu carrera a otro dispositivo.

> **Para desarrollar:** edita los ficheros fuente (`styles.css`, `js/*.js`) y ejecuta
> `npm run build` para regenerar el `index.html` autocontenido. `npm start` ya hace el build.

---

## 🧩 Qué incluye (MVP)

- **Panel** — posición, puntos, % victorias, goles, racha, últimos partidos, objetivos de la
  junta con barras de progreso y alertas (contratos, retos, títulos).
- **Partidos** — registra cada partido una vez (marcador, goleadores, asistentes, MOTM) y el
  resto se calcula solo. Multi-competición y multi-temporada.
- **Clasificación** — tabla de liga autocalculada con zonas de competición, máximos goleadores
  y asistentes, y un **generador de cuadros de copa** (sorteo aleatorio y avance de rondas).
- **Plantilla** — jugadores con OVR/POT, posición, edad y estadísticas de la temporada.
- **Retos y logros** — catálogo de retos (Road to Glory, Solo Cantera, Triplete…), **constructor
  de reglas personalizadas**, un **vigilante** que detecta infracciones, racha de pureza y
  logros con tiers (bronce → leyenda) que se desbloquean solos.
- **Historia** — vitrina de trofeos, récords históricos, premios individuales, resumen por
  temporadas y diario de la carrera.
- **Scouting** — buscador de wonderkids de FC 26 con filtros y shortlist (datos de referencia).
- **Ajustes y datos** — varias carreras, nueva temporada, exportar/importar, tema claro/oscuro.

---

## ⚠️ Sobre los datos

EA Sports FC **no tiene una API oficial del Modo Carrera**: los datos están en tu partida, en
local. Por eso esta app usa **entrada manual asistida** y **nada se sincroniza automáticamente**.

En la hoja de ruta (capas opcionales):
- Importar hojas de cálculo (CSV/Excel) de la comunidad.
- Subir el *save* de PC (solo lectura) para volcar tu plantilla real.
- OCR de capturas para reducir el tecleo.
- Cuentas en la nube + comunidad: compartir carreras, leaderboards y Hall of Fame.

---

## 🗂️ Estructura

```
index.html        · ARCHIVO GENERADO autocontenido (lo que abres). No lo edites a mano.
build.js          · incrusta CSS + JS en index.html  (npm run build)
styles.css        · estilos (tema oscuro/claro)            ← fuente
js/data.js        · ligas, wonderkids, retos, reglas, logros ← fuente
js/core.js        · estado, persistencia, cálculos, router, iconos y gráficas ← fuente
js/views.js       · todas las vistas y modales              ← fuente
js/app.js         · arranque, navegación y tema             ← fuente
server.js         · servidor estático mínimo (sin dependencias)
```

Sin frameworks ni dependencias externas: HTML, CSS y JavaScript puro.
