'use client';

import { create } from 'zustand';
import type {
  LoadedContract,
  NetworkConfig,
  Collection,
  SavedCall,
  HistoryEntry,
  CallResult,
} from '@/types';
import { NETWORKS, DEFAULT_NETWORK } from './soroban/networks';
import storage, { KEYS } from './storage';

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface WalletState {
  address: string | null;
  walletId: string | null;
}

interface AppState {
  // Network
  network: NetworkConfig;
  customRpcUrl: string;
  customPassphrase: string;
  setNetwork: (name: string) => void;
  setCustomRpcUrl: (url: string) => void;
  setCustomPassphrase: (p: string) => void;

  // Contract
  contract: LoadedContract | null;
  loadingContract: boolean;
  contractError: string | null;
  setContract: (c: LoadedContract | null) => void;
  setLoadingContract: (v: boolean) => void;
  setContractError: (e: string | null) => void;

  // Active function
  activeFunctionName: string | null;
  setActiveFunctionName: (name: string | null) => void;

  // Wallet
  wallet: WalletState;
  setWallet: (w: WalletState) => void;
  clearWallet: () => void;

  // Collections
  collections: Collection[];
  loadCollections: () => void;
  addCollection: (name: string) => Collection;
  removeCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addCallToCollection: (collectionId: string, call: Omit<SavedCall, 'id' | 'createdAt'>) => void;
  removeCallFromCollection: (collectionId: string, callId: string) => void;

  // History
  history: HistoryEntry[];
  loadHistory: () => void;
  pushHistory: (entry: Omit<HistoryEntry, 'id'>) => void;
  clearHistory: () => void;

  // Active call result (shown in the Response Panel)
  callResult: CallResult | null;
  callStatus: 'idle' | 'loading' | 'success' | 'error';
  setCallResult: (result: CallResult | null, status: 'idle' | 'loading' | 'success' | 'error') => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Network
  network: DEFAULT_NETWORK,
  customRpcUrl: '',
  customPassphrase: '',
  setNetwork: (name) => {
    if (name === 'custom') {
      const { customRpcUrl, customPassphrase } = get();
      set({ network: { name: 'custom', label: 'Custom', rpcUrl: customRpcUrl, networkPassphrase: customPassphrase } });
    } else {
      set({ network: NETWORKS[name] ?? DEFAULT_NETWORK });
    }
  },
  setCustomRpcUrl: (url) => {
    set((s) => ({
      customRpcUrl: url,
      network: s.network.name === 'custom' ? { ...s.network, rpcUrl: url } : s.network,
    }));
  },
  setCustomPassphrase: (p) => {
    set((s) => ({
      customPassphrase: p,
      network: s.network.name === 'custom' ? { ...s.network, networkPassphrase: p } : s.network,
    }));
  },

  // Contract
  contract: null,
  loadingContract: false,
  contractError: null,
  setContract: (c) => set({ contract: c, contractError: null, activeFunctionName: c?.functions[0]?.name ?? null }),
  setLoadingContract: (v) => set({ loadingContract: v }),
  setContractError: (e) => set({ contractError: e, loadingContract: false }),

  // Active function
  activeFunctionName: null,
  setActiveFunctionName: (name) => set({ activeFunctionName: name }),

  // Wallet
  wallet: { address: null, walletId: null },
  setWallet: (w) => set({ wallet: w }),
  clearWallet: () => set({ wallet: { address: null, walletId: null } }),

  // Collections
  collections: [],
  loadCollections: () => {
    const all = storage.list<Collection>(KEYS.collections());
    all.sort((a, b) => b.createdAt - a.createdAt);
    set({ collections: all });
  },
  addCollection: (name) => {
    const col: Collection = { id: generateId(), name, calls: [], createdAt: Date.now() };
    storage.set(KEYS.collection(col.id), col);
    set((s) => ({ collections: [col, ...s.collections] }));
    return col;
  },
  removeCollection: (id) => {
    storage.remove(KEYS.collection(id));
    set((s) => ({ collections: s.collections.filter((c) => c.id !== id) }));
  },
  renameCollection: (id, name) => {
    set((s) => {
      const cols = s.collections.map((c) => c.id === id ? { ...c, name } : c);
      const updated = cols.find((c) => c.id === id);
      if (updated) storage.set(KEYS.collection(id), updated);
      return { collections: cols };
    });
  },
  addCallToCollection: (collectionId, call) => {
    const saved: SavedCall = { id: generateId(), createdAt: Date.now(), ...call };
    set((s) => {
      const cols = s.collections.map((c) => {
        if (c.id !== collectionId) return c;
        const updated = { ...c, calls: [...c.calls, saved] };
        storage.set(KEYS.collection(c.id), updated);
        return updated;
      });
      return { collections: cols };
    });
  },
  removeCallFromCollection: (collectionId, callId) => {
    set((s) => {
      const cols = s.collections.map((c) => {
        if (c.id !== collectionId) return c;
        const updated = { ...c, calls: c.calls.filter((x) => x.id !== callId) };
        storage.set(KEYS.collection(c.id), updated);
        return updated;
      });
      return { collections: cols };
    });
  },

  // History
  history: [],
  loadHistory: () => {
    const all = storage.list<HistoryEntry>(KEYS.historyAll());
    all.sort((a, b) => b.timestamp - a.timestamp);
    set({ history: all.slice(0, 100) });
  },
  pushHistory: (entry) => {
    const item: HistoryEntry = { id: generateId(), ...entry };
    storage.set(KEYS.history(item.id), item);
    set((s) => ({ history: [item, ...s.history].slice(0, 100) }));
  },
  clearHistory: () => {
    const { history } = get();
    history.forEach((h) => storage.remove(KEYS.history(h.id)));
    set({ history: [] });
  },

  callResult: null,
  callStatus: 'idle',
  setCallResult: (result, status) => set({ callResult: result, callStatus: status }),
}));
