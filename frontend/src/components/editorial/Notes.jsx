import { Link } from 'react-router-dom';
import Reveal from './Reveal';

const Notes = ({ blogs }) => {
    if (!blogs.length) return null;
    return (
        <section className="ed-section ed-notes" id="notes">
            <div className="ed-wrap">
                <div className="ed-notes__head">
                    <Reveal as="h2" className="ed-h2">
                        From the <em>notebook.</em>
                    </Reveal>
                    <Link to="/blog" className="ed-btn" data-cursor="read all">
                        All notes ↗
                    </Link>
                </div>
                <ul className="ed-notes__list">
                    {blogs.slice(0, 4).map((b) => (
                        <li key={b._id || b.slug}>
                            <Link to={`/blog/${b.slug}`} data-cursor="read">
                                <span className="ed-label">
                                    {new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <h3>{b.title}</h3>
                                {b.excerpt && <p>{b.excerpt}</p>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default Notes;
