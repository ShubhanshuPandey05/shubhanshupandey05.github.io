import express from 'express';
import SocialLink from '../models/SocialLink.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/social-links — public
router.get('/', async (req, res) => {
    try {
        const links = await SocialLink.find().sort({ order: 1 });
        res.json(links);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// POST /api/social-links — admin only
router.post('/', authMiddleware, async (req, res) => {
    try {
        const link = await SocialLink.create(req.body);
        res.status(201).json(link);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// PUT /api/social-links/:id — admin only
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const link = await SocialLink.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!link) return res.status(404).json({ message: 'Social link not found.' });
        res.json(link);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// DELETE /api/social-links/:id — admin only
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const link = await SocialLink.findByIdAndDelete(req.params.id);
        if (!link) return res.status(404).json({ message: 'Social link not found.' });
        res.json({ message: 'Social link deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

export default router;
