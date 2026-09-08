import { memo } from 'react';
import { STAGES, goalLabel, type StageDef } from '@/entities/stage';
import { Icon } from '@/shared/ui';
import styles from './StageSelect.module.css';

interface Props {
  stars: Record<number, number>;
  onSelect: (stage: StageDef) => void;
  onClose: () => void;
}

function goalSummary(stage: StageDef): string {
  return stage.goals.map(g => {
    switch (g.type) {
      case 'lines': return `줄 ${g.count}`;
      case 'explosions': return `폭발 ${g.count}`;
      case 'breed': return `${goalLabel(g)} ${g.count}`;
      case 'chain': return `${g.steps}연쇄`;
      case 'score': return `${g.points.toLocaleString()}점`;
    }
  }).join(' · ');
}

function StageSelect({ stars, onSelect, onClose }: Props) {
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);
  return (
    <div className={styles.overlay} role="dialog" aria-label="스테이지 선택">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>스테이지</h2>
          <span className={styles.total}><Icon name="star" size="1rem" /> {totalStars} / {STAGES.length * 3}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기"><Icon name="close" size="1.5rem" /></button>
        </div>
        <div className={styles.grid}>
          {STAGES.map((stage, i) => {
            const got = stars[stage.id] ?? 0;
            const unlocked = i === 0 || (stars[STAGES[i - 1].id] ?? 0) > 0;
            return (
              <button
                key={stage.id}
                className={`${styles.card} ${!unlocked ? styles.locked : ''} ${got ? styles.cleared : ''}`}
                disabled={!unlocked}
                onClick={() => onSelect(stage)}
                aria-label={`스테이지 ${stage.id} ${stage.title}${unlocked ? '' : ' 잠김'}`}
              >
                <span className={styles.num}>{stage.id}</span>
                <span className={styles.name}>{unlocked ? stage.title : '???'}</span>
                <span className={styles.goals}>{unlocked ? goalSummary(stage) : <Icon name="lock" size="1rem" />}</span>
                <span className={styles.stars} aria-label={`별 ${got}개`}>
                  {[1, 2, 3].map(n => <Icon key={n} name="star" size="0.9rem" style={{ opacity: n <= got ? 1 : 0.2 }} />)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(StageSelect);
