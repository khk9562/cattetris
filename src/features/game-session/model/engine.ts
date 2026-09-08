import {
  applyGravity,
  clearMatches,
  countByType,
  createBoard,
  findClusters,
  getCompletedRows,
  getGhostPosition,
  getSplashCells,
  isValidPosition,
  pieceCells,
  placePiece,
  type Board,
  type Position,
} from '@/entities/board';
import type { CatType } from '@/entities/cat';
import { drawBreed, drawFromBag, makePiece, movedPiece, resetPiece, rotateWithKicks, type ActivePiece } from '@/entities/piece';
import { DIFFICULTY_PRESETS, breedCountForLevel, gravityIntervalMs, type DifficultyPreset } from '@/entities/difficulty';
import { isLimitExhausted, isStageCleared, type StageProgressInput } from '@/entities/stage';
import {
  CHAIN_STEP_MULTIPLIER,
  CLEAR_ANIMATION_MS,
  CLUSTER_CELL_SCORE,
  COMBO_SCORE,
  HARD_DROP_SCORE,
  LINES_PER_LEVEL,
  LINE_SCORE,
  NEXT_QUEUE_SIZE,
  POPUP_MS,
  SETTLE_MS,
  SOFT_DROP_SCORE,
  SPLASH_CELL_SCORE,
} from '@/shared/config';
import { nextRandom } from '@/shared/lib';
import type { ClearCell, EngineAction, EngineState, FeedbackKind, PopupKind } from './types';

export function createInitialState(preset: DifficultyPreset = DIFFICULTY_PRESETS.normal): EngineState {
  return {
    status: 'ready',
    phase: 'active',
    mode: 'endless',
    stage: null,
    piecesPlaced: 0,
    scripted: [],
    preset,
    breedOrder: [],
    board: createBoard(),
    current: null,
    queue: [],
    hold: null,
    holdUsed: false,
    bag: [],
    seed: 1,
    lastBreed: null,
    score: 0,
    level: preset.startLevel,
    lines: 0,
    combo: 0,
    chain: 0,
    clearedThisPiece: false,
    elapsedMs: 0,
    gravityMs: 0,
    lockMs: 0,
    lockResets: 0,
    lowestY: 0,
    phaseMs: 0,
    clearing: [],
    lastLocked: null,
    pieceUid: 0,
    popups: [],
    popupSeq: 0,
    events: [],
    eventSeq: 0,
    destroyed: {},
    stats: { maxChain: 0, explosions: 0, linesCleared: 0 },
  };
}

// ---------- helpers (모두 새 객체를 돌려주는 순수 함수) ----------

function withFeedback(s: EngineState, kind: FeedbackKind, strength?: number): EngineState {
  const seq = s.eventSeq + 1;
  const events = [...s.events, { seq, kind, strength }].slice(-8);
  return { ...s, events, eventSeq: seq };
}

function withPopup(s: EngineState, x: number, y: number, text: string, kind: PopupKind): EngineState {
  const id = s.popupSeq + 1;
  return { ...s, popupSeq: id, popups: [...s.popups, { id, x, y, text, kind, bornAt: s.elapsedMs }] };
}

function breedPool(s: EngineState): CatType[] {
  return s.breedOrder.slice(0, breedCountForLevel(s.level, s.preset));
}

