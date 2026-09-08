import { useCallback, useMemo, useState } from 'react';
import { EMPTY_PROGRESS, dateKey, generateDailyMissions, mergeProgress, missionProgress, type DailyProgress } from '@/entities/mission';
import { MISSIONS_KEY, TITLES_KEY } from '@/shared/config';
import { readJson, writeJson } from '@/shared/lib';

interface Stored {
  date: string;
  progress: DailyProgress;
  claimed: string[];
}

function loadToday(): Stored {
  const today = dateKey();
  const stored = readJson<Stored | null>(MISSIONS_KEY, null);
  if (stored && stored.date === today) return { ...stored, progress: { ...EMPTY_PROGRESS, ...stored.progress } };
  return { date: today, progress: EMPTY_PROGRESS, claimed: [] };
}

export function useDailyMissions() {
  const [stored, setStored] = useState<Stored>(loadToday);
  const [titles, setTitles] = useState<string[]>(() => readJson<string[]>(TITLES_KEY, []));

  const missions = useMemo(() => generateDailyMissions(stored.date), [stored.date]);

  /** 한 판의 결과를 오늘 진행에 더한다 (날짜가 바뀌었으면 새로 시작) */
  const addProgress = useCallback((delta: DailyProgress) => {
    setStored(prev => {
      const base = prev.date === dateKey() ? prev : { date: dateKey(), progress: EMPTY_PROGRESS, claimed: [] };
      const next = { ...base, progress: mergeProgress(base.progress, delta) };
      writeJson(MISSIONS_KEY, next);
      return next;
    });
  }, []);

  const claim = useCallback((missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;
    setStored(prev => {
      if (prev.claimed.includes(missionId) || !missionProgress(mission.goal, prev.progress).done) return prev;
      const next = { ...prev, claimed: [...prev.claimed, missionId] };
      writeJson(MISSIONS_KEY, next);
      return next;
    });
    setTitles(prev => {
      if (prev.includes(mission.title)) return prev;
      const next = [...prev, mission.title];
      writeJson(TITLES_KEY, next);
      return next;
    });
  }, [missions]);

  const items = useMemo(
    () => missions.map(m => ({ mission: m, ...missionProgress(m.goal, stored.progress), claimed: stored.claimed.includes(m.id) })),
    [missions, stored],
  );

  return {
    items,
    progress: stored.progress,
    addProgress,
    claim,
    titles,
    /** 가장 최근에 얻은 칭호 */
    currentTitle: titles[titles.length - 1] ?? null,
  };
}

export type DailyMissionsController = ReturnType<typeof useDailyMissions>;
export type MissionItem = DailyMissionsController['items'][number];
