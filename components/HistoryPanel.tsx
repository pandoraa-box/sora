'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'bigint') return v.toString();
  try {
    return JSON.stringify(v, (_, val) =>
      typeof val === 'bigint' ? val.toString() : val);
  } catch {
    return String(v);
  }
}

export function HistoryPanel() {
  const { history, loadHistory, clearHistory } = useStore();
  useEffect(() => { loadHistory(); }, [loadHistory]);

  return (
    <div className="h-full flex flex-col bg-panel">
      {/* Header */}
      <div className="px-4 py-2 border-b border-subtle flex items-center justify-between shrink-0 metal-strip">
        <span className="text-xs font-mono text-fg3 uppercase tracking-[0.15em]">History</span>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm font-mono text-fg4 hover:text-fg2 transition-colors"
          >
            clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 && (
          <p className="text-base font-mono text-fg4 px-4 py-3">No calls yet</p>
        )}

        {history.map((entry) => (
          <div
            key={entry.id}
            className="px-4 py-2 border-b border-subtle hover:bg-raised transition-colors"
          >
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-sm font-mono font-bold ${entry.status === 'error' ? 'text-fg2' : 'text-ink'}`}>
                {entry.status === 'error' ? '✕' : '✓'}
              </span>
              <span className="text-base font-mono text-fg truncate flex-1">{entry.functionName}</span>
              <span className="text-xs font-mono text-fg3 shrink-0">{entry.type}</span>
            </div>

            <div className="text-sm font-mono text-fg3 truncate mb-0.5">
              {entry.status === 'error'
                ? (entry.error ?? '').slice(0, 70)
                : formatValue(entry.result).slice(0, 70)}
            </div>

            <div className="text-xs font-mono text-fg4 flex gap-3">
              <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
              {entry.latencyMs !== undefined && <span>{Math.round(entry.latencyMs)}ms</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
