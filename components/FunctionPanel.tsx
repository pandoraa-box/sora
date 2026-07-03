'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { simulateCall, invokeCall } from '@/lib/soroban/client';
import { argsToNative, typeLabel } from '@/lib/soroban/args';
import { signTx } from '@/lib/wallet';
import { TypeInput } from './TypeInput';
import { ResultPanel } from './ResultPanel';
import type { ParsedFunction, CallResult } from '@/types';

interface Props { fn: ParsedFunction }
type Status = 'idle' | 'loading' | 'success' | 'error';

export function FunctionPanel({ fn }: Props) {
  const { contract, wallet, network, pushHistory, collections, addCallToCollection, addCollection } = useStore();
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<CallResult | null>(null);
  const [saved, setSaved] = useState(false);

  const setValue = useCallback((name: string, v: string) => {
    setValues((p) => ({ ...p, [name]: v }));
  }, []);

  async function run(type: 'simulate' | 'invoke') {
    if (!contract) return;
    setStatus('loading');
    setResult(null);
    const t0 = performance.now();
    const nativeArgs = argsToNative(fn.inputs, values, contract.udts);
    try {
      if (type === 'simulate') {
        const sim = await simulateCall(contract.contractId, network, fn.name, nativeArgs);
        const entry: CallResult = {
          type: 'simulate', status: 'success', functionName: fn.name,
          args: values, result: sim.returnValue, latencyMs: sim.latencyMs, timestamp: Date.now(),
        };
        setResult(entry); setStatus('success');
        pushHistory({ ...entry, contractId: contract.contractId });
      } else {
        if (!wallet.address) return;
        const inv = await invokeCall(
          contract.contractId, network, fn.name, nativeArgs, wallet.address,
          (xdr) => signTx(xdr, network.networkPassphrase, wallet.address!)
        );
        const entry: CallResult = {
          type: 'invoke', status: 'success', functionName: fn.name,
          args: values, result: inv.returnValue, txHash: inv.txHash, latencyMs: inv.latencyMs, timestamp: Date.now(),
        };
        setResult(entry); setStatus('success');
        pushHistory({ ...entry, contractId: contract.contractId });
      }
    } catch (err) {
      const entry: CallResult = {
        type, status: 'error', functionName: fn.name, args: values,
        error: err instanceof Error ? err.message : String(err),
        latencyMs: performance.now() - t0, timestamp: Date.now(),
      };
      setResult(entry); setStatus('error');
      pushHistory({ ...entry, contractId: contract.contractId });
    }
  }

  function saveToCollection() {
    if (!contract) return;
    let col = collections[0];
    if (!col) col = addCollection('Default');
    addCallToCollection(col.id, {
      name: `${fn.name} · ${new Date().toLocaleTimeString()}`,
      contractId: contract.contractId,
      network: network.name,
      functionName: fn.name,
      args: values,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isLoading = status === 'loading';
  const canInvoke = !!wallet.address;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Function header ── */}
      <div className="px-6 py-4 border-b border-subtle shrink-0 bg-surface">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-mono font-semibold text-ink leading-none mb-1.5 tracking-tight">
              {fn.name}
            </h2>
            {fn.doc && (
              <p className="text-base font-mono text-fg2 leading-relaxed">{fn.doc}</p>
            )}
          </div>
          {fn.outputs.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <span className="text-xs font-mono text-fg3 uppercase tracking-widest">returns</span>
              <span className="text-sm font-mono text-fg2 border border-edge rounded-lg px-3 py-1 bg-panel">
                {fn.outputs.map(typeLabel).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Parameters ── */}
      <div className="shrink-0 overflow-y-auto border-b border-subtle" style={{ maxHeight: '48%' }}>
        {/* Section header */}
        <div className="px-6 pt-3 pb-1 flex items-center gap-4">
          <span className="text-xs font-mono text-fg3 uppercase tracking-[0.15em]">Parameters</span>
          <div className="flex-1 border-t border-subtle" />
          {fn.inputs.length > 0 && (
            <span className="text-xs font-mono text-fg4">{fn.inputs.length}</span>
          )}
        </div>

        <div className="px-6 pb-4 space-y-3">
          {fn.inputs.length > 0 ? (
            fn.inputs.map((inp) => (
              <TypeInput
                key={inp.name}
                name={inp.name}
                type={inp.type}
                value={values[inp.name] ?? ''}
                onChange={(v) => setValue(inp.name, v)}
              />
            ))
          ) : (
            <p className="text-base font-mono text-fg3 py-8">
              No parameters — this function takes no arguments.
            </p>
          )}
        </div>
      </div>

      {/* ── Action bar ── */}
      <div className="px-6 py-3 flex items-center gap-3 shrink-0 metal-strip border-b border-subtle">
        <button
          onClick={() => run('simulate')}
          disabled={isLoading}
          className="px-5 py-2 bg-ink text-paper rounded-lg text-sm font-mono font-bold tracking-widest hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          SIMULATE
        </button>

        <button
          onClick={() => run('invoke')}
          disabled={isLoading || !canInvoke}
          title={!canInvoke ? 'Connect a wallet to invoke' : undefined}
          className="px-5 py-2 border border-edge rounded-lg text-fg2 text-sm font-mono tracking-widest hover:border-fg3 hover:text-fg transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          INVOKE
        </button>

        <div className="flex-1" />

        <button
          onClick={saveToCollection}
          className="text-sm font-mono text-fg3 hover:text-fg transition-colors"
        >
          {saved ? '✓ saved' : 'save'}
        </button>
      </div>

      {/* ── Result ── */}
      <ResultPanel result={result} status={status} />
    </div>
  );
}
