import express from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/authMiddleware.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
});

const uploadBuffer = (buffer, options) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(result);
        });

        stream.end(buffer);
    });

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const folder = req.body.folder || 'portfolio';
        const resourceType = req.body.resourceType || (req.file.mimetype === 'application/pdf' ? 'image' : 'image');

        const result = await uploadBuffer(req.file.buffer, {
            folder,
            resource_type: resourceType,
            use_filename: true,
            unique_filename: true,
        });

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
        });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed.', error: error.message });
    }
});

export default router;