import { Link } from 'react-router-dom';

const RIDGE = '  /\\      /\\    _/\\_      /\\        /\\/\\     /\\   _/\\       /\\    /\\_/\\    /\\      _/\\_    /\\     ';

const Footer = () => (
    <footer className="zn-footer">
        <pre className="zn-footer__ridge" aria-hidden="true">
            {RIDGE.repeat(3)}
            {'\n'}
            {' /  \\____/  \\__/    \\____/  \\______/    \\___/  \\_/    \\_____/  \\__/     \\__/  \\____/    \\__/  \\___ '.repeat(3)}
        </pre>
        <div className="zn-footer__inner">
            <p className="zn-footer__sign">
                <span className="zn-seal">桜</span>
                Shubhanshu Pandey <em>· backend developer, Surat</em>
            </p>
            <p className="zn-footer__colophon">
                Every mountain, blossom and petal on this site is a text character. The music is generated live in your
                browser. Built with React and Vite.
            </p>
            <p className="zn-footer__meta">
                <Link to="/resume">résumé</Link>
                <Link to="/blog">notes</Link>
                <span>© {new Date().getFullYear()}</span>
            </p>
        </div>
    </footer>
);

export default Footer;
