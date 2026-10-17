import Reveal from './Reveal';
import ProjectCover from './ProjectCover';
import { SectionHead } from './Preface';

const host = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

const Works = ({ projects, githubUrl }) => (
    <section className="ed-section ed-works" id="works">
        <div className="ed-wrap">
            <SectionHead no="03" label="Selected Works" glyph="作" />
            <div className="ed-works__intro">
                <Reveal as="h2" className="ed-h2">
                    Things I&apos;ve built, <em>and why they hold up.</em>
                </Reveal>
                <Reveal as="p" className="ed-works__count" delay={0.1}>
                    {String(projects.length).padStart(2, '0')} projects in this issue
                </Reveal>
            </div>

            <div className="ed-projects">
                {projects.map((p, i) => (
                    <article key={p.title} className={`ed-project ${i % 2 ? 'is-flipped' : ''}`}>
                        <Reveal className="ed-project__art">
                            <ProjectCover coverKey={p.key} index={i} title={p.title} />
                        </Reveal>
                        <Reveal className="ed-project__text" delay={0.1}>
                            <p className="ed-project__kicker">
                                <span>{String(i + 1).padStart(2, '0')}</span>
                                {p.kicker}
                                {p.year && <span className="ed-project__year">{p.year}</span>}
                            </p>
                            <h3 className="ed-project__title">{p.title}</h3>
                            {p.deck && <p className="ed-project__deck">{p.deck}</p>}
                            {p.body.map((para, j) => (
                                <p key={j} className="ed-project__body">
                                    {para}
                                </p>
                            ))}
                            {p.techStack?.length > 0 && (
                                <div className="ed-tags ed-tags--ink">
                                    {p.techStack.map((t) => (
                                        <span key={t}>{t}</span>
                                    ))}
                                </div>
                            )}
                            <div className="ed-project__links">
                                {p.liveUrl && (
                                    <a href={p.liveUrl} target="_blank" rel="noreferrer" data-cursor="visit ↗">
                                        <span>Visit</span> {host(p.liveUrl)} ↗
                                    </a>
                                )}
                                {p.githubUrl && (
                                    <a href={p.githubUrl} target="_blank" rel="noreferrer" data-cursor="code ↗">
                                        <span>Source</span> GitHub ↗
                                    </a>
                                )}
                            </div>
                        </Reveal>
                    </article>
                ))}
            </div>

            <Reveal className="ed-works__more">
                <a href={githubUrl} target="_blank" rel="noreferrer" data-cursor="more ↗">
                    More experiments live on GitHub <span aria-hidden="true">→</span>
                </a>
            </Reveal>
        </div>
    </section>
);

export default Works;
