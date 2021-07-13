var admin = require("firebase-admin");

var serviceAccount = require('./interndemo-25232-firebase-adminsdk-8l1bz-49f79646ca.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://interndemo-25232.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };