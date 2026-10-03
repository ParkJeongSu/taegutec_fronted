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
            :loading="loadingShelves || loadingZones"
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

      <!-- 검색 필터 폼 -->
      <div class="search-filter-bar pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <!-- 1. 스토커 / 창고 선택 -->
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

          <!-- 2. Bank 선택 -->
          <v-col cols="12" sm="5" md="6">
            <div class="d-flex align-center">
              <span class="text-caption font-weight-bold text-medium-emphasis mr-2">
                {{ $t('zone.bank') }}:
              </span>
              <v-btn-toggle
                v-model="selectedBankIndex"
                mandatory
                density="compact"
                color="primary"
                variant="outlined"
                class="bank-toggle-group flex-grow-1"
                v-on:update:model-value="onBankChange"
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

          <!-- 3. 조회 버튼 -->
          <v-col cols="12" sm="3" md="3" class="d-flex justify-end">
            <v-btn
              color="primary"
              variant="flat"
              size="default"
              prepend-icon="$magnify"
              class="w-100 font-weight-bold"
              :loading="loadingShelves || loadingZones"
              v-on:click="handleSearch"
            >
              {{ $t('zone.search') }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- 중앙 통계 요약 바 (실제 유효 셀 수 기준) -->
    <v-row density="compact" class="mb-3">
      <v-col cols="6" sm="3">
        <v-card class="elevation-1 pa-3 stat-card">
          <div class="text-caption text-medium-emphasis">유효 셸프 수</div>
          <div class="text-h6 font-weight-bold text-primary">
            {{ totalCellCount.toLocaleString() }} {{ $t('views.transfer.zone.cellUnit') }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card class="elevation-1 pa-3 stat-card">
          <div class="text-caption text-medium-emphasis">{{ $t('zone.occupiedCells') }}</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ occupiedCellCount.toLocaleString() }} {{ $t('views.transfer.zone.cellUnit') }}
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
            {{ (totalCellCount - occupiedCellCount).toLocaleString() }}
            {{ $t('views.transfer.zone.cellUnit') }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card class="elevation-1 pa-3 stat-card">
          <div class="text-caption text-medium-emphasis">{{ $t('zone.modifiedCells') }}</div>
          <div
            class="text-h6 font-weight-bold"
            :class="modifiedCount > 0 ? 'text-warning' : 'text-grey'"
          >
            {{ $t('views.transfer.zone.modifiedCellsUnit', { count: modifiedCount }) }}
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

          <v-btn size="small" variant="tonal" color="primary" v-on:click="selectAllCells">
            {{ $t('zone.selectAll') }}
          </v-btn>
          <v-btn size="small" variant="outlined" color="grey-darken-2" v-on:click="clearSelection">
            {{ $t('zone.clearSelect') }}
          </v-btn>
          <v-btn size="small" variant="tonal" color="info" v-on:click="invertSelection">
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
              :items="availableZoneNames"
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
            :disabled="selectedCellCount === 0 || !targetZone"
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

      <!-- 하단: Zone 범례 (DB 동적 연동) -->
      <v-divider class="my-3"></v-divider>
      <div class="d-flex flex-wrap align-center gap-2">
        <span class="text-caption font-weight-bold text-medium-emphasis mr-1">
          {{ $t('zone.legend') }}:
        </span>
        <div
          v-for="zKey in availableZoneNames"
          :key="zKey"
          class="legend-item-chip"
          v-on:click="selectByZone(zKey)"
        >
          <span class="legend-color-box" :style="{ backgroundColor: getZoneColor(zKey) }"></span>
          <span class="legend-text font-weight-medium">
            {{ zKey }} ({{ zoneStats[zKey] || 0 }})
          </span>
        </div>

        <div class="legend-item-chip ml-2">
          <span class="legend-carrier-dot"></span>
          <span class="legend-text font-weight-medium">{{ $t('zone.carrierLoaded') }}</span>
        </div>

        <div class="legend-item-chip ml-2">
          <span class="legend-invalid-box"></span>
          <span class="legend-text font-weight-medium text-disabled">미설치 공간(선택 불가)</span>
        </div>
      </div>
    </v-card>

    <!-- 메인 랙 그리드 Canvas 뷰포트 영역 -->
    <v-card class="elevation-1 rounded-lg pa-4 shelf-canvas-card">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center gap-2">
          <span class="text-subtitle-1 font-weight-bold">
            {{ currentSearchInfo.stocker }} - {{ currentSearchInfo.bankLabel }} (Row 1~92 x Stage
            1~25)
          </span>
          <span class="text-caption text-medium-emphasis"> [{{ $t('zone.guideText') }}] </span>
        </div>

        <!-- 줌 컨트롤 -->
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

        <!-- 호버 플로팅 툴팁 (유효 셀만 노출) -->
        <div
          v-if="hoveredShelf && hoveredShelf.isValidShelf"
          class="floating-tooltip elevation-4 tooltip-visible"
          ref="tooltipRef"
        >
          <div class="tooltip-header font-weight-bold text-primary mb-1">
            Shelf: {{ hoveredShelf.shelfName }}
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">{{ $t('views.transfer.zone.posTooltip') }}</span>
            <span class="tooltip-val font-weight-bold">
              {{
                $t('views.transfer.zone.rowStageTooltip', {
                  row: hoveredShelf.row,
                  stage: hoveredShelf.stage,
                })
              }}
            </span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">{{ $t('views.transfer.zone.zoneTooltip') }}</span>
            <span
              class="tooltip-val font-weight-bold"
              :style="{ color: getZoneColor(hoveredShelf.zoneName) }"
            >
              {{ hoveredShelf.zoneName || 'EMPTY' }}
            </span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">{{ $t('views.transfer.zone.carrierTooltip') }}</span>
            <span class="tooltip-val font-weight-bold text-info">
              {{ hoveredShelf.carrierName || $t('views.transfer.zone.none') }}
            </span>
          </div>
          <div
            v-if="hoveredShelf.isModified"
            class="tooltip-row mt-1 text-warning font-weight-bold"
          >
            {{ $t('views.transfer.zone.pendingMod') }}
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
          {{ $t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsZonesApi } from '@/api/wcsZone'
import { fetchWcsShelvesApi, saveBatchShelfApi } from '@/api/wcsShelf'

const { t } = useI18n()
const authStore = useAuthStore()

// 랙 규격 상수
const MAX_ROW = 92
const MAX_STAGE = 25

// 상태 갱신 트리거 카운터
const stateVersion = ref(0)

// 스토커 및 Bank 옵션
const selectedStocker = ref('WH1')
const stockerOptions = ['WH1', 'WH2', 'WH3', 'WH4', 'WH5', 'WH6', 'WH7', 'STK01', 'STK02', 'STK03']

const bankOptions = [
  { label: 'Bank 1', col: 1, bin: 1 },
  { label: 'Bank 2', col: 1, bin: 2 },
  { label: 'Bank 3', col: 2, bin: 1 },
  { label: 'Bank 4', col: 2, bin: 2 },
]
const selectedBankIndex = ref(0)

const currentSearchInfo = ref({
  stocker: 'WH1',
  bankLabel: 'Bank 1',
})

const toolMode = ref('select') // 'select' | 'deselect'
const targetZone = ref('')
const zoomLevel = ref('fit')
const isSaving = ref(false)

// WCS Zone 및 Shelf 데이터 조회를 위한 useDataTable 전담 연동
const {
  items: zoneRawItems,
  loading: loadingZones,
  loadData: loadZoneData,
} = useDataTable(fetchWcsZonesApi)

const {
  items: shelfRawItems,
  loading: loadingShelves,
  loadData: loadShelfData,
} = useDataTable(fetchWcsShelvesApi)

// 동적 로드된 Zone 메타데이터 맵: { [zoneName]: { color, border } }
const dynamicZoneMap = ref({
  EMPTY: { color: '#CFD8DC', border: '#B0BEC5' },
})

const availableZoneNames = computed(function () {
  const keys = Object.keys(dynamicZoneMap.value)
  return keys.length > 0 ? keys : ['EMPTY']
})

function getZoneColor(zoneName) {
  const z = zoneName || 'EMPTY'
  if (dynamicZoneMap.value[z] && dynamicZoneMap.value[z].color) {
    return dynamicZoneMap.value[z].color
  }
  return '#CFD8DC'
}

function getZoneBorder(zoneName) {
  const z = zoneName || 'EMPTY'
  if (dynamicZoneMap.value[z] && dynamicZoneMap.value[z].border) {
    return dynamicZoneMap.value[z].border
  }
  return '#B0BEC5'
}

// 캔버스 및 래퍼 엘리먼트 참조
const canvasRef = ref(null)
const canvasWrapperRef = ref(null)
const tooltipRef = ref(null)

// 랙 데이터 구조
let shelfMatrix = []
const shelfList = ref([])

const hoveredShelf = ref(null)
const tooltipPos = reactive({ x: 0, y: 0 })

const dragInfo = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
})

