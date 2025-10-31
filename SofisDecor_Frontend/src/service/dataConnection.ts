import { initializeApp, } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyC5cis5uKn3FQFQ9j3pfVLrPuDOh-l9RuA",
    authDomain: "sofiscoder.firebaseapp.com",
    projectId: "sofiscoder",
    storageBucket: "sofiscoder.firebasestorage.app",
    messagingSenderId: "147094063851",
    appId: "1:147094063851:web:01f64f7b852ef89e2d8cae",
    measurementId: "G-QX9DX0KVB3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'us-central1')

export { auth, db, functions };

/* 
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApp(); 
    getApps().length === 0 ? initializeApp(firebaseConfig, 'us-central1') : getApps()[0]
*/