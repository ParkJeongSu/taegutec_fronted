<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">스토커 설비 관리 (Stocker)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            반송 &gt; 설비 관리 &gt; 스토커
          </v-chip>
        </div>

        <div class="d-flex align-center stocker-action-buttons">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddStocker"
          >
            신규 등록
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium mr-2"
            :loading="isLoading"
            v-on:click="handleSearch"
          >
            새로고침
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$fileExport"
            class="font-weight-medium"
            v-on:click="handleExport"
          >
            엑셀 다운로드
          </v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 검색 필터 패널 -->
      <div class="search-filter-panel mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <!-- 공장 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.factoryName"
              :items="factoryFilterOptions"
              label="소속 공장"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 스토커 코드/명 검색 필드 -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="searchParams.stockerName"
              label="스토커 코드 / 명"
              placeholder="예: WH1, STK-01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 설비 동작 상태 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.stockerStatus"
              :items="statusFilterOptions"
              label="설비 상태"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 사용 상태 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.useState"
              :items="useStateFilterOptions"
              label="사용 여부"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 검색 및 초기화 버튼 -->
          <v-col cols="12" sm="12" md="3" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="mr-2 font-weight-medium"
              v-on:click="handleSearch"
            >
              검색
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              class="font-weight-medium"
              v-on:click="handleReset"
            >
              초기화
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- 중앙 데이터 테이블 -->
      <BaseDataTable
        :headers="headers"
        :items="displayItems"
        :total-items="totalItems"
        :loading="isLoading"
        item-value="compositeKey"
        density="compact"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      >
        <!-- 적재율 컬럼 커스텀 렌더링 -->
        <template #[`item.occupancyRate`]="{ item }">
          <div class="d-flex align-center justify-center">
            <span
              class="font-weight-bold"
              :class="getOccupancyTextColor(item.occupancyRate)"
            >
              {{ item.occupancyRate }}%
            </span>
          </div>
        </template>

        <!-- 설비 상태 컬럼 커스텀 렌더링 -->
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

        <!-- 사용 상태 컬럼 커스텀 렌더링 -->
        <template #[`item.useState`]="{ item }">
          <v-chip
            :color="getUseStateColor(item.useState)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ getUseStateText(item.useState) }}
          </v-chip>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 스토커 설비 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import StockerViewForm from './components/StockerViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { fetchWcsStockersApi } from '@/api/wcsStocker'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  stockerName: '',
  stockerStatus: '전체',
  useState: '전체',
})

// 페이징 상태
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const statusFilterOptions = ['전체', 'IDLE', 'RUNNING', 'ERROR', 'DOWN', 'OFFLINE']
const useStateFilterOptions = ['전체', 'USE', 'UNUSE']

// 그리드 데이터 상태
const rawStockerItems = ref([])
const totalItems = ref(0)

// 테이블 컬럼 정의
const headers = [
  { title: '소속 공장', key: 'factoryName', align: 'center', width: '110px' },
  { title: '스토커 코드', key: 'stockerName', align: 'start', width: '130px' },
  { title: '구역명', key: 'areaName', align: 'start' },
  { title: '총 셀 수', key: 'totalShelfCount', align: 'end', width: '100px' },
  { title: '적재 셀 수', key: 'useShelfCount', align: 'end', width: '100px' },
  { title: '빈 셀 수', key: 'emptyShelfCount', align: 'end', width: '100px' },
  { title: '적재율', key: 'occupancyRate', align: 'center', width: '110px' },
  { title: '설비 상태', key: 'stockerStatus', align: 'center', width: '110px' },
  { title: '사용 여부', key: 'useState', align: 'center', width: '100px' },
  { title: '수정자', key: 'eventUser', align: 'center', width: '110px' },
  { title: '수정일시', key: 'eventTime', align: 'center', width: '160px' },
]

// useApi를 통한 목록 조회 API 바인딩
const { loading: isLoading, execute: executeFetchStockers } = useApi(fetchWcsStockersApi)

// 적재율 계산 및 복합키 매핑
const displayItems = computed(function () {
  const list = rawStockerItems.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const total = Number(raw.totalShelfCount || raw.totalSlots) || 0
      const used = Number(raw.useShelfCount || raw.usedSlots) || 0
      const empty = Number(raw.emptyShelfCount) || (total >= used ? total - used : 0)

      let rate = 0
      if (total > 0) {
        rate = Math.round((used / total) * 100)
      }

      result.push({
        ...raw,
        compositeKey: (raw.factoryName || '') + '_' + (raw.stockerName || raw.stockerId || ''),
        factoryName: raw.factoryName || 'INSERT',
        stockerName: raw.stockerName || raw.stockerId || '',
        areaName: raw.areaName || raw.stockerName || '',
        totalShelfCount: total,
        useShelfCount: used,
        emptyShelfCount: empty,
        occupancyRate: rate,
        stockerStatus: raw.stockerStatus || raw.status || 'IDLE',
        useState: raw.useState || (raw.useYn === 'N' ? 'UNUSE' : 'USE'),
        eventUser: raw.eventUser || '-',
        eventTime: raw.eventTime || raw.updateTime || '-',
      })
    }
  }

  return result
})

