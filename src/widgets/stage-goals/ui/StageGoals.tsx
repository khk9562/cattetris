import { memo } from 'react';
import { limitLabel, stageProgress, type StageDef, type StageProgressInput } from '@/entities/stage';
import styles from './StageGoals.module.css';

interface Props {
  stage: StageDef;
  progress: StageProgressInput;
}

function StageGoals({ stage, progress }: Props) {
  const goals = stageProgress(stage, progress);
  const timed = stage.limit.type === 'seconds';
  return (
    <div className={styles.container}>
      <div className={styles.stageName}>
        <span className={styles.num}>{stage.id}</span>
        <span className={styles.title}>{stage.title}</span>
      </div>
      <div className={styles.goals}>
        {goals.map((g, i) => (
          <div key={i} className={`${styles.goal} ${g.done ? styles.done : ''}`}>
            <span className={styles.goalLabel}>{g.label}</span>
            <span className={styles.goalValue}>{g.current.toLocaleString()}/{g.target.toLocaleString()}</span>
            <span className={styles.bar}><span className={styles.fill} style={{ width: `${(g.current / g.target) * 100}%` }} /></span>
          </div>
        ))}
      </div>
      <div className={`${styles.limit} ${timed ? styles.timed : ''}`}>
        <span className={styles.limitLabel}>{timed ? '남은 시간' : '남은 조각'}</span>
        <span className={styles.limitValue}>{limitLabel(stage.limit, progress)}</span>
      </div>
    </div>
  );
}

export default memo(StageGoals);
