import Reveal from './Reveal';
import { SectionHead } from './Preface';

const Margins = ({ education }) => (
    <section className="ed-section ed-margins" id="education">
        <div className="ed-wrap">
            <SectionHead no="05" label="Margin Notes" />
            <div className="ed-margins__grid">
                <Reveal className="ed-margins__now">
                    <span className="ed-label">Right now</span>
                    <p>
                        Freelancing out of Surat, finishing my degree, reading far too much about
                        distributed systems, and looking for a backend team where <em>uptime matters</em>.
                    </p>
                </Reveal>
                {education.map((e, i) => (
                    <Reveal key={e.school} className="ed-margins__card" delay={0.1 + i * 0.08}>
                        <span className="ed-label">{e.years}</span>
                        <h3>{e.degree}</h3>
                        <p className="ed-margins__school">{e.school}</p>
                        <p>{e.note}</p>
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
);

export default Margins;
