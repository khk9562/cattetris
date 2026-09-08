export { useGame } from './model/useGame';
export type { GameController, GameActions } from './model/useGame';
export type { GameStatus, EngineState, ClearCell, ClearKind, Popup, Phase, SessionStats, Feedback, FeedbackKind } from './model/types';
export { createInitialState, engineReducer, selectGhost } from './model/engine';
