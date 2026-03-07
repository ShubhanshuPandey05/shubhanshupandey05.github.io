import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiTag } from 'react-icons/fi';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* Simple markdown-like renderer */
const renderContent = (content) => {
    if (!content) return null;

    // Split into paragraphs and handle basic markdown
    const lines = content.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';

    lines.forEach((line, i) => {
        // Code blocks
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                elements.push(
                    <pre key={`code-${i}`} className="bg-bg-tertiary border border-border p-5 my-6 overflow-x-auto rounded text-sm">
                        <code className="font-mono text-text-secondary">{codeContent}</code>
                    </pre>
                );
                codeContent = '';
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                codeLanguage = line.slice(3);
            }
            return;
        }

        if (inCodeBlock) {
            codeContent += (codeContent ? '\n' : '') + line;
            return;
        }

        // Headers
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={i} className="font-serif text-xl font-semibold text-text-primary mt-10 mb-4">
                    {line.slice(4)}
                </h3>
            );
        } else if (line.startsWith('## ')) {
            elements.push(
                <h2 key={i} className="font-serif text-2xl font-bold text-text-primary mt-12 mb-4">
                    {line.slice(3)}
                </h2>
            );
        } else if (line.startsWith('# ')) {
            elements.push(
                <h1 key={i} className="font-serif text-3xl font-bold text-text-primary mt-12 mb-6">
                    {line.slice(2)}
                </h1>
            );
        }
        // Blockquote
        else if (line.startsWith('> ')) {
            elements.push(
                <blockquote key={i} className="border-l-2 border-accent pl-6 my-6 font-serif italic text-text-muted text-lg">
                    {line.slice(2)}
                </blockquote>
            );
        }
        // Unordered list
        else if (line.startsWith('- ') || line.startsWith('* ')) {
            elements.push(
                <li key={i} className="text-text-secondary ml-6 mb-2 list-disc">
                    {formatInlineStyles(line.slice(2))}
                </li>
            );
        }
        // Horizontal rule
        else if (line.match(/^---+$/)) {
            elements.push(<hr key={i} className="border-border my-8" />);
        }
        // Empty line
        else if (line.trim() === '') {
            // skip
        }
        // Regular paragraph
        else {
            elements.push(
                <p key={i} className="text-text-secondary leading-[1.9] mb-5 font-serif text-lg">
                    {formatInlineStyles(line)}
                </p>
            );
        }
    });

    return elements;
};

/* Format bold, italic, inline code */
const formatInlineStyles = (text) => {
    // Simple approach: replace **bold**, *italic*, `code`
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        // Inline code
        const codeMatch = remaining.match(/`([^`]+)`/);
        // Bold
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
        // Italic
        const italicMatch = remaining.match(/\*([^*]+)\*/);

        const matches = [
            codeMatch && { type: 'code', match: codeMatch },
            boldMatch && { type: 'bold', match: boldMatch },
            italicMatch && { type: 'italic', match: italicMatch },
        ].filter(Boolean);

        if (matches.length === 0) {
            parts.push(remaining);
            break;
        }

        // Find earliest match
        const earliest = matches.reduce((a, b) =>
            a.match.index < b.match.index ? a : b
        );

        // Add text before match
        if (earliest.match.index > 0) {
            parts.push(remaining.substring(0, earliest.match.index));
        }

        // Add styled element
        if (earliest.type === 'code') {
            parts.push(
                <code key={key++} className="font-mono text-sm bg-bg-tertiary px-1.5 py-0.5 rounded text-accent">
                    {earliest.match[1]}
                </code>
            );
        } else if (earliest.type === 'bold') {
            parts.push(<strong key={key++} className="font-semibold text-text-primary">{earliest.match[1]}</strong>);
        } else if (earliest.type === 'italic') {
            parts.push(<em key={key++}>{earliest.match[1]}</em>);
        }

        remaining = remaining.substring(earliest.match.index + earliest.match[0].length);
    }

    return parts;
};

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/blogs/${slug}`);
                setPost(res.data);
            } catch (err) {
                console.error('Error loading blog post:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-caption text-text-muted">Loading article...</span>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-bg-primary">
                <Navbar />
                <div className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
                    <h1 className="font-serif text-3xl text-text-primary mb-4">Article not found</h1>
                    <a href="/#/blog" className="text-caption text-accent hover:text-accent-light transition-colors">
                        ← Back to Blog
                    </a>
                </div>
                <Footer />
            </div>
        );
    }

    const date = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-bg-primary">
            <Navbar />

            <article className="pt-32 pb-24">
                {/* Header */}
                <div className="px-6 md:px-12 max-w-4xl mx-auto">
                    <motion.a
                        href="/#/blog"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="inline-flex items-center gap-2 text-caption text-text-muted hover:text-text-primary transition-colors mb-12"
                    >
                        <FiArrowLeft size={14} /> Back to Blog
                    </motion.a>

                    {/* Tags */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-4 mb-6"
                    >
                        {post.tags?.map((tag) => (
                            <span key={tag} className="text-caption text-accent">
                                <FiTag size={10} className="inline mr-1" />
                                {tag}
                            </span>
                        ))}
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-8"
                    >
                        {post.title}
                    </motion.h1>

                    {/* Date */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-3 text-text-muted mb-8"
                    >
                        <FiCalendar size={14} />
                        <span className="font-mono text-sm">{date}</span>
                    </motion.div>

                    <div className="editorial-divider-accent mb-12" />
                </div>

                {/* Cover image */}
                {post.coverImage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="max-w-5xl mx-auto px-6 md:px-12 mb-16"
                    >
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full aspect-[21/9] object-cover"
                        />
                    </motion.div>
                )}

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="px-6 md:px-12 max-w-3xl mx-auto"
                >
                    {renderContent(post.content)}
                </motion.div>

                {/* Bottom divider */}
                <div className="max-w-3xl mx-auto px-6 md:px-12 mt-16">
                    <div className="editorial-line-full mb-8" />
                    <a
                        href="/#/blog"
                        className="inline-flex items-center gap-2 text-caption text-text-muted hover:text-accent transition-colors"
                    >
                        <FiArrowLeft size={14} /> All Articles
                    </a>
                </div>
            </article>

            <Footer />
        </div>
    );
};

export default BlogPost;
