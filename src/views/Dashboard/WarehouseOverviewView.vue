<template>
  <v-container fluid class="pa-4 overview-view-container">
    <v-card class="elevation-1 rounded-lg pa-4 h-100 d-flex flex-column">
      <!-- 상단 헤더 및 제어 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-icon icon="$viewDashboardOutline" size="26" color="primary" class="mr-2" />
          <div>
            <span class="text-h6 font-weight-bold text-high-emphasis"
              >전체 창고 크레인 통합 관제 모니터링</span
            >
            <v-chip size="x-small" color="primary" variant="tonal" class="ml-2 font-weight-medium">
              모니터링 대시보드
            </v-chip>
          </div>
        </div>

        <div class="d-flex align-center">
          <!-- 지상 / 지하 층 선택 탭 -->
          <v-tabs
            v-model="activeFloor"
            density="compact"
            color="primary"
            class="floor-tabs mr-4"
            v-on:update:model-value="handleFloorChange"
          >
            <v-tab value="underground" class="font-weight-bold">
              <v-icon icon="$stairsDown" size="18" class="mr-1" />
              지하 레이아웃 (Underground)
            </v-tab>
            <v-tab value="ground" class="font-weight-bold">
              <v-icon icon="$homeRoof" size="18" class="mr-1" />
              지상 레이아웃 (Ground)
            </v-tab>
          </v-tabs>

          <!-- 웹소켓 연결 상태 칩 -->
          <v-chip
            :color="isConnected ? 'success' : 'grey'"
            variant="flat"
            size="small"
            class="font-weight-medium"
          >
            <v-icon icon="$radioboxBlank" size="12" class="mr-1 pulse-dot" />
            {{ connectionStatusText }}
          </v-chip>
        </div>
      </div>

      <v-divider class="mb-3"></v-divider>

      <!-- SVG 뷰포트 영역 -->
      <div class="svg-viewport-wrapper flex-grow-1">
        <!-- 로딩 오버레이 -->
        <div
          v-if="isLoading"
          class="svg-status-overlay d-flex flex-column align-center justify-center"
        >
          <v-progress-circular indeterminate color="primary" size="48" class="mb-2" />
          <span class="text-body-2 text-medium-emphasis">레이아웃 도면 불러오는 중...</span>
        </div>

        <!-- 에러 오버레이 -->
        <div
          v-if="hasError"
          class="svg-status-overlay d-flex flex-column align-center justify-center"
        >
          <v-icon icon="$alertCircle" size="48" color="error" class="mb-2" />
          <span class="text-body-1 font-weight-medium text-error"
            >도면 파일을 불러올 수 없습니다.</span
          >
          <span class="text-caption text-medium-emphasis mt-1">{{ errorMessage }}</span>
        </div>

        <!-- SVG DOM 렌더링 컨테이너 -->
        <div ref="svgHostRef" class="svg-host-container"></div>
      </div>

      <!-- 하단 상태 바 (각 창고별 수신 좌표 현황 표기) -->
      <div class="d-flex align-center flex-wrap pt-3 gap-2 status-summary-bar">
        <span class="text-caption font-weight-bold mr-2 text-medium-emphasis"
          >실시간 크레인 상태:</span
        >
        <v-chip
          v-for="whId in currentFloorWarehouses"
          :key="whId"
          size="x-small"
          variant="outlined"
          color="primary"
          class="font-weight-medium"
        >
          WH-{{ whId }}: ({{ getCraneCoordText(whId) }})
        </v-chip>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStompSocket } from '@/composables/useStompSocket'
import { calculateGlobalCranePosition, WAREHOUSE_RAIL_MAP } from '@/utils/craneCoordinateUtils'

const baseUrl = import.meta.env.BASE_URL
const activeFloor = ref('underground') // 'underground' | 'ground'
const svgHostRef = ref(null)

const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// 1. STOMP 소켓 Composable 연동
const { isConnected, connectionStatusText, subscribe, unsubscribe } = useStompSocket()

// 2. 창고별 최신 원시 좌표 저장소
const rawCraneData = reactive({})

// 3. 현재 선택된 층의 창고 목록 추출
const currentFloorWarehouses = computed(function () {
  const config = WAREHOUSE_RAIL_MAP[activeFloor.value]
  if (!config) return []
  return Object.keys(config)
})

