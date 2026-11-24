// The résumé of November 2026, read by hand into the same shape the résumé sync
// produces (services/resumeParser.js). services/bundledResume.js applies it once on
// start-up, so the site matches the résumé without an Anthropic API key. Later résumés
// uploaded in the CMS go through the automatic sync instead.

export const version = '2026-11-24';

// Served by the frontend from frontend/public.
export const resumeUrl = '/Shubhanshu_Pandey_Resume.pdf';

export const resume = {
    summary: [
        'I’m a backend engineer who ships production systems end to end, from multi-tenant SaaS to real-time voice AI agents. Right now I’m building an AI voice receptionist for UK dental practices at Digital Back Office, and running the production, QC and purchasing platform for a PET recycling plant as a freelancer.',
        'I work in Python (FastAPI) and Node.js, PostgreSQL and MongoDB, WebSockets and LLM tool-calling, on AWS and GCP. I own the architecture, the deployment and the iteration after launch, and I like working directly with the people who use what I build. I’m looking for backend and forward-deployed engineering roles.',
    ].join('\n\n'),
    experience: [
        {
            company: 'Digital Back Office',
            role: 'Software Engineer Intern',
            place: 'Remote (UK)',
            start: 'Jul 2026',
            end: 'Present',
            summary: 'Voice AI, healthcare integrations and AI search for UK clients, from prototype to production.',
            points: [
                'Built Adele Care, an AI voice receptionist for UK dental practices, from prototype to production pilot in 5 weeks with LiveKit Agents, Gemini (Vertex AI), Cartesia and Telnyx SIP; 10 LLM tools verify callers and book, move or cancel appointments.',
                'Integrated the Dentally practice-management API (OAuth2, token-bucket limiting under its 10 req/s cap, confirm-before-retry write queue, sync worker) behind 80 FastAPI routes and a React admin; 300+ pytest tests, deployed on GCP.',
                'Built the media transcription pipeline (Azure Whisper, faster-whisper), role-based access control and SharePoint sync (MSAL, Microsoft Graph) for an AI document-search (RAG) demo built for VisitScotland’s public-sector tender.',
                'Shipped doctor-portal, in-app notification and appointment-reminder features on MedCare360, a live medical-tourism platform (Next.js, FastAPI, PostgreSQL on AWS), authoring 15 of its 24 API test files.',
                'Built a self-hosted website analytics platform (JS tracker, FastAPI collector, Streamlit dashboard) with heatmaps, session replay and rage-click detection, auto-capturing page screenshots with headless Playwright.',
            ],
            tags: ['FastAPI', 'LiveKit Agents', 'Gemini (Vertex AI)', 'Telnyx SIP', 'GCP'],
        },
        {
            company: 'Freelance',
            role: 'Software Engineer',
            place: 'Surat, Gujarat',
            start: 'Mar 2026',
            end: 'Present',
            summary: 'The production, QC and purchasing platform for a PET recycling plant, built and run solo.',
            points: [
                'Building and running the production, QC and purchasing platform for Alpha Ecoplast Pvt. Ltd. (PET recycling plant, 3B+ bottles/year) as a solo developer, from discovery with non-technical plant stakeholders to 74 app releases since April 2026.',
            ],
            tags: ['Node.js', 'MongoDB', 'Flutter', 'React', 'GitHub Actions'],
        },
        {
            company: 'Bizcompass',
            role: 'Backend Engineer Intern',
            place: 'Surat, Gujarat',
            start: 'Sep 2025',
            end: 'Feb 2026',
            summary: 'Backend, cloud and messaging integrations for a product team.',
            points: [
                'Integrated Meta WhatsApp APIs into communication workflows to automate customer engagement and operational messaging.',
                'Built a face recognition attendance system using AWS Rekognition for production use.',
                'Improved API performance and database efficiency to increase system reliability under production workloads.',
            ],
            tags: ['Meta WhatsApp API', 'AWS Rekognition', 'Node.js'],
        },
        {
            company: 'Delta Four Labs',
            role: 'Backend Engineer Intern',
            place: 'Surat, Gujarat',
            start: 'May 2025',
            end: 'Aug 2025',
            summary: 'Real-time communication backends where latency is audible.',
            points: [
                'Developed backend systems for real-time voice, chat, and messaging applications with low-latency communication requirements.',
                'Managed session orchestration and conversation state across distributed communication channels.',
                'Deployed and configured production services behind Nginx reverse proxies.',
            ],
            tags: ['WebSockets', 'Session orchestration', 'Nginx'],
        },
    ],
    projects: [
        {
            title: 'Prime Analyst',
            description: 'A multi-tenant SaaS that turns TallyPrime accounting data into a mobile dashboard.',
            details: 'A Flutter app, a FastAPI backend and a Windows connector that dials out over WebSockets, so a customer’s Tally is never exposed to the internet. A single-flight request pipeline with deadlines, cooldown and back-pressure protects Tally’s single-threaded XML gateway, with chunked history backfill and incremental sync on Tally AlterIDs. Each company’s books are secured with AWS KMS envelope encryption and server-enforced staff access policies, plus phone verification, FCM push and subscription plans, backed by 1,000+ automated tests.',
            techStack: ['Python', 'FastAPI', 'Flutter', 'PostgreSQL', 'Redis', 'WebSockets', 'AWS KMS', 'Docker'],
            githubUrl: '',
            liveUrl: '',
            category: 'Full-Stack',
        },
        {
            title: 'Alpha Production & QC Platform',
            description: 'A role-based production, QC and purchasing system for a PET recycling plant.',
            details: 'A Node.js/MongoDB API, a Flutter app for Android and web, and a React admin covering 10 workflows: multi-stage QC, bag-level traceability, downtime tracking and purchase approvals with PDF/Excel output. Operations are automated: GitHub Actions deploys to self-hosted runners gated by a database backup, twice-daily scheduled backups, OTA app updates with minimum-version enforcement, and NoSQL-injection-safe queries.',
            techStack: ['Node.js', 'Express', 'MongoDB', 'Flutter', 'React', 'GitHub Actions'],
            githubUrl: '',
            liveUrl: '',
            category: 'Full-Stack',
        },
        {
            title: 'GeoJobs',
            description: 'A map-based job discovery platform that collects and enriches job listings automatically.',
            details: 'An automated scraping pipeline using Playwright, BullMQ, Redis and AI-powered extraction collects and enriches job listings from ATS platforms and company career pages. Company discovery, career-page detection, validation and deduplication feed Meilisearch for real-time search, with PostGIS for geography.',
            techStack: ['Node.js', 'Python', 'Meilisearch', 'Playwright', 'PostgreSQL', 'PostGIS', 'BullMQ', 'Redis', 'AWS'],
            githubUrl: 'https://github.com/ShubhanshuPandey05/geo-jobs',
            liveUrl: '',
            category: 'Full-Stack',
        },
    ],
    skills: [
        ...['Node.js', 'Python', 'TypeScript', 'Express.js', 'FastAPI', 'WebSockets', 'WebRTC', 'GraphQL', 'BullMQ', 'RabbitMQ', 'Microservices', 'Multi-tenant SaaS'].map(
            (name) => ({ name, category: 'Backend' })
        ),
        ...['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'].map((name) => ({ name, category: 'Database' })),
        ...['AWS', 'GCP', 'Docker', 'Nginx', 'Linux', 'GitHub Actions'].map((name) => ({ name, category: 'DevOps' })),
        ...['React.js', 'Next.js', 'Flutter', 'Astro', 'Tailwind CSS'].map((name) => ({ name, category: 'Frontend' })),
        ...[
            'Gemini (Vertex AI)',
            'OpenAI',
            'LiveKit Agents',
            'Whisper',
            'Twilio',
            'Telnyx',
            'Meta APIs',
            'Microsoft Graph',
            'Firebase',
            'OAuth',
        ].map((name) => ({ name, category: 'Other' })),
    ],
};
