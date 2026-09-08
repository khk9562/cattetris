import { describe, expect, it } from 'vitest';
import { ALL_CAT_TYPES } from '@/entities/cat';
import { DIFFICULTY_PRESETS, gravityIntervalMs } from '@/entities/difficulty';
import { makePiece } from '@/entities/piece';
import type { StageDef, StageLimit } from '@/entities/stage';
import { BOARD_HEIGHT, BOARD_WIDTH, CLEAR_ANIMATION_MS, NEXT_QUEUE_SIZE, SETTLE_MS } from '@/shared/config';
import { createInitialState, engineReducer } from './engine';
import type { EngineState } from './types';

const normal = DIFFICULTY_PRESETS.normal;

function start(seed = 1, preset = normal): EngineState {
  return engineReducer(createInitialState(), { type: 'start', preset, breeds: ALL_CAT_TYPES, seed });
}

function ticks(s: EngineState, totalMs: number, step = 16): EngineState {
  let state = s;
  for (let t = 0; t < totalMs; t += step) state = engineReducer(state, { type: 'tick', dt: step });
  return state;
}

/** 연출 단계를 모두 지나 다음 조각이 나올 때까지 진행 */
function settle(s: EngineState): EngineState {
  let state = s;
  for (let i = 0; i < 20 && state.phase !== 'active'; i++) {
    state = ticks(state, state.phase === 'clearing' ? CLEAR_ANIMATION_MS + 16 : SETTLE_MS + 16);
  }
  return state;
}

describe('start', () => {
  it('spawns a piece, fills the next queue and uses the difficulty start level', () => {
    const s = start();
    expect(s.status).toBe('playing');
    expect(s.current).not.toBeNull();
    expect(s.queue).toHaveLength(NEXT_QUEUE_SIZE);
    expect(s.level).toBe(normal.startLevel);
    expect(s.hold).toBeNull();
  });

  it('is deterministic for the same seed', () => {
    const a = start(99);
    const b = start(99);
    expect(a.current).toEqual(b.current);
    expect(a.queue).toEqual(b.queue);
  });

  it('only uses the starting breed pool', () => {
    const s = start(5);
    const pool = new Set(s.breedOrder.slice(0, normal.breedsStart));
    for (const p of [s.current!, ...s.queue]) expect(pool.has(p.catType)).toBe(true);
  });
});

describe('gravity and lock delay', () => {
  it('moves the piece down one row after the gravity interval', () => {
    const s = start();
    const y0 = s.current!.position.y;
    const interval = gravityIntervalMs(s.level, normal);
    const after = ticks(s, interval + 8, 8);
    expect(after.current!.position.y).toBe(y0 + 1);
  });

  it('locks the piece only after lockDelayMs on the floor', () => {
    let s = engineReducer(start(), { type: 'softDrop' });
    // 바닥까지 소프트 드롭
    for (let i = 0; i < BOARD_HEIGHT; i++) s = engineReducer(s, { type: 'softDrop' });
    const beforeLock = ticks(s, normal.lockDelayMs - 100);
    expect(beforeLock.board.flat().filter(Boolean)).toHaveLength(0);
    const afterLock = ticks(beforeLock, 200);
    expect(afterLock.board.flat().filter(Boolean).length).toBeGreaterThan(0);
  });

  it('resets the lock timer on movement up to the reset limit', () => {
    let s = start();
    for (let i = 0; i < BOARD_HEIGHT; i++) s = engineReducer(s, { type: 'softDrop' });
    s = ticks(s, normal.lockDelayMs - 50);
    s = engineReducer(s, { type: 'move', dx: s.current!.position.x > 0 ? -1 : 1 });
    expect(s.lockMs).toBe(0);
    expect(s.lockResets).toBe(1);
  });
});

