import GeoDemo from '../demos/GeoDemo';
import VoiceDemo from '../demos/VoiceDemo';
import FormsDemo from '../demos/FormsDemo';

const DEMOS = { geojobs: GeoDemo, voice: VoiceDemo, forms: FormsDemo };

// Projects from the CMS without a hand-built demo get a tilting gradient card instead.
const Fallback = ({ title }) => {
    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -10}deg`);
        e.currentTarget.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`);
    };
    const onLeave = (e) => {
        e.currentTarget.style.setProperty('--rx', '0deg');
        e.currentTarget.style.setProperty('--ry', '0deg');
    };
    return (
        <div className="sp-demo sp-demo--fallback" onPointerMove={onMove} onPointerLeave={onLeave}>
            <div className="sp-fallback__card">
                <span>{(title || '?').slice(0, 1)}</span>
            </div>
        </div>
    );
};

const Work = ({ projects, githubUrl }) => (
    <section className="sp-section sp-work" id="work">
        <div className="sp-work__head">
            <p className="sp-label">
                <span>02</span> Selected work
            </p>
            <h2 className="sp-h2">
                Things I built. <em>Go ahead, touch them.</em>
            </h2>
            <p className="sp-lead">Each one is a backend doing heavy lifting behind a simple surface. The demos are playable.</p>
        </div>
        <div className="sp-work__list">
            {projects.map((p, i) => {
                const Demo = DEMOS[p.key];
                return (
                    <article className="sp-proj" key={p.title} style={{ '--i': i }}>
                        <div className="sp-proj__text">
                            <p className="sp-proj__meta sp-mono">
                                <span>{String(i + 1).padStart(2, '0')}</span>
                                {p.kicker}
                                {p.year && <> · {p.year}</>}
                            </p>
                            <h3>{p.title}</h3>
                            <p className="sp-proj__deck">{p.deck}</p>
                            {p.body.map((b) => (
                                <p className="sp-proj__body" key={b.slice(0, 24)}>
                                    {b}
                                </p>
                            ))}
                            <div className="sp-tags">
                                {(p.techStack || []).map((t) => (
                                    <span className="sp-tag" key={t}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                            <div className="sp-proj__links">
                                {p.liveUrl && (
                                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="sp-btn sp-btn--solid sp-btn--small" data-cursor="visit">
                                        Live site ↗
                                    </a>
                                )}
                                {p.githubUrl && (
                                    <a href={p.githubUrl} target="_blank" rel="noreferrer" className="sp-btn sp-btn--small" data-cursor="code">
                                        Source ↗
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="sp-proj__demo">{Demo ? <Demo /> : <Fallback title={p.title} />}</div>
                    </article>
                );
            })}
        </div>
        <p className="sp-work__more">
            More experiments on{' '}
            <a href={githubUrl} target="_blank" rel="noreferrer" data-cursor="github">
                GitHub ↗
            </a>
        </p>
    </section>
);

export default Work;
