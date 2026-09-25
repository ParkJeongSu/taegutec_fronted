<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$mapMarkerPath" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">라우트 노드(Node) 설정</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            모델링 &gt; 경로 설정 &gt; 라우트 노드
          </v-chip>
        </div>

        <div class="d-flex align-center action-button-group">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddNode"
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

          <!-- 노드 ID -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.routeNodeId"
              label="노드 ID"
              placeholder="예: 101"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 노드 명칭 -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="searchParams.nodeName"
              label="노드 명칭"
              placeholder="예: NODE-01, 입고 투입 노드"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 노드 유형 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.nodeType"
              :items="nodeTypeFilterOptions"
              label="노드 유형"
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
          <v-col cols="12" sm="6" md="2" class="d-flex align-center">
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
        <!-- 노드 ID 하이라이트 -->
        <template #[`item.routeNodeId`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.routeNodeId }}</span>
        </template>

        <!-- 노드 명칭 렌더링 -->
        <template #[`item.nodeName`]="{ item }">
          <span class="font-weight-bold">{{ item.nodeName }}</span>
        </template>

        <!-- 노드 유형 칩 -->
        <template #[`item.nodeType`]="{ item }">
          <v-chip
            :color="getNodeTypeColor(item.nodeType)"
            size="x-small"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ item.nodeType || '-' }}
          </v-chip>
        </template>

        <!-- 좌표 렌더링 -->
        <template #[`item.coord`]="{ item }">
          <span class="text-caption font-weight-medium">{{ item.coord }}</span>
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
            <div>등록된 라우트 노드 설정 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, computed, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import RouteNodeViewForm from './components/RouteNodeViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsRouteNodesApi } from '@/api/wcsRouteNode'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  routeNodeId: '',
  nodeName: '',
  nodeType: '전체',
  useState: '전체',
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const nodeTypeFilterOptions = [
  '전체',
  'STATION',
  'BRANCH',
  'MERGE',
  'BUFFER',
  'CROSS',
  'NORMAL',
  'DIVERSION',
]
const useStateFilterOptions = ['전체', 'USE', 'UNUSE']

// 테이블 컬럼 정의
const headers = [
  { title: '소속 공장', key: 'factoryName', align: 'center', width: '100px' },
  { title: '노드 ID', key: 'routeNodeId', align: 'center', width: '100px', sortable: true },
  { title: '노드 명칭', key: 'nodeName', align: 'start', width: '160px' },
  { title: '노드 유형', key: 'nodeType', align: 'center', width: '120px' },
  { title: '좌표 (X, Y, Z)', key: 'coord', align: 'center', width: '160px' },
  { title: '최대 대기 수', key: 'maxWait', align: 'end', width: '110px' },
  { title: '연결 링크 수', key: 'linkCount', align: 'end', width: '110px' },
  { title: '존(Zone)', key: 'zoneName', align: 'center', width: '110px' },
  { title: '스토커', key: 'stockerName', align: 'center', width: '100px' },
  { title: '사용 여부', key: 'useState', align: 'center', width: '100px' },
  { title: '수정자', key: 'eventUser', align: 'center', width: '100px' },
  { title: '수정일시', key: 'eventTime', align: 'center', width: '160px' },
  { title: '비고', key: 'eventComment', align: 'start', width: '150px' },
]

// 1. 역할 분리 아키텍처: 목록 조회 영역은 useDataTable 컴포저블 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsRouteNodesApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.routeNodeId && searchParams.routeNodeId.trim() !== '') {
    params.routeNodeId = searchParams.routeNodeId.trim()
  }
  if (searchParams.nodeName && searchParams.nodeName.trim() !== '') {
    params.nodeName = searchParams.nodeName.trim()
  }
  if (searchParams.nodeType && searchParams.nodeType !== '전체') {
    params.nodeType = searchParams.nodeType
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
      const rId = raw.routeNodeId != null ? raw.routeNodeId : (raw.nodeId != null ? raw.nodeId : (i + 1))
      const x = raw.xCoord != null ? raw.xCoord : (raw.positionX != null ? raw.positionX : (raw.x != null ? raw.x : 0))
      const y = raw.yCoord != null ? raw.yCoord : (raw.positionY != null ? raw.positionY : (raw.y != null ? raw.y : 0))
      const z = raw.zCoord != null ? raw.zCoord : (raw.positionZ != null ? raw.positionZ : (raw.z != null ? raw.z : 0))

      result.push({
        ...raw,
        compositeKey: fn + '_' + rId,
        factoryName: fn,
        routeNodeId: rId,
        nodeName: raw.nodeName || raw.name || ('NODE-' + rId),
        nodeType: raw.nodeType || raw.type || 'STATION',
        xCoord: x,
        yCoord: y,
        zCoord: z,
        coord: '(' + x + ', ' + y + ', ' + z + ')',
        maxWait: raw.maxWait != null ? raw.maxWait : 1,
        linkCount: raw.linkCount != null ? raw.linkCount : 1,
        zoneName: raw.zoneName || '-',
        stockerName: raw.stockerName || '-',
        useState: raw.useState || (raw.useYn === 'N' ? 'UNUSE' : 'USE'),
        eventUser: raw.eventUser || raw.lastEventUser || '-',
        eventTime: raw.eventTime || raw.lastEventTime || null,
        eventComment: raw.eventComment || raw.lastEventComment || '',
      })
    }
  }

  return result
})

function getNodeTypeColor(nodeType) {
  if (!nodeType) return 'grey'
  const t = String(nodeType).toUpperCase()
  if (t === 'STATION') return 'primary'
  if (t === 'BRANCH') return 'indigo'
  if (t === 'MERGE') return 'teal'
  if (t === 'BUFFER') return 'orange'
  if (t === 'CROSS') return 'purple'
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

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.routeNodeId = ''
  searchParams.nodeName = ''
  searchParams.nodeType = '전체'
  searchParams.useState = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddNode() {
  panelStore.openPanel(markRaw(RouteNodeViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 라우트 노드 등록',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(RouteNodeViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '라우트 노드 정보 수정',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 라우트 노드 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,노드ID,노드명칭,노드유형,X좌표,Y좌표,Z좌표,최대대기수,연결링크수,존,스토커,사용여부,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.routeNodeId != null ? item.routeNodeId : '',
      item.nodeName || '',
      item.nodeType || '',
      item.xCoord != null ? item.xCoord : 0,
      item.yCoord != null ? item.yCoord : 0,
      item.zCoord != null ? item.zCoord : 0,
      item.maxWait != null ? item.maxWait : 0,
      item.linkCount != null ? item.linkCount : 0,
      item.zoneName || '',
      item.stockerName || '',
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
  link.setAttribute('download', 'RouteNodes_' + new Date().toISOString().slice(0, 10) + '.csv')
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
