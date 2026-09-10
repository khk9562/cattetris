import { describe, expect, it } from 'vitest';
import { mergeSettings } from './loadSettings';
import { DEFAULT_SETTINGS } from './types';

describe('mergeSettings', () => {
  it('returns defaults when nothing is stored', () => {
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps stored booleans and validated enums, ignoring junk', () => {
    const s = mergeSettings({ sound: false, difficulty: 'hard', theme: 'nope' as never, ghost: 'yes' as never });
    expect(s.sound).toBe(false);
    expect(s.difficulty).toBe('hard');
    expect(s.theme).toBe('day');
    expect(s.ghost).toBe(true);
  });

  it('inherits legacy theme/difficulty keys only when not stored', () => {
    expect(mergeSettings(null, { theme: 'grass', difficulty: 'normal' })).toMatchObject({ theme: 'outdoor', difficulty: 'normal' });
    expect(mergeSettings({ theme: 'night' }, { theme: 'grass' }).theme).toBe('night');
  });

  it('migrates the v5 theme names to the new ones', () => {
    expect(mergeSettings({ theme: 'default' as never }).theme).toBe('day');
    expect(mergeSettings({ theme: 'grass' as never }).theme).toBe('outdoor');
  });
});
