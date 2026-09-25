<template>
  <RouterView />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menuStore'

const authStore = useAuthStore()
const menuStore = useMenuStore()

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

<style scoped>
</style>
