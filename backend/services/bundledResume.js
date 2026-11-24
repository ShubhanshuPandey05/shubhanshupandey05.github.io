import About from '../models/About.js';
import { resume, resumeUrl, version } from '../data/resume.js';
import { applyResume } from './resumeSync.js';

// Applies the résumé bundled in data/resume.js once per version, on start-up.
// About.bundledResume remembers the version applied, so a résumé uploaded in the CMS
// later is never overwritten by this one.
export const applyBundledResume = async () => {
    const about = (await About.findOne()) || (await About.create({}));
    if (about.bundledResume === version) return { applied: false };

    const result = await applyResume(resume);
    const now = new Date();
    about.bio = result.summary;
    about.resumeUrl = resumeUrl;
    about.bundledResume = version;
    about.resumeSync = {
        status: 'synced',
        resumeUrl,
        attemptedAt: now,
        syncedAt: now,
        error: '',
        counts: {
            projects: result.projects.count,
            skills: result.skills.count,
            experience: result.experience.count,
        },
    };
    await about.save();
    return { applied: true, result };
};
