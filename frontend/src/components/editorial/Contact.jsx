import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import PetalField from './PetalField';
import WobbleWord from './WobbleWord';

const Contact = ({ email, socials }) => (
    <section className="ed-section ed-contact" id="contact">
        <PetalField count={22} className="ed-petals--light" colors={['#f7f3ee', '#f1c9cf', '#ffffff', '#e48a99']} />
        <div className="ed-wrap">
            <div className="ed-sechead ed-sechead--light">
                <span className="ed-sechead__no">Chapter 06</span>
                <span className="ed-sechead__rule" />
                <span className="ed-sechead__label">Correspondence</span>
            </div>
            <Reveal as="h2" className="ed-contact__headline">
                Let&apos;s grow <br />
                something <em><WobbleWord text="together." /></em>
            </Reveal>
            <Reveal className="ed-contact__grid" delay={0.1}>
                <div>
                    <span className="ed-label">Write to me</span>
                    <a className="ed-contact__email" href={`mailto:${email}`} data-cursor="say hi ✿">
                        {email}
                    </a>
                    <p className="ed-contact__note">
                        Backend roles, freelance builds, or just a good systems problem. I usually reply within a day.
                    </p>
                </div>
                <div>
                    <span className="ed-label">Elsewhere</span>
                    <ul className="ed-contact__links">
                        {socials.map((s) => (
                            <li key={s.platform}>
                                <a href={s.url} target="_blank" rel="noreferrer" data-cursor="open ↗">
                                    {s.platform} <span aria-hidden="true">↗</span>
                                </a>
                            </li>
                        ))}
                        <li>
                            <Link to="/resume" data-cursor="read">
                                Résumé <span aria-hidden="true">↗</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </Reveal>
        </div>
    </section>
);

export default Contact;
