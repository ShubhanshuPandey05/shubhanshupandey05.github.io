import { Link } from 'react-router-dom';
import * as content from '../data/content';

const Footer = () => (
    <footer className="ik-footer">
        <div className="ik-footer__big" aria-hidden="true">
            Shubhanshu<span>.</span>
        </div>
        <div className="ik-footer__row">
            <p>
                Backend developer in Surat, India.
                <br />
                Mountains, blossoms and mist on this site are drawn with text characters, and the music is generated
                live in your browser.
            </p>
            <ul>
                <li><Link to="/resume">Résumé</Link></li>
                <li><Link to="/blog">Notes</Link></li>
                {content.socials.map((s) => (
                    <li key={s.platform}>
                        <a href={s.url} target="_blank" rel="noreferrer">{s.platform}</a>
                    </li>
                ))}
            </ul>
            <p className="ik-footer__copy">© {new Date().getFullYear()} Shubhanshu Pandey</p>
        </div>
    </footer>
);

export default Footer;
