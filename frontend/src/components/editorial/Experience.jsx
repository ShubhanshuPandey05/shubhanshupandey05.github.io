import Reveal from './Reveal';
import { SectionHead } from './Preface';

const camps = ['Camp III', 'Camp II', 'Base Camp', 'Trailhead'];

const Experience = ({ items }) => (
    <section className="ed-section ed-climb" id="experience">
        <span className="ed-climb__glyph" aria-hidden="true">山</span>
        <div className="ed-wrap">
            <SectionHead no="02" label="Experience" />
            <div className="ed-climb__intro">
                <Reveal as="h2" className="ed-h2">
                    The climb, <em>so far.</em>
                </Reveal>
                <Reveal as="p" className="ed-climb__lede" delay={0.1}>
                    Three stops on the way up: two internships building real-time and cloud backends,
                    and now freelance work turning paper-driven businesses into software.
                </Reveal>
            </div>

            <ol className="ed-roles">
                {items.map((job, i) => (
                    <Reveal as="li" key={job.company} className="ed-role" delay={i * 0.05}>
                        <div className="ed-role__meta">
                            <span className="ed-role__camp">{camps[i] || `Stop ${i + 1}`}</span>
                            <span className="ed-role__dates">
                                {job.start} <i>→</i> {job.end}
                            </span>
                            <span className="ed-role__place">{job.place}</span>
                            {job.end === 'Present' && <span className="ed-role__now">Now</span>}
                        </div>
                        <div className="ed-role__head">
                            <h3 className="ed-role__company">{job.company}</h3>
                            <p className="ed-role__title">{job.role}</p>
                            <p className="ed-role__summary">{job.summary}</p>
                        </div>
                        <div className="ed-role__detail">
                            <ul>
                                {job.points.map((pt) => (
                                    <li key={pt}>{pt}</li>
                                ))}
                            </ul>
                            <div className="ed-tags">
                                {job.tags.map((t) => (
                                    <span key={t}>{t}</span>
                                ))}
                            </div>
                        </div>
                    </Reveal>
                ))}
            </ol>
        </div>
    </section>
);

export default Experience;
