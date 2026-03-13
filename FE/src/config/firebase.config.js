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
    if (!bucket && projectId) return `${projectId}.appspot.com`;
    if (!bucket) return '';
    if (bucket.endsWith('.firebasestorage.app')) {
        return bucket.replace('.firebasestorage.app', '.appspot.com');
    }
    return bucket;
};

const resolvedStorageBucket = normalizeStorageBucket(firebaseConfig.storageBucket, firebaseConfig.projectId);

const hasFirebaseConfig = () =>
    !!firebaseConfig.apiKey
    && !!firebaseConfig.authDomain
    && !!firebaseConfig.projectId
    && !!resolvedStorageBucket
    && !!firebaseConfig.messagingSenderId
    && !!firebaseConfig.appId;

const isFirebaseEnabled = hasFirebaseConfig();

let firebaseApp = null;
let storage = null;

if (isFirebaseEnabled) {
    firebaseApp = getApps().length ? getApp() : initializeApp({ ...firebaseConfig, storageBucket: resolvedStorageBucket });
    storage = getStorage(firebaseApp, `gs://${resolvedStorageBucket}`);
}

export { firebaseApp, storage, isFirebaseEnabled };