// 4. SVG 파일 경로 계산
const currentSvgUrl = computed(function () {
  if (activeFloor.value === 'ground') {
    return baseUrl + 'drawings/warehouse_ground_layout.svg'
  }
  return baseUrl + 'drawings/warehouse_underground_layout.svg'
})

function getCraneCoordText(whId) {
  const data = rawCraneData[whId]
  if (!data) return '대기'
  return 'X:' + (data.x || 0) + ' Y:' + (data.y || 0)
}

// 5. SVG 내부 특정 크레인의 transform 속성 갱신
function updateSvgCraneNode(whId, payload) {
  if (!svgHostRef.value) return

  // whId가 '2.1'인 경우 SVG ID 규칙에 따라 '2-1'로 매핑
  const safeId = String(whId).replace('.', '-')
  const targetElement = svgHostRef.value.querySelector('#crane-unit-wh' + safeId)
  if (!targetElement) return

  const pos = calculateGlobalCranePosition(activeFloor.value, whId, payload)
  targetElement.setAttribute('transform', pos.transform)
}

// 6. 모든 크레인 위치 재동기화 (층 변경 및 SVG 신규 로드 시)
function syncAllCranesOnCurrentSvg() {
  const list = currentFloorWarehouses.value
  for (let i = 0; i < list.length; i++) {
    const whId = list[i]
    const latestPayload = rawCraneData[whId]
    if (latestPayload) {
      updateSvgCraneNode(whId, latestPayload)
    }
  }
}

// 7. 실시간 크레인 웹소켓 수신 핸들러 생성
function createCraneSocketHandler(whId) {
  return function (payload) {
    if (!payload) return
    rawCraneData[whId] = payload
    updateSvgCraneNode(whId, payload)
  }
}

// 창고별 핸들러 인스턴스 맵
const socketHandlers = {}
const allPossibleWarehouses = ['1', '2', '3', '4', '5', '6', '7', '2.1', '2.2']
for (let i = 0; i < allPossibleWarehouses.length; i++) {
  const wId = allPossibleWarehouses[i]
  socketHandlers[wId] = createCraneSocketHandler(wId)
}

function registerCraneSubscriptions() {
  for (let i = 0; i < allPossibleWarehouses.length; i++) {
    const wId = allPossibleWarehouses[i]
    const topic = '/topic/warehouse/' + wId + '/crane'
    subscribe(topic, socketHandlers[wId])
  }
}

function unregisterCraneSubscriptions() {
  for (let i = 0; i < allPossibleWarehouses.length; i++) {
    const wId = allPossibleWarehouses[i]
    const topic = '/topic/warehouse/' + wId + '/crane'
    unsubscribe(topic, socketHandlers[wId])
  }
}

// 8. SVG 도면 비동기 로드 및 컨테이너 주입
async function loadLayoutSvg(url) {
  if (!url) return
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('도면 파일을 불러오지 못했습니다. (HTTP ' + response.status + ')')
    }
    const svgText = await response.text()
    if (svgHostRef.value) {
      svgHostRef.value.innerHTML = svgText
      // SVG 렌더링 완료 후 현재 보유한 크레인 위치값 일괄 반영
      syncAllCranesOnCurrentSvg()
    }
  } catch (err) {
    hasError.value = true
    errorMessage.value = err && err.message ? err.message : 'SVG Load Error'
  } finally {
    isLoading.value = false
  }
}

function handleFloorChange() {
  loadLayoutSvg(currentSvgUrl.value)
}

onMounted(function () {
  loadLayoutSvg(currentSvgUrl.value)
  registerCraneSubscriptions()
})

onBeforeUnmount(function () {
  unregisterCraneSubscriptions()
})
</script>

<style scoped>
.overview-view-container {
  min-height: calc(100vh - 120px);
}

.floor-tabs {
  border-bottom: none;
}

.pulse-dot {
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
}

.svg-viewport-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 250px);
  min-height: 520px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-status-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(248, 250, 252, 0.88);
  z-index: 10;
}

.svg-host-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(svg) {
  width: 100%;
  height: 100%;
  max-width: 1400px;
  max-height: 100%;
  display: block;
}

.status-summary-bar {
  border-top: 1px solid #edf2f7;
}

.gap-2 {
  gap: 8px;
}
</style>