function getStatusColor(status) {
  if (status === 'RUNNING' || status === 'ONLINE') {
    return 'success'
  }
  if (status === 'IDLE' || status === 'AUTO') {
    return 'primary'
  }
  if (status === 'ERROR' || status === 'DOWN') {
    return 'error'
  }
  if (status === 'OFFLINE' || status === 'MANUAL') {
    return 'warning'
  }
  return 'grey'
}

function getUseStateColor(state) {
  if (state === 'USE' || state === 'ACTIVE' || state === 'Y' || state === '사용') {
    return 'success'
  }
  if (state === 'UNUSE' || state === 'INACTIVE' || state === 'N' || state === '미사용') {
    return 'grey'
  }
  return 'default'
}

function getUseStateText(state) {
  if (state === 'USE' || state === 'ACTIVE' || state === 'Y' || state === '사용') {
    return '사용'
  }
  if (state === 'UNUSE' || state === 'INACTIVE' || state === 'N' || state === '미사용') {
    return '미사용'
  }
  return state || '-'
}

function getOccupancyTextColor(rate) {
  if (rate >= 90) {
    return 'text-error'
  }
  if (rate >= 70) {
    return 'text-warning'
  }
  return 'text-primary'
}

// 스토커 목록 API 조회 함수
async function fetchStockers() {
  try {
    const params = {
      page: pagination.page - 1,
      size: pagination.itemsPerPage,
      factoryName: searchParams.factoryName !== '전체' ? searchParams.factoryName : undefined,
      stockerName: searchParams.stockerName ? searchParams.stockerName.trim() : undefined,
      stockerStatus: searchParams.stockerStatus !== '전체' ? searchParams.stockerStatus : undefined,
      useState: searchParams.useState !== '전체' ? searchParams.useState : undefined,
    }

    const response = await executeFetchStockers(params)

    if (response) {
      if (response.data && Array.isArray(response.data.content)) {
        rawStockerItems.value = response.data.content
        totalItems.value = response.data.totalElements || response.data.content.length
      } else if (response.content && Array.isArray(response.content)) {
        rawStockerItems.value = response.content
        totalItems.value = response.totalElements || (response.page && response.page.totalElements) || response.content.length
      } else if (response.data && Array.isArray(response.data)) {
        rawStockerItems.value = response.data
        totalItems.value = response.total || response.data.length
      } else if (Array.isArray(response)) {
        rawStockerItems.value = response
        totalItems.value = response.length
      } else {
        rawStockerItems.value = []
        totalItems.value = 0
      }
    }
  } catch (error) {
    console.error('Fetch stockers error:', error)
    rawStockerItems.value = []
    totalItems.value = 0
  }
}

function onUpdateOptions(options) {
  if (options) {
    pagination.page = options.page || 1
    pagination.itemsPerPage = options.itemsPerPage || 10
  }
  fetchStockers()
}

function handleSearch() {
  pagination.page = 1
  fetchStockers()
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.stockerName = ''
  searchParams.stockerStatus = '전체'
  searchParams.useState = '전체'
  pagination.page = 1
  fetchStockers()
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddStocker() {
  panelStore.openPanel(markRaw(StockerViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 스토커 등록',
    onSuccess: fetchStockers,
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(StockerViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '스토커 정보 수정',
    onSuccess: fetchStockers,
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 스토커 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent = csvContent + '소속 공장,스토커 코드,구역명,총 셀 수,적재 셀 수,빈 셀 수,적재율,설비 상태,사용 여부,수정자,수정일시\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.stockerName || '',
      item.areaName || '',
      item.totalShelfCount || 0,
      item.useShelfCount || 0,
      item.emptyShelfCount || 0,
      (item.occupancyRate || 0) + '%',
      item.stockerStatus || '',
      item.useState || '',
      item.eventUser || '',
      item.eventTime || '',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'Stocker_List_' + new Date().toISOString().slice(0, 10) + '.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(function () {
  fetchStockers()
})
</script>

<style scoped>
.view-page-container {
  max-width: 100%;
}
.search-filter-panel {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.stocker-action-buttons {
  gap: 8px;
}
</style>
