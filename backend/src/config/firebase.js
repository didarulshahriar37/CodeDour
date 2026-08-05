const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require("./codeDour_service_key.json");

initializeApp({
    credential: cert(serviceAccount)
});

const auth = getAuth();

module.exports = {auth};