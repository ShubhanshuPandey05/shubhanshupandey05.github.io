import { useState } from 'react';
import { Link } from 'react-router-dom';
import Label from './Label';

const Contact = ({ email, socials, n }) => {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
        } catch {
            setCopied(false);
            return;
        }
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <section className="ax-sec ax-contact" id="contact" data-scene="contact">
            <div className="ax-window" aria-hidden="true" />
            <div className="ax-sec__body">
                <Label n={n}>Contact</Label>
                <p className="ax-statement ax-contact__title">
                    Let’s build something <em>that lasts.</em>
                </p>
                <p className="ax-contact__lead">Email is the fastest way to reach me.</p>
                <div className="ax-contact__row">
                    <a className="ax-contact__email" href={`mailto:${email}`}>
                        {email}
                    </a>
                    <button type="button" className="ax-btn ax-btn--small" onClick={copy} aria-live="polite">
                        {copied ? 'Copied ✓' : 'Copy'}
                    </button>
                </div>
                <ul className="ax-links">
                    {socials.map((s) => (
                        <li key={s.platform}>
                            <a href={s.url} target="_blank" rel="noreferrer">
                                {s.platform} <span aria-hidden="true">↗</span>
                            </a>
                        </li>
                    ))}
                    <li>
                        <Link to="/resume">
                            Résumé <span aria-hidden="true">↗</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </section>
    );
};

export default Contact;
