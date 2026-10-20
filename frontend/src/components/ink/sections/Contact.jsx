import AsciiCanvas from '../AsciiCanvas';
import { sunsetWater } from '../scenes';

const Contact = ({ email, socials }) => (
    <section className="ik-contact" id="contact">
        <AsciiCanvas
            className="ik-contact__bg"
            scene={sunsetWater}
            mist={[
                { y: 0.64, h: 0.05, a: 0.8, speed: 0.4 },
                { y: 0.92, h: 0.06, a: 0.6, speed: -0.3 },
            ]}
            petals={{ count: 14, x0: 0.2, x1: 1.05, y0: -0.05, y1: 0.3 }}
            label="A red sun setting over mountains and water, with a small boat, drawn in text characters"
        />
        <div className="ik-contact__inner">
            <p className="ik-label">06 · Contact</p>
            <h2 className="ik-contact__title">
                Let’s build something <span className="ik-red">that lasts.</span>
            </h2>
            <a className="ik-contact__email" href={`mailto:${email}`} data-cursor="write">
                {email}
            </a>
            <ul className="ik-contact__socials">
                {socials.map((s) => (
                    <li key={s.platform}>
                        <a href={s.url} target="_blank" rel="noreferrer">
                            {s.platform} ↗
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    </section>
);

export default Contact;
