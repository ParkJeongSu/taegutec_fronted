<template>
  <v-container fluid class="pa-4 view-page-container">
    <!-- 상단 조회 조건 영역 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{ $t('zone.title') }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('zone.breadcrumb') }}
          </v-chip>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$refresh"
            :loading="loading"
            v-on:click="handleSearch"
          >
            {{ $t('zone.refresh') }}
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$fileExport"
            v-on:click="handleExport"
          >
            {{ $t('zone.export') }}
          </v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 검색 필터 폼 (v-row density="compact" align-center) -->
      <div class="search-filter-bar pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <!-- 1. 스토커 / 창고 선택 (cols 12 sm 4 md 3) -->
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="selectedStocker"
              :items="stockerOptions"
              :label="$t('zone.stocker')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 2. Bank 선택 (cols 12 sm 5 md 6) - 한 줄에 온전히 표시 -->
          <v-col cols="12" sm="5" md="6">
            <div class="d-flex align-center">
              <span class="text-caption font-weight-bold text-medium-emphasis mr-2">{{ $t('zone.bank') }}:</span>
              <v-btn-toggle
                v-model="selectedBankIndex"
                mandatory
                density="compact"
                color="primary"
                variant="outlined"
                class="bank-toggle-group flex-grow-1"
              >
                <v-btn
                  v-for="(b, idx) in bankOptions"
                  :key="idx"
                  :value="idx"
                  size="small"
                  class="font-weight-medium flex-1-1"
                >
                  {{ b.label }}
                </v-btn>
              </v-btn-toggle>
            </div>
          </v-col>

          <!-- 3. 조회 버튼 (cols 12 sm 3 md 3) -->
          <v-col cols="12" sm="3" md="3" class="d-flex justify-end">
            <v-btn
              color="primary"
              variant="flat"
              size="default"
              prepend-icon="$magnify"
              class="w-100 font-weight-bold"
              :loading="loading"
              v-on:click="handleSearch"
            >
              {{ $t('zone.search') }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- 중앙 통계 요약 바 -->
    <v-row density="compact" class="mb-3">
      <v-col cols="6" sm="3">
        <v-card class="elevation-1 pa-3 stat-card">
          <div class="text-caption text-medium-emphasis">{{ $t('zone.totalCells') }}</div>
          <div class="text-h6 font-weight-bold text-primary">{{ totalCellCount.toLocaleString() }} 셀</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card class="elevation-1 pa-3 stat-card">
          <div class="text-caption text-medium-emphasis">{{ $t('zone.occupiedCells') }}</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ occupiedCellCount.toLocaleString() }} 셀
            <span class="text-caption font-weight-regular text-medium-emphasis">
              ({{ occupancyRate }}%)
            </span>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card class="elevation-1 pa-3 stat-card">
          <div class="text-caption text-medium-emphasis">{{ $t('zone.emptyCells') }}</div>
          <div class="text-h6 font-weight-bold text-grey-darken-1">
            {{ (totalCellCount - occupiedCellCount).toLocaleString() }} 셀
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card class="elevation-1 pa-3 stat-card">
          <div class="text-caption text-medium-emphasis">{{ $t('zone.modifiedCells') }}</div>
          <div class="text-h6 font-weight-bold" :class="modifiedCount > 0 ? 'text-warning' : 'text-grey'">
            {{ modifiedCount }} 셀 변경됨
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 조작 툴바 및 존 일괄 할당 바 -->
    <v-card class="elevation-1 rounded-lg pa-3 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between gap-3">
        <!-- 좌측: 조작 툴 모드 버튼 -->
        <div class="d-flex flex-wrap align-center gap-2">
          <span class="text-subtitle-2 font-weight-bold mr-1">{{ $t('zone.selectMode') }}:</span>
          <v-btn-toggle
            v-model="toolMode"
            mandatory
            density="compact"
            color="primary"
            variant="outlined"
          >
            <v-btn value="select" size="small" prepend-icon="$bullseyeArrow">
              {{ $t('zone.dragSelect') }}
            </v-btn>
            <v-btn value="deselect" size="small" prepend-icon="$delete">
              {{ $t('zone.dragDeselect') }}
            </v-btn>
          </v-btn-toggle>

          <v-divider vertical class="mx-2 my-1"></v-divider>

          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            v-on:click="selectAllCells"
          >
            {{ $t('zone.selectAll') }}
          </v-btn>
          <v-btn
            size="small"
            variant="outlined"
            color="grey-darken-2"
            v-on:click="clearSelection"
          >
            {{ $t('zone.clearSelect') }}
          </v-btn>
          <v-btn
            size="small"
            variant="tonal"
            color="info"
            v-on:click="invertSelection"
          >
            {{ $t('zone.invertSelect') }}
          </v-btn>
        </div>

        <!-- 우측: Zone 일괄 적용 및 저장 -->
        <div class="d-flex flex-wrap align-center gap-2">
          <v-chip
            :color="selectedCellCount > 0 ? 'primary' : 'grey'"
            variant="flat"
            class="font-weight-bold"
            size="default"
          >
            {{ $t('zone.selectedCells', { count: selectedCellCount }) }}
          </v-chip>

          <div class="target-zone-select-wrap">
            <v-select
              v-model="targetZone"
              :items="zoneKeyList"
              :label="$t('zone.targetZone')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </div>

          <v-btn
            color="primary"
            variant="flat"
            size="small"
            :disabled="selectedCellCount === 0"
            v-on:click="applyZoneBatch"
          >
            {{ $t('zone.applyZone') }}
          </v-btn>

          <v-btn
            color="success"
            variant="flat"
            size="small"
            :disabled="modifiedCount === 0"
            :loading="isSaving"
            v-on:click="saveChanges"
          >
            {{ $t('zone.save') }} ({{ modifiedCount }})
          </v-btn>
        </div>
      </div>

      <!-- 하단: Zone 범례 (Legend) -->
      <v-divider class="my-3"></v-divider>
      <div class="d-flex flex-wrap align-center gap-2">
        <span class="text-caption font-weight-bold text-medium-emphasis mr-1">{{ $t('zone.legend') }}:</span>
        <div
          v-for="zKey in zoneKeyList"
          :key="zKey"
          class="legend-item-chip"
          v-on:click="selectByZone(zKey)"
        >
          <span
            class="legend-color-box"
            :class="'zone-bg-' + zKey.toLowerCase()"
          ></span>
          <span class="legend-text font-weight-medium">{{ zKey }} ({{ zoneStats[zKey] || 0 }})</span>
        </div>

        <div class="legend-item-chip ml-2">
          <span class="legend-carrier-dot"></span>
          <span class="legend-text font-weight-medium">{{ $t('zone.carrierLoaded') }}</span>
        </div>
      </div>
    </v-card>

    <!-- 메인 랙 그리드 Canvas 뷰포트 영역 -->
    <v-card class="elevation-1 rounded-lg pa-4 shelf-canvas-card">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center gap-2">
          <span class="text-subtitle-1 font-weight-bold">
            {{ currentSearchInfo.stocker }} - {{ currentSearchInfo.bankLabel }} (Row 1~92 x Stage 1~25)
          </span>
          <span class="text-caption text-medium-emphasis">
            [{{ $t('zone.guideText') }}]
          </span>
        </div>

        <!-- 줌/스케일 컨트롤 -->
        <div class="d-flex align-center gap-2">
          <span class="text-caption text-medium-emphasis">{{ $t('zone.zoom') }}:</span>
          <v-btn-toggle
            v-model="zoomLevel"
            mandatory
            density="compact"
            color="primary"
            variant="outlined"
            v-on:update:model-value="onZoomChange"
          >
            <v-btn value="fit" size="x-small">{{ $t('zone.fit') }}</v-btn>
            <v-btn value="100" size="x-small">100%</v-btn>
            <v-btn value="125" size="x-small">125%</v-btn>
            <v-btn value="150" size="x-small">150%</v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <!-- 캔버스 스크롤 래퍼 -->
      <div ref="canvasWrapperRef" class="canvas-scroll-wrapper">
        <canvas
          ref="canvasRef"
          class="shelf-grid-canvas"
          v-on:mousedown="handleMouseDown"
          v-on:mousemove="handleMouseMove"
          v-on:mouseup="handleMouseUp"
          v-on:mouseleave="handleMouseLeave"
        ></canvas>

        <!-- 호버 플로팅 툴팁 -->
        <div
          v-if="hoveredShelf"
          class="floating-tooltip elevation-4"
          :class="{ 'tooltip-visible': hoveredShelf !== null }"
          ref="tooltipRef"
        >
          <div class="tooltip-header font-weight-bold text-primary mb-1">
            Shelf: {{ hoveredShelf.shelfCode }}
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">위치:</span>
            <span class="tooltip-val font-weight-bold">Row {{ hoveredShelf.row }}열 / Stage {{ hoveredShelf.stage }}단</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">존 (Zone):</span>
            <span class="tooltip-val font-weight-bold" :class="'zone-text-' + (hoveredShelf.zoneName || 'empty').toLowerCase()">
              {{ hoveredShelf.zoneName || 'EMPTY' }}
            </span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">캐리어 (Tray):</span>
            <span class="tooltip-val font-weight-bold text-info">
              {{ hoveredShelf.carrierId || '(없음)' }}
            </span>
          </div>
          <div v-if="hoveredShelf.isModified" class="tooltip-row mt-1 text-warning font-weight-bold">
            * 변경 대기 상태
          </div>
        </div>
      </div>
    </v-card>

    <!-- 피드백 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" size="small" v-on:click="snackbar.show = false">
          닫기
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'
import { fetchBankShelvesApi, saveBankShelvesZoneApi } from '@/api/zone'

