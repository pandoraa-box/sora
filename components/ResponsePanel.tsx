'use client';

import { useStore } from '@/lib/store';
import { ResultPanel } from './ResultPanel';
import { HistoryPanel } from './HistoryPanel';
import { useState } from 'react';

export function ResponsePanel() {
  const { callResult, callStatus } = useStore();
  const [tab, setTab] = useState<'response' | 'history'>('response');

  return (
    <div className="h-full flex flex-col bg-panel">
      {/* Tab bar */}
      <div className="flex items-center border-b border-edge shrink-0">
        <button
          onClick={() => setTab('response')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors border-b-2 -mb-px ${
            tab === 'response'
              ? 'border-ink text-fg'
              : 'border-transparent text-fg4 hover:text-fg3'
          }`}
        >
          Response
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors border-b-2 -mb-px ${
            tab === 'history'
              ? 'border-ink text-fg'
              : 'border-transparent text-fg4 hover:text-fg3'
          }`}
        >
          History
        </button>
      </div>

      {tab === 'response' ? (
        <ResultPanel result={callResult} status={callStatus} />
      ) : (
        <HistoryPanel />
      )}
    </div>
  );
}
