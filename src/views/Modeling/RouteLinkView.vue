<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$transitTransfer" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{
            $t('views.modeling.routeLink.title')
          }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.modeling.routeLink.breadcrumb') }}
          </v-chip>
        </div>

        <div class="d-flex align-center action-button-group">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddLink"
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

          <!-- 링크 ID (routeLinkId) -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.routeLinkId"
              label="링크 ID"
              placeholder="예: 1000"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 시작 노드 (fromNodeId) -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.fromNodeId"
              label="시작 노드"
              placeholder="예: WH03_OUT_03"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 도착 노드 (toNodeId) -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.toNodeId"
              label="도착 노드"
              placeholder="예: CNV02_IN_15"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 링크 타입 (routeLinkType) -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.routeLinkType"
              :items="routeLinkTypeFilterOptions"
              label="링크 타입"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 사용 여부 (useYn) -->
          <v-col cols="12" sm="6" md="1">
            <v-select
              v-model="searchParams.useYn"
              :items="useYnFilterOptions"
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
        v-on:update:options="onUpdateOptions"
        v-on:click:row="onRowClick"
      >
        <!-- 링크 ID 하이라이트 -->
        <template #[`item.routeLinkId`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.routeLinkId }}</span>
        </template>

        <!-- 시작 / 도착 노드 -->
        <template #[`item.fromNodeId`]="{ item }">
          <span class="font-weight-medium">{{ item.fromNodeId }}</span>
        </template>

        <template #[`item.toNodeId`]="{ item }">
          <span class="font-weight-medium">{{ item.toNodeId }}</span>
        </template>

        <!-- 링크 타입 칩 -->
        <template #[`item.routeLinkType`]="{ item }">
          <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold">
            {{ item.routeLinkType || '-' }}
          </v-chip>
        </template>

        <!-- 길이 포맷팅 -->
        <template #[`item.length`]="{ item }">
          <span>{{ formatNumber(item.length) }} m</span>
        </template>

        <!-- 우선순위 -->
        <template #[`item.priority`]="{ item }">
          <v-chip
            size="x-small"
            variant="flat"
            color="blue-grey-lighten-4"
            class="font-weight-bold"
          >
            {{ item.priority != null ? item.priority : 0 }}
          </v-chip>
        </template>

        <!-- 통과 여부 칩 -->
        <template #[`item.passYn`]="{ item }">
          <v-chip
            :color="item.passYn === 'Y' ? 'teal' : 'grey'"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.passYn === 'Y' ? '통과' : '차단' }}
          </v-chip>
        </template>

        <!-- 가용 여부 칩 -->
        <template #[`item.usableYn`]="{ item }">
          <v-chip
            :color="item.usableYn === 'Y' ? 'indigo' : 'grey'"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.usableYn === 'Y' ? '가용' : '불가' }}
          </v-chip>
        </template>

        <!-- 사용 여부 칩 -->
        <template #[`item.useYn`]="{ item }">
          <v-chip
            :color="item.useYn === 'Y' ? 'success' : 'grey'"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.useYn === 'Y' ? $t('common.use') : $t('common.unuse') }}
          </v-chip>
        </template>

        <!-- 설명 말줄임 -->
        <template #[`item.description`]="{ item }">
          <span :title="item.description" class="comment-text-cell">
            {{ item.description || '-' }}
          </span>
        </template>

        <!-- 수정 일시 포맷팅 -->
        <template #[`item.lastEventTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.lastEventTime) }}</span>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 라우트 링크 설정 데이터가 없습니다.</div>
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
import RouteLinkViewForm from './components/RouteLinkViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsRouteLinksApi } from '@/api/wcsRouteLink'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()
const { t } = useI18n()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  routeLinkId: '',
  fromNodeId: '',
  toNodeId: '',
  routeLinkType: '전체',
  useYn: '전체',
})

const factoryFilterOptions = ['전체', 'insert', 'powder', 'common']
const routeLinkTypeFilterOptions = ['전체', 'INTER', 'INTRA', 'CONVEYOR', 'PATH', 'TRACK']
const useYnFilterOptions = ['전체', 'Y', 'N']