const renderMetrics = reactive({
  headerLeftWidth: 42,
  headerTopHeight: 28,
  headerBottomHeight: 28,
  cellWidth: 16,
  cellHeight: 18,
  totalCanvasWidth: 1550,
  totalCanvasHeight: 520,
})

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

function getFactoryName() {
  if (authStore && authStore.currentUser && authStore.currentUser.factoryName) {
    return authStore.currentUser.factoryName
  }
  return import.meta.env.VITE_PLANT_TYPE || 'insert'
}

// 2,300개 전체 격자를 초기화하되 기본 isValidShelf = false 처리
function initializeEmptyMatrix() {
  shelfMatrix = []
  const list = []

  for (let r = 0; r <= MAX_ROW; r++) {
    shelfMatrix[r] = []
    if (r === 0) continue
    for (let s = 1; s <= MAX_STAGE; s++) {
      const cell = {
        shelfName: '',
        row: r,
        stage: s,
        zoneName: 'EMPTY',
        carrierName: null,
        isSelected: false,
        isModified: false,
        originalZone: 'EMPTY',
        isValidShelf: false, // 💡 실제 DB에 존재하는 유효 셸프 여부
      }
      shelfMatrix[r][s] = cell
      list.push(cell)
    }
  }
  shelfList.value = list
}

