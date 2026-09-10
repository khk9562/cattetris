/**
 * 테마 토큰. 8종을 4개의 짝(낮·밤 / 실내·야외 / 봄·겨울 / 파스텔·우드)으로 묶는다.
 * 값은 여기가 원본이고, useSettings가 :root에 CSS 변수로 흘려 넣는다.
 */

export type ThemeId = 'day' | 'night' | 'indoor' | 'outdoor' | 'spring' | 'winter' | 'pastel' | 'wood';
export type ThemePairId = 'dayNight' | 'inOut' | 'season' | 'texture';

/** 테마마다 붙는 분위기 입자 */
export type AtmosphereKind = 'ray' | 'beam' | 'star' | 'petal' | 'snow' | 'leaf' | 'bubble' | 'mote';

export interface ThemeDef {
  id: ThemeId;
  pair: ThemePairId;
  /** 짝 안에서의 짧은 이름 (테마 버튼에 노출) */
  label: string;
  /** 테마 전체 이름 */
  name: string;
  /** 테마 한 줄 (냥이 말투) */
  mood: string;
  /** 어두운 테마는 격자선·그림자 톤을 뒤집는다 */
  dark: boolean;
  atmosphere: AtmosphereKind;
  atmosphereCount: number;
  /** 바탕 */
  bg: string;
  /** 바탕 위에 얹는 빛무리 */
  glow: string;
  /** 카드·시트 면 */
  surface: string;
  /** 본문 글자 */
  ink: string;
  /** 보조 글자 */
  soft: string;
  /** 경계선 */
  line: string;
  accent: string;
  accent2: string;
  /** 보드 바닥 */
  board: string;
  /** accent 위에 올라가는 글자 */
  onAccent: string;
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  day: {
    id: 'day', pair: 'dayNight', label: '낮', name: '햇살 크림', mood: '햇살 자리 내가 찜', dark: false,
    atmosphere: 'ray', atmosphereCount: 4,
    bg: '#fdf6ec',
    glow: 'radial-gradient(60% 50% at 20% 0%, rgba(255,214,178,0.55) 0%, transparent 70%), radial-gradient(70% 50% at 100% 100%, rgba(198,226,214,0.45) 0%, transparent 70%)',
    surface: '#fffdf9', ink: '#2f2a26', soft: '#6e645c', line: 'rgba(47,42,38,0.1)',
    accent: '#d9622f', accent2: '#3f7d74', board: '#f6ead9', onAccent: '#fffaf4',
  },
  night: {
    id: 'night', pair: 'dayNight', label: '밤', name: '깊은 야경', mood: '별 세다 잘 거임', dark: true,
    atmosphere: 'star', atmosphereCount: 22,
    bg: '#151a26',
    glow: 'radial-gradient(60% 50% at 18% 0%, rgba(94,120,190,0.4) 0%, transparent 70%), radial-gradient(70% 50% at 100% 100%, rgba(190,140,90,0.24) 0%, transparent 70%)',
    surface: '#1e2433', ink: '#f1f3f8', soft: '#9aa4ba', line: 'rgba(255,255,255,0.12)',
    accent: '#ffb46a', accent2: '#7fb0ff', board: '#111624', onAccent: '#20180f',
  },
  indoor: {
    id: 'indoor', pair: 'inOut', label: '실내', name: '창가 햇살', mood: '창가 자리 양보 못 해', dark: false,
    atmosphere: 'beam', atmosphereCount: 3,
    bg: '#f7efe2',
    glow: 'radial-gradient(55% 45% at 78% 0%, rgba(255,225,168,0.6) 0%, transparent 72%)',
    surface: '#fffaf1', ink: '#38302a', soft: '#6f6455', line: 'rgba(56,48,42,0.12)',
    accent: '#c07a2c', accent2: '#7a8b5a', board: '#efe2ce', onAccent: '#fffaf1',
  },
  outdoor: {
    id: 'outdoor', pair: 'inOut', label: '야외', name: '잔디 정원', mood: '풀밭에 눕는다 말리지 마', dark: false,
    atmosphere: 'leaf', atmosphereCount: 12,
    bg: '#eef4e5',
    glow: 'radial-gradient(60% 45% at 20% 0%, rgba(206,231,176,0.7) 0%, transparent 72%), radial-gradient(70% 50% at 100% 100%, rgba(246,224,168,0.4) 0%, transparent 70%)',
    surface: '#fbfdf6', ink: '#26301f', soft: '#55634f', line: 'rgba(38,48,31,0.12)',
    accent: '#4b8a3c', accent2: '#c07a2c', board: '#e1ecd4', onAccent: '#fbfdf6',
  },
  spring: {
    id: 'spring', pair: 'season', label: '봄', name: '벚꽃', mood: '꽃잎 맞고 재채기 중', dark: false,
    atmosphere: 'petal', atmosphereCount: 16,
    bg: '#fdf0f3',
    glow: 'radial-gradient(60% 45% at 22% 0%, rgba(255,205,220,0.7) 0%, transparent 72%), radial-gradient(70% 50% at 100% 100%, rgba(206,231,214,0.45) 0%, transparent 70%)',
    surface: '#fffafb', ink: '#3b2b31', soft: '#77636b', line: 'rgba(59,43,49,0.11)',
    accent: '#d1567f', accent2: '#5f9b86', board: '#f8e5eb', onAccent: '#fffafb',
  },
  winter: {
    id: 'winter', pair: 'season', label: '겨울', name: '눈 내린 밤', mood: '발 시려워서 안 나감', dark: false,
    atmosphere: 'snow', atmosphereCount: 20,
    bg: '#eef2f7',
    glow: 'radial-gradient(60% 45% at 20% 0%, rgba(214,229,246,0.8) 0%, transparent 72%), radial-gradient(70% 50% at 100% 100%, rgba(226,220,244,0.5) 0%, transparent 70%)',
    surface: '#fbfdff', ink: '#26303b', soft: '#5d6a78', line: 'rgba(38,48,59,0.11)',
    accent: '#3f76ad', accent2: '#8f76b5', board: '#e2eaf3', onAccent: '#fbfdff',
  },
  pastel: {
    id: 'pastel', pair: 'texture', label: '파스텔', name: '부드러운 파스텔', mood: '방울 터뜨리는 게 일', dark: false,
    atmosphere: 'bubble', atmosphereCount: 12,
    bg: '#f4f1fb',
    glow: 'radial-gradient(60% 45% at 20% 0%, rgba(219,212,248,0.75) 0%, transparent 72%), radial-gradient(70% 50% at 100% 100%, rgba(250,214,228,0.5) 0%, transparent 70%)',
    surface: '#fdfcff', ink: '#302a3d', soft: '#6b6479', line: 'rgba(48,42,61,0.1)',
    accent: '#6f5fd8', accent2: '#d1729c', board: '#eae5f7', onAccent: '#fdfcff',
  },
  wood: {
    id: 'wood', pair: 'texture', label: '우드', name: '린넨 공방', mood: '먼지랑 노는 중, 방해 금지', dark: false,
    atmosphere: 'mote', atmosphereCount: 14,
    bg: '#efe6d8',
    glow: 'radial-gradient(60% 45% at 22% 0%, rgba(233,215,188,0.8) 0%, transparent 72%)',
    surface: '#fbf5ea', ink: '#332a20', soft: '#6c5e4d', line: 'rgba(51,42,32,0.14)',
    accent: '#a1663a', accent2: '#6b7f5e', board: '#e3d6c2', onAccent: '#fbf5ea',
  },
};

