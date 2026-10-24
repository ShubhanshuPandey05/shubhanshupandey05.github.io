// Self-hosts the site's fonts in public/fonts and writes src/fonts.css.
//
// Latin is Google Fonts' stock "latin" subset. Japanese is cut down to exactly
// the characters that appear in src/ and index.html, so the four Japanese faces
// cost a few kilobytes instead of megabytes. Run `npm run fonts` after adding
// Japanese copy, or a new character will fall back to the system font.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public/fonts');
// Google only serves woff2 to a browser it recognises.
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const faces = [
    { family: 'Shippori Mincho B1', weights: [500, 800], latin: true, japanese: true },
    { family: 'Zen Kaku Gothic New', weights: [400, 500, 700], latin: true, japanese: true },
    { family: 'Yuji Boku', weights: [400], latin: false, japanese: true },
    { family: 'M PLUS 1 Code', weights: [400, 500], latin: true, japanese: false },
];

const walk = async (dir) => {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        entries.map((entry) => {
            const full = path.join(dir, entry.name);
            return entry.isDirectory() ? walk(full) : full;
        })
    );
    return files.flat();
};

const japaneseChars = async () => {
    const files = (await walk(path.join(root, 'src'))).filter((file) => /\.(jsx?|css)$/.test(file));
    files.push(path.join(root, 'index.html'));
    const found = new Set();
    for (const file of files) {
        const text = await readFile(file, 'utf8');
        for (const char of text.match(/[　-ヿ一-鿿＀-￯〒◎○△]/g) ?? []) found.add(char);
    }
    return [...found].sort();
};

const unicodeRange = (chars) => {
    const points = chars.map((char) => char.codePointAt(0)).sort((a, b) => a - b);
    const ranges = [];
    for (const point of points) {
        const last = ranges[ranges.length - 1];
        if (last && point === last[1] + 1) last[1] = point;
        else ranges.push([point, point]);
    }
    const hex = (n) => n.toString(16).toUpperCase();
    return ranges.map(([from, to]) => (from === to ? `U+${hex(from)}` : `U+${hex(from)}-${hex(to)}`)).join(', ');
};

const cssFor = async (family, weight, text) => {
    const params = `family=${family.replace(/ /g, '+')}:wght@${weight}&display=swap${text ? `&text=${encodeURIComponent(text)}` : ''}`;
    const res = await fetch(`https://fonts.googleapis.com/css2?${params}`, { headers: { 'User-Agent': userAgent } });
    if (!res.ok) throw new Error(`${family} ${weight}: Google Fonts answered ${res.status}`);
    return res.text();
};

const download = async (url, name) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${name}: download failed with ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(outDir, name), bytes);
    return bytes.length;
};

const slug = (family) => family.toLowerCase().replace(/ /g, '-');

await mkdir(outDir, { recursive: true });
const chars = await japaneseChars();
const rules = [];
let total = 0;

for (const face of faces) {
    for (const weight of face.weights) {
        if (face.latin) {
            const css = await cssFor(face.family, weight);
            const block = css.match(/\/\* latin \*\/\s*@font-face\s*{([^}]+)}/);
            if (!block) throw new Error(`${face.family} ${weight}: no latin subset in the response`);
            const url = block[1].match(/url\(([^)]+)\)/)[1];
            const range = block[1].match(/unicode-range:\s*([^;]+);/)[1];
            const name = `${slug(face.family)}-${weight}-latin.woff2`;
            total += await download(url, name);
            rules.push({ family: face.family, weight, name, range });
        }
        if (face.japanese && chars.length) {
            const css = await cssFor(face.family, weight, chars.join(''));
            const url = css.match(/url\(([^)]+)\)/)[1];
            const name = `${slug(face.family)}-${weight}-jp.woff2`;
            total += await download(url, name);
            rules.push({ family: face.family, weight, name, range: unicodeRange(chars) });
        }
    }
}

const css = [
    '/* Written by scripts/fonts.mjs. Run `npm run fonts` instead of editing. */',
    ...rules.map(
        ({ family, weight, name, range }) =>
            `@font-face {\n  font-family: '${family}';\n  font-style: normal;\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('/fonts/${name}') format('woff2');\n  unicode-range: ${range};\n}`
    ),
    '',
].join('\n\n');

await writeFile(path.join(root, 'src/fonts.css'), css);
console.log(`fonts: ${rules.length} files, ${(total / 1024).toFixed(0)} KB, ${chars.length} Japanese characters`);
