import { useEffect, useState } from 'react';
import { useInView } from './useInView';

const HAIKU = ['steady servers hum', 'queues drain like melting spring snow', 'the petals still fall'];

// A text progress bar that fills up when it scrolls into view.
const Meter = ({ label, value, max, suffix = '', run }) => {
    const slots = 22;
    const [k, setK] = useState(0);
    useEffect(() => {
        if (!run) return undefined;
        let raf;
        const start = performance.now();
        const tick = (t) => {
            const p = Math.min(1, (t - start) / 1600);
            setK(1 - Math.pow(1 - p, 3));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [run]);
    const filled = Math.round(Math.min(1, value / max) * slots * k);
    const shown = (value * k).toFixed(String(value).includes('.') ? 1 : 0);
    return (
        <div className="zn-meter">
            <span className="zn-meter__label">{label}</span>
            <span className="zn-meter__bar" aria-hidden="true">
                [<b>{'✿'.repeat(filled)}</b>
                {'·'.repeat(slots - filled)}]
            </span>
            <span className="zn-meter__value">
                {shown}
                {suffix}
            </span>
        </div>
    );
};

const Haiku = ({ copy, stats }) => {
    const [ref, seen] = useInView();
    const [mref, mseen] = useInView();
    return (
        <section className="zn-section zn-haiku" id="haiku">
            <div className="zn-chapter" aria-hidden="true">
                <span>一</span> first, a haiku
            </div>
            <div ref={ref} className={`zn-haiku__poem ${seen ? 'is-in' : ''}`}>
                {HAIKU.map((line, i) => (
                    <p key={line} style={{ '--i': i }}>
                        {line.split(' ').map((word, j, all) => (
                            <span key={j} style={{ '--j': j }}>
                                {word}
                                {j < all.length - 1 ? '\u00a0' : ''}
                            </span>
                        ))}
                    </p>
                ))}
                <span className="zn-haiku__stamp">詩</span>
            </div>

            <div className="zn-haiku__split">
                <div className="zn-haiku__prose">
                    {copy.paragraphs.map((p) => (
                        <p key={p.slice(0, 20)}>{p}</p>
                    ))}
                </div>
                <div ref={mref} className="zn-haiku__meters">
                    <p className="zn-mono-label">$ stats --since 2025</p>
                    <Meter label="years shipping" value={Number(stats.yearsOfExperience) || 0} max={3} run={mseen} />
                    <Meter label="projects launched" value={Number(stats.projectsCompleted) || 0} max={8} run={mseen} />
                    <Meter label="tools in the kit" value={Number(stats.technologiesUsed) || 0} max={20} suffix="+" run={mseen} />
                    <Meter label="commits" value={Number(stats.codeCommits) || 0} max={400} run={mseen} />
                    <p className="zn-haiku__quote">“{copy.quote}”</p>
                </div>
            </div>
        </section>
    );
};

export default Haiku;
