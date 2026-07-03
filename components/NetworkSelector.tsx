'use client';

import { useStore } from '@/lib/store';
import { NETWORKS } from '@/lib/soroban/networks';

export function NetworkSelector() {
  const { network, customRpcUrl, customPassphrase, setNetwork, setCustomRpcUrl, setCustomPassphrase } = useStore();
  const isCustom = network.name === 'custom';

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <select
          value={network.name}
          onChange={(e) => setNetwork(e.target.value)}
          className="appearance-none bg-surface border border-edge text-base font-mono pl-3 pr-7 py-2 text-fg2 hover:text-fg hover:border-fg3 focus:border-fg3 focus:text-fg rounded-lg cursor-pointer transition-colors"
        >
          {Object.values(NETWORKS).map((n) => (
            <option key={n.name} value={n.name}>{n.label.toUpperCase()}</option>
          ))}
          <option value="custom">CUSTOM</option>
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-fg3 text-xs">▾</span>
      </div>

      {isCustom && (
        <>
          <input
            type="text"
            placeholder="RPC URL (https://…)"
            value={customRpcUrl}
            onChange={(e) => setCustomRpcUrl(e.target.value)}
            className="bg-field border border-edge text-base font-mono px-4 py-2 text-fg placeholder:text-fg4 hover:border-fg3 focus:border-fg3 rounded-lg w-48 transition-colors"
          />
          <input
            type="text"
            placeholder="Network passphrase"
            value={customPassphrase}
            onChange={(e) => setCustomPassphrase(e.target.value)}
            className="bg-field border border-edge text-base font-mono px-4 py-2 text-fg placeholder:text-fg4 hover:border-fg3 focus:border-fg3 rounded-lg w-56 transition-colors"
          />
        </>
      )}
    </div>
  );
}
