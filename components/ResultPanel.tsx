'use client';

import type { CallResult } from '@/types';

interface Props {
  result: CallResult | null;
  status: 'idle' | 'loading' | 'success' | 'error';
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'string') return `"${v}"`;
  try {
    return JSON.stringify(v, (_, val) =>
      typeof val === 'bigint' ? val.toString() : val, 2);
  } catch {
    return String(v);
  }
}

export function ResultPanel({ result, status }: Props) {
  if (status === 'idle') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="font-mono text-fg4 text-2xl select-none">&gt;_</div>
        <div>
          <p className="text-sm font-medium text-fg3">Response Panel</p>
          <p className="text-xs text-fg4 mt-1">Execute a function to see results here</p>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-fg3 animate-pulse" />
        <span className="text-sm font-mono text-fg3">running</span>
        <span className="w-1.5 h-1.5 rounded-full bg-fg3 animate-pulse" style={{ animationDelay: '0.35s' }} />
      </div>
    );
  }

  if (!result) return null;

  const isErr = result.status === 'error';
  const body = isErr ? (result.error ?? 'Unknown error') : formatValue(result.result);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-edge shrink-0">
        <span className={`text-sm font-mono font-bold ${isErr ? 'text-red-400' : 'text-green-400'}`}>
          {isErr ? '✕' : '✓'}
        </span>
        <span className="text-xs font-mono text-fg2">{result.type}</span>
        {result.latencyMs !== undefined && (
          <span className="text-xs font-mono text-fg3">{Math.round(result.latencyMs)}ms</span>
        )}
        {result.txHash && (
          <span className="text-xs font-mono text-fg4 truncate max-w-32" title={result.txHash}>
            {result.txHash.slice(0, 6)}…{result.txHash.slice(-4)}
          </span>
        )}
        <div className="flex-1" />
        <span className="text-xs font-mono text-fg4">
          {new Date(result.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Result body */}
      <div className="flex-1 overflow-auto p-4">
        <pre className={`text-sm font-mono leading-relaxed whitespace-pre-wrap break-all ${isErr ? 'text-red-300' : 'text-fg'}`}>
          {body}
        </pre>
      </div>
    </div>
  );
}
