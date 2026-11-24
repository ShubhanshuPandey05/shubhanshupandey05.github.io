// Curated copy for the portfolio.
// Live data from the API (about, projects, skills, socials) still wins where it exists;
// this file fills the gaps and supplies the rewritten long-form copy.

export const profile = {
    name: 'Shubhanshu Pandey',
    firstName: 'Shubhanshu',
    lastName: 'Pandey',
    title: 'Backend Engineer',
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
    statement:
        'I build the backends nobody sees: *APIs,* *queues,* *scrapers* and *real-time* *pipes,* so the product on top can feel effortless.',
    paragraphs: [
        'I’m a backend engineer who ships production systems end to end, from multi-tenant SaaS to real-time voice AI agents. Right now I’m building an AI voice receptionist for UK dental practices at Digital Back Office, and running the production, QC and purchasing platform for a PET recycling plant as a freelancer.',
        'I work in Python (FastAPI) and Node.js, PostgreSQL and MongoDB, WebSockets and LLM tool-calling, on AWS and GCP. I own the architecture, the deployment and the iteration after launch, and I like working directly with the people who use what I build. I’m looking for backend and forward-deployed engineering roles.',
    ],
};

export const experience = [
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
];

// Curated project copy, matched to API projects by GitHub URL or title.
export const projects = [
    {
        key: 'prime',
        match: ['prime analyst', 'primeanalyst', 'prime-analyst'],
        title: 'Prime Analyst',
        stage: ['PRIME', 'ANALYST'],
        kicker: 'TallyPrime analytics SaaS',
        year: '2026',
        deck: 'A multi-tenant SaaS that turns TallyPrime accounting data into a mobile dashboard, without ever exposing a customer’s Tally to the internet.',
        body: [
            'A Flutter app, a FastAPI backend and a Windows connector that dials out over WebSockets. A single-flight request pipeline with deadlines, cooldown and back-pressure protects Tally’s single-threaded XML gateway, with chunked history backfill and incremental sync on Tally AlterIDs.',
            'Each company’s books are sealed with AWS KMS envelope encryption and server-enforced staff access policies, with phone verification, FCM push and subscription plans on top, all backed by 1,000+ automated tests.',
        ],
        techStack: ['Python', 'FastAPI', 'Flutter', 'PostgreSQL', 'Redis', 'WebSockets', 'AWS KMS', 'Docker'],
        githubUrl: '',
        liveUrl: '',
        category: 'Full-Stack',
    },
    {
        key: 'alpha',
        match: ['alpha production', 'alpha-production', 'alpha qc', 'ecoplast'],
        title: 'Alpha Production & QC Platform',
        stage: ['ALPHA', 'QC'],
        kicker: 'Running a recycling plant',
        year: '2026',
        deck: 'The production, QC and purchasing system for a PET recycling plant that handles 3B+ bottles a year.',
        body: [
            'A role-based Node.js and MongoDB API, a Flutter app for Android and web, and a React admin covering 10 workflows: multi-stage QC, bag-level traceability, downtime tracking and purchase approvals with PDF and Excel output.',
            'Operations run themselves: GitHub Actions deploys to self-hosted runners gated by a database backup, scheduled backups twice a day, over-the-air app updates with minimum-version enforcement, and NoSQL-injection-safe queries. 74 releases since April 2026.',
        ],
        techStack: ['Node.js', 'Express', 'MongoDB', 'Flutter', 'React', 'GitHub Actions'],
        githubUrl: '',
        liveUrl: '',
        category: 'Full-Stack',
    },
    {
        key: 'geojobs',
        match: ['geo-jobs', 'geojobs'],
        title: 'GeoJobs',
        stage: ['GEO', 'JOBS'],
        kicker: 'Map-based job discovery',
        year: '2026',
        deck: 'Every open role in a city, on a map, searchable in milliseconds.',
        body: [
            'GeoJobs crawls applicant-tracking systems and company career pages, enriches each listing with AI-assisted extraction, and pins it to a map so you can browse jobs by neighbourhood instead of by keyword.',
            'Under the hood: a Playwright and Cheerio scraping pipeline queued through BullMQ and Redis, company and careers-page discovery, validation and de-duplication, PostGIS for geography, and Meilisearch indexing that makes new jobs searchable the moment they land. The whole thing re-runs twice a day.',
        ],
        techStack: ['Node.js', 'Python', 'Playwright', 'BullMQ', 'Redis', 'PostgreSQL', 'PostGIS', 'Meilisearch', 'AWS'],
        githubUrl: 'https://github.com/ShubhanshuPandey05/geo-jobs',
        liveUrl: 'https://geojobs.theshubhanshu.dev/',
        category: 'Full-Stack',
    },
    {
        key: 'voice',
        match: ['ai_assistant', 'conversational'],
        title: 'Unified Conversational AI Engine',
        stage: ['AI', 'ENGINE'],
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
        stage: ['FORMS', 'FLOW'],
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
    { name: 'Python', category: 'Backend' },
    { name: 'TypeScript', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'FastAPI', category: 'Backend' },
    { name: 'WebSockets', category: 'Backend' },
    { name: 'WebRTC', category: 'Backend' },
    { name: 'GraphQL', category: 'Backend' },
    { name: 'BullMQ', category: 'Backend' },
    { name: 'RabbitMQ', category: 'Backend' },
    { name: 'Microservices', category: 'Backend' },
    { name: 'Multi-tenant SaaS', category: 'Backend' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'Redis', category: 'Database' },
    { name: 'AWS', category: 'DevOps' },
    { name: 'GCP', category: 'DevOps' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Nginx', category: 'DevOps' },
    { name: 'Linux', category: 'DevOps' },
    { name: 'GitHub Actions', category: 'DevOps' },
    { name: 'React.js', category: 'Frontend' },
    { name: 'Next.js', category: 'Frontend' },
    { name: 'Flutter', category: 'Frontend' },
    { name: 'Astro', category: 'Frontend' },
    { name: 'Tailwind CSS', category: 'Frontend' },
    { name: 'Gemini (Vertex AI)', category: 'Other' },
    { name: 'OpenAI', category: 'Other' },
    { name: 'LiveKit Agents', category: 'Other' },
    { name: 'Whisper', category: 'Other' },
    { name: 'Twilio', category: 'Other' },
    { name: 'Telnyx', category: 'Other' },
    { name: 'Meta APIs', category: 'Other' },
    { name: 'Microsoft Graph', category: 'Other' },
    { name: 'Firebase', category: 'Other' },
    { name: 'OAuth', category: 'Other' },
];

export const skillGroups = [
    { key: 'Backend', label: 'Backend', note: 'Languages, runtimes, queues' },
    { key: 'Database', label: 'Data', note: 'Where the data sleeps' },
    { key: 'DevOps', label: 'Infra', note: 'Deploys, servers, pipelines' },
    { key: 'Tools', label: 'Workbench', note: 'Everyday instruments' },
    { key: 'Frontend', label: 'Frontend', note: 'When the UI needs me' },
    { key: 'Other', label: 'AI & Integrations', note: 'Models, voice and the APIs in between' },
];

export const education = [
    {
        school: 'Uka Tarsadia University',
        degree: 'B.Tech, Computer Science',
        years: '2022 to 2026',
        note: 'B.Tech in Computer Science. CGPA 8.15, with a perfect 10.00 SGPA.',
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
