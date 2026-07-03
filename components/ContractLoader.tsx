'use client';

import { useState, FormEvent } from 'react';
import { useStore } from '@/lib/store';
import { loadContract } from '@/lib/soroban/client';

export function ContractLoader() {
  const { network, setContract, setLoadingContract, setContractError, loadingContract, contractError } = useStore();
  const [contractId, setContractId] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
    <div className="px-4 py-4 bg-surface shrink-0">
      <form onSubmit={handleSubmit} className="flex items-stretch bg-panel rounded-xl border border-edge overflow-hidden shadow-sm h-12 transition-all focus-within:border-fg3">
        {/* Prefix label */}
        <div className="flex items-center px-4 text-fg3 text-sm font-mono select-none border-r border-subtle shrink-0">
          C/
        </div>

        <input
          type="text"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          placeholder="Enter contract address (C...)"
          spellCheck={false}
          className="flex-1 bg-transparent px-4 text-sm font-mono text-fg placeholder:text-fg4 focus:outline-none"
        />

        <div className="w-px bg-subtle shrink-0" />

        <button
          type="submit"
          disabled={loadingContract || !contractId.trim()}
          className="px-6 text-sm font-mono font-bold tracking-widest shrink-0 transition-colors
            bg-blue-600 text-white hover:bg-blue-700
            disabled:bg-raised disabled:text-fg3 disabled:cursor-not-allowed"
        >
          {loadingContract ? 'FETCHING' : 'FETCH ABI'}
        </button>
      </form>

      {contractError && (
        <div className="mt-2 px-4 py-2 bg-panel rounded-lg border border-subtle flex items-center gap-3">
          <span className="text-fg3 text-sm">✕</span>
          <span className="text-sm font-mono text-fg2">{contractError}</span>
        </div>
      )}
    </div>
  );
}
