// lib/firestore-seed.ts
// Semeia o Firestore a partir do mesmo seed da app (lib/seed.ts). Usado por /setup.

import { getDb } from './firebase';
import { seedCommunications, seedEntities, seedUsers } from './seed';

function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export interface SeedReport {
  entities: number;
  communications: number;
  users: number;
}

export async function seedFirestore(): Promise<SeedReport> {
  const db = getDb();
  if (!db) throw new Error('Firebase indisponível.');
  const { writeBatch, doc } = await import('firebase/firestore');

  const batch = writeBatch(db);
  seedEntities.forEach((e) => batch.set(doc(db, 'entities', e.id), clean(e)));
  seedCommunications.forEach((c) => batch.set(doc(db, 'communications', c.id), clean(c)));
  seedUsers.forEach((u) => batch.set(doc(db, 'users', u.email.toLowerCase()), clean({ ...u })));
  await batch.commit();

  return {
    entities: seedEntities.length,
    communications: seedCommunications.length,
    users: seedUsers.length,
  };
}

export async function makeAdmin(email: string, name: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firebase indisponível.');
  const { doc, setDoc } = await import('firebase/firestore');
  const mail = email.toLowerCase();
  await setDoc(
    doc(db, 'users', mail),
    { id: mail, email: mail, name: name || mail, role: 'admin' },
    { merge: true },
  );
}
