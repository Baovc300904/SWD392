const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FIELDS = ['syllabus', 'syllabusFile', 'file'];
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);

const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: (req, file, cb) => {
        const fileExt = path.extname(String(file.originalname || '')).toLowerCase();
        const isKnownMime = ALLOWED_MIME_TYPES.has(file.mimetype);
        const isFallbackOctetStream = file.mimetype === 'application/octet-stream' && ALLOWED_EXTENSIONS.has(fileExt);

        if (!isKnownMime && !isFallbackOctetStream) {
            return cb(new Error('Only PDF, DOC, DOCX files are allowed for syllabus upload.'));
        }
        return cb(null, true);
    }
});

const topicSyllabusUpload = (req, res, next) => {
    uploader.any()(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid syllabus upload',
                detail: err.message
            });
        }

        const files = Array.isArray(req.files) ? req.files : [];
        req.syllabusFile = files.find((file) => SUPPORTED_FIELDS.includes(file.fieldname)) || null;
        return next();
    });
};

module.exports = {
    topicSyllabusUpload
};
