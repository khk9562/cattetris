import { missionLabel } from '@/entities/mission';
import type { MissionItem } from '@/features/daily-missions';
import { Icon } from '@/shared/ui';
import styles from './MissionList.module.css';

interface Props {
  items: MissionItem[];
  onClaim: (id: string) => void;
}

export default function MissionList({ items, onClaim }: Props) {
  return (
    <section className={styles.panel} aria-label="오늘의 미션">
      <h3 className={styles.heading}>오늘의 미션</h3>
      <ul className={styles.list}>
        {items.map(it => (
          <li key={it.mission.id} className={`${styles.item} ${it.done ? styles.done : ''}`}>
            <div className={styles.text}>
              <span className={styles.label}>{missionLabel(it.mission.goal)}</span>
              <span className={styles.reward}>칭호: {it.mission.title}</span>
              <span className={styles.bar}><span className={styles.fill} style={{ width: `${(it.current / it.target) * 100}%` }} /></span>
            </div>
            {it.claimed ? (
              <span className={styles.claimed}><Icon name="star" size="1rem" /> 완료</span>
            ) : it.done ? (
              <button className={styles.claimBtn} onClick={() => onClaim(it.mission.id)}>받기</button>
            ) : (
              <span className={styles.count}>{it.current.toLocaleString()}/{it.target.toLocaleString()}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
