import { createBoard, type Board } from '@/entities/board';
import type { DifficultyPreset } from '@/entities/difficulty';
import type { FeedbackKind, StartSetup } from '@/features/game-session/@x/tutorial';
import { BOARD_HEIGHT } from '@/shared/config';

export type CoachTarget = 'board' | 'left' | 'right' | 'rotate' | 'drop' | 'hold' | 'none';

export interface TutorialStep {
  id: string;
  title: string;
  text: string;
  target: CoachTarget;
  /** 이 이벤트가 오면 완료. 'button'이면 다음 버튼으로 진행 */
  done: FeedbackKind | 'button';
  /** 이 단계에 들어올 때 새 판을 시작해야 하면 셋업을 지정 */
  setup?: StartSetup;
  presetOverride?: Partial<DifficultyPreset>;
}

/** 튜토리얼 공통 프리셋: 천천히 떨어지고, 10마리면 팡 */
export const TUTORIAL_PRESET: Partial<DifficultyPreset> = {
  startLevel: 1,
  gravityScale: 4,
  clusterThreshold: 10,
  lockDelayMs: 900,
  lockResetLimit: 30,
  breedsStart: 4,
  breedsMax: 4,
};

function lineBoard(): Board {
  const b = createBoard();
  const breeds = ['black', 'tabby', 'ginger', 'tuxedo'] as const;
  for (let x = 1; x < 10; x++) b[BOARD_HEIGHT - 1][x] = breeds[x % breeds.length];
  return b;
}

function clusterBoard(): Board {
  const b = createBoard();
  // 바닥 가운데 시암 7마리 (O 조각 4마리가 붙으면 11마리 = 팡)
  for (let x = 2; x <= 8; x++) b[BOARD_HEIGHT - 1][x] = 'siamese';
  b[BOARD_HEIGHT - 1][0] = 'black';
  b[BOARD_HEIGHT - 2][0] = 'black';
  b[BOARD_HEIGHT - 1][9] = 'tabby';
  return b;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'move',
    title: '옮기기',
    text: '보드를 좌우로 끌거나 ◀ ▶ 버튼으로 냥이를 옮겨 보세요.',
    target: 'board',
    done: 'move',
    setup: {
      pieces: [
        { id: 'T', catType: 'ginger' },
        { id: 'L', catType: 'tuxedo' },
        { id: 'O', catType: 'tabby' },
        { id: 'S', catType: 'black' },
      ],
    },
    presetOverride: TUTORIAL_PRESET,
  },
  { id: 'rotate', title: '돌리기', text: '보드를 톡 탭하거나 회전 버튼을 눌러 돌려 보세요.', target: 'rotate', done: 'rotate' },
  { id: 'hardDrop', title: '내려놓기', text: '보드를 아래로 튕기면 바로 떨어져요. (키보드는 Space)', target: 'board', done: 'hardDrop' },
  { id: 'hold', title: '홀드', text: '홀드 칸을 탭하면 지금 냥이를 맡겨 두고 나중에 꺼낼 수 있어요.', target: 'hold', done: 'hold' },
  {
    id: 'line',
    title: '줄 지우기',
    text: '한 줄을 가득 채우면 사라져요. 세로로 세운 냥이를 왼쪽 빈칸에 넣어 보세요.',
    target: 'board',
    done: 'line',
    setup: { board: lineBoard(), pieces: [{ id: 'I', catType: 'ginger' }, { id: 'I', catType: 'ginger' }] },
    presetOverride: TUTORIAL_PRESET,
  },
  {
    id: 'explode',
    title: '팡!',
    text: '같은 냥이가 10마리 붙으면 팡 터지고 주변까지 같이 터져요. 샴 냥이를 아래 샴 무리 위에 붙여 보세요.',
    target: 'board',
    done: 'explode',
    setup: { board: clusterBoard(), pieces: [{ id: 'O', catType: 'siamese' }, { id: 'O', catType: 'siamese' }, { id: 'I', catType: 'siamese' }] },
    presetOverride: TUTORIAL_PRESET,
  },
  {
    id: 'finish',
    title: '준비 끝!',
    text: '무한 모드는 난이도 하/중/상, 스테이지 모드는 목표 30개, 매일 미션을 완료하면 칭호를 받아요. 즐거운 냥스택!',
    target: 'none',
    done: 'button',
  },
];

export interface TutorialState {
  active: boolean;
  stepIndex: number;
  completed: boolean;
}

export const INITIAL_TUTORIAL: TutorialState = { active: false, stepIndex: 0, completed: false };

export type TutorialAction =
  | { type: 'begin' }
  | { type: 'event'; kind: FeedbackKind }
  | { type: 'next' }
  | { type: 'skip' }
  | { type: 'exit' };

export function tutorialReducer(s: TutorialState, a: TutorialAction): TutorialState {
  switch (a.type) {
    case 'begin':
      return { active: true, stepIndex: 0, completed: false };
    case 'exit':
      return { ...s, active: false };
    case 'skip':
      return { active: false, stepIndex: s.stepIndex, completed: true };
    case 'next': {
      if (!s.active) return s;
      const step = TUTORIAL_STEPS[s.stepIndex];
      if (step.done !== 'button') return s;
      return advance(s);
    }
    case 'event': {
      if (!s.active) return s;
      const step = TUTORIAL_STEPS[s.stepIndex];
      if (step.done !== a.kind) return s;
      return advance(s);
    }
  }
}

function advance(s: TutorialState): TutorialState {
  const next = s.stepIndex + 1;
  if (next >= TUTORIAL_STEPS.length) return { active: false, stepIndex: s.stepIndex, completed: true };
  return { ...s, stepIndex: next };
}

/** 현재 단계가 속한 구간의 시작 단계 (게임오버 시 다시 시작할 셋업) */
export function segmentStart(stepIndex: number): TutorialStep {
  for (let i = stepIndex; i >= 0; i--) {
    if (TUTORIAL_STEPS[i].setup) return TUTORIAL_STEPS[i];
  }
  return TUTORIAL_STEPS[0];
}
