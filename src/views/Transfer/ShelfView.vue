<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$warehouse" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{
            $t('views.transfer.shelf.title')
          }}</span>
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
              placeholder="예: 01001101"
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
            <v-text-field
              v-model="searchParams.zoneName"
              :label="$t('table.zone')"
              placeholder="예: R1A, C1C"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
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
        <!-- 셸프 코드 하이라이트 -->
        <template #[`item.shelfName`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.shelfName }}</span>
        </template>

        <!-- 존(Zone) 컬럼 커스텀 렌더링 -->
        <template #[`item.zoneName`]="{ item }">
          <v-chip
            v-if="item.zoneName && item.zoneName !== '-'"
            size="x-small"
            variant="tonal"
            color="primary"
            class="font-weight-medium"
          >
            {{ item.zoneName }}
          </v-chip>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- 셸프 상태 칩 -->
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

        <!-- 가용 모드 칩 -->
        <template #[`item.shelfEnableMode`]="{ item }">
          <v-chip
            :color="item.shelfEnableMode === 'Enable' ? 'teal' : 'grey'"
            size="x-small"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ item.shelfEnableMode || '-' }}
          </v-chip>
        </template>

        <!-- 적재 캐리어/트레이 컬럼 -->
        <template #[`item.carrierName`]="{ item }">
          <span v-if="item.carrierName" class="font-weight-medium text-primary">
            {{ item.carrierName }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
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
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()
const { t } = useI18n()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  stockerName: '전체',
  shelfName: '',
  shelfStatus: '전체',
  zoneName: '',
})

const factoryFilterOptions = ['전체', 'insert', 'powder', 'common']
const stockerFilterOptions = [
  '전체',
  'WH1',
  'WH2',
  'WH3',
  'WH4',
  'WH5',
  'WH6',
  'WH7',
  'STK01',
  'STK02',
  'STK03',
]
const shelfStatusFilterOptions = [
  '전체',
  'Idle',
  'Empty',
  'Occupied',
  'Reserved',
  'Prohibited',
  'Disabled',
]

// 백엔드 WcsShelfResponse 필드 기준 테이블 헤더 정의
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '90px' },
  { title: t('table.stockerName'), key: 'stockerName', align: 'center', width: '90px' },
  { title: t('table.shelfCode'), key: 'shelfName', align: 'start', width: '120px', sortable: true },
  { title: t('table.zone'), key: 'zoneName', align: 'center', width: '100px' },
  { title: 'Row (열)', key: 'row', align: 'center', width: '80px' },
  { title: 'Col (칸)', key: 'col', align: 'center', width: '80px' },
  { title: 'Stage (단)', key: 'stage', align: 'center', width: '80px' },
  { title: 'Bin', key: 'bin', align: 'center', width: '70px' },
  { title: t('table.shelfStatus'), key: 'shelfStatus', align: 'center', width: '100px' },
  { title: '가용 모드', key: 'shelfEnableMode', align: 'center', width: '100px' },
  { title: '적재 트레이/캐리어', key: 'carrierName', align: 'start', width: '140px' },
  { title: '사용 횟수', key: 'numberOfUses', align: 'end', width: '90px' },
  { title: t('table.eventUser'), key: 'lastEventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'lastEventTime', align: 'center', width: '160px' },
  { title: t('table.eventComment'), key: 'lastEventComment', align: 'start', width: '160px' },
]

// 1. 목록 조회는 useDataTable 전담
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
  if (searchParams.zoneName && searchParams.zoneName.trim() !== '') {
    params.zoneName = searchParams.zoneName.trim()
  }
  return params
}

// 3개 복합키(factoryName + stockerName + shelfName) 결합 및 데이터 정규화
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'insert'
      const sn = raw.stockerName || 'WH1'
      const shn = raw.shelfName || ''

      result.push({
        ...raw,
        compositeKey: fn + '_' + sn + '_' + shn,
        factoryName: fn,
        stockerName: sn,
        shelfName: shn,
        zoneName: raw.zoneName || '-',
        row: raw.row != null ? raw.row : 1,
        col: raw.col != null ? raw.col : 1,
        stage: raw.stage != null ? raw.stage : 1,
        bin: raw.bin != null ? raw.bin : 1,
        shelfStatus: raw.shelfStatus || 'Empty',
        shelfEnableMode: raw.shelfEnableMode || 'Enable',
        shelfType: raw.shelfType || 'NormalShelf',
        carrierName: raw.carrierName || '',
        numberOfUses: raw.numberOfUses != null ? raw.numberOfUses : 0,
        lastEventUser: raw.lastEventUser || raw.eventUser || '-',
        lastEventTime: raw.lastEventTime || raw.eventTime || null,
        lastEventName: raw.lastEventName || '',
        lastEventComment: raw.lastEventComment || raw.eventComment || '',
      })
    }
  }

  return result
})

function getShelfStatusColor(status) {
  if (!status) return 'grey'
  const s = String(status).toUpperCase()
  if (s === 'EMPTY') return 'success'
  if (s === 'IDLE' || s === 'OCCUPIED') return 'primary'
  if (s === 'RESERVED') return 'warning'
  if (s === 'PROHIBITED' || s === 'DISABLED' || s === 'ERROR') return 'error'
  return 'grey'
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
  searchParams.stockerName = '전체'
  searchParams.shelfName = ''
  searchParams.shelfStatus = '전체'
  searchParams.zoneName = ''
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

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

function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
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
    '소속공장,스토커명,셸프코드,존명,Row,Col,Stage,Bin,셸프상태,가용모드,적재캐리어,사용횟수,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.stockerName || '',
      item.shelfName || '',
      item.zoneName || '',
      item.row != null ? item.row : '',
      item.col != null ? item.col : '',
      item.stage != null ? item.stage : '',
      item.bin != null ? item.bin : '',
      item.shelfStatus || '',
      item.shelfEnableMode || '',
      item.carrierName || '',
      item.numberOfUses != null ? item.numberOfUses : 0,
      item.lastEventUser || '',
      formatDateTime(item.lastEventTime),
      '"' + (item.lastEventComment ? item.lastEventComment.replace(/"/g, '""') : '') + '"',
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
.comment-text-cell {
  display: block;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
