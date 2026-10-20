import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createAsciiScene } from './asciiScene';
import SoundToggle from './SoundToggle';
import { prefersReducedMotion } from './motion';

const LINES = [
    { cmd: 'whoami', out: 'shubhanshu pandey · backend developer · surat, india' },
    { cmd: 'cat craft.txt', out: 'I build the quiet machinery behind loud products: APIs, queues and real-time systems.' },
    { cmd: 'status', out: 'open to backend roles ✿ freelancing meanwhile' },
];

// Types the terminal lines one character at a time.
const useTyped = () => {
    const [state, setState] = useState({ line: 0, chars: 0, done: false });
    useEffect(() => {
        if (prefersReducedMotion()) {
            setState({ line: LINES.length, chars: 0, done: true });
            return undefined;
        }
        let line = 0;
        let chars = 0;
        let timer;
        const tick = () => {
            const full = LINES[line].cmd.length;
            if (chars < full) {
                chars += 1;
                setState({ line, chars, done: false });
                timer = setTimeout(tick, 45 + Math.random() * 60);
            } else {
                line += 1;
                chars = 0;
                setState({ line, chars, done: line >= LINES.length });
                if (line < LINES.length) timer = setTimeout(tick, 520);
            }
        };
        timer = setTimeout(tick, 1400);
        return () => clearTimeout(timer);
    }, []);
    return state;
};

const AsciiHero = ({ profile }) => {
    const canvasRef = useRef(null);
    const sceneRef = useRef(null);
    const typed = useTyped();

    useEffect(() => {
        const canvas = canvasRef.current;
        const reduced = prefersReducedMotion();
        let scene = createAsciiScene(canvas, { firstName: profile.firstName, lastName: profile.lastName, reducedMotion: reduced });
        sceneRef.current = scene;
        scene.start();

        // Rebuild once the display font has loaded so the name is sampled from the right letterforms.
        // Fonts load lazily, so ask for the exact faces the canvas uses.
        if (document.fonts?.load) {
            Promise.all([
                document.fonts.load('900 100px Fraunces'),
                document.fonts.load('italic 700 100px Fraunces'),
                document.fonts.load('12px "JetBrains Mono"'),
            ])
                .catch(() => {})
                .then(() => {
                    if (!scene) return;
                    scene.resize();
                    scene.start();
                });
        }

        let rt;
        const onResize = () => {
            clearTimeout(rt);
            rt = setTimeout(() => {
                scene.resize();
                scene.start();
            }, 150);
        };
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()));
        io.observe(canvas);
        const onNote = () => scene.shake();
        window.addEventListener('resize', onResize);
        window.addEventListener('zen:note', onNote);
        return () => {
            scene.stop();
            io.disconnect();
            window.removeEventListener('resize', onResize);
            window.removeEventListener('zen:note', onNote);
            scene = null;
        };
    }, [profile.firstName, profile.lastName]);

    const local = (e) => {
        const r = canvasRef.current.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
    };

    return (
        <section className="zn-hero" id="top">
            <h1 className="zn-sr">
                {profile.name}, {profile.title}
            </h1>
            <canvas
                ref={canvasRef}
                className="zn-hero__canvas"
                aria-hidden="true"
                onMouseMove={(e) => sceneRef.current?.setPointer(...local(e), true)}
                onMouseLeave={() => sceneRef.current?.setPointer(-9999, -9999, false)}
                onTouchMove={(e) => {
                    const t = e.touches[0];
                    if (t) sceneRef.current?.setPointer(...local(t), true);
                }}
                onTouchEnd={() => sceneRef.current?.setPointer(-9999, -9999, false)}
                onClick={(e) => sceneRef.current?.burst(...local(e))}
            />

            <div className="zn-hero__top" aria-hidden="true">
                <span>桜と山 · a garden in plain text</span>
                <span className="zn-hide-sm">touch the letters · click the sky</span>
            </div>

            <div className="zn-term" role="group" aria-label="Introduction">
                <div className="zn-term__bar">
                    <i /><i /><i />
                    <span>~/surat — zsh</span>
                </div>
                <div className="zn-term__body">
                    {LINES.map((l, i) => {
                        if (i > typed.line) return null;
                        const cmd = i === typed.line ? l.cmd.slice(0, typed.chars) : l.cmd;
                        return (
                            <div key={l.cmd}>
                                <p className="zn-term__cmd">
                                    <b>❯</b> {cmd}
                                    {i === typed.line && !typed.done && <span className="zn-caret" />}
                                </p>
                                {i < typed.line && <p className="zn-term__out">{l.out}</p>}
                            </div>
                        );
                    })}
                    <div className={`zn-term__actions ${typed.done ? 'is-in' : ''}`}>
                        <Link to={{ pathname: '/', hash: '#works' }} data-cursor="dig in">
                            [ see the work ]
                        </Link>
                        <Link to="/resume" data-cursor="read">
                            [ résumé ]
                        </Link>
                        <SoundToggle />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AsciiHero;
