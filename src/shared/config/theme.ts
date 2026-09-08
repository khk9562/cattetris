export type ThemeId = 'default' | 'grass';
export const THEME_IDS: ThemeId[] = ['default', 'grass'];
export function isThemeId(v: unknown): v is ThemeId {
  return v === 'default' || v === 'grass';
}
