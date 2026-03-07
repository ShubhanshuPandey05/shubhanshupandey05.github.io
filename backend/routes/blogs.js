import express from 'express';
import Blog from '../models/Blog.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/blogs — list published posts (public)
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/blogs/all — list all posts including drafts (admin, auth required)
router.get('/all', auth, async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/blogs/:slug — get single post by slug (public)
router.get('/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) return res.status(404).json({ error: 'Blog post not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/blogs — create post (auth required)
router.post('/', auth, async (req, res) => {
    try {
        const blog = new Blog(req.body);
        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/blogs/:id — update post (auth required)
router.put('/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!blog) return res.status(404).json({ error: 'Blog post not found' });
        res.json(blog);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/blogs/:id — delete post (auth required)
router.delete('/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog post not found' });
        res.json({ message: 'Blog post deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
