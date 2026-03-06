// Firebase configuration for Women Safety App
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAf7lothvnwY6as_-sYl3aLKQ6zpBnZydg",
    authDomain: "defensor-3f6a8.firebaseapp.com",
    projectId: "defensor-3f6a8",
    storageBucket: "defensor-3f6a8.firebasestorage.app",
    messagingSenderId: "892741375974",
    appId: "1:892741375974:web:c7b2111a6c4b675983a827"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
