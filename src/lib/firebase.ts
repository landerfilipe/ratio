// --- Firebase Configuration (isolado para melhor tree-shaking) ---
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBnlxuas5xmymrPxfhpazArQ0HbtpmGfgM',
  authDomain: 'ratio-5bfb8.firebaseapp.com',
  projectId: 'ratio-5bfb8',
  storageBucket: 'ratio-5bfb8.firebasestorage.app',
  messagingSenderId: '898252667000',
  appId: '1:898252667000:web:52285afd441aae47b0d58d',
  measurementId: 'G-2WCW0LX4T6',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'ratio-5bfb8';

// Ativar Persistência Offline (Cache Inteligente)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistência falhou: Múltiplas abas abertas.');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistência não suportada neste navegador.');
    }
  });
} catch (e) {
  console.log('Persistência já habilitada ou erro ao habilitar');
}
