// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import { useTabStore } from '@/stores/tabStore'

export const useAuthStore = defineStore('auth', function () {
  const token = ref(getStoredToken())
  const user = ref(getStoredUser())

  function getStoredToken() {
    return sessionStorage.getItem('token') || localStorage.getItem('token') || null
  }

  function getStoredUser() {
    try {
      const stored = sessionStorage.getItem('user_info') || localStorage.getItem('user_info')
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

  const userGroups = computed(function () {
    if (user.value && Array.isArray(user.value.userGroups)) {
      return user.value.userGroups
    }
    return []
  })

  const isAdmin = computed(function () {
    if (!user.value || !Array.isArray(user.value.userGroups)) {
      return false
    }
    const groups = user.value.userGroups
    for (let i = 0; i < groups.length; i++) {
      if (groups[i] === 'ADMIN') {
        return true
      }
    }
    return false
  })

  function setAuth(tokenValue, userInfo) {
    token.value = tokenValue
    user.value = userInfo

    if (tokenValue) {
      sessionStorage.setItem('token', tokenValue)
      localStorage.setItem('token', tokenValue)
    } else {
      sessionStorage.removeItem('token')
      localStorage.removeItem('token')
    }

    if (userInfo) {
      const userJson = JSON.stringify(userInfo)
      sessionStorage.setItem('user_info', userJson)
      localStorage.setItem('user_info', userJson)
    } else {
      sessionStorage.removeItem('user_info')
      localStorage.removeItem('user_info')
    }
  }

  function clearAuth() {
    token.value = null
    user.value = null
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user_info')
    localStorage.removeItem('token')
    localStorage.removeItem('user_info')
  }

  function logout() {
    // 1. 탭 상태 초기화
    const tabStore = useTabStore()
    tabStore.clearTabs()

    // 2. 인증 및 사용자 세션 정리
    clearAuth()

    // 3. 로그인 페이지로 리다이렉트
    router.push('/login')
  }

  return {
    token: token,
    user: user,
    isAuthenticated: isAuthenticated,
    currentUser: currentUser,
    isAdmin: isAdmin,
    userGroups: userGroups,
    setAuth: setAuth,
    clearAuth: clearAuth,
    logout: logout,
  }
})
