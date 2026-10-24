import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confetti, unlock } from '../secrets';

const JOKES = [
    'There are 2 hard problems in computer science: cache invalidation, naming things, and off-by-one errors.',
    'I would tell you a UDP joke, but you might not get it.',
    'A SQL query walks into a bar, walks up to two tables and asks: “Can I join you?”',
    'It works on my machine. Then we’ll ship your machine.',
    'Why did the developer go broke? He used up all his cache.',
    'Knock knock. Race condition. Who’s there?',
];

const SUGGEST = ['help', 'whoami', 'projects', 'skills', 'ping', 'joke', 'sudo hire-me'];

const Line = ({ l }) => {
    if (l.type === 'cmd')
        return (
            <p className="sp-term__cmd">
                <span className="sp-term__prompt">guest@shubhanshu:~$</span> {l.text}
            </p>
        );
    return <div className={`sp-term__out ${l.kind ? `is-${l.kind}` : ''}`}>{l.node ?? l.text}</div>;
};

const Terminal = ({ data }) => {
    const { profile, projects, skills, socials, experience } = data;
    const navigate = useNavigate();
    const [lines, setLines] = useState(() => [
        { type: 'out', text: 'shubhanshu-os 2.6.0 (tty1)', kind: 'dim' },
        {
            type: 'out',
            node: (
                <>
                    Welcome. Type <b>help</b> to see what you can do, or tap a suggestion below.
                </>
            ),
        },
    ]);
    const [value, setValue] = useState('');
    const [hist, setHist] = useState([]);
    const [hIdx, setHIdx] = useState(-1);
    const input = useRef(null);
    const screen = useRef(null);
    const busy = useRef(false);

    useEffect(() => {
        const el = screen.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [lines]);

    const print = (...outs) => setLines((l) => [...l, ...outs.map((o) => (typeof o === 'string' ? { type: 'out', text: o } : { type: 'out', ...o }))]);

    const hire = () => {
        unlock('hire');
        const r = screen.current?.getBoundingClientRect();
        if (r) confetti(r.left + r.width / 2, r.top + r.height / 2, 160);
        print(
            { text: '[sudo] password for guest: ********', kind: 'dim' },
            { text: 'Permission granted. Excellent decision.', kind: 'ok' },
            {
                node: (
                    <>
                        Drafting an email…{' '}
                        <a href={`mailto:${profile.email}?subject=Let%27s%20work%20together`}>open it ↗</a>
                    </>
                ),
            }
        );
    };

    const COMMANDS = {
        help: () =>
            print({
                node: (
                    <div className="sp-term__grid">
                        {[
                            ['whoami', 'who is this guy'],
                            ['about', 'the short version'],
                            ['experience', 'where I’ve worked'],
                            ['projects', 'things I built'],
                            ['open <n>', 'open project n'],
                            ['skills', 'my toolbox'],
                            ['contact', 'how to reach me'],
                            ['resume', 'open my résumé'],
                            ['ping', 'check I’m alive'],
                            ['joke', 'backend humour'],
                            ['clear', 'clean the screen'],
                            ['history', 'what you typed'],
                        ].map(([c, d]) => (
                            <span key={c}>
                                <b>{c}</b>
                                <i>{d}</i>
                            </span>
                        ))}
                    </div>
                ),
            }, { text: 'There are a few hidden commands too.', kind: 'dim' }),
        whoami: () => print(`guest. But you could be my next teammate.`),
        about: () =>
            print(
                `${profile.name}: ${profile.title.toLowerCase()} in ${profile.location}.`,
                'Node.js and Python, Postgres and Mongo, Redis and BullMQ, and the unglamorous parts in between: retries, idempotency, caching and Nginx configs.'
            ),
        experience: () =>
            print(
                ...experience.map((j) => ({
                    node: (
                        <>
                            <b>{j.company}</b> <i>{j.role}</i> <span className="sp-dim">{j.start} – {j.end}</span>
                        </>
                    ),
                }))
            ),
        projects: () =>
            print(
                ...projects.map((p, i) => ({
                    node: (
                        <>
                            <span className="sp-dim">[{i + 1}]</span> <b>{p.title}</b> <i>{p.deck}</i>
                        </>
                    ),
                })),
                { text: 'Tip: open 1', kind: 'dim' }
            ),
        ls: () => print(projects.map((p) => `${p.title.toLowerCase().replace(/\s+/g, '-')}/`).join('   ') + '   resume.pdf   secrets.txt'),
        open: (arg) => {
            const n = parseInt(arg, 10);
            const p = projects[n - 1] || projects.find((x) => x.title.toLowerCase().includes((arg || '').toLowerCase()) && arg);
            if (!p) return print({ text: 'usage: open <number>   (try: projects)', kind: 'err' });
            const url = p.liveUrl || p.githubUrl;
            if (!url) return print({ text: `${p.title} has no public link yet.`, kind: 'err' });
            window.open(url, '_blank', 'noopener');
            return print({ text: `opening ${url} …`, kind: 'ok' });
        },
        skills: () => {
            const cats = [...new Set(skills.map((s) => s.category || 'Other'))];
            print(
                ...cats.map((c) => ({
                    node: (
                        <>
                            <b>{c.padEnd(9, ' ')}</b>{' '}
                            {skills
                                .filter((s) => (s.category || 'Other') === c)
                                .map((s) => s.name)
                                .join(', ')}
                        </>
                    ),
                }))
            );
        },
        contact: () =>
            print(
                { node: <>email    <a href={`mailto:${profile.email}`}>{profile.email}</a></> },
                ...socials.map((s) => ({
                    node: (
                        <>
                            {s.platform.toLowerCase().padEnd(8, ' ')} <a href={s.url} target="_blank" rel="noreferrer">{s.url.replace(/^https?:\/\//, '')}</a>
                        </>
                    ),
                }))
            ),
        resume: () => {
            print({ text: 'opening résumé…', kind: 'ok' });
            setTimeout(() => navigate('/resume'), 500);
        },
        ping: async () => {
            for (let i = 0; i < 4; i++) {
                await new Promise((r) => setTimeout(r, 380));
                print(`64 bytes from shubhanshu.dev: icmp_seq=${i + 1} ttl=64 time=${(8 + Math.random() * 9).toFixed(1)} ms`);
            }
            print({ text: '4 packets transmitted, 4 received, 0% packet loss. Still alive.', kind: 'ok' });
        },
        joke: () => print(JOKES[(Math.random() * JOKES.length) | 0]),
        date: () => print(new Date().toString()),
        echo: (arg) => print(arg || ''),
        history: () => print(...(hist.length ? hist.map((h, i) => `${String(i + 1).padStart(3, ' ')}  ${h}`) : ['(empty)'])),
        clear: () => setLines([]),
        cat: (arg) => {
            if (/secrets/.test(arg || '')) return print('1. there is a tracker in the bottom-left corner.', '2. ↑ ↑ ↓ ↓ ← → ← → b a', '3. hiring me requires root.');
            if (/resume/.test(arg || '')) return COMMANDS.resume();
            return print({ text: `cat: ${arg || ''}: no such file`, kind: 'err' });
        },
        sudo: (arg) => {
            if (/hire/.test(arg || '')) return hire();
            return print({ text: 'Nice try. This incident will be reported.', kind: 'err' });
        },
        hire: () => print({ text: 'Permission denied. (Hint: you need root.)', kind: 'err' }),
        'hire-me': () => print({ text: 'Permission denied. (Hint: you need root.)', kind: 'err' }),
        coffee: () => print({ text: 'Error 418: I’m a teapot.', kind: 'err' }),
        rm: () => print({ text: 'Production is protected by backups, migrations and vibes.', kind: 'err' }),
        exit: () => print('There is no exit. Just keep scrolling ↓'),
        vim: () => print('You are now trapped in vim. Just kidding. Type :q to … oh wait.'),
        matrix: () => print({ text: 'Wake up, Neo… the matrix is just a very large Postgres table.', kind: 'ok' }),
    };

    const run = async (raw) => {
        const text = raw.trim();
        if (!text || busy.current) return;
        busy.current = true;
        setLines((l) => [...l, { type: 'cmd', text }]);
        setHist((h) => [...h, text]);
        setHIdx(-1);
        unlock('terminal');
        const [cmd, ...rest] = text.split(/\s+/);
        const fn = COMMANDS[cmd.toLowerCase()];
        if (fn) await fn(rest.join(' '));
        else print({ text: `command not found: ${cmd}. Type help.`, kind: 'err' });
        busy.current = false;
    };

    const onKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            run(value);
            setValue('');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!hist.length) return;
            const i = hIdx < 0 ? hist.length - 1 : Math.max(0, hIdx - 1);
            setHIdx(i);
            setValue(hist[i]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (hIdx < 0) return;
            const i = hIdx + 1;
            if (i >= hist.length) {
                setHIdx(-1);
                setValue('');
            } else {
                setHIdx(i);
                setValue(hist[i]);
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const m = Object.keys(COMMANDS).filter((c) => c.startsWith(value.toLowerCase()));
            if (m.length === 1) setValue(`${m[0]} `);
            else if (m.length > 1) print({ text: m.join('  '), kind: 'dim' });
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            setLines([]);
        }
    };

    return (
        <section className="sp-section sp-termsec" id="terminal">
            <div className="sp-termsec__head">
                <p className="sp-label">
                    <span>06</span> Terminal
                </p>
                <h2 className="sp-h2">
                    Prefer a shell? <em>Ask me anything.</em>
                </h2>
                <p className="sp-lead">A tiny command line with everything on this page and a few things that aren’t.</p>
            </div>
            <div className="sp-term" onClick={() => input.current?.focus({ preventScroll: true })} data-cursor="type">
                <div className="sp-term__bar">
                    <i />
                    <i />
                    <i />
                    <span>guest@shubhanshu: ~</span>
                </div>
                <div className="sp-term__screen" ref={screen}>
                    {lines.map((l, i) => (
                        <Line l={l} key={i} />
                    ))}
                    <label className="sp-term__input">
                        <span className="sp-term__prompt">guest@shubhanshu:~$</span>
                        <input
                            ref={input}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={onKey}
                            spellCheck={false}
                            autoCapitalize="off"
                            autoComplete="off"
                            aria-label="Terminal command"
                        />
                    </label>
                </div>
                <div className="sp-term__chips">
                    {SUGGEST.map((s) => (
                        <button
                            type="button"
                            key={s}
                            onClick={(e) => {
                                e.stopPropagation();
                                run(s);
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Terminal;
