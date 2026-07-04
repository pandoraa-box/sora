'use client';

import { useStore } from '@/lib/store';
import { FunctionPanel } from './FunctionPanel';
import { typeLabel } from '@/lib/soroban/args';

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="px-3 py-2.5 flex items-center gap-3 border-b border-edge shrink-0">
      <span className="text-xs font-semibold text-fg3 uppercase tracking-[0.15em]">{label}</span>
      <div className="flex-1 border-t border-edge" />
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
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="text-fg4">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
          <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
        </svg>
        <div>
          <p className="text-base font-semibold text-fg3">No Contract Loaded</p>
          <p className="text-sm text-fg4 mt-1 max-w-xs">
            Enter a contract address and fetch its ABI to see available functions
          </p>
        </div>
      </div>
    );
  }

  const activeFunc = contract.functions.find((f) => f.name === activeFunctionName);

  return (
    <div className="flex flex-1 min-h-0">

      {/* Left: function + type nav */}
      <div className="w-44 md:w-48 border-r border-edge flex flex-col shrink-0 bg-panel">
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
                <div className="px-3 py-2 min-w-0">
                  <div className="text-sm font-mono truncate leading-snug">{fn.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {fn.inputs.length > 0 && (
                      <span className={`text-xs font-mono ${isActive ? 'text-fg2' : 'text-fg4'}`}>
                        {fn.inputs.length}p
                      </span>
                    )}
                    {fn.outputs.length > 0 && (
                      <span className={`text-xs font-mono truncate max-w-20 ${isActive ? 'text-fg2' : 'text-fg4'}`}>
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
                <div key={udt.name} className="px-3 py-1.5 flex items-center gap-2">
                  <span className="text-xs font-mono text-fg4 uppercase">{udt.kind}</span>
                  <span className="text-xs font-mono text-fg3 truncate">{udt.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: function panel */}
      <div className="flex-1 min-w-0 flex flex-col bg-surface">
        {activeFunc ? (
          <FunctionPanel fn={activeFunc} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-fg4 font-mono">Select a function from the list</p>
          </div>
        )}
      </div>
    </div>
  );
}
