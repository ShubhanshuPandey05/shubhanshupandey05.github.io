import { useEffect, useRef, useState } from 'react';
import { useCanvasScene, reducedMotion } from '../lib';
import { unlock } from '../secrets';

const CHANNELS = [
    { id: 'call', label: 'Call', icon: '☎' },
    { id: 'sms', label: 'SMS', icon: '✉' },
    { id: 'web', label: 'Web chat', icon: '◎' },
];

const SCRIPT = [
    { ch: 'call', who: 'user', text: 'Hi, can I move tomorrow’s appointment to Thursday?' },
    { ch: 'call', who: 'ai', text: 'Done, Thursday at 4 PM. I’ll text you the details.' },
    { ch: 'sms', who: 'ai', text: 'Confirmed: Thu 4:00 PM. Reply C to change it.' },
    { ch: 'sms', who: 'user', text: 'C. Can we do 5 instead?' },
    { ch: 'web', who: 'ai', text: 'Moved to 5 PM. Same conversation, third channel. ✓' },
];

const COLORS = ['255,91,46', '255,177,153', '92,242,181', '242,239,233'];

const waveScene = (state) => ({ ctx }) => {
    let W = 0;
    let H = 0;
    return {
        resize(w, h) {
            W = w;
            H = h;
        },
        frame(t) {
            state.energy += (state.target - state.energy) * 0.08;
            state.target = Math.max(state.floor, state.target * 0.97);
            ctx.clearRect(0, 0, W, H);
            const mid = H / 2;
            COLORS.forEach((c, i) => {
                const amp = H * 0.36 * state.energy * (1 - i * 0.17);
                const f = 0.012 + i * 0.004;
                const ph = t * (0.003 + i * 0.0011) + i * 1.7;
                ctx.strokeStyle = `rgba(${c},${0.85 - i * 0.16})`;
                ctx.lineWidth = i === 0 ? 2.2 : 1.4;
                ctx.beginPath();
                for (let x = 0; x <= W; x += 3) {
                    const env = Math.pow(Math.sin((Math.PI * x) / W), 2);
                    const y = mid + Math.sin(x * f + ph) * Math.sin(x * f * 0.37 - ph * 0.6) * amp * env;
                    if (x) ctx.lineTo(x, y);
                    else ctx.moveTo(x, y);
                }
                ctx.stroke();
            });
        },
    };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VoiceDemo = () => {
    const [wave] = useState(() => ({ energy: 0.12, target: 0.12, floor: 0.12 }));
    const ref = useCanvasScene(waveScene(wave));
    const [msgs, setMsgs] = useState([]);
    const [ch, setCh] = useState(null);
    const [used, setUsed] = useState([]);
    const [phase, setPhase] = useState('idle');
    const alive = useRef(true);
    const listRef = useRef(null);

    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);

    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [msgs]);

    const play = async () => {
        if (phase === 'playing') return;
        unlock('project');
        setPhase('playing');
        setMsgs([]);
        setUsed([]);
        const fast = reducedMotion();
        for (let i = 0; i < SCRIPT.length; i++) {
            const m = SCRIPT[i];
            if (!alive.current) return;
            setCh(m.ch);
            setUsed((u) => (u.includes(m.ch) ? u : [...u, m.ch]));
            setMsgs((l) => [...l, { ...m, shown: '' }]);
            wave.floor = m.ch === 'call' ? 0.55 : 0.25;
            for (let k = 1; k <= m.text.length; k++) {
                if (!alive.current) return;
                if (m.ch === 'call') wave.target = 0.7 + Math.random() * 0.5;
                setMsgs((l) => l.map((x, j) => (j === i ? { ...x, shown: m.text.slice(0, k) } : x)));
                if (!fast) await sleep(22);
            }
            wave.floor = 0.12;
            await sleep(fast ? 50 : 650);
        }
        setPhase('done');
    };

    const onMove = (e) => {
        const speed = Math.min(1, (Math.abs(e.movementX) + Math.abs(e.movementY)) / 40);
        wave.target = Math.max(wave.target, 0.15 + speed * 0.8);
    };

    return (
        <div className="sp-demo sp-demo--voice" onPointerMove={onMove}>
            <div className="sp-voice__channels">
                {CHANNELS.map((c) => (
                    <span key={c.id} className={`sp-voice__ch ${ch === c.id ? 'is-active' : ''} ${used.includes(c.id) ? 'is-used' : ''}`}>
                        <i aria-hidden="true">{c.icon}</i> {c.label}
                    </span>
                ))}
            </div>
            <canvas ref={ref} className="sp-voice__wave" aria-hidden="true" />
            <ol className="sp-voice__log" ref={listRef} aria-live="polite">
                {msgs.length === 0 && <li className="sp-voice__empty">One assistant, three channels, one shared memory.</li>}
                {msgs.map((m, i) => (
                    <li key={i} className={`sp-bubble is-${m.who}`}>
                        <small>
                            {m.who === 'ai' ? 'assistant' : 'caller'} · {CHANNELS.find((c) => c.id === m.ch).label}
                        </small>
                        {m.shown}
                        {m.shown.length < m.text.length && <span className="sp-caret" />}
                    </li>
                ))}
            </ol>
            <button type="button" className="sp-btn sp-btn--small sp-voice__play" onClick={play} disabled={phase === 'playing'} data-cursor="play">
                {phase === 'idle' ? '▶ Play the conversation' : phase === 'playing' ? 'Listening…' : '↺ Replay'}
            </button>
        </div>
    );
};

export default VoiceDemo;
