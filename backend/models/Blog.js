import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        content: { type: String, required: true },
        excerpt: { type: String, default: '' },
        coverImage: { type: String, default: '' },
        tags: [{ type: String }],
        published: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Auto-generate slug from title if not provided
blogSchema.pre('validate', function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

export default mongoose.model('Blog', blogSchema);
