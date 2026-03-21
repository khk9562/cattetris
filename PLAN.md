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
- [x] Vite + React + TypeScript 프로젝트 생성
- [x] 글로벌 CSS 작성 (폰트 import, CSS 변수 정의)
- [x] `index.html`에 Google Fonts + Material Symbols 링크 추가
- [x] 기본 App 컴포넌트 셋업

### Step 2: 게임 핵심 로직
- [x] `types.ts` - Position, Piece, CellValue, BoardState, GameStatus 타입
- [x] `constants.ts` - BOARD_WIDTH(10), BOARD_HEIGHT(20), 점수 테이블, 속도 테이블
- [x] `pieces.ts` - 7가지 테트로미노 shape 배열 + 회전 4상태 + 색상/고양이 종류
- [x] `board.ts` - 충돌 감지, 블록 배치, 줄 완성 체크, 줄 클리어
- [x] `useGame.ts` - 커스텀 훅 (useRef로 stale closure 해결 완료)

### Step 3: UI 컴포넌트
- [x] **Header** - 상단 고정바 (타이틀 + 타이머 + 일시정지 버튼 통합)
- [x] **StatsHUD** - High Score, Combo, Score 표시
- [x] **NextPreview** - 다음 블록 미리보기 (글라스모피즘 패널)
- [x] **Board** - 10x20 CSS Grid, 현재 블록 + 고정 블록 렌더링
- [x] **CatBlock** - 3D box-shadow + 고양이 얼굴 (회전 시에도 유지)
- [x] **Controls** - 하단 고정 (좌/회전/우/소프트드롭 버튼, 언마운트 시 interval 정리)
- [x] ~~**PauseButton**~~ → Header에 통합 완료

### Step 4: 터치 & 모바일 최적화
- [x] 버튼 터치 이벤트 (연속 입력 지원)
- [x] `touch-action: manipulation` 브라우저 기본 동작 방지
- [x] viewport 확대 방지
- [x] 100dvh 사용
- [x] 모든 크기를 상대 단위(rem, %, dvh)로 변환
- [x] 컨트롤 버튼 4개(좌/회전/드롭/우) 일렬 동일 크기 정렬
- [x] safe-area-inset-bottom 적용
- [x] 보드와 컨트롤 영역 겹침 방지 (CSS 변수로 영역 분리)

### Step 5: 게임 오버 & 재시작
- [x] 게임 오버 판정 (블록 스폰 불가 시)
- [x] 게임 오버 오버레이 (최종 점수, 재시작 버튼)
- [x] High Score localStorage 저장/불러오기

---

## UI 레이아웃 (목업 기준)

```
┌─────────────────────────────┐
│  [paw] Cat Tetris  00:00 [||] │  ← Header (타이머+일시정지 통합)
├───────────────────────────────┤
│                               │
│  ┌─────────┐  ┌──────────┐   │
│  │High Score│  │   Next   │   │  ← StatsHUD + NextPreview
│  │  12,450  │  │  [block] │   │
│  ├─────────┤  └──────────┘   │
│  │Combo  x4│                 │
│  │Score 2840│                 │
│  └─────────┘                 │
│                               │
│  ┌───────────────────────┐   │
│  │                       │   │
│  │     10 x 20 Grid      │   │  ← Board
│  │                       │   │
│  │     [cat blocks]      │   │
│  │                       │   │
│  └───────────────────────┘   │
│                               │
│  (◀)  (rotate)  (▼)  (▶)    │  ← Controls (일렬 동일 크기)
└───────────────────────────────┘
```

---

## 개선 사항 (v2)

코드 분석 후 발견된 UI/UX, 게임플레이, 기술적 개선 포인트.

### 1. UI/UX 개선

#### 1-1. 레벨 표시 없음
- 현재 `level`을 계산하지만 화면에 표시하지 않음
- StatsHUD 또는 Header에 현재 레벨 표시 추가
- 파일: `StatsHUD.tsx`

#### ~~1-2. 고양이 얼굴이 블록 하나에만 표시됨~~ (해결 완료)
- shape의 첫 번째 채워진 셀을 동적 탐색하도록 `findFaceCell()` 함수 추가
- Board.tsx, NextPreview.tsx 모두 수정 완료

#### 1-3. 컨트롤 영역이 보드와 겹칠 수 있음
- footer padding-bottom이 40px인데 컨트롤 버튼(회전 96px + 드롭 40px + gap 8px = 144px) 높이 고려 시 보드 하단이 가려질 수 있음
- main의 `margin-bottom: 140px`이 정확히 맞지 않을 수 있음 (safe-area-inset 미고려)
- `env(safe-area-inset-bottom)` 적용 필요
- 파일: `Controls.module.css`, `App.module.css`

