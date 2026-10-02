<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$mapMarkerPath" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{
            $t('views.modeling.routeNode.title')
          }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.modeling.routeNode.breadcrumb') }}
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

          <!-- 라우트 노드 ID (PK) -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.routeNodeId"
              label="라우트 노드 ID"
              placeholder="예: 1000"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 노드 코드 (nodeId) -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.nodeId"
              label="노드 코드"
              placeholder="예: WH01_IN_OUT_01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 노드 유형 (routeNodeType) -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.routeNodeType"
              :items="routeNodeTypeFilterOptions"
              label="노드 유형"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 리라우트 유형 (rerouteType) -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.rerouteType"
              :items="rerouteTypeFilterOptions"
              label="리라우트 유형"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 사용 여부 -->
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
        <!-- 라우트 노드 ID 하이라이트 -->
        <template #[`item.routeNodeId`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.routeNodeId }}</span>
        </template>

        <!-- 노드 코드 / 명칭 -->
        <template #[`item.nodeId`]="{ item }">
          <span class="font-weight-bold">{{ item.nodeId }}</span>
        </template>

        <!-- 노드 유형 칩 -->
        <template #[`item.routeNodeType`]="{ item }">
          <v-chip
            :color="getRouteNodeTypeColor(item.routeNodeType)"
            size="x-small"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ item.routeNodeType || '-' }}
          </v-chip>
        </template>

        <!-- 리라우트 유형 칩 -->
        <template #[`item.rerouteType`]="{ item }">
          <v-chip
            :color="getRerouteTypeColor(item.rerouteType)"
            size="x-small"
            variant="flat"
            class="font-weight-medium"
          >
            {{ item.rerouteType || '-' }}
          </v-chip>
        </template>

        <!-- 베이 / 유닛 / 설비 ID -->
        <template #[`item.bayId`]="{ item }">
          <span class="font-weight-medium text-blue-grey-darken-1">{{ item.bayId || '-' }}</span>
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

        <!-- 수정 일시 포맷팅 -->
        <template #[`item.lastEventTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.lastEventTime) }}</span>
        </template>

        <!-- 비고 / 설명 말줄임 -->
        <template #[`item.description`]="{ item }">
          <span :title="item.description" class="comment-text-cell">
            {{ item.description || '-' }}
          </span>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>{{ $t('views.modeling.routeNode.noData') }}</div>
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
import RouteNodeViewForm from './components/RouteNodeViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsRouteNodesApi } from '@/api/wcsRouteNode'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()
const { t } = useI18n()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  routeNodeId: '',
  nodeId: '',
  routeNodeType: '전체',
  rerouteType: '전체',
  useYn: '전체',
})

const factoryFilterOptions = ['전체', 'insert', 'powder', 'common']
const routeNodeTypeFilterOptions = [
  '전체',
  'INOUT_PORT',
  'IN_PORT',
  'OUT_PORT',
  'STATION',
  'BRANCH',
  'MERGE',
]
const rerouteTypeFilterOptions = ['전체', 'ON_ARRIVAL', 'NONE', 'DYNAMIC']
const useYnFilterOptions = ['전체', 'Y', 'N']

// 백엔드 WcsRouteNodeResponse에 일치하도록 헤더 재정의
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '90px' },
  { title: '라우트 노드 ID', key: 'routeNodeId', align: 'center', width: '110px', sortable: true },
  { title: '노드 코드', key: 'nodeId', align: 'start', width: '160px' },
  { title: '노드 명칭', key: 'nodeName', align: 'start', width: '180px' },
  { title: '노드 유형', key: 'routeNodeType', align: 'center', width: '130px' },
  { title: '리라우트 유형', key: 'rerouteType', align: 'center', width: '130px' },
  { title: '베이 ID', key: 'bayId', align: 'center', width: '100px' },
  { title: '유닛 ID', key: 'unitId', align: 'center', width: '100px' },
  { title: '설비 ID', key: 'equipmentId', align: 'center', width: '100px' },
  { title: '크레인 ID', key: 'craneId', align: 'center', width: '100px' },
  { title: '제어기 타입', key: 'controllerType', align: 'center', width: '100px' },
  { title: '순번', key: 'nodeSeq', align: 'end', width: '80px' },
  { title: t('table.useState'), key: 'useYn', align: 'center', width: '90px' },
  { title: '설명', key: 'description', align: 'start', width: '160px' },
  { title: t('table.eventUser'), key: 'lastEventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'lastEventTime', align: 'center', width: '160px' },
]

// 목록 조회는 useDataTable 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsRouteNodesApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.routeNodeId && searchParams.routeNodeId.trim() !== '') {
    params.routeNodeId = Number(searchParams.routeNodeId.trim())
  }
  if (searchParams.nodeId && searchParams.nodeId.trim() !== '') {
    params.nodeId = searchParams.nodeId.trim()
  }
  if (searchParams.routeNodeType && searchParams.routeNodeType !== '전체') {
    params.routeNodeType = searchParams.routeNodeType
  }
  if (searchParams.rerouteType && searchParams.rerouteType !== '전체') {
    params.rerouteType = searchParams.rerouteType
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
      const rId = raw.routeNodeId != null ? raw.routeNodeId : i + 1

      result.push({
        ...raw,
        compositeKey: fn + '_' + rId,
        factoryName: fn,
        routeNodeId: rId,
        nodeId: raw.nodeId || '-',
        nodeName: raw.nodeName || '-',
        routeNodeType: raw.routeNodeType || '-',
        rerouteType: raw.rerouteType || '-',
        bayId: raw.bayId || '-',
        unitId: raw.unitId || '-',
        equipmentId: raw.equipmentId || '-',
        craneId: raw.craneId || '-',
        controllerType: raw.controllerType || '-',
        nodeSeq: raw.nodeSeq != null ? raw.nodeSeq : 1,
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

function getRouteNodeTypeColor(type) {
  if (!type) return 'grey'
  const t = String(type).toUpperCase()
  if (t === 'INOUT_PORT') return 'primary'
  if (t === 'IN_PORT') return 'info'
  if (t === 'OUT_PORT') return 'teal'
  if (t === 'STATION') return 'indigo'
  if (t === 'BRANCH') return 'orange'
  return 'blue-grey'
}

function getRerouteTypeColor(type) {
  if (!type) return 'grey'
  const t = String(type).toUpperCase()
  if (t === 'ON_ARRIVAL') return 'teal'
  if (t === 'DYNAMIC') return 'purple'
  if (t === 'NONE') return 'grey'
  return 'blue-grey'
}

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.routeNodeId = ''
  searchParams.nodeId = ''
  searchParams.routeNodeType = '전체'
  searchParams.rerouteType = '전체'
  searchParams.useYn = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onAddNode() {
  panelStore.openPanel(markRaw(RouteNodeViewForm), {
    mode: 'CREATE',
    data: null,
    title: t('views.modeling.routeNode.createTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
  panelStore.openPanel(markRaw(RouteNodeViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: t('views.modeling.routeNode.editTitle'),
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert(t('views.modeling.routeNode.exportAlert'))
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,라우트노드ID,노드코드,노드명칭,노드유형,리라우트유형,베이ID,유닛ID,설비ID,크레인ID,제어기타입,순번,사용여부,설명,수정자,수정일시\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.routeNodeId != null ? item.routeNodeId : '',
      item.nodeId || '',
      item.nodeName || '',
      item.routeNodeType || '',
      item.rerouteType || '',
      item.bayId || '',
      item.unitId || '',
      item.equipmentId || '',
      item.craneId || '',
      item.controllerType || '',
      item.nodeSeq != null ? item.nodeSeq : 1,
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
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
