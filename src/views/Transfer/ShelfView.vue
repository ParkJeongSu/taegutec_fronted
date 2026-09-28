<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$warehouse" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{ $t('views.transfer.shelf.title') }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.transfer.shelf.breadcrumb') }}
          </v-chip>
        </div>

        <div class="d-flex align-center shelf-action-buttons">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddShelf"
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

          <!-- 스토커 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.stockerName"
              :items="stockerFilterOptions"
              :label="$t('views.transfer.shelf.stockerFilter')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 셸프 코드 검색 필드 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.shelfName"
              :label="$t('table.shelfCode')"
              :placeholder="$t('views.transfer.shelf.placeholderShelfEx')"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 셸프 상태 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.shelfStatus"
              :items="shelfStatusFilterOptions"
              :label="$t('views.transfer.shelf.shelfStatus')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 존 명 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.zoneName"
              :items="zoneFilterOptions"
              :label="$t('table.zone')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 사용 여부 필터 -->
          <v-col cols="12" sm="6" md="1">
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
          <v-col cols="12" sm="6" md="1" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="mr-1 font-weight-medium"
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

      <!-- 중앙 데이터 테이블 (useDataTable 컴포저블 전담 연동) -->
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
        <!-- 셸프 상태 컬럼 커스텀 렌더링 -->
        <template #[`item.shelfStatus`]="{ item }">
          <v-chip
            :color="getShelfStatusColor(item.shelfStatus)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.shelfStatus }}
          </v-chip>
        </template>

        <!-- 존(Zone) 컬럼 커스텀 렌더링 -->
        <template #[`item.zoneName`]="{ item }">
          <v-chip
            v-if="item.zoneName && item.zoneName !== 'EMPTY'"
            size="x-small"
            variant="tonal"
            color="primary"
            class="font-weight-medium"
          >
            {{ item.zoneName }}
          </v-chip>
          <span v-else class="text-medium-emphasis">EMPTY</span>
        </template>

        <!-- 적재 캐리어/트레이 컬럼 -->
        <template #[`item.carrierId`]="{ item }">
          <span v-if="item.carrierId && item.carrierId !== '-'" class="font-weight-medium text-primary">
            {{ item.carrierId }}
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
            <div>{{ $t('views.transfer.shelf.noData') }}</div>
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
import ShelfViewForm from './components/ShelfViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsShelvesApi } from '@/api/wcsShelf'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const { t } = useI18n()

const searchParams = reactive({
  factoryName: '전체',
  stockerName: '전체',
  shelfName: '',
  shelfStatus: '전체',
  zoneName: '전체',
  useState: '전체',
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const stockerFilterOptions = ['전체', 'WH1', 'WH2', 'WH3', 'WH4', 'WH5', 'WH6', 'WH7']
const shelfStatusFilterOptions = ['전체', 'EMPTY', 'OCCUPIED', 'RESERVED', 'PROHIBITED', 'DISABLED']
const zoneFilterOptions = ['전체', 'EMPTY', 'ZONE_A', 'ZONE_B', 'ZONE_C', 'ZONE_D', 'RAW_MAT', 'FINISHED']
const useStateFilterOptions = ['전체', 'USE', 'UNUSE']

// 테이블 컬럼 정의
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '100px' },
  { title: t('table.stockerName'), key: 'stockerName', align: 'center', width: '90px' },
  { title: t('table.shelfCode'), key: 'shelfName', align: 'start', width: '120px' },
  { title: t('table.zone'), key: 'zoneName', align: 'center', width: '110px' },
  { title: 'Bank', key: 'bank', align: 'center', width: '80px' },
  { title: t('table.bay'), key: 'bay', align: 'center', width: '80px' },
  { title: t('table.level'), key: 'level', align: 'center', width: '80px' },
  { title: t('table.shelfStatus'), key: 'shelfStatus', align: 'center', width: '110px' },
  { title: t('table.loadedTrayId'), key: 'carrierId', align: 'center', width: '140px' },
  { title: t('table.useState'), key: 'useState', align: 'center', width: '90px' },
  { title: t('table.eventUser'), key: 'eventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'eventTime', align: 'center', width: '160px' },
]

// 1. 역할 분리 아키텍처: 목록 조회 영역은 useDataTable 컴포저블 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsShelvesApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.stockerName && searchParams.stockerName !== '전체') {
    params.stockerName = searchParams.stockerName
  }
  if (searchParams.shelfName && searchParams.shelfName.trim() !== '') {
    params.shelfName = searchParams.shelfName.trim()
  }
  if (searchParams.shelfStatus && searchParams.shelfStatus !== '전체') {
    params.shelfStatus = searchParams.shelfStatus
  }
  if (searchParams.zoneName && searchParams.zoneName !== '전체') {
    params.zoneName = searchParams.zoneName
  }
  if (searchParams.useState && searchParams.useState !== '전체') {
    params.useState = searchParams.useState
  }
  return params
}

// 3개 복합키 결합 및 데이터 정규화
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'INSERT'
      const sn = raw.stockerName || 'WH1'
      const shn = raw.shelfName || raw.shelfCode || ''

      result.push({
        ...raw,
        compositeKey: fn + '_' + sn + '_' + shn,
        factoryName: fn,
        stockerName: sn,
        shelfName: shn,
        zoneName: raw.zoneName || 'EMPTY',
        bank: raw.bank != null ? raw.bank : 1,
        bay: raw.bay != null ? raw.bay : (raw.row != null ? raw.row : 1),
        level: raw.level != null ? raw.level : (raw.stage != null ? raw.stage : 1),
        shelfStatus: raw.shelfStatus || raw.status || 'EMPTY',
        carrierId: raw.carrierId || raw.trayId || '-',
        useState: raw.useState || (raw.useYn === 'N' ? 'UNUSE' : 'USE'),
        eventUser: raw.eventUser || '-',
        eventTime: raw.eventTime || raw.updateTime || '-',
      })
    }
  }

  return result
})

function getShelfStatusColor(status) {
  if (status === 'EMPTY') {
    return 'success'
  }
  if (status === 'OCCUPIED') {
    return 'primary'
  }
  if (status === 'RESERVED') {
    return 'warning'
  }
  if (status === 'PROHIBITED' || status === 'DISABLED') {
    return 'error'
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

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.stockerName = '전체'
  searchParams.shelfName = ''
  searchParams.shelfStatus = '전체'
  searchParams.zoneName = '전체'
  searchParams.useState = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddShelf() {
  panelStore.openPanel(markRaw(ShelfViewForm), {
    mode: 'CREATE',
    data: null,
    title: t('views.transfer.shelf.createTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(ShelfViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: t('views.transfer.shelf.editTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert(t('views.transfer.shelf.exportAlert'))
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    `${t('table.factoryName')},${t('table.stockerName')},${t('table.shelfCode')},${t('table.zone')},${t('table.bank')},${t('table.bay')},${t('table.level')},${t('table.shelfStatus')},${t('table.loadedTrayId')},${t('table.useState')},${t('table.eventUser')},${t('table.eventTime')}\n`

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.stockerName || '',
      item.shelfName || '',
      item.zoneName || '',
      item.bank != null ? item.bank : '',
      item.bay != null ? item.bay : '',
      item.level != null ? item.level : '',
      item.shelfStatus || '',
      item.carrierId || '',
      item.useState || '',
      item.eventUser || '',
      item.eventTime || '',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'Shelf_List_' + new Date().toISOString().slice(0, 10) + '.csv')
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
.shelf-action-buttons {
  gap: 8px;
}
</style>
