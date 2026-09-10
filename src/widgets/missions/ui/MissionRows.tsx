import { missionLabel } from '@/entities/mission';
import type { MissionItem } from '@/features/daily-missions';
import styles from './MissionRows.module.css';

interface Props {
  items: MissionItem[];
  /** 받기 버튼을 붙일지 (첫 접속 팝업에서는 읽기만 한다) */
  onClaim?: (id: string) => void;
}

/** 오늘의 미션 세 줄. 팝오버와 팝업이 같은 모양을 쓴다 */
export default function MissionRows({ items, onClaim }: Props) {
  return (
    <ul className={styles.list}>
      {items.map(it => (
        <li key={it.mission.id} className={`${styles.item} ${it.done ? styles.done : ''}`}>
          <div className={styles.text}>
            <div className={styles.head}>
              <span className={styles.label}>{missionLabel(it.mission.goal)}</span>
              <span className={styles.count}>{it.current.toLocaleString()} / {it.target.toLocaleString()}</span>
            </div>
            <span className={styles.bar}>
              <span className={styles.fill} style={{ width: `${Math.min(100, (it.current / it.target) * 100)}%` }} />
            </span>
            <span className={styles.reward}>칭호 · {it.mission.title}</span>
          </div>
          {onClaim && it.done && (
            it.claimed
              ? <span className={styles.claimed}>받음</span>
              : <button className={styles.claimBtn} onClick={() => onClaim(it.mission.id)}>받기</button>
          )}
        </li>
      ))}
    </ul>
  );
}
