import Label from './Label';
import Scramble from '../Scramble';
import { host } from '../lib';

const Project = ({ p, i, n }) => (
    <article className="ax-sec__body ax-proj" data-scene={`project-${i}`} data-sub="1" aria-labelledby={`proj-${i}`}>
        <Scramble as="p" className="ax-proj__meta" text={`${n}.${i + 1} · ${p.kicker}${p.year ? ` · ${p.year}` : ''}`} />
        <h3 className="ax-proj__title" id={`proj-${i}`}>
            {p.title}
        </h3>
        {p.deck && <p className="ax-proj__deck">{p.deck}</p>}
        <div className="ax-prose">
            {(p.body || []).map((b) => (
                <p key={b.slice(0, 24)}>{b}</p>
            ))}
        </div>
        {(p.techStack || []).length > 0 && (
            <ul className="ax-tags" aria-label="Built with">
                {p.techStack.map((t) => (
                    <li key={t}>{t}</li>
                ))}
            </ul>
        )}
        <div className="ax-proj__links">
            {p.liveUrl && (
                <a href={p.liveUrl} target="_blank" rel="noreferrer" className="ax-btn ax-btn--solid ax-btn--small">
                    Live site <span aria-hidden="true">↗</span>
                    <span className="ax-proj__host">{host(p.liveUrl)}</span>
                </a>
            )}
            {p.githubUrl && (
                <a href={p.githubUrl} target="_blank" rel="noreferrer" className="ax-btn ax-btn--small">
                    Source <span aria-hidden="true">↗</span>
                </a>
            )}
        </div>
    </article>
);

const Work = ({ projects, githubUrl, n }) => (
    <section className="ax-sec ax-work" id="work">
        <div className="ax-scene" data-scene="work">
            <div className="ax-window" aria-hidden="true" />
            <header className="ax-sec__body ax-sec__head">
                <Label n={n}>Selected work</Label>
                <p className="ax-statement">
                    Things I built and shipped. <em>Each one is a backend doing heavy lifting</em> behind a simple surface.
                </p>
                <ol className="ax-toc">
                    {projects.map((p, i) => (
                        <li key={p.title}>
                            <a href={`#proj-${i}`}>
                                <span>
                                    {n}.{i + 1}
                                </span>
                                {p.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </header>
        </div>
        {projects.map((p, i) => (
            <Project key={p.title} p={p} i={i} n={n} />
        ))}
        {githubUrl && (
            <p className="ax-sec__body ax-more">
                More experiments on{' '}
                <a href={githubUrl} target="_blank" rel="noreferrer">
                    GitHub ↗
                </a>
            </p>
        )}
    </section>
);

export default Work;
