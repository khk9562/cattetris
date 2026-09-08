import { useState } from 'react';
import { useGame } from '@/features/game-session';
import { useKeyboardControls } from '@/features/keyboard-controls';
import { useTheme } from '@/features/theme';
import { useBoardGestures } from '@/features/touch-gestures';
import { Header } from '@/widgets/header';
import { StatsHUD } from '@/widgets/stats-hud';
import { NextQueue } from '@/widgets/next-queue';
import { HoldSlot } from '@/widgets/hold-slot';
import { Board } from '@/widgets/board';
import { Controls } from '@/widgets/controls';
import { GameOverlays } from '@/widgets/game-overlays';
import { CollectionOverlay } from '@/widgets/collection';
import styles from './GamePage.module.css';

export default function GamePage() {
  const game = useGame();
  const { state, actions } = game;
  const { theme, setTheme } = useTheme();
  const [showGhost, setShowGhost] = useState(true);
  const [showCollection, setShowCollection] = useState(false);

  useKeyboardControls(state.status, actions);
  const gestures = useBoardGestures(actions, state.status === 'playing');

  const inGame = state.status === 'playing' || state.status === 'paused';

  return (
    <div className={styles.page}>
      <Header
        elapsedSeconds={Math.floor(state.elapsedMs / 1000)}
        status={state.status}
        onTogglePause={actions.togglePause}
        showGhost={showGhost}
        onToggleGhost={() => setShowGhost(g => !g)}
        onGoHome={state.status === 'playing' ? actions.pause : actions.home}
        onOpenCollection={() => setShowCollection(true)}
      />

      <main className={styles.main}>
        <GameOverlays
          status={state.status}
          score={state.score}
          level={state.level}
          highScore={game.highScore}
          isNewHighScore={game.isNewHighScore}
          stats={state.stats}
          difficulty={game.difficulty}
          onSelectDifficulty={game.setDifficulty}
          startGame={actions.start}
          togglePause={actions.togglePause}
          goHome={actions.home}
          onOpenCollection={() => setShowCollection(true)}
          theme={theme}
          setTheme={setTheme}
        />

        <StatsHUD
          score={state.score}
          level={state.level}
          lines={state.lines}
          combo={state.combo}
          highScore={game.highScore}
        />
        <div className={styles.hudRow}>
          <HoldSlot piece={state.hold} disabled={state.holdUsed || !inGame} onHold={actions.hold} />
          <NextQueue pieces={state.queue} />
        </div>

        <div className={styles.boardArea} {...gestures} onContextMenu={e => e.preventDefault()}>
          <Board
            board={state.board}
            currentPiece={state.current}
            ghostPiece={showGhost ? game.ghost : null}
            clearing={state.clearing}
            popups={state.popups}
          />
        </div>
      </main>

      {inGame && <Controls actions={actions} />}

      {showCollection && <CollectionOverlay stats={game.stats} onClose={() => setShowCollection(false)} />}
    </div>
  );
}
