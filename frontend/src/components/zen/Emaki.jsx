import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AsciiCover from './AsciiCover';

const host = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

// Works laid out like an emaki (a Japanese handscroll): the page scrolls down,
// the scroll unrolls sideways. On small screens it becomes a simple stack.
const Emaki = ({ projects, githubUrl }) => {
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const [height, setHeight] = useState(null);
    const [x, setX] = useState(0);
    const [pinned, setPinned] = useState(false);

    useLayoutEffect(() => {
        const measure = () => {
            const wide = window.innerWidth > 900;
            setPinned(wide);
            if (!wide || !trackRef.current) {
                setHeight(null);
                return;
            }
            const distance = trackRef.current.scrollWidth - window.innerWidth;
            setHeight(distance + window.innerHeight);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [projects.length]);

    useEffect(() => {
        if (!pinned) {
            setX(0);
            return undefined;
        }
        let raf = 0;
        const onScroll = () => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const sec = sectionRef.current;
                const track = trackRef.current;
                if (!sec || !track) return;
                const top = sec.getBoundingClientRect().top;
                const distance = track.scrollWidth - window.innerWidth;
                setX(Math.max(0, Math.min(distance, -top)));
            });
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
        };
    }, [pinned]);

    return (
        <section
            ref={sectionRef}
            className={`zn-emaki ${pinned ? 'is-pinned' : ''}`}
            id="works"
            style={height ? { height } : undefined}
        >
            <div className="zn-emaki__stage">
                <div ref={trackRef} className="zn-emaki__track" style={{ transform: `translate3d(${-x}px,0,0)` }}>
                    <div className="zn-panel zn-panel--intro">
                        <div className="zn-chapter zn-chapter--light" aria-hidden="true">
                            <span>三</span> the works, unrolled
                        </div>
                        <h2 className="zn-h2">
                            Things I&apos;ve built, <em>one panel at a time.</em>
                        </h2>
                        <p>
                            {projects.length} projects. Keep scrolling and the scroll unrolls to the side. Every picture
                            here is plain text, animated.
                        </p>
                        <pre className="zn-emaki__arrow" aria-hidden="true">{'~~~~~~~~~~~~~~~~~~~~~~~~>'}</pre>
                    </div>

                    {projects.map((p, i) => (
                        <article key={p.title} className="zn-panel zn-panel--work">
                            <div className="zn-panel__art">
                                <span className="zn-panel__no">
                                    {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                                </span>
                                <AsciiCover coverKey={p.key} title={p.title} />
                            </div>
                            <div className="zn-panel__text">
                                <p className="zn-panel__kicker">
                                    {p.kicker}
                                    {p.year && <span>{p.year}</span>}
                                </p>
                                <h3>{p.title}</h3>
                                {p.deck && <p className="zn-panel__deck">{p.deck}</p>}
                                {p.body.map((para) => (
                                    <p key={para.slice(0, 24)} className="zn-panel__body">
                                        {para}
                                    </p>
                                ))}
                                {p.techStack?.length > 0 && (
                                    <p className="zn-panel__stack">
                                        {p.techStack.map((t) => (
                                            <span key={t}>{t}</span>
                                        ))}
                                    </p>
                                )}
                                <p className="zn-panel__links">
                                    {p.liveUrl && (
                                        <a href={p.liveUrl} target="_blank" rel="noreferrer" data-cursor="visit ↗">
                                            ❯ open {host(p.liveUrl)}
                                        </a>
                                    )}
                                    {p.githubUrl && (
                                        <a href={p.githubUrl} target="_blank" rel="noreferrer" data-cursor="code ↗">
                                            ❯ read the source
                                        </a>
                                    )}
                                </p>
                            </div>
                        </article>
                    ))}

                    <div className="zn-panel zn-panel--outro">
                        <pre aria-hidden="true">{String.raw`
      _
    _(_)_        the scroll
   (_)@(_)       ends here,
     (_)\        the garden
         |       keeps growing
  ~~~~~~~|~~~~~
`}</pre>
                        <a href={githubUrl} target="_blank" rel="noreferrer" data-cursor="more ↗">
                            more experiments on GitHub →
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Emaki;
