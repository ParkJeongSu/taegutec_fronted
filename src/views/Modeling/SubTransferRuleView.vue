<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$cogSyncOutline" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">Sub Transfer Rule (하위 반송 규칙)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            모델링 &gt; 제어 규칙 &gt; Sub Transfer Rule
          </v-chip>
        </div>

        <div class="d-flex align-center action-button-group">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddRule"
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

          <!-- 설비명 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.equipmentName"
              label="설비 명칭"
              placeholder="예: STK-01, AGV"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 모듈명 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.moduleName"
              label="모듈 명칭"
              placeholder="예: CRANE-1, MOD-01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 라우트 링크 ID -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.routeLinkId"
              label="링크 ID"
              placeholder="예: 1"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 규칙 유형 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.ruleType"
              :items="ruleTypeFilterOptions"
              label="규칙 유형"
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
        <!-- 설비 명칭 하이라이트 -->
        <template #[`item.equipmentName`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.equipmentName }}</span>
        </template>

        <!-- 모듈 명칭 -->
        <template #[`item.moduleName`]="{ item }">
          <span class="font-weight-medium">{{ item.moduleName }}</span>
        </template>

        <!-- 라우트 링크 ID -->
        <template #[`item.routeLinkId`]="{ item }">
          <v-chip size="x-small" color="blue-grey" variant="outlined" class="font-weight-bold">
            LINK #{{ item.routeLinkId }}
          </v-chip>
        </template>

        <!-- 우선순위 -->
        <template #[`item.priority`]="{ item }">
          <v-chip size="x-small" color="secondary" variant="flat" class="font-weight-bold">
            {{ item.priority }}
          </v-chip>
        </template>

        <!-- 규칙 유형 칩 -->
        <template #[`item.ruleType`]="{ item }">
          <v-chip
            :color="getRuleTypeColor(item.ruleType)"
            size="x-small"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ item.ruleType || '-' }}
          </v-chip>
        </template>

        <!-- 동작 유형 칩 -->
        <template #[`item.actionType`]="{ item }">
          <v-chip
            :color="getActionTypeColor(item.actionType)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.actionType || '-' }}
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
            <div>등록된 Sub Transfer Rule 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, computed, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import SubTransferRuleViewForm from './components/SubTransferRuleViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsSubTransferRulesApi } from '@/api/wcsSubTransferRule'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  equipmentName: '',
  moduleName: '',
  routeLinkId: '',
  ruleType: '전체',
  useState: '전체',
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const ruleTypeFilterOptions = [
  '전체',
  'DIRECT',
  'SHORTEST_PATH',
  'CONGESTION_BYPASS',
  'INTERLOCK',
  'SPEED_LIMIT',
  'MANUAL',
]
const useStateFilterOptions = ['전체', 'USE', 'UNUSE']

// 테이블 컬럼 정의
const headers = [
  { title: '소속 공장', key: 'factoryName', align: 'center', width: '100px' },
  { title: '설비 명칭', key: 'equipmentName', align: 'start', width: '130px', sortable: true },
  { title: '모듈 명칭', key: 'moduleName', align: 'start', width: '130px', sortable: true },
  { title: '링크 ID', key: 'routeLinkId', align: 'center', width: '110px', sortable: true },
  { title: '우선순위', key: 'priority', align: 'center', width: '90px' },
  { title: '규칙 명칭', key: 'ruleName', align: 'start', width: '180px' },
  { title: '규칙 유형', key: 'ruleType', align: 'center', width: '140px' },
  { title: '동작 유형', key: 'actionType', align: 'center', width: '110px' },
  { title: '사용 여부', key: 'useState', align: 'center', width: '100px' },
  { title: '수정자', key: 'eventUser', align: 'center', width: '100px' },
  { title: '수정일시', key: 'eventTime', align: 'center', width: '160px' },
  { title: '비고', key: 'eventComment', align: 'start', width: '150px' },
]

