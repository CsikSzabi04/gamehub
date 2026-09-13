import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Auth only (no Firestore), so the app can load it without pulling in the Firestore SDK.
export const firebaseConfig = {
    apiKey: "AIzaSyCusAB3YTweo4WGKFyxM-HY4C1oX0M0s1c",
    authDomain: "uzenet-5bd02.firebaseapp.com",
    projectId: "uzenet-5bd02",
    storageBucket: "uzenet-5bd02.firebasestorage.app",
    messagingSenderId: "1095524662450",
    appId: "1:1095524662450:web:952188ead57b52f5605dab"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
