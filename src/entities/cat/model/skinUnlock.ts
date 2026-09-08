import { ACCESSORIES, CAT_SKINS, SKIN_TIER_THRESHOLDS, type AccessoryId, type SkinDef } from '../config/skins';
import type { CatType } from './types';

export function isSkinUnlocked(skin: SkinDef, destroyedCount: number): boolean {
  if (skin.tier === 0) return true;
  return destroyedCount >= SKIN_TIER_THRESHOLDS[skin.tier];
}

export function unlockedSkinCount(stats: Partial<Record<CatType, number>>): number {
  let n = 0;
  for (const cat of Object.keys(CAT_SKINS) as CatType[]) {
    for (const skin of CAT_SKINS[cat]) if (skin.tier > 0 && isSkinUnlocked(skin, stats[cat] ?? 0)) n++;
  }
  return n;
}

export function isAccessoryUnlocked(id: AccessoryId, totalStars: number): boolean {
  const def = ACCESSORIES.find(a => a.id === id);
  return !!def && totalStars >= def.stars;
}

export function totalSkinCount(): number {
  return Object.values(CAT_SKINS).reduce((a, list) => a + list.filter(s => s.tier > 0).length, 0) + ACCESSORIES.length;
}
