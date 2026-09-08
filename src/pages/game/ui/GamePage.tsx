import { useState } from 'react';
import { useGame } from '@/features/game-session';
import { useKeyboardControls } from '@/features/keyboard-controls';
import { useSettings } from '@/features/settings';
import { useSound } from '@/features/sound';
import { useBoardGestures } from '@/features/touch-gestures';
import { Header } from '@/widgets/header';
import { StatsHUD } from '@/widgets/stats-hud';
import { NextQueue } from '@/widgets/next-queue';
import { HoldSlot } from '@/widgets/hold-slot';
import { Board } from '@/widgets/board';
import { Controls } from '@/widgets/controls';
import { GameOverlays } from '@/widgets/game-overlays';
import { CollectionOverlay } from '@/widgets/collection';
import { SettingsOverlay } from '@/widgets/settings-overlay';
import styles from './GamePage.module.css';

export default function GamePage() {
  const { settings, update } = useSettings();
  const game = useGame({ difficulty: settings.difficulty, vibration: settings.vibration });
  const { state, actions } = game;
  const [showCollection, setShowCollection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useKeyboardControls(state.status, actions);
  useSound(state.events, { sound: settings.sound, music: settings.music, status: state.status, level: state.level });
  const gestures = useBoardGestures(actions, state.status === 'playing' && settings.gestures);

  const inGame = state.status === 'playing' || state.status === 'paused';

  return (
    <div className={styles.page}>
      <Header
        elapsedSeconds={Math.floor(state.elapsedMs / 1000)}
        status={state.status}
        onTogglePause={actions.togglePause}
        onOpenSettings={() => setShowSettings(true)}
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
          difficulty={settings.difficulty}
          onSelectDifficulty={id => update('difficulty', id)}
          startGame={actions.start}
          togglePause={actions.togglePause}
          goHome={actions.home}
          onOpenCollection={() => setShowCollection(true)}
          theme={settings.theme}
          setTheme={t => update('theme', t)}
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
            ghostPiece={settings.ghost ? game.ghost : null}
            clearing={state.clearing}
            popups={state.popups}
          />
        </div>
      </main>

      {inGame && <Controls actions={actions} />}

      {showCollection && <CollectionOverlay stats={game.stats} onClose={() => setShowCollection(false)} />}
      {showSettings && <SettingsOverlay settings={settings} onChange={update} onClose={() => setShowSettings(false)} />}
    </div>
  );
}