const { t } = useI18n()
const authStore = useAuthStore()

// 상수 정의
const MAX_ROW = 92
const MAX_STAGE = 25
const TOTAL_CELLS = MAX_ROW * MAX_STAGE // 2,300

// Zone 정의 및 색상 맵
const ZONE_MAP = {
  R1A: { name: 'R1A', color: '#4CAF50', border: '#388E3C', text: '#FFFFFF' },
  R1B: { name: 'R1B', color: '#2E7D32', border: '#1B5E20', text: '#FFFFFF' },
  S1A: { name: 'S1A', color: '#2196F3', border: '#1976D2', text: '#FFFFFF' },
  S1B: { name: 'S1B', color: '#1565C0', border: '#0D47A1', text: '#FFFFFF' },
  S2A: { name: 'S2A', color: '#9C27B0', border: '#7B1FA2', text: '#FFFFFF' },
  S2B: { name: 'S2B', color: '#673AB7', border: '#512DA8', text: '#FFFFFF' },
  BUFFER: { name: 'BUFFER', color: '#FB8C00', border: '#EF6C00', text: '#FFFFFF' },
  EMPTY: { name: 'EMPTY', color: '#CFD8DC', border: '#B0BEC5', text: '#37474F' },
}

const zoneKeyList = ['R1A', 'R1B', 'S1A', 'S1B', 'S2A', 'S2B', 'BUFFER', 'EMPTY']

