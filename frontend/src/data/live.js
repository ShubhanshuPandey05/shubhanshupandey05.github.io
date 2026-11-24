// Merges live CMS data over the curated copy in content.js. Shared by both designs.
import * as content from './content';

// Pair an API project with its curated, rewritten copy (matched by repo URL or title).
// Once the résumé sync owns a project (source: 'resume'), the résumé's words win and the
// curated entry only lends its design touches (stage letters, kicker, key).
export const curate = (apiProject) => {
    const haystack = `${apiProject.githubUrl || ''} ${apiProject.title || ''}`.toLowerCase();
    const curated = content.projects.find((c) => c.match.some((m) => haystack.includes(m)));
    const fromResume = apiProject.source === 'resume';
    if (curated && !fromResume) {
        return {
            ...curated,
            githubUrl: apiProject.githubUrl || curated.githubUrl,
            liveUrl: apiProject.liveUrl || curated.liveUrl,
        };
    }
    return {
        key: curated?.key ?? null,
        stage: curated?.stage,
        title: curated?.title || apiProject.title,
        kicker: curated?.kicker || apiProject.category || 'Project',
        year: curated?.year || (apiProject.createdAt ? String(new Date(apiProject.createdAt).getFullYear()) : ''),
        deck: apiProject.description,
        body: apiProject.longDescription ? [apiProject.longDescription] : [],
        techStack: apiProject.techStack || [],
        githubUrl: apiProject.githubUrl || curated?.githubUrl,
        liveUrl: apiProject.liveUrl || curated?.liveUrl,
        category: apiProject.category,
    };
};

// Work history from the résumé sync, or the curated list until the first sync.
export const experienceFrom = (remote) =>
    Array.isArray(remote) && remote.length
        ? [...remote]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((job) => ({
                  company: job.company,
                  role: job.role,
                  place: job.place || '',
                  start: job.start || '',
                  end: job.end || '',
                  summary: job.summary || '',
                  points: job.points || [],
                  tags: job.tags || [],
              }))
        : content.experience;

// The About copy: after a résumé sync, its summary replaces the curated paragraphs.
export const prefaceFrom = (about) => {
    const bio = about?.resumeSync?.syncedAt ? (about.bio || '').trim() : '';
    if (!bio) return content.preface;
    const paragraphs = bio
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    return { ...content.preface, paragraphs };
};
