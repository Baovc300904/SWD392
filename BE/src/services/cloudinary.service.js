const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const getCloudinaryFolder = () => String(process.env.CLOUDINARY_FOLDER || 'topics/syllabus').trim();

const getCloudinaryConfig = () => ({
    cloudName: String(process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim(),
    apiKey: String(process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY || '').trim(),
    apiSecret: String(process.env.CLOUDINARY_API_SECRET || process.env.VITE_CLOUDINARY_API_SECRET || '').trim()
});

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

    // Use relative path instead of hardcoded localhost for better portability
    const publicUrl = `/uploads/syllabus/${encodeURIComponent(fileName)}`;

    return {
        url: publicUrl,
        secure_url: publicUrl,
        resource_type: 'raw',
        bytes: fs.statSync(fullPath).size,
        original_filename: baseName,
        public_id: `local_syllabus/${baseName}`
    };
};

const hasCloudinaryConfig = () => {
    const cfg = getCloudinaryConfig();
    return Boolean(cfg.cloudName) && Boolean(cfg.apiKey) && Boolean(cfg.apiSecret);
};

const isCloudinaryStrictMode = () => {
    const explicit = process.env.CLOUDINARY_STRICT;
    if (typeof explicit === 'string') {
        return explicit.toLowerCase() === 'true';
    }

    // In production, require Cloudinary by default unless explicitly turned off.
    return String(process.env.NODE_ENV || '').toLowerCase() === 'production';
};

const ensureConfigured = () => {
    const cfg = getCloudinaryConfig();
    if (!hasCloudinaryConfig()) {
        throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
    }

    cloudinary.config({
        cloud_name: cfg.cloudName,
        api_key: cfg.apiKey,
        api_secret: cfg.apiSecret
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
        const folder = getCloudinaryFolder();
        const originalName = String(options.original_filename || '').trim();
        const originalExt = path.extname(originalName).toLowerCase();
        const rawBaseName = originalExt ? path.basename(originalName, originalExt) : originalName;
        const safeBaseName = sanitizeFileName(rawBaseName || 'syllabus');
        const fallbackExt = originalExt || guessExtByMimeType(options.mimetype) || guessExtByBuffer(fileBuffer) || '.bin';

        const uploadOptions = {
            resource_type: 'raw',
            folder,
            use_filename: true,
            unique_filename: true,
            ...options
        };

        if (!uploadOptions.public_id) {
            uploadOptions.public_id = `${safeBaseName}_${Date.now()}${fallbackExt}`;
        }

        console.log('[cloudinary.service] Starting Cloudinary upload with options:', uploadOptions);
        
        return await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        console.error('[cloudinary.service] Upload stream error:', error);
                        return reject(error);
                    }
                    console.log('[cloudinary.service] Upload successful, URL:', result?.url);
                    return resolve(result);
                }
            );

            uploadStream.on('error', (err) => {
                console.error('[cloudinary.service] Stream error:', err);
                reject(err);
            });

            Readable.from(fileBuffer).pipe(uploadStream);
        });
    } catch (error) {
        if (isCloudinaryStrictMode()) {
            console.error('[cloudinary.service] STRICT MODE: Throwing error:', error.message);
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
