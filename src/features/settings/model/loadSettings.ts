import { isDifficultyId } from '@/entities/difficulty';
import { DIFFICULTY_KEY, SETTINGS_KEY, THEME_KEY, isThemeId } from '@/shared/config';
import { readJson, readString } from '@/shared/lib';
import { DEFAULT_SETTINGS, type Settings } from './types';

/** 저장된 값과 기본값을 병합하고, 예전 개별 키(테마/난이도)는 승계한다. */
export function mergeSettings(stored: Partial<Settings> | null, legacy?: { theme?: string; difficulty?: string }): Settings {
  const merged: Settings = { ...DEFAULT_SETTINGS };
  if (stored) {
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
      const v = stored[key];
      if (v === undefined) continue;
      if (key === 'difficulty') { if (isDifficultyId(v)) merged.difficulty = v; }
      else if (key === 'theme') { if (isThemeId(v)) merged.theme = v; }
      else if (typeof v === 'boolean') (merged as unknown as Record<string, boolean>)[key] = v;
    }
  }
  if (!stored?.theme && legacy?.theme && isThemeId(legacy.theme)) merged.theme = legacy.theme;
  if (!stored?.difficulty && legacy?.difficulty && isDifficultyId(legacy.difficulty)) merged.difficulty = legacy.difficulty;
  return merged;
}

export function loadSettings(): Settings {
  const stored = readJson<Partial<Settings> | null>(SETTINGS_KEY, null);
  return mergeSettings(stored, {
    theme: readString(THEME_KEY, ''),
    difficulty: readString(DIFFICULTY_KEY, ''),
  });
}
