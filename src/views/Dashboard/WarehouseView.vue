<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$packageVariant" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">창고 모니터링</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            대시보드 &gt; 운영 모니터링 &gt; 창고 모니터링
          </v-chip>
          <v-chip size="small" color="success" variant="flat" class="ml-2 font-weight-medium">
            <v-icon icon="$radioboxBlank" size="10" class="mr-1 pulse-dot" />
            30초 자동 갱신 중
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
            새로고침
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$fileExport"
            v-on:click="handleExport"
          >
            엑셀 다운로드
          </v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 서버 검색 조건 바 -->
      <div class="search-filter-bar mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchParams.stockerName"
              label="스토커 명"
              placeholder="스토커 코드 입력"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="searchParams.stockerStatus"
              :items="statusOptions"
              label="스토커 상태"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" md="3" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="mr-2"
              v-on:click="handleSearch"
            >
              검색
            </v-btn>
            <v-btn variant="outlined" size="small" v-on:click="handleReset"> 초기화 </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- BaseDataTable: useDataTable의 options 및 items 바인딩 -->
      <BaseDataTable
        :headers="headers"
        :items="displayItems"
        :total-items="totalItems"
        :loading="loading"
        v-model:page="options.page"
        v-model:items-per-page="options.itemsPerPage"
        v-model:sort-by="options.sortBy"
        item-value="stockerName"
        density="compact"
        v-on:update:options="handleOptionsUpdate"
      >
        <!-- 적재율 프로그레스 바 커스텀 슬롯 -->
        <template #[`item.occupancyRate`]="{ item }">
          <v-progress-linear
            :model-value="item.occupancyRate"
            :color="getRateColor(item.occupancyRate)"
            height="16"
            rounded
          >
            <template #default="{ value }">
              <span class="text-caption font-weight-bold text-white">{{ value }}%</span>
            </template>
          </v-progress-linear>
        </template>

        <!-- 스토커 가동 상태 슬롯 -->
        <template #[`item.stockerStatus`]="{ item }">
          <v-chip
            :color="getStatusColor(item.stockerStatus)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.stockerStatus }}
          </v-chip>
        </template>

        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>조회된 스토커/창고 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsStockersApi } from '@/api/wcsStocker'

// 1. 검색 파라미터 상태
const searchParams = reactive({
  stockerName: '',
  stockerStatus: '전체',
})

const statusOptions = ['전체', 'RUNNING', 'IDLE', 'ERROR', 'DOWN']

// 2. 테이블 헤더 정의
const headers = [
  { title: '공장', key: 'factoryName', align: 'start', sortable: true },
  { title: '스토커 코드', key: 'stockerName', align: 'start', sortable: true },
  { title: '구역명', key: 'areaName', align: 'start', sortable: false },
  { title: '총 셀 수', key: 'totalShelfCount', align: 'end', sortable: true },
  { title: '적재 셀 수', key: 'useShelfCount', align: 'end', sortable: true },
  { title: '빈 셀 수', key: 'emptyShelfCount', align: 'end', sortable: true },
  { title: '적재율', key: 'occupancyRate', align: 'center', width: '160px', sortable: false },
  { title: '설비 상태', key: 'stockerStatus', align: 'center', sortable: true },
]

// 3. 페이징 전용 useDataTable 바인딩
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsStockersApi)

let pollingTimer = null

/**
 * 서버 파라미터 정제 함수
 */
function getSanitizedParams() {
  const params = {}
  if (searchParams.stockerName && searchParams.stockerName.trim() !== '') {
    params.stockerName = searchParams.stockerName.trim()
  }
  if (searchParams.stockerStatus && searchParams.stockerStatus !== '전체') {
    params.stockerStatus = searchParams.stockerStatus
  }
  return params
}

/**
 * 서버 수신 데이터에 적재율(occupancyRate) 동적 계산 추가
 */
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i = i + 1) {
    const raw = list[i]
    if (raw) {
      const total = Number(raw.totalShelfCount) || 0
      const used = Number(raw.useShelfCount) || 0

      let rate = 0
      if (total > 0) {
        rate = Math.round((used / total) * 100)
      }

      result.push({
        factoryName: raw.factoryName || '',
        stockerName: raw.stockerName || '',
        areaName: raw.areaName || raw.stockerName || '',
        totalShelfCount: total,
        useShelfCount: used,
        emptyShelfCount: Number(raw.emptyShelfCount) || 0,
        occupancyRate: rate,
        stockerStatus: raw.stockerStatus || 'IDLE',
      })
    }
  }

  return result
})

function getRateColor(rate) {
  if (rate >= 90) return 'error'
  if (rate >= 70) return 'warning'
  return 'primary'
}

function getStatusColor(status) {
  if (status === 'RUNNING') return 'success'
  if (status === 'IDLE') return 'info'
  if (status === 'ERROR' || status === 'DOWN') return 'error'
  return 'grey'
}

// 옵션 변경 이벤트 (페이징, 정렬)
function handleOptionsUpdate(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

// 수동 새로고침/검색
function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

// 검색 조건 초기화
function handleReset() {
  searchParams.stockerName = ''
  searchParams.stockerStatus = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function handleExport() {
  alert('스토커 모니터링 목록을 엑셀로 내보냅니다.')
}

// 라이프사이클: 초기 로드 및 30초 폴링 타이머
onMounted(function () {
  loadData(getSanitizedParams())

  pollingTimer = setInterval(function () {
    loadData(getSanitizedParams())
  }, 30000)
})

onBeforeUnmount(function () {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
})
</script>

<style scoped>
.view-page-container {
  max-width: 100%;
}
.search-filter-bar {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.gap-2 {
  gap: 8px;
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
</style>
