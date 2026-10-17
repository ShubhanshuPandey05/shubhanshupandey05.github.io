import { Link } from 'react-router-dom';

const Footer = () => (
    <footer className="ed-footer">
        <svg className="ed-footer__range" viewBox="0 0 1600 160" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 160 L0 110 L120 60 L220 100 L360 20 L470 90 L600 50 L760 120 L900 40 L1040 100 L1180 30 L1300 90 L1450 50 L1600 100 L1600 160Z" fill="currentColor" />
        </svg>
        <div className="ed-footer__inner">
            <div className="ed-footer__brand">
                <span className="ed-seal">桜</span>
                <p>
                    Shubhanshu Pandey<br />
                    <em>Backend developer, Surat.</em>
                </p>
            </div>
            <p className="ed-footer__colophon">
                Colophon: set in Fraunces &amp; JetBrains Mono, printed in crimson, ink and paper.
                Hand-built with React and Vite. No real petals were harmed.
            </p>
            <div className="ed-footer__meta">
                <Link to="/resume">Résumé</Link>
                <Link to="/blog">Notes</Link>
                <span>&copy; {new Date().getFullYear()}</span>
            </div>
        </div>
    </footer>
);

export default Footer;
