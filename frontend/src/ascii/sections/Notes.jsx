import { Link } from 'react-router-dom';
import Label from './Label';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const Notes = ({ blogs, n }) => (
    <section className="ax-sec" id="notes" data-scene="notes">
        <div className="ax-window" aria-hidden="true" />
        <div className="ax-sec__body">
            <Label n={n}>Notes</Label>
            <p className="ax-statement">
                Write-ups, <em>mostly about things breaking.</em>
            </p>
            <ul className="ax-list">
                {blogs.slice(0, 5).map((b) => (
                    <li key={b._id || b.slug}>
                        <Link to={`/blog/${b.slug}`}>
                            <span className="ax-list__title">{b.title}</span>
                            <span className="ax-list__meta">{fmt(b.createdAt)}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link to="/blog" className="ax-btn">
                All notes <span aria-hidden="true">→</span>
            </Link>
        </div>
    </section>
);

export default Notes;
