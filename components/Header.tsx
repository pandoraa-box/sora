import { NetworkSelector } from './NetworkSelector';
import { WalletButton } from './WalletButton';
import { StellarLogo } from './StellarLogo';

export function Header() {
  return (
    <header className="h-16 border-b border-edge flex items-center px-4 shrink-0 bg-panel">
      {/* Brand */}
      <div className="flex items-center gap-3.5 mr-5">
        <StellarLogo size={20} className="text-ink" />
        <span className="font-mono font-bold text-ink tracking-[0.1em] text-sm leading-none">
          SORA
        </span>
      </div>

      <div className="w-px h-4 bg-edge mx-4" />

      <span className="text-fg3 text-sm font-mono tracking-[0.18em] uppercase select-none">
        Soroban Workbench
      </span>

      <div className="flex-1" />

      <div className="flex items-center gap-6">
        <NetworkSelector />
        <div className="w-px h-4 bg-edge" />
        <WalletButton />
      </div>
    </header>
  );
}
