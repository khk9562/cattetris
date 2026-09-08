import type { DifficultyId } from '@/entities/difficulty';
import type { ThemeId } from '@/shared/config';

export interface Settings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
  gestures: boolean;
  ghost: boolean;
  difficulty: DifficultyId;
  theme: ThemeId;
}

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  music: true,
  vibration: true,
  gestures: true,
  ghost: true,
  difficulty: 'easy',
  theme: 'default',
};
