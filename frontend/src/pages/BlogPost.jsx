import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { renderMarkdown } from '../utils/markdown';
import { useTitle } from '../ascii/lib';

const BlogPost = () => {
    const { slug } = useParams();
    // The note that was loaded, and for which slug: a different slug means it is still loading.
    const [loaded, setLoaded] = useState({ slug: null, post: null });
    const loading = loaded.slug !== slug;
    const post = loading ? null : loaded.post;
    useTitle(post?.title || (loading ? 'Notes' : 'Note not found'));

    useEffect(() => {
        let alive = true;
        api.get(`/blogs/${slug}`)
            .then((res) => alive && setLoaded({ slug, post: res.data || null }))
            .catch((err) => {
                console.error('Error loading blog post:', err);
                if (alive) setLoaded({ slug, post: null });
            });
        return () => {
            alive = false;
        };
    }, [slug]);

    const date = post?.createdAt
        ? new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    return (
        <div className="ax ax-page">
            <Navbar />
            <main id="main" className="ax-page__main ax-page__main--narrow">
                <Link to="/blog" className="ax-back">
                    ← All notes
                </Link>
                {loading ? (
                    <p className="ax-status">
                        loading note<span className="ax-dots" aria-hidden="true" />
                    </p>
                ) : !post ? (
                    <div className="ax-missing">
                        <h1 className="ax-post__title">Note not found.</h1>
                        <p className="ax-page__lead">The link may be old, or the note may have been taken down.</p>
                    </div>
                ) : (
                    <article className="ax-post">
                        <header>
                            <p className="ax-post__meta">
                                {date && <time dateTime={post.createdAt}>{date}</time>}
                                {post.tags?.map((tag) => (
                                    <span key={tag}>#{tag}</span>
                                ))}
                            </p>
                            <h1 className="ax-post__title">{post.title}</h1>
                        </header>
                        {post.coverImage && <img className="ax-post__cover" src={post.coverImage} alt="" />}
                        <div className="ax-post__body">{renderMarkdown(post.content)}</div>
                    </article>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default BlogPost;
