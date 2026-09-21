import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
// 1. vuetify 플러그인을 import 합니다.
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig(function (configEnv) {
  const mode = configEnv.mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // ----------------------------------------------------
    // [추가] 배포 서브패스 기준 경로 설정
    // 빌드 시 index.html 내부의 JS/CSS/정적 파일 경로가 '/wcs-web/assets/...' 로 생성됩니다.
    // ----------------------------------------------------
    base: '/wcs-web/',
    plugins: [
      vue(),
      vuetify(),
      vueDevTools(),
      // 컴포넌트를 자동 임포트해주는 플러그인과 결합하면 더 강력합니다.
      Components({
        resolvers: [
          IconsResolver({
            prefix: 'icon', // <icon-mdi-home /> 처럼 쓸 수 있게 해줌
          }),
        ],
      }),
      Icons({
        autoInstall: true, // 없는 아이콘을 쓸 때 자동으로 패키지 설치
      }),
    ],
    define: {
      // sockjs-client의 Node.js 전역 객체 참조 에러 해결
      global: 'window',
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        // '/api' 로 시작하는 요청은 전부 target 으로 프록시해준다.
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:11421', // Spring 백엔드 서버 주소
          changeOrigin: true, // cross origin 허용
        },
      },
    },
  }
})
