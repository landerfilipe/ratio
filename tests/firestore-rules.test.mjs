// Testes de segurança das firestore.rules contra o emulador.
// Rodar com: npm run test:rules (requer Java instalado para o emulador)
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

const APP = 'ratio-5bfb8';
const env = await initializeTestEnvironment({
  projectId: 'demo-ratio-rules',
  firestore: {
    rules: readFileSync('firestore.rules', 'utf8'),
    host: '127.0.0.1',
    port: 8080,
  },
});

const alice = env.authenticatedContext('alice').firestore();
const mallory = env.authenticatedContext('mallory').firestore();
const anon = env.unauthenticatedContext().firestore();

const sessionRef = (db, uid, id) =>
  doc(db, 'artifacts', APP, 'users', uid, 'study_sessions', id);
const profileRef = (db, uid, id = 'main') =>
  doc(db, 'artifacts', APP, 'users', uid, 'profile', id);

const validSession = () => ({
  subject: 'Matemática',
  durationMinutes: 60,
  date: new Date().toISOString(),
  timestamp: Date.now(),
});

let passed = 0;
let failed = 0;
const check = async (name, promise) => {
  try {
    await promise;
    console.log(`  OK  ${name}`);
    passed++;
  } catch (e) {
    console.error(`FALHOU ${name}: ${e.message}`);
    failed++;
  }
};

// --- Sessões ---
await check(
  'dono cria sessão válida',
  assertSucceeds(setDoc(sessionRef(alice, 'alice', 's1'), validSession()))
);
await check(
  'dono lê a própria sessão',
  assertSucceeds(getDoc(sessionRef(alice, 'alice', 's1')))
);
await check(
  'outro usuário NÃO lê sessão alheia',
  assertFails(getDoc(sessionRef(mallory, 'alice', 's1')))
);
await check(
  'outro usuário NÃO escreve em coleção alheia',
  assertFails(setDoc(sessionRef(mallory, 'alice', 's2'), validSession()))
);
await check(
  'não autenticado NÃO lê',
  assertFails(getDoc(sessionRef(anon, 'alice', 's1')))
);
await check(
  'timestamp futuro (>5min) é rejeitado',
  assertFails(
    setDoc(sessionRef(alice, 'alice', 's3'), {
      ...validSession(),
      timestamp: Date.now() + 24 * 60 * 60 * 1000,
    })
  )
);
await check(
  'timestamp com pequeno skew (+1min) é aceito',
  assertSucceeds(
    setDoc(sessionRef(alice, 'alice', 's4'), {
      ...validSession(),
      timestamp: Date.now() + 60 * 1000,
    })
  )
);
await check(
  'date fora do formato ISO é rejeitada',
  assertFails(
    setDoc(sessionRef(alice, 'alice', 's5'), {
      ...validSession(),
      date: 'nao-e-uma-data-valida',
    })
  )
);
await check(
  'durationMinutes > 1440 é rejeitado',
  assertFails(
    setDoc(sessionRef(alice, 'alice', 's6'), {
      ...validSession(),
      durationMinutes: 2000,
    })
  )
);
await check(
  'campo extra é rejeitado',
  assertFails(
    setDoc(sessionRef(alice, 'alice', 's7'), {
      ...validSession(),
      hacked: true,
    })
  )
);
await check(
  'dono deleta a própria sessão',
  assertSucceeds(deleteDoc(sessionRef(alice, 'alice', 's1')))
);

// --- Perfil ---
const validProfile = {
  name: 'Alice',
  surname: 'Silva',
  birthdate: '2000-01-01',
  location: 'São Paulo, SP',
  bio: 'oi',
  photoUrl: 'https://lh3.googleusercontent.com/foto.jpg',
  dailyGoalMinutes: 180,
};
await check(
  'dono salva perfil válido (photoUrl https)',
  assertSucceeds(setDoc(profileRef(alice, 'alice'), validProfile))
);
await check(
  'photoUrl vazia é aceita',
  assertSucceeds(
    setDoc(profileRef(alice, 'alice'), { ...validProfile, photoUrl: '' })
  )
);
await check(
  'photoUrl http:// é rejeitada',
  assertFails(
    setDoc(profileRef(alice, 'alice'), {
      ...validProfile,
      photoUrl: 'http://evil.example/x.jpg',
    })
  )
);
await check(
  'photoUrl javascript: é rejeitada',
  assertFails(
    setDoc(profileRef(alice, 'alice'), {
      ...validProfile,
      photoUrl: 'javascript:alert(1)',
    })
  )
);
await check(
  'profileId diferente de main é rejeitado',
  assertFails(setDoc(profileRef(alice, 'alice', 'outro'), validProfile))
);
await check(
  'outro usuário NÃO lê perfil alheio',
  assertFails(getDoc(profileRef(mallory, 'alice')))
);
await check(
  'dailyGoalMinutes fora do range é rejeitado',
  assertFails(
    setDoc(profileRef(alice, 'alice'), {
      ...validProfile,
      dailyGoalMinutes: 99999,
    })
  )
);
await check(
  'caminho fora do escopo é negado (catch-all)',
  assertFails(setDoc(doc(alice, 'qualquer', 'doc'), { a: 1 }))
);

await env.cleanup();
console.log(`\nResultado: ${passed} passaram, ${failed} falharam`);
process.exit(failed > 0 ? 1 : 0);
