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

function useRepeat() {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    if (interval.current) clearInterval(interval.current);
    timeout.current = null;
    interval.current = null;
  }, []);

  const startRepeat = useCallback((action: () => void, das: number, arr: number) => {
    stop();
    action();
    timeout.current = setTimeout(() => {
      interval.current = setInterval(action, arr);
    }, das);
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
      <Icon name={icon} size="2rem" />
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
        <ControlButton icon="down" label="소프트 드롭" coach="drop" onDown={() => drop.startRepeat(actions.softDrop, DAS_MS, SOFT_DROP_ARR_MS)} onUp={drop.stop} />
        <ControlButton icon="right" label="오른쪽" coach="right" onDown={() => move.startRepeat(actions.moveRight, DAS_MS, ARR_MS)} onUp={move.stop} />
        <ControlButton icon="rotate" label="회전" coach="rotate" accent onDown={() => actions.rotateCW()} onUp={() => undefined} />
      </div>
    </footer>
  );
}

export default memo(Controls);
