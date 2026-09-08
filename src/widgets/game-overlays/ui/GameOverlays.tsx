import { memo } from 'react';
import { CatBlock, type CatType } from '@/entities/cat';
import { DIFFICULTY_ORDER, DIFFICULTY_PRESETS, type DifficultyId } from '@/entities/difficulty';
import { STAGES, stageProgress, type StageDef, type StageProgressInput } from '@/entities/stage';
import type { MissionItem } from '@/features/daily-missions';
import type { GameMode, GameStatus, SessionStats } from '@/features/game-session';
import type { ThemeId } from '@/shared/config';
import { Icon } from '@/shared/ui';
import MissionList from './MissionList';
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
  startGame: () => void;
  startStage: (stage: StageDef) => void;
  retryStage: () => void;
  nextStage: () => void;
  onOpenStages: () => void;
  showTutorialPrompt: boolean;
  onStartTutorial: () => void;
  togglePause: () => void;
  goHome: () => void;
  onOpenCollection: () => void;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  missions: MissionItem[];
  onClaimMission: (id: string) => void;
  playerTitle: string | null;
}

const PARADE: CatType[] = ['ginger', 'tuxedo', 'calico', 'siamese', 'bengal', 'white'];

function CatParade() {
  return (
    <div className={styles.parade} aria-hidden="true">
      {PARADE.map((cat, i) => (
        <div key={cat} className={styles.paradeCat} style={{ animationDelay: `${i * 0.15}s` }}>
          <CatBlock catType={cat} showFace showEars expression="happy" showTail={i === PARADE.length - 1} conn={{ top: false, bottom: false, left: i > 0, right: i < PARADE.length - 1 }} />
        </div>
      ))}
    </div>
  );
}

