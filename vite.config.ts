/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'fonts/pretendard/pretendardvariable-dynamic-subset.css'],
      manifest: {
        name: '냥스택 NYANG STACK',
        short_name: '냥스택',
        description: '고양이를 쌓고 뭉치면 팡 터뜨리는 블록 퍼즐',
        lang: 'ko',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fdf6e3',
        theme_color: '#fdf6e3',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        // 폰트 서브셋(92개)은 첫 로드에 전부 받지 않고 쓰이는 것만 런타임 캐시
        globIgnores: ['**/fonts/pretendard/**'],
        runtimeCaching: [
          {
            urlPattern: /\/fonts\/pretendard\//,
            handler: 'CacheFirst',
            options: { cacheName: 'pretendard', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
