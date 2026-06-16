// lib/firebase.ts
// Inicialização condicional do Firebase.
// MODO DEMO (sem env vars): não inicializa nada — a app usa o store em memória.
// MODO PRODUÇÃO: inicializa Auth + Firestore a partir das env vars.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** true quando NÃO há config Firebase — a app corre com dados em memória. */
export const IS_DEMO = !firebaseConfig.apiKey;

let app: FirebaseApp | null = null;

function ensureApp(): FirebaseApp | null {
  if (IS_DEMO) return null;
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseApp(): FirebaseApp | null {
  return ensureApp();
}

let db: Firestore | null = null;
export function getDb(): Firestore | null {
  const a = ensureApp();
  if (!a) return null;
  if (!db) db = getFirestore(a);
  return db;
}

let authClient: Auth | null = null;
export function getAuthClient(): Auth | null {
  const a = ensureApp();
  if (!a) return null;
  if (!authClient) authClient = getAuth(a);
  return authClient;
}
