export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  list<T>(prefix: string): T[];
  remove(key: string): void;
}

const storage: StorageAdapter = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },

  list<T>(prefix: string): T[] {
    if (typeof window === 'undefined') return [];
    const results: T[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              results.push(JSON.parse(raw) as T);
            } catch {}
          }
        }
      }
    } catch {}
    return results;
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

export default storage;

export const KEYS = {
  collection: (id: string) => `sora:collection:${id}`,
  collections: () => 'sora:collection:',
  history: (id: string) => `sora:history:${id}`,
  historyAll: () => 'sora:history:',
  settings: () => 'sora:settings',
} as const;
