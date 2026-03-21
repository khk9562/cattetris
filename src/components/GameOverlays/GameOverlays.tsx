import type { GameStatus } from '../../game/types';
import styles from '../../App.module.css';

interface Props {
  status: GameStatus;
  score: number;
  highScore: number;
  startGame: () => void;
  togglePause: () => void;
}

export default function GameOverlays({ status, score, highScore, startGame, togglePause }: Props) {
  if (status === 'playing') return null;

  return (
    <>
      {status === 'ready' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--color-primary)' }}>pets</span>
            <h2 className={styles.overlayTitle}>Cat Tetris</h2>
            {highScore > 0 && (
              <>
                <p className={styles.highScoreLabel}>High Score</p>
                <p className={styles.highScoreValue}>{highScore.toLocaleString()}</p>
              </>
            )}
            <button className={styles.startBtn} onClick={startGame}>
              Start Game
            </button>
          </div>
        </div>
      )}

      {status === 'gameover' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2 className={styles.overlayTitle}>Game Over</h2>
            <p className={styles.finalScore}>{score.toLocaleString()}</p>
            <p className={styles.finalLabel}>points</p>
            {highScore > 0 && (
              <>
                <p className={styles.highScoreLabel}>High Score</p>
                <p className={styles.highScoreValue}>{highScore.toLocaleString()}</p>
              </>
            )}
            <button className={styles.startBtn} onClick={startGame}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {status === 'paused' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2 className={styles.overlayTitle}>Paused</h2>
            <button className={styles.startBtn} onClick={togglePause}>
              Resume
            </button>
          </div>
        </div>
      )}
    </>
  );
}
