import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

// Reads a résumé PDF with Claude and returns the four sections the site shows:
// summary, experience, projects and skills. The PDF goes to the API as a document
// block, so layout, columns and tables survive without a separate text extractor.

export const PROJECT_CATEGORIES = ['API', 'Full-Stack', 'Backend', 'DevOps', 'CLI', 'Other'];
export const SKILL_CATEGORIES = ['Backend', 'Database', 'DevOps', 'Tools', 'Frontend', 'Other'];

export const ResumeSchema = z.object({
    summary: z
        .string()
        .describe(
            'The professional summary, written in the first person as one or two short paragraphs separated by a blank line. Empty string if the résumé has no summary or objective.'
        ),
    experience: z
        .array(
            z.object({
                company: z.string().describe('Employer name. "Independent" for freelance work with no company.'),
                role: z.string(),
                place: z.string().describe('City and state or country, or "Remote". Empty string if not given.'),
                start: z.string().describe('Start month and year as "Mon YYYY", for example "Sep 2025".'),
                end: z.string().describe('End month and year as "Mon YYYY", or "Present".'),
                summary: z.string().describe('One sentence on what the role was about.'),
                points: z.array(z.string()).describe('The bullet points for this role, as written.'),
                tags: z.array(z.string()).describe('Up to five technologies or skills named in this role.'),
            })
        )
        .describe('Work experience and internships, most recent first.'),
    projects: z
        .array(
            z.object({
                title: z.string(),
                description: z.string().describe('One sentence on what the project does.'),
                details: z.string().describe('The rest of what the résumé says about it, as one paragraph.'),
                techStack: z.array(z.string()),
                githubUrl: z.string().describe('Full https URL of the repository, or empty string.'),
                liveUrl: z.string().describe('Full https URL of the live site or demo, or empty string.'),
                category: z.enum(PROJECT_CATEGORIES),
            })
        )
        .describe('Personal, academic or open-source projects, in résumé order.'),
    skills: z
        .array(
            z.object({
                name: z.string().describe('One technology, language, tool or platform, with its usual spelling.'),
                category: z.enum(SKILL_CATEGORIES),
            })
        )
        .describe('Every technical skill listed, one entry per skill.'),
});

const SYSTEM = `You read a software engineer's résumé and extract it into the fields of a portfolio website.

Copy what the résumé says. Do not invent roles, dates, projects, links, numbers or skills, and do not embellish. Keep the author's wording for bullet points; tidy only spacing and stray characters left by the PDF. If a field is not in the résumé, use an empty string or an empty list.

Skills: split grouped lines such as "Databases: PostgreSQL, MongoDB" into one entry per skill. Categories: languages, runtimes, frameworks, queues and APIs are Backend; databases, caches and search engines are Database; cloud, containers, CI/CD, servers and operating systems are DevOps; editors, version control and testing or API clients are Tools; UI frameworks and styling are Frontend; anything else is Other.

Experience: education is not experience. Leave out degrees and schools.`;

let client;
const getClient = () => {
    if (!client) client = new Anthropic();
    return client;
};

export class ResumeParseError extends Error {}

export const parseResume = async (pdfBuffer) => {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new ResumeParseError('ANTHROPIC_API_KEY is not set on the server, so the résumé could not be read.');
    }

    let response;
    try {
        response = await getClient().beta.messages.parse({
            model: 'claude-opus-5-5',
            max_tokens: 16000,
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
            output_config: { effort: 'low', format: betaZodOutputFormat(ResumeSchema) },
            system: SYSTEM,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'document',
                            source: { type: 'base64', media_type: 'application/pdf', data: pdfBuffer.toString('base64') },
                        },
                        { type: 'text', text: 'Extract this résumé into the portfolio fields.' },
                    ],
                },
            ],
        });
    } catch (error) {
        if (error instanceof Anthropic.AuthenticationError) {
            throw new ResumeParseError('The Anthropic API key on the server was rejected.');
        }
        if (error instanceof Anthropic.RateLimitError) {
            throw new ResumeParseError('The Anthropic API is rate limiting this key. Try the sync again in a minute.');
        }
        if (error instanceof Anthropic.APIError) {
            throw new ResumeParseError(`The Anthropic API returned an error: ${error.message}`);
        }
        throw error;
    }

    if (response.stop_reason === 'refusal') {
        throw new ResumeParseError('The model declined to read this résumé.');
    }
    if (response.stop_reason === 'max_tokens') {
        throw new ResumeParseError('The résumé was too long to read in one pass.');
    }
    if (!response.parsed_output) {
        throw new ResumeParseError('The résumé could not be read into the expected sections.');
    }
    return response.parsed_output;
};
