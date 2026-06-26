/* gensocial.js — genera social.png (1200×630) para metaetiquetas OG/Twitter.
   Sin dependencias externas. Uso: node gensocial.js */
const fs = require("fs");
const zlib = require("zlib");

const W = 1200, H = 630;

const BG    = [11, 16, 21];
const PANEL = [16, 25, 36];
const GREEN = [0, 225, 160];
const WHITE = [255, 255, 255];
const DIM   = [90, 120, 145];
const RING  = [30, 50, 70];
const DIVIDER = [14, 20, 28];
const DECOR = [20, 31, 44];

const buf = Buffer.alloc(W * H * 3);

function setpx(x, y, c) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0]; buf[i+1] = c[1]; buf[i+2] = c[2];
}

function rect(x0, y0, x1, y1, c) {
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++)
      setpx(x, y, c);
}

function circle(cx, cy, r, c) {
  const r2 = r * r;
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx*dx + dy*dy <= r2) setpx(cx+dx, cy+dy, c);
}

const GLYPHS = {
  A: ["01110","10001","10001","11111","10001","10001","10001"],
  B: ["11110","10001","10001","11110","10001","10001","11110"],
  C: ["01110","10001","10000","10000","10000","10001","01110"],
  D: ["11110","10001","10001","10001","10001","10001","11110"],
  E: ["11111","10000","10000","11110","10000","10000","11111"],
  F: ["11111","10000","10000","11110","10000","10000","10000"],
  I: ["01110","00100","00100","00100","00100","00100","01110"],
  M: ["10001","11011","10101","10001","10001","10001","10001"],
  N: ["10001","11001","10101","10011","10001","10001","10001"],
  O: ["01110","10001","10001","10001","10001","10001","01110"],
  P: ["11110","10001","10001","11110","10000","10000","10000"],
  R: ["11110","10001","10001","11110","10100","10010","10001"],
};

function drawChar(ch, ox, oy, cell, col) {
  const g = GLYPHS[ch];
  if (!g) return;
  for (let row = 0; row < 7; row++)
    for (let c5 = 0; c5 < 5; c5++)
      if (g[row][c5] === "1")
        rect(ox + c5*cell, oy + row*cell, ox + (c5+1)*cell, oy + (row+1)*cell, col);
}

function drawText(str, ox, oy, cell, col) {
  const adv = 6 * cell;
  for (let i = 0; i < str.length; i++)
    if (str[i] !== " ") drawChar(str[i], ox + i*adv, oy, cell, col);
}

// Fondo
rect(0, 0, W, H, BG);

// Panel derecho
rect(370, 0, W, H, PANEL);

// Divisor sutil
rect(368, 0, 372, H, DIVIDER);

// Círculos decorativos (fondo, muy suaves)
circle(1100, 90, 70, DECOR);
circle(1145, 550, 48, DECOR);

// Logo: anillo + círculo verde + CF
circle(185, 315, 168, RING);
circle(185, 315, 155, GREEN);

// CF en el círculo
const unit = 18;
const cfX = Math.round(185 - 11*unit/2);  // = 86
const cfY = Math.round(315 - 7*unit/2);   // = 252
drawChar("C", cfX, cfY, unit, BG);
drawChar("F", cfX + 6*unit, cfY, unit, BG);

// Línea de acento verde
rect(430, 238, 1150, 242, GREEN);

// Título "BOARDROOM"
drawText("BOARDROOM", 430, 253, 10, WHITE);

// Tagline "MODO CARRERA COMPANION"
drawText("MODO CARRERA COMPANION", 430, 360, 5, DIM);

// PNG encoder ─────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(b) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

function encodePNG(rgb, w, h) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const png = encodePNG(buf, W, H);
fs.writeFileSync("social.png", png);
console.log("✓ social.png (1200×630, " + (png.length / 1024).toFixed(1) + " KB)");
