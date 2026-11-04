import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import AsciiTitle from '../AsciiTitle';
import { useTitle } from '../lib';

const NotFound = () => {
    useTitle('Not found');
    return (
        <div className="ax ax-page">
            <Navbar />
            <main id="main" className="ax-page__main">
                <AsciiTitle text="404" fill="page not found nobody home" label="404" className="ax-title--tall" />
                <h1 className="ax-post__title">Nobody home.</h1>
                <p className="ax-page__lead">
                    This page doesn’t exist. The address may be mistyped, or the page may have been taken down.
                </p>
                <div className="ax-ctas">
                    <Link to="/" className="ax-btn ax-btn--solid">
                        Back to the portfolio
                    </Link>
                    <Link to="/#work" className="ax-btn">
                        See the work
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotFound;
