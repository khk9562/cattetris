import type { DifficultyId, DifficultyPreset } from '../model/types';

/**
 * 무한 모드 난이도. 무한 모드의 조각은 반드시 한 품종(mixCells 0)이다 (CLAUDE.md 게임 규칙).
 * 엔진도 무한 모드에서는 mixCells를 0으로 강제한다. 기준값은 섞인 조각 시절(9/9/10)과
 * 폭발 빈도·쌓임·게임오버율이 비슷해지도록 봇으로 맞춘 값이다 (PLAN.md v7.2).
 */
export const DIFFICULTY_PRESETS: Record<DifficultyId, DifficultyPreset> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    description: '느긋하게 · 5~6종 · 14마리 뭉치면 팡',
    startLevel: 1,
    maxSpeedLevel: 10,
    gravityScale: 1,
    lockDelayMs: 500,
    lockResetLimit: 15,
    breedsStart: 5,
    breedsMax: 6,
    breedsLevelStep: 4,
    breedRepeatChance: 0.1,
    clusterThreshold: 14,
    mixCells: 0,
    scoreMultiplier: 1,
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    description: '레벨 5부터 슬슬 매운맛 · 6~7종 · 16마리',
    startLevel: 5,
    maxSpeedLevel: 13,
    gravityScale: 1,
    lockDelayMs: 400,
    lockResetLimit: 10,
    breedsStart: 6,
    breedsMax: 7,
    breedsLevelStep: 4,
    breedRepeatChance: 0.1,
    clusterThreshold: 16,
    mixCells: 0,
    scoreMultiplier: 1.5,
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    description: '레벨 10부터 광속 · 8~10종 · 18마리. 자신 있냥?',
    startLevel: 10,
    maxSpeedLevel: 15,
    gravityScale: 1,
    lockDelayMs: 300,
    lockResetLimit: 5,
    breedsStart: 8,
    breedsMax: 10,
    breedsLevelStep: 4,
    breedRepeatChance: 0,
    clusterThreshold: 18,
    mixCells: 0,
    scoreMultiplier: 3,
  },
};

export const DIFFICULTY_ORDER: DifficultyId[] = ['easy', 'normal', 'hard'];

export function isDifficultyId(value: unknown): value is DifficultyId {
  return value === 'easy' || value === 'normal' || value === 'hard';
}
