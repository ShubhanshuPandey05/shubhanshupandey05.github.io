import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';

const BlogCard = ({ post, index, isInView }) => {
    const date = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <motion.a
            href={`/#/blog/${post.slug}`}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
            className="group block"
        >
            {/* Cover image */}
            {post.coverImage && (
                <div className="overflow-hidden bg-bg-tertiary aspect-[16/9] mb-5">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 mb-3">
                <span className="font-mono text-xs text-text-muted">{date}</span>
                {post.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-caption text-accent">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Title */}
            <h3 className="font-serif text-xl md:text-2xl font-bold text-text-primary group-hover:text-accent transition-colors duration-300 mb-3 leading-tight">
                {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2">
                {post.excerpt || post.content?.substring(0, 150) + '...'}
            </p>

            <span className="inline-flex items-center gap-2 text-caption text-text-muted group-hover:text-accent transition-colors">
                Read Article <FiArrowUpRight size={12} />
            </span>
        </motion.a>
    );
};

const Blog = ({ blogs = [] }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    if (!blogs || blogs.length === 0) return null;

    const displayPosts = blogs.slice(0, 4);

    return (
        <section id="blog" className="py-24 md:py-40 px-6 md:px-12 relative overflow-hidden border-t border-border">
            {/* Section number watermark */}
            <div className="section-number left-0 md:left-12 top-12">04</div>

            <div className="max-w-7xl mx-auto relative" ref={ref}>
                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <span className="text-caption text-accent">Journal</span>
                    <div className="editorial-divider-accent mt-4" />
                </motion.div>

                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="flex items-end justify-between mb-20"
                >
                    <h2 className="text-headline">
                        Thoughts <br className="hidden md:block" />
                        <span className="italic text-text-muted">& Learnings</span>
                    </h2>
                    <a
                        href="/#/blog"
                        className="hidden md:inline-flex items-center gap-2 text-caption text-text-muted hover:text-accent transition-colors group"
                    >
                        All Articles
                        <FiArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                </motion.div>

                {/* Blog grid */}
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                    {displayPosts.map((post, i) => (
                        <BlogCard
                            key={post._id || i}
                            post={post}
                            index={i}
                            isInView={isInView}
                        />
                    ))}
                </div>

                {/* Mobile link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.8 }}
                    className="mt-12 md:hidden"
                >
                    <a
                        href="/#/blog"
                        className="inline-flex items-center gap-2 text-caption text-text-muted hover:text-accent transition-colors"
                    >
                        View All Articles <FiArrowUpRight size={12} />
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Blog;
