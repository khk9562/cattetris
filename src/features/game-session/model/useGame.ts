import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ALL_CAT_TYPES, type CatType } from '@/entities/cat';
import { DIFFICULTY_PRESETS, type DifficultyId } from '@/entities/difficulty';
import { STAGES, starsFor, type StageDef } from '@/entities/stage';
import { HIGH_SCORE_KEY, STAGES_KEY, STATS_KEY } from '@/shared/config';
import { randomSeed, readJson, readNumber, writeJson, writeNumber } from '@/shared/lib';
import { createInitialState, engineReducer, progressInput, selectGhost } from './engine';
import type { EngineState, FeedbackKind } from './types';

type HighScores = Record<DifficultyId, number>;
type Stats = Partial<Record<CatType, number>>;
/** 스테이지 id -> 별 개수 */
export type StageStars = Record<number, 1 | 2 | 3>;

function highScoreKey(id: DifficultyId): string {
  return `${HIGH_SCORE_KEY}_${id}`;
}

function loadHighScores(): HighScores {
  // 예전 단일 키(cattetris_highscore)는 '중' 난이도 기록으로 승계한다.
  const legacy = readNumber(HIGH_SCORE_KEY, 0);
  return {
    easy: readNumber(highScoreKey('easy'), 0),
    normal: Math.max(readNumber(highScoreKey('normal'), 0), legacy),
    hard: readNumber(highScoreKey('hard'), 0),
  };
}

const VIBRATION: Partial<Record<FeedbackKind, number | number[]>> = {
  lock: 8,
  hardDrop: 15,
  line: 30,
  explode: [40, 30, 60],
  chain: [20, 20, 40],
  hold: 10,
  levelup: [20, 40, 20],
  gameover: [80, 60, 120],
  cleared: [30, 40, 30, 40, 80],
};

function vibrate(kind: FeedbackKind) {
  const pattern = VIBRATION[kind];
  if (!pattern) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // 지원하지 않는 브라우저
  }
}

/** 탭 전환 등으로 프레임이 크게 밀렸을 때 한 번에 처리할 최대 시간 */
const MAX_FRAME_MS = 50;

export interface UseGameOptions {
  difficulty: DifficultyId;
  vibration: boolean;
}

