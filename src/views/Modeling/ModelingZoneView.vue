<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$archive" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">WCS 보관 존(Zone) 관리</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            모델링 &gt; 보관 존 설정
          </v-chip>
        </div>

        <div class="d-flex align-center action-button-group">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddZone"
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
          <!-- 소속 공장 -->
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

          <!-- 존 명칭 -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="searchParams.zoneName"
              label="존 명칭 (Zone Name)"
              placeholder="예: C1C, EXZONE01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 존 타입 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.zoneType"
              :items="zoneTypeFilterOptions"
              label="존 타입"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 적재 방식 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.loadType"
              :items="loadTypeFilterOptions"
              label="적재 방식"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 검색 및 초기화 버튼 -->
          <v-col cols="12" sm="12" md="3" class="d-flex align-center justify-end">
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

      <!-- 중앙 데이터 테이블 (useDataTable 컴포저블 전담 연동) -->
      <BaseDataTable
        :headers="headers"
        :items="displayItems"
        :total-items="Number(totalItems)"
        :loading="loading"
        item-value="compositeKey"
        density="compact"
        v-on:update:options="onUpdateOptions"
        v-on:click:row="onRowClick"
      >
        <!-- 존 명칭 및 색상 인디케이터 -->
        <template #[`item.zoneName`]="{ item }">
          <div class="d-flex align-center">
            <span
              v-if="item.zoneColor"
              class="color-dot mr-2"
              :style="{ backgroundColor: item.zoneColor }"
            ></span>
            <span class="font-weight-bold text-primary">{{ item.zoneName }}</span>
          </div>
        </template>

        <!-- 존 타입 칩 -->
        <template #[`item.zoneType`]="{ item }">
          <v-chip
            :color="getZoneTypeColor(item.zoneType)"
            size="x-small"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ item.zoneType || '-' }}
          </v-chip>
        </template>

        <!-- 적재 방식 -->
        <template #[`item.loadType`]="{ item }">
          <v-chip size="x-small" variant="outlined" color="blue-grey" class="font-weight-medium">
            {{ item.loadType || '-' }}
          </v-chip>
        </template>

        <!-- 선반 선택 모드 -->
        <template #[`item.shelfSelectMode`]="{ item }">
          <v-chip
            size="x-small"
            variant="flat"
            color="blue-grey-lighten-4"
            class="font-weight-medium"
          >
            {{ item.shelfSelectMode || '-' }}
          </v-chip>
        </template>

        <!-- 존 용량 포맷팅 -->
        <template #[`item.zoneCapacity`]="{ item }">
          <span class="font-weight-medium">{{ formatNumber(item.zoneCapacity) }}</span>
        </template>

        <!-- 존 크기 포맷팅 -->
        <template #[`item.zoneSize`]="{ item }">
          <span>{{ formatNumber(item.zoneSize) }}</span>
        </template>

        <!-- 최대 적재율 % -->
        <template #[`item.maxCapacityPercent`]="{ item }">
          <span>{{ formatNumber(item.maxCapacityPercent) }}%</span>
        </template>

        <!-- 사용 적재율 % -->
        <template #[`item.useCapacityPercent`]="{ item }">
          <span :class="getUsageRateClass(item.useCapacityPercent, item.maxCapacityPercent)">
            {{ formatNumber(item.useCapacityPercent) }}%
          </span>
        </template>

        <!-- 딥 우선 여부 칩 -->
        <template #[`item.deepFirstFlag`]="{ item }">
          <v-chip
            :color="item.deepFirstFlag ? 'primary' : 'grey'"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.deepFirstFlag ? 'Y' : 'N' }}
          </v-chip>
        </template>

        <!-- 대기 구역 여부 칩 -->
        <template #[`item.waitingAreaFlag`]="{ item }">
          <v-chip
            :color="item.waitingAreaFlag ? 'teal' : 'grey'"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.waitingAreaFlag ? 'Y' : 'N' }}
          </v-chip>
        </template>

        <!-- 전열 간격 -->
        <template #[`item.frontRowInterval`]="{ item }">
          <span>{{ item.frontRowInterval != null ? item.frontRowInterval : 0 }}</span>
        </template>

        <!-- 수정자 -->
        <template #[`item.lastEventUser`]="{ item }">
          <span>{{ item.lastEventUser || '-' }}</span>
        </template>

        <!-- 수정 일시 포맷팅 -->
        <template #[`item.lastEventTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.lastEventTime) }}</span>
        </template>

        <!-- 비고 / 이벤트 명칭 말줄임 -->
        <template #[`item.lastEventComment`]="{ item }">
          <span :title="getCommentTooltip(item)" class="comment-text-cell">
            {{ item.lastEventComment || item.lastEventName || '-' }}
          </span>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 WCS 보관 존(Zone) 데이터가 없습니다.</div>
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
import ModelingZoneViewForm from './components/ModelingZoneViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsZonesApi } from '@/api/wcsZone'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()
const { t } = useI18n()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  zoneName: '',
  zoneType: '전체',
  loadType: '전체',
})

const factoryFilterOptions = ['전체', 'insert', 'powder', 'common']
const zoneTypeFilterOptions = [
  '전체',
  '06',
  'test001',
  'test002',
  'STORAGE',
  'BUFFER',
  'REJECT',
  'RACK',
]
const loadTypeFilterOptions = ['전체', 'P', 'SINGLE', 'DOUBLE']

