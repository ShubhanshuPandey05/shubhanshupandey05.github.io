import express from 'express';
import About from '../models/About.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { syncResumeFromUrl } from '../services/resumeSync.js';

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

// PUT /api/about — admin only.
// A new résumé link also syncs the summary, experience, projects and skills from it.
router.put('/', authMiddleware, async (req, res) => {
    try {
        // The sync status is written by the server only.
        const { resumeSync, ...body } = req.body || {};
        let about = await About.findOne();
        const previousResume = about?.resumeUrl || '';
        if (!about) {
            about = await About.create(body);
        } else {
            Object.assign(about, body);
            await about.save();
        }
        if (about.resumeUrl && about.resumeUrl !== previousResume) {
            const sync = await syncResumeFromUrl(about.resumeUrl);
            about = sync.about;
        }
        res.json(about);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

export default router;
