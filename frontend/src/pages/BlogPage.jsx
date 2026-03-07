import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await api.get('/blogs');
                setBlogs(res.data);
            } catch (err) {
                console.error('Error loading blogs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-caption text-text-muted">Loading articles...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <Navbar />

            <main className="pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    {/* Back link */}
                    <motion.a
                        href="/#/"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="inline-flex items-center gap-2 text-caption text-text-muted hover:text-text-primary transition-colors mb-12"
                    >
                        <FiArrowLeft size={14} /> Back to Portfolio
                    </motion.a>

                    {/* Page header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-20"
                    >
                        <span className="text-caption text-accent block mb-4">Journal</span>
                        <h1 className="text-display">
                            Blog<span className="text-accent">.</span>
                        </h1>
                        <p className="text-body-lg text-text-muted mt-6 max-w-xl">
                            Writings about technologies, learnings, and the journey of building things.
                        </p>
                    </motion.div>

                    {/* Blog grid */}
                    {blogs.length === 0 ? (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-text-muted font-serif text-xl italic"
                        >
                            No articles published yet. Check back soon.
                        </motion.p>
                    ) : (
                        <div className="space-y-0">
                            {blogs.map((post, i) => {
                                const date = new Date(post.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                });

                                return (
                                    <motion.a
                                        key={post._id || i}
                                        href={`/#/blog/${post.slug}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08, duration: 0.5 }}
                                        className="grid md:grid-cols-12 gap-6 md:gap-10 py-10 border-b border-border group"
                                    >
                                        {/* Image */}
                                        {post.coverImage && (
                                            <div className="md:col-span-4 overflow-hidden bg-bg-tertiary aspect-[16/10]">
                                                <img
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className={`${post.coverImage ? 'md:col-span-8' : 'md:col-span-12'} flex flex-col justify-center`}>
                                            <div className="flex items-center gap-4 mb-3">
                                                <span className="font-mono text-xs text-text-muted">{date}</span>
                                                {post.tags?.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="text-caption text-accent">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-text-primary group-hover:text-accent transition-colors duration-300 mb-3 leading-tight">
                                                {post.title}
                                            </h2>

                                            <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2 max-w-2xl">
                                                {post.excerpt || post.content?.substring(0, 200) + '...'}
                                            </p>

                                            <span className="inline-flex items-center gap-2 text-caption text-text-muted group-hover:text-accent transition-colors">
                                                Read Article <FiArrowUpRight size={12} />
                                            </span>
                                        </div>
                                    </motion.a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPage;
