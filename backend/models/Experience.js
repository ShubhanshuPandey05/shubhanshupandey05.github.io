import mongoose from 'mongoose';

// Work history, filled in from the résumé by the résumé sync (services/resumeSync.js).
// The whole collection is owned by the sync: each sync replaces it.
const experienceSchema = new mongoose.Schema(
    {
        company: { type: String, required: true },
        role: { type: String, required: true },
        place: { type: String, default: '' },
        start: { type: String, default: '' },
        end: { type: String, default: '' },
        summary: { type: String, default: '' },
        points: [{ type: String }],
        tags: [{ type: String }],
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('Experience', experienceSchema);
