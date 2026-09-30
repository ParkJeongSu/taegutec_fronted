// src/composables/useIdleLock.js
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { loginApi } from '@/api/auth'

const isLocked = ref(false)
const failCount = ref(0)
const maxFailLimit = 5
const IDLE_LIMIT = 10 * 60 * 1000 // 10분 (밀리초)

let idleTimer = null

export function useIdleLock() {
  const authStore = useAuthStore()

  // 타이머 리셋 함수
  function resetTimer() {
    // 잠금 상태이거나, 미인증 상태이거나, ADMIN 권한인 경우 유휴 타이머 중단
    if (isLocked.value || !authStore.isAuthenticated || authStore.isAdmin) {
      clearTimer()
      return
    }

    clearTimer()
    idleTimer = setTimeout(function () {
      triggerLock()
    }, IDLE_LIMIT)
  }

  function clearTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer)
      idleTimer = null
    }
  }

  // 화면 잠금 트리거
  function triggerLock() {
    clearTimer()
    failCount.value = 0
    isLocked.value = true
  }

  // 사용자 활동 이벤트 리스너 목록
  const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

  function handleUserActivity() {
    resetTimer()
  }

  function startWatch() {
    // ADMIN이 아니고 로그인 상태일 때만 감시 시작
    if (!authStore.isAuthenticated || authStore.isAdmin) {
      return
    }

    for (let i = 0; i < activityEvents.length; i++) {
      window.addEventListener(activityEvents[i], handleUserActivity, { passive: true })
    }
    resetTimer()
  }

  function stopWatch() {
    clearTimer()
    for (let i = 0; i < activityEvents.length; i++) {
      window.removeEventListener(activityEvents[i], handleUserActivity)
    }
  }

  // 잠금 해제 비밀번호 검증 함수
  async function unlockWithPassword(password) {
    if (!authStore.currentUser) {
      authStore.logout()
      return { success: false, message: '사용자 정보가 없습니다.' }
    }

    try {
      const payload = {
        factoryName: authStore.currentUser.factoryName,
        userId: authStore.currentUser.userId,
        password: password,
      }

      const res = await loginApi(payload)

      if (res && res.result === 'SUCCESS') {
        // 인증 성공: 새 토큰 갱신 및 잠금 해제
        if (res.data && res.data.accessToken) {
          authStore.setAuth(res.data.accessToken, authStore.currentUser)
        }
        isLocked.value = false
        failCount.value = 0
        resetTimer()
        return { success: true }
      } else {
        return handleFail()
      }
    } catch {
      return handleFail()
    }
  }

  function handleFail() {
    failCount.value = failCount.value + 1
    const remain = maxFailLimit - failCount.value

    if (remain <= 0) {
      alert('비밀번호를 5회 연속 잘못 입력하여 보안을 위해 로그아웃됩니다.')
      isLocked.value = false
      stopWatch()
      authStore.logout()
      return { success: false, logout: true, message: '로그아웃 처리됨' }
    }

    return {
      success: false,
      remain: remain,
      message: '비밀번호가 일치하지 않습니다. (남은 횟수: ' + remain + '회)',
    }
  }

  return {
    isLocked: isLocked,
    failCount: failCount,
    maxFailLimit: maxFailLimit,
    startWatch: startWatch,
    stopWatch: stopWatch,
    unlockWithPassword: unlockWithPassword,
  }
}
