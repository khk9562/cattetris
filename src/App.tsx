import { useState } from 'react';
import { useGame } from './game/useGame';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import Header from './components/Header/Header';
import StatsHUD from './components/StatsHUD/StatsHUD';
import NextPreview from './components/NextPreview/NextPreview';
import Board from './components/Board/Board';
import Controls from './components/Controls/Controls';
import GameOverlays from './components/GameOverlays/GameOverlays';
import styles from './App.module.css';

export default function App() {
  const game = useGame();
  const [showGhost, setShowGhost] = useState(true);

  useKeyboardControls(game);

  return (
    <div className={styles.app}>
      <Header 
        elapsedTime={game.elapsedTime} 
        status={game.status} 
        onTogglePause={game.togglePause} 
        showGhost={showGhost}
        onToggleGhost={() => setShowGhost(!showGhost)}
        onGoHome={game.goHome}
      />

      <main className={styles.main}>
        <GameOverlays 
          status={game.status}
          score={game.score}
          highScore={game.highScore}
          startGame={game.startGame}
          togglePause={game.togglePause}
          goHome={game.goHome}
        />

        <div className={styles.hudRow}>
          <StatsHUD score={game.score} combo={game.combo} highScore={game.highScore} />
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
          onHardDrop={game.hardDrop}
        />
      )}
    </div>
  );
}
