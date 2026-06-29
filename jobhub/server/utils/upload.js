import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// Setup Cloudinary config if available
const cloudinaryConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
if (cloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
else {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  Cloudinary environment variables are not fully configured.');
    console.warn('\x1b[33m%s\x1b[0m', '👉 Uploads will fall back to secure Data URLs (Base64) for instant operational preview.');
}
// Multer memory storage configuration (keeps file in memory buffer rather than saving on local disk)
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Basic file validation
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/gif',
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPG, PNG, GIF, PDF, and DOC/DOCX are allowed.'));
        }
    },
});
/**
 * Uploads a file buffer to Cloudinary, or returns a base64 data URI if not configured.
 */
export const uploadToCloudinary = async (fileBuffer, mimetype, folderName = 'jobhub') => {
    if (cloudinaryConfigured) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: folderName,
                resource_type: 'auto',
            }, (error, result) => {
                if (error) {
                    console.error('Cloudinary upload failed:', error);
                    reject(new Error('Cloudinary upload failed'));
                }
                else {
                    resolve(result?.secure_url || '');
                }
            });
            uploadStream.end(fileBuffer);
        });
    }
    else {
        // Base64 fallback for offline sandbox operation
        const base64Data = fileBuffer.toString('base64');
        return `data:${mimetype};base64,${base64Data}`;
    }
};
