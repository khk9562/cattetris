import { memo } from 'react';
import { DIFFICULTY_ORDER, DIFFICULTY_PRESETS, type DifficultyId } from '@/entities/difficulty';
import type { GameStatus, SessionStats } from '@/features/game-session';
import type { Theme } from '@/features/theme';
import { Icon } from '@/shared/ui';
import styles from './GameOverlays.module.css';

interface Props {
  status: GameStatus;
  score: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  stats: SessionStats;
  difficulty: DifficultyId;
  onSelectDifficulty: (id: DifficultyId) => void;
  startGame: () => void;
  togglePause: () => void;
  goHome: () => void;
  onOpenCollection: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

function GameOverlays({
  status, score, level, highScore, isNewHighScore, stats, difficulty, onSelectDifficulty,
  startGame, togglePause, goHome, onOpenCollection, theme, setTheme,
}: Props) {
  if (status === 'playing') return null;
  const preset = DIFFICULTY_PRESETS[difficulty];

  return (
    <>
      {status === 'ready' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <Icon name="paw" size="4rem" style={{ color: 'var(--color-primary)' }} />
            <h2 className={styles.overlayTitle}>CAT TETRIS</h2>

            <div className={styles.difficultyGroup} role="radiogroup" aria-label="난이도">
              {DIFFICULTY_ORDER.map(id => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={difficulty === id}
                  className={`${styles.difficultyBtn} ${difficulty === id ? styles.difficultyActive : ''}`}
                  onClick={() => onSelectDifficulty(id)}
                >
                  {DIFFICULTY_PRESETS[id].label}
                </button>
              ))}
            </div>
            <p className={styles.difficultyDesc}>{preset.description}</p>

            <p className={styles.highScoreLabel}>최고 기록 ({preset.label})</p>
            <p className={styles.highScoreValue}>{highScore.toLocaleString()}</p>

            <div className={styles.themeSelector}>
              <button
                className={`${styles.themeIcon} ${theme === 'default' ? styles.themeActive : ''}`}
                onClick={() => setTheme('default')}
                aria-label="기본 테마"
              >
                <Icon name="moon" />
              </button>
              <button
                className={`${styles.themeIcon} ${theme === 'grass' ? styles.themeActive : ''}`}
                onClick={() => setTheme('grass')}
                aria-label="잔디 테마"
              >
                <Icon name="grass" />
              </button>
            </div>

            <button className={styles.startBtn} onClick={startGame}>게임 시작</button>
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={onOpenCollection}>도감</button>
          </div>
        </div>
      )}

      {status === 'gameover' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2 className={styles.overlayTitle}>게임 오버!</h2>
            {isNewHighScore && (
              <p className={styles.newRecord}>
                <Icon name="trophy" size="1.25rem" /> 신기록!
              </p>
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
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={onOpenCollection}>도감</button>
            <button className={`${styles.startBtn} ${styles.secondaryBtn}`} onClick={goHome}>메인 메뉴</button>
          </div>
        </div>
      )}

      {status === 'paused' && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2 className={styles.overlayTitle}>일시 정지</h2>
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