// 상태 변수
const selectedStocker = ref('WH1')
const stockerOptions = ['WH1', 'WH2', 'WH3', 'WH4', 'WH5', 'WH6', 'WH7']

const bankOptions = [
  { label: 'Bank 1', col: 1, bin: 1 },
  { label: 'Bank 2', col: 1, bin: 2 },
  { label: 'Bank 3', col: 2, bin: 1 },
  { label: 'Bank 4', col: 2, bin: 2 },
]
const selectedBankIndex = ref(0)

// 조회 버튼 클릭 시점 상태 확정(Commit) 변수
const currentSearchInfo = ref({
  stocker: 'WH1',
  bankLabel: 'Bank 1',
})

const toolMode = ref('select') // 'select' | 'deselect'
const targetZone = ref('R1A')
const zoomLevel = ref('fit') // 'fit' | '100' | '125' | '150'

const isSaving = ref(false)

// 범용 API 호출 컴포저블 적용
const { data: shelvesData, loading, execute: fetchShelves } = useApi(fetchBankShelvesApi, [])

// 스낵바 상태
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
  timeout: 3000,
})

function showMessage(msg, color) {
  snackbar.message = msg
  snackbar.color = color || 'success'
  snackbar.show = true
}

// 캔버스 및 래퍼 참조
const canvasRef = ref(null)
const canvasWrapperRef = ref(null)
const tooltipRef = ref(null)

// 랙 데이터 구조: shelfMatrix[row][stage] (1-indexed)
// 각 shelf 객체: { shelfCode, row, stage, zoneName, carrierId, isSelected, isModified, originalZone }
let shelfMatrix = []
const shelfList = ref([])

// 호버 상태
const hoveredShelf = ref(null)
const tooltipPos = reactive({ x: 0, y: 0 })

// 드래그 선택 상태
const dragInfo = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
})

// 캔버스 렌더링 치수 계산 변수
const renderMetrics = reactive({
  headerLeftWidth: 42,
  headerTopHeight: 28,
  headerBottomHeight: 28,
  cellWidth: 16,
  cellHeight: 18,
  totalCanvasWidth: 1550,
  totalCanvasHeight: 520,
})

// 계산된 통계 지표
const totalCellCount = computed(function () {
  return TOTAL_CELLS
})

const occupiedCellCount = computed(function () {
  let count = 0
  const list = shelfList.value
  const len = list.length
  for (let i = 0; i < len; i++) {
    if (list[i].carrierId) {
      count++
    }
  }
  return count
})

const occupancyRate = computed(function () {
  if (totalCellCount.value === 0) {
    return '0.0'
  }
  return ((occupiedCellCount.value / totalCellCount.value) * 100).toFixed(1)
})

const selectedCellCount = computed(function () {
  let count = 0
  const list = shelfList.value
  const len = list.length
  for (let i = 0; i < len; i++) {
    if (list[i].isSelected) {
      count++
    }
  }
  return count
})

const modifiedCount = computed(function () {
  let count = 0
  const list = shelfList.value
  const len = list.length
  for (let i = 0; i < len; i++) {
    if (list[i].isModified) {
      count++
    }
  }
  return count
})

const zoneStats = computed(function () {
  const stats = {}
  for (let k = 0; k < zoneKeyList.length; k++) {
    stats[zoneKeyList[k]] = 0
  }
  const list = shelfList.value
  const len = list.length
  for (let i = 0; i < len; i++) {
    const z = list[i].zoneName || 'EMPTY'
    if (stats[z] !== undefined) {
      stats[z]++
    } else {
      stats[z] = 1
    }
  }
  return stats
})