describe('hard drop', () => {
  it('drops, scores 2 per row and locks immediately', () => {
    const s = start();
    const dropped = engineReducer(s, { type: 'hardDrop' });
    // 지울 것이 없으면 바로 다음 조각이 나온다
    expect(dropped.board.flat().filter(Boolean)).toHaveLength(4);
    expect(dropped.score).toBeGreaterThan(0);
    expect(dropped.current).not.toBeNull();
    expect(dropped.current).not.toEqual(s.current);
    expect(dropped.queue).toHaveLength(NEXT_QUEUE_SIZE);
  });
});

describe('hold', () => {
  it('stores the current piece and cannot be used twice for one piece', () => {
    const s = start();
    const id = s.current!.id;
    const held = engineReducer(s, { type: 'hold' });
    expect(held.hold!.id).toBe(id);
    expect(held.holdUsed).toBe(true);
    const again = engineReducer(held, { type: 'hold' });
    expect(again).toBe(held);
  });

  it('swaps with the held piece after the next lock', () => {
    let s = engineReducer(start(), { type: 'hold' });
    const heldId = s.hold!.id;
    s = settle(engineReducer(s, { type: 'hardDrop' }));
    const swapped = engineReducer(s, { type: 'hold' });
    expect(swapped.current!.id).toBe(heldId);
  });
});

describe('line clear flow', () => {
  function withFullRowExcept(s: EngineState, gapX: number): EngineState {
    const board = s.board.map(r => [...r]);
    // 뭉치가 만들어지지 않도록 품종을 번갈아 채운다
    for (let x = 0; x < BOARD_WIDTH; x++) if (x !== gapX) board[BOARD_HEIGHT - 1][x] = x % 2 ? 'black' : 'tabby';
    return { ...s, board };
  }

  it('animates, then removes the row, scores by level and counts lines', () => {
    let s = start(3);
    // 현재 조각을 x=gap 위치의 세로 I로 교체
    const I = makePiece('I', 'ginger');
    const vertical = { ...I, shape: I.shapes[1], rotationIndex: 1, position: { x: -2, y: 0 } };
    // shapes[1]은 열 인덱스 2가 채워져 있으므로 x=-2면 보드 x=0에 놓인다
    s = withFullRowExcept({ ...s, current: vertical }, 0);
    s = engineReducer(s, { type: 'hardDrop' });
    expect(s.phase).toBe('clearing');
    expect(s.clearing.filter(c => c.kind === 'line')).toHaveLength(BOARD_WIDTH);
    expect(s.lines).toBe(1);
    expect(s.score).toBeGreaterThanOrEqual(100 * normal.scoreMultiplier);

    const after = settle(s);
    expect(after.phase).toBe('active');
    // I 조각의 남은 3칸이 x=0 열에 세로로 내려앉는다
    expect(after.board[BOARD_HEIGHT - 1].filter(Boolean)).toHaveLength(1);
    expect(after.board[BOARD_HEIGHT - 3][0]).not.toBeNull();
    expect(after.board[BOARD_HEIGHT - 4][0]).toBeNull();
    expect(after.combo).toBe(1);
  });
});

