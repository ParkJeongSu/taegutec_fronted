<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$transitTransfer" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">라우트 링크(Link) 설정</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            모델링 &gt; 경로 설정 &gt; 라우트 링크
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
            신규 등록
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

          <!-- 링크 ID -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.routeLinkId"
              label="링크 ID"
              placeholder="예: 1"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 시작 노드 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.fromNode"
              label="시작 노드"
              placeholder="예: 101, NODE-01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 도착 노드 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.toNode"
              label="도착 노드"
              placeholder="예: 105, NODE-05"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 방향성 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.direction"
              :items="directionFilterOptions"
              label="링크 방향"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 사용 여부 -->
          <v-col cols="12" sm="6" md="1">
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
          <v-col cols="12" sm="6" md="1" class="d-flex align-center">
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
        <!-- 링크 ID 하이라이트 -->
        <template #[`item.routeLinkId`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.routeLinkId }}</span>
        </template>

        <!-- 시작 / 도착 노드 -->
        <template #[`item.fromNode`]="{ item }">
          <span class="font-weight-medium">{{ item.fromNode }}</span>
        </template>

        <template #[`item.toNode`]="{ item }">
          <span class="font-weight-medium">{{ item.toNode }}</span>
        </template>

        <!-- 거리 포맷팅 -->
        <template #[`item.distance`]="{ item }">
          <span class="font-weight-medium">{{ formatNumber(item.distance) }} m</span>
        </template>

        <!-- 제한 속도 포맷팅 -->
        <template #[`item.speedLimit`]="{ item }">
          <span>{{ formatNumber(item.speedLimit) }} m/s</span>
        </template>

        <!-- 방향성 칩 -->
        <template #[`item.direction`]="{ item }">
          <v-chip
            :color="getDirectionColor(item.direction)"
            size="x-small"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ item.direction || '-' }}
          </v-chip>
        </template>

        <!-- 링크 타입 -->
        <template #[`item.linkType`]="{ item }">
          <v-chip size="x-small" variant="flat" color="blue-grey" class="font-weight-medium">
            {{ item.linkType || 'CONVEYOR' }}
          </v-chip>
        </template>

        <!-- 사용 여부 칩 -->
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

        <!-- 수정 일시 포맷팅 -->
        <template #[`item.eventTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.eventTime) }}</span>
        </template>

        <!-- 비고 말줄임 -->
        <template #[`item.eventComment`]="{ item }">
          <span :title="item.eventComment" class="comment-text-cell">
            {{ item.eventComment || '-' }}
          </span>
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
import { reactive, computed, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import RouteLinkViewForm from './components/RouteLinkViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsRouteLinksApi } from '@/api/wcsRouteLink'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  routeLinkId: '',
  fromNode: '',
  toNode: '',
  direction: '전체',
  useState: '전체',
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const directionFilterOptions = ['전체', 'ONE_WAY', 'BI_DIRECTIONAL', 'REVERSE']
const useStateFilterOptions = ['전체', 'USE', 'UNUSE']

// 테이블 컬럼 정의
const headers = [
  { title: '소속 공장', key: 'factoryName', align: 'center', width: '100px' },
  { title: '링크 ID', key: 'routeLinkId', align: 'center', width: '100px', sortable: true },
  { title: '링크 명칭', key: 'linkName', align: 'start', width: '150px' },
  { title: '시작 노드', key: 'fromNode', align: 'start', width: '120px' },
  { title: '도착 노드', key: 'toNode', align: 'start', width: '120px' },
  { title: '거리 (m)', key: 'distance', align: 'end', width: '110px' },
  { title: '제한 속도 (m/s)', key: 'speedLimit', align: 'end', width: '120px' },
  { title: '방향성', key: 'direction', align: 'center', width: '120px' },
  { title: '링크 타입', key: 'linkType', align: 'center', width: '110px' },
  { title: '사용 여부', key: 'useState', align: 'center', width: '100px' },
  { title: '수정자', key: 'eventUser', align: 'center', width: '100px' },
  { title: '수정일시', key: 'eventTime', align: 'center', width: '160px' },
  { title: '비고', key: 'eventComment', align: 'start', width: '150px' },
]

// 1. 역할 분리 아키텍처: 목록 조회 영역은 useDataTable 컴포저블 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsRouteLinksApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.routeLinkId && searchParams.routeLinkId.trim() !== '') {
    params.routeLinkId = searchParams.routeLinkId.trim()
  }
  if (searchParams.fromNode && searchParams.fromNode.trim() !== '') {
    params.fromNode = searchParams.fromNode.trim()
  }
  if (searchParams.toNode && searchParams.toNode.trim() !== '') {
    params.toNode = searchParams.toNode.trim()
  }
  if (searchParams.direction && searchParams.direction !== '전체') {
    params.direction = searchParams.direction
  }
  if (searchParams.useState && searchParams.useState !== '전체') {
    params.useState = searchParams.useState
  }
  return params
}

// 데이터 정규화 및 바인딩 리스트 계산 (2개 복합키 compositeKey 결합)
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'INSERT'
      const rId = raw.routeLinkId != null ? raw.routeLinkId : (raw.linkId != null ? raw.linkId : (i + 1))
      const fnNode = raw.fromNode != null ? raw.fromNode : (raw.fromNodeId != null ? raw.fromNodeId : '')
      const toNode = raw.toNode != null ? raw.toNode : (raw.toNodeId != null ? raw.toNodeId : '')

      result.push({
        ...raw,
        compositeKey: fn + '_' + rId,
        factoryName: fn,
        routeLinkId: rId,
        linkName: raw.linkName || raw.name || ('LINK-' + fnNode + '-' + toNode),
        fromNode: fnNode,
        toNode: toNode,
        distance: raw.distance != null ? raw.distance : 0,
        speedLimit: raw.speedLimit != null ? raw.speedLimit : (raw.maxSpeed != null ? raw.maxSpeed : 0),
        direction: raw.direction || raw.directionType || 'ONE_WAY',
        linkType: raw.linkType || 'CONVEYOR',
        useState: raw.useState || (raw.useYn === 'N' ? 'UNUSE' : 'USE'),
        eventUser: raw.eventUser || raw.lastEventUser || '-',
        eventTime: raw.eventTime || raw.lastEventTime || null,
        eventComment: raw.eventComment || raw.lastEventComment || '',
      })
    }
  }

  return result
})

function getDirectionColor(direction) {
  if (!direction) return 'grey'
  const d = String(direction).toUpperCase()
  if (d === 'ONE_WAY') return 'primary'
  if (d === 'BI_DIRECTIONAL') return 'teal'
  if (d === 'REVERSE') return 'orange'
  return 'blue-grey'
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
  searchParams.fromNode = ''
  searchParams.toNode = ''
  searchParams.direction = '전체'
  searchParams.useState = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddLink() {
  panelStore.openPanel(markRaw(RouteLinkViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 라우트 링크 등록',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(RouteLinkViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '라우트 링크 정보 수정',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 라우트 링크 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,링크ID,링크명칭,시작노드,도착노드,거리(m),제한속도(m/s),방향성,링크타입,사용여부,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.routeLinkId != null ? item.routeLinkId : '',
      item.linkName || '',
      item.fromNode || '',
      item.toNode || '',
      item.distance != null ? item.distance : 0,
      item.speedLimit != null ? item.speedLimit : 0,
      item.direction || '',
      item.linkType || '',
      getUseStateText(item.useState),
      item.eventUser || '',
      formatDateTime(item.eventTime),
      '"' + (item.eventComment ? item.eventComment.replace(/"/g, '""') : '') + '"',
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
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
