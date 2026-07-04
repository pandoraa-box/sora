import { NetworkSelector } from './NetworkSelector';
import { WalletButton } from './WalletButton';

export function Header() {
  return (
    <header className="h-14 border-b border-edge flex items-center px-4 md:px-5 shrink-0 bg-panel">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 4.5L13.5 8L10.5 11.5M5.5 4.5L2.5 8L5.5 11.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold text-fg leading-tight">Sora</div>
          <div className="text-xs text-fg3 leading-tight hidden sm:block">Soroban Workbench</div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <NetworkSelector />
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