function shuffle<T>(items: T[], seed: number): { items: T[]; seed: number } {
  const arr = [...items];
  let sd = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    const r = nextRandom(sd);
    sd = r.seed;
    const j = Math.floor(r.value * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { items: arr, seed: sd };
}

function drawPiece(s: EngineState): { piece: ActivePiece; state: EngineState } {
  const b = drawFromBag(s.bag, s.seed);
  const c = drawBreed(breedPool(s), s.lastBreed, s.preset.breedRepeatChance, b.seed);
  const piece = makePiece(b.id, c.catType);
  return { piece, state: { ...s, bag: b.bag, seed: c.seed, lastBreed: c.catType } };
}

function refillQueue(s: EngineState): EngineState {
  let state = s;
  const queue = [...s.queue];
  const scripted = [...s.scripted];
  let pieceUid = state.pieceUid;
  while (queue.length < NEXT_QUEUE_SIZE) {
    const next = scripted.shift();
    if (next) {
      queue.push({ ...makePiece(next.id, next.catType), uid: ++pieceUid });
      state = { ...state, lastBreed: next.catType };
      continue;
    }
    const d = drawPiece(state);
    queue.push({ ...d.piece, uid: ++pieceUid });
    state = d.state;
  }
  return { ...state, queue, scripted, pieceUid };
}

function gameOver(s: EngineState): EngineState {
  return withFeedback({ ...s, status: 'gameover', current: null, clearing: [], phase: 'active' }, 'gameover');
}

function activate(s: EngineState, piece: ActivePiece): EngineState {
  // 스폰 위치가 막혀 있으면 한 칸 위를 시도하고, 그래도 막히면 게임 오버(block out)
  let p = piece;
  if (!isValidPosition(s.board, p)) {
    p = movedPiece(p, 0, -1);
    // 한 칸 위로도 못 들어가거나, 보이는 영역에 한 칸도 못 걸치면 게임 오버
    if (!isValidPosition(s.board, p) || pieceCells(p).every(c => c.y < 0)) return gameOver(s);
  }
  return {
    ...s,
    phase: 'active',
    current: p,
    gravityMs: 0,
    lockMs: 0,
    lockResets: 0,
    lowestY: p.position.y,
    chain: 0,
    clearedThisPiece: false,
  };
}

function spawnNext(s: EngineState): EngineState {
  const [next, ...rest] = s.queue;
  const state = refillQueue({ ...s, queue: rest, holdUsed: false });
  return activate(state, next);
}

function isGrounded(board: Board, piece: ActivePiece): boolean {
  return !isValidPosition(board, movedPiece(piece, 0, 1));
}

/** 이동/회전 성공 시 락 딜레이 리셋 규칙 적용 */
function afterSuccessfulMove(s: EngineState, piece: ActivePiece): EngineState {
  let { lockMs, lockResets, lowestY } = s;
  if (piece.position.y > lowestY) {
    lowestY = piece.position.y;
    lockResets = 0;
    lockMs = 0;
  } else if (lockMs > 0 && lockResets < s.preset.lockResetLimit) {
    lockMs = 0;
    lockResets += 1;
  }
  return { ...s, current: piece, lockMs, lockResets, lowestY };
}

export function progressInput(s: EngineState): StageProgressInput {
  return {
    lines: s.lines,
    explosions: s.stats.explosions,
    destroyed: s.destroyed,
    maxChain: s.stats.maxChain,
    score: s.score,
    piecesPlaced: s.piecesPlaced,
    elapsedMs: s.elapsedMs,
  };
}

function stageCleared(s: EngineState): EngineState {
  return withFeedback({ ...s, status: 'cleared', current: null, clearing: [], phase: 'active' }, 'cleared');
}

/** 조각 하나가 완전히 정착한 뒤 스테이지 목표/제한을 판정한다 */
function checkStage(s: EngineState): EngineState | null {
  if (s.mode !== 'stage' || !s.stage) return null;
  const p = progressInput(s);
  if (isStageCleared(s.stage, p)) return stageCleared(s);
  if (isLimitExhausted(s.stage.limit, p)) return gameOver(s);
  return null;
}

function levelFor(lines: number, preset: DifficultyPreset): number {
  return preset.startLevel + Math.floor(lines / LINES_PER_LEVEL);
}

function centroid(cells: Position[]): Position {
  const n = cells.length || 1;
  return {
    x: cells.reduce((a, c) => a + c.x, 0) / n,
    y: cells.reduce((a, c) => a + c.y, 0) / n,
  };
}

/** 줄과 뭉치를 판정해 제거 연출 단계로 들어가거나, 없으면 다음 조각을 낸다. */
function evaluate(s: EngineState, chain: number): EngineState {
  const lines = getCompletedRows(s.board);
  const clusters = findClusters(s.board, s.preset.clusterThreshold);
  if (lines.length === 0 && clusters.length === 0) return finishPiece(s);

  const marked = new Map<string, ClearCell>();
  const key = (c: Position) => `${c.x},${c.y}`;

  let clusterCells = 0;
  let splashCells = 0;
  for (const cluster of clusters) {
    for (const c of cluster.cells) marked.set(key(c), { ...c, kind: 'cluster' });
    clusterCells += cluster.cells.length;
  }
  for (const cluster of clusters) {
    for (const c of getSplashCells(s.board, cluster.cells)) {
      if (!marked.has(key(c))) {
        marked.set(key(c), { ...c, kind: 'splash' });
        splashCells += 1;
      }
    }
  }
  for (const y of lines) {
    for (let x = 0; x < s.board[y].length; x++) {
      const k = `${x},${y}`;
      if (!marked.has(k)) marked.set(k, { x, y, kind: 'line' });
    }
  }

  const level = s.level;
  const lineBase = lines.length === 0 ? 0 : lines.length <= 4 ? LINE_SCORE[lines.length] : LINE_SCORE[4] + 400 * (lines.length - 4);
  const clusterBase = clusterCells * CLUSTER_CELL_SCORE + splashCells * SPLASH_CELL_SCORE;
  const chainMultiplier = 1 + CHAIN_STEP_MULTIPLIER * chain;
  const gained = Math.round((lineBase + clusterBase) * level * chainMultiplier * s.preset.scoreMultiplier);

  let state: EngineState = {
    ...s,
    phase: 'clearing',
    phaseMs: 0,
    chain,
    clearing: [...marked.values()],
    clearedThisPiece: true,
    score: s.score + gained,
    stats: {
      ...s.stats,
      maxChain: Math.max(s.stats.maxChain, chain),
      explosions: s.stats.explosions + clusters.length,
      linesCleared: s.stats.linesCleared + lines.length,
    },
  };

  // 팝업: 뭉치별 폭발 텍스트, 줄 삭제 텍스트, 연쇄 텍스트
  for (const cluster of clusters) {
    const c = centroid(cluster.cells);
    // 보드 가장자리에서 글자가 잘리지 않도록 가로 위치를 안쪽으로 제한
    state = withPopup(state, Math.min(7, Math.max(2, c.x)), Math.min(17, Math.max(2, c.y)), `팡! ${cluster.cells.length}마리`, 'cluster');
  }
  if (lines.length > 0) {
    const label = lines.length >= 4 ? '4줄 클리어!' : `${lines.length}줄`;
    state = withPopup(state, 4.5, lines[Math.floor(lines.length / 2)], label, 'line');
  }
  if (chain > 0) {
    state = withPopup(state, 4.5, 6, `${chain + 1}연쇄!`, 'chain');
  }
  state = withPopup(state, 4.5, 9, `+${gained.toLocaleString()}`, clusters.length > 0 ? 'cluster' : 'line');

  // 레벨 상승
  const newLines = s.lines + lines.length;
  const newLevel = levelFor(newLines, s.preset);
  state = { ...state, lines: newLines, level: newLevel };
  if (clusters.length > 0) state = withFeedback(state, 'explode', clusterCells + splashCells);
  if (lines.length > 0) state = withFeedback(state, 'line', lines.length);
  if (chain > 0) state = withFeedback(state, 'chain', chain);
  if (newLevel > s.level) {
    state = withPopup(state, 4.5, 12, `LEVEL ${newLevel}`, 'level');
    state = withFeedback(state, 'levelup', newLevel);
  }

  return state;
}

/** 제거 연출이 끝난 뒤 실제로 셀을 지우고 중력을 적용한다. */
function applyClear(s: EngineState): EngineState {
  const counts = countByType(s.board, s.clearing);
  const destroyed = { ...s.destroyed };
  for (const [t, n] of Object.entries(counts) as [CatType, number][]) destroyed[t] = (destroyed[t] ?? 0) + n;
  const removed = clearMatches(s.board, s.clearing);
  const { newBoard } = applyGravity(removed);
  return { ...s, board: newBoard, destroyed, clearing: [], phase: 'settling', phaseMs: 0 };
}

function finishPiece(s: EngineState): EngineState {
  let state = s;
  if (s.clearedThisPiece) {
    const combo = s.combo + 1;
    state = { ...state, combo };
    if (combo >= 2) {
      const bonus = Math.round(COMBO_SCORE * (combo - 1) * s.level * s.preset.scoreMultiplier);
      state = withPopup(withFeedback({ ...state, score: state.score + bonus }, 'combo', combo), 4.5, 3, `콤보 x${combo}`, 'combo');
    }
  } else {
    state = { ...state, combo: 0 };
  }
  state = { ...state, chain: 0 };
  return checkStage(state) ?? spawnNext(state);
}

function lockPiece(s: EngineState): EngineState {
  const piece = s.current;
  if (!piece) return s;
  // lock out: 조각 전체가 보이는 영역 위에서 고정되면 게임 오버
  if (pieceCells(piece).every(c => c.y < 0)) return gameOver({ ...s, board: placePiece(s.board, piece) });
  const cells = pieceCells(piece).filter(c => c.y >= 0);
  const state = withFeedback(
    {
      ...s,
      board: placePiece(s.board, piece),
      current: null,
      lockMs: 0,
      piecesPlaced: s.piecesPlaced + 1,
      lastLocked: { cells, seq: (s.lastLocked?.seq ?? 0) + 1 },
    },
    'lock',
  );
  return evaluate(state, 0);
}

// ---------- reducer ----------

export function engineReducer(s: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case 'start': {
      const stage = action.stage ?? null;
      const preset: DifficultyPreset = { ...action.preset, ...(stage?.preset ?? {}), ...(action.presetOverride ?? {}) };
      const base = createInitialState(preset);
      const order = stage?.breeds ? { items: stage.breeds, seed: action.seed } : shuffle(action.breeds, action.seed);
      let state: EngineState = {
        ...base,
        // 이벤트 번호는 판이 바뀌어도 이어져야 소리/진동 훅이 새 판의 이벤트를 놓치지 않는다
        eventSeq: s.eventSeq,
        status: 'playing',
        seed: order.seed,
        breedOrder: order.items,
        mode: action.mode ?? (stage ? 'stage' : 'endless'),
        stage,
        board: action.setup?.board ? action.setup.board.map(r => [...r]) : base.board,
        scripted: action.setup?.pieces ? [...action.setup.pieces] : [],
      };
      state = refillQueue(withFeedback(state, 'start'));
      return spawnNext(state);
    }

    case 'pause':
      return s.status === 'playing' ? { ...s, status: 'paused' } : s;

    case 'resume':
      return s.status === 'paused' ? { ...s, status: 'playing' } : s;

    case 'home':
      return { ...createInitialState(s.preset), eventSeq: s.eventSeq };

    case 'tick':
      return tick(s, action.dt);

    case 'move': {
      if (!canAct(s)) return s;
      const moved = movedPiece(s.current!, action.dx, 0);
      if (!isValidPosition(s.board, moved)) return s;
      return afterSuccessfulMove(withFeedback(s, 'move'), moved);
    }

    case 'rotate': {
      if (!canAct(s)) return s;
      const rotated = rotateWithKicks(s.current!, action.direction, p => isValidPosition(s.board, p));
      if (!rotated) return s;
      return afterSuccessfulMove(withFeedback(s, 'rotate'), rotated);
    }

    case 'softDrop': {
      if (!canAct(s)) return s;
      const moved = movedPiece(s.current!, 0, 1);
      if (!isValidPosition(s.board, moved)) return s;
      return afterSuccessfulMove(withFeedback({ ...s, gravityMs: 0, score: s.score + SOFT_DROP_SCORE }, 'softDrop'), moved);
    }

    case 'hardDrop': {
      if (!canAct(s)) return s;
      const ghost = getGhostPosition(s.board, s.current!);
      const distance = ghost.position.y - s.current!.position.y;
      const state = withFeedback({ ...s, current: ghost, score: s.score + distance * HARD_DROP_SCORE }, 'hardDrop');
      return lockPiece(state);
    }

    case 'hold': {
      if (!canAct(s) || s.holdUsed) return s;
      const stored = resetPiece(s.current!);
      const state = withFeedback({ ...s, hold: stored, holdUsed: true, current: null }, 'hold');
      if (s.hold) {
        return { ...activate(state, resetPiece(s.hold)), holdUsed: true };
      }
      return { ...spawnNext(state), holdUsed: true };
    }

    default:
      return s;
  }
}

