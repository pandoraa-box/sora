'use client';

import { useState, FormEvent } from 'react';
import { useStore } from '@/lib/store';
import { loadContract } from '@/lib/soroban/client';

export function ContractLoader() {
  const { network, setContract, setLoadingContract, setContractError, loadingContract, contractError } = useStore();
  const [contractId, setContractId] = useState('');

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const id = contractId.trim();
    if (!id) return;
    setLoadingContract(true);
    setContractError(null);
    try {
      const loaded = await loadContract(id, network);
      setContract(loaded);
    } catch (err) {
      setContractError(err instanceof Error ? err.message : 'Failed to load contract');
    }
  }

  return (
    <div className="px-4 md:px-5 py-3 border-b border-edge bg-surface shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3">

        {/* Input */}
        <div className="flex-1 flex items-center gap-2 bg-panel border border-edge rounded-lg px-3 h-10 focus-within:border-fg3 transition-colors min-w-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fg4 shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder="Enter contract address (C...)"
            spellCheck={false}
            className="flex-1 bg-transparent text-sm font-mono text-fg placeholder:text-fg4 focus:outline-none min-w-0"
          />
          <button
            type="button"
            title="Recent"
            className="p-1 text-fg4 hover:text-fg2 transition-colors shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        </div>

        {/* Fetch ABI */}
        <button
          type="submit"
          disabled={loadingContract || !contractId.trim()}
          className="flex items-center gap-1.5 h-10 px-3 md:px-4 bg-ink text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 whitespace-nowrap"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="hidden sm:inline">{loadingContract ? 'Fetching…' : 'Fetch ABI'}</span>
          <span className="sm:hidden">{loadingContract ? '…' : 'Fetch'}</span>
        </button>

        {/* Paste ABI */}
        <button
          type="button"
          disabled
          title="Coming soon"
          className="hidden md:flex items-center gap-1.5 h-10 px-4 border border-edge rounded-lg text-sm font-medium text-fg2 hover:border-fg3 hover:text-fg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 whitespace-nowrap"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          Paste ABI
        </button>

        {/* Upload ABI */}
        <button
          type="button"
          disabled
          title="Coming soon"
          className="hidden md:flex items-center gap-1.5 h-10 px-4 border border-edge rounded-lg text-sm font-medium text-fg2 hover:border-fg3 hover:text-fg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 whitespace-nowrap"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload ABI
        </button>
      </form>

      {contractError && (
        <div className="mt-2 px-4 py-2 bg-panel rounded-lg border border-edge flex items-center gap-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fg3 shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span className="text-sm font-mono text-fg2 truncate">{contractError}</span>
        </div>
      )}
    </div>
  );
}
