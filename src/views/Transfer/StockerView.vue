<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{
            $t('views.transfer.stocker.title')
          }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.transfer.stocker.breadcrumb') }}
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
            {{ $t('common.create') }}
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium mr-2"
            :loading="loading"
            v-on:click="handleSearch"
          >
            {{ $t('common.refresh') }}
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$fileExport"
            class="font-weight-medium"
            v-on:click="handleExport"
          >
            {{ $t('common.export') }}
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
              :label="$t('table.factoryName')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 스토커 코드/명 검색 필드 -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="searchParams.stockerName"
              :label="$t('table.stockerCode')"
              placeholder="예: WH1, STK01"
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

          <!-- 통신 연결 상태 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.stockerConnectionStatus"
              :items="connectionStatusFilterOptions"
              label="통신 상태"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 온라인 제어 상태 필터 -->
          <v-col cols="12" sm="6" md="1">
            <v-select
              v-model="searchParams.onlineControlStatus"
              :items="onlineStatusFilterOptions"
              label="온라인"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 검색 및 초기화 버튼 -->
          <v-col cols="12" sm="12" md="2" class="d-flex align-center justify-end">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="mr-2 font-weight-medium"
              v-on:click="handleSearch"
            >
              {{ $t('common.search') }}
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              class="font-weight-medium"
              v-on:click="handleReset"
            >
              {{ $t('common.reset') }}
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- 중앙 데이터 테이블 -->
      <BaseDataTable
        :headers="headers"
        :items="displayItems"
        :total-items="Number(totalItems)"
        :loading="loading"
        item-value="compositeKey"
        density="compact"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      >
        <!-- 스토커 명칭 하이라이트 -->
        <template #[`item.stockerName`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.stockerName }}</span>
        </template>

        <!-- 통신 연결 상태 칩 -->
        <template #[`item.stockerConnectionStatus`]="{ item }">
          <v-chip
            :color="getConnectionStatusColor(item.stockerConnectionStatus)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.stockerConnectionStatus || '-' }}
          </v-chip>
        </template>

        <!-- 온라인 제어 상태 칩 -->
        <template #[`item.onlineControlStatus`]="{ item }">
          <v-chip
            :color="getOnlineStatusColor(item.onlineControlStatus)"
            size="x-small"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ item.onlineControlStatus || '-' }}
          </v-chip>
        </template>

        <!-- 설비 동작 상태 칩 -->
        <template #[`item.stockerStatus`]="{ item }">
          <v-chip
            :color="getStatusColor(item.stockerStatus)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.stockerStatus || '-' }}
          </v-chip>
        </template>

        <!-- 적재율 컬럼 커스텀 렌더링 -->
        <template #[`item.occupancyRate`]="{ item }">
          <div class="d-flex align-center justify-center">
            <span class="font-weight-bold" :class="getOccupancyTextColor(item.occupancyRate)">
              {{ item.occupancyRate }}%
            </span>
          </div>
        </template>

        <!-- 이상 셀 수 하이라이트 -->
        <template #[`item.abnormalShelfCount`]="{ item }">
          <span :class="item.abnormalShelfCount > 0 ? 'text-error font-weight-bold' : ''">
            {{ formatNumber(item.abnormalShelfCount) }}
          </span>
        </template>

        <!-- 수정 일시 포맷팅 -->
        <template #[`item.lastEventTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.lastEventTime) }}</span>
        </template>

        <!-- 비고 말줄임 -->
        <template #[`item.lastEventComment`]="{ item }">
          <span :title="getCommentTooltip(item)" class="comment-text-cell">
            {{ item.lastEventComment || item.lastEventName || '-' }}
          </span>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>{{ $t('views.transfer.stocker.noData') }}</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { reactive, computed, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import StockerViewForm from './components/StockerViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsStockersApi } from '@/api/wcsStocker'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()
const { t } = useI18n()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  stockerName: '',
  stockerStatus: '전체',
  stockerConnectionStatus: '전체',
  onlineControlStatus: '전체',
})

const factoryFilterOptions = ['전체', 'insert', 'powder', 'common']
const statusFilterOptions = ['전체', 'Active', 'Idle', 'OutOfService', 'RUNNING', 'ERROR', 'DOWN']
const connectionStatusFilterOptions = ['전체', 'Connected', 'Disconnected']
const onlineStatusFilterOptions = ['전체', 'Online', 'Offline']

// 백엔드 WcsStockerResponse 규격에 일치시킨 헤더
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '90px' },
  {
    title: t('table.stockerCode'),
    key: 'stockerName',
    align: 'start',
    width: '120px',
    sortable: true,
  },
  { title: '통신 상태', key: 'stockerConnectionStatus', align: 'center', width: '110px' },
  { title: '온라인 제어', key: 'onlineControlStatus', align: 'center', width: '110px' },
  { title: t('table.equipmentStatus'), key: 'stockerStatus', align: 'center', width: '110px' },
  { title: t('table.areaName'), key: 'areaName', align: 'start', width: '110px' },
  { title: '설비 타입', key: 'stockerType', align: 'center', width: '100px' },
  { title: '머신 타입', key: 'machineTypeName', align: 'start', width: '130px' },
  { title: t('table.totalShelfCount'), key: 'totalShelfCount', align: 'end', width: '90px' },
  { title: t('table.useShelfCount'), key: 'useShelfCount', align: 'end', width: '90px' },
  { title: t('table.emptyShelfCount'), key: 'emptyShelfCount', align: 'end', width: '90px' },
  { title: '이상 셀', key: 'abnormalShelfCount', align: 'end', width: '90px' },
  { title: t('table.occupancyRate'), key: 'occupancyRate', align: 'center', width: '90px' },
  { title: t('table.eventUser'), key: 'lastEventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'lastEventTime', align: 'center', width: '160px' },
  { title: t('table.eventComment'), key: 'lastEventComment', align: 'start', width: '160px' },
]

