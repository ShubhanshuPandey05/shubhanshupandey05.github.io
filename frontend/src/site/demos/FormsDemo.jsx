import { useRef, useState } from 'react';
import { unlock } from '../secrets';

const SAMPLES = [
    { name: 'Riya', msg: 'Can you ship 200 units by Friday?' },
    { name: 'Arjun', msg: 'Loved the demo. Pricing for 3 sites?' },
    { name: 'Meera', msg: 'The contact form finally works!' },
    { name: 'Kabir', msg: 'Do you integrate with Sheets?' },
];

const START = [
    { id: 1, name: 'Dev', msg: 'Is the warehouse open on Sunday?', time: '2h' },
    { id: 2, name: 'Ananya', msg: 'Bulk order enquiry, 50 boxes', time: '5h' },
];

const STEPS = ['POST /f/acme-contact → 201', '✉ SMTP alert → owner@acme.in', '⚑ workflow: tagged “lead”'];

// A real little form: submit it and watch the response land in the owner's inbox.
const FormsDemo = () => {
    const [i, setI] = useState(0);
    const [name, setName] = useState(SAMPLES[0].name);
    const [msg, setMsg] = useState(SAMPLES[0].msg);
    const [inbox, setInbox] = useState(START);
    const [count, setCount] = useState(128);
    const [steps, setSteps] = useState([]);
    const [error, setError] = useState(false);
    const [fly, setFly] = useState(null);
    const root = useRef(null);
    const btn = useRef(null);
    const box = useRef(null);
    const busy = useRef(false);

    const submit = (e) => {
        e.preventDefault();
        if (busy.current) return;
        if (!name.trim() || !msg.trim()) {
            setError(true);
            setTimeout(() => setError(false), 600);
            setSteps(['400 · name and message are required']);
            return;
        }
        busy.current = true;
        unlock('project');
        const r = root.current.getBoundingClientRect();
        const a = btn.current.getBoundingClientRect();
        const b = box.current.getBoundingClientRect();
        setFly({
            key: Date.now(),
            x0: a.left - r.left + a.width / 2 - 14,
            y0: a.top - r.top + a.height / 2 - 10,
            x1: b.left - r.left + b.width / 2 - 14,
            y1: b.top - r.top + 20,
        });
        setSteps([]);
        const entry = { id: Date.now(), name: name.trim(), msg: msg.trim(), time: 'now', fresh: true };
        setTimeout(() => {
            setInbox((l) => [entry, ...l.map((x) => ({ ...x, fresh: false }))].slice(0, 4));
            setCount((c) => c + 1);
            setFly(null);
        }, 700);
        STEPS.forEach((s, k) => setTimeout(() => setSteps((l) => [...l, s]), 750 + k * 380));
        setTimeout(() => {
            const next = SAMPLES[(i + 1) % SAMPLES.length];
            setI((v) => v + 1);
            setName(next.name);
            setMsg(next.msg);
            busy.current = false;
        }, 750 + STEPS.length * 380);
    };

    return (
        <div className="sp-demo sp-demo--forms" ref={root}>
            <form className={`sp-forms__form ${error ? 'is-error' : ''}`} onSubmit={submit} noValidate>
                <p className="sp-mono sp-dim">acme.in/contact</p>
                <label>
                    <span>Name</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
                </label>
                <label>
                    <span>Message</span>
                    <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={2} maxLength={80} />
                </label>
                <button type="submit" className="sp-btn sp-btn--solid sp-btn--small" ref={btn} data-cursor="send">
                    Send →
                </button>
            </form>
            <div className="sp-forms__inbox" ref={box}>
                <p className="sp-forms__inboxhead">
                    <span>Inbox</span>
                    <span className="sp-mono" key={count}>
                        {count} responses
                    </span>
                </p>
                <ul>
                    {inbox.map((m) => (
                        <li key={m.id} className={m.fresh ? 'is-fresh' : ''}>
                            <span className="sp-forms__avatar" aria-hidden="true">
                                {m.name[0]}
                            </span>
                            <span>
                                <strong>{m.name}</strong>
                                <small>{m.msg}</small>
                            </span>
                            <em>{m.fresh ? 'new' : m.time}</em>
                        </li>
                    ))}
                </ul>
                <ol className="sp-forms__steps sp-mono" aria-live="polite">
                    {steps.map((s) => (
                        <li key={s}>{s}</li>
                    ))}
                </ol>
            </div>
            {fly && (
                <span
                    key={fly.key}
                    className="sp-forms__fly"
                    style={{ '--x0': `${fly.x0}px`, '--y0': `${fly.y0}px`, '--x1': `${fly.x1}px`, '--y1': `${fly.y1}px` }}
                    aria-hidden="true"
                >
                    ✉
                </span>
            )}
        </div>
    );
};

export default FormsDemo;
