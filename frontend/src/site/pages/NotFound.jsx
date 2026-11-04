import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../ClassicNavbar';
import Footer from '../ClassicFooter';
import '../site.css';

// 404 in the classic design's look (same type and tokens as its blog and résumé pages).
const NotFound = () => {
    useEffect(() => {
        document.title = 'Not found · Shubhanshu Pandey';
    }, []);
    return (
        <div className="min-h-screen bg-bg-primary">
            <Navbar />
            <main id="main" className="pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <span className="text-caption text-accent">Error 404</span>
                    <h1 className="text-display mt-4">
                        Nobody home<span className="text-accent">.</span>
                    </h1>
                    <p className="text-body-lg text-text-muted mt-6 max-w-xl">
                        This page doesn’t exist. The address may be mistyped, or the page may have been taken down.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-3 mt-10 text-caption text-text-muted hover:text-text-primary transition-colors"
                    >
                        <span className="w-10 h-px bg-text-muted" />
                        Back to the portfolio
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotFound;
