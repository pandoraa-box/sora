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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-fg4 text-base font-mono">simulate or invoke to see results</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center gap-6">
        <span className="w-1 h-1 rounded-full bg-fg3 animate-pulse" />
        <span className="text-fg3 text-base font-mono">running</span>
        <span className="w-1 h-1 rounded-full bg-fg3 animate-pulse" style={{ animationDelay: '0.35s' }} />
      </div>
    );
  }

  if (!result) return null;

  const isErr = result.status === 'error';
  const body = isErr ? (result.error ?? 'Unknown error') : formatValue(result.result);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-subtle shrink-0 metal-strip">
        <span className={`text-base font-mono font-bold ${isErr ? 'text-fg2' : 'text-ink'}`}>
          {isErr ? '✕' : '✓'}
        </span>
        <span className="text-base font-mono text-fg2">{result.type}</span>
        {result.latencyMs !== undefined && (
          <span className="text-base font-mono text-fg3">{Math.round(result.latencyMs)}ms</span>
        )}
        {result.txHash && (
          <span className="text-base font-mono text-fg3 truncate max-w-48" title={result.txHash}>
            {result.txHash.slice(0, 8)}…{result.txHash.slice(-6)}
          </span>
        )}
        <div className="flex-1" />
        <span className="text-sm font-mono text-fg4">
          {new Date(result.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Result body */}
      <div className="flex-1 overflow-auto p-4">
        <pre className={`text-base font-mono leading-relaxed whitespace-pre-wrap break-all ${isErr ? 'text-fg2' : 'text-fg'}`}>
          {body}
        </pre>
      </div>
    </div>
  );
}
