import type { StageDef } from '../model/types';

/** 이 값 이상이면 뭉치 폭발이 없는 스테이지 (줄 지우기만) */
export const CLUSTER_OFF = 99;

/**
 * 30개 스테이지. 앞쪽은 규칙을 하나씩 가르치고(줄 -> 폭발 -> 품종 -> 연쇄),
 * 뒤로 갈수록 목표가 겹치고 속도와 폭발 기준이 올라간다.
 * 폭발 기준(clusterThreshold)이 낮은 스테이지는 품종 풀을 좁혀 실제로 뭉치가 만들어지게 한다.
 * 조각은 3+1(mixCells 1) 또는 2+2(mixCells 2)로 섞인다. 줄 연습 스테이지만 한 품종(0).
 * 연쇄 목표 스테이지(7, 14, 23, 29)만 기준을 낮춰 "하나 모자란 뭉치"를 쌓기 쉽게 한다. 그 밖의 팡 스테이지는
 * 품종 4종 이상·기준 8~11·반복 확률 0.2 이하로 두어 우연한 폭발을 줄이고 쌓이는 긴장감을 남긴다 (v7.1).
 * 수치는 `npm run sim:stages`(연쇄 노리는 봇)로 전 스테이지 클리어가 확인된 값이다.
 */
export const STAGES: StageDef[] = [
  { id: 1, title: '첫 만남', goals: [{ type: 'lines', count: 3 }], limit: { type: 'pieces', count: 40 }, preset: { startLevel: 1, breedsStart: 4, breedsMax: 4, clusterThreshold: CLUSTER_OFF, mixCells: 0 } },
  { id: 2, title: '줄 맞추기', goals: [{ type: 'lines', count: 6 }], limit: { type: 'pieces', count: 60 }, preset: { startLevel: 1, breedsStart: 4, breedsMax: 4, clusterThreshold: CLUSTER_OFF, mixCells: 0 } },
  { id: 3, title: '팡!', goals: [{ type: 'explosions', count: 1 }], limit: { type: 'pieces', count: 40 }, preset: { startLevel: 1, breedsStart: 4, breedsMax: 4, clusterThreshold: 8, mixCells: 1, breedRepeatChance: 0.2 } },
  { id: 4, title: '두 번 팡', goals: [{ type: 'explosions', count: 2 }], limit: { type: 'pieces', count: 60 }, preset: { startLevel: 1, breedsStart: 4, breedsMax: 4, clusterThreshold: 8, mixCells: 1, breedRepeatChance: 0.2 } },
  { id: 5, title: '치즈냥이 모으기', goals: [{ type: 'breed', catType: 'ginger', count: 16 }], limit: { type: 'pieces', count: 60 }, breeds: ['ginger', 'tuxedo', 'russianBlue', 'calico'], preset: { startLevel: 1, breedsStart: 4, breedsMax: 4, clusterThreshold: 8, mixCells: 1, breedRepeatChance: 0.2 } },
  { id: 6, title: '줄과 팡', goals: [{ type: 'lines', count: 5 }, { type: 'explosions', count: 1 }], limit: { type: 'pieces', count: 70 }, preset: { startLevel: 2, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.15 } },
  { id: 7, title: '연쇄 입문', goals: [{ type: 'chain', steps: 2 }], limit: { type: 'pieces', count: 70 }, preset: { startLevel: 2, breedsStart: 4, breedsMax: 4, clusterThreshold: 8, mixCells: 1, breedRepeatChance: 0.25 } },
  { id: 8, title: '시간과의 싸움', goals: [{ type: 'lines', count: 8 }], limit: { type: 'seconds', count: 120 }, preset: { startLevel: 2, breedsStart: 4, breedsMax: 4, clusterThreshold: CLUSTER_OFF, mixCells: 0 } },
  { id: 9, title: '턱시도 파티', goals: [{ type: 'breed', catType: 'tuxedo', count: 24 }], limit: { type: 'pieces', count: 70 }, breeds: ['tuxedo', 'calico', 'siamese', 'tabby'], preset: { startLevel: 2, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.2 } },
  { id: 10, title: '첫 고비', goals: [{ type: 'score', points: 6000 }], limit: { type: 'pieces', count: 80 }, preset: { startLevel: 3, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.15 } },
  { id: 11, title: '열 줄', goals: [{ type: 'lines', count: 10 }], limit: { type: 'pieces', count: 70 }, preset: { startLevel: 3, breedsStart: 5, breedsMax: 5, clusterThreshold: 10, mixCells: 1 } },
  { id: 12, title: '세 번 팡', goals: [{ type: 'explosions', count: 3 }], limit: { type: 'pieces', count: 80 }, preset: { startLevel: 3, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.15 } },
  { id: 13, title: '샴 모으기', goals: [{ type: 'breed', catType: 'siamese', count: 30 }], limit: { type: 'pieces', count: 80 }, breeds: ['siamese', 'black', 'bengal', 'white'], preset: { startLevel: 3, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.2 } },
  { id: 14, title: '3연쇄', goals: [{ type: 'chain', steps: 3 }], limit: { type: 'pieces', count: 90 }, preset: { startLevel: 3, breedsStart: 3, breedsMax: 3, clusterThreshold: 7, mixCells: 1, breedRepeatChance: 0.3 } },
  { id: 15, title: '분 단위', goals: [{ type: 'lines', count: 12 }, { type: 'explosions', count: 2 }], limit: { type: 'seconds', count: 180 }, preset: { startLevel: 4, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.15 } },
  { id: 16, title: '만 점', goals: [{ type: 'score', points: 12000 }], limit: { type: 'pieces', count: 90 }, preset: { startLevel: 4, breedsStart: 5, breedsMax: 5, clusterThreshold: 10, mixCells: 1, breedRepeatChance: 0.15 } },
  { id: 17, title: '카오스 파티', goals: [{ type: 'breed', catType: 'tortie', count: 30 }, { type: 'lines', count: 6 }], limit: { type: 'pieces', count: 90 }, breeds: ['tortie', 'ginger', 'white', 'scottishFold'], preset: { startLevel: 4, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.2 } },
  { id: 18, title: '다섯 번 팡', goals: [{ type: 'explosions', count: 5 }], limit: { type: 'pieces', count: 100 }, preset: { startLevel: 4, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.15 } },
  { id: 19, title: '빠른 손', goals: [{ type: 'lines', count: 10 }], limit: { type: 'seconds', count: 90 }, preset: { startLevel: 5, breedsStart: 5, breedsMax: 5, clusterThreshold: CLUSTER_OFF, mixCells: 0 } },
  { id: 20, title: '두 번째 고비', goals: [{ type: 'lines', count: 15 }, { type: 'explosions', count: 3 }, { type: 'chain', steps: 2 }], limit: { type: 'pieces', count: 120 }, preset: { startLevel: 5, breedsStart: 4, breedsMax: 5, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.15 } },
  { id: 21, title: '벵갈 사냥', goals: [{ type: 'breed', catType: 'bengal', count: 40 }], limit: { type: 'pieces', count: 100 }, breeds: ['bengal', 'russianBlue', 'calico', 'darkTabby', 'black'], preset: { startLevel: 5, breedsStart: 5, breedsMax: 5, clusterThreshold: 10, mixCells: 1, breedRepeatChance: 0.2 } },
  { id: 22, title: '스무 줄', goals: [{ type: 'lines', count: 20 }], limit: { type: 'pieces', count: 110 }, preset: { startLevel: 6, breedsStart: 5, breedsMax: 6, clusterThreshold: 10, mixCells: 2 } },
  { id: 23, title: '4연쇄', goals: [{ type: 'chain', steps: 4 }], limit: { type: 'pieces', count: 120 }, preset: { startLevel: 5, breedsStart: 3, breedsMax: 3, clusterThreshold: 6, mixCells: 1, breedRepeatChance: 0.4 } },
  { id: 24, title: '삼만 점', goals: [{ type: 'score', points: 30000 }], limit: { type: 'pieces', count: 120 }, preset: { startLevel: 6, breedsStart: 5, breedsMax: 5, clusterThreshold: 10, mixCells: 2, breedRepeatChance: 0.15 } },
  { id: 25, title: '2분 폭주', goals: [{ type: 'explosions', count: 4 }, { type: 'lines', count: 10 }], limit: { type: 'seconds', count: 150 }, preset: { startLevel: 6, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.2 } },
  { id: 26, title: '흰냥이 축제', goals: [{ type: 'breed', catType: 'white', count: 50 }, { type: 'explosions', count: 3 }], limit: { type: 'pieces', count: 130 }, breeds: ['white', 'black', 'ginger', 'tabby', 'siamese'], preset: { startLevel: 7, breedsStart: 5, breedsMax: 5, clusterThreshold: 10, mixCells: 2, breedRepeatChance: 0.2 } },
  { id: 27, title: '여덟 번 팡', goals: [{ type: 'explosions', count: 8 }], limit: { type: 'pieces', count: 150 }, preset: { startLevel: 7, breedsStart: 4, breedsMax: 5, clusterThreshold: 9, mixCells: 2, breedRepeatChance: 0.15 } },
  { id: 28, title: '서른 줄', goals: [{ type: 'lines', count: 30 }], limit: { type: 'pieces', count: 150 }, preset: { startLevel: 8, breedsStart: 6, breedsMax: 6, clusterThreshold: 11, mixCells: 2 } },
  { id: 29, title: '4연쇄, 네 품종', goals: [{ type: 'chain', steps: 4 }], limit: { type: 'pieces', count: 160 }, preset: { startLevel: 7, breedsStart: 4, breedsMax: 4, clusterThreshold: 6, mixCells: 1, breedRepeatChance: 0.35 } },
  { id: 30, title: '냥스택 마스터', goals: [{ type: 'lines', count: 20 }, { type: 'explosions', count: 6 }, { type: 'chain', steps: 3 }, { type: 'score', points: 40000 }], limit: { type: 'pieces', count: 200 }, preset: { startLevel: 9, breedsStart: 4, breedsMax: 4, clusterThreshold: 9, mixCells: 1, breedRepeatChance: 0.2 } },
];

export function getStage(id: number): StageDef | undefined {
  return STAGES.find(s => s.id === id);
}
