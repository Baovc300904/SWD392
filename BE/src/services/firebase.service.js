const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

class FirebaseService {
    constructor() {
        this._initialized = false;
        this._available = false;
    }

    initialize() {
        if (this._initialized) return this._available;
        this._initialized = true;

        try {
            let serviceAccount = null;

            if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
                const rawPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
                const fullPath = path.isAbsolute(rawPath)
                    ? rawPath
                    : path.join(process.cwd(), rawPath);

                if (fs.existsSync(fullPath)) {
                    const raw = fs.readFileSync(fullPath, 'utf8');
                    serviceAccount = JSON.parse(raw);
                }
            }

            if (!serviceAccount) {
                console.warn('⚠️ FCM disabled: missing FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH');
                this._available = false;
                return false;
            }

            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            }

            this._available = true;
            console.log('✅ Firebase Admin initialized for FCM');
            return true;
        } catch (error) {
            this._available = false;
            console.error('❌ Firebase Admin initialization failed:', error.message);
            return false;
        }
    }

    isAvailable() {
        return this._available || this.initialize();
    }

    async sendToToken({ token, title, body, data = {} }) {
        if (!token) {
            return { success: false, skipped: true, reason: 'empty-token' };
        }

        if (!this.isAvailable()) {
            return { success: false, skipped: true, reason: 'fcm-disabled' };
        }

        const payload = {
            token,
            notification: {
                title,
                body
            },
            data: Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, String(value)])
            )
        };

        try {
            const messageId = await admin.messaging().send(payload);
            return { success: true, messageId };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }
}

module.exports = new FirebaseService();
