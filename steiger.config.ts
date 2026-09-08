import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // 위젯/피처가 한 페이지에서만 쓰이는 단일 페이지 게임이라 슬라이스 병합 권고는 끕니다.
      'fsd/insignificant-slice': 'off',
    },
  },
]);
