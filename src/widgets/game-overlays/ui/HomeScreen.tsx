import { memo, type ReactNode } from 'react';
import { CatBlock, type CatType } from '@/entities/cat';
import { DIFFICULTY_PRESETS, type DifficultyId } from '@/entities/difficulty';
import { STAGES } from '@/entities/stage';
import { THEMES, themePairOf, type ThemeId } from '@/shared/config';
import styles from './HomeScreen.module.css';

interface Props {
  highScore: number;
  difficulty: DifficultyId;
  clearedCount: number;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  onOpenSetup: () => void;
  onStartTutorial: () => void;
  onOpenCollection: () => void;
  onOpenStats: () => void;
  /** 열려 있으면 시작 시트가 이 자리(넓은 화면에서는 오른쪽 칼럼)에 들어온다 */
  sheet: ReactNode;
}

const PARADE: CatType[] = ['ginger', 'tuxedo', 'calico', 'siamese', 'bengal', 'white'];

function CatParade() {
  return (
    <div className={styles.parade} aria-hidden="true">
      {PARADE.map((cat, i) => (
        <div key={cat} className={styles.paradeCat} style={{ animationDelay: `${i * 0.14}s` }}>
          <CatBlock
            catType={cat}
            showFace
            showEars
            expression="happy"
            showTail={i === PARADE.length - 1}
            conn={{ top: false, bottom: false, left: i > 0, right: i < PARADE.length - 1 }}
          />
        </div>
      ))}
    </div>
  );
}

/** 시작 화면. 게임 시작 · 최고 기록 · 테마 · 튜토리얼만 남기고 나머지는 헤더 아이콘으로 뺐다 */
function HomeScreen({
  highScore, difficulty, clearedCount, theme, setTheme,
  onOpenSetup, onStartTutorial, onOpenCollection, onOpenStats, sheet,
}: Props) {
  const t = THEMES[theme];
  const pair = themePairOf(theme);

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <CatParade />
        <h2 className={styles.title}>냥 스택</h2>
        <p className={styles.kicker}>NYANG STACK</p>
        <p className={styles.tagline}>같은 냥이끼리 뭉치면 팡! 옆 냥이도 같이 날아감</p>
      </section>

      <div className={styles.gap} />

      <section className={styles.side}>
        <button className={styles.startBtn} onClick={onOpenSetup}>게임 시작</button>

        <div className={styles.bestRow}>
          <span className={styles.fieldLabel}>최고 기록 · {DIFFICULTY_PRESETS[difficulty].label}</span>
          <span className={styles.bestValue}>{highScore.toLocaleString()}</span>
        </div>

        {/* 넓은 화면에서는 시작 시트가 이 자리를 그대로 차지한다 (모바일에서는 바텀 시트로 떠오른다) */}
        {sheet ?? (
          <div className={styles.idlePanel}>
            <span className={styles.fieldLabel}>심심하냥?</span>
            <p className={styles.idleText}>게임 시작 누르면 모드랑 난이도 고르게 해줌. 오늘 미션은 오른쪽 위 아이콘. 그건 알아야지?</p>
            <div className={styles.idleFoot}>
              <span className={styles.fieldLabel}>클리어한 스테이지</span>
              <span className={styles.bestValue}>{clearedCount} / {STAGES.length}</span>
            </div>
          </div>
        )}

        <div className={styles.themeBox}>
          <div className={styles.themeText}>
            <span className={styles.fieldLabel}>테마</span>
            <span className={styles.themeMood}>{t.mood}</span>
          </div>
          <div className={styles.themeBtns} role="radiogroup" aria-label="테마">
            {pair.map(id => (
              <button
                key={id}
                role="radio"
                aria-checked={theme === id}
                className={`${styles.themeBtn} ${theme === id ? styles.themeBtnOn : ''}`}
                onClick={() => setTheme(id)}
              >
                <span
                  className={styles.swatch}
                  style={{ background: `linear-gradient(135deg, ${THEMES[id].bg} 0 55%, ${THEMES[id].accent} 55% 100%)` }}
                />
                {THEMES[id].label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.quickRow}>
          <button className={styles.ghostBtn} onClick={onOpenCollection}>도감</button>
          <button className={styles.ghostBtn} onClick={onOpenStats}>통계</button>
          <button className={styles.ghostBtn} onClick={onStartTutorial}>튜토리얼</button>
        </div>

        <button className={styles.link} onClick={onStartTutorial}>설명 또 들을래?</button>
      </section>
    </div>
  );
}

export default memo(HomeScreen);
