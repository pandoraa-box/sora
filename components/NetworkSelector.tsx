'use client';

import { useStore } from '@/lib/store';
import { NETWORKS } from '@/lib/soroban/networks';

export function NetworkSelector() {
  const { network, customRpcUrl, customPassphrase, setNetwork, setCustomRpcUrl, setCustomPassphrase } = useStore();
  const isCustom = network.name === 'custom';

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={network.name}
          onChange={(e) => setNetwork(e.target.value)}
          className="appearance-none bg-surface border border-edge text-xs font-mono pl-2.5 pr-6 py-1.5 text-fg3 hover:text-fg hover:border-fg3 focus:border-fg3 focus:text-fg rounded-md cursor-pointer transition-colors focus:outline-none"
        >
          {Object.values(NETWORKS).map((n) => (
            <option key={n.name} value={n.name}>{n.label.toUpperCase()}</option>
          ))}
          <option value="custom">CUSTOM</option>
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-fg4 text-xs">▾</span>
      </div>

      {isCustom && (
        <>
          <input
            type="text"
            placeholder="RPC URL"
            value={customRpcUrl}
            onChange={(e) => setCustomRpcUrl(e.target.value)}
            className="bg-field border border-edge text-xs font-mono px-3 py-1.5 text-fg placeholder:text-fg4 hover:border-fg3 focus:border-fg3 focus:outline-none rounded-md w-36 transition-colors"
          />
          <input
            type="text"
            placeholder="Passphrase"
            value={customPassphrase}
            onChange={(e) => setCustomPassphrase(e.target.value)}
            className="bg-field border border-edge text-xs font-mono px-3 py-1.5 text-fg placeholder:text-fg4 hover:border-fg3 focus:border-fg3 focus:outline-none rounded-md w-40 transition-colors"
          />
        </>
      )}
    </div>
  );
}
