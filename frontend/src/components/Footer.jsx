import { Link } from 'react-router-dom';
import * as content from '../data/content';

const Footer = () => (
    <footer className="sp-footer">
        <div className="sp-footer__big" aria-hidden="true">
            {'Shubhanshu'.split('').map((c, i) => (
                <span key={i} style={{ '--i': i }}>
                    {c}
                </span>
            ))}
            <em>.</em>
        </div>
        <div className="sp-footer__row">
            <p>
                Backend developer in Surat, India.
                <br />
                <span className="sp-dim">Built with React and a lot of canvas. No templates were harmed.</span>
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
            <button type="button" className="sp-footer__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-cursor="up">
                Back to top ↑
            </button>
        </div>
        <p className="sp-footer__copy sp-mono">© {new Date().getFullYear()} Shubhanshu Pandey</p>
    </footer>
);

export default Footer;
