import { useCallback, useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../lib';
import { unlock } from '../secrets';

const NODES = {
    client: {
        label: 'Client',
        sub: 'browser · phone',
        what: 'Browsers, phones and Twilio webhooks. Every request starts with somebody waiting.',
        used: 'Web apps, WhatsApp Cloud API, Twilio voice and SMS',
    },
    nginx: {
        label: 'Nginx',
        sub: 'reverse proxy',
        what: 'Terminates TLS, proxies to Node, upgrades WebSockets and serves static files.',
        used: 'Self-hosted AWS deployments for the voice engine and Delta Four Labs',
    },
    api: {
        label: 'Node API',
        sub: 'Express · WebSockets',
        what: 'Validation, auth, idempotency keys, and fast paths for the boring 95% of traffic.',
        used: 'Every project on this page',
    },
    redis: {
        label: 'Redis',
        sub: 'cache · sessions',
        what: 'Cache-aside reads, rate limits, conversation state, and the backbone for BullMQ.',
        used: 'GeoJobs search cache, voice engine session state',
    },
    pg: {
        label: 'PostgreSQL',
        sub: 'PostGIS · truth',
        what: 'The source of truth. PostGIS for "jobs within 5 km", careful indexes, real transactions.',
        used: 'GeoJobs, freelance accounting and production systems',
    },
    queue: {
        label: 'BullMQ',
        sub: 'jobs · retries',
        what: 'Anything slow goes here: scrapes, emails, AI calls. Retries with exponential backoff.',
        used: 'GeoJobs scraping pipeline, WhatsApp automation',
    },
    worker: {
        label: 'Workers',
        sub: 'Playwright · AI',
        what: 'Scrapers, AI extraction and Meilisearch indexing. Idempotent, so a retry is always safe.',
        used: 'GeoJobs, re-indexed twice a day',
    },
};

const EDGES = [
    ['client', 'nginx'],
    ['nginx', 'api'],
    ['api', 'redis'],
    ['api', 'pg'],
    ['api', 'queue'],
    ['queue', 'worker'],
    ['worker', 'pg'],
];

const LAYOUTS = {
    wide: {
        w: 1000,
        h: 470,
        nw: 156,
        nh: 66,
        pos: { client: [95, 235], nginx: [280, 235], api: [480, 235], redis: [480, 72], pg: [850, 100], queue: [660, 392], worker: [870, 392] },
    },
    tall: {
        w: 440,
        h: 800,
        nw: 150,
        nh: 62,
        pos: { client: [220, 50], nginx: [220, 165], api: [220, 290], redis: [82, 440], pg: [356, 440], queue: [150, 600], worker: [330, 740] },
    },
};

const SCENARIOS = [
    {
        id: 'hit',
        label: 'GET /jobs',
        tag: 'cache hit',
        steps: [
            { hop: ['client', 'nginx'], ms: 2, log: 'GET /jobs?near=surat&r=5km' },
            { hop: ['nginx', 'api'], ms: 1, log: 'proxy_pass → api:3000' },
            { hop: ['api', 'redis'], ms: 1, log: 'GET jobs:surat:5km:p1' },
            { hop: ['redis', 'api'], ms: 1, log: 'HIT · 0.4 ms', kind: 'ok' },
            { hop: ['api', 'nginx'], ms: 3 },
            { hop: ['nginx', 'client'], ms: 6, log: '200 OK · 312 jobs', kind: 'ok', done: true },
        ],
    },
    {
        id: 'miss',
        label: 'GET /jobs',
        tag: 'cache miss',
        steps: [
            { hop: ['client', 'nginx'], ms: 2, log: 'GET /jobs?near=adajan&r=2km' },
            { hop: ['nginx', 'api'], ms: 1, log: 'proxy_pass → api:3000' },
            { hop: ['api', 'redis'], ms: 1, log: 'GET jobs:adajan:2km:p1' },
            { hop: ['redis', 'api'], ms: 1, log: 'MISS', kind: 'warn' },
            { hop: ['api', 'pg'], ms: 4, log: 'SELECT … WHERE ST_DWithin(geom, $1, 2000)' },
            { hop: ['pg', 'api'], ms: 27, log: '48 rows · index scan', kind: 'ok' },
            { hop: ['api', 'redis'], ms: 1, log: 'SET jobs:adajan:2km:p1 EX 300' },
            { hop: ['redis', 'api'], ms: 1 },
            { hop: ['api', 'nginx'], ms: 3 },
            { hop: ['nginx', 'client'], ms: 6, log: '200 OK · 48 jobs', kind: 'ok', done: true },
        ],
    },
    {
        id: 'async',
        label: 'POST /scrape',
        tag: 'background job',
        steps: [
            { hop: ['client', 'nginx'], ms: 2, log: "POST /scrape { company: 'acme' }" },
            { hop: ['nginx', 'api'], ms: 1 },
            { hop: ['api', 'queue'], ms: 2, log: "queue.add('scrape', …) · job #4182" },
            { hop: ['queue', 'api'], ms: 1 },
            { hop: ['api', 'nginx'], ms: 2 },
            { hop: ['nginx', 'client'], ms: 4, log: '202 Accepted · come back later', kind: 'ok' },
            { hop: ['queue', 'worker'], ms: 40, log: 'worker-1 picked up job #4182' },
            { wait: 1600, log: 'playwright: 3 pages, 51 listings extracted' },
            { hop: ['worker', 'pg'], ms: 18, log: 'UPSERT 51 listings (48 new)' },
            { hop: ['pg', 'worker'], ms: 4, log: 'job #4182 complete · indexed', kind: 'ok', done: true },
        ],
    },
    {
        id: 'chaos',
        label: 'Chaos mode',
        tag: 'crash a worker',
        chaos: true,
        steps: [
            { hop: ['client', 'nginx'], ms: 2, log: 'POST /scrape { company: "nimbus" }' },
            { hop: ['nginx', 'api'], ms: 1 },
            { hop: ['api', 'queue'], ms: 2, log: 'job #4183 queued' },
            { hop: ['queue', 'worker'], ms: 35, log: 'worker-1 picked up job #4183' },
            { down: 'worker', ms: 900, log: 'worker-1 crashed mid-job (OOM)', kind: 'err' },
            { hop: ['worker', 'queue'], ms: 30000, log: 'lock expired → job back in queue', kind: 'warn' },
            { wait: 800, ms: 800, log: 'retry 2/3 after 800 ms backoff', kind: 'warn' },
            { up: 'worker' },
            { hop: ['queue', 'worker'], ms: 12, log: 'worker-2 picked up job #4183' },
            { hop: ['worker', 'pg'], ms: 20, log: 'UPSERT … ON CONFLICT DO NOTHING' },
            { hop: ['pg', 'worker'], ms: 3, log: 'Nobody noticed. That is the job.', kind: 'ok', done: true },
        ],
    },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SystemMap = () => {
    const [layoutKey, setLayoutKey] = useState('wide');
    const [selected, setSelected] = useState('api');
    const [running, setRunning] = useState(null);
    const [logs, setLogs] = useState([
        { id: 0, t: '', text: 'Pick a request above and watch it travel.', kind: 'dim' },
    ]);
    const [hot, setHot] = useState({ node: null, n: 0 });
    const [edge, setEdge] = useState(null);
    const [down, setDown] = useState(null);
    const [served, setServed] = useState(0);
    const wrap = useRef(null);
    const packet = useRef(null);
    const trail = useRef([]);
    const alive = useRef(true);
    const logId = useRef(1);
    const layout = LAYOUTS[layoutKey];

    useEffect(() => {
        alive.current = true;
        const el = wrap.current;
        const ro = new ResizeObserver(([e]) => setLayoutKey(e.contentRect.width < 640 ? 'tall' : 'wide'));
        if (el) ro.observe(el);
        return () => {
            alive.current = false;
            ro.disconnect();
        };
    }, []);

    const log = (text, kind, t) =>
        setLogs((l) => [...l.slice(-7), { id: logId.current++, text, kind, t }]);

    const travel = useCallback(
        (a, b, kind) =>
            new Promise((resolve) => {
                const [x1, y1] = layout.pos[a];
                const [x2, y2] = layout.pos[b];
                const dist = Math.hypot(x2 - x1, y2 - y1);
                const dur = reducedMotion() ? 1 : 260 + dist * 0.9;
                const g = packet.current;
                const hist = [];
                setEdge([a, b].sort().join('-'));
                g?.setAttribute('class', `sp-sys__packet is-on ${kind ? `is-${kind}` : ''}`);
                const t0 = performance.now();
                const step = (t) => {
                    if (!alive.current) return resolve();
                    const p = Math.min(1, (t - t0) / dur);
                    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                    const x = x1 + (x2 - x1) * e;
                    const y = y1 + (y2 - y1) * e;
                    g?.setAttribute('transform', `translate(${x} ${y})`);
                    hist.unshift([x, y]);
                    trail.current.forEach((c, i) => {
                        const h = hist[(i + 1) * 3] || hist[hist.length - 1];
                        c?.setAttribute('cx', h[0]);
                        c?.setAttribute('cy', h[1]);
                    });
                    if (p < 1) requestAnimationFrame(step);
                    else resolve();
                };
                requestAnimationFrame(step);
            }),
        [layout]
    );

    const run = async (sc) => {
        if (running) return;
        setRunning(sc.id);
        setLogs([]);
        let clock = 0;
        const stamp = (ms = 0) => {
            clock += ms;
            return clock >= 1000 ? `+${(clock / 1000).toFixed(1)}s` : `+${clock}ms`;
        };
        for (const s of sc.steps) {
            if (!alive.current) return;
            if (s.hop) {
                const [a, b] = s.hop;
                await travel(a, b, s.kind === 'err' || s.kind === 'warn' ? s.kind : '');
                setHot((h) => ({ node: b, n: h.n + 1 }));
                if (s.log) log(s.log, s.kind, stamp(s.ms));
                else stamp(s.ms);
            } else if (s.down) {
                setDown(s.down);
                setHot((h) => ({ node: s.down, n: h.n + 1 }));
                log(s.log, s.kind, stamp(s.ms));
                await sleep(900);
            } else if (s.up) {
                setDown(null);
            } else if (s.wait) {
                await sleep(reducedMotion() ? 200 : s.wait);
                log(s.log, s.kind, stamp(s.ms || s.wait));
            }
            if (s.done) {
                setServed((n) => n + 1);
                unlock('request');
            }
        }
        if (!alive.current) return;
        packet.current?.setAttribute('class', 'sp-sys__packet');
        setEdge(null);
        setRunning(null);
    };

    const { w, h, nw, nh, pos } = layout;
    const info = NODES[selected];

    return (
        <section className="sp-section sp-sys" id="system">
            <div className="sp-sys__head">
                <p className="sp-label">
                    <span>03</span> How I think
                </p>
                <h2 className="sp-h2">
                    Follow a request <em>through the stack.</em>
                </h2>
                <p className="sp-lead">
                    This is the shape of most backends I build. Send a request and watch where it goes. Click any box to see
                    what it does and where I’ve used it.
                </p>
            </div>

            <div className="sp-sys__controls" role="group" aria-label="Send a request">
                {SCENARIOS.map((sc) => (
                    <button
                        type="button"
                        key={sc.id}
                        className={`sp-sys__btn ${sc.chaos ? 'is-chaos' : ''} ${running === sc.id ? 'is-running' : ''}`}
                        onClick={() => run(sc)}
                        disabled={!!running}
                        data-cursor="send"
                    >
                        <span className="sp-mono">{sc.label}</span>
                        <small>{sc.tag}</small>
                    </button>
                ))}
                <span className="sp-sys__served sp-mono">requests served: {served}</span>
            </div>

            <div className="sp-sys__stage">
                <div className="sp-sys__diagram" ref={wrap}>
                    <svg viewBox={`0 0 ${w} ${h}`} className={`sp-sys__svg is-${layoutKey}`} role="img" aria-label="Diagram of a client, Nginx, a Node API, Redis, PostgreSQL, a BullMQ queue and workers">
                        <defs>
                            <radialGradient id="sp-glow">
                                <stop offset="0" stopColor="currentColor" stopOpacity="0.55" />
                                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        {EDGES.map(([a, b]) => {
                            const id = [a, b].sort().join('-');
                            return (
                                <line
                                    key={id}
                                    x1={pos[a][0]}
                                    y1={pos[a][1]}
                                    x2={pos[b][0]}
                                    y2={pos[b][1]}
                                    className={`sp-sys__edge ${edge === id ? 'is-active' : ''}`}
                                />
                            );
                        })}
                        {Object.entries(NODES).map(([id, n]) => {
                            const [x, y] = pos[id];
                            const cls = [
                                'sp-sys__node',
                                selected === id && 'is-selected',
                                down === id && 'is-down',
                                hot.node === id && 'is-hot',
                            ]
                                .filter(Boolean)
                                .join(' ');
                            return (
                                <g
                                    key={hot.node === id ? `${id}-${hot.n}` : id}
                                    className={cls}
                                    transform={`translate(${x - nw / 2} ${y - nh / 2})`}
                                    onClick={() => setSelected(id)}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(id)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`${n.label}: ${n.sub}`}
                                    data-cursor="inspect"
                                >
                                    <rect width={nw} height={nh} rx="12" />
                                    <text x={nw / 2} y={nh / 2 - 4} textAnchor="middle" className="sp-sys__nlabel">
                                        {down === id ? 'worker-1 ✗' : n.label}
                                    </text>
                                    <text x={nw / 2} y={nh / 2 + 16} textAnchor="middle" className="sp-sys__nsub">
                                        {n.sub}
                                    </text>
                                </g>
                            );
                        })}
                        {[0, 1, 2, 3].map((i) => (
                            <circle
                                key={i}
                                ref={(el) => (trail.current[i] = el)}
                                r={6 - i * 1.2}
                                cx="-50"
                                cy="-50"
                                className="sp-sys__trail"
                                style={{ opacity: running ? 0.5 - i * 0.11 : 0 }}
                            />
                        ))}
                        <g ref={packet} className="sp-sys__packet" transform="translate(-50 -50)">
                            <circle r="22" fill="url(#sp-glow)" />
                            <circle r="7" />
                        </g>
                    </svg>
                </div>

                <aside className="sp-sys__side">
                    <div className="sp-sys__info" key={selected}>
                        <p className="sp-mono sp-dim">inspect · {selected}</p>
                        <h3>{info.label}</h3>
                        <p>{info.what}</p>
                        <p className="sp-sys__used">
                            <span className="sp-mono">used in</span> {info.used}
                        </p>
                    </div>
                    <div className="sp-console" aria-live="polite">
                        <div className="sp-console__bar">
                            <i />
                            <i />
                            <i />
                            <span>api.log</span>
                        </div>
                        <ol>
                            {logs.map((l) => (
                                <li key={l.id} className={l.kind ? `is-${l.kind}` : ''}>
                                    {l.t && <span className="sp-console__t">{l.t}</span>}
                                    {l.text}
                                </li>
                            ))}
                            {running && <li className="sp-console__caret">▍</li>}
                        </ol>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default SystemMap;
