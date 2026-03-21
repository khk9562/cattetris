import type { GameStatus } from '../../game/types';
import styles from './Header.module.css';

interface Props {
  elapsedTime: number;
  status: GameStatus;
  onTogglePause: () => void;
}

export default function Header({ elapsedTime, status, onTogglePause }: Props) {
  const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
  const seconds = String(elapsedTime % 60).padStart(2, '0');
  const showPause = status === 'playing' || status === 'paused';

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>pets</span>
        <h1 className={styles.title}>Cat Tetris</h1>
      </div>
      {showPause ? (
        <button className={styles.timerBtn} onClick={onTogglePause}>
          <span className={styles.timerText}>{minutes}:{seconds}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
            {status === 'paused' ? 'play_arrow' : 'pause'}
          </span>
        </button>
      ) : (
        <div className={styles.timer}>
          {minutes}:{seconds}
        </div>
      )}
    </header>
  );
}
