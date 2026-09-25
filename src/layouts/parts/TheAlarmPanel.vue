<template>
  <v-navigation-drawer
    v-model="alarmStore.isOpen"
    location="right"
    temporary
    width="420"
    class="alarm-panel-drawer"
  >
    <!-- 상단 툴바 헤더 -->
    <div class="alarm-header d-flex align-center justify-space-between pa-4 border-b">
      <div class="d-flex align-center">
        <v-avatar size="32" color="error" variant="tonal" class="mr-2">
          <v-icon icon="$bellRing" size="18" color="error" />
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold alarm-title-text">
            실시간 알람 큐
          </div>
          <div class="text-caption text-medium-emphasis">
            최근 {{ alarmStore.alarmList.length }} / 20건 관리 (FIFO)
          </div>
        </div>
      </div>

      <div class="d-flex align-center header-action-gap">
        <v-btn
          v-if="alarmStore.alarmList.length > 0"
          icon
          variant="text"
          size="small"
          color="grey-lighten-1"
          title="알람 목록 비우기"
          v-on:click="alarmStore.clearAlarms"
        >
          <v-icon icon="$delete" size="18" />
        </v-btn>
        <v-btn
          icon
          variant="text"
          size="small"
          color="white"
          title="닫기"
          v-on:click="alarmStore.closePanel"
        >
          <v-icon icon="$close" size="20" />
        </v-btn>
      </div>
    </div>

    <!-- 알람 큐 본문 목록 영역 -->
    <div class="alarm-list-container pa-3 overflow-y-auto">
      <!-- 알람 목록이 있을 때 -->
      <template v-if="alarmStore.latestAlarms.length > 0">
        <div
          v-for="(alarm, index) in alarmStore.latestAlarms"
          :key="alarm.alarmId || (alarm.alarmCode + '_' + index)"
          class="alarm-card pa-3 mb-2 rounded-lg"
          :class="getAlarmLevelClass(alarm.alarmLevel)"
        >
          <!-- 카드 상단: 레벨 칩 & 설비 ID & 알람 코드 -->
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center flex-wrap gap-1">
              <v-chip
                :color="getAlarmLevelColor(alarm.alarmLevel)"
                size="x-small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ alarm.alarmLevel || 'CRITICAL' }}
              </v-chip>

              <v-chip
                v-if="alarm.equipmentId"
                size="x-small"
                variant="outlined"
                color="white"
                class="font-weight-medium"
              >
                {{ alarm.equipmentId }}
              </v-chip>

              <span class="alarm-code text-caption font-weight-bold ml-1">
                {{ alarm.alarmCode || '-' }}
              </span>
            </div>

            <!-- 알람 유형 (Type) -->
            <v-chip
              v-if="alarm.alarmType"
              size="x-small"
              variant="tonal"
              color="grey-lighten-2"
              class="text-caption"
            >
              {{ alarm.alarmType }}
            </v-chip>
          </div>

          <!-- 알람 메시지 본문 -->
          <div class="alarm-text text-body-2 font-weight-bold mb-2">
            {{ alarm.alarmText || '알람이 발생했습니다.' }}
          </div>

          <!-- 카드 하단: 발생 일시 -->
          <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis">
            <div class="d-flex align-center">
              <v-icon icon="$clockOutline" size="14" class="mr-1" />
              <span>{{ formatDateTime(alarm.timestamp) }}</span>
            </div>
            <span v-if="index === 0" class="new-tag font-weight-bold text-error">
              ● LATEST
            </span>
          </div>
        </div>
      </template>

      <!-- 알람이 없을 때 빈 화면 -->
      <div
        v-else
        class="empty-alarm-wrapper d-flex flex-column align-center justify-center py-16 text-center"
      >
        <v-avatar size="56" color="rgba(255, 255, 255, 0.08)" class="mb-3">
          <v-icon icon="$checkCircle" size="32" color="success" />
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold text-white mb-1">
          현재 발생한 알람이 없습니다.
        </div>
        <div class="text-caption text-medium-emphasis">
          설비 및 시스템이 정상 가동 중입니다.
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAlarmStore } from '@/stores/alarmStore'
import { useStompSocket } from '@/composables/useStompSocket'
import { formatDateTime } from '@/utils/dateUtils'

const alarmStore = useAlarmStore()
const { subscribe, unsubscribe } = useStompSocket()

function getAlarmLevelColor(level) {
  if (!level) return 'error'
  const l = String(level).toUpperCase()
  if (l === 'CRITICAL') return 'error'
  if (l === 'ERROR') return 'deep-orange'
  if (l === 'WARN' || l === 'WARNING') return 'warning'
  if (l === 'INFO') return 'info'
  return 'error'
}

function getAlarmLevelClass(level) {
  if (!level) return 'level-critical'
  const l = String(level).toUpperCase()
  if (l === 'CRITICAL') return 'level-critical'
  if (l === 'ERROR') return 'level-error'
  if (l === 'WARN' || l === 'WARNING') return 'level-warn'
  if (l === 'INFO') return 'level-info'
  return 'level-critical'
}

function onAlarmReceived(payload) {
  if (payload) {
    alarmStore.pushAlarm(payload)
  }
}

onMounted(function () {
  // 백엔드 웹소켓 시뮬레이터 브로드캐스트 토픽 구독
  subscribe('/topic/alarms', onAlarmReceived)
})

onUnmounted(function () {
  unsubscribe('/topic/alarms', onAlarmReceived)
})
</script>

<style scoped>
.alarm-panel-drawer {
  background: rgba(22, 27, 34, 0.75) !important;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-left: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #ffffff !important;
  z-index: 2000 !important;
}

.alarm-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.alarm-title-text {
  color: #ffffff;
}

.header-action-gap {
  gap: 4px;
}

.alarm-list-container {
  max-height: calc(100vh - 65px);
}

.alarm-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.alarm-card:hover {
  background: rgba(255, 255, 255, 0.09);
  transform: translateX(-2px);
}

.level-critical {
  border-left: 4px solid #ff5252 !important;
  background: rgba(255, 82, 82, 0.08);
}

.level-error {
  border-left: 4px solid #ff7043 !important;
  background: rgba(255, 112, 67, 0.08);
}

.level-warn {
  border-left: 4px solid #ffd54f !important;
  background: rgba(255, 213, 79, 0.08);
}

.level-info {
  border-left: 4px solid #42a5f5 !important;
  background: rgba(66, 165, 245, 0.08);
}

.alarm-code {
  color: rgba(255, 255, 255, 0.9);
}

.alarm-text {
  color: #ffffff;
  line-height: 1.4;
  word-break: break-word;
}

.gap-1 {
  gap: 6px;
}

.new-tag {
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

.empty-alarm-wrapper {
  min-height: 50vh;
}
</style>
