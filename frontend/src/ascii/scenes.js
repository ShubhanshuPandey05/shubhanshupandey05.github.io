// What the stage writes for each part of the page. Every scene after the
// portrait is a big word made of characters, filled with that section's own text.

import { host, slug } from './lib';

// Break a project title into one or two short lines for the stage.
export const titleLines = (title) => {
    const words = String(title || 'Project')
        .toUpperCase()
        .replace(/[^A-Z0-9 ]+/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
    if (!words.length) return ['WORK'];
    if (words.length === 1) {
        const w = words[0];
        if (w.length <= 7) return [w];
        const cut = Math.ceil(w.length / 2);
        return [w.slice(0, cut), w.slice(cut)];
    }
    const lines = [];
    words.forEach((w) => {
        const last = lines[lines.length - 1];
        if (last && `${last} ${w}`.length <= 9) lines[lines.length - 1] = `${last} ${w}`;
        else lines.push(w);
    });
    return lines.slice(0, 2);
};

const label = (n) => String(n).padStart(2, '0');

// "SINCE 2025" from the earliest start date in the experience list.
const since = (experience) => {
    const years = experience.map((j) => Number(String(j.start).match(/\d{4}/)?.[0])).filter(Boolean);
    return years.length ? `SINCE ${Math.min(...years)}` : null;
};

export const sectionNumbers = (hasNotes) => ({
    about: label(1),
    work: label(2),
    experience: label(3),
    stack: label(4),
    notes: hasNotes ? label(5) : null,
    contact: label(hasNotes ? 6 : 5),
});

export const buildScenes = ({ profile, preface, projects, experience, skills, blogs, socials }) => {
    const n = sectionNumbers(blogs.length > 0);
    const scenes = [
        { id: 'hero', type: 'portrait', file: 'portrait.txt' },
        {
            id: 'about',
            file: 'about.md',
            lines: ['ABOUT'],
            fill: [preface.statement.replace(/\*/g, ''), ...preface.paragraphs].join(' '),
            top: `${n.about} / about`,
            bottom: `${profile.location} · ${profile.title}`.toLowerCase(),
        },
        {
            id: 'work',
            file: 'work/README.md',
            lines: ['WORK'],
            fill: projects.map((p) => `${p.title}: ${p.deck}`).join(' '),
            top: `${n.work} / selected work`,
            bottom: `${projects.length} projects · live + source`,
        },
        ...projects.map((p, i) => ({
            id: `project-${i}`,
            sub: true,
            file: `work/${slug(p.title)}.txt`,
            lines: p.stage || titleLines(p.title),
            fill: `${p.deck || ''} ${(p.techStack || []).join(' ')}`,
            top: `${n.work}.${i + 1} / ${(p.kicker || 'project').toLowerCase()}`,
            bottom: p.liveUrl && host(p.liveUrl) ? `live → ${host(p.liveUrl)}` : 'source → github',
        })),
        {
            id: 'experience',
            file: 'experience.log',
            lines: ['EXPERIENCE', since(experience)].filter(Boolean),
            fill: experience.map((j) => `${j.role} at ${j.company}, ${j.start} to ${j.end}. ${j.summary}`).join(' '),
            top: `${n.experience} / experience`,
            bottom: `${experience.length} roles · ${experience[experience.length - 1]?.start || ''} → now`.toLowerCase(),
        },
        {
            id: 'stack',
            file: 'stack.yml',
            lines: ['STACK'],
            fill: skills.map((s) => s.name).join(' '),
            top: `${n.stack} / stack`,
            bottom: `${skills.length} tools in rotation`,
        },
    ];
    if (blogs.length) {
        scenes.push({
            id: 'notes',
            file: 'notes/',
            lines: ['NOTES'],
            fill: blogs.map((b) => b.title).join(' · '),
            top: `${n.notes} / notes`,
            bottom: `${blogs.length} posts`,
        });
    }
    scenes.push({
        id: 'contact',
        file: 'contact.vcf',
        lines: ["LET'S", 'TALK'],
        fill: `${profile.email} ${socials.map((s) => s.platform).join(' ')} resume say hello`,
        top: `${n.contact} / contact`,
        bottom: profile.email,
    });
    return scenes;
};
