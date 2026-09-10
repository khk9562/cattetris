import { useCallback, useEffect, useState } from 'react';
import { SETTINGS_KEY, THEMES, themeVars } from '@/shared/config';
import { writeJson } from '@/shared/lib';
import { loadSettings } from './loadSettings';
import type { Settings } from './types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.themeDark = String(THEMES[settings.theme].dark);
    const vars = themeVars(settings.theme);
    for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
    // 주소창/상태바 색도 테마를 따라간다
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEMES[settings.theme].bg);
  }, [settings.theme]);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      writeJson(SETTINGS_KEY, next);
      return next;
    });
  }, []);

  return { settings, update };
}

export type SettingsController = ReturnType<typeof useSettings>;
