import Reveal from './Reveal';
import { SectionHead } from './Preface';

const Toolkit = ({ skills, groups }) => {
    let counter = 0;
    const filled = groups
        .map((g) => ({ ...g, items: skills.filter((s) => (s.category || 'Other') === g.key) }))
        .filter((g) => g.items.length > 0);

    return (
        <section className="ed-section ed-toolkit" id="toolkit">
            <div className="ed-wrap">
                <SectionHead no="04" label="The Toolkit" glyph="道" />
                <Reveal as="h2" className="ed-h2">
                    An index of <em>instruments.</em>
                </Reveal>
                <div className="ed-index">
                    {filled.map((g, gi) => (
                        <Reveal key={g.key} className="ed-index__group" delay={gi * 0.08}>
                            <h3>{g.label}</h3>
                            <p>{g.note}</p>
                            <ul>
                                {g.items.map((s) => {
                                    counter += 1;
                                    return (
                                        <li key={s.name} data-cursor="">
                                            <span className="ed-index__name">{s.name}</span>
                                            <span className="ed-index__dots" />
                                            <span className="ed-index__no">{String(counter).padStart(2, '0')}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Toolkit;
