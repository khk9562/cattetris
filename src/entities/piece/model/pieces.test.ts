import { describe, expect, it } from 'vitest';
import { TETROMINO_IDS, TETROMINO_SHAPES } from './tetromino';
import { cellBreed, drawBreed, drawBreeds, drawFromBag, makePiece, pieceCellInfo, rotateWithKicks, rotatedPiece, spawnPosition } from './pieces';

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

describe('tetromino shapes with cell ids', () => {
  const mask = (m: number[][]) => m.map(r => r.map(v => (v ? 1 : 0)));

  it('matches the SRS rotation states for T and I', () => {
    expect(mask(TETROMINO_SHAPES.T[1])).toEqual([[0,1,0],[0,1,1],[0,1,0]]);
    expect(mask(TETROMINO_SHAPES.T[2])).toEqual([[0,0,0],[1,1,1],[0,1,0]]);
    expect(mask(TETROMINO_SHAPES.T[3])).toEqual([[0,1,0],[1,1,0],[0,1,0]]);
    expect(mask(TETROMINO_SHAPES.I[1])).toEqual([[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]]);
    expect(mask(TETROMINO_SHAPES.I[2])).toEqual([[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]]);
    expect(mask(TETROMINO_SHAPES.I[3])).toEqual([[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]);
    expect(mask(TETROMINO_SHAPES.S[1])).toEqual([[0,1,0],[0,1,1],[0,0,1]]);
    expect(mask(TETROMINO_SHAPES.L[3])).toEqual([[1,1,0],[0,1,0],[0,1,0]]);
  });

  it('keeps every cell id exactly once in every rotation so breeds follow their cell', () => {
    for (const id of TETROMINO_IDS) {
      for (const rot of TETROMINO_SHAPES[id]) {
        expect(rot.flat().filter(Boolean).sort()).toEqual([1, 2, 3, 4]);
      }
    }
  });
});

describe('drawBreeds', () => {
  it('gives a single breed when mixCells is 0', () => {
    const r = drawBreeds(['ginger', 'black', 'tabby'], null, 0, 0, 5);
    expect(new Set(r.catTypes).size).toBe(1);
    expect(r.catTypes).toHaveLength(4);
  });

  it('puts a different breed on the last cell (3+1) or the last two cells (2+2)', () => {
    for (let seed = 1; seed < 30; seed++) {
      const one = drawBreeds(['ginger', 'black', 'tabby'], null, 0, 1, seed);
      expect(one.catTypes[0]).toBe(one.catTypes[1]);
      expect(one.catTypes[1]).toBe(one.catTypes[2]);
      expect(one.catTypes[3]).not.toBe(one.catTypes[0]);
      const two = drawBreeds(['ginger', 'black', 'tabby'], null, 0, 2, seed);
      expect(two.catTypes[0]).toBe(two.catTypes[1]);
      expect(two.catTypes[2]).toBe(two.catTypes[3]);
      expect(two.catTypes[2]).not.toBe(two.catTypes[0]);
    }
  });

  it('falls back to a single breed when the pool has only one', () => {
    expect(new Set(drawBreeds(['ginger'], null, 0, 2, 3).catTypes).size).toBe(1);
  });
});

describe('pieceCellInfo', () => {
  it('splits a 3+1 piece into a cat with face and tail plus a kitten with its own face', () => {
    const p = makePiece('T', 'ginger', ['ginger', 'ginger', 'ginger', 'black']);
    const cells = pieceCellInfo(p);
    expect(cells).toHaveLength(4);
    const ginger = cells.filter(c => c.type === 'ginger');
    const black = cells.filter(c => c.type === 'black');
    expect(ginger).toHaveLength(3);
    expect(black).toHaveLength(1);
    expect(ginger.filter(c => c.face)).toHaveLength(1);
    expect(ginger.filter(c => c.tail)).toHaveLength(1);
    expect(black[0].face).toBe(true);
    expect(black[0].tail).toBe(false);
    // 다른 품종과는 이어지지 않는다 (T의 아래 오른쪽 칸이 새끼)
    expect(black[0].conn).toEqual({ top: false, right: false, bottom: false, left: false });
    const middle = ginger.find(c => c.x === p.position.x + 1 && c.y === p.position.y + 1)!;
    expect(middle.conn.right).toBe(false);
    expect(middle.conn.top).toBe(true);
  });

  it('keeps the kitten on its cell through rotation', () => {
    let p = makePiece('L', 'ginger', ['ginger', 'ginger', 'ginger', 'black']);
    const before = p.shape.flat().indexOf(4);
    p = rotatedPiece(p, 1);
    expect(cellBreed(p, 4)).toBe('black');
    expect(p.shape.flat().indexOf(4)).not.toBe(before);
    expect(pieceCellInfo(p).filter(c => c.type === 'black')).toHaveLength(1);
  });
});
