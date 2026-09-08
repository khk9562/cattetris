import { useCallback, useMemo, useState } from 'react';
import {
  ACCESSORIES,
  CAT_SKINS,
  EMPTY_EQUIPPED,
  getSkin,
  isAccessoryUnlocked,
  isSkinUnlocked,
  totalSkinCount,
  unlockedSkinCount,
  type AccessoryId,
  type CatType,
  type EquippedSkins,
} from '@/entities/cat';
import { SKINS_KEY } from '@/shared/config';
import { readJson, writeJson } from '@/shared/lib';

interface Inputs {
  /** 품종별 누적 제거 수 (도감 통계) */
  stats: Partial<Record<CatType, number>>;
  /** 스테이지 별 합계 */
  totalStars: number;
}

function load(): EquippedSkins {
  const stored = readJson<Partial<EquippedSkins> | null>(SKINS_KEY, null);
  return { palettes: stored?.palettes ?? {}, accessory: stored?.accessory ?? null };
}

export function useSkins({ stats, totalStars }: Inputs) {
  const [equipped, setEquipped] = useState<EquippedSkins>(load);

  // 해금이 풀리지 않은 장착은 무시한다 (기기 간 이동 등)
  const effective = useMemo<EquippedSkins>(() => {
    const palettes: EquippedSkins['palettes'] = {};
    for (const [cat, id] of Object.entries(equipped.palettes) as [CatType, string][]) {
      const skin = getSkin(cat, id);
      if (skin.tier === 0 || isSkinUnlocked(skin, stats[cat] ?? 0)) palettes[cat] = skin.id;
    }
    const accessory = equipped.accessory && isAccessoryUnlocked(equipped.accessory, totalStars) ? equipped.accessory : null;
    return { palettes, accessory };
  }, [equipped, stats, totalStars]);

  const equipPalette = useCallback((cat: CatType, skinId: string) => {
    setEquipped(prev => {
      const next = { ...prev, palettes: { ...prev.palettes, [cat]: skinId } };
      writeJson(SKINS_KEY, next);
      return next;
    });
  }, []);

  const equipAccessory = useCallback((id: AccessoryId | null) => {
    setEquipped(prev => {
      const next = { ...prev, accessory: prev.accessory === id ? null : id };
      writeJson(SKINS_KEY, next);
      return next;
    });
  }, []);

  const unlocked = unlockedSkinCount(stats) + ACCESSORIES.filter(a => isAccessoryUnlocked(a.id, totalStars)).length;

  return {
    equipped: effective,
    equipPalette,
    equipAccessory,
    unlocked,
    total: totalSkinCount(),
    skinsFor: (cat: CatType) => CAT_SKINS[cat],
  };
}

export type SkinsController = ReturnType<typeof useSkins>;
export { EMPTY_EQUIPPED };
