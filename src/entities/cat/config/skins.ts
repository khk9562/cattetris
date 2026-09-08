import type { CatType } from '../model/types';

/** CatBlock CSS 변수에 대응하는 팔레트. 생략한 값은 품종 기본값을 쓴다 */
export interface Palette {
  base: string;
  pattern: string;
  pattern2?: string;
  ear?: string;
  ear2?: string;
  tail?: string;
  eye?: string;
  eyeRight?: string;
}

export interface SkinDef {
  id: string;
  name: string;
  /** 해금 단계: 0 기본, 1 도감 등록(500마리), 2 2,000마리 */
  tier: 0 | 1 | 2;
  palette?: Palette;
}

export const DEFAULT_SKIN_ID = 'default';

const alt = (id: string, name: string, tier: 1 | 2, palette: Palette): SkinDef => ({ id, name, tier, palette });
const base: SkinDef = { id: DEFAULT_SKIN_ID, name: '기본', tier: 0 };

export const CAT_SKINS: Record<CatType, SkinDef[]> = {
  ginger: [base, alt('cream', '크림 치즈', 1, { base: '#f6d9a8', pattern: '#e0b070' }), alt('flame', '불꽃', 2, { base: '#ff7a1a', pattern: '#b23a00', eye: '#ffe082' })],
  tuxedo: [base, alt('grey', '회색 턱시도', 1, { base: '#5a5f6a', pattern: '#f4f4f4' }), alt('choco', '초콜릿', 2, { base: '#4a2c1a', pattern: '#f7e6c8', eye: '#8fd3ff' })],
  russianBlue: [base, alt('lilac', '라일락', 1, { base: '#b7a6c9', pattern: '#b7a6c9', eye: '#ffd54f' }), alt('midnight', '미드나잇', 2, { base: '#4a5a7a', pattern: '#4a5a7a', eye: '#a5ffb8' })],
  calico: [base, alt('dilute', '딜루트', 1, { base: '#ffffff', pattern: '#f2c48d', pattern2: '#9aa3ad' }), alt('sunset', '노을', 2, { base: '#fff3e0', pattern: '#ff6f61', pattern2: '#5d4037', eye: '#4fc3f7' })],
  siamese: [base, alt('blue', '블루 포인트', 1, { base: '#eef2f7', pattern: '#5a6f8f' }), alt('flamePoint', '플레임 포인트', 2, { base: '#fff4e6', pattern: '#e07a2a', eye: '#4fa8f0' })],
  black: [base, alt('smoke', '스모크', 1, { base: '#5c5c66', pattern: '#5c5c66', eye: '#ffb74d' }), alt('void', '보이드', 2, { base: '#15151c', pattern: '#15151c', eye: '#ff5252' })],
  tabby: [base, alt('silver', '실버 고등어', 1, { base: '#d6d3cf', pattern: '#6b6b6b' }), alt('red', '레드 고등어', 2, { base: '#e9a878', pattern: '#a8451a', eye: '#7bd389' })],
  darkTabby: [base, alt('blue', '블루 태비', 1, { base: '#7a8aa3', pattern: '#3e4a63', eye: '#ffe082' }), alt('ember', '엠버', 2, { base: '#4a3f3a', pattern: '#1f1a18', eye: '#ff8a3d' })],
  white: [base, alt('snow', '설원', 1, { base: '#f4f9ff', pattern: '#dfe9f5', pattern2: '#bcd9f5', ear: '#e9f1fa', eye: '#7fb8ff', eyeRight: '#7fb8ff' }), alt('gold', '골드', 2, { base: '#fff8e1', pattern: '#ffe0a3', pattern2: '#ffc87a', ear: '#fff0c2', eye: '#f0b429', eyeRight: '#4fa8f0' })],
  tortie: [base, alt('dilute', '딜루트 카오스', 1, { base: '#6e6a75', pattern: '#f2c48d', pattern2: '#ffe0b2', ear: '#f2c48d', ear2: '#6e6a75' }), alt('blaze', '블레이즈', 2, { base: '#1b1412', pattern: '#ff8f00', pattern2: '#ffd54f', ear: '#ff8f00', ear2: '#1b1412', eye: '#80deea' })],
  bengal: [base, alt('snow', '스노우 벵갈', 1, { base: '#f1eadb', pattern: '#5c4a3d', pattern2: '#c9b8a4', eye: '#4fa8f0' }), alt('charcoal', '차콜 벵갈', 2, { base: '#8b8378', pattern: '#1f1b18', pattern2: '#5f574f', eye: '#c5e1a5' })],
  scottishFold: [base, alt('cream', '크림', 1, { base: '#eadcc4', pattern: '#d4c2a5', ear: '#d4c2a5' }), alt('blue', '블루', 2, { base: '#9aa4b2', pattern: '#7d8794', ear: '#7d8794', eye: '#ffb74d' })],
};

/** 스킨 팔레트 해금에 필요한 누적 제거 수 */
export const SKIN_TIER_THRESHOLDS: Record<1 | 2, number> = { 1: 500, 2: 2000 };

export type AccessoryId = 'ribbon' | 'bell' | 'glasses' | 'crown';

export interface AccessoryDef {
  id: AccessoryId;
  name: string;
  /** 필요한 스테이지 별 합계 */
  stars: number;
}

export const ACCESSORIES: AccessoryDef[] = [
  { id: 'ribbon', name: '리본', stars: 10 },
  { id: 'bell', name: '방울 목걸이', stars: 30 },
  { id: 'glasses', name: '동그란 안경', stars: 60 },
  { id: 'crown', name: '왕관', stars: 90 },
];

export function getSkin(catType: CatType, skinId: string | undefined): SkinDef {
  return CAT_SKINS[catType].find(s => s.id === skinId) ?? CAT_SKINS[catType][0];
}

/** 팔레트를 CatBlock의 CSS 변수 객체로 변환 */
export function paletteVars(p: Palette | undefined): Record<string, string> {
  if (!p) return {};
  const vars: Record<string, string> = { '--fur-base': p.base, '--fur-pattern': p.pattern };
  if (p.pattern2) vars['--fur-pattern2'] = p.pattern2;
  if (p.ear) vars['--fur-ear'] = p.ear;
  if (p.ear2) vars['--fur-ear2'] = p.ear2;
  if (p.tail) vars['--fur-tail'] = p.tail;
  if (p.eye) vars['--eye'] = p.eye;
  if (p.eyeRight) vars['--eye-right'] = p.eyeRight;
  return vars;
}
