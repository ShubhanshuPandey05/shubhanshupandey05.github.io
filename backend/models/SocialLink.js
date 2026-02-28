import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
    {
        platform: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: '' },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model('SocialLink', socialLinkSchema);