// 백엔드 WcsRouteLinkResponse 기준 정렬 컬럼 정의
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '90px' },
  { title: '링크 ID', key: 'routeLinkId', align: 'center', width: '100px', sortable: true },
  { title: '시작 노드', key: 'fromNodeId', align: 'start', width: '150px' },
  { title: '도착 노드', key: 'toNodeId', align: 'start', width: '150px' },
  { title: '링크 타입', key: 'routeLinkType', align: 'center', width: '110px' },
  { title: '길이 (m)', key: 'length', align: 'end', width: '90px' },
  { title: '우선순위', key: 'priority', align: 'center', width: '90px' },
  { title: '공정 유형', key: 'processType', align: 'center', width: '100px' },
  { title: '통과 가능', key: 'passYn', align: 'center', width: '90px' },
  { title: '가용 상태', key: 'usableYn', align: 'center', width: '90px' },
  { title: t('table.useState'), key: 'useYn', align: 'center', width: '90px' },
  { title: '설명', key: 'description', align: 'start', width: '200px' },
  { title: t('table.eventUser'), key: 'lastEventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'lastEventTime', align: 'center', width: '160px' },
]

// 1. 목록 조회는 useDataTable 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsRouteLinksApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.routeLinkId && searchParams.routeLinkId.trim() !== '') {
    params.routeLinkId = Number(searchParams.routeLinkId.trim())
  }
  if (searchParams.fromNodeId && searchParams.fromNodeId.trim() !== '') {
    params.fromNodeId = searchParams.fromNodeId.trim()
  }
  if (searchParams.toNodeId && searchParams.toNodeId.trim() !== '') {
    params.toNodeId = searchParams.toNodeId.trim()
  }
  if (searchParams.routeLinkType && searchParams.routeLinkType !== '전체') {
    params.routeLinkType = searchParams.routeLinkType
  }
  if (searchParams.useYn && searchParams.useYn !== '전체') {
    params.useYn = searchParams.useYn
  }
  return params
}

// 응답 DTO 필드 정규화
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'insert'
      const rId = raw.routeLinkId != null ? raw.routeLinkId : i + 1

      result.push({
        ...raw,
        compositeKey: fn + '_' + rId,
        factoryName: fn,
        routeLinkId: rId,
        fromNodeId: raw.fromNodeId || '-',
        toNodeId: raw.toNodeId || '-',
        routeLinkType: raw.routeLinkType || 'INTER',
        length: raw.length != null ? raw.length : 1,
        priority: raw.priority != null ? raw.priority : 0,
        processType: raw.processType || 'ALL',
        passYn: raw.passYn || 'Y',
        usableYn: raw.usableYn || 'Y',
        useYn: raw.useYn || 'Y',
        description: raw.description || '-',
        lastEventUser: raw.lastEventUser || raw.eventUser || '-',
        lastEventTime: raw.lastEventTime || raw.eventTime || null,
        lastEventComment: raw.lastEventComment || raw.eventComment || '',
      })
    }
  }

  return result
})

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
  searchParams.routeLinkId = ''
  searchParams.fromNodeId = ''
  searchParams.toNodeId = ''
  searchParams.routeLinkType = '전체'
  searchParams.useYn = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onAddLink() {
  panelStore.openPanel(markRaw(RouteLinkViewForm), {
    mode: 'CREATE',
    data: null,
    title: t('views.modeling.routeLink.createTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
  panelStore.openPanel(markRaw(RouteLinkViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: t('views.modeling.routeLink.editTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert(t('views.modeling.routeLink.exportAlert'))
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,링크ID,시작노드,도착노드,링크타입,길이(m),우선순위,공정유형,통과여부,가용여부,사용여부,설명,수정자,수정일시\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.routeLinkId != null ? item.routeLinkId : '',
      item.fromNodeId || '',
      item.toNodeId || '',
      item.routeLinkType || '',
      item.length != null ? item.length : 0,
      item.priority != null ? item.priority : 0,
      item.processType || '',
      item.passYn || '',
      item.usableYn || '',
      item.useYn || 'Y',
      '"' + (item.description ? item.description.replace(/"/g, '""') : '') + '"',
      item.lastEventUser || '',
      formatDateTime(item.lastEventTime),
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'RouteLinks_' + new Date().toISOString().slice(0, 10) + '.csv')
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
.comment-text-cell {
  display: block;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
