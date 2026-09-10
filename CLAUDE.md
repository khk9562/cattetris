# 냥스택 (NYANG STACK) - Claude Code 규칙

## 커밋 컨벤션
- `FEAT:` - 새로운 기능 추가
- `FIX:` - 버그 수정
- `DOCS:` - PLAN.md 등 문서만 업데이트하는 경우
- 각 기능/수정은 개별 커밋으로 분리할 것

## 문서 규칙
- 코드 변경 시 항상 `PLAN.md`를 함께 업데이트할 것
- PLAN.md에는 현재 구현 상태, 개선 사항, 우선순위를 반영

## 스타일 규칙
- 모바일 우선. 넓은 화면(>= 46rem, 아이패드)에서는 시작 화면이 2열로 바뀐다. 어느 크기에서도 스크롤이 생기면 안 된다
- 절대 크기(px) 대신 상대 크기(rem, %, dvh) 사용
- CSS Modules 사용 (`.module.css`)
- 색은 직접 쓰지 말고 테마 변수(`--color-*`, `--accent-solid`, `--theme-line`)를 쓸 것. 원본은 `shared/config/theme.ts`
- 반경은 `--radius-sm/md/lg` (10/14/20px) 세 단계만. 알약(`9999px`)은 얇은 진행 바와 스위치에만

## 브랜치
- main 브랜치에 직접 푸시
