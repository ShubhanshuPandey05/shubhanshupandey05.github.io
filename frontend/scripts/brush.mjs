// Fetches stroke data for the brush-written kanji from AnimCJK and writes
// src/brush/glyphs.json. Each stroke keeps its outline (the brush shape) and its
// median (the path the brush travels), in true stroke order.
//
// Run with `npm run brush` after changing brushWords in src/content/site.js.
// Kanji outlines are under the Arphic Public License, kana under the LGPL; see
// src/brush/LICENSE.md.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://raw.githubusercontent.com/parsimonhi/animCJK/master';
const { brushWords } = await import(pathToFileURL(path.join(root, 'src/content/site.js')).href);

const isKana = (char) => /[぀-ヿ]/.test(char);

const parse = (svg) => {
    const outlines = new Map();
    for (const [, id, d] of svg.matchAll(/<path id="(z\d+d\w+)" d="([^"]+)"/g)) {
        outlines.set(id, d.replace(/\s+/g, ' ').trim());
    }
    const clips = new Map();
    for (const [, clipId, outlineId] of svg.matchAll(/<clipPath id="(z\d+c\w+)"><use (?:xlink:)?href="#(z\d+d\w+)"/g)) {
        clips.set(clipId, outlineId);
    }
    const strokes = [];
    for (const [, clipId, d] of svg.matchAll(/<path style="[^"]*"(?: pathLength="\d+")? clip-path="url\(#(z\d+c\w+)\)" d="([^"]+)"/g)) {
        const outline = outlines.get(clips.get(clipId));
        if (outline) strokes.push({ o: outline, m: d.replace(/\s+/g, ' ').trim() });
    }
    return strokes;
};

const chars = [...new Set(brushWords.join(''))];
const glyphs = {};
const missing = [];

for (const char of chars) {
    const dir = isKana(char) ? 'svgsJaKana' : 'svgsJa';
    const res = await fetch(`${base}/${dir}/${char.codePointAt(0)}.svg`);
    const strokes = res.ok ? parse(await res.text()) : [];
    if (strokes.length === 0) {
        missing.push(char);
        continue;
    }
    glyphs[char] = strokes;
}

await mkdir(path.join(root, 'src/brush'), { recursive: true });
await writeFile(path.join(root, 'src/brush/glyphs.json'), JSON.stringify(glyphs));

const strokeCount = Object.values(glyphs).reduce((sum, strokes) => sum + strokes.length, 0);
console.log(`brush: ${Object.keys(glyphs).length} glyphs, ${strokeCount} strokes`);
if (missing.length) {
    console.error(`brush: no stroke data for ${missing.join(' ')}`);
    process.exitCode = 1;
}
