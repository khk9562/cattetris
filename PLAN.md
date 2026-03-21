# Cat Tetris - 개발 계획서

## Context
고양이 테마의 테트리스 게임을 React + TypeScript + CSS Modules로 개발한다.
모바일 전용이며, 제공된 HTML 목업을 기반으로 디자인과 기능을 구현한다.

---

## 기술 스택
| 항목 | 선택 |
|------|------|
| 프레임워크 | React 18 + TypeScript |
| 스타일링 | CSS Modules (`.module.css`) |
| 빌드 도구 | Vite |
| 폰트 | Plus Jakarta Sans, Be Vietnam Pro |
| 아이콘 | Material Symbols Outlined |
| 타겟 | 모바일 전용 |

---

## 프로젝트 구조
```
cattetris/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── PLAN.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.module.css
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── Header.module.css
│   │   ├── StatsHUD/
│   │   │   ├── StatsHUD.tsx
│   │   │   └── StatsHUD.module.css
│   │   ├── NextPreview/
│   │   │   ├── NextPreview.tsx
│   │   │   └── NextPreview.module.css
│   │   ├── Board/
│   │   │   ├── Board.tsx
│   │   │   └── Board.module.css
│   │   ├── CatBlock/
│   │   │   ├── CatBlock.tsx
│   │   │   └── CatBlock.module.css
│   │   ├── Controls/
│   │   │   ├── Controls.tsx
│   │   │   └── Controls.module.css
│   │   └── PauseButton/
│   │       ├── PauseButton.tsx
│   │       └── PauseButton.module.css
│   ├── game/
│   │   ├── types.ts           # 타입 정의
│   │   ├── constants.ts       # 보드 크기, 색상, 점수 테이블
│   │   ├── pieces.ts          # 7종 테트로미노 (고양이 종류별)
│   │   ├── board.ts           # 보드 로직 (충돌, 줄 클리어)
│   │   └── useGame.ts         # 게임 상태 관리 커스텀 훅
│   └── styles/
│       └── global.css         # 글로벌 스타일, CSS 변수, 폰트
```

---

## 디자인 토큰 (CSS 변수)
목업의 Tailwind 색상을 CSS 변수로 변환하여 사용한다.

```css
:root {
  --color-primary: #805100;
  --color-secondary: #983d4d;
  --color-tertiary: #006573;
  --color-surface: #fdf6e3;
  --color-background: #fdf6e3;
  --color-on-background: #322f22;
  --color-on-primary: #fff0e3;
  --color-primary-container: #feb246;
  --color-secondary-container: #ffc2c8;
  --color-secondary-fixed-dim: #ffaeb7;
  --color-tertiary-fixed: #7fe0f3;
  --color-tertiary-fixed-dim: #70d1e4;
  --color-surface-bright: #fdf6e3;
  --color-surface-dim: #dcd4bb;
  --color-surface-container: #efe8d2;
  --color-surface-container-low: #f8f0dc;
  --color-surface-container-high: #eae2cb;
  --color-surface-container-highest: #e4ddc5;
  --color-outline: #7b7767;
  --color-outline-variant: #b2ad9c;
  --color-error: #b02500;
}
```

---

## 고양이 블록 매핑
각 테트로미노를 고양이 종류에 매핑한다.

| 테트로미노 | 고양이 | 색상 |
|-----------|--------|------|
| I (직선) | Ginger (주황 고양이) | `#feb246` |
| O (사각) | Tuxedo (턱시도 고양이) | `#7fe0f3` |
| T (T자) | Russian Blue (러시안블루) | `#70d1e4` |
| S (S자) | Calico (삼색 고양이) | `#ffaeb7` |
| Z (Z자) | Siamese (샴 고양이) | `#f5e6d0` |
| J (J자) | Black Cat (검은 고양이) | `#4a4a4a` |
| L (L자) | Tabby (줄무늬 고양이) | `#c8956c` |

