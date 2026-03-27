const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const sanitizeFileName = (name) => String(name || 'syllabus-file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');

const guessExtByMimeType = (mimeType) => {
    const type = String(mimeType || '').toLowerCase();
    if (type === 'application/pdf') return '.pdf';
    if (type === 'application/msword') return '.doc';
    if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx';
    return '.bin';
};

const guessExtByBuffer = (fileBuffer) => {
    if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length < 8) return '';

    // PDF magic: %PDF
    if (fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46) {
        return '.pdf';
    }

    // DOCX (ZIP) magic: PK\x03\x04
    if (fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B && fileBuffer[2] === 0x03 && fileBuffer[3] === 0x04) {
        return '.docx';
    }

    // Legacy DOC (OLE) magic: D0 CF 11 E0 A1 B1 1A E1
    const oleHeader = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];
    const isOle = oleHeader.every((value, index) => fileBuffer[index] === value);
    if (isOle) {
        return '.doc';
    }

    return '';
};

const saveBufferLocally = async (fileBuffer, options = {}) => {
    const originalName = String(options.original_filename || '').trim();
    const extFromName = originalName ? path.extname(originalName) : '';
    const ext = extFromName || guessExtByMimeType(options.mimetype) || guessExtByBuffer(fileBuffer) || '.bin';
    const baseSource = originalName || 'syllabus';
    const baseName = sanitizeFileName(path.basename(baseSource, extFromName || ext));
    const fileName = `${Date.now()}_${baseName}${ext}`;
    const uploadDir = path.join(__dirname, '../../uploads/syllabus');
    await fsp.mkdir(uploadDir, { recursive: true });

    const fullPath = path.join(uploadDir, fileName);
    await fsp.writeFile(fullPath, fileBuffer);

    const serverPort = process.env.APP_RUNTIME_PORT || process.env.PORT || '3000';
    const baseUrl = process.env.APP_BASE_URL || `http://localhost:${serverPort}`;
    const publicUrl = `${baseUrl}/uploads/syllabus/${encodeURIComponent(fileName)}`;

    return {
        url: publicUrl,
        secure_url: publicUrl,
        resource_type: 'raw',
        bytes: fs.statSync(fullPath).size,
        original_filename: baseName,
        public_id: `local_syllabus/${baseName}`
    };
};

const hasCloudinaryConfig = () => (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME)
    && Boolean(process.env.CLOUDINARY_API_KEY)
    && Boolean(process.env.CLOUDINARY_API_SECRET)
);

const isCloudinaryStrictMode = () => {
    const explicit = process.env.CLOUDINARY_STRICT;
    if (typeof explicit === 'string') {
        return explicit.toLowerCase() === 'true';
    }

    // In production, require Cloudinary by default unless explicitly turned off.
    return String(process.env.NODE_ENV || '').toLowerCase() === 'production';
};

const ensureConfigured = () => {
    if (!hasCloudinaryConfig()) {
        throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
};

const uploadBuffer = async (fileBuffer, options = {}) => {
    if (!fileBuffer) {
        throw new Error('Missing file buffer for upload');
    }

    if (!hasCloudinaryConfig()) {
        if (isCloudinaryStrictMode()) {
            throw new Error('Cloudinary is required but not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
        }
        return saveBufferLocally(fileBuffer, options);
    }

    try {
        ensureConfigured();
        return await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    folder: 'swd392/syllabus',
                    use_filename: true,
                    unique_filename: true,
                    ...options
                },
                (error, result) => {
                    if (error) return reject(error);
                    return resolve(result);
                }
            );

            Readable.from(fileBuffer).pipe(uploadStream);
        });
    } catch (error) {
        if (isCloudinaryStrictMode()) {
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }
        console.warn('[cloudinary.service] cloud upload failed, fallback to local storage:', error.message);
        return saveBufferLocally(fileBuffer, options);
    }
};

module.exports = {
    hasCloudinaryConfig,
    uploadBuffer
};
