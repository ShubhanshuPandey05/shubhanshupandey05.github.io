import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, default: 'Your Name' },
        title: { type: String, required: true, default: 'Backend Developer' },
        subtitle: { type: String, default: 'Building scalable server-side solutions' },
        bio: { type: String, default: '' },
        profileImage: { type: String, default: '' },
        resumeUrl: { type: String, default: '' },
        email: { type: String, default: '' },
        location: { type: String, default: '' },
        stats: {
            yearsOfExperience: { type: Number, default: 0 },
            projectsCompleted: { type: Number, default: 0 },
            technologiesUsed: { type: Number, default: 0 },
            codeCommits: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

export default mongoose.model('About', aboutSchema);
