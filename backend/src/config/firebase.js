const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : process.env.FIREBASE_SERVICE_ACCOUNT;
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", e);
    }
}

if (!serviceAccount) {
    try {
        serviceAccount = require("./codeDour_service_key.json");
    } catch (e) {
        console.log("No codeDour_service_key.json file found locally.");
    }
}

if (getApps().length === 0 && serviceAccount) {
    try {
        initializeApp({
            credential: cert(serviceAccount)
        });
    } catch (e) {
        console.error("Firebase initializeApp error:", e);
    }
}

let auth = null;
try {
    if (getApps().length > 0) {
        auth = getAuth();
    } else {
        console.warn("Firebase App not initialized. Please set FIREBASE_SERVICE_ACCOUNT in Vercel settings.");
    }
} catch (e) {
    console.error("Firebase getAuth error:", e);
}

module.exports = { auth };