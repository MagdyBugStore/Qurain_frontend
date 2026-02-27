import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

// Firebase configuration - uses environment variables if available, otherwise falls back to hardcoded values
// Make sure to create a .env file in the root directory with all required variables for production
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB4VI1xhgjN2EfTJiyCWK8iU6jqUeZX80M",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "quran-online-8287b.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "quran-online-8287b",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "quran-online-8287b.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "626322107606",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:626322107606:web:9dcf4541ba4be7bb9fed77",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-GM79EWEPMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Apple Auth Provider
export const appleProvider = new OAuthProvider('apple.com');

export default app;
