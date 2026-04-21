import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const size = 256;
const data = Buffer.alloc(size * size * 4);

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 4;
  data[i] = r;
  data[i + 1] = g;
  data[i + 2] = b;
  data[i + 3] = a;
}

function blendPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 4;
  const alpha = a / 255;
  data[i] = Math.round(r * alpha + data[i] * (1 - alpha));
  data[i + 1] = Math.round(g * alpha + data[i + 1] * (1 - alpha));
  data[i + 2] = Math.round(b * alpha + data[i + 2] * (1 - alpha));
  data[i + 3] = 255;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
  const x = ax + t * dx;
  const y = ay + t * dy;
  return Math.hypot(px - x, py - y);
}

function line(ax, ay, bx, by, width, color) {
  const half = width / 2;
  for (let y = Math.floor(Math.min(ay, by) - width); y <= Math.ceil(Math.max(ay, by) + width); y += 1) {
    for (let x = Math.floor(Math.min(ax, bx) - width); x <= Math.ceil(Math.max(ax, bx) + width); x += 1) {
      const distance = distanceToSegment(x + 0.5, y + 0.5, ax, ay, bx, by);
      if (distance <= half) {
        const edge = Math.max(0, Math.min(1, half - distance));
        blendPixel(x, y, ...color, Math.round(255 * Math.min(1, 0.55 + edge)));
      }
    }
  }
}

function circle(cx, cy, radius, width, color) {
  for (let y = Math.floor(cy - radius - width); y <= Math.ceil(cy + radius + width); y += 1) {
    for (let x = Math.floor(cx - radius - width); x <= Math.ceil(cx + radius + width); x += 1) {
      const distance = Math.abs(Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - radius);
      if (distance <= width / 2) {
        blendPixel(x, y, ...color, Math.round(255 * (1 - distance / (width / 2)) * 0.9));
      }
    }
  }
}

function filledCircle(cx, cy, radius, color) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const distance = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (distance <= radius) {
        blendPixel(x, y, ...color, Math.round(255 * Math.min(1, radius - distance)));
      }
    }
  }
}

for (let y = 0; y < size; y += 1) {
  for (let x = 0; x < size; x += 1) {
    const t = (x + y) / (size * 2);
    const vignette = Math.hypot(x - size / 2, y - size / 2) / 180;
    setPixel(
      x,
      y,
      Math.max(13, Math.round(18 + 18 * t - 10 * vignette)),
      Math.max(20, Math.round(31 + 38 * t - 10 * vignette)),
      Math.max(25, Math.round(41 + 64 * t - 8 * vignette)),
    );
  }
}

for (let x = 36; x <= 220; x += 28) {
  line(x, 38, x, 218, 1.2, [36, 60, 74]);
}
for (let y = 36; y <= 220; y += 28) {
  line(38, y, 218, y, 1.2, [36, 60, 74]);
}

circle(128, 128, 78, 13, [69, 198, 219]);
circle(128, 128, 50, 5, [236, 242, 246]);
line(84, 178, 84, 78, 19, [236, 242, 246]);
line(84, 78, 172, 178, 19, [236, 242, 246]);
line(172, 178, 172, 78, 19, [236, 242, 246]);

filledCircle(190, 68, 12, [255, 209, 81]);
filledCircle(210, 98, 8, [255, 209, 81]);
filledCircle(61, 190, 8, [69, 198, 219]);

const raw = Buffer.alloc((size * 4 + 1) * size);
for (let y = 0; y < size; y += 1) {
  raw[y * (size * 4 + 1)] = 0;
  data.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, payload) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(payload.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, payload])));
  return Buffer.concat([length, typeBuffer, payload, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(size, 0);
ihdr.writeUInt32BE(size, 4);
ihdr[8] = 8;
ihdr[9] = 6;

mkdirSync("media", { recursive: true });
writeFileSync("media/icon.png", Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]));
