import { Link } from 'react-router-dom';
import * as content from '../data/content';

const Footer = () => (
    <footer className="ax-footer">
        <div className="ax-footer__row">
            <p>
                © {new Date().getFullYear()} Shubhanshu Pandey
                <br />
                <span>Backend engineer in Surat, India.</span>
            </p>
            <ul>
                <li>
                    <Link to="/resume">Résumé</Link>
                </li>
                <li>
                    <Link to="/blog">Notes</Link>
                </li>
                {content.socials.map((s) => (
                    <li key={s.platform}>
                        <a href={s.url} target="_blank" rel="noreferrer">
                            {s.platform}
                        </a>
                    </li>
                ))}
            </ul>
            <button type="button" className="ax-footer__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Back to top ↑
            </button>
        </div>
        <p className="ax-footer__note">
            Rendered in plain text. The portrait on the home page is drawn entirely in ASCII characters.
        </p>
    </footer>
);

export default Footer;
