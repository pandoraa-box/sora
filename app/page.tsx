'use client';

import { Header } from '@/components/Header';
import { ContractLoader } from '@/components/ContractLoader';
import { ContractInspector } from '@/components/ContractInspector';
import { CollectionsSidebar } from '@/components/CollectionsSidebar';
import { HistoryPanel } from '@/components/HistoryPanel';
import { useStore } from '@/lib/store';
import { useState } from 'react';

export default function Page() {
  const contract = useStore((s) => s.contract);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="h-full flex flex-col bg-surface">
      <Header />
      <ContractLoader />

      {/* Main workspace with padding and gaps between panels */}
      <div className="flex flex-1 min-h-0 p-4 gap-4 bg-surface">
        {/* Sidebar panel */}
        <div className="flex flex-col rounded-xl border border-edge overflow-hidden shadow-sm shrink-0 bg-panel">
          <CollectionsSidebar />
        </div>

        {/* Center panel */}
        <div className="flex-1 flex flex-col min-w-0 rounded-xl border border-edge overflow-hidden shadow-sm bg-panel">
          {/* Contract metadata bar */}
          {contract && (
            <div className="px-6 py-3 border-b border-subtle flex items-center gap-6 shrink-0 bg-panel metal-strip">
              <span className="text-sm font-mono text-fg truncate">{contract.contractId}</span>
              <span className="text-fg4 shrink-0">·</span>
              <span className="text-sm font-mono text-fg3 shrink-0">{contract.network.label}</span>
              <span className="text-fg4 shrink-0">·</span>
              <span className="text-sm font-mono text-fg3 shrink-0">{contract.functions.length} fn</span>
              {Object.keys(contract.udts).length > 0 && (
                <>
                  <span className="text-fg4 shrink-0">·</span>
                  <span className="text-sm font-mono text-fg3 shrink-0">
                    {Object.keys(contract.udts).length} types
                  </span>
                </>
              )}
              <div className="flex-1" />
              <button
                onClick={() => setShowHistory((v) => !v)}
                className={`text-sm font-mono transition-colors ${
                  showHistory ? 'text-ink' : 'text-fg3 hover:text-fg'
                }`}
              >
                {showHistory ? '← hide history' : 'history →'}
              </button>
            </div>
          )}

          <ContractInspector />
        </div>

        {/* History panel */}
        {showHistory && contract && (
          <div className="flex flex-col w-80 rounded-xl border border-edge overflow-hidden shadow-sm shrink-0 bg-panel">
            <HistoryPanel />
          </div>
        )}
      </div>
    </div>
  );
}
