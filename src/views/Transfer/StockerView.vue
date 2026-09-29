<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{ $t('views.transfer.stocker.title') }}</span>
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
              :placeholder="$t('views.transfer.stocker.placeholderStockerEx')"
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
              :label="$t('views.transfer.stocker.stockerStatus')"
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
              :label="$t('table.useYn')"
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

const panelStore = usePanelStore()

// 검색 파라미터 상태
const { t } = useI18n()

const searchParams = reactive({
  factoryName: '전체',
  stockerName: '',
  stockerStatus: '전체',
  useState: '전체',
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const statusFilterOptions = ['전체', 'IDLE', 'RUNNING', 'ERROR', 'DOWN', 'OFFLINE']
const useStateFilterOptions = ['전체', 'USE', 'UNUSE']

// 테이블 컬럼 정의
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '110px' },
  { title: t('table.stockerCode'), key: 'stockerName', align: 'start', width: '130px' },
  { title: t('table.areaName'), key: 'areaName', align: 'start' },
  { title: t('table.totalShelfCount'), key: 'totalShelfCount', align: 'end', width: '100px' },
  { title: t('table.useShelfCount'), key: 'useShelfCount', align: 'end', width: '100px' },
  { title: t('table.emptyShelfCount'), key: 'emptyShelfCount', align: 'end', width: '100px' },
  { title: t('table.occupancyRate'), key: 'occupancyRate', align: 'center', width: '110px' },
  { title: t('table.equipmentStatus'), key: 'stockerStatus', align: 'center', width: '110px' },
  { title: t('table.useState'), key: 'useState', align: 'center', width: '100px' },
  { title: t('table.eventUser'), key: 'eventUser', align: 'center', width: '110px' },
  { title: t('table.eventTime'), key: 'eventTime', align: 'center', width: '160px' },
]

// 1. 역할 분리 아키텍처: 목록 조회 영역은 useDataTable 컴포저블 전담
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
  if (searchParams.useState && searchParams.useState !== '전체') {
    params.useState = searchParams.useState
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
    return t('common.use')
  }
  if (state === 'UNUSE' || state === 'INACTIVE' || state === 'N' || state === '미사용') {
    return t('common.unuse')
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

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.stockerName = ''
  searchParams.stockerStatus = '전체'
  searchParams.useState = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
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

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
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
  csvContent = csvContent + `${t('table.factoryName')},${t('table.stockerCode')},${t('table.areaName')},${t('table.totalShelfCount')},${t('table.useShelfCount')},${t('table.emptyShelfCount')},${t('table.occupancyRate')},${t('table.equipmentStatus')},${t('table.useState')},${t('table.eventUser')},${t('table.eventTime')}\n`

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
</style>
