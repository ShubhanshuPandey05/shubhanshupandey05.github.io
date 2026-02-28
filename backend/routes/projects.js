import express from 'express';
import Project from '../models/Project.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/projects — public
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ order: 1, createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// GET /api/projects/:id — public
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// POST /api/projects — admin only
router.post('/', authMiddleware, async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// PUT /api/projects/:id — admin only
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// DELETE /api/projects/:id — admin only
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.json({ message: 'Project deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

export default router;
