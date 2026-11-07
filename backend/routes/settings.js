import express from 'express';
import Settings from '../models/Settings.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// There is only ever one settings document; it is created with defaults on first read.
const current = async () => (await Settings.findOne()) || Settings.create({});

// GET /api/settings — public (the site reads it on every load)
router.get('/', async (req, res) => {
    try {
        res.json(await current());
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// PUT /api/settings — admin only. Accepts { design?, portrait? }.
router.put('/', authMiddleware, async (req, res) => {
    try {
        const settings = await current();
        const { design, portrait } = req.body || {};
        if (design !== undefined) settings.design = design;
        if (portrait !== undefined) settings.portrait = portrait;
        await settings.save();
        res.json(settings);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid setting.', error: error.message });
        }
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

export default router;
