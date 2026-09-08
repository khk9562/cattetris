import { ALL_CAT_TYPES, CAT_INFO } from '@/entities/cat/@x/mission';
import { nextRandom } from '@/shared/lib';
import type { DailyProgress, Mission, MissionGoal } from './types';

/** YYYY-MM-DD (로컬 시간) */
export function dateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const TITLES: Record<MissionGoal['type'], string[]> = {
  lines: ['줄 정리 담당', '깔끔한 냥집사', '줄줄이 마스터'],
  explosions: ['폭죽 냥집사', '팡팡 요정', '폭발 전문가'],
  chain: ['연쇄의 달인', '도미노 냥집사', '연쇄 마법사'],
  breed: ['품종 감별사', '냥이 수집가', '털 뭉치 사냥꾼'],
  score: ['점수 사냥꾼', '고득점 냥집사', '전설의 집사'],
};

/** 같은 날짜면 항상 같은 미션 3개 (종류는 서로 다름) */
export function generateDailyMissions(key: string): Mission[] {
  let seed = hash(key);
  const kinds: MissionGoal['type'][] = ['lines', 'explosions', 'chain', 'breed', 'score'];
  const picked: MissionGoal['type'][] = [];
  while (picked.length < 3) {
    const r = nextRandom(seed);
    seed = r.seed;
    const k = kinds[Math.floor(r.value * kinds.length)];
    if (!picked.includes(k)) picked.push(k);
  }
  return picked.map((kind, i) => {
    const r = nextRandom(seed);
    seed = r.seed;
    const v = r.value;
    let goal: MissionGoal;
    switch (kind) {
      case 'lines': goal = { type: 'lines', count: 15 + Math.floor(v * 4) * 5 }; break;
      case 'explosions': goal = { type: 'explosions', count: 3 + Math.floor(v * 6) }; break;
      case 'chain': goal = { type: 'chain', steps: 2 + Math.floor(v * 2) }; break;
      case 'breed': goal = { type: 'breed', catType: ALL_CAT_TYPES[Math.floor(v * ALL_CAT_TYPES.length)], count: 20 + Math.floor(v * 3) * 10 }; break;
      case 'score': goal = { type: 'score', points: 10000 + Math.floor(v * 4) * 10000 }; break;
    }
    const titles = TITLES[kind];
    return { id: `${key}-${i}`, goal, title: titles[Math.floor(v * titles.length)] };
  });
}

export function missionLabel(goal: MissionGoal): string {
  switch (goal.type) {
    case 'lines': return `줄 ${goal.count}개 지우기`;
    case 'explosions': return `폭발 ${goal.count}회`;
    case 'chain': return `${goal.steps}연쇄 달성`;
    case 'breed': return `${CAT_INFO[goal.catType].name.split(' (')[0]} ${goal.count}마리 터뜨리기`;
    case 'score': return `오늘 누적 ${goal.points.toLocaleString()}점`;
  }
}

export function missionProgress(goal: MissionGoal, p: DailyProgress): { current: number; target: number; done: boolean } {
  let current = 0;
  let target = 1;
  switch (goal.type) {
    case 'lines': current = p.lines; target = goal.count; break;
    case 'explosions': current = p.explosions; target = goal.count; break;
    case 'chain': current = p.bestChain; target = goal.steps; break;
    case 'breed': current = p.destroyed[goal.catType] ?? 0; target = goal.count; break;
    case 'score': current = p.score; target = goal.points; break;
  }
  return { current: Math.min(current, target), target, done: current >= target };
}

export function mergeProgress(a: DailyProgress, b: DailyProgress): DailyProgress {
  const destroyed: DailyProgress['destroyed'] = { ...a.destroyed };
  for (const [k, v] of Object.entries(b.destroyed)) {
    const key = k as keyof DailyProgress['destroyed'];
    destroyed[key] = (destroyed[key] ?? 0) + (v ?? 0);
  }
  return {
    lines: a.lines + b.lines,
    explosions: a.explosions + b.explosions,
    bestChain: Math.max(a.bestChain, b.bestChain),
    destroyed,
    score: a.score + b.score,
  };
}
