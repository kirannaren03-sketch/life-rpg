import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate raw PNG file without external dependencies
function createPNG(width, height, drawFn) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // Scanlines with filter type 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let scanlineOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[scanlineOffset++] = 0; // Filter: None
    buffer.copy(scanlines, scanlineOffset, y * width * 4, (y + 1) * width * 4);
    scanlineOffset += width * 4;
  }

  const deflated = zlib.deflateSync(scanlines, { level: 9 });

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c >>> 0;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const toCrc = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Renderer for Life RPG App Icon (Electric Blue & Emerald Green Hex/Shield)
function renderIcon(isMaskable) {
  return (x, y, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = w / 2;

    // Background gradient from dark navy #0a0f24 to deeper #030409
    const bgFactor = y / h;
    let r = Math.round(10 * (1 - bgFactor) + 4 * bgFactor);
    let g = Math.round(15 * (1 - bgFactor) + 6 * bgFactor);
    let b = Math.round(36 * (1 - bgFactor) + 12 * bgFactor);
    let a = 255;

    // Corner clipping if not maskable
    if (!isMaskable) {
      const cornerR = w * 0.22;
      const cornerDx = Math.max(0, Math.abs(dx) - (w / 2 - cornerR));
      const cornerDy = Math.max(0, Math.abs(dy) - (h / 2 - cornerR));
      if (cornerDx > 0 && cornerDy > 0) {
        const cDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
        if (cDist > cornerR) {
          return [0, 0, 0, 0];
        }
      }
    }

    // Glow circle in center
    const glowRadius = isMaskable ? w * 0.38 : w * 0.42;
    if (dist < glowRadius) {
      const glowIntensity = Math.pow(1 - dist / glowRadius, 1.8);
      r = Math.min(255, Math.round(r + 0 * glowIntensity));
      g = Math.min(255, Math.round(g + 180 * glowIntensity));
      b = Math.min(255, Math.round(b + 255 * glowIntensity));
    }

    // Diamond / Hexagon Shield Motif in Center
    const scale = isMaskable ? 0.65 : 0.78;
    const nx = Math.abs(dx) / (w * scale * 0.5);
    const ny = Math.abs(dy) / (h * scale * 0.5);
    const diamondVal = nx + ny;

    // Outer border of diamond
    if (diamondVal <= 1.05 && diamondVal >= 0.90) {
      // Cyan to Emerald gradient
      const t = (x + y) / (w + h);
      const er = Math.round(0 * (1 - t) + 16 * t);
      const eg = Math.round(240 * (1 - t) + 220 * t);
      const eb = Math.round(255 * (1 - t) + 130 * t);
      return [er, eg, eb, 255];
    }

    // Inner diamond fill
    if (diamondVal < 0.90) {
      r = Math.round(12 + (1 - diamondVal) * 20);
      g = Math.round(20 + (1 - diamondVal) * 35);
      b = Math.round(45 + (1 - diamondVal) * 70);

      // Central cross/sword core
      if (Math.abs(dx) < w * 0.04 && Math.abs(dy) < h * 0.3) {
        return [255, 255, 255, 255];
      }
      if (Math.abs(dy - h * 0.05) < h * 0.035 && Math.abs(dx) < w * 0.16) {
        return [0, 240, 255, 255];
      }
      if (Math.abs(dy - h * 0.16) < h * 0.025 && Math.abs(dx) < w * 0.10) {
        return [16, 185, 129, 255];
      }
      // Center star gem
      if (dist < w * 0.07) {
        return [255, 255, 255, 255];
      }
    }

    return [r, g, b, a];
  };
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, renderIcon(false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, renderIcon(false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, renderIcon(true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, renderIcon(false)));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(32, 32, renderIcon(false)));

console.log('Successfully generated all PWA icons in /public!');