describe('cluster explosion', () => {
  it('explodes a cluster at the threshold together with its 8-neighbour ring and chains', () => {
    let s = start(11);
    const board = s.board.map(r => [...r]);
    // 왼쪽 0~4열을 아래에서부터 채워 정확히 기준 개수만큼의 시암 뭉치를 만든다
    const thr = normal.clusterThreshold;
    for (let i = 0; i < thr; i++) board[BOARD_HEIGHT - 1 - Math.floor(i / 5)][i % 5] = 'siamese';
    const rows = Math.ceil(thr / 5);
    // 폭발 여파 대상: 뭉치 오른쪽에 붙은 5열
    board[BOARD_HEIGHT - 1][5] = 'black';
    board[BOARD_HEIGHT - rows][5] = 'black';
    // 여파 밖 셀
    board[BOARD_HEIGHT - 1][8] = 'tabby';
    board[BOARD_HEIGHT - 3][8] = 'tabby';
    s = { ...s, board, current: null };
    // 직접 판정 단계로 진입시키기 위해 settling 단계에서 tick
    s = { ...s, phase: 'settling', phaseMs: 0 };
    s = ticks(s, SETTLE_MS + 16);
    expect(s.phase).toBe('clearing');
    expect(s.clearing.filter(c => c.kind === 'cluster')).toHaveLength(thr);
    expect(s.clearing.filter(c => c.kind === 'splash')).toHaveLength(2);
    expect(s.stats.explosions).toBe(1);

    const after = settle(s);
    expect(after.board[BOARD_HEIGHT - 1][0]).toBeNull();
    expect(after.board[BOARD_HEIGHT - 1][5]).toBeNull();
    expect(after.board[BOARD_HEIGHT - 1][8]).toBe('tabby');
    expect(after.board[BOARD_HEIGHT - 2][8]).toBe('tabby'); // 중력으로 한 칸 내려옴
    expect(after.destroyed.siamese).toBe(thr);
    expect(after.destroyed.black).toBe(2);
  });
});

describe('game over', () => {
  it('ends the game when the spawn position is blocked', () => {
    let s = start(2);
    const board = s.board.map(r => [...r]);
    for (let y = 0; y < BOARD_HEIGHT; y++) for (let x = 3; x < 7; x++) board[y][x] = (x + y) % 2 ? 'black' : 'tabby';
    s = { ...s, board };
    const over = engineReducer(s, { type: 'hardDrop' });
    expect(over.status).toBe('gameover');
  });
});

describe('pause', () => {
  it('freezes ticks while paused', () => {
    const s = engineReducer(start(), { type: 'pause' });
    const later = ticks(s, 2000);
    expect(later.current).toEqual(s.current);
    expect(later.elapsedMs).toBe(s.elapsedMs);
    expect(engineReducer(later, { type: 'resume' }).status).toBe('playing');
  });
});

describe('stage mode', () => {
  const stage: StageDef = {
    id: 99,
    title: 'test',
    goals: [{ type: 'lines', count: 1 }],
    limit: { type: 'pieces', count: 2 },
    preset: { clusterThreshold: 99 },
  };

  function startStage(limit: StageLimit = stage.limit, goals = stage.goals) {
    return engineReducer(createInitialState(), { type: 'start', preset: normal, breeds: ALL_CAT_TYPES, seed: 4, stage: { ...stage, limit, goals } });
  }

  it('applies the stage preset overrides and mode', () => {
    const s = startStage();
    expect(s.mode).toBe('stage');
    expect(s.preset.clusterThreshold).toBe(99);
    expect(s.stage?.id).toBe(99);
  });

  it('fails when the piece limit runs out before the goal', () => {
    let s = startStage();
    s = engineReducer(s, { type: 'hardDrop' });
    expect(s.status).toBe('playing');
    expect(s.piecesPlaced).toBe(1);
    s = engineReducer(s, { type: 'hardDrop' });
    expect(s.status).toBe('gameover');
  });

  it('clears the stage when goals are met', () => {
    let s = startStage({ type: 'pieces', count: 50 });
    const board = s.board.map(r => [...r]);
    for (let x = 1; x < BOARD_WIDTH; x++) board[BOARD_HEIGHT - 1][x] = x % 2 ? 'black' : 'tabby';
    const I = makePiece('I', 'ginger');
    s = { ...s, board, current: { ...I, shape: I.shapes[1], rotationIndex: 1, position: { x: -2, y: 0 } } };
    s = settle(engineReducer(s, { type: 'hardDrop' }));
    expect(s.status).toBe('cleared');
    expect(s.lines).toBe(1);
  });

  it('ends a timed stage when the clock runs out', () => {
    let s = startStage({ type: 'seconds', count: 1 });
    s = ticks(s, 1100, 50);
    expect(s.status).toBe('gameover');
  });
});
