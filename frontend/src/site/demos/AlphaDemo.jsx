import { useEffect, useRef, useState } from 'react';
import { unlock } from '../secrets';

// Modelled on the Alpha Ecoplast plant app (private): a deep-blue "Today so far"
// hero over a cool grey page, bag codes set in mono with the sequence in bold, a
// QC1/QC2/QC3 segmented queue and machine cards that log downtime. Invented data.

const REMARKS = ['Clear', 'Light blue', 'Mixed', 'Yellowish'];
const REASONS = ['Power cut', 'Screen change', 'Breakdown', 'Cleaning'];

const START_BAGS = [
    { seq: '046', line: 'ES1', grade: 'FGA', kg: 1012, at: '13:42' },
    { seq: '045', line: 'ES2', grade: 'FGA', kg: 998, at: '13:18' },
    { seq: '044', line: 'ES1', grade: 'FGB', kg: 1006, at: '12:51' },
];

const QC_START = [
    { seq: '041', line: 'ES1' },
    { seq: '042', line: 'ES2' },
    { seq: '043', line: 'ES1' },
];

const MACHINES = ['ES1', 'ES2', 'W01', 'W02'];

const DAY = new Date();
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const pad = (n) => String(n).padStart(2, '0');
const STAMP = `${pad(DAY.getDate())}${pad(DAY.getMonth() + 1)}${String(DAY.getFullYear()).slice(2)}`;
const DAY_LABEL = `${DAYS[DAY.getDay()]} ${DAY.getDate()} ${MON[DAY.getMonth()]}`;
const NEXT = DAYS[(DAY.getDay() + 1) % 7];
const NEXT_LABEL = NEXT[0] + NEXT.slice(1).toLowerCase();

const BagCode = ({ seq, grade = 'FGA' }) => (
    <span className="al-code">
        <i>001</i>
        <i>{STAMP}</i>
        <b>{seq}</b>
        <i>{grade}</i>
    </span>
);

