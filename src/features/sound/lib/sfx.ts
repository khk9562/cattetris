import type { FeedbackKind } from '@/features/game-session/@x/sound';
import { noise, tone } from './synth';

/** 반음 계단: 연쇄가 이어질수록 높아진다 */
const semitone = (base: number, n: number) => base * Math.pow(2, n / 12);

export type SfxRecipe = (strength: number) => void;

/** 피드백 종류별 효과음 레시피. 모든 FeedbackKind에 대해 항목이 있어야 한다. */
export const SFX: Record<FeedbackKind, SfxRecipe> = {
  start: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, { type: 'triangle', gain: 0.2, at: i * 0.09 }));
  },
  move: () => tone(220, 0.03, { type: 'square', gain: 0.05, decay: 0.03 }),
  rotate: () => tone(440, 0.05, { type: 'square', gain: 0.07, slideTo: 660, decay: 0.05 }),
  softDrop: () => tone(180, 0.03, { type: 'triangle', gain: 0.05, decay: 0.03 }),
  hardDrop: () => {
    tone(120, 0.12, { type: 'triangle', gain: 0.3, slideTo: 50, decay: 0.12 });
    noise(0.08, { filterFrom: 1200, filterTo: 150, gain: 0.25 });
  },
  lock: () => tone(150, 0.06, { type: 'triangle', gain: 0.15, slideTo: 90, decay: 0.06 }),
  hold: () => {
    tone(523, 0.06, { type: 'sine', gain: 0.15 });
    tone(392, 0.08, { type: 'sine', gain: 0.15, at: 0.06 });
  },
  line: n => {
    // 상승 아르페지오, 줄 수만큼 길게
    const notes = [523, 659, 784, 1047, 1319].slice(0, 2 + Math.min(3, n));
    notes.forEach((f, i) => tone(f, 0.1, { type: 'square', gain: 0.14, at: i * 0.06 }));
  },
  explode: cells => {
    // 노이즈 버스트 + 하강 스윕, 뭉치 크기에 비례
    const size = Math.min(1.5, 0.5 + cells / 20);
    noise(0.35 * size, { filterFrom: 6000, filterTo: 120, gain: 0.5 });
    tone(320, 0.4 * size, { type: 'sawtooth', gain: 0.25, slideTo: 40, decay: 0.4 * size });
    tone(880, 0.12, { type: 'sine', gain: 0.2, slideTo: 1760, at: 0.02 });
  },
  chain: step => {
    // 연쇄 단계마다 반음 두 개씩 상승하는 종소리
    const base = semitone(660, Math.min(12, step * 2));
    tone(base, 0.18, { type: 'triangle', gain: 0.22 });
    tone(base * 1.5, 0.22, { type: 'sine', gain: 0.16, at: 0.05 });
  },
  combo: n => {
    tone(semitone(784, Math.min(10, n)), 0.08, { type: 'square', gain: 0.12 });
    tone(semitone(1047, Math.min(10, n)), 0.1, { type: 'square', gain: 0.12, at: 0.07 });
  },
  levelup: () => {
    [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.14, { type: 'square', gain: 0.16, at: i * 0.08 }));
  },
  gameover: () => {
    [523, 466, 415, 349].forEach((f, i) => tone(f, 0.28, { type: 'triangle', gain: 0.22, at: i * 0.22 }));
    noise(0.6, { filterFrom: 800, filterTo: 60, gain: 0.15, at: 0.6 });
  },
};

/** 조작 소리는 반복이 잦으므로 최소 간격을 둔다 (ms) */
export const SFX_THROTTLE_MS: Partial<Record<FeedbackKind, number>> = {
  move: 35,
  softDrop: 35,
  rotate: 40,
};
