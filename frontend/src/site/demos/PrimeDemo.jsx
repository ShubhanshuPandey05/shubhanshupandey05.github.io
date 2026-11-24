import { useEffect, useRef, useState } from 'react';
import { unlock } from '../secrets';

// Modelled on the Prime Analyst Flutter app: white page, grey containers, one dark
// card that says "start here", colour only inside small icon tiles, and a floating
// pill nav. Figures are the demo company's invented books, not a customer's.

const COMPANY = 'Shree Balaji Electricals';

const PERIODS = {
    Today: { head: "Today's sales", sales: 48260, change: 12.4, vs: 'compared with yesterday', pur: 21800, third: ['This month', 1046300], vouchers: 37, cap: 'today' },
    Yesterday: { head: 'Sales · Yesterday', sales: 42935, change: -3.1, vs: 'compared with the previous period', pur: 30450, third: ['Previous period', 44310], vouchers: 41, cap: 'in this period' },
    'This month': { head: 'Sales · This month', sales: 1046300, change: 8.6, vs: 'compared with the previous period', pur: 612900, third: ['Previous period', 963400], vouchers: 812, cap: 'in this period' },
    'Last month': { head: 'Sales · Last month', sales: 963400, change: 4.2, vs: 'compared with the previous period', pur: 588100, third: ['Previous period', 924500], vouchers: 905, cap: 'in this period' },
};

const RECEIVABLES = { total: 684500, overdue: 0.38 };
const PAYABLES = { total: 412300, overdue: 0.12 };
const STOCK = { value: 1872400, low: 3, neg: 1, items: 24 };

const REPORTS = [
    ['Outstanding', '#2d5bff', [['Receivables', 'Who owes me money, and for how long'], ['Payables', 'What I owe my suppliers'], ['Ledgers', 'Closing balances across all accounts']]],
    ['Transactions', '#7c4dff', [['Day book', 'Every voucher, day by day'], ['Sales register', 'Every sale, by month, customer and item']]],
    ['Stock', '#e08a15', [['Stock summary', 'What I hold and what it is worth'], ['Running low', 'Items at or below reorder level']]],
];

const MONTHS = [
    ['Apr', 7.9],
    ['May', 8.6],
    ['Jun', 7.2],
    ['Jul', 9.1],
    ['Aug', 9.8],
    ['Sep', 8.4],
    ['Oct', 9.6],
    ['Nov', 10.5],
];

const STEPS = ['Asking the connector', 'Reading Tally · AlterID 48211 → 48236', 'Sealed and stored'];

const full = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const compact = (n) => {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
    if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
    return full(n);
};

