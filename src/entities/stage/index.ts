export type { StageDef, StageGoal, StageLimit, StageProgressInput, GoalProgress } from './model/types';
export { STAGES, getStage } from './config/stages';
export { stageProgress, isStageCleared, isLimitExhausted, remainingFraction, starsFor, limitLabel, goalLabel } from './model/progress';
