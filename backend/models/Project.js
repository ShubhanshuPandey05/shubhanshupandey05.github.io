import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        longDescription: { type: String, default: '' },
        techStack: [{ type: String }],
        githubUrl: { type: String, default: '' },
        liveUrl: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        featured: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        category: {
            type: String,
            enum: ['API', 'Full-Stack', 'Backend', 'DevOps', 'CLI', 'Other'],
            default: 'Backend',
        },
        // 'resume' once the résumé sync owns this project: the next sync updates it,
        // and removes it if it is no longer on the résumé. 'manual' projects are never removed.
        source: { type: String, enum: ['manual', 'resume'], default: 'manual' },
    },
    { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
