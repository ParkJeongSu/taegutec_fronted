<template>
  <RouterView />
  <!-- 🔒 10분 유휴 시 전체 화면을 차단하는 세션 락 다이얼로그 -->
  <SessionLockDialog />
</template>

<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menuStore'
import SessionLockDialog from '@/components/common/SessionLockDialog.vue'
import { useIdleLock } from '@/composables/useIdleLock'

const authStore = useAuthStore()
const menuStore = useMenuStore()
const { startWatch, stopWatch } = useIdleLock()

// 로그인 상태 및 ADMIN 권한 여부에 따른 실시간 타이머 작동 감시
watch(
  function () {
    return {
      isAuth: authStore.isAuthenticated,
      isAdmin: authStore.isAdmin,
    }
  },
  function (newVal) {
    if (newVal.isAuth && !newVal.isAdmin) {
      // 일반 사용자 로그인 시 유휴 감시 시작
      startWatch()
    } else {
      // ADMIN이거나 로그아웃 시 타이머 중지
      stopWatch()
    }
  },
  { immediate: true },
)

async function initUserMenuIfAuthenticated() {
  if (authStore.isAuthenticated) {
    const user = authStore.currentUser
    const targetUserId =
      (user && (user.id || user.userId || user.employeeId)) ||
      localStorage.getItem('saved_employee_id')

    if (targetUserId && menuStore.menuTree.length === 0 && !menuStore.isLoading) {
      try {
        await menuStore.fetchUserMenuTree(targetUserId)
      } catch (error) {
        console.error('App.vue: 브라우저 새로고침 후 메뉴 트리 복원 실패:', error)
      }
    }
  }
}

onMounted(function () {
  initUserMenuIfAuthenticated()
  if (authStore.isAuthenticated && !authStore.isAdmin) {
    startWatch()
  }
})

onBeforeUnmount(function () {
  stopWatch()
})

// 인증 상태 변경 감지 시 메뉴 동기화
watch(
  function () {
    return authStore.isAuthenticated
  },
  function (isAuthenticated) {
    if (isAuthenticated) {
      initUserMenuIfAuthenticated()
    }
  },
)
</script>

<style scoped></style>
