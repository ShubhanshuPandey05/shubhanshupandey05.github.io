import AsciiCanvas from '../AsciiCanvas';
import Reveal from '../Reveal';
import { blossomTree } from '../scenes';

const About = ({ copy, education }) => (
    <section className="ik-section ik-about" id="about">
        <div className="ik-about__text">
            <Reveal as="p" className="ik-label">01 · About</Reveal>
            <Reveal as="h2" className="ik-h2" delay={80}>
                Steady, layered systems that <span className="ik-red">outlast the weather.</span>
            </Reveal>
            {copy.paragraphs.map((p, i) => (
                <Reveal as="p" className="ik-body" key={i} delay={140 + i * 60}>
                    {p}
                </Reveal>
            ))}
            <Reveal as="blockquote" className="ik-quote" delay={260}>
                “{copy.quote}”
            </Reveal>
            <Reveal className="ik-edu" delay={320}>
                {education.map((e) => (
                    <div key={e.school}>
                        <span className="ik-edu__years">{e.years}</span>
                        <strong>{e.school}</strong>
                        <span>{e.degree}. {e.note}</span>
                    </div>
                ))}
            </Reveal>
        </div>
        <figure className="ik-about__art">
            <AsciiCanvas
                scene={blossomTree}
                mist={[{ y: 0.93, h: 0.06, a: 0.8, speed: 0.4 }]}
                petals={{ count: 22, x0: 0.1, x1: 1.1, y0: 0.05, y1: 0.5 }}
                label="A cherry tree in blossom under a pale moon, drawn in text characters"
            />
            <figcaption>Fig. 1, a cherry tree in Surat that does not exist. Move your cursor through the mist.</figcaption>
        </figure>
    </section>
);

export default About;
