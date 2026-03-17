const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
};

const isCloudinaryEnabled = () =>
    !!cloudinaryConfig.cloudName && !!cloudinaryConfig.apiKey && !!cloudinaryConfig.apiSecret;

if (!isCloudinaryEnabled()) {
    console.warn('[Cloudinary] Not configured properly. Check VITE_CLOUDINARY_* env vars.');
}

export { cloudinaryConfig, isCloudinaryEnabled };
