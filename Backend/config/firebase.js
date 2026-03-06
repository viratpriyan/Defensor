const admin = require('firebase-admin');

// Ensure we only initialize once
if (!admin.apps.length) {
    try {
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully.');
    } catch (e) {
        console.error('--- WARNING: serviceAccountKey.json not found or invalid ---', e.message);

        // Fallback to env variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
            });
            console.log('Firebase Admin initialized from env variables.');
        }
    }
}

const db = admin.firestore();
module.exports = { admin, db };
