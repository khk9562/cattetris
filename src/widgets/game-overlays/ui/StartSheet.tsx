import { memo } from 'react';
import { DIFFICULTY_ORDER, DIFFICULTY_PRESETS, type DifficultyId } from '@/entities/difficulty';
import { STAGES, type StageDef } from '@/entities/stage';
import type { GameMode } from '@/features/game-session';
import { Icon } from '@/shared/ui';
import styles from './StartSheet.module.css';

interface Props {
  mode: GameMode;
  onSelectMode: (m: GameMode) => void;
  difficulty: DifficultyId;
  onSelectDifficulty: (id: DifficultyId) => void;
  nextUnclearedStage: StageDef;
  clearedCount: number;
  onStart: () => void;
  onClose: () => void;
}

const MODES: { id: GameMode; title: string; desc: string }[] = [
  { id: 'endless', title: '무한', desc: '기록 깨보든가' },
  { id: 'stage', title: '스테이지', desc: '30판 · 별 뺏어오기' },
];

/** 게임 시작을 누르면 열리는 모드·난이도 선택 */
function StartSheet({
  mode, onSelectMode, difficulty, onSelectDifficulty,
  nextUnclearedStage, clearedCount, onStart, onClose,
}: Props) {
  const preset = DIFFICULTY_PRESETS[difficulty];
  const modeLabel = mode === 'endless' ? '무한' : '스테이지';

  return (
    <>
      <button className={styles.scrim} onClick={onClose} aria-label="닫기" tabIndex={-1} />
      <div className={styles.sheet} role="dialog" aria-label="게임 시작">
        <div className={styles.grip} />
        <div className={styles.head}>
          <span className={styles.title}>골라라냥</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <Icon name="close" size="1.25rem" />
          </button>
        </div>

        <div className={styles.modeRow} role="radiogroup" aria-label="모드">
          {MODES.map(m => (
            <button
              key={m.id}
              role="radio"
              aria-checked={mode === m.id}
              className={`${styles.modeCard} ${mode === m.id ? styles.modeCardOn : ''}`}
              onClick={() => onSelectMode(m.id)}
            >
              <span className={styles.modeTitle}>{m.title}</span>
              <span className={styles.modeDesc}>{m.desc}</span>
            </button>
          ))}
        </div>

        {mode === 'endless' ? (
          <div className={styles.diffGroup}>
            <span className={styles.fieldLabel}>난이도</span>
            <div className={styles.segRow} role="radiogroup" aria-label="난이도">
              {DIFFICULTY_ORDER.map(id => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={difficulty === id}
                  className={`${styles.segBtn} ${difficulty === id ? styles.segBtnOn : ''}`}
                  onClick={() => onSelectDifficulty(id)}
                >
                  {DIFFICULTY_PRESETS[id].label}
                </button>
              ))}
            </div>
            <span className={styles.diffDesc}>{preset.description}</span>
          </div>
        ) : (
          <p className={styles.stageNote}>
            <span>다음 판 · {nextUnclearedStage.title}</span>
            <strong>{clearedCount} / {STAGES.length}</strong>
          </p>
        )}

        <button className={styles.confirmBtn} onClick={onStart}>
          {mode === 'endless'
            ? `${modeLabel} · ${preset.label}(으)로 간다냥`
            : `스테이지 ${nextUnclearedStage.id}(으)로 간다냥`}
        </button>
      </div>
    </>
  );
}

export default memo(StartSheet);
