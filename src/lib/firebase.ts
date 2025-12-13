// --- Firebase Services (Lazy Loaded) ---
// Auth e Firestore são carregados apenas quando necessário
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getFirebaseApp, appId } from './firebaseApp';

// Singletons para evitar múltiplas inicializações
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _persistenceEnabled = false;

/**
 * Get Firebase Auth instance (lazy loaded)
 * ~100KB savings on initial load
 */
export const getAuthInstance = async (): Promise<Auth> => {
  if (!_auth) {
    const { getAuth } = await import('firebase/auth');
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
};

/**
 * Get Firestore instance (lazy loaded)
 * ~200KB savings on initial load
 */
export const getDbInstance = async (): Promise<Firestore> => {
  if (!_db) {
    const { getFirestore, enableIndexedDbPersistence } = await import('firebase/firestore');
    _db = getFirestore(getFirebaseApp());
    
    // Ativar Persistência Offline (apenas uma vez)
    if (!_persistenceEnabled) {
      _persistenceEnabled = true;
      try {
        await enableIndexedDbPersistence(_db);
      } catch (err: unknown) {
        const error = err as { code?: string };
        if (error.code === 'failed-precondition') {
          console.warn('Persistência falhou: Múltiplas abas abertas.');
        } else if (error.code === 'unimplemented') {
          console.warn('Persistência não suportada neste navegador.');
        }
      }
    }
  }
  return _db;
};

// Re-export appId for compatibility
export { appId };

// ============================================
// SYNC EXPORTS (for backward compatibility)
// These will be initialized on first use
// ============================================
// Note: These are deprecated - use async versions above
// Kept for backward compatibility during migration

// Immediate initialization (sync) - use only if necessary
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const app = getFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable persistence immediately for sync API
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
