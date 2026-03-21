import { useCallback, useRef } from 'react';
import styles from './Controls.module.css';

interface Props {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
}

export default function Controls({ onLeft, onRight, onRotate, onSoftDrop, onHardDrop }: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRepeat = useCallback((action: () => void) => {
    action();
    intervalRef.current = setInterval(action, 100);
  }, []);

  const stopRepeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (dy > 50) {
        onHardDrop();
      }
      touchStartY.current = null;
    }
  }, [onHardDrop]);

  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <button
          className={styles.arrowBtn}
          onTouchStart={() => startRepeat(onLeft)}
          onTouchEnd={stopRepeat}
          onMouseDown={() => startRepeat(onLeft)}
          onMouseUp={stopRepeat}
          onMouseLeave={stopRepeat}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>arrow_back_ios</span>
        </button>

        <div className={styles.centerGroup}>
          <button className={styles.rotateBtn} onClick={onRotate}>
            <span className="material-symbols-outlined" style={{ fontSize: 36 }}>refresh</span>
          </button>
          <button
            className={styles.dropBtn}
            onTouchStart={() => startRepeat(onSoftDrop)}
            onTouchEnd={stopRepeat}
            onMouseDown={() => startRepeat(onSoftDrop)}
            onMouseUp={stopRepeat}
            onMouseLeave={stopRepeat}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>keyboard_double_arrow_down</span>
          </button>
        </div>

        <button
          className={styles.arrowBtn}
          onTouchStart={() => startRepeat(onRight)}
          onTouchEnd={stopRepeat}
          onMouseDown={() => startRepeat(onRight)}
          onMouseUp={stopRepeat}
          onMouseLeave={stopRepeat}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>arrow_forward_ios</span>
        </button>
      </div>
    </footer>
  );
}
