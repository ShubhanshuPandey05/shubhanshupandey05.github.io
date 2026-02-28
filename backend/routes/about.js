import express from 'express';
import About from '../models/About.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/about — public
router.get('/', async (req, res) => {
    try {
        let about = await About.findOne();
        if (!about) {
            about = await About.create({});
        }
        res.json(about);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// PUT /api/about — admin only
router.put('/', authMiddleware, async (req, res) => {
    try {
        let about = await About.findOne();
        if (!about) {
            about = await About.create(req.body);
        } else {
            Object.assign(about, req.body);
            await about.save();
        }
        res.json(about);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

export default router;
