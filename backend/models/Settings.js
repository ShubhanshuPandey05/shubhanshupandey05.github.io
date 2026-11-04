import mongoose from 'mongoose';

// Site-wide choices made in the CMS: which design the public site uses,
// and which photo the ASCII design draws as the portrait.
export const DESIGNS = ['ascii', 'classic'];
export const PORTRAITS = ['sunset', 'blazer'];

const settingsSchema = new mongoose.Schema(
    {
        design: { type: String, enum: DESIGNS, default: 'ascii' },
        portrait: { type: String, enum: PORTRAITS, default: 'sunset' },
    },
    { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
