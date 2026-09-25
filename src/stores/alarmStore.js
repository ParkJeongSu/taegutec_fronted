// src/stores/alarmStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAlarmStore = defineStore('alarm', function () {
  const isOpen = ref(false)
  const alarmList = ref([]) // 최대 20개 저장
  const unreadCount = ref(0)

  // 패널 토글 및 열기/닫기
  function togglePanel() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      unreadCount.value = 0
    }
  }

  function openPanel() {
    isOpen.value = true
    unreadCount.value = 0
  }

  function closePanel() {
    isOpen.value = false
  }

  // 실시간 알람 추가 (맨 앞에 추가, 최대 20개 유지)
  function pushAlarm(alarm) {
    if (!alarm) {
      return
    }

    // 최신 알람을 맨 앞에 삽입
    alarmList.value.unshift(alarm)

    // 20개 초과 시 가장 오래된 뒤쪽 데이터 제거
    if (alarmList.value.length > 20) {
      alarmList.value.pop()
    }

    if (!isOpen.value) {
      unreadCount.value = unreadCount.value + 1
    }
  }

  function clearAlarms() {
    alarmList.value = []
    unreadCount.value = 0
  }

  const latestAlarms = computed(function () {
    return alarmList.value
  })

  return {
    isOpen: isOpen,
    alarmList: alarmList,
    unreadCount: unreadCount,
    latestAlarms: latestAlarms,
    togglePanel: togglePanel,
    openPanel: openPanel,
    closePanel: closePanel,
    pushAlarm: pushAlarm,
    clearAlarms: clearAlarms,
  }
})
