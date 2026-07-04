// --- Firebase Configuration (isolado para melhor tree-shaking) ---
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

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
// Persistência offline via cache IndexedDB com sincronização multi-aba:
// evita o fallback para cache em memória quando o app está aberto em mais
// de uma aba/janela (ex.: PWA instalado + aba do navegador).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
export const appId = 'ratio-5bfb8';
