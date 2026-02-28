import express from 'express';
import Skill from '../models/Skill.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/skills — public
router.get('/', async (req, res) => {
    try {
        const skills = await Skill.find().sort({ category: 1, order: 1 });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// POST /api/skills — admin only
router.post('/', authMiddleware, async (req, res) => {
    try {
        const skill = await Skill.create(req.body);
        res.status(201).json(skill);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// PUT /api/skills/:id — admin only
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!skill) return res.status(404).json({ message: 'Skill not found.' });
        res.json(skill);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// DELETE /api/skills/:id — admin only
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) return res.status(404).json({ message: 'Skill not found.' });
        res.json({ message: 'Skill deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

export default router;
