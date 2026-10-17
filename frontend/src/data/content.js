// Curated copy for the editorial redesign.
// Live data from the API (about, projects, skills, socials) still wins where it exists;
// this file fills the gaps and supplies the rewritten long-form copy.

export const profile = {
    name: 'Shubhanshu Pandey',
    firstName: 'Shubhanshu',
    lastName: 'Pandey',
    title: 'Backend Developer',
    location: 'Surat, India',
    email: 'shubhanshu855@gmail.com',
    resumeUrl: '/resume',
    stats: {
        yearsOfExperience: 1.5,
        projectsCompleted: 5,
        technologiesUsed: 15,
        codeCommits: 284,
    },
};

export const preface = {
    headline: ['I like my systems the way', 'I like mountains —', 'steady, layered,', 'built to outlast the weather.'],
    paragraphs: [
        "Hello. I'm Shubhanshu, a backend developer from Surat, wrapping up a B.Tech in Computer Science at Uka Tarsadia University. In the last year and a half I've shipped real-time voice and chat backends, WhatsApp automation, a face-recognition attendance system on AWS, and a map-based job search engine that scrapes and re-indexes itself twice a day.",
        "My home turf is Node.js and Python, Postgres and Mongo, Redis and BullMQ, and the unglamorous work in between: retries, idempotency, caching, and the Nginx config nobody else wants to touch. Lately I've been working directly with business owners too, turning paper processes into software that quietly saves them hours.",
    ],
    quote: 'Good backends are like blossoms on old wood. Nobody sees the branch, but nothing blooms without it.',
};

export const experience = [
    {
        company: 'Independent',
        role: 'Freelance Software Developer',
        place: 'Surat, Gujarat',
        start: 'Mar 2026',
        end: 'Present',
        summary: 'Building backends for small manufacturers who were running their business on paper and spreadsheets.',
        points: [
            'Shipping Node.js systems that automate accounting and production tracking, cutting hours of manual entry every week.',
            'Running discovery sessions with non-technical owners, turning how they work today into clear specs, and keeping scope honest when it shifts.',
            'Owning the whole arc: requirements, build, deployment, and the support and iteration that come after launch.',
        ],
        tags: ['Node.js', 'PostgreSQL', 'Client discovery', 'Deployment'],
    },
    {
        company: 'Bizcompass',
        role: 'Backend Developer Intern',
        place: 'Surat, Gujarat',
        start: 'Sep 2025',
        end: 'Feb 2026',
        summary: 'Backend, cloud and integrations for a fast-moving product team.',
        points: [
            "Wired Meta's WhatsApp APIs into customer and operations messaging so routine conversations run on their own.",
            'Built and shipped a face-recognition attendance system on AWS Rekognition that runs in production.',
            'Tuned slow endpoints and queries so the platform stays calm under real production load.',
        ],
        tags: ['WhatsApp Cloud API', 'AWS Rekognition', 'Node.js', 'MongoDB'],
    },
    {
        company: 'Delta Four Labs',
        role: 'Backend Developer Intern',
        place: 'Surat, Gujarat',
        start: 'May 2025',
        end: 'Aug 2025',
        summary: 'Real-time communication backends where every millisecond is audible.',
        points: [
            'Built low-latency backends for real-time voice, chat and messaging products.',
            'Orchestrated sessions and conversation state across distributed communication channels.',
            'Handled deployments and server configuration behind Nginx.',
        ],
        tags: ['WebSockets', 'Twilio', 'Nginx', 'Session orchestration'],
    },
];

