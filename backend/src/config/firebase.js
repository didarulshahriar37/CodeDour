const admin = require('firebase-admin');
const serviceAccount = require("./codeDour_service_key.json");

if(!admin.apps.length){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;