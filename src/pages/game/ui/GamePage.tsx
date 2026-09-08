import { useState } from 'react';
import { progressInput, useGame, type GameMode } from '@/features/game-session';
import { useKeyboardControls } from '@/features/keyboard-controls';
import { useSettings } from '@/features/settings';
import { useTutorial } from '@/features/tutorial';
import { useSkins } from '@/features/skins';
import { SkinProvider } from '@/entities/cat';
import { useSound } from '@/features/sound';
import { useDailyMissions } from '@/features/daily-missions';
import { usePlayerStats } from '@/features/player-stats';
import { useSessionRecorder } from '../model/useSessionRecorder';
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
import { StageSelect } from '@/widgets/stage-select';
import { StageGoals } from '@/widgets/stage-goals';
import { TutorialOverlay } from '@/widgets/tutorial-overlay';
import { StatsOverlay } from '@/widgets/stats-overlay';
import styles from './GamePage.module.css';

export default function GamePage() {
  const { settings, update } = useSettings();
  const game = useGame({ difficulty: settings.difficulty, vibration: settings.vibration });
  const { state, actions } = game;
  const [showCollection, setShowCollection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const missions = useDailyMissions();
  const playerStats = usePlayerStats();
  useSessionRecorder(state, (delta, record) => {
    missions.addProgress(delta);
    playerStats.record(record);
  });
  const [menuMode, setMenuMode] = useState<GameMode>('endless');

  useKeyboardControls(state.status, actions);
  const totalStars = Object.values(game.stageStars).reduce((a, b) => a + b, 0);
  const skins = useSkins({ stats: game.stats, totalStars });
  const tutorial = useTutorial({ status: state.status, events: state.events, startGame: actions.startTutorial, goHome: actions.home });
  useSound(state.events, { sound: settings.sound, music: settings.music, status: state.status, level: state.level });
  const gestures = useBoardGestures(actions, state.status === 'playing' && settings.gestures);

  const inGame = state.status === 'playing' || state.status === 'paused';
  const progress = progressInput(state);

  return (
    <SkinProvider value={skins.equipped}>
    <div className={styles.page}>
      <Header
        elapsedSeconds={Math.floor(state.elapsedMs / 1000)}
        status={state.status}
        onTogglePause={actions.togglePause}
        onOpenSettings={() => setShowSettings(true)}
        onOpenStats={() => setShowStats(true)}
        onGoHome={state.status === 'playing' ? actions.pause : actions.home}
        onOpenCollection={() => setShowCollection(true)}
      />

      <main className={styles.main}>
        <GameOverlays
          status={state.status}
          mode={state.mode}
          stage={state.stage}
          progress={progress}
          lastStars={game.lastStars}
          stageStars={game.stageStars}
          nextUnclearedStage={game.nextUnclearedStage}
          menuMode={menuMode}
          onSelectMenuMode={setMenuMode}
          startStage={actions.startStage}
          retryStage={actions.retryStage}
          nextStage={actions.nextStage}
          onOpenStages={() => setShowStages(true)}
          showTutorialPrompt={!tutorial.done}
          onStartTutorial={tutorial.begin}
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
          missions={missions.items}
          onClaimMission={missions.claim}
          playerTitle={missions.currentTitle}
        />

        {tutorial.active ? (
          <TutorialOverlay step={tutorial.step} stepIndex={tutorial.stepIndex} total={tutorial.total} onNext={tutorial.next} onSkip={tutorial.skip} />
        ) : state.mode === 'stage' && state.stage ? (
          <StageGoals stage={state.stage} progress={progress} />
        ) : (
          <StatsHUD
            score={state.score}
            level={state.level}
            lines={state.lines}
            combo={state.combo}
            highScore={game.highScore}
          />
        )}
        <div className={styles.hudRow}>
          <HoldSlot piece={state.hold} disabled={state.holdUsed || !inGame} onHold={actions.hold} />
          <NextQueue pieces={state.queue} />
        </div>

        <div className={styles.boardArea} {...gestures} onContextMenu={e => e.preventDefault()} data-coach-target="board">
          <Board
            board={state.board}
            currentPiece={state.current}
            ghostPiece={settings.ghost ? game.ghost : null}
            clearing={state.clearing}
            popups={state.popups}
            gameOver={state.status === 'gameover'}
          />
        </div>
      </main>

      {inGame && <Controls actions={actions} />}

      {showCollection && (
        <CollectionOverlay
          stats={game.stats}
          equipped={skins.equipped}
          totalStars={totalStars}
          skinsUnlocked={skins.unlocked}
          skinsTotal={skins.total}
          onEquipPalette={skins.equipPalette}
          onEquipAccessory={skins.equipAccessory}
          onClose={() => setShowCollection(false)}
        />
      )}
      {showSettings && (
        <SettingsOverlay
          settings={settings}
          onChange={update}
          onClose={() => setShowSettings(false)}
          onStartTutorial={() => { setShowSettings(false); tutorial.begin(); }}
        />
      )}

      {showStats && (
        <StatsOverlay
          totals={playerStats.totals}
          highScores={game.highScores}
          stageStars={game.stageStars}
          skinsUnlocked={skins.unlocked}
          skinsTotal={skins.total}
          titles={missions.titles}
          onClose={() => setShowStats(false)}
        />
      )}
      {showStages && (
        <StageSelect
          stars={game.stageStars}
          onSelect={stage => { setShowStages(false); actions.startStage(stage); }}
          onClose={() => setShowStages(false)}
        />
      )}
    </div>
    </SkinProvider>
  );
}