// Counts toward the target so switching periods feels live.
const useTween = (target) => {
    const [v, setV] = useState(target);
    const from = useRef(target);
    useEffect(() => {
        const start = performance.now();
        const a = from.current;
        let raf;
        const tick = (t) => {
            const k = Math.min(1, (t - start) / 650);
            const n = a + (target - a) * (1 - Math.pow(1 - k, 3));
            setV(n);
            from.current = n;
            if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target]);
    return v;
};

const Tile = ({ icon, tint, label, value, meter, caption, tone }) => (
    <div className="pa-tile">
        <span className="pa-icon" style={{ '--t': tint }} aria-hidden="true">
            {icon}
        </span>
        <small>{label}</small>
        <strong className={tone ? `is-${tone}` : ''}>{value}</strong>
        {meter != null && (
            <span className="pa-meter">
                <i style={{ width: `${meter * 100}%`, background: tone === 'neg' ? '#c4314b' : '#b8720a' }} />
            </span>
        )}
        <em>{caption}</em>
    </div>
);

const PrimeDemo = () => {
    const [tab, setTab] = useState('home');
    const [period, setPeriod] = useState('Today');
    const [extra, setExtra] = useState(0);
    const [sync, setSync] = useState(-1);
    const [toast, setToast] = useState('');
    const timers = useRef([]);

    useEffect(() => () => timers.current.forEach(clearTimeout), []);
    const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

    const p = PERIODS[period];
    const sales = useTween(p.sales + (period === 'Today' || period === 'This month' ? extra : 0));

    const refresh = () => {
        if (sync >= 0) return;
        unlock('project');
        setSync(0);
        STEPS.forEach((_, k) => later(() => setSync(k), k * 520));
        later(() => {
            setSync(-1);
            setExtra((x) => x + 2400 + Math.round(Math.random() * 6000));
        }, STEPS.length * 520 + 200);
    };

    const entry = () => {
        unlock('project');
        setToast('Receipt sent to Tally as an optional entry');
        later(() => setToast(''), 2200);
    };

    const up = p.change >= 0;
    const max = Math.max(...MONTHS.map((m) => m[1]));

    return (
        <div className="sp-demo sp-demo--phone">
            <div className="pa-phone">
                <div className="pa-status">
                    <span>9:41</span>
                    <span>●●● ▮</span>
                </div>

                <div className="pa-screen">
                    <header className="pa-top">
                        <span className="pa-avatar" aria-hidden="true">
                            S
                        </span>
                        <span className="pa-co">
                            <strong>{COMPANY}</strong>
                            <small>FY 2026-27 ▾</small>
                        </span>
                        <button type="button" className={`pa-refresh ${sync >= 0 ? 'is-on' : ''}`} onClick={refresh} aria-label="Refresh from Tally" data-cursor="sync">
                            ⟳
                        </button>
                    </header>

                    {sync >= 0 && (
                        <div className="pa-sync" aria-live="polite">
                            <span>{STEPS[sync]}</span>
                            <i style={{ width: `${((sync + 1) / STEPS.length) * 100}%` }} />
                        </div>
                    )}

                    {tab === 'home' && (
                        <div className="pa-body" key="home">
                            <div className="pa-pills" role="tablist">
                                {Object.keys(PERIODS).map((k) => (
                                    <button key={k} type="button" role="tab" aria-selected={period === k} className={period === k ? 'is-on' : ''} onClick={() => setPeriod(k)}>
                                        {k}
                                    </button>
                                ))}
                            </div>

                            <div className="pa-hero">
                                <div className="pa-hero__row">
                                    <span className="pa-icon pa-icon--dark" aria-hidden="true">
                                        ▤
                                    </span>
                                    <small>{p.head}</small>
                                    <em className={up ? 'is-up' : 'is-down'}>
                                        {up ? '↑' : '↓'} {Math.abs(p.change).toFixed(1)}%
                                    </em>
                                </div>
                                <strong>{full(sales)}</strong>
                                <small>{p.vs}</small>
                                <hr />
                                <div className="pa-hero__stats">
                                    <span>
                                        <small>Purchases</small>
                                        <b>{compact(p.pur)}</b>
                                    </span>
                                    <span>
                                        <small>Cash & bank</small>
                                        <b>{compact(326900 + extra)}</b>
                                    </span>
                                    <span>
                                        <small>{p.third[0]}</small>
                                        <b>{compact(p.third[1] + (period === 'Today' ? extra : 0))}</b>
                                    </span>
                                </div>
                            </div>

                            <div className="pa-grid">
                                <Tile icon="↙" tint="#2d5bff" label="Receivables" value={compact(RECEIVABLES.total)} meter={RECEIVABLES.overdue} tone="caution" caption={`${Math.round(RECEIVABLES.overdue * 100)}% overdue`} />
                                <Tile icon="↗" tint="#e0447a" label="Payables" value={compact(PAYABLES.total)} meter={PAYABLES.overdue} tone="neg" caption={`${Math.round(PAYABLES.overdue * 100)}% overdue`} />
                                <Tile icon="▦" tint="#e08a15" label="Stock value" value={compact(STOCK.value)} meter={(STOCK.low + STOCK.neg) / STOCK.items} tone="caution" caption={`${STOCK.low} low · ${STOCK.neg} negative`} />
                                <Tile icon="≣" tint="#7c4dff" label="Vouchers" value={String(p.vouchers)} caption={p.cap} />
                            </div>
                        </div>
                    )}

                    {tab === 'reports' && (
                        <div className="pa-body" key="reports">
                            <h4 className="pa-h">Reports</h4>
                            {REPORTS.map(([head, tint, rows]) => (
                                <div className="pa-card" key={head}>
                                    <p className="pa-card__head">{head}</p>
                                    {rows.map(([t, s]) => (
                                        <div className="pa-row" key={t}>
                                            <span className="pa-icon pa-icon--sm" style={{ '--t': tint }} aria-hidden="true">
                                                ▤
                                            </span>
                                            <span>
                                                <b>{t}</b>
                                                <small>{s}</small>
                                            </span>
                                            <i aria-hidden="true">›</i>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'summary' && (
                        <div className="pa-body" key="summary">
                            <h4 className="pa-h">Summary</h4>
                            <div className="pa-card">
                                <p className="pa-card__head">
                                    Monthly sales <span>₹ lakh</span>
                                </p>
                                <div className="pa-bars">
                                    {MONTHS.map(([m, v], k) => (
                                        <span key={m} style={{ '--h': `${(v / max) * 100}%`, '--k': k }}>
                                            <i />
                                            <small>{m}</small>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="pa-card pa-card--split">
                                <span>
                                    <small>Sales · FY so far</small>
                                    <b>₹71.10L</b>
                                </span>
                                <span>
                                    <small>Purchases</small>
                                    <b>₹43.62L</b>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <button type="button" className="pa-fab" onClick={entry} aria-label="New entry" data-cursor="add">
                    +
                </button>
                <nav className="pa-nav">
                    {[
                        ['home', '▦', 'Home'],
                        ['reports', '▤', 'Reports'],
                        ['summary', '▮', 'Summary'],
                    ].map(([k, icon, label]) => (
                        <button type="button" key={k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>
                            <span aria-hidden="true">{icon}</span>
                            {tab === k && label}
                        </button>
                    ))}
                </nav>
                <p className={`pa-toast ${toast ? 'is-on' : ''}`} aria-live="polite">
                    {toast}
                </p>
            </div>
            <p className="sp-demo__hint">Tap the periods, tabs, ⟳ and +</p>
        </div>
    );
};

export default PrimeDemo;
