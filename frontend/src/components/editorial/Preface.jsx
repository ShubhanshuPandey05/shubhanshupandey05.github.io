import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import Reveal from './Reveal';

const CountUp = ({ value }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [shown, setShown] = useState(0);
    const decimals = String(value).includes('.') ? 1 : 0;

    useEffect(() => {
        if (!inView) return undefined;
        let raf;
        const start = performance.now();
        const tick = (t) => {
            const k = Math.min(1, (t - start) / 1400);
            const eased = 1 - Math.pow(1 - k, 3);
            setShown(value * eased);
            if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, value]);

    return <span ref={ref}>{shown.toFixed(decimals)}</span>;
};

const SectionHead = ({ no, label, glyph }) => (
    <div className="ed-sechead">
        <span className="ed-sechead__no">Chapter {no}</span>
        <span className="ed-sechead__rule" />
        <span className="ed-sechead__label">{label}</span>
        {glyph && <span className="ed-sechead__glyph" aria-hidden="true">{glyph}</span>}
    </div>
);

export { SectionHead };

const Preface = ({ copy, stats }) => {
    const figures = [
        { v: stats.yearsOfExperience, label: 'Years shipping to production', suffix: '' },
        { v: stats.projectsCompleted, label: 'Projects taken to launch', suffix: '' },
        { v: stats.technologiesUsed, label: 'Tools in the kit', suffix: '+' },
        { v: stats.codeCommits, label: 'Commits and counting', suffix: '' },
    ];

    return (
        <section className="ed-section ed-preface" id="preface">
            <div className="ed-wrap">
                <SectionHead no="01" label="Preface" glyph="序" />

                <Reveal as="h2" className="ed-preface__headline">
                    {copy.headline[0]} {copy.headline[1]}{' '}
                    <em>{copy.headline[2]}</em> {copy.headline[3]}
                </Reveal>

                <div className="ed-preface__grid">
                    <Reveal className="ed-preface__body">
                        {copy.paragraphs.map((p, i) => (
                            <p key={i} className={i === 0 ? 'ed-dropcap' : ''}>
                                {p}
                            </p>
                        ))}
                    </Reveal>
                    <Reveal className="ed-pullquote" delay={0.15}>
                        <span className="ed-pullquote__mark" aria-hidden="true">“</span>
                        <blockquote>{copy.quote}</blockquote>
                        <cite>A note to self, pinned above the desk</cite>
                    </Reveal>
                </div>

                <div className="ed-figures">
                    {figures.map((f, i) => (
                        <Reveal key={f.label} className="ed-figure" delay={i * 0.08}>
                            <span className="ed-figure__no">
                                <CountUp value={Number(f.v) || 0} />
                                {f.suffix}
                            </span>
                            <span className="ed-figure__label">{f.label}</span>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Preface;
