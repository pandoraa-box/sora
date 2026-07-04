'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export function CollectionsSidebar() {
  const { collections, loadCollections, addCollection, removeCollection, removeCallFromCollection, setActiveFunctionName } = useStore();
  const [newName, setNewName] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function createCollection() {
    const name = newName.trim() || 'New Collection';
    addCollection(name);
    setNewName('');
    setAdding(false);
  }

  const isEmpty = collections.length === 0;

  return (
    <div className="flex flex-col h-full bg-panel">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-edge shrink-0">
        <span className="text-xs font-semibold text-fg3 uppercase tracking-[0.15em]">Workspace</span>
        <button
          onClick={() => setAdding((v) => !v)}
          className="w-6 h-6 flex items-center justify-center text-fg4 hover:text-fg2 transition-colors rounded"
          title="New collection"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* New collection input */}
      {adding && (
        <div className="px-3 py-2.5 border-b border-edge flex gap-2 shrink-0 bg-surface">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createCollection();
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="Collection name"
            className="flex-1 bg-field border border-edge rounded px-3 py-1.5 text-sm font-mono text-fg placeholder:text-fg4 focus:border-fg3 focus:outline-none transition-colors"
          />
          <button
            onClick={createCollection}
            className="px-3 text-sm font-mono text-fg3 border border-edge rounded hover:border-fg3 hover:text-fg transition-colors"
          >
            ✓
          </button>
        </div>
      )}

      {/* Collection list or empty state */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty && !adding && (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="text-fg4">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-fg3">No Saved Calls</p>
              <p className="text-xs text-fg4 mt-1 leading-relaxed">Save function calls for quick access later</p>
            </div>
          </div>
        )}
        {collections.map((col) => {
          const isOpen = expanded.has(col.id);
          return (
            <div key={col.id} className="border-b border-edge">
              {/* Collection row */}
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-raised group transition-colors"
                onClick={() => toggleExpanded(col.id)}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className={`text-fg4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                  <polygon points="2,1 8,5 2,9" />
                </svg>
                <span className="flex-1 text-sm font-mono text-fg2 truncate">{col.name}</span>
                {col.calls.length > 0 && (
                  <span className="text-xs font-mono text-fg4">{col.calls.length}</span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeCollection(col.id); }}
                  className="text-fg4 hover:text-fg2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>

              {/* Calls */}
              {isOpen && (
                <div className="pl-5 pr-3 pb-1 bg-surface/50">
                  {col.calls.length === 0 && (
                    <p className="text-xs text-fg4 font-mono py-2 pl-2">empty</p>
                  )}
                  {col.calls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center gap-2 py-1.5 group cursor-pointer"
                      onClick={() => setActiveFunctionName(call.functionName)}
                    >
                      <span className="text-xs font-mono text-fg4 shrink-0">→</span>
                      <span className="flex-1 text-xs font-mono text-fg3 truncate hover:text-fg transition-colors">
                        {call.name}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeCallFromCollection(col.id, call.id); }}
                        className="text-fg4 hover:text-fg2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
