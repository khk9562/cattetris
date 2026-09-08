import type { DifficultyPreset } from './types';

/**
 * 테트리스 가이드라인 낙하 공식: 한 칸 내려가는 데 걸리는 초 = (0.8 - (L-1)*0.007)^(L-1)
 * 난이도별 상한 레벨과 배율을 적용한다.
 */
export function gravityIntervalMs(level: number, preset: DifficultyPreset): number {
  const l = Math.max(1, Math.min(level, preset.maxSpeedLevel));
  const seconds = Math.pow(0.8 - (l - 1) * 0.007, l - 1);
  return Math.max(16, Math.round(seconds * 1000 * preset.gravityScale));
}

/** 현재 레벨에서 등장하는 품종 수 */
export function breedCountForLevel(level: number, preset: DifficultyPreset): number {
  const steps = Math.floor(Math.max(0, level - preset.startLevel) / preset.breedsLevelStep);
  return Math.min(preset.breedsMax, preset.breedsStart + steps);
}
