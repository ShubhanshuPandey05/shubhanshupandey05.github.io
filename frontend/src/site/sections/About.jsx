import { useEffect, useRef, useState } from 'react';
import { clamp, reducedMotion, useInView } from '../lib';

// Words brighten one by one as the paragraph scrolls through the viewport.
const ScrollWords = ({ text, className }) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const words = [...el.querySelectorAll('span')];
        if (reducedMotion()) {
            words.forEach((w) => w.classList.add('is-lit'));
            return undefined;
        }
        let raf = 0;
        const update = () => {
            raf = 0;
            const r = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1);
            const lit = Math.round(p * words.length);
            words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [text]);
    return (
        <p ref={ref} className={className}>
            {text.split(' ').map((w, i) => (
                <span key={i} className={/^\*.*\*[.,]?$/.test(w) ? 'is-acc' : ''}>
                    {w.replace(/\*/g, '')}{' '}
                </span>
            ))}
        </p>
    );
};

const CountUp = ({ to, suffix = '', decimals = 0 }) => {
    const [ref, seen] = useInView();
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!seen) return undefined;
        if (reducedMotion()) {
            setVal(to);
            return undefined;
        }
        const t0 = performance.now();
        let raf = 0;
        const tick = (t) => {
            const p = Math.min(1, (t - t0) / 1400);
            setVal(to * (1 - Math.pow(1 - p, 4)));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [seen, to]);
    return (
        <span ref={ref}>
            {val.toFixed(decimals)}
            {suffix}
        </span>
    );
};

export const Marquee = ({ items }) => (
    <div className="sp-marquee-wrap" aria-hidden="true">
      <div className="sp-marquee">
        <div className="sp-marquee__track">
            {[0, 1].map((k) => (
                <div className="sp-marquee__group" key={k}>
                    {items.map((t) => (
                        <span key={t}>
                            {t} <i>✦</i>
                        </span>
                    ))}
                </div>
            ))}
        </div>
      </div>
    </div>
);

const About = ({ copy, stats, education }) => (
    <section className="sp-section sp-about" id="about">
        <p className="sp-label">
            <span>01</span> About
        </p>
        <ScrollWords className="sp-about__statement" text={copy.statement} />
        <div className="sp-about__grid">
            <div className="sp-about__copy">
                {copy.paragraphs.map((p) => (
                    <p key={p.slice(0, 20)}>{p}</p>
                ))}
            </div>
            <dl className="sp-stats">
                <div>
                    <dt>Years building backends</dt>
                    <dd>
                        <CountUp to={Number(stats.yearsOfExperience) || 0} decimals={1} suffix="+" />
                    </dd>
                </div>
                <div>
                    <dt>Projects shipped</dt>
                    <dd>
                        <CountUp to={Number(stats.projectsCompleted) || 0} />
                    </dd>
                </div>
                <div>
                    <dt>Technologies in rotation</dt>
                    <dd>
                        <CountUp to={Number(stats.technologiesUsed) || 0} suffix="+" />
                    </dd>
                </div>
                <div>
                    <dt>Commits this year</dt>
                    <dd>
                        <CountUp to={Number(stats.codeCommits) || 0} />
                    </dd>
                </div>
            </dl>
        </div>
        <ul className="sp-edu">
            {education.map((e) => (
                <li key={e.school}>
                    <span className="sp-mono">{e.years}</span>
                    <strong>{e.school}</strong>
                    <span>
                        {e.degree}. {e.note}
                    </span>
                </li>
            ))}
        </ul>
    </section>
);

export default About;
