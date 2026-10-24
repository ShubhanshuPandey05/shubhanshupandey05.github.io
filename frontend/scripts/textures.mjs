// Renders the tiling textures in public/textures: cedar grain (both ways) and
// paper tooth. They are plain PNGs on purpose. An SVG filter used as a
// repeating background is re-run for every tile the browser paints, which is
// slow enough to hang a page; a bitmap is drawn once.
//
// Run with `npm run textures`. Output is deterministic.
import { mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/textures');

const seeded = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
    let c = index;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});

const crc = (bytes) => {
    let c = 0xffffffff;
    for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([length, body, sum]);
};

// Where these images come from, written into each file so the record travels with it.
const ORIGIN =
    'Origin: generated procedurally by frontend/scripts/textures.mjs (seeded value noise, deterministic). ' +
    'No image model and no source photograph. Regenerate with: npm run textures';

// 8-bit grey + alpha. `shade(x, y)` returns [grey, alpha], both 0 to 255.
const png = (width, height, shade) => {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 8;
    header[9] = 4;
    const rows = Buffer.alloc((width * 2 + 1) * height);
    for (let y = 0; y < height; y++) {
        const start = y * (width * 2 + 1);
        for (let x = 0; x < width; x++) {
            const [grey, alpha] = shade(x, y);
            rows[start + 1 + x * 2] = grey;
            rows[start + 2 + x * 2] = alpha;
        }
    }
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', header),
        chunk('tEXt', Buffer.concat([Buffer.from('impeccable:prompt'), Buffer.alloc(1), Buffer.from(ORIGIN, 'latin1')])),
        chunk('IDAT', deflateSync(rows, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]);
};

// Smooth noise along one axis that wraps at `cells`, so the tile is seamless.
const wrapNoise = (cells, seed) => {
    const random = seeded(seed);
    const values = Array.from({ length: cells }, () => random() * 2 - 1);
    return (position) => {
        const p = ((position % cells) + cells) % cells;
        const i = Math.floor(p);
        const t = p - i;
        const ease = t * t * (3 - 2 * t);
        return values[i] * (1 - ease) + values[(i + 1) % cells] * ease;
    };
};

// Cedar grain: tight streaks across the board, drifting slowly along it.
const grain = (size, seed) => {
    const octaves = [
        { cells: 128, weight: 0.5 },
        { cells: 61, weight: 0.34 },
        { cells: 23, weight: 0.2 },
    ].map((octave, index) => ({ ...octave, across: wrapNoise(octave.cells, seed + index * 13) }));
    const drift = wrapNoise(4, seed + 101);
    const figure = wrapNoise(7, seed + 211);
    return (across, along) => {
        const shift = drift((along / size) * 4) * 0.8;
        let value = 0;
        for (const octave of octaves) value += octave.across(((across + shift) / size) * octave.cells) * octave.weight;
        value += figure((along / size) * 7) * 0.05;
        // Dark streaks carry the grain; light ones only catch a little lamp.
        if (value < 0) return [0, level(Math.min(0.17, Math.max(0, -value - 0.06) * 0.42))];
        return [236, level(Math.min(0.035, Math.max(0, value - 0.14) * 0.11))];
    };
};

// Alpha from 0 to 1, in coarse steps so the file compresses well.
const level = (alpha) => Math.round(alpha * 64) * 4;

const tooth = (seed) => {
    const random = seeded(seed);
    return () => {
        const roll = random();
        if (roll < 0.09) return [52, Math.round((0.03 + random() * 0.13) * 255)];
        if (roll < 0.115) return [255, Math.round((0.04 + random() * 0.12) * 255)];
        return [0, 0];
    };
};

await mkdir(out, { recursive: true });

const SIZE = 256;
const vertical = grain(SIZE, 7);
const horizontal = grain(SIZE, 19);
const files = {
    'grain-v.png': png(SIZE, SIZE, (x, y) => vertical(x, y)),
    'grain-h.png': png(SIZE, SIZE, (x, y) => horizontal(y, x)),
    'tooth.png': png(192, 192, tooth(3)),
};

for (const [name, bytes] of Object.entries(files)) {
    await writeFile(path.join(out, name), bytes);
    console.log(`textures: ${name} ${(bytes.length / 1024).toFixed(1)} KB`);
}