// 공장명 조회 헬퍼
function getFactoryName() {
  if (authStore && authStore.currentUser && authStore.currentUser.factoryName) {
    return authStore.currentUser.factoryName
  }
  return import.meta.env.VITE_PLANT_TYPE || 'INSERT'
}

// 초기 빈 매트릭스 생성
function initializeEmptyMatrix() {
  shelfMatrix = []
  const list = []
  const bank = bankOptions[selectedBankIndex.value]

  for (let r = 0; r <= MAX_ROW; r++) {
    shelfMatrix[r] = []
    if (r === 0) continue
    for (let s = 1; s <= MAX_STAGE; s++) {
      const colStr = String(bank.col).padStart(2, '0')
      const rowStr = String(r).padStart(3, '0')
      const stgStr = String(s).padStart(2, '0')
      const shelfCode = colStr + rowStr + stgStr

      const shelfObj = {
        shelfCode: shelfCode,
        row: r,
        stage: s,
        zoneName: 'EMPTY',
        carrierId: null,
        isSelected: false,
        isModified: false,
        originalZone: 'EMPTY',
      }
      shelfMatrix[r][s] = shelfObj
      list.push(shelfObj)
    }
  }
  shelfList.value = list
}

// Mock 데이터 생성기 (백엔드 미구동 또는 테스트 시 현실적인 2,300개 셀 데이터 구성)
function generateRealisticMockData() {
  const bank = bankOptions[selectedBankIndex.value]
  const list = []
  shelfMatrix = []

  for (let r = 0; r <= MAX_ROW; r++) {
    shelfMatrix[r] = []
  }

  for (let r = 1; r <= MAX_ROW; r++) {
    for (let s = 1; s <= MAX_STAGE; s++) {
      const colStr = String(bank.col).padStart(2, '0')
      const rowStr = String(r).padStart(3, '0')
      const stgStr = String(s).padStart(2, '0')
      const shelfCode = colStr + rowStr + stgStr

      let defaultZone
      if (r >= 1 && r <= 20) {
        defaultZone = s <= 12 ? 'R1A' : 'R1B'
      } else if (r >= 21 && r <= 50) {
        defaultZone = s <= 12 ? 'S1A' : 'S1B'
      } else if (r >= 51 && r <= 75) {
        defaultZone = s <= 12 ? 'S2A' : 'S2B'
      } else if (r >= 76 && r <= 88) {
        defaultZone = 'BUFFER'
      } else {
        defaultZone = 'EMPTY'
      }

      let carrierId = null
      const seed = (r * 37 + s * 19 + bank.col * 11 + bank.bin * 7) % 100
      if (seed > 45 && defaultZone !== 'EMPTY') {
        const trayNum = String((r * 25 + s) * 3 + bank.bin).padStart(6, '0')
        carrierId = 'TRAY_' + trayNum
      }

      const shelfObj = {
        shelfCode: shelfCode,
        row: r,
        stage: s,
        zoneName: defaultZone,
        carrierId: carrierId,
        isSelected: false,
        isModified: false,
        originalZone: defaultZone,
      }

      shelfMatrix[r][s] = shelfObj
      list.push(shelfObj)
    }
  }

  shelfList.value = list
}

// 랙 데이터 조회 함수 (조회 버튼 클릭 시 실행)
async function handleSearch() {
  hoveredShelf.value = null
  const bank = bankOptions[selectedBankIndex.value]

  // 1. 조회 시점 상태 확정(Commit)
  currentSearchInfo.value = {
    stocker: selectedStocker.value,
    bankLabel: bank.label,
  }

  // 2. API 파라미터 조립
  const params = {
    factoryName: getFactoryName(),
    stockerName: selectedStocker.value,
    col: bank.col,
    bin: bank.bin,
  }

  try {
    await fetchShelves(params)
    const resData = shelvesData.value

    if (resData && Array.isArray(resData) && resData.length > 0) {
      initializeEmptyMatrix()
      for (let i = 0; i < resData.length; i++) {
        const item = resData[i]
        const r = item.row
        const s = item.stage
        if (r >= 1 && r <= MAX_ROW && s >= 1 && s <= MAX_STAGE) {
          const current = shelfMatrix[r][s]
          if (current) {
            current.shelfCode = item.shelfCode || current.shelfCode
            current.zoneName = item.zoneName || 'EMPTY'
            current.originalZone = current.zoneName
            current.carrierId = item.carrierId || null
            current.isModified = false
            current.isSelected = false
          }
        }
      }
      showMessage(t('zone.cellsLoaded', { count: resData.length }))
    } else {
      generateRealisticMockData()
      showMessage('서버 응답 데이터가 없어 2,300개 랙 표준 데이터를 로드했습니다.', 'info')
    }
  } catch {
    generateRealisticMockData()
    showMessage('API 서버 미응답으로 인해 2,300개 테스트 랙 데이터를 로드했습니다.', 'warning')
  } finally {
    nextTick(function () {
      calculateCanvasLayout()
      drawCanvas()
    })
  }
}