function canAct(s: EngineState): boolean {
  return s.status === 'playing' && s.phase === 'active' && s.current !== null;
}

function tick(s: EngineState, dt: number): EngineState {
  if (s.status !== 'playing') return s;
  const elapsedMs = s.elapsedMs + dt;
  const state: EngineState = {
    ...s,
    elapsedMs,
    popups: s.popups.length ? s.popups.filter(p => elapsedMs - p.bornAt < POPUP_MS) : s.popups,
  };

  if (state.phase === 'clearing') {
    const phaseMs = state.phaseMs + dt;
    if (phaseMs < CLEAR_ANIMATION_MS) return { ...state, phaseMs };
    return applyClear(state);
  }

  if (state.phase === 'settling') {
    const phaseMs = state.phaseMs + dt;
    if (phaseMs < SETTLE_MS) return { ...state, phaseMs };
    return evaluate({ ...state, phaseMs: 0 }, state.chain + 1);
  }

  // phase === 'active'
  if (!state.current) return state;
  if (state.mode === 'stage' && state.stage?.limit.type === 'seconds' && isLimitExhausted(state.stage.limit, progressInput(state))) {
    return isStageCleared(state.stage, progressInput(state)) ? stageCleared(state) : gameOver(state);
  }
  const interval = gravityIntervalMs(state.level, state.preset);
  let gravityMs = state.gravityMs + dt;
  let piece = state.current;
  let lowestY = state.lowestY;
  let lockResets = state.lockResets;
  let lockMs = state.lockMs;

  while (gravityMs >= interval) {
    gravityMs -= interval;
    const moved = movedPiece(piece, 0, 1);
    if (!isValidPosition(state.board, moved)) {
      gravityMs = 0;
      break;
    }
    piece = moved;
    if (piece.position.y > lowestY) {
      lowestY = piece.position.y;
      lockResets = 0;
      lockMs = 0;
    }
  }

  if (isGrounded(state.board, piece)) {
    lockMs += dt;
    if (lockMs >= state.preset.lockDelayMs) {
      return lockPiece({ ...state, current: piece, gravityMs, lowestY, lockResets, lockMs });
    }
  } else {
    lockMs = 0;
  }

  return { ...state, current: piece, gravityMs, lowestY, lockResets, lockMs };
}

export function selectGhost(s: EngineState): ActivePiece | null {
  return s.current ? getGhostPosition(s.board, s.current) : null;
}