function Stars({ count, animate }: { count: number; animate?: boolean }) {
  return (
    <div className={styles.stars} aria-label={`별 ${count}개`}>
      {[1, 2, 3].map(n => (
        <span key={n} className={`${styles.star} ${n <= count ? styles.starOn : ''} ${animate && n <= count ? styles.starPop : ''}`} style={{ animationDelay: `${n * 0.18}s` }}>
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
  startGame, startStage, retryStage, nextStage, onOpenStages, showTutorialPrompt, onStartTutorial, togglePause, goHome, onOpenCollection, theme, setTheme,
  missions, onClaimMission, playerTitle,
}: Props) {
  // 튜토리얼 중 게임오버는 훅이 곧바로 구간을 다시 시작하므로 화면을 띄우지 않는다
  if (mode === 'tutorial' && status === 'gameover') return null;
  if (status === 'playing') return null;
  const preset = DIFFICULTY_PRESETS[difficulty];
  const clearedCount = Object.keys(stageStars).length;
  const hasNext = stage ? STAGES.some(s => s.id === stage.id + 1) : false;

  return (
    <>
      {status === 'ready' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <CatParade />
            <h2 className={styles.overlayTitle}>냥스택</h2>
            <p className={styles.subtitle}>NYANG STACK</p>
            {playerTitle ? (
              <p className={styles.playerTitle}><Icon name="star" size="0.9rem" /> {playerTitle}</p>
            ) : (
              <p className={styles.tagline}>같은 냥이끼리 모이면 팡! 주변까지 같이 터져요</p>
            )}

            {showTutorialPrompt && (
              <button className={styles.tutorialPrompt} onClick={onStartTutorial}>
                <Icon name="bolt" size="1.1rem" /> 처음이세요? 30초 튜토리얼
              </button>
            )}

            <div className={styles.modeTabs} role="tablist" aria-label="모드">
              <button role="tab" aria-selected={menuMode === 'endless'} className={`${styles.modeTab} ${menuMode === 'endless' ? styles.modeActive : ''}`} onClick={() => onSelectMenuMode('endless')}>무한</button>
              <button role="tab" aria-selected={menuMode === 'stage'} className={`${styles.modeTab} ${menuMode === 'stage' ? styles.modeActive : ''}`} onClick={() => onSelectMenuMode('stage')}>스테이지</button>
            </div>

            {menuMode === 'endless' ? (
              <>
                <div className={styles.difficultyGroup} role="radiogroup" aria-label="난이도">
                  {DIFFICULTY_ORDER.map(id => (
                    <button key={id} role="radio" aria-checked={difficulty === id} className={`${styles.difficultyBtn} ${difficulty === id ? styles.difficultyActive : ''}`} onClick={() => onSelectDifficulty(id)}>
                      {DIFFICULTY_PRESETS[id].label}
                    </button>
                  ))}
                </div>
                <p className={styles.difficultyDesc}>{preset.description}</p>
                <p className={styles.highScoreLabel}>최고 기록 ({preset.label})</p>
                <p className={styles.highScoreValue}>{highScore.toLocaleString()}</p>
                <button className={styles.startBtn} onClick={startGame}>게임 시작</button>
              </>
            ) : (
              <>
                <div className={styles.stageCard}>
                  <span className={styles.stageNum}>스테이지 {nextUnclearedStage.id}</span>
                  <span className={styles.stageTitle}>{nextUnclearedStage.title}</span>
                  <GoalList stage={nextUnclearedStage} progress={{ lines: 0, explosions: 0, destroyed: {}, maxChain: -1, score: 0, piecesPlaced: 0, elapsedMs: 0 }} />
                  <span className={styles.stageLimit}>{nextUnclearedStage.limit.type === 'pieces' ? `조각 ${nextUnclearedStage.limit.count}개 안에` : `${nextUnclearedStage.limit.count}초 안에`}</span>
                </div>
                <p className={styles.difficultyDesc}>클리어 {clearedCount} / {STAGES.length}</p>
                <button className={styles.startBtn} onClick={() => startStage(nextUnclearedStage)}>스테이지 {nextUnclearedStage.id} 시작</button>
                <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={onOpenStages}>스테이지 목록</button>
              </>
            )}

            <MissionList items={missions} onClaim={onClaimMission} />

            <div className={styles.themeSelector}>
              <button className={`${styles.themeIcon} ${theme === 'default' ? styles.themeActive : ''}`} onClick={() => setTheme('default')} aria-label="기본 테마"><Icon name="moon" /></button>
              <button className={`${styles.themeIcon} ${theme === 'grass' ? styles.themeActive : ''}`} onClick={() => setTheme('grass')} aria-label="잔디 테마"><Icon name="grass" /></button>
              <button className={styles.themeIcon} onClick={onStartTutorial} aria-label="튜토리얼"><Icon name="help" /></button>
            </div>
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={onOpenCollection}>도감</button>
          </div>
        </div>
      )}

      {status === 'cleared' && stage && (
        <div className={`${styles.overlay} ${styles.overlayGameover}`}>
          <div className={styles.overlayContent}>
            <h2 className={styles.overlayTitle}>클리어!</h2>
            <p className={styles.finalLabel}>스테이지 {stage.id} · {stage.title}</p>
            <Stars count={lastStars ?? 1} animate />
            <p className={styles.finalScore}>{score.toLocaleString()}</p>
            <p className={styles.finalLabel}>점수</p>
            <GoalList stage={stage} progress={progress} />
            {hasNext ? (
              <button className={styles.startBtn} onClick={nextStage}>다음 스테이지</button>
            ) : (
              <p className={styles.newRecord}><Icon name="trophy" size="1.25rem" /> 모든 스테이지 클리어!</p>
            )}
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={retryStage}>다시 도전</button>
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={goHome}>메인 메뉴</button>
          </div>
        </div>
      )}

      {status === 'gameover' && (
        <div className={`${styles.overlay} ${styles.overlayGameover}`}>
          <div className={styles.overlayContent}>
            <h2 className={styles.overlayTitle}>{mode === 'stage' ? '아쉬워요' : '게임 오버!'}</h2>
            {mode === 'stage' && stage ? (
              <>
                <p className={styles.finalLabel}>스테이지 {stage.id} · {stage.title}</p>
                <GoalList stage={stage} progress={progress} />
                <p className={styles.finalScore}>{score.toLocaleString()}</p>
                <p className={styles.finalLabel}>점수</p>
                <button className={styles.startBtn} onClick={retryStage}>다시 도전</button>
                <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={onOpenStages}>스테이지 목록</button>
              </>
            ) : (
              <>
                {isNewHighScore && (
                  <p className={styles.newRecord}><Icon name="trophy" size="1.25rem" /> 신기록!</p>
                )}
                <p className={styles.finalScore}>{score.toLocaleString()}</p>
                <p className={styles.finalLabel}>점수 · {preset.label} 난이도</p>
                <div className={styles.summary}>
                  <div><span>레벨</span><strong>{level}</strong></div>
                  <div><span>줄</span><strong>{stats.linesCleared}</strong></div>
                  <div><span>폭발</span><strong>{stats.explosions}</strong></div>
                  <div><span>최대 연쇄</span><strong>{stats.maxChain + 1}</strong></div>
                </div>
                {highScore > 0 && !isNewHighScore && (
                  <>
                    <p className={styles.highScoreLabel}>최고 기록</p>
                    <p className={styles.highScoreValue}>{highScore.toLocaleString()}</p>
                  </>
                )}
                <button className={styles.startBtn} onClick={startGame}>다시 하기</button>
              </>
            )}
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={onOpenCollection}>도감</button>
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={goHome}>메인 메뉴</button>
          </div>
        </div>
      )}

      {status === 'paused' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2 className={styles.overlayTitle}>일시 정지</h2>
            {mode === 'stage' && stage && <GoalList stage={stage} progress={progress} />}
            <button className={styles.startBtn} onClick={togglePause}>이어하기</button>
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={onOpenCollection}>도감</button>
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={goHome}>메인 메뉴</button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(GameOverlays);