// 1. 역할 분리 아키텍처: 목록 조회 영역은 useDataTable 컴포저블 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsSubTransferRulesApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.equipmentName && searchParams.equipmentName.trim() !== '') {
    params.equipmentName = searchParams.equipmentName.trim()
  }
  if (searchParams.moduleName && searchParams.moduleName.trim() !== '') {
    params.moduleName = searchParams.moduleName.trim()
  }
  if (searchParams.routeLinkId !== '' && searchParams.routeLinkId !== null && searchParams.routeLinkId !== undefined) {
    params.routeLinkId = Number(searchParams.routeLinkId)
  }
  if (searchParams.ruleType && searchParams.ruleType !== '전체') {
    params.ruleType = searchParams.ruleType
  }
  if (searchParams.useState && searchParams.useState !== '전체') {
    params.useState = searchParams.useState
  }
  return params
}

// 데이터 정규화 및 바인딩 리스트 계산 (4개 복합키 compositeKey 결합)
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'INSERT'
      const eq = raw.equipmentName || raw.eqpName || ''
      const mod = raw.moduleName || raw.modName || ''
      const rId = raw.routeLinkId != null ? raw.routeLinkId : (raw.linkId != null ? raw.linkId : (i + 1))
      const pri = raw.priority != null ? raw.priority : 1
      const rName = raw.ruleName || raw.subRuleName || ('RULE-' + eq + '-' + mod)
      const rType = raw.ruleType || raw.subRuleType || raw.algorithm || 'DIRECT'
      const aType = raw.actionType || raw.action || 'TRANSFER'

      result.push({
        ...raw,
        compositeKey: fn + '_' + eq + '_' + mod + '_' + rId,
        factoryName: fn,
        equipmentName: eq,
        moduleName: mod,
        routeLinkId: rId,
        priority: pri,
        ruleName: rName,
        ruleType: rType,
        actionType: aType,
        useState: raw.useState || (raw.activeYn === 'N' || raw.useYn === 'N' ? 'UNUSE' : 'USE'),
        eventUser: raw.eventUser || raw.lastEventUser || '-',
        eventTime: raw.eventTime || raw.lastEventTime || null,
        eventComment: raw.eventComment || raw.lastEventComment || raw.description || '',
      })
    }
  }

  return result
})

function getRuleTypeColor(type) {
  if (!type) return 'grey'
  const t = String(type).toUpperCase()
  if (t === 'SHORTEST_PATH') return 'primary'
  if (t === 'CONGESTION_BYPASS') return 'orange'
  if (t === 'INTERLOCK') return 'error'
  if (t === 'SPEED_LIMIT') return 'warning'
  if (t === 'DIRECT') return 'teal'
  return 'blue-grey'
}

function getActionTypeColor(action) {
  if (!action) return 'grey'
  const a = String(action).toUpperCase()
  if (a === 'TRANSFER') return 'primary'
  if (a === 'WAIT') return 'warning'
  if (a === 'STOP') return 'error'
  if (a === 'BYPASS') return 'deep-purple'
  if (a === 'ROTATE') return 'indigo'
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
  searchParams.equipmentName = ''
  searchParams.moduleName = ''
  searchParams.routeLinkId = ''
  searchParams.ruleType = '전체'
  searchParams.useState = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddRule() {
  panelStore.openPanel(markRaw(SubTransferRuleViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 하위 반송 규칙 등록',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(SubTransferRuleViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '하위 반송 규칙 정보 수정',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 하위 반송 규칙 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,설비명칭,모듈명칭,링크ID,우선순위,규칙명칭,규칙유형,동작유형,사용여부,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.equipmentName || '',
      item.moduleName || '',
      item.routeLinkId != null ? item.routeLinkId : '',
      item.priority != null ? item.priority : '',
      item.ruleName || '',
      item.ruleType || '',
      item.actionType || '',
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
  link.setAttribute('download', 'SubTransferRules_' + new Date().toISOString().slice(0, 10) + '.csv')
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
