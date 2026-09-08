import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Feedback, GameStatus, StartSetup } from '@/features/game-session/@x/tutorial';
import type { DifficultyPreset } from '@/entities/difficulty';
import { TUTORIAL_KEY } from '@/shared/config';
import { readString, writeString } from '@/shared/lib';
import { INITIAL_TUTORIAL, TUTORIAL_STEPS, segmentStart, tutorialReducer } from './steps';

interface Deps {
  status: GameStatus;
  events: Feedback[];
  /** 튜토리얼 판을 (다시) 시작한다 */
  startGame: (setup: StartSetup | undefined, presetOverride: Partial<DifficultyPreset> | undefined) => void;
  goHome: () => void;
}

export function useTutorial({ status, events, startGame, goHome }: Deps) {
  const [state, dispatch] = useReducer(tutorialReducer, INITIAL_TUTORIAL);
  const [done, setDone] = useState(() => readString(TUTORIAL_KEY, '') === '1');
  const lastSeq = useRef(0);
  const lastStartedIndex = useRef(-1);
  /** begin 이후 실제로 플레이 상태를 본 적이 있는지 (홈으로 나간 것과 시작 전 'ready'를 구분) */
  const sawPlaying = useRef(false);

  const step = TUTORIAL_STEPS[state.stepIndex];

  // 단계 진입 시 셋업이 있으면 새 판 시작
  useEffect(() => {
    if (!state.active) { lastStartedIndex.current = -1; sawPlaying.current = false; return; }
    if (step.setup && lastStartedIndex.current !== state.stepIndex) {
      lastStartedIndex.current = state.stepIndex;
      startGame(step.setup, step.presetOverride);
    }
  }, [state.active, state.stepIndex, step, startGame]);

  // 엔진 이벤트 소비
  useEffect(() => {
    if (!state.active) return;
    let last = lastSeq.current;
    for (const ev of events) {
      if (ev.seq <= last) continue;
      last = ev.seq;
      dispatch({ type: 'event', kind: ev.kind });
    }
    lastSeq.current = last;
  }, [events, state.active]);

  // 튜토리얼 중 게임오버면 현재 구간을 다시 시작, 홈으로 나가면 종료
  useEffect(() => {
    if (!state.active) return;
    if (status === 'playing' || status === 'paused') {
      sawPlaying.current = true;
      return;
    }
    if (status === 'gameover') {
      const seg = segmentStart(state.stepIndex);
      const t = setTimeout(() => startGame(seg.setup, seg.presetOverride), 700);
      return () => clearTimeout(t);
    }
    if (status === 'ready' && sawPlaying.current) dispatch({ type: 'exit' });
  }, [status, state.active, state.stepIndex, startGame]);

  // 완료 저장 + 홈 (마지막 단계는 버튼으로만 끝나므로 이벤트 경로에서는 완료되지 않는다)
  const finish = useCallback(() => {
    setDone(true);
    writeString(TUTORIAL_KEY, '1');
    goHome();
  }, [goHome]);

  const begin = useCallback(() => {
    lastSeq.current = events[events.length - 1]?.seq ?? 0;
    dispatch({ type: 'begin' });
  }, [events]);

  const next = useCallback(() => {
    const after = tutorialReducer(state, { type: 'next' });
    dispatch({ type: 'next' });
    if (after.completed) finish();
  }, [state, finish]);

  const skip = useCallback(() => {
    dispatch({ type: 'skip' });
    finish();
  }, [finish]);

  return {
    active: state.active,
    step,
    stepIndex: state.stepIndex,
    total: TUTORIAL_STEPS.length,
    done,
    begin,
    next,
    skip,
  };
}

export type TutorialController = ReturnType<typeof useTutorial>;
