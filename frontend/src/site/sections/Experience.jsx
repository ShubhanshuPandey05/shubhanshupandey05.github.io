import { useEffect, useRef, useState } from 'react';
import { clamp } from '../lib';

const Experience = ({ experience }) => {
    const [open, setOpen] = useState(0);
    const listRef = useRef(null);

    // The timeline rail fills in as the list scrolls past the middle of the screen.
    useEffect(() => {
        const el = listRef.current;
        if (!el) return undefined;
        let raf = 0;
        const update = () => {
            raf = 0;
            const r = el.getBoundingClientRect();
            const p = clamp((window.innerHeight * 0.55 - r.top) / r.height, 0, 1);
            el.style.setProperty('--fill', p.toFixed(3));
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <section className="sp-section sp-exp" id="experience">
            <div className="sp-exp__head">
                <p className="sp-label">
                    <span>04</span> Experience
                </p>
                <h2 className="sp-h2">
                    Where I’ve <em>shipped.</em>
                </h2>
            </div>
            <ol className="sp-exp__list" ref={listRef}>
                {experience.map((job, i) => {
                    const isOpen = open === i;
                    return (
                        <li key={job.company} className={`sp-job ${isOpen ? 'is-open' : ''}`}>
                            <span className="sp-job__dot" aria-hidden="true" />
                            <button
                                type="button"
                                className="sp-job__row"
                                onClick={() => setOpen(isOpen ? -1 : i)}
                                aria-expanded={isOpen}
                                data-cursor={isOpen ? 'close' : 'open'}
                            >
                                <span className="sp-job__when sp-mono">
                                    {job.start} — {job.end}
                                </span>
                                <span className="sp-job__company">{job.company}</span>
                                <span className="sp-job__role">{job.role}</span>
                                <span className="sp-job__toggle" aria-hidden="true" />
                            </button>
                            <div className="sp-job__body">
                                <div>
                                    <p className="sp-job__summary">{job.summary}</p>
                                    <ul>
                                        {job.points.map((p) => (
                                            <li key={p}>{p}</li>
                                        ))}
                                    </ul>
                                    <div className="sp-tags">
                                        <span className="sp-tag sp-tag--plain">{job.place}</span>
                                        {job.tags.map((t) => (
                                            <span className="sp-tag" key={t}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
};

export default Experience;
