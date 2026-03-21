import { useState } from 'react';
import { useGame } from './game/useGame';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import Header from './components/Header/Header';
import StatsHUD from './components/StatsHUD/StatsHUD';
import NextPreview from './components/NextPreview/NextPreview';
import Board from './components/Board/Board';
import Controls from './components/Controls/Controls';
import GameOverlays from './components/GameOverlays/GameOverlays';
import CollectionOverlay from './components/CollectionOverlay/CollectionOverlay';
import styles from './App.module.css';

export default function App() {
  const game = useGame();
  const [showGhost, setShowGhost] = useState(true);
  const [showCollection, setShowCollection] = useState(false);

  useKeyboardControls(game);

  return (
    <div className={styles.appContainer}>
      <Header 
        elapsedTime={game.elapsedTime} 
        status={game.status} 
        onTogglePause={game.togglePause} 
        showGhost={showGhost}
        onToggleGhost={() => setShowGhost(!showGhost)}
        onGoHome={game.goHome}
        onOpenCollection={() => setShowCollection(true)}
      />

      <main className={styles.main}>
        <GameOverlays 
          status={game.status}
          score={game.score}
          highScore={game.highScore}
          startGame={game.startGame}
          togglePause={game.togglePause}
          goHome={game.goHome}
          onOpenCollection={() => setShowCollection(true)}
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

      {showCollection && (
        <CollectionOverlay 
          stats={game.destroyedStats} 
          onClose={() => setShowCollection(false)} 
        />
      )}
    </div>
  );
}
