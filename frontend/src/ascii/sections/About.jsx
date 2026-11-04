import Label from './Label';
import Scramble from '../Scramble';

// "*word*" in the curated copy marks the words to emphasise.
const Statement = ({ text }) => (
    <p className="ax-statement">
        {text.split(/(\*[^*]+\*)/g).map((part, i) =>
            part.startsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : <span key={i}>{part}</span>
        )}
    </p>
);

const fmt = (v, decimals = 0) => (Number(v) || 0).toFixed(decimals);

const About = ({ copy, stats, education, n }) => (
    <section className="ax-sec" id="about" data-scene="about">
        <div className="ax-window" aria-hidden="true" />
        <div className="ax-sec__body">
            <Label n={n}>About</Label>
            <Statement text={copy.statement.replace(/\* \*/g, ' ')} />
            <div className="ax-prose">
                {copy.paragraphs.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                ))}
            </div>
            <dl className="ax-stats">
                <div>
                    <dt>Years building backends</dt>
                    <Scramble as="dd" text={`${fmt(stats.yearsOfExperience, 1)}+`} />
                </div>
                <div>
                    <dt>Projects shipped</dt>
                    <Scramble as="dd" text={fmt(stats.projectsCompleted)} />
                </div>
                <div>
                    <dt>Technologies in rotation</dt>
                    <Scramble as="dd" text={`${fmt(stats.technologiesUsed)}+`} />
                </div>
                <div>
                    <dt>Commits this year</dt>
                    <Scramble as="dd" text={fmt(stats.codeCommits)} />
                </div>
            </dl>
            <ul className="ax-edu">
                {education.map((e) => (
                    <li key={e.school}>
                        <span className="ax-edu__years">{e.years}</span>
                        <strong>{e.school}</strong>
                        <span>
                            {e.degree}. {e.note}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    </section>
);

export default About;
