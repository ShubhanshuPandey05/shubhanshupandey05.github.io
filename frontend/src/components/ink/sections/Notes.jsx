import { Link } from 'react-router-dom';

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const Notes = ({ blogs }) => (
    <section className="ik-section ik-notes" id="notes">
        <p className="ik-label">05 · Notes</p>
        {blogs.length ? (
            <ul className="ik-notes__list">
                {blogs.slice(0, 4).map((b) => (
                    <li key={b._id || b.slug}>
                        <Link to={`/blog/${b.slug}`} data-cursor="read">
                            <span className="ik-muted">{fmt(b.createdAt)}</span>
                            <span className="ik-notes__title">{b.title}</span>
                            <span aria-hidden="true">→</span>
                        </Link>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="ik-notes__empty">Write-ups on queues, scrapers and the odd production fire.</p>
        )}
        <Link to="/blog" className="ik-btn ik-btn--ghost">
            Read all notes →
        </Link>
    </section>
);

export default Notes;
