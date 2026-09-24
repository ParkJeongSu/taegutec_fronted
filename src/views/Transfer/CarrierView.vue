<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">캐리어 관리 (RGV / OHT)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            반송 &gt; 설비 관리 &gt; 캐리어
          </v-chip>
        </div>

        <div class="d-flex align-center carrier-action-buttons">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddCarrier"
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

          <!-- 캐리어 명 검색 필드 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.carrierName"
              label="캐리어 명 / ID"
              placeholder="예: RGV-01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 캐리어 타입 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.carrierType"
              :items="carrierTypeFilterOptions"
              label="캐리어 타입"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 동작 상태 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.carrierStatus"
              :items="statusFilterOptions"
              label="동작 상태"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 사용 여부 필터 -->
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
          <v-col cols="12" sm="6" md="2" class="d-flex align-center">
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
        <!-- 캐리어 타입 컬럼 -->
        <template #[`item.carrierType`]="{ item }">
          <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold">
            {{ item.carrierType }}
          </v-chip>
        </template>

        <!-- 배터리 컬럼 커스텀 렌더링 -->
        <template #[`item.battery`]="{ item }">
          <div class="d-flex align-center justify-center">
            <v-icon
              :icon="getBatteryIcon(item.battery)"
              size="16"
              :color="getBatteryColor(item.battery)"
              class="mr-1"
            />
            <span class="font-weight-bold" :class="getBatteryTextColor(item.battery)">
              {{ item.battery }}%
            </span>
          </div>
        </template>

        <!-- 동작 상태 컬럼 커스텀 렌더링 -->
        <template #[`item.carrierStatus`]="{ item }">
          <v-chip
            :color="getStatusColor(item.carrierStatus)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.carrierStatus }}
          </v-chip>
        </template>

        <!-- 적재 트레이 ID 컬럼 -->
        <template #[`item.loadedTrayId`]="{ item }">
          <span v-if="item.loadedTrayId && item.loadedTrayId !== '-'" class="font-weight-medium text-primary">
            {{ item.loadedTrayId }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- 사용 여부 컬럼 커스텀 렌더링 -->
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
            <div>등록된 캐리어 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import CarrierViewForm from './components/CarrierViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { fetchWcsCarriersApi } from '@/api/wcsCarrier'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  carrierName: '',
  carrierType: '전체',
  carrierStatus: '전체',
  useState: '전체',
})

// 페이징 상태
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const carrierTypeFilterOptions = ['전체', 'RGV', 'OHT', 'AGV', 'AMR']
const statusFilterOptions = [
  '전체',
  'IDLE',
  'MOVING',
  'LOADING',
  'UNLOADING',
  'CHARGING',
  'ERROR',
  'DOWN',
]
const useStateFilterOptions = ['전체', 'USE', 'UNUSE']

// 그리드 데이터 상태
const rawCarrierItems = ref([])
const totalItems = ref(0)

// 테이블 컬럼 정의
const headers = [
  { title: '소속 공장', key: 'factoryName', align: 'center', width: '100px' },
  { title: '캐리어 ID', key: 'carrierName', align: 'start', width: '120px' },
  { title: '타입', key: 'carrierType', align: 'center', width: '90px' },
  { title: '현재 위치 노드', key: 'currentNode', align: 'start', width: '130px' },
  { title: '목적지 노드', key: 'destNode', align: 'start', width: '130px' },
  { title: '배터리', key: 'battery', align: 'center', width: '110px' },
  { title: '동작 상태', key: 'carrierStatus', align: 'center', width: '110px' },
  { title: '적재 트레이', key: 'loadedTrayId', align: 'center', width: '130px' },
  { title: '사용 여부', key: 'useState', align: 'center', width: '90px' },
  { title: '수정자', key: 'eventUser', align: 'center', width: '100px' },
  { title: '수정일시', key: 'eventTime', align: 'center', width: '160px' },
]

// useApi를 통한 목록 조회 API 바인딩
const { loading: isLoading, execute: executeFetchCarriers } = useApi(fetchWcsCarriersApi)

// 복합키 결합 및 데이터 정규화
const displayItems = computed(function () {
  const list = rawCarrierItems.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'INSERT'
      const cn = raw.carrierName || raw.carrierId || ''

      result.push({
        ...raw,
        compositeKey: fn + '_' + cn,
        factoryName: fn,
        carrierName: cn,
        carrierType: raw.carrierType || raw.type || 'RGV',
        currentNode: raw.currentNode || '-',
        destNode: raw.destNode || '-',
        battery: raw.battery != null ? Number(raw.battery) : 100,
        carrierStatus: raw.carrierStatus || raw.status || 'IDLE',
        loadedTrayId: raw.loadedTrayId || raw.trayId || '-',
        useState: raw.useState || (raw.useYn === 'N' ? 'UNUSE' : 'USE'),
        eventUser: raw.eventUser || '-',
        eventTime: raw.eventTime || raw.updateTime || '-',
      })
    }
  }

  return result
})