// 1. 목록 조회는 useDataTable 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsStockersApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.stockerName && searchParams.stockerName.trim() !== '') {
    params.stockerName = searchParams.stockerName.trim()
  }
  if (searchParams.stockerStatus && searchParams.stockerStatus !== '전체') {
    params.stockerStatus = searchParams.stockerStatus
  }
  if (searchParams.stockerConnectionStatus && searchParams.stockerConnectionStatus !== '전체') {
    params.stockerConnectionStatus = searchParams.stockerConnectionStatus
  }
  if (searchParams.onlineControlStatus && searchParams.onlineControlStatus !== '전체') {
    params.onlineControlStatus = searchParams.onlineControlStatus
  }
  return params
}

// 적재율 계산 및 복합키 매핑
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'insert'
      const sn = raw.stockerName || ''
      const total = Number(raw.totalShelfCount) || 0
      const used = Number(raw.useShelfCount) || 0
      const empty = Number(raw.emptyShelfCount) || (total >= used ? total - used : 0)
      const abnormal = Number(raw.abnormalShelfCount) || 0

      let rate = 0
      if (total > 0) {
        rate = Math.round((used / total) * 100)
      }

      result.push({
        ...raw,
        compositeKey: fn + '_' + sn,
        factoryName: fn,
        stockerName: sn,
        areaName: raw.areaName || '-',
        stockerType: raw.stockerType || '-',
        machineTypeName: raw.machineTypeName || '-',
        stockerConnectionStatus: raw.stockerConnectionStatus || '-',
        onlineControlStatus: raw.onlineControlStatus || '-',
        stockerStatus: raw.stockerStatus || 'Idle',
        totalShelfCount: total,
        useShelfCount: used,
        emptyShelfCount: empty,
        abnormalShelfCount: abnormal,
        occupancyRate: rate,
        lastEventUser: raw.lastEventUser || raw.eventUser || '-',
        lastEventTime: raw.lastEventTime || raw.eventTime || null,
        lastEventName: raw.lastEventName || '',
        lastEventComment: raw.lastEventComment || raw.eventComment || '',
      })
    }
  }

  return result
})

function getConnectionStatusColor(status) {
  if (status === 'Connected') return 'success'
  if (status === 'Disconnected') return 'error'
  return 'grey'
}

function getOnlineStatusColor(status) {
  if (status === 'Online') return 'primary'
  if (status === 'Offline') return 'grey'
  return 'default'
}

function getStatusColor(status) {
  const s = String(status).toUpperCase()
  if (s === 'ACTIVE' || s === 'RUNNING') return 'success'
  if (s === 'IDLE' || s === 'AUTO') return 'primary'
  if (s === 'OUTOFSERVICE' || s === 'DOWN' || s === 'ERROR') return 'error'
  if (s === 'OFFLINE' || s === 'MANUAL') return 'warning'
  return 'grey'
}

function getOccupancyTextColor(rate) {
  if (rate >= 90) return 'text-error'
  if (rate >= 70) return 'text-warning'
  return 'text-primary'
}

function getCommentTooltip(item) {
  const parts = []
  if (item.lastEventName) parts.push('[' + item.lastEventName + ']')
  if (item.lastEventComment) parts.push(item.lastEventComment)
  return parts.length > 0 ? parts.join(' ') : '-'
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  return isNaN(num) ? String(value) : num.toLocaleString()
}

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.stockerName = ''
  searchParams.stockerStatus = '전체'
  searchParams.stockerConnectionStatus = '전체'
  searchParams.onlineControlStatus = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onAddStocker() {
  panelStore.openPanel(markRaw(StockerViewForm), {
    mode: 'CREATE',
    data: null,
    title: t('views.transfer.stocker.createTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
  panelStore.openPanel(markRaw(StockerViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: t('views.transfer.stocker.editTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert(t('views.transfer.stocker.exportAlert'))
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,스토커코드,통신상태,온라인제어,설비상태,구역명,설비타입,머신타입,총셀수,적재셀수,공선반수,이상셀수,적재율(%),수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.stockerName || '',
      item.stockerConnectionStatus || '',
      item.onlineControlStatus || '',
      item.stockerStatus || '',
      item.areaName || '',
      item.stockerType || '',
      item.machineTypeName || '',
      item.totalShelfCount || 0,
      item.useShelfCount || 0,
      item.emptyShelfCount || 0,
      item.abnormalShelfCount || 0,
      (item.occupancyRate || 0) + '%',
      item.lastEventUser || '',
      formatDateTime(item.lastEventTime),
      '"' + (item.lastEventComment ? item.lastEventComment.replace(/"/g, '""') : '') + '"',
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
  loadData(getSanitizedParams())
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
.comment-text-cell {
  display: block;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
