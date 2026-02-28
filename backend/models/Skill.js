import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ['Backend', 'Database', 'DevOps', 'Tools', 'Frontend', 'Other'],
            default: 'Backend',
        },
        proficiency: { type: Number, min: 0, max: 100, default: 50 },
        icon: { type: String, default: '' },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('Skill', skillSchema);
