import { memo } from 'react';
import { DIFFICULTY_ORDER, DIFFICULTY_PRESETS } from '@/entities/difficulty';
import type { Settings } from '@/features/settings';
import { THEMES, THEME_PAIRS } from '@/shared/config';
import { Icon } from '@/shared/ui';
import styles from './SettingsOverlay.module.css';

interface Props {
  settings: Settings;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onClose: () => void;
  onStartTutorial: () => void;
}

const TOGGLES: { key: 'sound' | 'music' | 'vibration' | 'gestures' | 'ghost'; label: string; hint: string }[] = [
  { key: 'sound', label: '효과음', hint: '이동, 회전, 폭발 소리' },
  { key: 'music', label: '배경음', hint: '플레이 중 배경 음악' },
  { key: 'vibration', label: '진동', hint: '고정, 줄 삭제, 폭발 시 진동' },
  { key: 'gestures', label: '보드 제스처', hint: '끌어서 이동, 아래로 튕겨 하드 드롭, 탭 회전' },
  { key: 'ghost', label: '고스트 블록', hint: '떨어질 위치 미리보기' },
];

function SettingsOverlay({ settings, onChange, onClose, onStartTutorial }: Props) {
  return (
    <div className={styles.overlay} role="dialog" aria-label="설정">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>설정</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="설정 닫기">
            <Icon name="close" size="1.5rem" />
          </button>
        </div>
        <div className={styles.body} data-scroll>
          {TOGGLES.map(t => (
            <label key={t.key} className={styles.row}>
              <span className={styles.rowText}>
                <span className={styles.rowLabel}>{t.label}</span>
                <span className={styles.rowHint}>{t.hint}</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                className={styles.switch}
                checked={settings[t.key]}
                aria-checked={settings[t.key]}
                onChange={e => onChange(t.key, e.target.checked)}
              />
            </label>
          ))}

          <div className={styles.row}>
            <span className={styles.rowText}>
              <span className={styles.rowLabel}>기본 난이도</span>
              <span className={styles.rowHint}>{DIFFICULTY_PRESETS[settings.difficulty].description}</span>
            </span>
            <div className={styles.segment} role="radiogroup" aria-label="기본 난이도">
              {DIFFICULTY_ORDER.map(id => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={settings.difficulty === id}
                  className={`${styles.segmentBtn} ${settings.difficulty === id ? styles.segmentActive : ''}`}
                  onClick={() => onChange('difficulty', id)}
                >
                  {DIFFICULTY_PRESETS[id].label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.rowText}>
              <span className={styles.rowLabel}>튜토리얼</span>
              <span className={styles.rowHint}>조작과 팡 규칙을 다시 배워요</span>
            </span>
            <button className={styles.actionBtn} onClick={onStartTutorial}>다시 보기</button>
          </div>

          <div className={`${styles.row} ${styles.themeRow}`}>
            <span className={styles.rowText}>
              <span className={styles.rowLabel}>테마</span>
              <span className={styles.rowHint}>{THEMES[settings.theme].name} · {THEMES[settings.theme].mood}</span>
            </span>
            <div className={styles.themeGroups} role="radiogroup" aria-label="테마">
              {THEME_PAIRS.map(pair => (
                <div key={pair.id} className={styles.themeGroup}>
                  <span className={styles.themeGroupLabel}>{pair.label}</span>
                  <div className={styles.themeChips}>
                    {pair.items.map(id => (
                      <button
                        key={id}
                        role="radio"
                        aria-checked={settings.theme === id}
                        className={`${styles.themeChip} ${settings.theme === id ? styles.themeChipOn : ''}`}
                        onClick={() => onChange('theme', id)}
                      >
                        <span
                          className={styles.themeSwatch}
                          style={{ background: `linear-gradient(135deg, ${THEMES[id].bg} 0 55%, ${THEMES[id].accent} 55% 100%)` }}
                        />
                        {THEMES[id].label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SettingsOverlay);
