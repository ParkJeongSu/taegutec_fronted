<template>
  <v-container fluid class="pa-4 overview-view-container">
    <v-card class="elevation-1 rounded-lg pa-4 h-100 d-flex flex-column">
      <!-- 상단 헤더 및 제어 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-icon icon="$viewDashboardOutline" size="26" color="primary" class="mr-2" />
          <div>
            <span class="text-h6 font-weight-bold text-high-emphasis">
              파우더(POWDER) 공장 스토커 크레인 통합 관제 모니터링
            </span>
            <v-chip size="x-small" color="primary" variant="tonal" class="ml-2 font-weight-medium">
              POWDER WCS 실시간 관제
            </v-chip>
          </div>
        </div>

        <div class="d-flex align-center">
          <!-- 도면 새로고침 버튼 -->
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="mr-3"
            :loading="isLoading"
            v-on:click="reloadLayout"
          >
            도면 새로고침
          </v-btn>

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
          <span class="text-body-2 text-medium-emphasis">파우더 공장 도면 불러오는 중...</span>
        </div>

        <!-- 에러 오버레이 -->
        <div
          v-if="hasError"
          class="svg-status-overlay d-flex flex-column align-center justify-center"
        >
          <v-icon icon="$alertCircle" size="48" color="error" class="mb-2" />
          <span class="text-body-1 font-weight-medium text-error">
            도면 파일을 불러올 수 없습니다.
          </span>
          <span class="text-caption text-medium-emphasis mt-1">{{ errorMessage }}</span>
        </div>

        <!-- SVG DOM 렌더링 컨테이너 -->
        <div ref="svgHostRef" class="svg-host-container"></div>
      </div>

      <!-- 하단 상태 바 (파우더 스토커 크레인 수신 좌표 현황 표기) -->
      <div class="d-flex align-center flex-wrap pt-3 gap-2 status-summary-bar">
        <span class="text-caption font-weight-bold mr-2 text-medium-emphasis">
          실시간 크레인 좌표:
        </span>
        <v-chip
          v-for="craneId in powderCranes"
          :key="craneId"
          size="x-small"
          variant="outlined"
          color="primary"
          class="font-weight-medium"
        >
          WH-{{ craneId }}: ({{ getCraneCoordText(craneId) }})
        </v-chip>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useStompSocket } from '@/composables/useStompSocket'

const baseUrl = import.meta.env.BASE_URL
const svgHostRef = ref(null)

const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

// 1. 파우더 스토커 4개 베이 크레인 정의
const powderCranes = ['p1', 'p2', 'p3', 'p4']

// 2. STOMP 소켓 Composable 연동
const { isConnected, connectionStatusText, subscribe, unsubscribe } = useStompSocket()

// 3. 최신 원시 좌표 저장소
const rawCraneData = reactive({
  p1: { x: 142, y: 450 },
  p2: { x: 217, y: 620 },
  p3: { x: 292, y: 380 },
  p4: { x: 367, y: 710 },
})

// 파우더 스토커 베이별 X 고정 축 및 Y 주행 범위 매핑
const POWDER_CRANE_BOUNDS = {
  p1: { fixedX: 142, minY: 280, maxY: 940 },
  p2: { fixedX: 217, minY: 280, maxY: 940 },
  p3: { fixedX: 292, minY: 280, maxY: 940 },
  p4: { fixedX: 367, minY: 280, maxY: 940 },
}

const currentSvgUrl = baseUrl + 'drawings/powder_warehouse_layout.svg'

function getCraneCoordText(craneId) {
  const data = rawCraneData[craneId]
  if (!data) return '대기'
  return 'X:' + (data.x || 0) + ' Y:' + (data.y || 0)
}

// 4. SVG 내부 특정 크레인의 transform 속성 갱신
function updateSvgCraneNode(craneId, payload) {
  if (!svgHostRef.value) return

  const targetElement = svgHostRef.value.querySelector('#crane-unit-wh-' + craneId)
  if (!targetElement) return

  const bounds = POWDER_CRANE_BOUNDS[craneId]
  let posX = bounds ? bounds.fixedX : 142
  let posY = payload.y != null ? Number(payload.y) : 450

  // 랙 주행 가능 경계값 제한
  if (bounds) {
    if (posY < bounds.minY) posY = bounds.minY
    if (posY > bounds.maxY) posY = bounds.maxY
  }

  targetElement.setAttribute('transform', 'translate(' + posX + ', ' + posY + ')')
}

// 5. 전체 크레인 위치 동기화
function syncAllCranesOnSvg() {
  for (let i = 0; i < powderCranes.length; i++) {
    const cId = powderCranes[i]
    const latestPayload = rawCraneData[cId]
    if (latestPayload) {
      updateSvgCraneNode(cId, latestPayload)
    }
  }
}

// 6. 소켓 메시지 수신 핸들러 생성
function createCraneSocketHandler(craneId) {
  return function (payload) {
    if (!payload) return
    rawCraneData[craneId] = payload
    updateSvgCraneNode(craneId, payload)
  }
}

const socketHandlers = {}
for (let i = 0; i < powderCranes.length; i++) {
  const cId = powderCranes[i]
  socketHandlers[cId] = createCraneSocketHandler(cId)
}

function registerCraneSubscriptions() {
  for (let i = 0; i < powderCranes.length; i++) {
    const cId = powderCranes[i]
    const topic = '/topic/powder/warehouse/' + cId + '/crane'
    subscribe(topic, socketHandlers[cId])
  }
}

function unregisterCraneSubscriptions() {
  for (let i = 0; i < powderCranes.length; i++) {
    const cId = powderCranes[i]
    const topic = '/topic/powder/warehouse/' + cId + '/crane'
    unsubscribe(topic, socketHandlers[cId])
  }
}

// 7. SVG 도면 비동기 로드
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
      syncAllCranesOnSvg()
    }
  } catch (err) {
    hasError.value = true
    errorMessage.value = err && err.message ? err.message : 'SVG Load Error'
  } finally {
    isLoading.value = false
  }
}

function reloadLayout() {
  loadLayoutSvg(currentSvgUrl)
}

onMounted(function () {
  loadLayoutSvg(currentSvgUrl)
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
  max-width: 1500px;
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
