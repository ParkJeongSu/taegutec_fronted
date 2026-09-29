<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{ $t('views.transfer.carrier.title') }}</span>
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

          <!-- 캐리어 타입 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.carrierType"
              :items="carrierTypeFilterOptions"
              :label="$t('table.carrierType')"
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
              :label="$t('table.carrierStatus')"
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
              :label="$t('table.useYn')"
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

const panelStore = usePanelStore()

// 검색 파라미터 상태
const { t } = useI18n()

const searchParams = reactive({
  factoryName: '전체',
  carrierName: '',
  carrierType: '전체',
  carrierStatus: '전체',
  useState: '전체',
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

// 테이블 컬럼 정의
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '100px' },
  { title: t('table.carrierName'), key: 'carrierName', align: 'start', width: '120px' },
  { title: t('table.carrierType'), key: 'carrierType', align: 'center', width: '90px' },
  { title: t('table.currentNode'), key: 'currentNode', align: 'start', width: '130px' },
  { title: t('table.destNode'), key: 'destNode', align: 'start', width: '130px' },
  { title: t('table.battery'), key: 'battery', align: 'center', width: '110px' },
  { title: t('table.carrierStatus'), key: 'carrierStatus', align: 'center', width: '110px' },
  { title: t('table.loadedTrayId'), key: 'loadedTrayId', align: 'center', width: '130px' },
  { title: t('table.useState'), key: 'useState', align: 'center', width: '90px' },
  { title: t('table.eventUser'), key: 'eventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'eventTime', align: 'center', width: '160px' },
]

// 1. 역할 분리 아키텍처: 목록 조회 영역은 useDataTable 컴포저블 전담
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
  if (searchParams.carrierType && searchParams.carrierType !== '전체') {
    params.carrierType = searchParams.carrierType
  }
  if (searchParams.carrierStatus && searchParams.carrierStatus !== '전체') {
    params.carrierStatus = searchParams.carrierStatus
  }
  if (searchParams.useState && searchParams.useState !== '전체') {
    params.useState = searchParams.useState
  }
  return params
}

// 복합키 결합 및 데이터 정규화
const displayItems = computed(function () {
  const list = items.value || []
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
    return t('common.use')
  }
  if (state === 'UNUSE' || state === 'INACTIVE' || state === 'N' || state === '미사용') {
    return t('common.unuse')
  }
  return state || '-'
}

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.carrierName = ''
  searchParams.carrierType = '전체'
  searchParams.carrierStatus = '전체'
  searchParams.useState = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
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

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
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
    `${t('table.factoryName')},${t('table.carrierName')},${t('table.carrierType')},${t('table.currentNode')},${t('table.destNode')},${t('table.battery')},${t('table.carrierStatus')},${t('table.loadedTrayId')},${t('table.useState')},${t('table.eventUser')},${t('table.eventTime')}\n`

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
</style>
