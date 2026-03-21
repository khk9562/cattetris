import type { GameStatus } from '../../game/types';
import styles from '../../App.module.css';

interface Props {
  status: GameStatus;
  score: number;
  highScore: number;
  startGame: () => void;
  togglePause: () => void;
  goHome: () => void;
  onOpenCollection: () => void;
}

export default function GameOverlays({ status, score, highScore, startGame, togglePause, goHome, onOpenCollection }: Props) {
  if (status === 'playing') return null;

  return (
    <>
      {status === 'ready' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--color-primary)' }}>pets</span>
            <h2 className={styles.overlayTitle}>Cat Tetris</h2>
            <p className={styles.highScoreLabel}>최고 기록</p>
            <p className={styles.highScoreValue}>{highScore.toLocaleString()}</p>
            <button className={styles.startBtn} onClick={startGame}>
              게임 시작
            </button>
            <button className={styles.startBtn} onClick={onOpenCollection} style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' }}>
              도감
            </button>
          </div>
        </div>
      )}

      {status === 'gameover' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2 className={styles.overlayTitle}>게임 오버!</h2>
            <p className={styles.finalScore}>{score.toLocaleString()}</p>
            <p className={styles.finalLabel}>점수</p>
            {highScore > 0 && (
              <>
                <p className={styles.highScoreLabel}>최고 기록</p>
                <p className={styles.highScoreValue}>{highScore.toLocaleString()}</p>
              </>
            )}
            <button className={styles.startBtn} onClick={startGame}>
              다시 하기
            </button>
            <button className={styles.startBtn} onClick={onOpenCollection} style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' }}>
              도감
            </button>
            <button className={styles.startBtn} onClick={goHome} style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' }}>
              메인 메뉴
            </button>
          </div>
        </div>
      )}

      {status === 'paused' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2 className={styles.overlayTitle}>일시 정지</h2>
            <button className={styles.startBtn} onClick={togglePause}>
              이어하기
            </button>
            <button className={styles.startBtn} onClick={onOpenCollection} style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' }}>
              도감
            </button>
            <button className={styles.startBtn} onClick={goHome} style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)' }}>
              메인 메뉴
            </button>
          </div>
        </div>
      )}
    </>
  );
}
