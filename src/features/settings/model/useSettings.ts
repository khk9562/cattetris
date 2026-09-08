import { useCallback, useEffect, useState } from 'react';
import { SETTINGS_KEY } from '@/shared/config';
import { writeJson } from '@/shared/lib';
import { loadSettings } from './loadSettings';
import type { Settings } from './types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
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
