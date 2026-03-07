import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiX, FiSave } from 'react-icons/fi';
import api from '../../utils/api';

const ManageBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        coverImage: '',
        tags: '',
        published: false,
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await api.get('/blogs/all');
            setBlogs(res.data);
        } catch (err) {
            console.error('Error fetching blogs:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setForm((prev) => ({
            ...prev,
            title,
            slug: editing ? prev.slug : generateSlug(title),
        }));
    };

    const openNewForm = () => {
        setEditing('new');
        setForm({
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            coverImage: '',
            tags: '',
            published: false,
        });
    };

    const openEditForm = (blog) => {
        setEditing(blog._id);
        setForm({
            title: blog.title,
            slug: blog.slug,
            content: blog.content,
            excerpt: blog.excerpt || '',
            coverImage: blog.coverImage || '',
            tags: blog.tags?.join(', ') || '',
            published: blog.published,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            ...form,
            tags: form.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        };

        try {
            if (editing === 'new') {
                await api.post('/blogs', payload);
            } else {
                await api.put(`/blogs/${editing}`, payload);
            }
            setEditing(null);
            fetchBlogs();
        } catch (err) {
            console.error('Error saving blog:', err);
            alert('Error saving blog post');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this blog post?')) return;
        try {
            await api.delete(`/blogs/${id}`);
            fetchBlogs();
        } catch (err) {
            console.error('Error deleting blog:', err);
        }
    };

    const togglePublish = async (blog) => {
        try {
            await api.put(`/blogs/${blog._id}`, {
                ...blog,
                published: !blog.published,
            });
            fetchBlogs();
        } catch (err) {
            console.error('Error toggling publish:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Blog Posts</h2>
                    <p className="text-sm text-text-muted mt-1">
                        {blogs.length} post{blogs.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={openNewForm}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-ink rounded-lg text-sm font-medium hover:bg-accent-light transition-colors"
                >
                    <FiPlus size={16} />
                    New Post
                </button>
            </div>

            {/* Blog list */}
            <div className="space-y-3">
                {blogs.map((blog) => (
                    <motion.div
                        key={blog._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-bg-card border border-border rounded-lg p-5 flex items-center justify-between"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-text-primary font-medium">{blog.title}</h3>
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${blog.published
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-yellow-500/10 text-yellow-400'
                                        }`}
                                >
                                    {blog.published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <p className="text-xs text-text-muted font-mono">
                                /{blog.slug} — {new Date(blog.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => togglePublish(blog)}
                                className="p-2 text-text-muted hover:text-text-primary transition-colors"
                                title={blog.published ? 'Unpublish' : 'Publish'}
                            >
                                {blog.published ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                            <button
                                onClick={() => openEditForm(blog)}
                                className="p-2 text-text-muted hover:text-accent transition-colors"
                            >
                                <FiEdit2 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(blog._id)}
                                className="p-2 text-text-muted hover:text-red-400 transition-colors"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {blogs.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-text-muted mb-4">No blog posts yet</p>
                    <button
                        onClick={openNewForm}
                        className="text-accent hover:text-accent-light transition-colors text-sm"
                    >
                        Create your first post →
                    </button>
                </div>
            )}

            {/* Edit/Create Modal */}
            {editing && (
                <div className="fixed inset-0 z-50 bg-bg-primary/90 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto">
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-3xl bg-bg-card border border-border rounded-xl p-8 my-8 relative"
                    >
                        <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                        >
                            <FiX size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-text-primary mb-6">
                            {editing === 'new' ? 'New Blog Post' : 'Edit Post'}
                        </h3>

                        <div className="space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={handleTitleChange}
                                    required
                                    className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                                    placeholder="Your blog post title"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                    required
                                    className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-mono focus:outline-none focus:border-accent transition-colors"
                                    placeholder="url-slug"
                                />
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
                                    Excerpt
                                </label>
                                <textarea
                                    value={form.excerpt}
                                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                                    rows={2}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                                    placeholder="Short summary of the post"
                                />
                            </div>

                            {/* Content (Markdown) */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
                                    Content (Markdown)
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                    required
                                    rows={15}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-3 text-text-primary text-sm font-mono focus:outline-none focus:border-accent transition-colors resize-y"
                                    placeholder="Write your blog post in markdown..."
                                />
                            </div>

                            {/* Cover Image */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
                                    Cover Image URL
                                </label>
                                <input
                                    type="text"
                                    value={form.coverImage}
                                    onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={form.tags}
                                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                                    placeholder="javascript, react, learning"
                                />
                            </div>

                            {/* Published toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="published"
                                    checked={form.published}
                                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                                    className="accent-accent"
                                />
                                <label htmlFor="published" className="text-sm text-text-secondary">
                                    Publish immediately
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-accent text-ink rounded-lg text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-50"
                            >
                                <FiSave size={16} />
                                {saving ? 'Saving...' : editing === 'new' ? 'Create Post' : 'Update Post'}
                            </button>
                        </div>
                    </motion.form>
                </div>
            )}
        </div>
    );
};

export default ManageBlogs;
