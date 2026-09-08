import { useState, useEffect } from 'react';
import { THEME_KEY } from '@/shared/config';

export type Theme = 'default' | 'grass';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(THEME_KEY) as Theme) || 'default';
    } catch {
      return 'default';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Support directly setting a specific theme rather than toggling
  return { theme, setTheme };
}
