export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

/** 다음 조각 미리보기 개수 */
export const NEXT_QUEUE_SIZE = 3;

/** 줄/뭉치 제거 연출 시간(ms) */
export const CLEAR_ANIMATION_MS = 320;
/** 중력 낙하 후 다음 연쇄 판정까지 대기(ms) */
export const SETTLE_MS = 140;
/** 점수 팝업 표시 시간(ms) */
export const POPUP_MS = 900;

export const LINES_PER_LEVEL = 10;

/** 줄 삭제 기본 점수 (레벨 배율 전) */
export const LINE_SCORE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};
export const SOFT_DROP_SCORE = 1;
export const HARD_DROP_SCORE = 2;
export const COMBO_SCORE = 50;
export const CLUSTER_CELL_SCORE = 30;
export const SPLASH_CELL_SCORE = 10;
export const CHAIN_STEP_MULTIPLIER = 0.5;

export const HIGH_SCORE_KEY = 'cattetris_highscore';
export const STATS_KEY = 'cattetris_stats';
export const THEME_KEY = 'cattetris_theme';
export const DIFFICULTY_KEY = 'cattetris_difficulty';
export const SETTINGS_KEY = 'cattetris_settings';
export const STAGES_KEY = 'cattetris_stages';
export const MISSIONS_KEY = 'cattetris_missions';
export const TITLES_KEY = 'cattetris_titles';
export const TOTALS_KEY = 'cattetris_totals';
export const TUTORIAL_KEY = 'cattetris_tutorial_done';
export const SKINS_KEY = 'cattetris_skins';
