'use client';
// lib/data.tsx- camada de dados central (demo / Firebase). Toda a UI usa useData().

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { loadData, resetData, saveData, type AppData } from './store';
import { uid } from './utils';
import { IS_DEMO, getDb } from './firebase';
import { useAuth } from './auth';
import type { Communication, Entity, EntityStatus } from '@/types';

interface DataContextValue {
  data: AppData;
  ready: boolean;
  addEntity: (e: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntity: (id: string, patch: Partial<Entity>) => void;
  setEntityStatus: (id: string, status: EntityStatus) => void;
  addCommunication: (c: Omit<Communication, 'id' | 'createdAt' | 'status'>) => void;
  updateCommunication: (id: string, patch: Partial<Communication>) => void;
  reset: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);
const EMPTY: AppData = { users: [], entities: [], communications: [] };

/* ──────────────────────────── DEMO ──────────────────────────── */
function DemoDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  const addEntity = useCallback((e: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>) => {
    setData((prev) => {
      const ent: Entity = { ...e, id: uid('ent'), createdAt: Date.now(), updatedAt: Date.now() };
      const next = { ...prev, entities: [...prev.entities, ent] };
      saveData(next);
      return next;
    });
  }, []);

  const updateEntity = useCallback((id: string, patch: Partial<Entity>) => {
    setData((prev) => {
      const next = { ...prev, entities: prev.entities.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e)) };
      saveData(next);
      return next;
    });
  }, []);

  const setEntityStatus = useCallback((id: string, status: EntityStatus) => {
    setData((prev) => {
      const next = { ...prev, entities: prev.entities.map((e) => (e.id === id ? { ...e, status } : e)) };
      saveData(next);
      return next;
    });
  }, []);

  const addCommunication = useCallback((c: Omit<Communication, 'id' | 'createdAt' | 'status'>) => {
    setData((prev) => {
      const com: Communication = { ...c, id: uid('com'), status: 'recebida', createdAt: Date.now() };
      const next = { ...prev, communications: [com, ...prev.communications] };
      saveData(next);
      return next;
    });
  }, []);

  const updateCommunication = useCallback((id: string, patch: Partial<Communication>) => {
    setData((prev) => {
      const next = {
        ...prev,
        communications: prev.communications.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      };
      saveData(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => setData(resetData()), []);

  const value = useMemo<DataContextValue>(
    () => ({ data, ready, addEntity, updateEntity, setEntityStatus, addCommunication, updateCommunication, reset }),
    [data, ready, addEntity, updateEntity, setEntityStatus, addCommunication, updateCommunication, reset],
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/* ────────────────────────── FIREBASE ────────────────────────── */
function byCreatedDesc<T extends { createdAt?: number }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

function FirebaseDataProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [data, setData] = useState<AppData>(EMPTY);
  const [ready, setReady] = useState(false);

  const role = user?.role;
  const entityId = user?.entityId;

  useEffect(() => {
    if (loading) return;
    const db = getDb();
    if (!db) {
      setReady(true);
      return;
    }
    const seen = new Set<string>();
    const markReady = (name: string) => {
      seen.add(name);
      if (seen.has('entities') && seen.has('communications')) setReady(true);
    };

    const subCol = (name: keyof AppData & string, map: (rows: any[]) => unknown) =>
      onSnapshot(
        collection(db, name),
        (snap) => {
          setData((prev) => ({ ...prev, [name]: map(snap.docs.map((d) => d.data())) }) as AppData);
          markReady(name);
        },
        (err) => {
          console.warn(`onSnapshot(${name}):`, err.code ?? err.message);
          markReady(name);
        },
      );

    // Comunicações: a entidade só lê as suas; o admin lê todas.
    const commsRef =
      role === 'entidade' && entityId
        ? query(collection(db, 'communications'), where('entityId', '==', entityId))
        : collection(db, 'communications');

    const unsubs = [
      subCol('entities', (r) => r as Entity[]),
      subCol('users', (r) => r as AppData['users']),
      onSnapshot(
        commsRef,
        (snap) => {
          setData((prev) => ({ ...prev, communications: byCreatedDesc(snap.docs.map((d) => d.data() as Communication)) }));
          markReady('communications');
        },
        (err) => {
          console.warn('onSnapshot(communications):', err.code ?? err.message);
          markReady('communications');
        },
      ),
    ];

    const t = setTimeout(() => setReady(true), 4000);
    return () => {
      clearTimeout(t);
      unsubs.forEach((u) => u());
    };
  }, [loading, role, entityId]);

  const db = (): Firestore | null => getDb();
  const fail = (e: unknown) => console.error('Firestore write falhou:', e);

  const addEntity = useCallback((e: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const d = db();
    if (!d) return;
    const id = uid('ent');
    const ent: Entity = { ...e, id, createdAt: Date.now(), updatedAt: Date.now() };
    setDoc(doc(d, 'entities', id), ent).catch(fail);
  }, []);

  const updateEntity = useCallback((id: string, patch: Partial<Entity>) => {
    const d = db();
    if (d) updateDoc(doc(d, 'entities', id), { ...patch, updatedAt: Date.now() } as Record<string, unknown>).catch(fail);
  }, []);

  const setEntityStatus = useCallback((id: string, status: EntityStatus) => {
    const d = db();
    if (d) updateDoc(doc(d, 'entities', id), { status }).catch(fail);
  }, []);

  const addCommunication = useCallback((c: Omit<Communication, 'id' | 'createdAt' | 'status'>) => {
    const d = db();
    if (!d) return;
    const id = uid('com');
    const com: Communication = { ...c, id, status: 'recebida', createdAt: Date.now() };
    setDoc(doc(d, 'communications', id), com).catch(fail);
  }, []);

  const updateCommunication = useCallback((id: string, patch: Partial<Communication>) => {
    const d = db();
    if (d) updateDoc(doc(d, 'communications', id), patch as Record<string, unknown>).catch(fail);
  }, []);

  const reset = useCallback(() => {
    console.warn('reset() não disponível em modo Firebase. Usa /setup.');
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({ data, ready, addEntity, updateEntity, setEntityStatus, addCommunication, updateCommunication, reset }),
    [data, ready, addEntity, updateEntity, setEntityStatus, addCommunication, updateCommunication, reset],
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function DataProvider({ children }: { children: ReactNode }) {
  return IS_DEMO ? <DemoDataProvider>{children}</DemoDataProvider> : <FirebaseDataProvider>{children}</FirebaseDataProvider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData tem de ser usado dentro de <DataProvider>');
  return ctx;
}
