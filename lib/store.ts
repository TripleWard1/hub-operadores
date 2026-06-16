// lib/store.ts
// Store em memória para o MODO DEMO, persistido no localStorage.

import { seedCommunications, seedEntities, seedUsers } from './seed';
import type { Communication, Entity, User } from '@/types';

export interface AppData {
  users: User[];
  entities: Entity[];
  communications: Communication[];
}

const STORAGE_KEY = 'visitbraga.hub.v4';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function freshData(): AppData {
  return {
    users: clone(seedUsers),
    entities: clone(seedEntities),
    communications: clone(seedCommunications),
  };
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return freshData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = freshData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    return JSON.parse(raw) as AppData;
  } catch {
    return freshData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage indisponível- ignora em modo demo
  }
}

export function resetData(): AppData {
  const data = freshData();
  saveData(data);
  return data;
}
