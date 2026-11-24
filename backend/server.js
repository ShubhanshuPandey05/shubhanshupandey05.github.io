import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import aboutRoutes from './routes/about.js';
import projectRoutes from './routes/projects.js';
import skillRoutes from './routes/skills.js';
import socialLinkRoutes from './routes/socialLinks.js';
import blogRoutes from './routes/blogs.js';
import uploadRoutes from './routes/uploads.js';
import settingsRoutes from './routes/settings.js';
import experienceRoutes from './routes/experience.js';
import resumeRoutes from './routes/resume.js';
import { applyBundledResume } from './services/bundledResume.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/social-links', socialLinkRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/resume', resumeRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        // Bring the site in line with the bundled résumé the first time this version runs.
        applyBundledResume()
            .then(({ applied }) => applied && console.log('📄 Applied the bundled résumé'))
            .catch((err) => console.error('⚠️ Could not apply the bundled résumé:', err.message));
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
