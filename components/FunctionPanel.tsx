'use client';

import { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { simulateCall, invokeCall } from '@/lib/soroban/client';
import { argsToNative, typeLabel } from '@/lib/soroban/args';
import { signTx } from '@/lib/wallet';
import { TypeInput } from './TypeInput';
import type { ParsedFunction, CallResult } from '@/types';

interface Props { fn: ParsedFunction }

export function FunctionPanel({ fn }: Props) {
  const {
    contract, wallet, network,
    pushHistory, collections, addCallToCollection, addCollection,
    setCallResult, callStatus,
  } = useStore();

  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const setValue = useCallback((name: string, v: string) => {
    setValues((p) => ({ ...p, [name]: v }));
  }, []);

  async function run(type: 'simulate' | 'invoke') {
    if (!contract) return;
    setCallResult(null, 'loading');
    const t0 = performance.now();
    const nativeArgs = argsToNative(fn.inputs, values, contract.udts);
    try {
      if (type === 'simulate') {
        const sim = await simulateCall(contract.contractId, network, fn.name, nativeArgs);
        const entry: CallResult = {
          type: 'simulate', status: 'success', functionName: fn.name,
          args: values, result: sim.returnValue, latencyMs: sim.latencyMs, timestamp: Date.now(),
        };
        setCallResult(entry, 'success');
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
        setCallResult(entry, 'success');
        pushHistory({ ...entry, contractId: contract.contractId });
      }
    } catch (err) {
      const entry: CallResult = {
        type, status: 'error', functionName: fn.name, args: values,
        error: err instanceof Error ? err.message : String(err),
        latencyMs: performance.now() - t0, timestamp: Date.now(),
      };
      setCallResult(entry, 'error');
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

  const isLoading = callStatus === 'loading';
  const canInvoke = !!wallet.address;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Function header */}
      <div className="px-5 py-4 border-b border-edge shrink-0 bg-panel metal-strip">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-mono font-semibold text-fg leading-none mb-1">
              {fn.name}
            </h2>
            {fn.doc && (
              <p className="text-xs font-mono text-fg3 leading-relaxed mt-1">{fn.doc}</p>
            )}
          </div>
          {fn.outputs.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <span className="text-xs font-mono text-fg4 uppercase tracking-widest">returns</span>
              <span className="text-xs font-mono text-fg3 border border-edge rounded px-2 py-0.5 bg-surface">
                {fn.outputs.map(typeLabel).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Parameters */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4 pb-2 flex items-center gap-3">
          <span className="text-xs font-semibold text-fg4 uppercase tracking-[0.15em]">Parameters</span>
          <div className="flex-1 border-t border-edge" />
          {fn.inputs.length > 0 && (
            <span className="text-xs font-mono text-fg4">{fn.inputs.length}</span>
          )}
        </div>

        <div className="px-5 pb-4 space-y-4">
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
            <p className="text-sm font-mono text-fg3 py-6">
              No parameters — this function takes no arguments.
            </p>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="px-5 py-3 flex items-center gap-3 shrink-0 border-t border-edge bg-panel metal-strip">
        <button
          onClick={() => run('simulate')}
          disabled={isLoading}
          className="flex items-center gap-2 h-9 px-4 bg-ink text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Simulate
        </button>

        <button
          onClick={() => run('invoke')}
          disabled={isLoading || !canInvoke}
          title={!canInvoke ? 'Connect a wallet to invoke' : undefined}
          className="flex items-center gap-2 h-9 px-4 border border-edge rounded-lg text-sm font-medium text-fg2 hover:border-fg3 hover:text-fg transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          Invoke
        </button>

        <div className="flex-1" />

        <button
          onClick={saveToCollection}
          className="text-xs font-mono text-fg4 hover:text-fg transition-colors"
        >
          {saved ? '✓ saved' : 'save'}
        </button>
      </div>
    </div>
  );
}
