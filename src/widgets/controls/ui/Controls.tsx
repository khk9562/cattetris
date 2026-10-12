import { memo, useCallback, useEffect, useRef } from 'react';
import type { GameActions } from '@/features/game-session';
import { Icon, type IconName } from '@/shared/ui';
import styles from './Controls.module.css';

interface Props {
  actions: GameActions;
}

/** DAS: 첫 반복까지 지연, ARR: 이후 반복 간격 (가이드라인 권장값 근처) */
const DAS_MS = 170;
const ARR_MS = 50;
/** 소프트 드롭은 조금 더 느슨하게 반복 */
const SOFT_DROP_ARR_MS = 60;
/** 아래 버튼을 이만큼 누르고 있으면 하드 드롭 (안드로이드 길게 누르기 기본값 400ms) */
const HARD_DROP_HOLD_MS = 400;

function useRepeat() {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const long = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    if (interval.current) clearInterval(interval.current);
    if (long.current) clearTimeout(long.current);
    timeout.current = null;
    interval.current = null;
    long.current = null;
  }, []);

  /** onLong이 있으면 longMs 동안 누르고 있을 때 반복을 멈추고 한 번 실행한다 */
  const startRepeat = useCallback((action: () => void, das: number, arr: number, onLong?: () => void, longMs = 0) => {
    stop();
    action();
    timeout.current = setTimeout(() => {
      interval.current = setInterval(action, arr);
    }, das);
    if (onLong) long.current = setTimeout(() => { stop(); onLong(); }, longMs);
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { startRepeat, stop };
}

interface ButtonProps {
  icon: IconName;
  label: string;
  coach: string;
  onDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onUp: (e: React.PointerEvent<HTMLButtonElement>) => void;
  accent?: boolean;
}

function ControlButton({ icon, label, coach, onDown, onUp, accent }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${accent ? styles.accent : ''}`}
      aria-label={label}
      data-coach-target={coach}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); onDown(e); }}
      onPointerUp={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); onUp(e); }}
      onPointerCancel={onUp}
      onContextMenu={e => e.preventDefault()}
    >
      <Icon name={icon} size="1.625rem" />
    </button>
  );
}

function Controls({ actions }: Props) {
  const move = useRepeat();
  const drop = useRepeat();

  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <ControlButton icon="hold" label="홀드" coach="hold" onDown={() => actions.hold()} onUp={() => undefined} />
        <ControlButton icon="left" label="왼쪽" coach="left" onDown={() => move.startRepeat(actions.moveLeft, DAS_MS, ARR_MS)} onUp={move.stop} />
        <ControlButton icon="down" label="소프트 드롭 (길게 누르면 하드 드롭)" coach="drop" onDown={() => drop.startRepeat(actions.softDrop, DAS_MS, SOFT_DROP_ARR_MS, actions.hardDrop, HARD_DROP_HOLD_MS)} onUp={drop.stop} />
        <ControlButton icon="right" label="오른쪽" coach="right" onDown={() => move.startRepeat(actions.moveRight, DAS_MS, ARR_MS)} onUp={move.stop} />
        <ControlButton icon="rotate" label="회전" coach="rotate" accent onDown={() => actions.rotateCW()} onUp={() => undefined} />
      </div>
    </footer>
  );
}

export default memo(Controls);
