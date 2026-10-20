import AsciiCanvas from '../AsciiCanvas';
import Reveal from '../Reveal';
import { bamboo } from '../scenes';

const Skills = ({ skills, groups }) => {
    const grouped = groups
        .map((g) => ({ ...g, items: skills.filter((s) => (s.category || 'Other') === g.key) }))
        .filter((g) => g.items.length);
    return (
        <section className="ik-section ik-skills" id="skills">
            <figure className="ik-skills__art">
                <AsciiCanvas
                    scene={bamboo}
                    mist={[{ y: 0.7, h: 0.14, a: 0.65, speed: 0.3 }]}
                    label="A bamboo grove in mist, drawn in text characters"
                />
            </figure>
            <div className="ik-skills__text">
                <p className="ik-label">04 · Skills</p>
                <h2 className="ik-h2">The tools I reach for</h2>
                <div className="ik-skills__groups">
                    {grouped.map((g, i) => (
                        <Reveal className="ik-skillgroup" key={g.key} delay={i * 70}>
                            <h3>
                                {g.label} <span>{g.note}</span>
                            </h3>
                            <ul>
                                {g.items.map((s) => (
                                    <li key={s.name}>{s.name}</li>
                                ))}
                            </ul>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