// 통계 지표 계산 (실제 유효 셸프 isValidShelf: true 인 대상만 집계)
const totalCellCount = computed(function () {
  void stateVersion.value
  let count = 0
  const list = shelfList.value
  for (let i = 0; i < list.length; i++) {
    if (list[i].isValidShelf) {
      count++
    }
  }
  return count
})

const occupiedCellCount = computed(function () {
  void stateVersion.value
  let count = 0
  const list = shelfList.value
  for (let i = 0; i < list.length; i++) {
    if (
      list[i].isValidShelf &&
      list[i].carrierName &&
      list[i].carrierName !== '-' &&
      String(list[i].carrierName).trim() !== ''
    ) {
      count++
    }
  }
  return count
})

const occupancyRate = computed(function () {
  if (totalCellCount.value === 0) return '0.0'
  return ((occupiedCellCount.value / totalCellCount.value) * 100).toFixed(1)
})

const selectedCellCount = computed(function () {
  void stateVersion.value
  let count = 0
  const list = shelfList.value
  for (let i = 0; i < list.length; i++) {
    if (list[i].isValidShelf && list[i].isSelected) {
      count++
    }
  }
  return count
})

const modifiedCount = computed(function () {
  void stateVersion.value
  let count = 0
  const list = shelfList.value
  for (let i = 0; i < list.length; i++) {
    if (list[i].isValidShelf && list[i].isModified) {
      count++
    }
  }
  return count
})

const zoneStats = computed(function () {
  void stateVersion.value
  const stats = {}
  const names = availableZoneNames.value
  for (let k = 0; k < names.length; k++) {
    stats[names[k]] = 0
  }

  const list = shelfList.value
  for (let i = 0; i < list.length; i++) {
    if (list[i].isValidShelf) {
      const z = list[i].zoneName || 'EMPTY'
      if (stats[z] !== undefined) {
        stats[z]++
      } else {
        stats[z] = 1
      }
    }
  }
  return stats
})

// Zone 목록 로드 (WCS Zone API)
async function fetchZoneList() {
  try {
    await loadZoneData({
      factoryName: getFactoryName(),
      size: 100,
    })

    const newMap = {
      EMPTY: { color: '#CFD8DC', border: '#B0BEC5' },
    }

    const zones = zoneRawItems.value || []
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i]
      if (z && z.zoneName) {
        const rawColor = z.zoneColor || '#32ccbc'
        const color = rawColor.length === 9 ? rawColor.substring(0, 7) : rawColor
        newMap[z.zoneName] = {
          color: color,
          border: color,
        }
      }
    }

    dynamicZoneMap.value = newMap
    if (!targetZone.value && zones.length > 0) {
      targetZone.value = zones[0].zoneName
    }
    stateVersion.value++
  } catch (err) {
    console.error('Zone list fetch error:', err)
  }
}

