import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../Navbar';
import Footer from '../Footer';
import AsciiTitle from '../AsciiTitle';
import { useTitle } from '../lib';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    useTitle('Notes');

    useEffect(() => {
        let alive = true;
        api.get('/blogs')
            .then((res) => alive && setBlogs((Array.isArray(res.data) ? res.data : []).filter((b) => b.published !== false)))
            .catch((err) => console.error('Error loading blogs:', err))
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
                    text="NOTES"
                    fill="Write-ups on queues, scrapers, real-time systems and the occasional production fire"
                    label="Notes"
                />
                <h1 className="ax-sr">Notes</h1>
                <p className="ax-page__lead">Write-ups on queues, scrapers, real-time systems and the occasional production fire.</p>

                {loading ? (
                    <p className="ax-status">
                        loading notes<span className="ax-dots" aria-hidden="true" />
                    </p>
                ) : blogs.length === 0 ? (
                    <p className="ax-status">No notes published yet. The first ones are on the way.</p>
                ) : (
                    <ul className="ax-posts">
                        {blogs.map((post) => (
                            <li key={post._id || post.slug}>
                                <Link to={`/blog/${post.slug}`}>
                                    <span className="ax-posts__meta">
                                        {fmt(post.createdAt)}
                                        {post.tags?.slice(0, 3).map((tag) => (
                                            <span key={tag}>#{tag}</span>
                                        ))}
                                    </span>
                                    <span className="ax-posts__title">{post.title}</span>
                                    <span className="ax-posts__excerpt">
                                        {post.excerpt || `${(post.content || '').replace(/[#>*`_-]/g, '').slice(0, 180)}…`}
                                    </span>
                                    <span className="ax-posts__more" aria-hidden="true">
                                        Read →
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default BlogPage;
