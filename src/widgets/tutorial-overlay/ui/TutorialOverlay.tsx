import { memo, useEffect } from 'react';
import { CatBlock } from '@/entities/cat';
import type { TutorialStep } from '@/features/tutorial';
import styles from './TutorialOverlay.module.css';

interface Props {
  step: TutorialStep;
  stepIndex: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}

function TutorialOverlay({ step, stepIndex, total, onNext, onSkip }: Props) {
  // 강조 대상은 전역 data-coach 속성으로 알린다 (global.css의 [data-coach-target] 규칙)
  useEffect(() => {
    document.body.dataset.coach = step.target;
    return () => { delete document.body.dataset.coach; };
  }, [step.target]);

  const last = stepIndex === total - 1;
  return (
    <div className={`${styles.card} ${last ? styles.cardCenter : ''}`} role="dialog" aria-live="polite" aria-label="튜토리얼">
      <div className={styles.cat}>
        <CatBlock catType={last ? 'calico' : 'ginger'} showFace showEars expression="happy" />
      </div>
      <div className={styles.body}>
        <p className={styles.title}>
          <span className={styles.stepNum}>{stepIndex + 1}/{total}</span> {step.title}
        </p>
        <p className={styles.text}>{step.text}</p>
        <div className={styles.dots} aria-hidden="true">
          {Array.from({ length: total }, (_, i) => <span key={i} className={`${styles.dot} ${i <= stepIndex ? styles.dotOn : ''}`} />)}
        </div>
      </div>
      <div className={styles.actions}>
        {step.done === 'button' ? (
          <button className={styles.primary} onClick={onNext}>시작하기</button>
        ) : (
          <button className={styles.secondary} onClick={onSkip}>건너뛰기</button>
        )}
      </div>
    </div>
  );
}

export default memo(TutorialOverlay);