// 셸프 목록 로드 및 매핑 (WCS Shelf API)
async function handleSearch() {
  hoveredShelf.value = null
  const bank = bankOptions[selectedBankIndex.value]

  currentSearchInfo.value = {
    stocker: selectedStocker.value,
    bankLabel: bank.label,
  }

  initializeEmptyMatrix()

  try {
    await loadShelfData({
      factoryName: getFactoryName(),
      stockerName: selectedStocker.value,
      col: bank.col,
      bin: bank.bin,
      size: 3000,
    })

    const fetchedList = shelfRawItems.value || []
    for (let i = 0; i < fetchedList.length; i++) {
      const item = fetchedList[i]
      const r = Number(item.row)
      const s = Number(item.stage)
      if (r >= 1 && r <= MAX_ROW && s >= 1 && s <= MAX_STAGE) {
        const cell = shelfMatrix[r][s]
        if (cell) {
          cell.shelfName = item.shelfName || ''
          cell.zoneName =
            item.zoneName && item.zoneName.trim() !== '' ? item.zoneName.trim() : 'EMPTY'
          cell.originalZone = cell.zoneName
          cell.carrierName = item.carrierName || null
          cell.isModified = false
          cell.isSelected = false
          cell.isValidShelf = true // 💡 DB에 실제로 존재하는 셸프임을 확인
        }
      }
    }
    stateVersion.value++
    showMessage(t('zone.cellsLoaded', { count: fetchedList.length }))
  } catch (err) {
    console.error('Shelf search failed:', err)
    showMessage(t('views.transfer.zone.fallbackLoadedWarn'), 'warning')
  } finally {
    nextTick(function () {
      calculateCanvasLayout()
      drawCanvas()
    })
  }
}

function onBankChange() {
  handleSearch()
}

// 캔버스 렌더링 치수 계산
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
  const totalH =
    renderMetrics.headerTopHeight + MAX_STAGE * cellH + renderMetrics.headerBottomHeight + 10

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