#### 1-4. 줄 클리어 애니메이션 없음
- 줄이 클리어될 때 시각적 피드백 없이 즉시 사라짐
- 깜빡임 또는 슬라이드 애니메이션 추가
- 파일: `Board.tsx`, `Board.module.css`, `useGame.ts`

#### 1-5. 시작 화면이 밋밋함
- 현재 아이콘 + 타이틀 + 버튼만 있음
- 간단한 고양이 일러스트 또는 블록 장식 추가 검토

### 2. 게임플레이 개선

#### 2-1. 7-bag 랜덤 시스템 미적용
- 현재 순수 랜덤(`Math.random()`)으로 같은 블록이 연속 나올 수 있음
- 표준 테트리스는 7-bag 시스템 사용 (7종 블록을 한 세트로 섞어서 순서대로 제공)
- 파일: `pieces.ts`

#### 2-2. Lock delay 없음
- 블록이 바닥에 닿으면 즉시 고정됨 (`setTimeout(() => lockPiece(), 0)`)
- 바닥에 닿은 후 약 500ms 동안 좌우 이동/회전 허용 (lock delay)
- 이동하면 lock delay 리셋
- 파일: `useGame.ts`

#### 2-3. Hard drop 버튼이 없음
- 소프트 드롭 버튼만 있고, 즉시 떨어뜨리기(hard drop) 전용 버튼이 없음
- 소프트 드롭 버튼 더블탭 또는 별도 버튼 추가 검토
- 파일: `Controls.tsx`

#### 2-4. 게임 오버 시 하이스코어 갱신 표시 없음
- 새 하이스코어 달성 시 "New High Score!" 같은 피드백 없음
- 게임오버 오버레이에 조건부 표시 추가
- 파일: `App.tsx`

### 3. 기술적 개선

#### 3-1. 200개 셀 매 렌더마다 재생성
- `renderBoard`를 매 렌더마다 새로 복사 + 오버레이
- `React.memo`와 셀 단위 memoization 검토
- 또는 board + piece를 합친 결과를 `useMemo`로 캐싱
- 파일: `Board.tsx`

#### 3-2. useGame 훅의 의존성 경고 가능성
- auto drop useEffect에서 `moveDown`이 deps에 없음 (ESLint exhaustive-deps 경고)
- `moveDown`을 ref로 저장하여 해결
- 파일: `useGame.ts`

#### 3-3. 키보드 입력 미지원
- 모바일 전용이지만 개발/테스트 시 키보드 지원이 있으면 편리
- 방향키 + 스페이스(hard drop) + P(pause) 지원
- 파일: `useGame.ts` 또는 `App.tsx`

### 4. 개선 우선순위

| 우선순위 | 항목 | 상태 |
|---------|------|------|
| P0 | ~~1-2. 고양이 얼굴 표시 수정~~ | 완료 |
| P0 | ~~Controls 언마운트 interval 정리~~ | 완료 |
| P0 | ~~PauseButton Header 통합~~ | 완료 |
| P0 | ~~모든 크기 상대 단위(rem, %) 변환~~ | 완료 |
| P0 | 2-2. Lock delay 추가 | 미완료 |
| P1 | 2-1. 7-bag 랜덤 시스템 | 미완료 |
| P1 | 1-1. 레벨 표시 | 미완료 |
| P1 | ~~1-3. safe-area-inset 적용~~ | 완료 |
| P1 | 2-4. 하이스코어 갱신 표시 | 미완료 |
| P1 | 3-3. 키보드 입력 지원 | 미완료 |
| P2 | 1-4. 줄 클리어 애니메이션 | 미완료 |
| P2 | 2-3. Hard drop 버튼 | 미완료 |
| P2 | 3-1. Board 렌더링 최적화 | 미완료 |
| P2 | 1-5. 시작 화면 꾸미기 | 미완료 |

---

## 검증 방법
1. `npm run dev`로 개발 서버 실행
2. Chrome DevTools 모바일 뷰포트에서 확인
3. 블록 이동 / 회전 / 자동 낙하 동작 확인
4. 줄 클리어 및 점수/콤보 계산 확인
5. 일시정지 / 재개 동작 확인
6. 게임 오버 판정 및 재시작 확인
7. High Score localStorage 저장 확인