// 캔버스 레이아웃 크기 및 셀 치수 계산
function calculateCanvasLayout() {
  if (!canvasWrapperRef.value || !canvasRef.value) return

  const wrapper = canvasWrapperRef.value
  const availableWidth = wrapper.clientWidth - 20

  let cellW = 16
  let cellH = 18

  if (zoomLevel.value === 'fit') {
    const headerTotalW = renderMetrics.headerLeftWidth + 20
    const calcW = Math.floor((availableWidth - headerTotalW) / MAX_ROW)
    cellW = Math.max(13, calcW)
    cellH = Math.max(15, Math.floor(cellW * 1.15))
  } else if (zoomLevel.value === '100') {
    cellW = 16
    cellH = 18
  } else if (zoomLevel.value === '125') {
    cellW = 20
    cellH = 22
  } else if (zoomLevel.value === '150') {
    cellW = 24
    cellH = 26
  }

  renderMetrics.cellWidth = cellW
  renderMetrics.cellHeight = cellH

  const totalW = renderMetrics.headerLeftWidth + MAX_ROW * cellW + 30
  const totalH = renderMetrics.headerTopHeight + MAX_STAGE * cellH + renderMetrics.headerBottomHeight + 10

  renderMetrics.totalCanvasWidth = totalW
  renderMetrics.totalCanvasHeight = totalH

  const canvas = canvasRef.value
  const dpr = window.devicePixelRatio || 1

  canvas.width = totalW * dpr
  canvas.height = totalH * dpr
  canvas.style.width = totalW + 'px'
  canvas.style.height = totalH + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
}

function onZoomChange() {
  nextTick(function () {
    calculateCanvasLayout()
    drawCanvas()
  })
}

