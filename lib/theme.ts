'use client';

import { useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'sora:theme';

function applyTheme(t: Theme) {
  try {
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem(KEY, t);
  } catch {}
}

function readDom(): Theme {
  try {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function useTheme() {
  // Lazy initializer reads the DOM class set by the init script (client-only).
  // Server always gets 'light' (matches the SSR default before the init script runs).
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === 'undefined' ? 'light' : readDom()
  );

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