function getStatusColor(status) {
  if (status === 'MOVING' || status === 'RUNNING') {
    return 'info'
  }
  if (status === 'LOADING' || status === 'UNLOADING') {
    return 'primary'
  }
  if (status === 'CHARGING') {
    return 'warning'
  }
  if (status === 'IDLE') {
    return 'success'
  }
  if (status === 'ERROR' || status === 'DOWN') {
    return 'error'
  }
  return 'grey'
}

function getBatteryColor(battery) {
  const val = Number(battery) || 0
  if (val < 20) {
    return 'error'
  }
  if (val < 50) {
    return 'warning'
  }
  return 'success'
}

function getBatteryTextColor(battery) {
  const val = Number(battery) || 0
  if (val < 20) {
    return 'text-error'
  }
  if (val < 50) {
    return 'text-warning'
  }
  return 'text-success'
}

function getBatteryIcon(battery) {
  const val = Number(battery) || 0
  if (val <= 10) return '$batteryAlert'
  if (val <= 30) return '$batteryLow'
  if (val <= 70) return '$batteryMedium'
  return '$batteryHigh'
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

// 캐리어 목록 API 조회 함수
async function fetchCarriers() {
  try {
    const params = {
      page: pagination.page - 1,
      size: pagination.itemsPerPage,
      factoryName: searchParams.factoryName !== '전체' ? searchParams.factoryName : undefined,
      carrierName: searchParams.carrierName ? searchParams.carrierName.trim() : undefined,
      carrierType: searchParams.carrierType !== '전체' ? searchParams.carrierType : undefined,
      carrierStatus: searchParams.carrierStatus !== '전체' ? searchParams.carrierStatus : undefined,
      useState: searchParams.useState !== '전체' ? searchParams.useState : undefined,
    }

    const response = await executeFetchCarriers(params)

    if (response) {
      if (response.data && Array.isArray(response.data.content)) {
        rawCarrierItems.value = response.data.content
        totalItems.value = response.data.totalElements || response.data.content.length
      } else if (response.content && Array.isArray(response.content)) {
        rawCarrierItems.value = response.content
        totalItems.value = response.totalElements || (response.page && response.page.totalElements) || response.content.length
      } else if (response.data && Array.isArray(response.data)) {
        rawCarrierItems.value = response.data
        totalItems.value = response.total || response.data.length
      } else if (Array.isArray(response)) {
        rawCarrierItems.value = response
        totalItems.value = response.length
      } else {
        rawCarrierItems.value = []
        totalItems.value = 0
      }
    }
  } catch (error) {
    console.error('Fetch carriers error:', error)
    rawCarrierItems.value = []
    totalItems.value = 0
  }
}

function onUpdateOptions(options) {
  if (options) {
    pagination.page = options.page || 1
    pagination.itemsPerPage = options.itemsPerPage || 10
  }
  fetchCarriers()
}

function handleSearch() {
  pagination.page = 1
  fetchCarriers()
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.carrierName = ''
  searchParams.carrierType = '전체'
  searchParams.carrierStatus = '전체'
  searchParams.useState = '전체'
  pagination.page = 1
  fetchCarriers()
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddCarrier() {
  panelStore.openPanel(markRaw(CarrierViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 캐리어 등록',
    onSuccess: fetchCarriers,
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(CarrierViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '캐리어 정보 수정',
    onSuccess: fetchCarriers,
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 캐리어 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속 공장,캐리어 ID,타입,현재 위치 노드,목적지 노드,배터리,동작 상태,적재 트레이,사용 여부,수정자,수정일시\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.carrierName || '',
      item.carrierType || '',
      item.currentNode || '',
      item.destNode || '',
      (item.battery != null ? item.battery : 0) + '%',
      item.carrierStatus || '',
      item.loadedTrayId || '',
      item.useState || '',
      item.eventUser || '',
      item.eventTime || '',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'Carrier_List_' + new Date().toISOString().slice(0, 10) + '.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(function () {
  fetchCarriers()
})
</script>

<style scoped>
.view-page-container {
  max-width: 100%;
}
.search-filter-panel {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.carrier-action-buttons {
  gap: 8px;
}
</style>