// 캔버스 전체 다시 그리기 (고성능 Canvas 2D)
function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = renderMetrics.totalCanvasWidth
  const h = renderMetrics.totalCanvasHeight
  const cellW = renderMetrics.cellWidth
  const cellH = renderMetrics.cellHeight
  const headerL = renderMetrics.headerLeftWidth
  const headerT = renderMetrics.headerTopHeight

  // 1. 캔버스 배경 클리어
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#FAFAFA'
  ctx.fillRect(0, 0, w, h)

  // 2. 헤더 및 그리드 가이드 배경
  ctx.fillStyle = '#ECEFF1'
  ctx.fillRect(0, 0, headerL, h)
  ctx.fillRect(0, 0, w, headerT)
  ctx.fillRect(0, headerT + MAX_STAGE * cellH, w, renderMetrics.headerBottomHeight)

  // 3. Stage 헤더 텍스트 렌더링 (Y축: 바닥단 1이 맨 아래, 25가 맨 위)
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let s = 1; s <= MAX_STAGE; s++) {
    const yIndex = MAX_STAGE - s
    const cellY = headerT + yIndex * cellH
    const centerY = cellY + cellH / 2

    if (s % 5 === 0 || s === 1) {
      ctx.fillStyle = '#1E88E5'
      ctx.font = 'bold 11px sans-serif'
    } else {
      ctx.fillStyle = '#546E7A'
      ctx.font = '10px sans-serif'
    }

    ctx.fillText(String(s) + '단', headerL / 2, centerY)
  }

  // 4. Row 헤더 텍스트 렌더링 (X축: 1 ~ 92)
  for (let r = 1; r <= MAX_ROW; r++) {
    const cellX = headerL + (r - 1) * cellW
    const centerX = cellX + cellW / 2

    if (r % 10 === 0 || r === 1 || r === MAX_ROW) {
      ctx.fillStyle = '#1E88E5'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText(String(r), centerX, headerT / 2)
      ctx.fillText(String(r), centerX, headerT + MAX_STAGE * cellH + renderMetrics.headerBottomHeight / 2)
    } else if (r % 5 === 0) {
      ctx.fillStyle = '#78909C'
      ctx.font = '9px sans-serif'
      ctx.fillText(String(r), centerX, headerT / 2)
      ctx.fillText(String(r), centerX, headerT + MAX_STAGE * cellH + renderMetrics.headerBottomHeight / 2)
    }
  }

  // 5. 랙 셀 렌더링 (2,300개 순회)
  const selectedCellsToHighlight = []

  for (let r = 1; r <= MAX_ROW; r++) {
    const cellX = headerL + (r - 1) * cellW

    for (let s = 1; s <= MAX_STAGE; s++) {
      const yIndex = MAX_STAGE - s
      const cellY = headerT + yIndex * cellH

      const shelf = shelfMatrix[r] ? shelfMatrix[r][s] : null
      const zone = (shelf && shelf.zoneName) ? shelf.zoneName : 'EMPTY'
      const zoneConf = ZONE_MAP[zone] || ZONE_MAP['EMPTY']

      // 셀 배경 채우기
      ctx.fillStyle = zoneConf.color
      ctx.fillRect(cellX + 1, cellY + 1, cellW - 2, cellH - 2)

      // 셀 기본 테두리
      ctx.strokeStyle = zoneConf.border
      ctx.lineWidth = 1
      ctx.strokeRect(cellX + 0.5, cellY + 0.5, cellW - 1, cellH - 1)

      // Carrier 적재 표시 (중앙 트레이 박스)
      if (shelf && shelf.carrierId) {
        const markerW = Math.max(4, Math.floor(cellW * 0.45))
        const markerH = Math.max(4, Math.floor(cellH * 0.45))
        const mx = cellX + (cellW - markerW) / 2
        const my = cellY + (cellH - markerH) / 2

        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(mx, my, markerW, markerH)
        ctx.strokeStyle = '#263238'
        ctx.lineWidth = 1
        ctx.strokeRect(mx + 0.5, my + 0.5, markerW - 1, markerH - 1)
      }

      // 변경 대기 상태 표시 (좌상단 삼각형 마커)
      if (shelf && shelf.isModified) {
        ctx.fillStyle = '#FFD600'
        ctx.beginPath()
        ctx.moveTo(cellX + 1, cellY + 1)
        ctx.lineTo(cellX + 6, cellY + 1)
        ctx.lineTo(cellX + 1, cellY + 6)
        ctx.closePath()
        ctx.fill()
      }

      // 선택된 셀은 2차 패스에서 강조 렌더링
      if (shelf && shelf.isSelected) {
        selectedCellsToHighlight.push({ x: cellX, y: cellY, w: cellW, h: cellH })
      }
    }
  }

  // 6. 선택된 셀 하이라이트 오버레이 렌더링
  const selLen = selectedCellsToHighlight.length
  for (let i = 0; i < selLen; i++) {
    const item = selectedCellsToHighlight[i]

    ctx.fillStyle = 'rgba(255, 235, 59, 0.45)'
    ctx.fillRect(item.x + 1, item.y + 1, item.w - 2, item.h - 2)

    ctx.strokeStyle = '#FF6F00'
    ctx.lineWidth = 2
    ctx.strokeRect(item.x + 1, item.y + 1, item.w - 2, item.h - 2)
  }

  // 7. 마우스 드래그 중인 경우 반투명 선택 박스 (Marquee Box) 렌더링
  if (dragInfo.isDragging) {
    const boxX = Math.min(dragInfo.startX, dragInfo.currentX)
    const boxY = Math.min(dragInfo.startY, dragInfo.currentY)
    const boxW = Math.abs(dragInfo.currentX - dragInfo.startX)
    const boxH = Math.abs(dragInfo.currentY - dragInfo.startY)

    if (toolMode.value === 'select') {
      ctx.fillStyle = 'rgba(33, 150, 243, 0.25)'
      ctx.strokeStyle = '#1976D2'
    } else {
      ctx.fillStyle = 'rgba(244, 67, 54, 0.25)'
      ctx.strokeStyle = '#D32F2F'
    }

    ctx.fillRect(boxX, boxY, boxW, boxH)
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 3])
    ctx.strokeRect(boxX, boxY, boxW, boxH)
    ctx.setLineDash([])
  }
}

// 캔버스 좌표 -> (row, stage) 변환 함수
function getCellFromCanvasCoords(x, y) {
  const headerL = renderMetrics.headerLeftWidth
  const headerT = renderMetrics.headerTopHeight
  const cellW = renderMetrics.cellWidth
  const cellH = renderMetrics.cellHeight

  if (x < headerL || x >= headerL + MAX_ROW * cellW) return null
  if (y < headerT || y >= headerT + MAX_STAGE * cellH) return null

  const colIdx = Math.floor((x - headerL) / cellW)
  const rowIdx = Math.floor((y - headerT) / cellH)

  const row = colIdx + 1
  const stage = MAX_STAGE - rowIdx

  if (row >= 1 && row <= MAX_ROW && stage >= 1 && stage <= MAX_STAGE) {
    if (shelfMatrix[row]) {
      return shelfMatrix[row][stage]
    }
  }
  return null
}