export function useGame({ difficulty, vibration }: UseGameOptions) {
  const [highScores, setHighScores] = useState<HighScores>(loadHighScores);
  const [stats, setStats] = useState<Stats>(() => readJson<Stats>(STATS_KEY, {}));
  const [stageStars, setStageStars] = useState<StageStars>(() => readJson<StageStars>(STAGES_KEY, {}));
  const [lastStars, setLastStars] = useState<1 | 2 | 3 | null>(null);
  const [state, dispatch] = useReducer(engineReducer, DIFFICULTY_PRESETS[difficulty], createInitialState);

  const stateRef = useRef(state);
  stateRef.current = state;

  // ---- 게임 루프 (requestAnimationFrame) ----
  useEffect(() => {
    if (state.status !== 'playing') return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(MAX_FRAME_MS, now - last);
      last = now;
      dispatch({ type: 'tick', dt });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state.status]);

  // ---- 화면을 벗어나면 자동 일시정지 ----
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && stateRef.current.status === 'playing') dispatch({ type: 'pause' });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // ---- 진동 피드백 ----
  const lastFeedbackSeq = useRef(0);
  useEffect(() => {
    let last = lastFeedbackSeq.current;
    for (const ev of state.events) {
      if (ev.seq <= last) continue;
      last = ev.seq;
      if (vibration) vibrate(ev.kind);
    }
    lastFeedbackSeq.current = last;
  }, [state.events, vibration]);

  // ---- 도감 통계: 세션 증가분을 누적 저장 ----
  const prevDestroyed = useRef<Stats>(state.destroyed);
  useEffect(() => {
    const prev = prevDestroyed.current;
    const cur = state.destroyed;
    if (cur === prev) return;
    prevDestroyed.current = cur;
    let changed = false;
    const merged: Stats = { ...stats };
    for (const t of Object.keys(cur) as CatType[]) {
      const delta = (cur[t] ?? 0) - (prev[t] ?? 0);
      if (delta > 0) {
        merged[t] = (merged[t] ?? 0) + delta;
        changed = true;
      }
    }
    if (changed) {
      setStats(merged);
      writeJson(STATS_KEY, merged);
    }
  }, [state.destroyed, stats]);

  // ---- 스테이지 클리어 저장 ----
  useEffect(() => {
    if (state.status !== 'cleared' || !state.stage) return;
    const stars = starsFor(state.stage.limit, progressInput(state));
    setLastStars(stars);
    setStageStars(prev => {
      if ((prev[state.stage!.id] ?? 0) >= stars) return prev;
      const next = { ...prev, [state.stage!.id]: stars };
      writeJson(STAGES_KEY, next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  // ---- 최고 기록 갱신 (무한 모드만) ----
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  useEffect(() => {
    if (state.status !== 'gameover' || state.mode !== 'endless') return;
    const id = state.preset.id;
    if (state.score > highScores[id]) {
      const next = { ...highScores, [id]: state.score };
      setHighScores(next);
      writeNumber(highScoreKey(id), state.score);
      setIsNewHighScore(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const start = useCallback(() => {
    setIsNewHighScore(false);
    setLastStars(null);
    dispatch({ type: 'start', preset: DIFFICULTY_PRESETS[difficulty], breeds: ALL_CAT_TYPES, seed: randomSeed() });
  }, [difficulty]);

  const startStage = useCallback((stage: StageDef) => {
    setIsNewHighScore(false);
    setLastStars(null);
    dispatch({ type: 'start', preset: DIFFICULTY_PRESETS.easy, breeds: ALL_CAT_TYPES, seed: randomSeed(), stage });
  }, []);

  /** 마지막으로 플레이한 스테이지 다시 / 다음 스테이지 */
  const retryStage = useCallback(() => {
    const st = stateRef.current.stage;
    if (st) startStage(st);
  }, [startStage]);
  const nextStage = useCallback(() => {
    const st = stateRef.current.stage;
    const next = st ? STAGES.find(x => x.id === st.id + 1) : undefined;
    if (next) startStage(next);
    else dispatch({ type: 'home' });
  }, [startStage]);

  const togglePause = useCallback(() => {
    const st = stateRef.current.status;
    if (st === 'playing') dispatch({ type: 'pause' });
    else if (st === 'paused') dispatch({ type: 'resume' });
  }, []);

  const actions = useMemo(
    () => ({
      start,
      startStage,
      retryStage,
      nextStage,
      togglePause,
      pause: () => dispatch({ type: 'pause' }),
      resume: () => dispatch({ type: 'resume' }),
      home: () => dispatch({ type: 'home' }),
      moveLeft: () => dispatch({ type: 'move', dx: -1 }),
      moveRight: () => dispatch({ type: 'move', dx: 1 }),
      softDrop: () => dispatch({ type: 'softDrop' }),
      hardDrop: () => dispatch({ type: 'hardDrop' }),
      rotateCW: () => dispatch({ type: 'rotate', direction: 1 }),
      rotateCCW: () => dispatch({ type: 'rotate', direction: -1 }),
      hold: () => dispatch({ type: 'hold' }),
    }),
    [start, startStage, retryStage, nextStage, togglePause],
  );

  const ghost = useMemo(() => selectGhost(state), [state]);

  return {
    state,
    ghost,
    actions,
    difficulty,
    highScore: highScores[difficulty],
    highScores,
    isNewHighScore,
    stats,
    stageStars,
    lastStars,
    /** 아직 클리어하지 않은 첫 스테이지 (전부 클리어면 마지막) */
    nextUnclearedStage: STAGES.find(st => !stageStars[st.id]) ?? STAGES[STAGES.length - 1],
  };
}

export type GameController = ReturnType<typeof useGame>;
export type GameActions = GameController['actions'];
export type { EngineState };