각 블록은 고양이 얼굴 디테일(눈 2개, 코)을 가진다.

---

## 구현 단계

### Step 1: 프로젝트 초기 설정
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] 글로벌 CSS 작성 (폰트 import, CSS 변수 정의)
- [ ] `index.html`에 Google Fonts + Material Symbols 링크 추가
- [ ] 기본 App 컴포넌트 셋업

### Step 2: 게임 핵심 로직
- [ ] `types.ts` - Position, Piece, CellValue, BoardState, GameStatus 타입
- [ ] `constants.ts` - BOARD_WIDTH(10), BOARD_HEIGHT(20), 점수 테이블, 속도 테이블
- [ ] `pieces.ts` - 7가지 테트로미노 shape 배열 + 회전 4상태 + 색상/고양이 종류
- [ ] `board.ts` - 충돌 감지, 블록 배치, 줄 완성 체크, 줄 클리어
- [ ] `useGame.ts` - 커스텀 훅
  - 상태: board, currentPiece, nextPiece, score, highScore, combo, level, timer, gameStatus
  - 액션: moveLeft, moveRight, rotate, softDrop, hardDrop, pause, restart
  - 자동 낙하 (setInterval, 레벨별 속도 증가)
  - 줄 클리어 시 콤보 계산 및 점수 반영

### Step 3: UI 컴포넌트
- [ ] **Header** - 상단 고정바 (타이틀 + 타이머)
- [ ] **StatsHUD** - High Score, Combo, Score 표시
- [ ] **NextPreview** - 다음 블록 미리보기 (글라스모피즘 패널)
- [ ] **Board** - 10x20 CSS Grid, 현재 블록 + 고정 블록 렌더링
- [ ] **CatBlock** - 3D box-shadow + 고양이 얼굴 (눈, 코)
- [ ] **Controls** - 하단 고정 (좌/회전/우 버튼)
- [ ] **PauseButton** - 우하단 FAB

### Step 4: 터치 & 모바일 최적화
- [ ] 버튼 터치 이벤트 (연속 입력 지원)
- [ ] 보드 스와이프 다운 = hard drop
- [ ] `touch-action: none` 브라우저 기본 동작 방지
- [ ] viewport 확대 방지
- [ ] 100dvh 사용

### Step 5: 게임 오버 & 재시작
- [ ] 게임 오버 판정 (블록 스폰 불가 시)
- [ ] 게임 오버 오버레이 (최종 점수, 재시작 버튼)
- [ ] High Score localStorage 저장/불러오기

---

## UI 레이아웃 (목업 기준)

```
┌─────────────────────────────┐
│  [paw] Cat Tetris    00:00  │  ← Header (fixed top)
├─────────────────────────────┤
│                             │
│  ┌─────────┐  ┌──────────┐ │
│  │High Score│  │   Next   │ │  ← StatsHUD + NextPreview
│  │  12,450  │  │  [block] │ │
│  ├─────────┤  └──────────┘ │
│  │Combo  x4│               │
│  │Score 2840│               │
│  └─────────┘               │
│                             │
│  ┌─────────────────────┐   │
│  │                     │   │
│  │    10 x 20 Grid     │   │  ← Board
│  │                     │   │
│  │    [cat blocks]     │   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│                      [||]   │  ← PauseButton (FAB)
│                             │
│   (◀)    (rotate)    (▶)   │  ← Controls (fixed bottom)
└─────────────────────────────┘
```

---

## 검증 방법
1. `npm run dev`로 개발 서버 실행
2. Chrome DevTools 모바일 뷰포트에서 확인
3. 블록 이동 / 회전 / 자동 낙하 동작 확인
4. 줄 클리어 및 점수/콤보 계산 확인
5. 일시정지 / 재개 동작 확인
6. 게임 오버 판정 및 재시작 확인
7. High Score localStorage 저장 확인
