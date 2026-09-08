import { describe, expect, it } from 'vitest';
import { createPiece, rotatePiece } from './pieces';

describe('rotatePiece', () => {
  it('cycles through four rotation states and back', () => {
    const p = createPiece();
    let r = p;
    for (let i = 0; i < 4; i++) r = rotatePiece(r);
    expect(r.rotationIndex).toBe(0);
    expect(r.shape).toEqual(p.shape);
  });

  it('rotates counter-clockwise with direction -1', () => {
    const p = createPiece();
    expect(rotatePiece(p, -1).rotationIndex).toBe(3);
  });
});

describe('createPiece', () => {
  it('spawns horizontally centred at the top', () => {
    const p = createPiece();
    expect(p.position.y).toBe(0);
    expect(p.position.x).toBe(Math.floor((10 - p.shape[0].length) / 2));
  });
});
