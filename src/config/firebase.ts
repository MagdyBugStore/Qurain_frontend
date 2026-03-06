import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - uses environment variables if available, otherwise falls back to hardcoded values
// Make sure to create a .env file in the root directory with all required variables for production
// Note: Vite uses import.meta.env instead of process.env, and variables must be prefixed with VITE_
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB4VI1xhgjN2EfTJiyCWK8iU6jqUeZX80M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quran-online-8287b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quran-online-8287b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quran-online-8287b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "626322107606",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:626322107606:web:9dcf4541ba4be7bb9fed77",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GM79EWEPMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Apple Auth Provider
export const appleProvider = new OAuthProvider('apple.com');

export default app;
