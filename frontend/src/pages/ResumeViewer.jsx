import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CursorGlow from '../components/CursorGlow';

const ResumeViewer = () => {
    const [resumeUrl, setResumeUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const { data } = await api.get('/about');
                setResumeUrl(data.resumeUrl || '');
            } catch (error) {
                console.error('Error loading resume:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResume();
    }, []);

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            <CursorGlow />
            <Navbar />

            <main className="relative px-6 md:px-12 py-24 md:py-32">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                        <div>
                            <span className="text-caption text-accent">Resume</span>
                            <h1 className="mt-3 text-4xl md:text-6xl font-serif font-bold">Shubhanshu.pdf</h1>
                            {/* <p className="mt-4 text-text-muted max-w-2xl">
                                Review the resume directly in the browser without downloading it to your device.
                            </p> */}
                        </div>

                        <Link
                            to="/"
                            className="inline-flex items-center gap-3 text-caption text-text-muted hover:text-text-primary transition-colors"
                        >
                            <span className="w-10 h-px bg-text-muted" />
                            Back to Home
                        </Link>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden border border-dark-500/60 shadow-2xl shadow-black/20 min-h-[75vh]">
                        {loading ? (
                            <div className="min-h-[75vh] flex items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border border-accent border-t-transparent rounded-full animate-spin" />
                                    <span className="font-mono text-xs text-text-muted tracking-widest uppercase">
                                        Loading Resume
                                    </span>
                                </div>
                            </div>
                        ) : resumeUrl ? (
                            <iframe
                                title="Resume PDF viewer"
                                src={resumeUrl}
                                className="w-full min-h-[75vh] bg-dark-900"
                            />
                        ) : (
                            <div className="min-h-[75vh] flex items-center justify-center px-6 text-center">
                                <div className="max-w-md space-y-4">
                                    <h2 className="text-2xl font-serif font-semibold">Resume not available</h2>
                                    <p className="text-text-muted">
                                        Add a resume URL in the About section of the admin panel to display it here.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ResumeViewer;