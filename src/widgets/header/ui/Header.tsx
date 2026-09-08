import type { GameStatus } from '@/features/game-session';
import styles from './Header.module.css';

interface Props {
  elapsedTime: number;
  status: GameStatus;
  onTogglePause: () => void;
  showGhost: boolean;
  onToggleGhost: () => void;
  onGoHome: () => void;
  onOpenCollection: () => void;
}

export default function Header({ elapsedTime, status, onTogglePause, showGhost, onToggleGhost, onGoHome, onOpenCollection }: Props) {
  const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
  const seconds = String(elapsedTime % 60).padStart(2, '0');
  const showPause = status === 'playing' || status === 'paused';

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>pets</span>
        <h1 className={styles.title}>CAT TETRIS</h1>
      </div>
      <div className={styles.controlsGroup}>
        {status !== 'playing' && (
          <button className={styles.iconBtn} onClick={onOpenCollection} aria-label="도감 열기">
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>menu_book</span>
          </button>
        )}
        <button className={styles.iconBtn} onClick={onGoHome} aria-label="메인 메뉴">
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>home</span>
        </button>
        <button className={styles.iconBtn} onClick={onToggleGhost} aria-label="고스트 미리보기 전환">
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
            {showGhost ? 'visibility' : 'visibility_off'}
          </span>
        </button>
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
      </div>
    </header>
  );
}
