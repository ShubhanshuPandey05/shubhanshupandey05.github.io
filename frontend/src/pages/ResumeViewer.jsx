import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AsciiTitle from '../ascii/AsciiTitle';
import { useTitle } from '../ascii/lib';
import * as content from '../data/content';

const ResumeViewer = () => {
    const [resumeUrl, setResumeUrl] = useState('');
    const [loading, setLoading] = useState(true);
    useTitle('Résumé');

    useEffect(() => {
        let alive = true;
        api.get('/about')
            .then(({ data }) => alive && setResumeUrl(data?.resumeUrl || ''))
            .catch((error) => console.error('Error loading resume:', error))
            .finally(() => alive && setLoading(false));
        return () => {
            alive = false;
        };
    }, []);

    return (
        <div className="ax ax-page">
            <Navbar />
            <main id="main" className="ax-page__main">
                <Link to="/" className="ax-back">
                    ← Home
                </Link>
                <AsciiTitle
                    text="RESUME"
                    fill="Shubhanshu Pandey backend developer Surat India Node.js Python PostgreSQL MongoDB Redis BullMQ AWS Docker Nginx"
                    label="Résumé"
                />
                <div className="ax-resume__head">
                    <h1 className="ax-resume__name">Shubhanshu.pdf</h1>
                    {resumeUrl && (
                        <a className="ax-btn ax-btn--small" href={resumeUrl} target="_blank" rel="noreferrer">
                            Open in a new tab <span aria-hidden="true">↗</span>
                        </a>
                    )}
                </div>
                <div className="ax-resume__frame">
                    {loading ? (
                        <p className="ax-status">
                            loading résumé<span className="ax-dots" aria-hidden="true" />
                        </p>
                    ) : resumeUrl ? (
                        <iframe title="Résumé (PDF)" src={resumeUrl} />
                    ) : (
                        <div className="ax-resume__empty">
                            <p className="ax-status">The résumé can’t be shown right now.</p>
                            <p className="ax-page__lead">
                                You can reach me at{' '}
                                <a href={`mailto:${content.profile.email}`}>{content.profile.email}</a>.
                            </p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ResumeViewer;
