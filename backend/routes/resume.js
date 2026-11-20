import express from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadBuffer } from './uploads.js';
import About from '../models/About.js';
import { syncResume, syncResumeFromUrl } from '../services/resumeSync.js';

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf'),
});

// POST /api/resume — admin only. Uploads a new résumé PDF, makes it the site's résumé,
// and syncs the summary, experience, projects and skills from it.
// The upload is kept even if the sync fails; the response says what happened.
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Upload a PDF résumé.' });

        const stored = await uploadBuffer(req.file.buffer, {
            folder: 'portfolio/about',
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
        });

        const about = (await About.findOne()) || (await About.create({}));
        about.resumeUrl = stored.secure_url;
        await about.save();

        const sync = await syncResume({ buffer: req.file.buffer, resumeUrl: stored.secure_url });
        res.json({ about: sync.about, synced: sync.ok, error: sync.error || '', result: sync.result || null });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed.', error: error.message });
    }
});

// POST /api/resume/sync — admin only. Re-reads the current résumé and syncs again.
router.post('/sync', authMiddleware, async (req, res) => {
    try {
        const about = await About.findOne();
        if (!about?.resumeUrl) return res.status(400).json({ message: 'There is no résumé to sync from yet.' });
        const sync = await syncResumeFromUrl(about.resumeUrl);
        res.json({ about: sync.about, synced: sync.ok, error: sync.error || '', result: sync.result || null });
    } catch (error) {
        res.status(500).json({ message: 'Sync failed.', error: error.message });
    }
});

export default router;
