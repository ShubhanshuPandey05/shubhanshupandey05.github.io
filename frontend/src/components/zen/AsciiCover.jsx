import { useEffect, useState } from 'react';
import { useInView } from './useInView';
import { prefersReducedMotion } from './motion';

// Small animated text illustrations, one per project.
// Markup: {r:text} crimson, {p:text} pink, {d:text} dim.

const pad = (s, n) => (s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length));

const mapArt = (f) => {
    const W = 40;
    const H = 13;
    const grid = Array.from({ length: H }, (_, r) =>
        Array.from({ length: W }, (_, c) => {
            const v = c % 7 === 3;
            const hz = r % 4 === 1;
            if (v && hz) return '┼';
            if (v) return '│';
            if (hz) return '─';
            return ' ';
        })
    );
    const marks = Array.from({ length: H }, () => Array(W).fill(''));
    for (let c = 0; c < W; c++) {
        const r = Math.round(8 + 1.6 * Math.sin(c / 4.5));
        if (r >= 0 && r < H) {
            grid[r][c] = '~';
            marks[r][c] = 'p';
        }
    }
    const pins = [[2, 6], [5, 17], [3, 29], [9, 12], [10, 33], [6, 37], [11, 22]];
    pins.forEach(([r, c], i) => {
        const hot = Math.floor(f / 4) % pins.length === i;
        grid[r][c] = hot ? '◉' : '▼';
        marks[r][c] = hot ? 'p' : 'r';
    });
    // A radar sweep column.
    const sweep = (f * 2) % W;
    const lines = grid.map((row, r) =>
        row
            .map((ch, c) => {
                if (marks[r][c]) return `{${marks[r][c]}:${ch}}`;
                if (c === sweep && ch === ' ') return '{d:·}';
                return ch;
            })
            .join('')
    );
    const n = 2481 + (Math.floor(f / 6) % 9);
    lines.push('');
    lines.push(`{r:▼} ${n.toLocaleString('en-IN')} jobs nearby   {d:re-indexed twice a day}`);
    return lines;
};

const WAVE = '▁▂▃▄▅▆▇';
const voiceArt = (f) => {
    const dot = (len, off) => {
        const p = (f + off) % len;
        return Array.from({ length: len }, (_, i) => (i === p ? '{r:●}' : '─')).join('');
    };
    const wave = Array.from({ length: 9 }, (_, i) => WAVE[Math.floor((Math.sin(f * 0.9 + i * 1.3) * 0.5 + 0.5) * 6.99)]).join('');
    return [
        '',
        ` VOICE  ${dot(10, 0)}╮`,
        '                  │       ╭───────────╮',
        ` SMS    ${dot(10, 3)}┼─────▶ │ {p:${wave}} │`,
        '                  │       ╰───────────╯',
        ` WEB    ${dot(10, 6)}╯        {d:one context}`,
        '',
        ` {d:llm:} ${['claude', 'gpt', 'llama'][Math.floor(f / 10) % 3].padEnd(7)} {d:tts:} ${['eleven', 'polly', 'azure'][Math.floor(f / 13) % 3].padEnd(7)} {d:stt:} deepgram`,
        ` {r:●} live   {d:switch providers at runtime}`,
    ];
};

const formsArt = (f) => {
    const cycle = f % 60;
    const type = (s, start) => s.slice(0, Math.max(0, Math.min(s.length, cycle - start)));
    const name = type('shubhanshu', 0);
    const email = type('hi@yoursite.dev', 10);
    const msg = type("let's build it", 25);
    const sent = cycle > 44;
    return [
        ' ┌──────────────────────────────┐',
        ` │ name   [${pad(name + (cycle < 10 ? '_' : ''), 18)}]  │`,
        ` │ email  [${pad(email + (cycle >= 10 && cycle < 25 ? '_' : ''), 18)}]  │`,
        ` │ note   [${pad(msg + (cycle >= 25 && cycle < 40 ? '_' : ''), 18)}]  │`,
        ` │                 ${sent ? '{r:[ SENT ok ]}' : cycle > 40 ? '{p:[ SEND > ]}' : '[ SEND > ]'}   │`,
        ' └──────────────────────────────┘',
        '',
        sent ? '   {p:@} -> inbox   {r:######}  smtp ok' : '   {d:@ -> inbox   ......  waiting}',
        sent ? '   {r:●} new response · dashboard (12)' : '   {d:○ dashboard (11)}',
    ];
};

const peakArt = () => ['', '        {r:@@@@}', '      {r:@@@@@@@@}', '     /\\   /\\', '    /  \\_/  \\', '   /          \\', '  /            \\'];

const ARTS = { geojobs: mapArt, voice: voiceArt, forms: formsArt };

const render = (line, i) => {
    const parts = [];
    const re = /\{([rpd]):([^}]*)\}/g;
    let last = 0;
    let m;
    while ((m = re.exec(line))) {
        if (m.index > last) parts.push(line.slice(last, m.index));
        parts.push(
            <span key={m.index} className={`zn-c-${m[1]}`}>
                {m[2]}
            </span>
        );
        last = re.lastIndex;
    }
    if (last < line.length) parts.push(line.slice(last));
    return (
        <span key={i} className="zn-cover__line">
            {parts}
            {'\n'}
        </span>
    );
};

const AsciiCover = ({ coverKey, title }) => {
    const [ref, seen] = useInView('0px');
    const [f, setF] = useState(30);
    useEffect(() => {
        if (!seen || prefersReducedMotion()) return undefined;
        const id = setInterval(() => setF((x) => x + 1), 140);
        return () => clearInterval(id);
    }, [seen]);
    const art = (ARTS[coverKey] || peakArt)(f);
    return (
        <pre ref={ref} className="zn-cover" role="img" aria-label={`Text illustration for ${title}`}>
            {art.map(render)}
        </pre>
    );
};

export default AsciiCover;
