import { memo } from 'react';
import type { GameStatus } from '@/features/game-session';
import { Icon } from '@/shared/ui';
import styles from './Header.module.css';

interface Props {
  elapsedSeconds: number;
  status: GameStatus;
  onTogglePause: () => void;
  showGhost: boolean;
  onToggleGhost: () => void;
  onGoHome: () => void;
  onOpenCollection: () => void;
}

function Header({ elapsedSeconds, status, onTogglePause, showGhost, onToggleGhost, onGoHome, onOpenCollection }: Props) {
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');
  const showPause = status === 'playing' || status === 'paused';

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <Icon name="paw" size="1.5rem" style={{ color: 'var(--color-primary)' }} />
        <h1 className={styles.title}>CAT TETRIS</h1>
      </div>
      <div className={styles.controlsGroup}>
        {status !== 'playing' && (
          <button className={styles.iconBtn} onClick={onOpenCollection} aria-label="도감 열기">
            <Icon name="book" />
          </button>
        )}
        <button className={styles.iconBtn} onClick={onGoHome} aria-label="메인 메뉴">
          <Icon name="home" />
        </button>
        <button className={styles.iconBtn} onClick={onToggleGhost} aria-label="고스트 미리보기 전환">
          <Icon name={showGhost ? 'eye' : 'eyeOff'} />
        </button>
        {showPause ? (
          <button className={styles.timerBtn} onClick={onTogglePause} aria-label={status === 'paused' ? '이어하기' : '일시 정지'}>
            <span className={styles.timerText}>{minutes}:{seconds}</span>
            <Icon name={status === 'paused' ? 'play' : 'pause'} />
          </button>
        ) : (
          <div className={styles.timer}>{minutes}:{seconds}</div>
        )}
      </div>
    </header>
  );
}

export default memo(Header);
