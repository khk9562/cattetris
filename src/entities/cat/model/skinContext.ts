import { createContext, useContext } from 'react';
import type { AccessoryId } from '../config/skins';
import type { CatType } from './types';

export interface EquippedSkins {
  palettes: Partial<Record<CatType, string>>;
  accessory: AccessoryId | null;
}

export const EMPTY_EQUIPPED: EquippedSkins = { palettes: {}, accessory: null };

export const SkinContext = createContext<EquippedSkins>(EMPTY_EQUIPPED);

export function useEquippedSkins(): EquippedSkins {
  return useContext(SkinContext);
}
