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

  return (
    <div className="flex flex-col h-full shrink-0 bg-panel w-72">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-subtle metal-strip shrink-0">
        <span className="text-xs font-mono text-fg3 uppercase tracking-[0.15em]">Collections</span>
        <button
          onClick={() => setAdding((v) => !v)}
          className="w-8 h-8 flex items-center justify-center text-fg3 hover:text-fg transition-colors rounded-lg border border-transparent hover:border-edge"
          title="New collection"
        >
          <span className="text-base leading-none">+</span>
        </button>
      </div>

      {/* New collection input */}
      {adding && (
        <div className="px-4 py-3 border-b border-subtle flex gap-3 shrink-0 bg-surface">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createCollection();
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="Collection name"
            className="flex-1 bg-field border border-edge rounded-lg px-4 py-2 text-base font-mono text-fg placeholder:text-fg4 focus:border-fg3 transition-colors"
          />
          <button
            onClick={createCollection}
            className="px-4 text-base font-mono text-fg2 border border-edge rounded-lg hover:border-fg3 hover:text-fg transition-colors"
          >
            ✓
          </button>
        </div>
      )}

      {/* Collection list */}
      <div className="flex-1 overflow-y-auto">
        {collections.length === 0 && (
          <p className="text-base font-mono text-fg4 px-4 py-3">No collections yet</p>
        )}

        {collections.map((col) => {
          const isOpen = expanded.has(col.id);
          return (
            <div key={col.id} className="border-b border-subtle">
              {/* Collection row */}
              <div
                className="flex items-center gap-6 px-4 py-2 cursor-pointer hover:bg-raised group transition-colors"
                onClick={() => toggleExpanded(col.id)}
              >
                <span className="text-fg4 text-xs w-4 shrink-0 select-none">
                  {isOpen ? '▾' : '▸'}
                </span>
                <span className="flex-1 text-base font-mono text-fg2 truncate">{col.name}</span>
                {col.calls.length > 0 && (
                  <span className="text-xs font-mono text-fg4 mr-1">{col.calls.length}</span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeCollection(col.id); }}
                  className="text-fg4 hover:text-fg2 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>

              {/* Calls within collection */}
              {isOpen && (
                <div className="pl-6 pr-3 pb-1.5 bg-surface/50">
                  {col.calls.length === 0 && (
                    <p className="text-sm text-fg4 font-mono py-2">empty</p>
                  )}
                  {col.calls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center gap-3 py-2 group cursor-pointer"
                      onClick={() => setActiveFunctionName(call.functionName)}
                    >
                      <span className="text-sm font-mono text-fg3 mr-0.5">→</span>
                      <span className="flex-1 text-base font-mono text-fg3 truncate hover:text-fg transition-colors">
                        {call.name}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeCallFromCollection(col.id, call.id); }}
                        className="text-fg4 hover:text-fg2 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
