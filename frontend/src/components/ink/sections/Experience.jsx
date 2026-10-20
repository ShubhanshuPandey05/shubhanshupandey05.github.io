import AsciiCanvas from '../AsciiCanvas';
import Reveal from '../Reveal';
import { snowRange } from '../scenes';

const Experience = ({ experience }) => (
    <section className="ik-section ik-exp" id="experience">
        <div className="ik-exp__band">
            <AsciiCanvas
                scene={snowRange}
                mist={[
                    { y: 0.72, h: 0.08, a: 0.7, speed: 0.5 },
                    { y: 0.95, h: 0.08, a: 0.85, speed: -0.4 },
                ]}
                label="Snowy mountain ranges with a small climber, drawn in text characters"
            />
            <div className="ik-exp__head">
                <p className="ik-label">02 · Experience</p>
                <h2 className="ik-h2 ik-h2--huge">The climb so far</h2>
            </div>
        </div>
        <ol className="ik-exp__list">
            {experience.map((job, i) => (
                <Reveal as="li" className="ik-job" key={job.company} delay={i * 60}>
                    <div className="ik-job__when">
                        <span>{job.start}</span>
                        <span className="ik-job__line" aria-hidden="true" />
                        <span>{job.end}</span>
                    </div>
                    <div className="ik-job__who">
                        <h3>{job.company}</h3>
                        <p>{job.role}</p>
                        <p className="ik-muted">{job.place}</p>
                    </div>
                    <div className="ik-job__what">
                        <p className="ik-job__summary">{job.summary}</p>
                        <ul>
                            {job.points.map((p) => (
                                <li key={p}>{p}</li>
                            ))}
                        </ul>
                        <div className="ik-tags">
                            {job.tags.map((t) => (
                                <span key={t}>{t}</span>
                            ))}
                        </div>
                    </div>
                </Reveal>
            ))}
        </ol>
    </section>
);

export default Experience;