const AlphaDemo = () => {
    const [tab, setTab] = useState('home');
    const [bags, setBags] = useState(START_BAGS);
    const [count, setCount] = useState({ st: 46, wl: 31, pu: 212 });
    const [qc, setQc] = useState(QC_START);
    const [qc2, setQc2] = useState(2);
    const [seg, setSeg] = useState(0);
    const [open, setOpen] = useState(null);
    const [remark, setRemark] = useState(null);
    const [down, setDown] = useState({ W02: { reason: 'Screen change', since: Date.now() - 23 * 60000 } });
    const [pick, setPick] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [toast, setToast] = useState('');
    const t = useRef(null);

    useEffect(() => {
        const i = setInterval(() => setNow(Date.now()), 1000);
        return () => {
            clearInterval(i);
            clearTimeout(t.current);
        };
    }, []);

    const say = (s) => {
        setToast(s);
        clearTimeout(t.current);
        t.current = setTimeout(() => setToast(''), 2000);
    };

    const addBag = () => {
        unlock('project');
        const seq = String(47 + bags.length - START_BAGS.length).padStart(3, '0');
        const line = Math.random() > 0.5 ? 'ES1' : 'ES2';
        const kg = 990 + Math.round(Math.random() * 30);
        setBags((l) => [{ seq, line, grade: 'FGA', kg, at: 'now', fresh: true }, ...l.map((b) => ({ ...b, fresh: false }))].slice(0, 3));
        setCount((c) => ({ ...c, st: c.st + 1 }));
        setQc((q) => [...q, { seq, line }]);
        say(`Bag ${seq} added · label sent to printer`);
    };

    const saveQc = () => {
        if (!remark) {
            say('Choose a remark');
            return;
        }
        unlock('project');
        setQc((q) => q.filter((b) => b.seq !== open));
        setQc2((n) => n + 1);
        say(`QC1 saved · ${open} moves to QC2`);
        setOpen(null);
        setRemark(null);
    };

    const toggleMachine = (m) => {
        unlock('project');
        if (down[m]) {
            const mins = Math.max(1, Math.round((now - down[m].since) / 60000));
            setDown((d) => {
                const n = { ...d };
                delete n[m];
                return n;
            });
            say(`${m} running again · ${mins} min logged`);
        } else {
            setPick(pick === m ? null : m);
        }
    };

    const logDown = (m, reason) => {
        setDown((d) => ({ ...d, [m]: { reason, since: Date.now() } }));
        setPick(null);
        say(`${m} stopped · ${reason}`);
    };

    const elapsed = (since) => {
        const s = Math.max(0, Math.floor((now - since) / 1000));
        return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
    };

    const running = MACHINES.length - Object.keys(down).length;

    return (
        <div className="sp-demo sp-demo--phone sp-demo--alpha">
            <div className="al-phone">
                <div className="al-status">
                    <span>alpha plant app</span>
                    <span>private build</span>
                </div>
                <div className="al-screen">
                    <header className="al-hero">
                        <div className="al-hero__bar">
                            <span aria-hidden="true">☰</span>
                            <b>
                                Alpha Eco <em>· Kosamba</em>
                            </b>
                            <span className="al-hero__me" aria-hidden="true">
                                S
                            </span>
                        </div>
                        <small className="al-eyebrow">PRODUCTION DAY · {DAY_LABEL}</small>
                        <strong className="al-hero__title">Today so far</strong>
                        <div className="al-day">
                            <span>08:00</span>
                            <i>
                                <b style={{ width: '25%' }} />
                            </i>
                            <span>08:00 {NEXT_LABEL}</span>
                        </div>
                        {tab === 'home' && (
                            <div className="al-metrics">
                                <span>
                                    <small>Starlinger</small>
                                    <b key={count.st}>{count.st}</b>
                                    <em>bags</em>
                                </span>
                                <span>
                                    <small>Wash Line</small>
                                    <b>{count.wl}</b>
                                    <em>bags</em>
                                </span>
                                <span>
                                    <small>Purchase</small>
                                    <b>{count.pu}</b>
                                    <em>bags</em>
                                </span>
                            </div>
                        )}
                    </header>

                    {tab === 'home' && (
                        <div className="al-body" key="home">
                            <div className="al-actions">
                                <button type="button" onClick={addBag} data-cursor="add">
                                    <span aria-hidden="true">+</span>Add bag
                                </button>
                                <button type="button" onClick={() => setTab('qc')}>
                                    <span aria-hidden="true">⚗</span>Starlinger QC
                                </button>
                                <button type="button" onClick={() => setTab('machines')}>
                                    <span aria-hidden="true">◷</span>Log downtime
                                </button>
                            </div>
                            <p className="al-section">Latest bags</p>
                            <div className="al-panel">
                                {bags.map((b) => (
                                    <div className={`al-row ${b.fresh ? 'is-fresh' : ''}`} key={b.seq}>
                                        <span>
                                            <BagCode seq={b.seq} grade={b.grade} />
                                            <small>
                                                Starlinger {b.line} · {b.at}
                                            </small>
                                        </span>
                                        <b>{b.kg.toLocaleString('en-IN')} kg</b>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'qc' && (
                        <div className="al-body" key="qc">
                            <div className="al-seg" role="tablist">
                                {[
                                    ['QC1', qc.length],
                                    ['QC2', qc2],
                                    ['QC3', 1],
                                ].map(([l, n], k) => (
                                    <button type="button" key={l} role="tab" aria-selected={seg === k} className={seg === k ? 'is-on' : ''} onClick={() => setSeg(k)}>
                                        {l}
                                        {n > 0 && <i>{n}</i>}
                                    </button>
                                ))}
                            </div>
                            {seg === 0 ? (
                                <div className="al-panel">
                                    {qc.length === 0 && <p className="al-empty">Nothing waiting for QC1</p>}
                                    {qc.map((b) => (
                                        <div key={b.seq}>
                                            <button type="button" className="al-row al-row--btn" onClick={() => setOpen(open === b.seq ? null : b.seq)}>
                                                <span>
                                                    <BagCode seq={b.seq} />
                                                    <small>Finished Goods · {b.line}</small>
                                                </span>
                                                <em>{open === b.seq ? 'Close' : 'Start QC1'}</em>
                                            </button>
                                            {open === b.seq && (
                                                <div className="al-sheet">
                                                    <div className="al-lab">
                                                        <span>
                                                            <small>L</small>
                                                            <b>64.2</b>
                                                        </span>
                                                        <span>
                                                            <small>a</small>
                                                            <b>−1.8</b>
                                                        </span>
                                                        <span>
                                                            <small>b</small>
                                                            <b>3.4</b>
                                                        </span>
                                                        <span>
                                                            <small>CPG</small>
                                                            <b>0.31</b>
                                                        </span>
                                                    </div>
                                                    <small className="al-cap">Remark</small>
                                                    <div className="al-chips">
                                                        {REMARKS.map((r) => (
                                                            <button type="button" key={r} className={remark === r ? 'is-on' : ''} onClick={() => setRemark(r)}>
                                                                {r}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button type="button" className="al-primary" onClick={saveQc} data-cursor="save">
                                                        Save
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="al-panel">
                                    <p className="al-empty">
                                        {seg === 1 ? `${qc2} IV batches waiting for QC2` : '1 batch waiting for final readings'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'machines' && (
                        <div className="al-body" key="machines">
                            <p className="al-section">
                                Machines today <span>{running}/4 running</span>
                            </p>
                            <div className="al-machines">
                                {MACHINES.map((m) => (
                                    <div key={m} className={`al-machine ${down[m] ? 'is-down' : ''}`}>
                                        <button type="button" onClick={() => toggleMachine(m)} data-cursor={down[m] ? 'resume' : 'stop'}>
                                            <span className="al-machine__top">
                                                <b>{m}</b>
                                                <i aria-hidden="true" />
                                            </span>
                                            <small>{m.startsWith('E') ? 'Starlinger' : 'Wash Line'}</small>
                                            <em>{down[m] ? `${down[m].reason} · ${elapsed(down[m].since)}` : 'Running · tap to log stop'}</em>
                                        </button>
                                        {pick === m && (
                                            <div className="al-chips al-chips--reasons">
                                                {REASONS.map((r) => (
                                                    <button type="button" key={r} onClick={() => logDown(m, r)}>
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <nav className="al-nav">
                    {[
                        ['home', '⌂', 'Home'],
                        ['qc', '⚗', 'QC'],
                        ['machines', '◷', 'Machines'],
                    ].map(([k, icon, label]) => (
                        <button type="button" key={k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>
                            <span aria-hidden="true">{icon}</span>
                            {label}
                            {k === 'qc' && qc.length > 0 && <i>{qc.length}</i>}
                        </button>
                    ))}
                </nav>
                <p className={`al-toast ${toast ? 'is-on' : ''}`} aria-live="polite">
                    {toast}
                </p>
            </div>
            <p className="sp-demo__hint">Private app · add a bag, run QC1, stop a machine</p>
        </div>
    );
};

export default AlphaDemo;
