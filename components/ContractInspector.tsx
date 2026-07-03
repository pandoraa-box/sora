'use client';

import { useStore } from '@/lib/store';
import { FunctionPanel } from './FunctionPanel';
import { typeLabel } from '@/lib/soroban/args';

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="px-4 py-2 flex items-center gap-3.5 metal-strip border-b border-subtle shrink-0">
      <span className="text-xs font-mono text-fg3 uppercase tracking-[0.15em]">{label}</span>
      <div className="flex-1 border-t border-subtle" />
      {count !== undefined && (
        <span className="text-xs font-mono text-fg4">{count}</span>
      )}
    </div>
  );
}

export function ContractInspector() {
  const { contract, activeFunctionName, setActiveFunctionName } = useStore();

  if (!contract) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <div className="w-10 h-10 border border-edge rotate-45 flex items-center justify-center">
              <span className="text-fg4 text-base -rotate-45 select-none">◆</span>
            </div>
          </div>
          <p className="text-fg4 text-base font-mono mb-1.5">No contract loaded</p>
          <p className="text-fg4 text-base font-mono" style={{ opacity: 0.5 }}>
            Paste a Soroban contract ID above to inspect
          </p>
        </div>
      </div>
    );
  }

  const activeFunc = contract.functions.find((f) => f.name === activeFunctionName);

  return (
    <div className="flex flex-1 min-h-0">

      {/* ── Left: function + type list ── */}
      <div className="w-48 border-r border-edge flex flex-col shrink-0 bg-panel">
        <SectionHeader label="Functions" count={contract.functions.length} />

        <nav className="flex-1 overflow-y-auto">
          {contract.functions.map((fn) => {
            const isActive = fn.name === activeFunctionName;
            return (
              <button
                key={fn.name}
                onClick={() => setActiveFunctionName(fn.name)}
                className={`w-full text-left border-l-2 transition-colors ${
                  isActive
                    ? 'border-l-ink bg-raised text-ink'
                    : 'border-l-transparent text-fg3 hover:text-fg2 hover:bg-raised/60'
                }`}
              >
                <div className="px-4 py-2 min-w-0">
                  <div className="text-base font-mono truncate leading-snug">{fn.name}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {fn.inputs.length > 0 && (
                      <span className={`text-xs font-mono ${isActive ? 'text-fg2' : 'text-fg4'}`}>
                        {fn.inputs.length}p
                      </span>
                    )}
                    {fn.outputs.length > 0 && (
                      <span className={`text-xs font-mono truncate max-w-24 ${isActive ? 'text-fg2' : 'text-fg4'}`}>
                        → {typeLabel(fn.outputs[0])}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {Object.keys(contract.udts).length > 0 && (
          <>
            <SectionHeader label="Types" count={Object.keys(contract.udts).length} />
            <div className="overflow-y-auto pb-2">
              {Object.values(contract.udts).map((udt) => (
                <div key={udt.name} className="px-4 py-2 flex items-center gap-3">
                  <span className="text-xs font-mono text-fg4 uppercase">{udt.kind}</span>
                  <span className="text-base font-mono text-fg3 truncate">{udt.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Right: invocation panel ── */}
      <div className="flex-1 min-w-0 flex flex-col bg-surface">
        {activeFunc ? (
          <FunctionPanel fn={activeFunc} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-fg4 text-base font-mono">Select a function from the list</p>
          </div>
        )}
      </div>
    </div>
  );
}
