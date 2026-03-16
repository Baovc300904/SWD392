import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import {
    alternateStorageBucket,
    firebaseApp,
    isFirebaseEnabled,
    resolvedStorageBucket,
    storage,
} from '../config/firebase.config';

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
        const uploadWithStorage = async (targetStorage) => {
            const fileRef = ref(targetStorage, filePath);
            await uploadBytes(fileRef, file, {
                contentType: file.type || 'application/octet-stream',
            });
            const url = await getDownloadURL(fileRef);
            return { url, filePath, name: file.name };
        };

        try {
            return await uploadWithStorage(storage);
        } catch (error) {
            if (firebaseApp && alternateStorageBucket && alternateStorageBucket !== resolvedStorageBucket) {
                try {
                    const fallbackStorage = getStorage(firebaseApp, `gs://${alternateStorageBucket}`);
                    return await uploadWithStorage(fallbackStorage);
                } catch (fallbackError) {
                    const details = fallbackError?.message || fallbackError?.code || 'Unknown Firebase error';
                    throw new Error(`Firebase upload failed: ${details}`);
                }
            }

            const details = error?.message || error?.code || 'Unknown Firebase error';
            throw new Error(`Firebase upload failed: ${details}`);
        }
    },
};

export default firebaseStorageService;
