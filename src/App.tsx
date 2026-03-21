import { useGame } from './game/useGame';
import Header from './components/Header/Header';
import StatsHUD from './components/StatsHUD/StatsHUD';
import NextPreview from './components/NextPreview/NextPreview';
import Board from './components/Board/Board';
import Controls from './components/Controls/Controls';
import styles from './App.module.css';

export default function App() {
  const game = useGame();

  return (
    <div className={styles.app}>
      <Header elapsedTime={game.elapsedTime} status={game.status} onTogglePause={game.togglePause} />

      <main className={styles.main}>
        {game.status === 'ready' && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--color-primary)' }}>pets</span>
              <h2 className={styles.overlayTitle}>Cat Tetris</h2>
              <button className={styles.startBtn} onClick={game.startGame}>
                Start Game
              </button>
            </div>
          </div>
        )}

        {game.status === 'gameover' && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <h2 className={styles.overlayTitle}>Game Over</h2>
              <p className={styles.finalScore}>{game.score.toLocaleString()}</p>
              <p className={styles.finalLabel}>points</p>
              <button className={styles.startBtn} onClick={game.startGame}>
                Play Again
              </button>
            </div>
          </div>
        )}

        {game.status === 'paused' && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <h2 className={styles.overlayTitle}>Paused</h2>
              <button className={styles.startBtn} onClick={game.togglePause}>
                Resume
              </button>
            </div>
          </div>
        )}

        <div className={styles.hudRow}>
          <StatsHUD highScore={game.highScore} score={game.score} combo={game.combo} />
          <NextPreview piece={game.nextPiece} />
        </div>

        <Board board={game.board} currentPiece={game.currentPiece} ghostPiece={game.ghostPiece} />
      </main>

      {(game.status === 'playing' || game.status === 'paused') && (
        <Controls
          onLeft={game.moveLeft}
          onRight={game.moveRight}
          onRotate={game.rotate}
          onSoftDrop={game.moveDown}
        />
      )}
    </div>
  );
}
