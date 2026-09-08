export type DifficultyId = 'easy' | 'normal' | 'hard';

export interface DifficultyPreset {
  id: DifficultyId;
  label: string;
  description: string;
  /** 시작 레벨 */
  startLevel: number;
  /** 이 레벨 이후로는 낙하 속도가 더 빨라지지 않는다 */
  maxSpeedLevel: number;
  /** 낙하 간격 배율 (1보다 크면 느려짐) */
  gravityScale: number;
  /** 바닥에 닿은 뒤 고정까지 유예(ms) */
  lockDelayMs: number;
  /** 이동/회전으로 락 딜레이를 되돌릴 수 있는 최대 횟수 */
  lockResetLimit: number;
  /** 한 판에 등장하는 품종 수 (시작, 최대) */
  breedsStart: number;
  breedsMax: number;
  /** 몇 레벨마다 품종이 1종 늘어나는가 */
  breedsLevelStep: number;
  /** 직전 품종을 다시 낼 확률 (뭉치 형성 보조) */
  breedRepeatChance: number;
  /** 같은 품종이 이 개수 이상 붙으면 폭발 */
  clusterThreshold: number;
  /** 획득 점수 배율 */
  scoreMultiplier: number;
}
