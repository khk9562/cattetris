import { useState } from 'react';
import { useGame } from '@/features/game-session';
import { useKeyboardControls } from '@/features/keyboard-controls';
import { useTheme, type Theme } from '@/features/theme';
import { Header } from '@/widgets/header';
import { StatsHUD } from '@/widgets/stats-hud';
import { NextPreview } from '@/widgets/next-preview';
import { Board } from '@/widgets/board';
import { Controls } from '@/widgets/controls';
import { GameOverlays } from '@/widgets/game-overlays';
import { CollectionOverlay } from '@/widgets/collection';
import styles from './GamePage.module.css';

export default function GamePage() {
  const game = useGame();
  const { theme, setTheme } = useTheme();
  const [showGhost, setShowGhost] = useState(true);
  const [showCollection, setShowCollection] = useState(false);

  useKeyboardControls(game);

  return (
    <div className={styles.page}>
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
          theme={theme}
          setTheme={(t) => setTheme(t as Theme)}
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
        <CollectionOverlay stats={game.destroyedStats} onClose={() => setShowCollection(false)} />
      )}
    </div>
  );
}
