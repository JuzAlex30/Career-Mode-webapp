/* genicons.js — genera los iconos PNG de la PWA SIN dependencias.
   Dibuja el icono de marca (fondo oscuro + círculo verde + "CF") a alta
   resolución con supersampling y lo reduce para suavizar bordes, luego
   lo codifica a PNG (RGB truecolor) con zlib nativo de Node.
   Uso: node genicons.js  (genera icon-192.png, icon-512.png, apple-touch-icon.png) */
const fs = require("fs");
const zlib = require("zlib");

// Paleta de marca
const BG = [11, 16, 21];      // #0b1015
const GREEN = [0, 225, 160];  // #00e1a0
const SS = 4;                  // factor de supersampling (antialiasing)

// Bitmap font 5x7 para "C" y "F"
const FONT = {
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
};

function renderIcon(size) {
  const N = size * SS;
  // Buffer RGB a alta resolución
  const hi = new Uint8Array(N * N * 3);
  const setHi = (x, y, c) => { const i = (y * N + x) * 3; hi[i] = c[0]; hi[i+1] = c[1]; hi[i+2] = c[2]; };

  // Fondo + círculo
  const cx = N / 2, cy = N / 2, r = N * 0.40, r2 = r * r;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = x - cx, dy = y - cy;
      setHi(x, y, (dx*dx + dy*dy) <= r2 ? GREEN : BG);
    }
  }

  // "CF" recortado en oscuro sobre el círculo
  const letterH = N * 0.42;
  const unit = letterH / 7;              // tamaño de celda de fuente
  const gap = unit;                       // separación entre letras
  const totalW = (5 + 5) * unit + gap;
  let startX = cx - totalW / 2;
  const startY = cy - letterH / 2 + unit * 0.15; // ligero ajuste óptico
  ["C", "F"].forEach(ch => {
    const g = FONT[ch];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (g[row][col] === "1") {
          const px0 = Math.round(startX + col * unit);
          const px1 = Math.round(startX + (col + 1) * unit);
          const py0 = Math.round(startY + row * unit);
          const py1 = Math.round(startY + (row + 1) * unit);
          for (let y = py0; y < py1; y++)
            for (let x = px0; x < px1; x++)
              if (x >= 0 && x < N && y >= 0 && y < N) setHi(x, y, BG);
        }
      }
    }
    startX += 5 * unit + gap;
  });

  // Downsample (box filter) a tamaño final
  const out = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r0 = 0, g0 = 0, b0 = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y*SS + sy) * N + (x*SS + sx)) * 3;
          r0 += hi[i]; g0 += hi[i+1]; b0 += hi[i+2];
        }
      }
      const n = SS * SS, o = (y * size + x) * 3;
      out[o] = Math.round(r0 / n); out[o+1] = Math.round(g0 / n); out[o+2] = Math.round(b0 / n);
    }
  }
  return out;
}

// --- Codificación PNG (RGB, color type 2) ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(rgb, size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  // raw scanlines con filtro 0
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    rgb.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

[["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]].forEach(([name, size]) => {
  const png = encodePNG(renderIcon(size), size);
  fs.writeFileSync(name, png);
  console.log("✓ " + name + " (" + size + "x" + size + ", " + (png.length / 1024).toFixed(1) + " KB)");
});
