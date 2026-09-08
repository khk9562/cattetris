import { useEffect, useRef } from 'react';
import type { DailyProgress } from '@/entities/mission';
import type { EngineState } from '@/features/game-session';
import type { SessionRecord } from '@/features/player-stats';

/**
 * 플레이 중 최신 상태를 기억해 두었다가 판이 끝나면(게임오버/클리어/홈) 한 번만
 * 일일 미션 진행과 누적 통계에 반영한다.
 */
export function useSessionRecorder(
  state: EngineState,
  onFinish: (delta: DailyProgress, record: SessionRecord) => void,
) {
  const snapshot = useRef<EngineState | null>(null);
  const finish = useRef(onFinish);
  finish.current = onFinish;

  useEffect(() => {
    if (state.status === 'playing' || state.status === 'paused') {
      snapshot.current = state;
      return;
    }
    const s = state.status === 'ready' ? snapshot.current : state;
    snapshot.current = null;
    if (!s || s.piecesPlaced === 0) return;
    finish.current(
      { lines: s.lines, explosions: s.stats.explosions, bestChain: s.stats.maxChain + 1, destroyed: s.destroyed, score: s.score },
      { mode: s.mode, difficulty: s.preset.id, elapsedMs: s.elapsedMs, lines: s.lines, explosions: s.stats.explosions, maxChain: s.stats.maxChain, score: s.score, level: s.level },
    );
    // status 전이에만 반응한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);
}
