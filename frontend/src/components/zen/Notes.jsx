import { Link } from 'react-router-dom';

const Notes = ({ blogs }) => {
    if (!blogs.length) return null;
    return (
        <section className="zn-section zn-notes" id="notes">
            <div className="zn-chapter" aria-hidden="true">
                <span>五</span> from the notebook
            </div>
            <ul className="zn-notes__list">
                {blogs.slice(0, 4).map((b) => (
                    <li key={b._id || b.slug}>
                        <Link to={`/blog/${b.slug}`} data-cursor="read">
                            <span className="zn-notes__date">
                                {new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="zn-notes__title">{b.title}</span>
                            <span className="zn-notes__dots" aria-hidden="true" />
                            <span aria-hidden="true">read ❯</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link to="/blog" className="zn-notes__all">
                all notes ❯
            </Link>
        </section>
    );
};

export default Notes;