export const THEME_IDS: ThemeId[] = ['day', 'night', 'indoor', 'outdoor', 'spring', 'winter', 'pastel', 'wood'];

export interface ThemePairDef {
  id: ThemePairId;
  label: string;
  items: [ThemeId, ThemeId];
}

export const THEME_PAIRS: ThemePairDef[] = [
  { id: 'dayNight', label: '낮 / 밤', items: ['day', 'night'] },
  { id: 'inOut', label: '실내 / 야외', items: ['indoor', 'outdoor'] },
  { id: 'season', label: '봄 / 겨울', items: ['spring', 'winter'] },
  { id: 'texture', label: '파스텔 / 우드', items: ['pastel', 'wood'] },
];

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === 'string' && (THEME_IDS as string[]).includes(v);
}

/** 같은 짝에 묶인 두 테마 (홈 화면 테마 버튼에 쓴다) */
export function themePairOf(id: ThemeId): [ThemeId, ThemeId] {
  const pair = THEME_PAIRS.find(p => p.id === THEMES[id].pair);
  return pair ? pair.items : ['day', 'night'];
}

/** v5까지 쓰던 테마 이름을 새 테마로 승계한다 */
const LEGACY_THEMES: Record<string, ThemeId> = { default: 'day', grass: 'outdoor' };

export function migrateThemeId(v: unknown): ThemeId | null {
  if (isThemeId(v)) return v;
  if (typeof v === 'string' && v in LEGACY_THEMES) return LEGACY_THEMES[v];
  return null;
}

/**
 * 테마 토큰을 앱 전역 CSS 변수로 변환한다.
 * 기존 위젯들이 쓰던 --color-* 이름을 그대로 채워서 한 번에 갈아끼운다.
 */
export function themeVars(id: ThemeId): Record<string, string> {
  const t = THEMES[id];
  const onSurfaceLine = t.dark ? 'rgba(255,255,255,0.12)' : 'rgba(47,42,38,0.1)';
  return {
    '--color-background': t.bg,
    '--color-surface': t.surface,
    '--color-surface-bright': t.surface,
    '--color-surface-dim': t.board,
    '--color-surface-container': t.surface,
    '--color-surface-container-low': t.surface,
    '--color-surface-container-high': t.surface,
    '--color-surface-container-highest': t.surface,
    '--color-on-background': t.ink,
    '--color-on-surface': t.ink,
    '--color-outline': t.soft,
    '--color-outline-variant': t.line,
    '--color-primary': t.accent,
    '--color-secondary': t.accent2,
    '--color-tertiary': t.accent2,
    '--color-on-primary': t.onAccent,
    '--color-primary-container': `color-mix(in srgb, ${t.accent} 14%, ${t.surface})`,
    '--color-secondary-container': `color-mix(in srgb, ${t.accent2} 14%, ${t.surface})`,
    '--theme-glow': t.glow,
    '--theme-line': t.line,
    '--theme-grid-line': onSurfaceLine,
    '--board-bg': t.board,
    '--accent-solid': t.accent,
    '--accent-shadow': `color-mix(in srgb, ${t.accent} 30%, transparent)`,
    '--glass-border': t.line,
    '--glass-shadow': t.dark
      ? '0 0.5rem 1.5rem rgba(0, 0, 0, 0.35)'
      : '0 0.5rem 1.5rem rgba(140, 100, 70, 0.1)',
  };
}