// 테이블 컬럼 정의 (WcsZoneResponse 백엔드 필드 완전 일치)
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '90px' },
  { title: '존 명칭', key: 'zoneName', align: 'start', width: '140px', sortable: true },
  { title: '존 타입', key: 'zoneType', align: 'center', width: '110px' },
  { title: '적재 방식', key: 'loadType', align: 'center', width: '100px' },
  { title: '선반 선택 모드', key: 'shelfSelectMode', align: 'center', width: '130px' },
  { title: '존 용량', key: 'zoneCapacity', align: 'end', width: '100px' },
  { title: '존 크기', key: 'zoneSize', align: 'end', width: '100px' },
  { title: '전열 간격', key: 'frontRowInterval', align: 'end', width: '90px' },
  { title: '최대 적재율', key: 'maxCapacityPercent', align: 'end', width: '100px' },
  { title: '사용 적재율', key: 'useCapacityPercent', align: 'end', width: '100px' },
  { title: '딥 우선', key: 'deepFirstFlag', align: 'center', width: '90px' },
  { title: '대기 구역', key: 'waitingAreaFlag', align: 'center', width: '90px' },
  { title: t('table.eventUser'), key: 'lastEventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'lastEventTime', align: 'center', width: '160px' },
  { title: t('table.eventComment'), key: 'lastEventComment', align: 'start', width: '160px' },
]

// 1. 역할 분리: 목록 조회 영역은 useDataTable 컴포저블 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsZonesApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.zoneName && searchParams.zoneName.trim() !== '') {
    params.zoneName = searchParams.zoneName.trim()
  }
  if (searchParams.zoneType && searchParams.zoneType !== '전체') {
    params.zoneType = searchParams.zoneType
  }
  if (searchParams.loadType && searchParams.loadType !== '전체') {
    params.loadType = searchParams.loadType
  }
  return params
}

// 응답 DTO 필드 정규화 (복합키: factoryName_zoneName)
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'insert'
      const zn = raw.zoneName || ''

      const isDeepFirst =
        raw.deepFirstFlag === true || raw.deepFirstFlag === 'Y' || raw.deepFirstFlag === 'true'
      const isWaitingArea =
        raw.waitingAreaFlag === true ||
        raw.waitingAreaFlag === 'Y' ||
        raw.waitingAreaFlag === 'true'

      result.push({
        ...raw,
        compositeKey: fn + '_' + zn,
        factoryName: fn,
        zoneName: zn,
        deepFirstFlag: isDeepFirst,
        frontRowInterval: raw.frontRowInterval != null ? raw.frontRowInterval : 0,
        loadType: raw.loadType || null,
        maxCapacityPercent: raw.maxCapacityPercent != null ? Number(raw.maxCapacityPercent) : 100,
        zoneCapacity: raw.zoneCapacity != null ? raw.zoneCapacity : 0,
        zoneColor: raw.zoneColor || '',
        zoneSize: raw.zoneSize != null ? raw.zoneSize : 0,
        zoneType: raw.zoneType || null,
        shelfSelectMode: raw.shelfSelectMode || 'NEAR_PORT',
        useCapacityPercent: raw.useCapacityPercent != null ? Number(raw.useCapacityPercent) : 0,
        waitingAreaFlag: isWaitingArea,
        lastEventComment: raw.lastEventComment || '',
        lastEventName: raw.lastEventName || '',
        lastEventTime: raw.lastEventTime || null,
        lastEventUser: raw.lastEventUser || '-',
      })
    }
  }

  return result
})

function getZoneTypeColor(type) {
  if (!type) return 'grey'
  const tStr = String(type).toUpperCase()
  if (tStr === 'STORAGE') return 'primary'
  if (tStr === 'BUFFER') return 'indigo'
  if (tStr === 'REJECT') return 'error'
  if (tStr === 'RACK') return 'teal'
  if (tStr === '06') return 'deep-purple'
  if (tStr.indexOf('TEST') === 0) return 'amber-darken-2'
  return 'blue-grey'
}

function getUsageRateClass(usePercent, maxPercent) {
  const use = Number(usePercent) || 0
  const max = Number(maxPercent) || 100
  if (use >= max) {
    return 'text-error font-weight-bold'
  }
  if (use >= max * 0.8) {
    return 'text-warning font-weight-medium'
  }
  return 'text-high-emphasis'
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
  searchParams.zoneName = ''
  searchParams.zoneType = '전체'
  searchParams.loadType = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onAddZone() {
  panelStore.openPanel(markRaw(ModelingZoneViewForm), {
    mode: 'CREATE',
    data: null,
    title: 'WCS 보관 존(Zone) 신규 등록',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
  panelStore.openPanel(markRaw(ModelingZoneViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: 'WCS 보관 존(Zone) 정보 수정',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 보관 존 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,존명칭,존타입,적재방식,선반선택모드,존용량,존크기,전열간격,최대적재율(%),사용적재율(%),딥우선,대기구역,이벤트명,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.zoneName || '',
      item.zoneType || '',
      item.loadType || '',
      item.shelfSelectMode || '',
      item.zoneCapacity != null ? item.zoneCapacity : 0,
      item.zoneSize != null ? item.zoneSize : 0,
      item.frontRowInterval != null ? item.frontRowInterval : 0,
      (item.maxCapacityPercent != null ? item.maxCapacityPercent : 0) + '%',
      (item.useCapacityPercent != null ? item.useCapacityPercent : 0) + '%',
      item.deepFirstFlag ? 'Y' : 'N',
      item.waitingAreaFlag ? 'Y' : 'N',
      item.lastEventName || '',
      item.lastEventUser || '',
      formatDateTime(item.lastEventTime),
      '"' + (item.lastEventComment ? item.lastEventComment.replace(/"/g, '""') : '') + '"',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'WcsZones_' + new Date().toISOString().slice(0, 10) + '.csv')
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

.action-button-group {
  gap: 8px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.15);
}

.comment-text-cell {
  display: block;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
