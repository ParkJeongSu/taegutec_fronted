<template>
  <v-app class="auth-app-container">
    <v-main class="auth-main-wrapper d-flex align-center justify-center">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
// AuthLayout: 메인 탭 윈도우와 분리된 인증 전용 독립 레이아웃
</script>

<style scoped>
.auth-app-container {
  min-height: 100vh;
}

.auth-main-wrapper {
  min-height: 100vh;
  /* 딥 네이비-슬레이트(#0f172a)에 대구텍 에메랄드/틸 그린(#004d40, #00796b) 소프트 그라데이션 */
  background:
    radial-gradient(circle at 85% 15%, rgba(0, 121, 107, 0.22) 0%, transparent 45%),
    radial-gradient(circle at 15% 85%, rgba(0, 77, 64, 0.28) 0%, transparent 45%),
    radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.6) 0%, transparent 100%),
    linear-gradient(135deg, #0f172a 0%, #111c2e 40%, #09131f 100%);
  position: relative;
  overflow: hidden;
}

.auth-main-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}
</style>
