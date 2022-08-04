const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyB0Fth8cK78Ighu0-e8R9WChWy4TFa5vvI",
    authDomain: "buet-hackathon-4f3f9.firebaseapp.com",
    projectId: "buet-hackathon-4f3f9",
    storageBucket: "buet-hackathon-4f3f9.appspot.com",
    messagingSenderId: "617435512787",
    appId: "1:617435512787:web:57352475e622cc50c2b926"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const User = db.collection("users");
module.exports = User;
