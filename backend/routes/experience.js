import express from 'express';
import Experience from '../models/Experience.js';

const router = express.Router();

// GET /api/experience — public. Written by the résumé sync, newest role first.
router.get('/', async (req, res) => {
    try {
        const experience = await Experience.find().sort({ order: 1 });
        res.json(experience);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

export default router;
