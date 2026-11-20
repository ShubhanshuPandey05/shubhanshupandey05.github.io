import About from '../models/About.js';
import Experience from '../models/Experience.js';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import { parseResume, ResumeParseError } from './resumeParser.js';

// Keeps the site's summary, experience, projects and skills in step with the résumé.
//
// The résumé is the source of truth for what it lists:
// - Summary: replaces the profile bio.
// - Experience: replaces the whole list.
// - Projects and skills: matched to what is already there by name (and repo URL for
//   projects). A match is updated and taken over by the sync; anything new is added;
//   anything the sync added before that is no longer on the résumé is removed.
//   Projects and skills added by hand and never matched are left alone, as are the
//   fields the résumé has no say over (images, featured, proficiency, icons).
// A section that comes back empty is skipped rather than wiping the site, since that
// is far more likely to be a misread than a résumé with no skills on it.

const MAX_PDF_BYTES = 25 * 1024 * 1024;

const clean = (s) => (typeof s === 'string' ? s.trim() : '');
const cleanList = (list) => [...new Set((list || []).map(clean).filter(Boolean))];
const httpUrl = (s) => (/^https?:\/\//i.test(clean(s)) ? clean(s) : '');

// "Node.js", "NodeJS" and "node js" are the same skill; "Express.js" and "Express" too.
export const skillKey = (name) =>
    clean(name)
        .toLowerCase()
        .replace(/[^a-z0-9+#]/g, '')
        .replace(/(.)js$/, '$1');

export const titleKey = (title) => clean(title).toLowerCase().replace(/[^a-z0-9]/g, '');

export const repoKey = (url) =>
    clean(url)
        .toLowerCase()
        .replace(/^https?:\/\/(www\.)?/, '')
        .replace(/\.git$/, '')
        .replace(/\/+$/, '');

const findProject = (existing, item) => {
    const repo = repoKey(item.githubUrl);
    const title = titleKey(item.title);
    return (
        (repo && existing.find((p) => repoKey(p.githubUrl) === repo)) ||
        existing.find((p) => titleKey(p.title) === title) ||
        null
    );
};

const syncProjects = async (items) => {
    const existing = await Project.find();
    const kept = new Set();
    let order = 0;
    for (const item of items) {
        const title = clean(item.title);
        if (!title) continue;
        const fields = {
            description: clean(item.description) || clean(item.details) || title,
            longDescription: clean(item.details),
            techStack: cleanList(item.techStack),
            category: item.category,
            source: 'resume',
            order: order++,
        };
        const githubUrl = httpUrl(item.githubUrl);
        const liveUrl = httpUrl(item.liveUrl);
        const match = findProject(existing, item);
        if (match && !kept.has(String(match._id))) {
            // Keep the title as it is on the site (it may be styled differently) and keep
            // links the résumé leaves out.
            Object.assign(match, fields);
            if (githubUrl) match.githubUrl = githubUrl;
            if (liveUrl) match.liveUrl = liveUrl;
            await match.save();
            kept.add(String(match._id));
        } else {
            const created = await Project.create({ ...fields, title, githubUrl, liveUrl });
            kept.add(String(created._id));
        }
    }
    const stale = existing.filter((p) => p.source === 'resume' && !kept.has(String(p._id)));
    if (stale.length) await Project.deleteMany({ _id: { $in: stale.map((p) => p._id) } });
    return { count: kept.size, removed: stale.length };
};

const syncSkills = async (items) => {
    const existing = await Skill.find();
    const byKey = new Map(existing.map((s) => [skillKey(s.name), s]));
    const kept = new Set();
    let order = 0;
    for (const item of items) {
        const name = clean(item.name);
        const key = skillKey(name);
        if (!key || kept.has(key)) continue;
        kept.add(key);
        const match = byKey.get(key);
        if (match) {
            match.category = item.category;
            match.source = 'resume';
            match.order = order++;
            await match.save();
        } else {
            await Skill.create({ name, category: item.category, source: 'resume', order: order++ });
        }
    }
    const stale = existing.filter((s) => s.source === 'resume' && !kept.has(skillKey(s.name)));
    if (stale.length) await Skill.deleteMany({ _id: { $in: stale.map((s) => s._id) } });
    return { count: kept.size, removed: stale.length };
};

const syncExperience = async (items) => {
    const docs = items
        .filter((job) => clean(job.company) && clean(job.role))
        .map((job, order) => ({
            company: clean(job.company),
            role: clean(job.role),
            place: clean(job.place),
            start: clean(job.start),
            end: clean(job.end),
            summary: clean(job.summary),
            points: cleanList(job.points),
            tags: cleanList(job.tags).slice(0, 5),
            order,
        }));
    if (!docs.length) return { count: 0, skipped: true };
    await Experience.deleteMany({});
    await Experience.insertMany(docs);
    return { count: docs.length };
};

// Writes parsed résumé sections to the database. Exported on its own for tests.
export const applyResume = async (parsed) => {
    const summary = clean(parsed.summary);
    const projects = parsed.projects?.length ? await syncProjects(parsed.projects) : { count: 0, skipped: true };
    const skills = parsed.skills?.length ? await syncSkills(parsed.skills) : { count: 0, skipped: true };
    const experience = await syncExperience(parsed.experience || []);
    return { summary, projects, skills, experience };
};

const getAbout = async () => (await About.findOne()) || About.create({});

// Reads the résumé, applies it, and records the outcome on the profile.
// Never throws for a bad résumé or API failure: the result says what happened.
export const syncResume = async ({ buffer, resumeUrl }) => {
    const about = await getAbout();
    const attemptedAt = new Date();
    try {
        const parsed = await parseResume(buffer);
        const result = await applyResume(parsed);
        if (result.summary) about.bio = result.summary;
        about.resumeSync = {
            status: 'synced',
            resumeUrl: resumeUrl || about.resumeUrl,
            attemptedAt,
            syncedAt: attemptedAt,
            error: '',
            counts: {
                projects: result.projects.count,
                skills: result.skills.count,
                experience: result.experience.count,
            },
        };
        await about.save();
        return { ok: true, about, result };
    } catch (error) {
        const message = error instanceof ResumeParseError ? error.message : `Sync failed: ${error.message}`;
        about.resumeSync = {
            ...(about.resumeSync?.toObject?.() || {}),
            status: 'failed',
            resumeUrl: resumeUrl || about.resumeUrl,
            attemptedAt,
            error: message,
        };
        await about.save();
        return { ok: false, about, error: message };
    }
};

export const fetchResume = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new ResumeParseError(
            `Couldn’t download the résumé (HTTP ${response.status}). If it is on Cloudinary, check that PDF delivery is allowed in its security settings.`
        );
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_PDF_BYTES) throw new ResumeParseError('The résumé PDF is larger than 25 MB.');
    if (buffer.subarray(0, 5).toString() !== '%PDF-') throw new ResumeParseError('The résumé link is not a PDF.');
    return buffer;
};

export const syncResumeFromUrl = async (resumeUrl) => {
    let buffer;
    try {
        buffer = await fetchResume(resumeUrl);
    } catch (error) {
        const about = await getAbout();
        const message = error instanceof ResumeParseError ? error.message : `Couldn’t download the résumé: ${error.message}`;
        about.resumeSync = {
            ...(about.resumeSync?.toObject?.() || {}),
            status: 'failed',
            resumeUrl,
            attemptedAt: new Date(),
            error: message,
        };
        await about.save();
        return { ok: false, about, error: message };
    }
    return syncResume({ buffer, resumeUrl });
};
