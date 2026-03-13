import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { isFirebaseEnabled, storage } from '../config/firebase.config';

const firebaseStorageService = {
    isEnabled: () => isFirebaseEnabled,

    uploadFile: async (file, folder = 'uploads') => {
        if (!file) {
            throw new Error('No file provided');
        }

        if (!isFirebaseEnabled || !storage) {
            throw new Error('Firebase storage is not configured');
        }

        const safeName = file.name.replace(/\s+/g, '_');
        const filePath = `${folder}/${Date.now()}_${safeName}`;
        const fileRef = ref(storage, filePath);

        await uploadBytes(fileRef, file, {
            contentType: file.type || 'application/octet-stream',
        });

        const url = await getDownloadURL(fileRef);
        return { url, filePath, name: file.name };
    },
};

export default firebaseStorageService;
