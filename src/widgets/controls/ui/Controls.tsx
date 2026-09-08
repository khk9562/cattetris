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

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // --- Left / Right Movement ---
  const handleMovePointerDown = useCallback((e: React.PointerEvent, action: () => void) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (intervalRef.current) return;
    action();
    intervalRef.current = setInterval(action, 120);
  }, []);

  const handleMovePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // --- Unified Drop (Tap = Soft Drop, Hold = Hard Drop) ---
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDropPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    onSoftDrop(); // Perform immediate soft drop on press
    
    // Hold for 250ms triggers hard drop
    longPressTimeoutRef.current = setTimeout(() => {
      onHardDrop();
    }, 250);
  }, [onSoftDrop, onHardDrop]);

  const handleDropPointerUp = useCallback((e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  // --- Rotate ---
  const handleRotatePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    onRotate();
  }, [onRotate]);

  const handleRotatePointerUp = useCallback((e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <button
          className={styles.btn}
          onPointerDown={(e) => handleMovePointerDown(e, onLeft)}
          onPointerUp={handleMovePointerUp}
          onPointerCancel={handleMovePointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>keyboard_arrow_left</span>
        </button>

        <button
          className={styles.btn}
          onPointerDown={handleDropPointerDown}
          onPointerUp={handleDropPointerUp}
          onPointerCancel={handleDropPointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>keyboard_arrow_down</span>
        </button>

        <button
          className={styles.btn}
          onPointerDown={(e) => handleMovePointerDown(e, onRight)}
          onPointerUp={handleMovePointerUp}
          onPointerCancel={handleMovePointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>keyboard_arrow_right</span>
        </button>
        
        <button 
          className={styles.btn} 
          onPointerDown={handleRotatePointerDown}
          onPointerUp={handleRotatePointerUp}
          onPointerCancel={handleRotatePointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '2.25rem' }}>rotate_right</span>
        </button>
      </div>
    </footer>
  );
}