// 캔버스 2D 렌더링
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

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#FAFAFA'
  ctx.fillRect(0, 0, w, h)

  // 헤더 영역 배경
  ctx.fillStyle = '#ECEFF1'
  ctx.fillRect(0, 0, headerL, h)
  ctx.fillRect(0, 0, w, headerT)
  ctx.fillRect(0, headerT + MAX_STAGE * cellH, w, renderMetrics.headerBottomHeight)

  // Stage 단 번호 라벨 (1~25단, 아래에서 위로)
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
    ctx.fillText(String(s) + 'F', headerL / 2, centerY)
  }

  // Row 열 번호 라벨 (1~92열)
  for (let r = 1; r <= MAX_ROW; r++) {
    const cellX = headerL + (r - 1) * cellW
    const centerX = cellX + cellW / 2

    if (r % 10 === 0 || r === 1 || r === MAX_ROW) {
      ctx.fillStyle = '#1E88E5'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText(String(r), centerX, headerT / 2)
      ctx.fillText(
        String(r),
        centerX,
        headerT + MAX_STAGE * cellH + renderMetrics.headerBottomHeight / 2,
      )
    } else if (r % 5 === 0) {
      ctx.fillStyle = '#78909C'
      ctx.font = '9px sans-serif'
      ctx.fillText(String(r), centerX, headerT / 2)
      ctx.fillText(
        String(r),
        centerX,
        headerT + MAX_STAGE * cellH + renderMetrics.headerBottomHeight / 2,
      )
    }
  }

  // 셀 렌더링
  const selectedCells = []

  for (let r = 1; r <= MAX_ROW; r++) {
    const cellX = headerL + (r - 1) * cellW

    for (let s = 1; s <= MAX_STAGE; s++) {
      const yIndex = MAX_STAGE - s
      const cellY = headerT + yIndex * cellH
      const shelf = shelfMatrix[r] ? shelfMatrix[r][s] : null

      // 💡 1. DB에 없는 비어있는 공간(미설치 영역) 렌더링
      if (!shelf || !shelf.isValidShelf) {
        ctx.fillStyle = '#ECEFF1'
        ctx.fillRect(cellX + 1, cellY + 1, cellW - 2, cellH - 2)
        ctx.strokeStyle = '#E0E0E0'
        ctx.lineWidth = 1
        ctx.strokeRect(cellX + 0.5, cellY + 0.5, cellW - 1, cellH - 1)
        continue
      }

      // 💡 2. 유효한 셸프 렌더링
      const zone = shelf.zoneName ? shelf.zoneName : 'EMPTY'
      ctx.fillStyle = getZoneColor(zone)
      ctx.fillRect(cellX + 1, cellY + 1, cellW - 2, cellH - 2)

      ctx.strokeStyle = getZoneBorder(zone)
      ctx.lineWidth = 1
      ctx.strokeRect(cellX + 0.5, cellY + 0.5, cellW - 1, cellH - 1)

      // 캐리어 적재 표시
      if (shelf.carrierName) {
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

      // 변경 대기 상태 (노란색 모서리 마커)
      if (shelf.isModified) {
        ctx.fillStyle = '#FFD600'
        ctx.beginPath()
        ctx.moveTo(cellX + 1, cellY + 1)
        ctx.lineTo(cellX + 6, cellY + 1)
        ctx.lineTo(cellX + 1, cellY + 6)
        ctx.closePath()
        ctx.fill()
      }

      if (shelf.isSelected) {
        selectedCells.push({ x: cellX, y: cellY, w: cellW, h: cellH })
      }
    }
  }

  // 선택된 셀 강조 테두리
  for (let i = 0; i < selectedCells.length; i++) {
    const item = selectedCells[i]
    ctx.fillStyle = 'rgba(255, 235, 59, 0.45)'
    ctx.fillRect(item.x + 1, item.y + 1, item.w - 2, item.h - 2)

    ctx.strokeStyle = '#FF6F00'
    ctx.lineWidth = 2
    ctx.strokeRect(item.x + 1, item.y + 1, item.w - 2, item.h - 2)
  }

  // 마우스 드래그 영역 상자 (Marquee)
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
  hoveredShelf.value = hovered && hovered.isValidShelf ? hovered : null

  if (hoveredShelf.value) {
    tooltipPos.x = mouseX + 15
    tooltipPos.y = mouseY + 15
    nextTick(function () {
      if (tooltipRef.value) {
        tooltipRef.value.style.left = tooltipPos.x + 'px'
        tooltipRef.value.style.top = tooltipPos.y + 'px'
      }
    })
  }

  if (dragInfo.isDragging) {
    dragInfo.currentX = mouseX
    dragInfo.currentY = mouseY
    drawCanvas()
  }
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
    // 💡 유효한 셸프만 클릭 토글 허용
    if (clickedCell && clickedCell.isValidShelf) {
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
        // 💡 유효한 셸프만 드래그 선택 영역에 포함
        if (shelf && shelf.isValidShelf) {
          shelf.isSelected = isSelectMode
        }
      }
    }
  }

  dragInfo.isDragging = false
  stateVersion.value++
  drawCanvas()
}

function handleMouseLeave() {
  hoveredShelf.value = null
  if (dragInfo.isDragging) {
    dragInfo.isDragging = false
    drawCanvas()
  }
}

function selectAllCells() {
  const list = shelfList.value
  let count = 0
  for (let i = 0; i < list.length; i++) {
    if (list[i].isValidShelf) {
      list[i].isSelected = true
      count++
    }
  }
  stateVersion.value++
  drawCanvas()
  showMessage(t('views.transfer.zone.selectedAllMsg', { count: count }))
}

function clearSelection() {
  const list = shelfList.value
  for (let i = 0; i < list.length; i++) {
    list[i].isSelected = false
  }
  stateVersion.value++
  drawCanvas()
}

function invertSelection() {
  const list = shelfList.value
  for (let i = 0; i < list.length; i++) {
    if (list[i].isValidShelf) {
      list[i].isSelected = !list[i].isSelected
    }
  }
  stateVersion.value++
  drawCanvas()
}

function selectByZone(zoneKey) {
  const list = shelfList.value
  let count = 0
  for (let i = 0; i < list.length; i++) {
    if (list[i].isValidShelf) {
      if (list[i].zoneName === zoneKey) {
        list[i].isSelected = true
        count++
      } else {
        list[i].isSelected = false
      }
    }
  }
  stateVersion.value++
  drawCanvas()
  showMessage(t('views.transfer.zone.selectedZoneMsg', { zone: zoneKey, count: count }))
}

