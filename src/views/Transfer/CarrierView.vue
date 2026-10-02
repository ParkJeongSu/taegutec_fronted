<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{
            $t('views.transfer.carrier.title')
          }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.transfer.carrier.breadcrumb') }}
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

          <!-- 캐리어 명 검색 필드 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.carrierName"
              :label="$t('table.carrierName')"
              :placeholder="$t('views.transfer.carrier.placeholderCarrierCode')"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 캐리어 그룹 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.carrierGroup"
              :items="carrierGroupFilterOptions"
              label="캐리어 그룹"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 캐리어 상태 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.carrierStatus"
              :items="statusFilterOptions"
              :label="$t('table.carrierStatus')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 소속 설비 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.currentEquipmentName"
              label="현재 설비"
              placeholder="예: WH1, STK01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
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
        <!-- 캐리어 명칭 하이라이트 -->
        <template #[`item.carrierName`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.carrierName }}</span>
        </template>

        <!-- 캐리어 그룹 칩 -->
        <template #[`item.carrierGroup`]="{ item }">
          <v-chip size="x-small" variant="outlined" color="primary" class="font-weight-medium">
            {{ item.carrierGroup || '-' }}
          </v-chip>
        </template>

        <!-- 캐리어 타입 칩 -->
        <template #[`item.carrierType`]="{ item }">
          <span class="font-weight-medium">{{ item.carrierType || '-' }}</span>
        </template>

        <!-- 동작 상태 컬럼 커스텀 렌더링 -->
        <template #[`item.carrierStatus`]="{ item }">
          <v-chip
            :color="getStatusColor(item.carrierStatus)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.carrierStatus || '-' }}
          </v-chip>
        </template>

        <!-- 현재 위치 -->
        <template #[`item.currentPositionName`]="{ item }">
          <span class="font-weight-medium">{{ item.currentPositionName || '-' }}</span>
        </template>

        <!-- 소속 존 -->
        <template #[`item.zoneName`]="{ item }">
          <span class="text-blue-grey-darken-1">{{ item.zoneName || '-' }}</span>
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
            <div>{{ $t('views.transfer.carrier.noData') }}</div>
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
import CarrierViewForm from './components/CarrierViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsCarriersApi } from '@/api/wcsCarrier'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()
const { t } = useI18n()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  carrierName: '',
  carrierGroup: '전체',
  carrierStatus: '전체',
  currentEquipmentName: '',
})

const factoryFilterOptions = ['전체', 'insert', 'powder', 'common']
const carrierGroupFilterOptions = ['전체', 'Tray', 'Container']
const statusFilterOptions = ['전체', 'Stored', 'Transferring', 'Abnormal', 'NONE']

// 백엔드 WcsCarrierResponse 필드 기준 테이블 헤더 정의
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '90px' },
  {
    title: t('table.carrierName'),
    key: 'carrierName',
    align: 'start',
    width: '150px',
    sortable: true,
  },
  { title: '그룹', key: 'carrierGroup', align: 'center', width: '100px' },
  { title: t('table.carrierType'), key: 'carrierType', align: 'center', width: '100px' },
  { title: t('table.carrierStatus'), key: 'carrierStatus', align: 'center', width: '110px' },
  { title: '현재 설비', key: 'currentEquipmentName', align: 'center', width: '100px' },
  { title: '현재 위치', key: 'currentPositionName', align: 'center', width: '110px' },
  { title: '소속 존', key: 'zoneName', align: 'center', width: '90px' },
  { title: 'Lot 명', key: 'lotName', align: 'start', width: '110px' },
  { title: 'Order ID', key: 'orderId', align: 'start', width: '110px' },
  { title: '사용 횟수', key: 'carrierUseCount', align: 'end', width: '90px' },
  { title: t('table.eventUser'), key: 'lastEventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'lastEventTime', align: 'center', width: '160px' },
  { title: t('table.eventComment'), key: 'lastEventComment', align: 'start', width: '160px' },
]

// 1. 목록 조회는 useDataTable 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsCarriersApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.carrierName && searchParams.carrierName.trim() !== '') {
    params.carrierName = searchParams.carrierName.trim()
  }
  if (searchParams.carrierGroup && searchParams.carrierGroup !== '전체') {
    params.carrierGroup = searchParams.carrierGroup
  }
  if (searchParams.carrierStatus && searchParams.carrierStatus !== '전체') {
    params.carrierStatus = searchParams.carrierStatus
  }
  if (searchParams.currentEquipmentName && searchParams.currentEquipmentName.trim() !== '') {
    params.currentEquipmentName = searchParams.currentEquipmentName.trim()
  }
  return params
}

// 2개 복합키(factoryName + carrierName) 결합 및 데이터 정규화
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'insert'
      const cn = raw.carrierName || ''

      result.push({
        ...raw,
        compositeKey: fn + '_' + cn,
        factoryName: fn,
        carrierName: cn,
        carrierGroup: raw.carrierGroup || '-',
        carrierType: raw.carrierType || '-',
        carrierDetailType: raw.carrierDetailType || '-',
        carrierStatus: raw.carrierStatus || '-',
        currentEquipmentName: raw.currentEquipmentName || '-',
        currentPositionName: raw.currentPositionName || '-',
        zoneName: raw.zoneName || '-',
        lotName: raw.lotName || '-',
        orderId: raw.orderId || '-',
        carrierUseCount: raw.carrierUseCount != null ? raw.carrierUseCount : 0,
        lastEventUser: raw.lastEventUser || raw.eventUser || '-',
        lastEventTime: raw.lastEventTime || raw.eventTime || null,
        lastEventName: raw.lastEventName || '',
        lastEventComment: raw.lastEventComment || raw.eventComment || '',
      })
    }
  }

  return result
})

function getStatusColor(status) {
  if (!status) return 'grey'
  const s = String(status).toUpperCase()
  if (s === 'STORED') return 'success'
  if (s === 'TRANSFERRING') return 'info'
  if (s === 'ABNORMAL' || s === 'ERROR' || s === 'FAULT') return 'error'
  if (s === 'NONE' || s === 'EMPTY') return 'grey'
  return 'primary'
}

function getCommentTooltip(item) {
  const parts = []
  if (item.lastEventName) parts.push('[' + item.lastEventName + ']')
  if (item.lastEventComment) parts.push(item.lastEventComment)
  return parts.length > 0 ? parts.join(' ') : '-'
}

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.carrierName = ''
  searchParams.carrierGroup = '전체'
  searchParams.carrierStatus = '전체'
  searchParams.currentEquipmentName = ''
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onAddCarrier() {
  panelStore.openPanel(markRaw(CarrierViewForm), {
    mode: 'CREATE',
    data: null,
    title: t('views.transfer.carrier.createTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
  panelStore.openPanel(markRaw(CarrierViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: t('views.transfer.carrier.editTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert(t('views.transfer.carrier.exportAlert'))
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,캐리어명,그룹,타입,상태,현재설비,현재위치,소속존,Lot명,OrderId,사용횟수,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.carrierName || '',
      item.carrierGroup || '',
      item.carrierType || '',
      item.carrierStatus || '',
      item.currentEquipmentName || '',
      item.currentPositionName || '',
      item.zoneName || '',
      item.lotName || '',
      item.orderId || '',
      item.carrierUseCount != null ? item.carrierUseCount : 0,
      item.lastEventUser || '',
      formatDateTime(item.lastEventTime),
      '"' + (item.lastEventComment ? item.lastEventComment.replace(/"/g, '""') : '') + '"',
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
.carrier-action-buttons {
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