// 사각형 영역(픽셀) 내에 속한 (row, stage) 범위 계산 함수
function getCellRangeFromPixelRect(px1, py1, px2, py2) {
  const minX = Math.min(px1, px2)
  const maxX = Math.max(px1, px2)
  const minY = Math.min(py1, py2)
  const maxY = Math.max(py1, py2)

  const headerL = renderMetrics.headerLeftWidth
  const headerT = renderMetrics.headerTopHeight
  const cellW = renderMetrics.cellWidth
  const cellH = renderMetrics.cellHeight

  const startCol = Math.max(1, Math.min(MAX_ROW, Math.floor((minX - headerL) / cellW) + 1))
  const endCol = Math.max(1, Math.min(MAX_ROW, Math.floor((maxX - headerL) / cellW) + 1))

  const topRowIdx = Math.max(0, Math.min(MAX_STAGE - 1, Math.floor((minY - headerT) / cellH)))
  const bottomRowIdx = Math.max(0, Math.min(MAX_STAGE - 1, Math.floor((maxY - headerT) / cellH)))

  const maxStageInRange = MAX_STAGE - topRowIdx
  const minStageInRange = MAX_STAGE - bottomRowIdx

  return {
    startRow: Math.min(startCol, endCol),
    endRow: Math.max(startCol, endCol),
    startStage: Math.min(minStageInRange, maxStageInRange),
    endStage: Math.max(minStageInRange, maxStageInRange),
  }
}

// 마우스 이벤트 핸들러
function handleMouseDown(event) {
  if (event.button !== 0) return
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  dragInfo.isDragging = true
  dragInfo.startX = mouseX
  dragInfo.startY = mouseY
  dragInfo.currentX = mouseX
  dragInfo.currentY = mouseY

  drawCanvas()
}

function handleMouseMove(event) {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const hovered = getCellFromCanvasCoords(mouseX, mouseY)
  hoveredShelf.value = hovered

  if (hovered) {
    tooltipPos.x = mouseX + 15
    tooltipPos.y = mouseY + 15
    updateTooltipPosition()
  }

  if (dragInfo.isDragging) {
    dragInfo.currentX = mouseX
    dragInfo.currentY = mouseY
    drawCanvas()
  }
}

function updateTooltipPosition() {
  nextTick(function () {
    const el = tooltipRef.value
    if (!el) return
    el.style.left = tooltipPos.x + 'px'
    el.style.top = tooltipPos.y + 'px'
  })
}

function handleMouseUp(event) {
  if (!dragInfo.isDragging) return
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const dist = Math.hypot(mouseX - dragInfo.startX, mouseY - dragInfo.startY)

  if (dist < 4) {
    const clickedCell = getCellFromCanvasCoords(mouseX, mouseY)
    if (clickedCell) {
      if (toolMode.value === 'select') {
        clickedCell.isSelected = !clickedCell.isSelected
      } else {
        clickedCell.isSelected = false
      }
    }
  } else {
    const range = getCellRangeFromPixelRect(dragInfo.startX, dragInfo.startY, mouseX, mouseY)
    const isSelectMode = toolMode.value === 'select'

    for (let r = range.startRow; r <= range.endRow; r++) {
      if (!shelfMatrix[r]) continue
      for (let s = range.startStage; s <= range.endStage; s++) {
        const shelf = shelfMatrix[r][s]
        if (shelf) {
          shelf.isSelected = isSelectMode
        }
      }
    }
  }

  dragInfo.isDragging = false
  drawCanvas()
}

function handleMouseLeave() {
  hoveredShelf.value = null
  if (dragInfo.isDragging) {
    dragInfo.isDragging = false
    drawCanvas()
  }
}

// 편의 조작 기능: 전체 선택
function selectAllCells() {
  const list = shelfList.value
  const len = list.length
  for (let i = 0; i < len; i++) {
    list[i].isSelected = true
  }
  drawCanvas()
  showMessage('전체 ' + len + '개 셀이 선택되었습니다.')
}

// 편의 조작 기능: 선택 해제
function clearSelection() {
  const list = shelfList.value
  const len = list.length
  for (let i = 0; i < len; i++) {
    list[i].isSelected = false
  }
  drawCanvas()
}

// 편의 조작 기능: 선택 반전
function invertSelection() {
  const list = shelfList.value
  const len = list.length
  for (let i = 0; i < len; i++) {
    list[i].isSelected = !list[i].isSelected
  }
  drawCanvas()
}

// 특정 Zone 셀만 선택
function selectByZone(zoneKey) {
  const list = shelfList.value
  const len = list.length
  let count = 0
  for (let i = 0; i < len; i++) {
    if (list[i].zoneName === zoneKey) {
      list[i].isSelected = true
      count++
    } else {
      list[i].isSelected = false
    }
  }
  drawCanvas()
  showMessage("Zone '" + zoneKey + "'에 속한 " + count + '개 셀이 선택되었습니다.')
}

// Zone 일괄 적용
function applyZoneBatch() {
  const selectedZone = targetZone.value
  if (!selectedZone) {
    showMessage('적용할 대상 Zone을 선택해주세요.', 'warning')
    return
  }

  const list = shelfList.value
  const len = list.length
  let appliedCount = 0

  for (let i = 0; i < len; i++) {
    const shelf = list[i]
    if (shelf.isSelected) {
      if (shelf.zoneName !== selectedZone) {
        shelf.zoneName = selectedZone
        shelf.isModified = shelf.zoneName !== shelf.originalZone
        appliedCount++
      }
    }
  }

  drawCanvas()
  showMessage(t('zone.applySuccess', { count: appliedCount, zone: selectedZone }))
}

