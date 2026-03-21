import { useEffect, useState } from 'react';
import { useGame } from './game/useGame';
import Header from './components/Header/Header';
import StatsHUD from './components/StatsHUD/StatsHUD';
import NextPreview from './components/NextPreview/NextPreview';
import Board from './components/Board/Board';
import Controls from './components/Controls/Controls';
import styles from './App.module.css';

export default function App() {
  const game = useGame();
  const [showGhost, setShowGhost] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (game.status !== 'playing') return;

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          game.moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          game.moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          game.moveDown();
          break;
        case 'Space':
        case 'ArrowUp':
            e.preventDefault();
            game.rotate();
            break;
        case 'Enter':
          e.preventDefault();
          game.hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.status, game.moveLeft, game.moveRight, game.moveDown, game.rotate, game.hardDrop]);

  return (
    <div className={styles.app}>
      <Header 
        elapsedTime={game.elapsedTime} 
        status={game.status} 
        onTogglePause={game.togglePause} 
        showGhost={showGhost}
        onToggleGhost={() => setShowGhost(!showGhost)}
      />

      <main className={styles.main}>
        {game.status === 'ready' && (
          <div className={styles.overlay}>
            <div className={styles.overlayContent}>
              <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--color-primary)' }}>pets</span>
              <h2 className={styles.overlayTitle}>Cat Tetris</h2>
              {game.highScore > 0 && (
                <>
                  <p className={styles.highScoreLabel}>High Score</p>
                  <p className={styles.highScoreValue}>{game.highScore.toLocaleString()}</p>
                </>
              )}
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
              {game.highScore > 0 && (
                <>
                  <p className={styles.highScoreLabel}>High Score</p>
                  <p className={styles.highScoreValue}>{game.highScore.toLocaleString()}</p>
                </>
              )}
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
          <StatsHUD score={game.score} combo={game.combo} />
          <NextPreview piece={game.nextPiece} />
        </div>

        <div className={styles.boardArea}>
          <Board board={game.board} currentPiece={game.currentPiece} ghostPiece={showGhost ? game.ghostPiece : null} />
        </div>
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
