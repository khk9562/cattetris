import type { CatType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const CAT_COLORS: Record<CatType, string> = {
  ginger: '#feb246',
  tuxedo: '#1a1a1a',
  russianBlue: '#70d1e4',
  calico: '#ffffff',
  siamese: '#f5e6d0',
  black: '#3b3b45',
  tabby: '#c8956c',
  darkTabby: '#5c626b',
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
