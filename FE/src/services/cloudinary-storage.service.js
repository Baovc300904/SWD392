import { cloudinaryConfig, isCloudinaryEnabled } from '../config/cloudinary.config';

const UPLOAD_PRESET = 'swd_hub_unsigned'; // Tạo preset này trên Cloudinary Dashboard và set thành Unsigned

const cloudinaryStorageService = {
    isEnabled: () => isCloudinaryEnabled(),

    uploadFile: async (file, folder = 'uploads') => {
        if (!file) {
            throw new Error('No file provided');
        }

        if (!isCloudinaryEnabled()) {
            throw new Error('Cloudinary is not configured');
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', UPLOAD_PRESET);
            formData.append('folder', folder);
            formData.append('resource_type', 'auto');
            formData.append('cloud_name', cloudinaryConfig.cloudName);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `Upload failed with status ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.secure_url) {
                throw new Error('No URL returned from Cloudinary');
            }

            return {
                url: result.secure_url,
                publicId: result.public_id,
                name: file.name,
                size: file.size,
                type: file.type,
                format: result.format,
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }
    },
};

export default cloudinaryStorageService;
