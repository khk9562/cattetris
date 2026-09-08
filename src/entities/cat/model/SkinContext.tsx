import { createContext, useContext, type ReactNode } from 'react';
import type { AccessoryId } from '../config/skins';
import type { CatType } from './types';

export interface EquippedSkins {
  palettes: Partial<Record<CatType, string>>;
  accessory: AccessoryId | null;
}

export const EMPTY_EQUIPPED: EquippedSkins = { palettes: {}, accessory: null };

const SkinContext = createContext<EquippedSkins>(EMPTY_EQUIPPED);

export function SkinProvider({ value, children }: { value: EquippedSkins; children: ReactNode }) {
  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

export function useEquippedSkins(): EquippedSkins {
  return useContext(SkinContext);
}
