import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import { useTabStore } from '@/stores/tabStore'

export const useAuthStore = defineStore('auth', function () {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(getStoredUser())

  function getStoredUser() {
    try {
      const stored = localStorage.getItem('user_info')
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      console.error('Failed to parse stored user:', e)
      return null
    }
  }

  const isAuthenticated = computed(function () {
    return Boolean(token.value)
  })

  const currentUser = computed(function () {
    return user.value
  })

  function setAuth(tokenValue, userInfo) {
    token.value = tokenValue
    user.value = userInfo

    if (tokenValue) {
      localStorage.setItem('token', tokenValue)
    } else {
      localStorage.removeItem('token')
    }

    if (userInfo) {
      localStorage.setItem('user_info', JSON.stringify(userInfo))
    } else {
      localStorage.removeItem('user_info')
    }
  }

  function logout() {
    // 1. 탭 상태 초기화
    const tabStore = useTabStore()
    tabStore.clearTabs()

    // 2. 인증 및 사용자 세션 정리
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user_info')

    // 3. 로그인 페이지로 리다이렉트
    router.push('/login')
  }

  return {
    token,
    user,
    isAuthenticated,
    currentUser,
    setAuth,
    logout,
  }
})
