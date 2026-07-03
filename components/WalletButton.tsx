'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { connectWallet, disconnect } from '@/lib/wallet';

export function WalletButton() {
  const { wallet, setWallet, clearWallet, network } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { address } = await connectWallet(network.networkPassphrase);
      setWallet({ address, walletId: 'unknown' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Wallet connection failed';
      setError(msg.slice(0, 60));
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  }, [network.networkPassphrase, setWallet]);

  const handleDisconnect = useCallback(async () => {
    try { await disconnect(); } catch {}
    clearWallet();
  }, [clearWallet]);

  if (wallet.address) {
    return (
      <button
        onClick={handleDisconnect}
        className="flex items-center gap-3 bg-ink/10 border border-ink/30 px-4 py-2 rounded-lg text-sm font-semibold text-ink hover:bg-ink/20 transition-colors"
      >
        <span className="w-3 h-3 rounded-full bg-ink shrink-0" />
        <span>{wallet.address.slice(0, 4)}…{wallet.address.slice(-4)}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <span className="text-sm font-mono text-fg2 max-w-40 truncate" title={error}>
          {error}
        </span>
      )}
      <button
        onClick={connect}
        disabled={loading}
        className="bg-blue-600 border border-transparent px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
      >
        {loading ? 'connecting…' : 'connect wallet'}
      </button>
    </div>
  );
}
