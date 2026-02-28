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
    },
    { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
