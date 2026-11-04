import { Link } from 'react-router-dom';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const Notes = ({ blogs, index }) => (
    <section className="sp-section sp-notes" id="notes">
        <div className="sp-notes__head">
            <p className="sp-label">
                <span>{index}</span> Notes
            </p>
            <h2 className="sp-h2">
                Write-ups, <em>mostly about things breaking.</em>
            </h2>
        </div>
        {blogs.length ? (
            <ul className="sp-notes__list">
                {blogs.slice(0, 4).map((b, i) => (
                    <li key={b._id || b.slug}>
                        <Link to={`/blog/${b.slug}`} data-cursor="read">
                            <span className="sp-mono sp-dim">{String(i + 1).padStart(2, '0')}</span>
                            <span className="sp-notes__title">{b.title}</span>
                            <span className="sp-mono sp-dim">{fmt(b.createdAt)}</span>
                            <span className="sp-notes__arrow" aria-hidden="true">→</span>
                        </Link>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="sp-lead">Notes on queues, scrapers and the odd production fire are on the way.</p>
        )}
        <Link to="/blog" className="sp-btn" data-cursor="read">
            All notes →
        </Link>
    </section>
);

export default Notes;
