import type { CatType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const CAT_COLORS: Record<CatType, string> = {
  ginger: '#feb246',
  tuxedo: '#7fe0f3',
  russianBlue: '#70d1e4',
  calico: '#ffaeb7',
  siamese: '#f5e6d0',
  black: '#4a4a4a',
  tabby: '#c8956c',
};

export const SCORE_TABLE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export const SPEED_TABLE: Record<number, number> = {
  1: 1000,
  2: 900,
  3: 800,
  4: 700,
  5: 600,
  6: 500,
  7: 450,
  8: 400,
  9: 350,
  10: 300,
};

export const LINES_PER_LEVEL = 10;

export const HIGH_SCORE_KEY = 'cattetris_highscore';
