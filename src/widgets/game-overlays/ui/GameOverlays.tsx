import { memo } from 'react';
import { DIFFICULTY_PRESETS, type DifficultyId } from '@/entities/difficulty';
import { STAGES, stageProgress, type StageDef, type StageProgressInput } from '@/entities/stage';
import type { GameMode, GameStatus, SessionStats } from '@/features/game-session';
import type { ThemeId } from '@/shared/config';
import { Icon } from '@/shared/ui';
import HomeScreen from './HomeScreen';
import StartSheet from './StartSheet';
import styles from './GameOverlays.module.css';

interface Props {
  status: GameStatus;
  mode: GameMode;
  stage: StageDef | null;
  progress: StageProgressInput;
  score: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  lastStars: 1 | 2 | 3 | null;
  stageStars: Record<number, number>;
  nextUnclearedStage: StageDef;
  stats: SessionStats;
  difficulty: DifficultyId;
  onSelectDifficulty: (id: DifficultyId) => void;
  menuMode: GameMode;
  onSelectMenuMode: (m: GameMode) => void;
  /** 시작 시트가 열려 있는지 */
  setupOpen: boolean;
  onOpenSetup: () => void;
  onCloseSetup: () => void;
  startGame: () => void;
  startStage: (stage: StageDef) => void;
  retryStage: () => void;
  nextStage: () => void;
  onOpenStages: () => void;
  onStartTutorial: () => void;
  togglePause: () => void;
  goHome: () => void;
  onOpenCollection: () => void;
  onOpenStats: () => void;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

function Stars({ count, animate }: { count: number; animate?: boolean }) {
  return (
    <div className={styles.stars} aria-label={`별 ${count}개`}>
      {[1, 2, 3].map(n => (
        <span
          key={n}
          className={`${styles.star} ${n <= count ? styles.starOn : ''} ${animate && n <= count ? styles.starPop : ''}`}
          style={{ animationDelay: `${n * 0.18}s` }}
        >
          <Icon name="star" size="2.25rem" />
        </span>
      ))}
    </div>
  );
}

function GoalList({ stage, progress }: { stage: StageDef; progress: StageProgressInput }) {
  return (
    <ul className={styles.goalList}>
      {stageProgress(stage, progress).map((g, i) => (
        <li key={i} className={g.done ? styles.goalDone : ''}>
          <span>{g.label}</span>
          <strong>{g.current.toLocaleString()} / {g.target.toLocaleString()}</strong>
        </li>
      ))}
    </ul>
  );
}

function GameOverlays({
  status, mode, stage, progress, score, level, highScore, isNewHighScore, lastStars, stageStars, nextUnclearedStage,
  stats, difficulty, onSelectDifficulty, menuMode, onSelectMenuMode,
  setupOpen, onOpenSetup, onCloseSetup,
  startGame, startStage, retryStage, nextStage, onOpenStages, onStartTutorial, togglePause, goHome,
  onOpenCollection, onOpenStats, theme, setTheme,
}: Props) {
  // 튜토리얼 중 게임오버는 훅이 곧바로 구간을 다시 시작하므로 화면을 띄우지 않는다
  if (mode === 'tutorial' && status === 'gameover') return null;
  if (status === 'playing') return null;
  const preset = DIFFICULTY_PRESETS[difficulty];
  const clearedCount = Object.keys(stageStars).length;
  const hasNext = stage ? STAGES.some(s => s.id === stage.id + 1) : false;

  if (status === 'ready') {
    return (
      <HomeScreen
        highScore={highScore}
        difficulty={difficulty}
        clearedCount={clearedCount}
        theme={theme}
        setTheme={setTheme}
        onOpenSetup={onOpenSetup}
        onStartTutorial={onStartTutorial}
        onOpenCollection={onOpenCollection}
        onOpenStats={onOpenStats}
        sheet={setupOpen ? (
          <StartSheet
            mode={menuMode}
            onSelectMode={onSelectMenuMode}
            difficulty={difficulty}
            onSelectDifficulty={onSelectDifficulty}
            nextUnclearedStage={nextUnclearedStage}
            clearedCount={clearedCount}
            onStart={() => {
              onCloseSetup();
              if (menuMode === 'stage') startStage(nextUnclearedStage);
              else startGame();
            }}
            onClose={onCloseSetup}
          />
        ) : null}
      />
    );
  }

  return (
    <>
      {status === 'cleared' && stage && (
        <div className={`${styles.overlay} ${styles.overlayGameover}`} data-scroll>
          <div className={styles.content}>
            <h2 className={styles.title}>클리어다냥</h2>
            <p className={styles.finalLabel}>스테이지 {stage.id} · {stage.title}</p>
            <Stars count={lastStars ?? 1} animate />
            <p className={styles.finalScore}>{score.toLocaleString()}</p>
            <p className={styles.finalLabel}>점수</p>
            <GoalList stage={stage} progress={progress} />
            {hasNext ? (
              <button className={styles.btn} onClick={nextStage}>다음 판 간다냥</button>
            ) : (
              <p className={styles.newRecord}><Icon name="trophy" size="1.25rem" /> 30판 다 깼다냥</p>
            )}
            <div className={styles.btnRow}>
              <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={retryStage}>다시</button>
              <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={goHome}>집에 가기</button>
            </div>
          </div>
        </div>
      )}

      {status === 'gameover' && (
        <div className={`${styles.overlay} ${styles.overlayGameover}`} data-scroll>
          <div className={styles.content}>
            <h2 className={styles.title}>{mode === 'stage' ? '아쉽다냥' : '끝났다냥'}</h2>
            {mode === 'stage' && stage ? (
              <>
                <p className={styles.finalLabel}>스테이지 {stage.id} · {stage.title}</p>
                <GoalList stage={stage} progress={progress} />
                <p className={styles.finalScore}>{score.toLocaleString()}</p>
                <p className={styles.finalLabel}>점수</p>
                <button className={styles.btn} onClick={retryStage}>다시 도전한다냥</button>
                <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={onOpenStages}>스테이지 목록</button>
              </>
            ) : (
              <>
                {isNewHighScore && (
                  <p className={styles.newRecord}><Icon name="trophy" size="1.25rem" /> 신기록이다냥</p>
                )}
                <p className={styles.finalScore}>{score.toLocaleString()}</p>
                <p className={styles.finalLabel}>점수 · {preset.label}</p>
                <div className={styles.summary}>
                  <div><span>레벨</span><strong>{level}</strong></div>
                  <div><span>줄</span><strong>{stats.linesCleared}</strong></div>
                  <div><span>폭발</span><strong>{stats.explosions}</strong></div>
                  <div><span>최대 연쇄</span><strong>{stats.maxChain + 1}</strong></div>
                </div>
                {highScore > 0 && !isNewHighScore && (
                  <>
                    <p className={styles.label}>최고 기록</p>
                    <p className={styles.highScoreValue}>{highScore.toLocaleString()}</p>
                  </>
                )}
                <button className={styles.btn} onClick={startGame}>한 판 더 간다냥</button>
              </>
            )}
            <div className={styles.btnRow}>
              <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={onOpenCollection}>도감</button>
              <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={goHome}>집에 가기</button>
            </div>
          </div>
        </div>
      )}

      {status === 'paused' && (
        <div className={styles.overlay} data-scroll>
          <div className={styles.content}>
            <h2 className={styles.title}>잠깐 쉬는 중</h2>
            {mode === 'stage' && stage && <GoalList stage={stage} progress={progress} />}
            <button className={styles.btn} onClick={togglePause}>이어한다냥</button>
            <div className={styles.btnRow}>
              <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={onOpenCollection}>도감</button>
              <button className={`${styles.btn} ${styles.secondaryBtn}`} onClick={goHome}>집에 가기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(GameOverlays);
