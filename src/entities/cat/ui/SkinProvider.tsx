import type { ReactNode } from 'react';
import { SkinContext, type EquippedSkins } from '../model/skinContext';

export default function SkinProvider({ value, children }: { value: EquippedSkins; children: ReactNode }) {
  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}
