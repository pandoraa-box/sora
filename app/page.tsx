'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ContractLoader } from '@/components/ContractLoader';
import { ContractInspector } from '@/components/ContractInspector';
import { CollectionsSidebar } from '@/components/CollectionsSidebar';
import { ResponsePanel } from '@/components/ResponsePanel';

type MobileTab = 'workspace' | 'functions' | 'response';

function TabIcon({ tab }: { tab: MobileTab }) {
  if (tab === 'workspace') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
  if (tab === 'functions') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

export default function Page() {
  const [mobileTab, setMobileTab] = useState<MobileTab>('functions');

  return (
    <div className="h-full flex flex-col bg-surface">
      <Header />
      <ContractLoader />

      {/* Desktop: 3-column workspace */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        <aside className="w-56 flex flex-col shrink-0 border-r border-edge">
          <CollectionsSidebar />
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          <ContractInspector />
        </main>
        <aside className="w-80 flex flex-col shrink-0 border-l border-edge">
          <ResponsePanel />
        </aside>
      </div>

      {/* Mobile: tab-based layout */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0 overflow-hidden">
        {/* Content pane */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {mobileTab === 'functions' && <ContractInspector />}
          {mobileTab === 'response' && <ResponsePanel />}
          {mobileTab === 'workspace' && <CollectionsSidebar />}
        </div>

        {/* Bottom tab bar */}
        <nav className="flex border-t border-edge bg-panel shrink-0">
          {(['workspace', 'functions', 'response'] as MobileTab[]).map((tab) => {
            const labels: Record<MobileTab, string> = {
              workspace: 'Workspace',
              functions: 'Functions',
              response: 'Response',
            };
            const isActive = mobileTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-ink' : 'text-fg4 hover:text-fg3'
                }`}
              >
                <TabIcon tab={tab} />
                {labels[tab]}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
