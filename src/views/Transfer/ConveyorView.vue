<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{
            $t('views.transfer.conveyor.title')
          }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.transfer.conveyor.breadcrumb') }}
          </v-chip>
        </div>

        <div class="d-flex align-center conveyor-action-buttons">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddConveyor"
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

          <!-- 컨베이어 그룹 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.conveyorGroup"
              :label="$t('views.transfer.conveyor.conveyorGroup')"
              placeholder="예: 311, 312"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 컨베이어 명칭 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.conveyorName"
              :label="$t('table.conveyorName')"
              placeholder="예: 31103, 31112"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 설비 운전 상태 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.status"
              :items="statusFilterOptions"
              :label="$t('table.status')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 방향성 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.direction"
              :items="directionFilterOptions"
              label="반송 방향"
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
        <!-- 컨베이어 명칭 하이라이트 -->
        <template #[`item.conveyorName`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.conveyorName }}</span>
        </template>

        <!-- 운전 상태 컬럼 커스텀 렌더링 -->
        <template #[`item.status`]="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.status || '-' }}
          </v-chip>
        </template>

        <!-- 반송 방향 칩 -->
        <template #[`item.direction`]="{ item }">
          <v-chip
            :color="getDirectionColor(item.direction)"
            size="x-small"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ item.direction || '-' }}
          </v-chip>
        </template>

        <!-- 캐리어 유무 칩 -->
        <template #[`item.carrierExist`]="{ item }">
          <v-chip
            :color="item.carrierExist === 'Empty' ? 'grey' : 'indigo'"
            size="x-small"
            variant="flat"
            class="font-weight-medium"
          >
            {{ item.carrierExist || '-' }}
          </v-chip>
        </template>

        <!-- 현재 적재 캐리어 ID -->
        <template #[`item.carrierName`]="{ item }">
          <span v-if="item.carrierName" class="font-weight-bold text-primary">
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
            <div>{{ $t('views.transfer.conveyor.noData') }}</div>
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
import ConveyorViewForm from './components/ConveyorViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsConveyorsApi } from '@/api/wcsConveyor'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()
const { t } = useI18n()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  conveyorGroup: '',
  conveyorName: '',
  status: '전체',
  direction: '전체',
})

const factoryFilterOptions = ['전체', 'insert', 'powder', 'common']
const statusFilterOptions = ['전체', 'Idle', 'Run', 'Stop', 'Alarm', 'Error']
const directionFilterOptions = ['전체', 'Inbound', 'Outbound', 'Both']

// 백엔드 WcsConveyorResponse 필드 기준 테이블 헤더 정의
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '90px' },
  { title: t('table.group'), key: 'conveyorGroup', align: 'center', width: '90px' },
  {
    title: t('table.conveyorName'),
    key: 'conveyorName',
    align: 'start',
    width: '130px',
    sortable: true,
  },
  { title: '라인 No', key: 'conveyorNumber', align: 'center', width: '80px' },
  { title: '로컬 No', key: 'localNo', align: 'center', width: '80px' },
  { title: '컨베이어 타입', key: 'conveyorType', align: 'center', width: '130px' },
  { title: t('table.status'), key: 'status', align: 'center', width: '100px' },
  { title: '반송 방향', key: 'direction', align: 'center', width: '100px' },
  { title: '적재 여부', key: 'carrierExist', align: 'center', width: '100px' },
  { title: t('table.carrierId'), key: 'carrierName', align: 'center', width: '120px' },
  { title: '구역명', key: 'areaName', align: 'start', width: '100px' },
  { title: '서버명', key: 'serverName', align: 'start', width: '110px' },
  { title: t('table.eventUser'), key: 'lastEventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'lastEventTime', align: 'center', width: '160px' },
  { title: t('table.eventComment'), key: 'lastEventComment', align: 'start', width: '160px' },
]

// 1. 목록 조회는 useDataTable 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsConveyorsApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.conveyorGroup && searchParams.conveyorGroup.trim() !== '') {
    params.conveyorGroup = searchParams.conveyorGroup.trim()
  }
  if (searchParams.conveyorName && searchParams.conveyorName.trim() !== '') {
    params.conveyorName = searchParams.conveyorName.trim()
  }
  if (searchParams.status && searchParams.status !== '전체') {
    params.status = searchParams.status
  }
  if (searchParams.direction && searchParams.direction !== '전체') {
    params.direction = searchParams.direction
  }
  return params
}

// 5개 복합키(factoryName + conveyorGroup + conveyorName + conveyorNumber + localNo) 결합 및 정규화
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'insert'
      const cg = raw.conveyorGroup || ''
      const cn = raw.conveyorName || ''
      const cnum = raw.conveyorNumber != null ? raw.conveyorNumber : 1
      const lno = raw.localNo != null ? raw.localNo : 1

      result.push({
        ...raw,
        compositeKey: fn + '_' + cg + '_' + cn + '_' + cnum + '_' + lno,
        factoryName: fn,
        conveyorGroup: cg,
        conveyorName: cn,
        conveyorNumber: cnum,
        localNo: lno,
        conveyorType: raw.conveyorType || '-',
        status: raw.status || 'Idle',
        direction: raw.direction || '-',
        carrierExist: raw.carrierExist || '-',
        carrierName: raw.carrierName || '',
        areaName: raw.areaName || '-',
        serverName: raw.serverName || '-',
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
  if (s === 'RUN' || s === 'RUNNING' || s === 'ACTIVE') return 'success'
  if (s === 'IDLE' || s === 'AUTO') return 'primary'
  if (s === 'STOP' || s === 'PAUSE') return 'grey'
  if (s === 'ALARM' || s === 'ERROR' || s === 'FAULT' || s === 'DOWN') return 'error'
  return 'default'
}

function getDirectionColor(dir) {
  if (!dir) return 'grey'
  const d = String(dir).toUpperCase()
  if (d === 'INBOUND') return 'teal'
  if (d === 'OUTBOUND') return 'deep-orange'
  if (d === 'BOTH') return 'indigo'
  return 'blue-grey'
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
  searchParams.conveyorGroup = ''
  searchParams.conveyorName = ''
  searchParams.status = '전체'
  searchParams.direction = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onAddConveyor() {
  panelStore.openPanel(markRaw(ConveyorViewForm), {
    mode: 'CREATE',
    data: null,
    title: t('views.transfer.conveyor.createTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
  panelStore.openPanel(markRaw(ConveyorViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: t('views.transfer.conveyor.editTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert(t('views.transfer.conveyor.exportAlert'))
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,컨베이어그룹,컨베이어명칭,라인번호,로컬번호,컨베이어타입,운전상태,반송방향,적재상태,캐리어명,구역명,서버명,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.conveyorGroup || '',
      item.conveyorName || '',
      item.conveyorNumber != null ? item.conveyorNumber : '',
      item.localNo != null ? item.localNo : '',
      item.conveyorType || '',
      item.status || '',
      item.direction || '',
      item.carrierExist || '',
      item.carrierName || '',
      item.areaName || '',
      item.serverName || '',
      item.lastEventUser || '',
      formatDateTime(item.lastEventTime),
      '"' + (item.lastEventComment ? item.lastEventComment.replace(/"/g, '""') : '') + '"',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'Conveyor_List_' + new Date().toISOString().slice(0, 10) + '.csv')
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
.conveyor-action-buttons {
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