function applyZoneBatch() {
  const selectedZone = targetZone.value
  if (!selectedZone) {
    showMessage(t('views.transfer.zone.selectTargetZoneAlert'), 'warning')
    return
  }

  const list = shelfList.value
  let appliedCount = 0

  for (let i = 0; i < list.length; i++) {
    const shelf = list[i]
    if (shelf.isValidShelf && shelf.isSelected) {
      if (shelf.zoneName !== selectedZone) {
        shelf.zoneName = selectedZone
        shelf.isModified = shelf.zoneName !== shelf.originalZone
        appliedCount++
      }
    }
  }

  stateVersion.value++
  drawCanvas()
  showMessage(t('zone.applySuccess', { count: appliedCount, zone: selectedZone }))
}

// WCS Shelf Batch Save API 연동
async function saveChanges() {
  const modifiedList = []
  const list = shelfList.value

  for (let i = 0; i < list.length; i++) {
    const s = list[i]
    // 💡 유효 셸프이면서 변경된 항목만 전송
    if (s.isValidShelf && s.isModified) {
      modifiedList.push({
        factoryName: getFactoryName(),
        shelfName: s.shelfName,
        stockerName: selectedStocker.value,
        targetZone: s.zoneName,
      })
    }
  }

  if (modifiedList.length === 0) {
    showMessage(t('zone.noChange'), 'info')
    return
  }

  isSaving.value = true

  const groupedByZone = {}
  for (let i = 0; i < modifiedList.length; i++) {
    const item = modifiedList[i]
    const z = item.targetZone
    if (!groupedByZone[z]) {
      groupedByZone[z] = []
    }
    groupedByZone[z].push({
      factoryName: item.factoryName,
      shelfName: item.shelfName,
      stockerName: item.stockerName,
    })
  }

  try {
    const zoneKeys = Object.keys(groupedByZone)
    for (let k = 0; k < zoneKeys.length; k++) {
      const zName = zoneKeys[k]
      const payload = {
        factoryName: getFactoryName(),
        zoneName: zName,
        eventName: 'ShelfZoneBatchSaved',
        eventUser: authStore.currentUser ? authStore.currentUser.userId : 'aim',
        eventComment: 'Zone batch changed via Transfer UI',
        shelfList: groupedByZone[zName],
      }
      await saveBatchShelfApi(payload)
    }

    for (let i = 0; i < list.length; i++) {
      const s = list[i]
      if (s.isModified) {
        s.originalZone = s.zoneName
        s.isModified = false
      }
    }

    stateVersion.value++
    drawCanvas()
    showMessage(t('zone.saveSuccess'))
  } catch (err) {
    console.error('Batch save failed:', err)
    const errorMsg =
      (err.response && err.response.data && err.response.data.message) ||
      '셸프 존 일괄 저장 처리 중 오류가 발생했습니다.'
    showMessage(errorMsg, 'error')
  } finally {
    isSaving.value = false
  }
}

function handleExport() {
  alert(
    t('views.transfer.zone.exportZoneAlert', {
      stocker: currentSearchInfo.value.stocker,
      bank: currentSearchInfo.value.bankLabel,
    }),
  )
}

let resizeObserver = null

onMounted(async function () {
  initializeEmptyMatrix()
  await fetchZoneList()
  await handleSearch()

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
  border-left: 4px solid #1e88e5;
  background-color: #ffffff;
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
  background-color: #f5f5f5;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.legend-item-chip:hover {
  background-color: #e0e0e0;
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
  background-color: #ffffff;
  border: 2px solid #263238;
  margin-right: 6px;
}

.legend-invalid-box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background-color: #eceff1;
  border: 1px solid #e0e0e0;
  margin-right: 6px;
}

.legend-text {
  font-size: 11px;
  color: #37474f;
}

/* 캔버스 뷰포트 */
.shelf-canvas-card {
  position: relative;
  background-color: #ffffff;
}

.canvas-scroll-wrapper {
  position: relative;
  width: 100%;
  overflow: auto;
  border: 1px solid #cfd8dc;
  border-radius: 6px;
  background-color: #fafafa;
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
  color: #ffffff;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
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
  color: #b0bec5;
  font-size: 11px;
}

.tooltip-val {
  color: #ffffff;
}
</style>
