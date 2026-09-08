import { describe, expect, it } from 'vitest';
import { TETROMINO_IDS } from './tetromino';
import { drawBreed, drawFromBag, makePiece, rotateWithKicks, rotatedPiece, spawnPosition } from './pieces';

describe('drawFromBag', () => {
  it('hands out all seven tetrominoes before repeating any', () => {
    let bag: ReturnType<typeof drawFromBag>['bag'] = [];
    let seed = 42;
    const seen: string[] = [];
    for (let i = 0; i < 7; i++) {
      const r = drawFromBag(bag, seed);
      bag = r.bag;
      seed = r.seed;
      seen.push(r.id);
    }
    expect([...seen].sort()).toEqual([...TETROMINO_IDS].sort());
    expect(bag).toHaveLength(0);
  });

  it('is deterministic for the same seed', () => {
    const a = drawFromBag([], 7);
    const b = drawFromBag([], 7);
    expect(a.id).toBe(b.id);
    expect(a.bag).toEqual(b.bag);
  });
});

describe('drawBreed', () => {
  it('only returns breeds from the pool', () => {
    let seed = 1;
    for (let i = 0; i < 50; i++) {
      const r = drawBreed(['ginger', 'black'], null, 0, seed);
      seed = r.seed;
      expect(['ginger', 'black']).toContain(r.catType);
    }
  });

  it('always repeats the previous breed when repeatChance is 1', () => {
    const r = drawBreed(['ginger', 'black', 'tabby'], 'tabby', 1, 3);
    expect(r.catType).toBe('tabby');
  });
});

describe('rotation', () => {
  it('cycles back to the spawn state after four clockwise rotations', () => {
    let p = makePiece('T', 'ginger');
    for (let i = 0; i < 4; i++) p = rotatedPiece(p, 1);
    expect(p.rotationIndex).toBe(0);
  });

  it('kicks the piece away from a wall instead of failing', () => {
    // T piece in R state flush against the left wall; rotating to 2 needs a kick.
    const p = { ...makePiece('T', 'ginger'), position: { x: -1, y: 5 } };
    const r = rotateWithKicks(rotatedPiece(p, 1), 1, cand =>
      cand.shape.every(row => row.every((c, rx) => !c || cand.position.x + rx >= 0)),
    );
    expect(r).not.toBeNull();
    expect(r!.rotationIndex).toBe(2);
    expect(r!.position.x).toBeGreaterThanOrEqual(0);
  });

  it('returns null when every kick collides', () => {
    const p = makePiece('I', 'ginger');
    expect(rotateWithKicks(p, 1, () => false)).toBeNull();
  });
});

describe('spawnPosition', () => {
  it('lifts the piece so its first filled row sits on row 0', () => {
    expect(spawnPosition([[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]).y).toBe(-1);
    expect(spawnPosition([[1,1],[1,1]])).toEqual({ x: 4, y: 0 });
  });
});
