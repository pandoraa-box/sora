'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { connectWallet, disconnect } from '@/lib/wallet';

function WalletIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V22H4V12" />
      <path d="M22 7H2v5h20V7z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

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
        className="flex items-center gap-2 bg-ink/10 border border-ink/30 px-3 py-1.5 rounded-lg text-sm font-medium text-ink hover:bg-ink/20 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-ink shrink-0" />
        <span className="font-mono text-xs">{wallet.address.slice(0, 4)}…{wallet.address.slice(-4)}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs font-mono text-red-400 max-w-36 truncate hidden sm:block" title={error}>
          {error}
        </span>
      )}
      <button
        onClick={connect}
        disabled={loading}
        className="flex items-center gap-2 bg-ink text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <WalletIcon />
        <span className="hidden sm:inline">{loading ? 'Connecting…' : 'Connect Wallet'}</span>
        <span className="sm:hidden">{loading ? '…' : 'Connect'}</span>
      </button>
    </div>
  );
}
