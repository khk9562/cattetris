import type { DifficultyId, DifficultyPreset } from '../model/types';

export const DIFFICULTY_PRESETS: Record<DifficultyId, DifficultyPreset> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    description: '느긋하게 · 5~6종 · 10마리 뭉치면 팡',
    startLevel: 1,
    maxSpeedLevel: 10,
    gravityScale: 1,
    lockDelayMs: 500,
    lockResetLimit: 15,
    breedsStart: 5,
    breedsMax: 6,
    breedsLevelStep: 4,
    breedRepeatChance: 0.1,
    clusterThreshold: 10,
    scoreMultiplier: 1,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    description: '레벨 5부터 슬슬 매운맛 · 6~7종 · 12마리',
    startLevel: 5,
    maxSpeedLevel: 13,
    gravityScale: 1,
    lockDelayMs: 400,
    lockResetLimit: 10,
    breedsStart: 6,
    breedsMax: 7,
    breedsLevelStep: 4,
    breedRepeatChance: 0.1,
    clusterThreshold: 12,
    scoreMultiplier: 1.5,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    description: '레벨 10부터 광속 · 8~10종 · 14마리. 자신 있냥?',
    startLevel: 10,
    maxSpeedLevel: 15,
    gravityScale: 1,
    lockDelayMs: 300,
    lockResetLimit: 5,
    breedsStart: 8,
    breedsMax: 10,
    breedsLevelStep: 4,
    breedRepeatChance: 0,
    clusterThreshold: 14,
    scoreMultiplier: 3,
  },
};

export const DIFFICULTY_ORDER: DifficultyId[] = ['easy', 'normal', 'hard'];

export function isDifficultyId(value: unknown): value is DifficultyId {
  return value === 'easy' || value === 'normal' || value === 'hard';
}
