import Label from './Label';
import Scramble from '../Scramble';

const Experience = ({ experience, n }) => (
    <section className="ax-sec" id="experience" data-scene="experience">
        <div className="ax-window" aria-hidden="true" />
        <div className="ax-sec__body">
            <Label n={n}>Experience</Label>
            <p className="ax-statement">
                Where I’ve <em>shipped.</em>
            </p>
            <ol className="ax-jobs">
                {experience.map((job) => (
                    <li className="ax-job" key={`${job.company}-${job.start}`}>
                        <Scramble as="p" className="ax-job__when" text={`${job.start} → ${job.end}`} />
                        <h3 className="ax-job__role">
                            {job.role} <span>@ {job.company}</span>
                        </h3>
                        <p className="ax-job__summary">{job.summary}</p>
                        <ul className="ax-job__points">
                            {job.points.map((p) => (
                                <li key={p}>{p}</li>
                            ))}
                        </ul>
                        <ul className="ax-tags">
                            <li className="ax-tags__plain">{job.place}</li>
                            {job.tags.map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

export default Experience;
