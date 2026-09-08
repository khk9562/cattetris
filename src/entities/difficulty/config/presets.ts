import type { DifficultyId, DifficultyPreset } from '../model/types';

export const DIFFICULTY_PRESETS: Record<DifficultyId, DifficultyPreset> = {
  easy: {
    id: 'easy',
    label: '하',
    description: '느긋한 속도. 품종 4~5종, 같은 냥이 9마리면 팡',
    startLevel: 1,
    maxSpeedLevel: 8,
    gravityScale: 1.4,
    lockDelayMs: 600,
    lockResetLimit: 15,
    breedsStart: 4,
    breedsMax: 5,
    breedsLevelStep: 4,
    breedRepeatChance: 0.15,
    clusterThreshold: 9,
    scoreMultiplier: 1,
  },
  normal: {
    id: 'normal',
    label: '중',
    description: '표준 속도. 품종 5~6종, 같은 냥이 10마리면 팡',
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
    scoreMultiplier: 1.5,
  },
  hard: {
    id: 'hard',
    label: '상',
    description: '레벨 4부터 빠르게. 품종 6~7종, 같은 냥이 12마리면 팡',
    startLevel: 4,
    maxSpeedLevel: 13,
    gravityScale: 1,
    lockDelayMs: 400,
    lockResetLimit: 10,
    breedsStart: 6,
    breedsMax: 7,
    breedsLevelStep: 4,
    breedRepeatChance: 0.1,
    clusterThreshold: 12,
    scoreMultiplier: 2,
  },
};

export const DIFFICULTY_ORDER: DifficultyId[] = ['easy', 'normal', 'hard'];

export function isDifficultyId(value: unknown): value is DifficultyId {
  return value === 'easy' || value === 'normal' || value === 'hard';
}
