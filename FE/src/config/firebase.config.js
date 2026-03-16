import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const normalizeStorageBucket = (bucket, projectId) => {
    const sanitized = String(bucket || '').trim().replace(/^gs:\/\//, '').replace(/\/$/, '');

    if (sanitized) {
        return sanitized;
    }

    if (projectId) {
        return `${projectId}.firebasestorage.app`;
    }

    return '';
};

const toBucketAlias = (bucket) => {
    if (!bucket) return '';
    if (bucket.endsWith('.appspot.com')) {
        return bucket.replace('.appspot.com', '.firebasestorage.app');
    }
    if (bucket.endsWith('.firebasestorage.app')) {
        return bucket.replace('.firebasestorage.app', '.appspot.com');
    }
    return '';
};

const resolvedStorageBucket = normalizeStorageBucket(firebaseConfig.storageBucket, firebaseConfig.projectId);
const alternateStorageBucket = toBucketAlias(resolvedStorageBucket);

const hasFirebaseConfig = () =>
    !!firebaseConfig.apiKey
    && !!firebaseConfig.authDomain
    && !!firebaseConfig.projectId
    && !!resolvedStorageBucket;

const isFirebaseEnabled = hasFirebaseConfig();

let firebaseApp = null;
let storage = null;

if (isFirebaseEnabled) {
    firebaseApp = getApps().length ? getApp() : initializeApp({ ...firebaseConfig, storageBucket: resolvedStorageBucket });
    storage = getStorage(firebaseApp, `gs://${resolvedStorageBucket}`);
} else {
    console.warn('[Firebase] Storage is disabled due to missing config. Check VITE_FIREBASE_* env vars.');
}

export { firebaseApp, storage, isFirebaseEnabled };
export { resolvedStorageBucket, alternateStorageBucket };
