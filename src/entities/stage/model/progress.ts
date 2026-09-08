import { CAT_INFO } from '@/entities/cat/@x/stage';
import type { GoalProgress, StageDef, StageGoal, StageLimit, StageProgressInput } from './types';

export function goalLabel(goal: StageGoal): string {
  switch (goal.type) {
    case 'lines': return '줄';
    case 'explosions': return '폭발';
    case 'breed': return CAT_INFO[goal.catType].name.split(' (')[0];
    case 'chain': return `${goal.steps}연쇄`;
    case 'score': return '점수';
  }
}

export function goalProgress(goal: StageGoal, p: StageProgressInput): GoalProgress {
  let current = 0;
  let target = 1;
  switch (goal.type) {
    case 'lines': current = p.lines; target = goal.count; break;
    case 'explosions': current = p.explosions; target = goal.count; break;
    case 'breed': current = p.destroyed[goal.catType] ?? 0; target = goal.count; break;
    case 'chain': current = Math.min(goal.steps, p.maxChain + 1); target = goal.steps; break;
    case 'score': current = p.score; target = goal.points; break;
  }
  return { goal, label: goalLabel(goal), current: Math.min(current, target), target, done: current >= target };
}

export function stageProgress(stage: StageDef, p: StageProgressInput): GoalProgress[] {
  return stage.goals.map(g => goalProgress(g, p));
}

export function isStageCleared(stage: StageDef, p: StageProgressInput): boolean {
  return stage.goals.every(g => goalProgress(g, p).done);
}

/** 남은 제한 비율 0~1 */
export function remainingFraction(limit: StageLimit, p: StageProgressInput): number {
  if (limit.type === 'pieces') return Math.max(0, (limit.count - p.piecesPlaced) / limit.count);
  return Math.max(0, (limit.count * 1000 - p.elapsedMs) / (limit.count * 1000));
}

export function isLimitExhausted(limit: StageLimit, p: StageProgressInput): boolean {
  if (limit.type === 'pieces') return p.piecesPlaced >= limit.count;
  return p.elapsedMs >= limit.count * 1000;
}

/** 별점: 클리어 1, 남은 제한 30% 이상 2, 60% 이상 3 */
export function starsFor(limit: StageLimit, p: StageProgressInput): 1 | 2 | 3 {
  const f = remainingFraction(limit, p);
  if (f >= 0.6) return 3;
  if (f >= 0.3) return 2;
  return 1;
}

export function limitLabel(limit: StageLimit, p: StageProgressInput): string {
  if (limit.type === 'pieces') return `조각 ${Math.max(0, limit.count - p.piecesPlaced)}`;
  const left = Math.max(0, Math.ceil((limit.count * 1000 - p.elapsedMs) / 1000));
  return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
}
