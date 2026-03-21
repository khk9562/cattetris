import { useCallback, useEffect, useRef } from 'react';
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

  const startRepeat = useCallback((e: React.SyntheticEvent, action: () => void) => {
    e.preventDefault(); // Prevent duplicate mouse events on touch
    if (intervalRef.current) return;
    action();
    intervalRef.current = setInterval(action, 120);
  }, []);

  const stopRepeat = useCallback((e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <button
          className={styles.btn}
          onTouchStart={(e) => startRepeat(e, onLeft)}
          onTouchEnd={stopRepeat}
          onMouseDown={(e) => startRepeat(e, onLeft)}
          onMouseUp={stopRepeat}
          onMouseLeave={stopRepeat}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>keyboard_arrow_left</span>
        </button>

        <button
          className={styles.btn}
          onTouchStart={(e) => startRepeat(e, onRight)}
          onTouchEnd={stopRepeat}
          onMouseDown={(e) => startRepeat(e, onRight)}
          onMouseUp={stopRepeat}
          onMouseLeave={stopRepeat}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>keyboard_arrow_right</span>
        </button>

        <button
          className={styles.btn}
          onTouchStart={(e) => startRepeat(e, onSoftDrop)}
          onTouchEnd={stopRepeat}
          onMouseDown={(e) => startRepeat(e, onSoftDrop)}
          onMouseUp={stopRepeat}
          onMouseLeave={stopRepeat}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>keyboard_arrow_down</span>
        </button>

        <button 
          className={styles.btn} 
          onClick={onHardDrop}
          onTouchStart={(e) => e.preventDefault() /* prevent default scroll / double tap */}
          onTouchEnd={(e) => { e.preventDefault(); onHardDrop(); }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>keyboard_double_arrow_down</span>
        </button>

        <button 
          className={styles.btn} 
          onClick={onRotate}
          onTouchStart={(e) => e.preventDefault()}
          onTouchEnd={(e) => { e.preventDefault(); onRotate(); }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>rotate_right</span>
        </button>
      </div>
    </footer>
  );
}
