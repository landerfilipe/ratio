// --- Firebase App Initialization (minimal core) ---
// Separado para permitir lazy loading de Auth/Firestore
import { initializeApp, type FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBnlxuas5xmymrPxfhpazArQ0HbtpmGfgM',
  authDomain: 'ratio-5bfb8.firebaseapp.com',
  projectId: 'ratio-5bfb8',
  storageBucket: 'ratio-5bfb8.firebasestorage.app',
  messagingSenderId: '898252667000',
  appId: '1:898252667000:web:52285afd441aae47b0d58d',
  measurementId: 'G-2WCW0LX4T6',
};

let _app: FirebaseApp | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (!_app) {
    _app = initializeApp(firebaseConfig);
  }
  return _app;
};

export const appId = 'ratio-5bfb8';