// Curated project copy, matched to API projects by GitHub URL or title.
export const projects = [
    {
        key: 'geojobs',
        match: ['geo-jobs', 'geojobs'],
        title: 'GeoJobs',
        kicker: 'Map-based job discovery',
        year: '2025',
        deck: 'Every open role in a city, on a map, searchable in milliseconds.',
        body: [
            'GeoJobs crawls applicant-tracking systems and company career pages, enriches each listing with AI-assisted extraction, and pins it to a map so you can browse jobs by neighbourhood instead of by keyword.',
            'Under the hood: a Playwright and Cheerio scraping pipeline queued through BullMQ and Redis, company and careers-page discovery, validation and de-duplication, PostGIS for geography, and Meilisearch indexing that makes new jobs searchable the moment they land. The whole thing re-runs twice a day.',
        ],
        techStack: ['Node.js', 'Python', 'Playwright', 'BullMQ', 'Redis', 'PostGIS', 'Meilisearch', 'Docker'],
        githubUrl: 'https://github.com/ShubhanshuPandey05/geo-jobs',
        liveUrl: 'https://geojobs.theshubhanshu.dev/',
        category: 'Full-Stack',
    },
    {
        key: 'voice',
        match: ['ai_assistant', 'conversational'],
        title: 'Unified Conversational AI Engine',
        kicker: 'One brain, every channel',
        year: '2025',
        deck: 'Phone calls, SMS and web chat, all talking to the same assistant and remembering the same conversation.',
        body: [
            'A modular, multimodal platform that unifies Twilio voice and SMS with real-time web calling and chat over WebSockets. Start on a call, follow up by text, finish in the browser. The context travels with you.',
            'A provider-agnostic layer swaps LLM, text-to-speech and speech-to-text vendors at runtime, so quality and cost can be tuned without touching the call flow. Self-hosted on AWS behind an Nginx reverse proxy.',
        ],
        techStack: ['Node.js', 'Python', 'WebSockets', 'Twilio', 'Multi-LLM', 'Nginx', 'AWS'],
        githubUrl: 'https://github.com/ShubhanshuPandey05/Ai_assistant',
        liveUrl: 'https://call.shipfast.studio/',
        category: 'Backend',
    },
    {
        key: 'forms',
        match: ['formsflow', 'forms'],
        title: 'FormsFlow',
        kicker: 'Forms management platform',
        year: '2024',
        deck: 'Point any website form at one endpoint and get tidy inboxes, email alerts and a dashboard for free.',
        body: [
            'FormsFlow connects plain HTML forms to a hosted backend, sends SMTP notifications on every submission, and routes responses through simple workflows.',
            'An admin dashboard lets owners track, filter and manage responses without touching a database. Built on the MERN stack.',
        ],
        techStack: ['Node.js', 'Express', 'MongoDB', 'React', 'SMTP'],
        githubUrl: 'https://github.com/ShubhanshuPandey05/FormsFlow',
        liveUrl: 'https://forms-flow.onrender.com/',
        category: 'Full-Stack',
    },
];

export const skills = [
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Python', category: 'Backend' },
    { name: 'BullMQ', category: 'Backend' },
    { name: 'RabbitMQ', category: 'Backend' },
    { name: 'Redis', category: 'Backend' },
    { name: 'GraphQL', category: 'Backend' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'AWS', category: 'DevOps' },
    { name: 'CI/CD', category: 'DevOps' },
    { name: 'Nginx', category: 'DevOps' },
    { name: 'Linux', category: 'DevOps' },
    { name: 'Git', category: 'Tools' },
    { name: 'VS Code', category: 'Tools' },
    { name: 'Postman', category: 'Tools' },
];

export const skillGroups = [
    { key: 'Backend', label: 'The Engine Room', note: 'Languages, runtimes, queues' },
    { key: 'Database', label: 'The Archive', note: 'Where the data sleeps' },
    { key: 'DevOps', label: 'The Weather', note: 'Infra, deploys, servers' },
    { key: 'Tools', label: 'The Workbench', note: 'Everyday instruments' },
    { key: 'Frontend', label: 'The Shopfront', note: 'When the UI needs me' },
    { key: 'Other', label: 'Odds & Ends', note: 'Everything else' },
];

export const education = [
    {
        school: 'Uka Tarsadia University',
        degree: 'B.Tech, Computer Science',
        years: '2022 to 2026',
        note: 'CGPA 8.15, with one perfect 10.00 semester.',
    },
    {
        school: 'J.B. & Karp Vidya Sankul',
        degree: 'Higher Secondary',
        years: '2020 to 2022',
        note: 'Where the curiosity about computers started.',
    },
];

export const socials = [
    { platform: 'GitHub', url: 'https://github.com/ShubhanshuPandey05' },
    { platform: 'LinkedIn', url: 'https://in.linkedin.com/in/shubhanshupandey05' },
    { platform: 'LeetCode', url: 'https://leetcode.com/u/ShubhanshuPandey/' },
];
