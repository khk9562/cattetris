import { describe, expect, it } from 'vitest';
import { createBoard } from '@/entities/board';
import { blinkDelayFor, pickExpression, stackHeight } from './expression';

describe('pickExpression', () => {
  it('prioritises game over, then clear effects, then danger', () => {
    expect(pickExpression({ gameOver: true, danger: true, isActive: false, effect: 'cluster' })).toBe('sleepy');
    expect(pickExpression({ gameOver: false, danger: true, isActive: false, effect: 'cluster' })).toBe('dizzy');
    expect(pickExpression({ gameOver: false, danger: true, isActive: false, effect: 'line' })).toBe('happy');
    expect(pickExpression({ gameOver: false, danger: true, isActive: true })).toBe('idle');
    expect(pickExpression({ gameOver: false, danger: true, isActive: false })).toBe('scared');
    expect(pickExpression({ gameOver: false, danger: false, isActive: false })).toBe('idle');
  });
});

describe('stackHeight', () => {
  it('measures the tallest column', () => {
    const b = createBoard();
    expect(stackHeight(b)).toBe(0);
    b[19][0] = 'black';
    b[5][3] = 'tabby';
    expect(stackHeight(b)).toBe(15);
  });
});

describe('blinkDelayFor', () => {
  it('spreads delays within 0..4 seconds and differs between neighbours', () => {
    const a = blinkDelayFor(0, 0);
    const b = blinkDelayFor(1, 0);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(4);
    expect(a).not.toBe(b);
  });
});