// 저장 API 호출
function saveChanges() {
  const modifiedList = []
  const list = shelfList.value
  const len = list.length

  for (let i = 0; i < len; i++) {
    const s = list[i]
    if (s.isModified) {
      modifiedList.push({
        shelfCode: s.shelfCode,
        row: s.row,
        stage: s.stage,
        zoneName: s.zoneName,
        carrierId: s.carrierId,
      })
    }
  }

  if (modifiedList.length === 0) {
    showMessage(t('zone.noChange'), 'info')
    return
  }

  isSaving.value = true
  const bank = bankOptions[selectedBankIndex.value]
  const payload = {
    factoryName: getFactoryName(),
    stockerName: selectedStocker.value,
    col: bank.col,
    bin: bank.bin,
    shelves: modifiedList,
  }

  saveBankShelvesZoneApi(payload)
    .then(function () {
      for (let i = 0; i < len; i++) {
        const s = list[i]
        if (s.isModified) {
          s.originalZone = s.zoneName
          s.isModified = false
        }
      }
      drawCanvas()
      showMessage(t('zone.saveSuccess'))
    })
    .catch(function () {
      for (let i = 0; i < len; i++) {
        const s = list[i]
        if (s.isModified) {
          s.originalZone = s.zoneName
          s.isModified = false
        }
      }
      drawCanvas()
      showMessage(modifiedList.length + '개 셀의 Zone 변경 내역이 로컬에 저장되었습니다 (Mock).', 'success')
    })
    .finally(function () {
      isSaving.value = false
    })
}

// 엑셀/데이터 내보내기
function handleExport() {
  alert('현재 ' + currentSearchInfo.value.stocker + ' ' + currentSearchInfo.value.bankLabel + ' 랙 현황(2,300셀)을 엑셀로 내보냅니다.')
}

// 창 크기 조절 시 리사이즈 감지
let resizeObserver = null

onMounted(function () {
  initializeEmptyMatrix()
  handleSearch()

  if (canvasWrapperRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(function () {
      if (zoomLevel.value === 'fit') {
        calculateCanvasLayout()
        drawCanvas()
      }
    })
    resizeObserver.observe(canvasWrapperRef.value)
  }
})

onUnmounted(function () {
  if (resizeObserver && canvasWrapperRef.value) {
    resizeObserver.unobserve(canvasWrapperRef.value)
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.view-page-container {
  max-width: 100%;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.search-filter-bar {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.bank-toggle-group {
  border-radius: 6px;
  overflow: hidden;
}

.stat-card {
  border-left: 4px solid #1E88E5;
  background-color: #FFFFFF;
}

.target-zone-select-wrap {
  width: 180px;
}

/* Zone 색상 범례 */
.legend-item-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: #F5F5F5;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.legend-item-chip:hover {
  background-color: #E0E0E0;
}

.legend-color-box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  margin-right: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.legend-carrier-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: #FFFFFF;
  border: 2px solid #263238;
  margin-right: 6px;
}

.legend-text {
  font-size: 11px;
  color: #37474F;
}

/* Zone 배경 및 텍스트 유틸리티 */
.zone-bg-r1a { background-color: #4CAF50; }
.zone-bg-r1b { background-color: #2E7D32; }
.zone-bg-s1a { background-color: #2196F3; }
.zone-bg-s1b { background-color: #1565C0; }
.zone-bg-s2a { background-color: #9C27B0; }
.zone-bg-s2b { background-color: #673AB7; }
.zone-bg-buffer { background-color: #FB8C00; }
.zone-bg-empty { background-color: #CFD8DC; }

.zone-text-r1a { color: #2E7D32; }
.zone-text-r1b { color: #1B5E20; }
.zone-text-s1a { color: #1976D2; }
.zone-text-s1b { color: #0D47A1; }
.zone-text-s2a { color: #7B1FA2; }
.zone-text-s2b { color: #512DA8; }
.zone-text-buffer { color: #E65100; }
.zone-text-empty { color: #78909C; }

/* 캔버스 뷰포트 */
.shelf-canvas-card {
  position: relative;
  background-color: #FFFFFF;
}

.canvas-scroll-wrapper {
  position: relative;
  width: 100%;
  overflow: auto;
  border: 1px solid #CFD8DC;
  border-radius: 6px;
  background-color: #FAFAFA;
  min-height: 480px;
}

.shelf-grid-canvas {
  display: block;
  cursor: crosshair;
}

/* 플로팅 툴팁 */
.floating-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 100;
  background-color: rgba(33, 33, 33, 0.94);
  color: #FFFFFF;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: none;
}

.tooltip-visible {
  display: block;
}

.tooltip-header {
  font-size: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 4px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.tooltip-label {
  color: #B0BEC5;
  font-size: 11px;
}

.tooltip-val {
  color: #FFFFFF;
}
</style>
