import AsciiCanvas from '../AsciiCanvas';
import Reveal from '../Reveal';
import { mapPins, moonSea, toriiWater, bamboo } from '../scenes';

const ART = {
    geojobs: { scene: mapPins, alt: 'A contour map with red pins and a pink river' },
    voice: { scene: moonSea, alt: 'A moon over the sea with ripples spreading out' },
    forms: {
        scene: toriiWater,
        alt: 'A red torii gate standing in misty water',
        mist: [{ y: 0.5, h: 0.08, a: 0.8, speed: 0.4 }],
    },
};
const FALLBACK = { scene: bamboo, alt: 'A bamboo grove in mist', mist: [{ y: 0.7, h: 0.12, a: 0.6, speed: 0.3 }] };

const Work = ({ projects, githubUrl }) => (
    <section className="ik-section ik-work" id="work">
        <div className="ik-work__head">
            <p className="ik-label">03 · Selected work</p>
            <h2 className="ik-h2 ik-h2--huge">Things I built</h2>
            <p className="ik-body">A few projects I’m proud of, each one a backend doing heavy lifting behind a simple surface.</p>
        </div>
        <div className="ik-work__list">
            {projects.map((p, i) => {
                const art = ART[p.key] || FALLBACK;
                return (
                    <Reveal as="article" className={`ik-project ${i % 2 ? 'is-flipped' : ''}`} key={p.title}>
                        <div className="ik-project__art">
                            <AsciiCanvas scene={art.scene} mist={art.mist} label={`${art.alt}, drawn in text characters`} />
                            <span className="ik-project__no">{String(i + 1).padStart(2, '0')}</span>
                        </div>
                        <div className="ik-project__text">
                            <p className="ik-label">
                                {p.kicker}
                                {p.year && <> · {p.year}</>}
                            </p>
                            <h3>{p.title}</h3>
                            <p className="ik-project__deck">{p.deck}</p>
                            {p.body.map((b, k) => (
                                <p className="ik-body" key={k}>{b}</p>
                            ))}
                            <div className="ik-tags">
                                {(p.techStack || []).map((t) => (
                                    <span key={t}>{t}</span>
                                ))}
                            </div>
                            <div className="ik-project__links">
                                {p.liveUrl && (
                                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="ik-btn" data-cursor="visit">
                                        Visit live ↗
                                    </a>
                                )}
                                {p.githubUrl && (
                                    <a href={p.githubUrl} target="_blank" rel="noreferrer" className="ik-btn ik-btn--ghost" data-cursor="code">
                                        Source ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    </Reveal>
                );
            })}
        </div>
        <p className="ik-work__more">
            More experiments live on{' '}
            <a href={githubUrl} target="_blank" rel="noreferrer">
                GitHub ↗
            </a>
        </p>
    </section>
);

export default Work;
