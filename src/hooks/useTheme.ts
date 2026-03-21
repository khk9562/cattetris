import { useState, useEffect } from 'react';

export type Theme = 'default' | 'grass';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('cattetris_theme') as Theme) || 'default';
    } catch {
      return 'default';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('cattetris_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Support directly setting a specific theme rather than toggling
  return { theme, setTheme };
}
