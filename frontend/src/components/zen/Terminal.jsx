import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startSound, stopSound, isSoundOn } from './sound';

const MOON = String.raw`
        _.._
      .' .-'        ✿     .
     /  /          .   ✿
     |  |      ✿    .
     \  '.___.;        ✿
      '._  _.'    .  ✿    .
         ''
`;

// A small terminal for getting in touch. Type a command or tap one of the chips.
const Terminal = ({ email, socials }) => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([
        { type: 'out', text: 'welcome to the garden. type `help`, or tap a command below.' },
    ]);
    const [value, setValue] = useState('');
    const bodyRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const el = bodyRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [history]);

    const link = (name) => socials.find((s) => s.platform.toLowerCase().includes(name))?.url;

    const run = (raw) => {
        const cmd = raw.trim().toLowerCase();
        const out = [];
        const say = (text) => out.push({ type: 'out', text });
        const open = (url, label) => {
            if (!url) return say(`no ${label} link set yet.`);
            say(`opening ${label}…`);
            window.open(url, '_blank', 'noopener');
            return null;
        };
        switch (cmd) {
            case '':
                break;
            case 'help':
                say('email · github · linkedin · leetcode · resume · sakura · sound · clear');
                break;
            case 'email':
            case 'hello':
            case 'hi':
                say(`writing to ${email} …`);
                window.location.href = `mailto:${email}?subject=${encodeURIComponent('Hello from your garden')}`;
                break;
            case 'github':
                open(link('github'), 'github');
                break;
            case 'linkedin':
                open(link('linkedin'), 'linkedin');
                break;
            case 'leetcode':
                open(link('leet'), 'leetcode');
                break;
            case 'resume':
            case 'résumé':
                say('unrolling the résumé…');
                navigate('/resume');
                break;
            case 'sakura':
                say('✿ ✿ ✿ (check the cursor)');
                for (let i = 0; i < 4; i++) {
                    setTimeout(() => {
                        const r = inputRef.current?.getBoundingClientRect();
                        if (!r) return;
                        const x = r.left + Math.random() * r.width;
                        const y = r.top;
                        window.dispatchEvent(new MouseEvent('mousedown', { clientX: x, clientY: y }));
                        window.dispatchEvent(new MouseEvent('mouseup', { clientX: x, clientY: y }));
                    }, i * 180);
                }
                break;
            case 'sound':
                if (isSoundOn()) {
                    stopSound();
                    say('the garden goes quiet.');
                } else {
                    startSound();
                    say('wind, koto and a singing bowl. turn it off with `sound`.');
                }
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'sudo hire':
            case 'hire':
                say('permission granted. → email');
                window.location.href = `mailto:${email}?subject=${encodeURIComponent("Let's work together")}`;
                break;
            default:
                say(`command not found: ${cmd}. try \`help\`.`);
        }
        setHistory((h) => [...h, { type: 'in', text: raw }, ...out]);
    };

    const chips = ['email', 'github', 'linkedin', 'resume', 'sakura', 'sound'];

    return (
        <section className="zn-section zn-hello" id="hello">
            <div className="zn-chapter zn-chapter--light" aria-hidden="true">
                <span>六</span> say hello
            </div>
            <div className="zn-hello__grid">
                <div>
                    <h2 className="zn-h2">
                        Let&apos;s build <em>something calm</em> that survives a storm.
                    </h2>
                    <p className="zn-hello__lede">
                        Backend roles, freelance builds, or a good systems problem. The fastest route is{' '}
                        <a href={`mailto:${email}`} data-cursor="say hi ✿">
                            {email}
                        </a>
                        .
                    </p>
                    <pre className="zn-hello__moon" aria-hidden="true">{MOON}</pre>
                </div>
                <div className="zn-shell" onClick={() => inputRef.current?.focus()}>
                    <div className="zn-term__bar">
                        <i /><i /><i />
                        <span>guest@garden — contact</span>
                    </div>
                    <div className="zn-shell__body" ref={bodyRef} aria-live="polite">
                        {history.map((line, i) => (
                            <p key={i} className={line.type === 'in' ? 'zn-shell__in' : 'zn-shell__out'}>
                                {line.type === 'in' && <b>❯ </b>}
                                {line.text}
                            </p>
                        ))}
                        <form
                            className="zn-shell__prompt"
                            onSubmit={(e) => {
                                e.preventDefault();
                                run(value);
                                setValue('');
                            }}
                        >
                            <label htmlFor="zn-cmd">
                                <b>❯</b>
                            </label>
                            <input
                                id="zn-cmd"
                                ref={inputRef}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                autoComplete="off"
                                spellCheck="false"
                                placeholder="type help"
                                aria-label="Terminal command"
                            />
                        </form>
                    </div>
                    <div className="zn-shell__chips">
                        {chips.map((c) => (
                            <button key={c} type="button" onClick={() => run(c)} data-cursor="run">
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Terminal;
