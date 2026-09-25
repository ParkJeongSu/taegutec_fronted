<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$transfer" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">대체존(Alternative Zone) 설정</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            모델링 &gt; 경로 설정 &gt; 대체존 설정
          </v-chip>
        </div>

        <div class="d-flex align-center action-button-group">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddAltZone"
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

          <!-- 원본 존 -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="searchParams.sourceZoneName"
              label="원본 존 명칭"
              placeholder="예: ZONE_A, RAW_MAT"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 대체 존 -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="searchParams.alternativeZoneName"
              label="대체 존 명칭"
              placeholder="예: ZONE_B, BUFFER"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 우선순위 -->
          <v-col cols="12" sm="6" md="1">
            <v-text-field
              v-model="searchParams.priority"
              label="우선순위"
              placeholder="예: 1"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
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
        <!-- 원본 존 하이라이트 -->
        <template #[`item.sourceZoneName`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.sourceZoneName }}</span>
        </template>

        <!-- 우선순위 칩 -->
        <template #[`item.priority`]="{ item }">
          <v-chip size="x-small" color="secondary" variant="flat" class="font-weight-bold">
            {{ item.priority }}
          </v-chip>
        </template>

        <!-- 대체 존 하이라이트 -->
        <template #[`item.alternativeZoneName`]="{ item }">
          <span class="font-weight-bold">{{ item.alternativeZoneName }}</span>
        </template>

        <!-- 임계 적재율 포맷팅 -->
        <template #[`item.threshold`]="{ item }">
          <span class="font-weight-medium text-indigo">{{ item.threshold }}%</span>
        </template>

        <!-- 최대 수용 수량 -->
        <template #[`item.maxCount`]="{ item }">
          <span>{{ formatNumber(item.maxCount) }}</span>
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
            <div>등록된 대체존 설정 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, computed, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import AltZoneViewForm from './components/AltZoneViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsAlternativeStorageZonesApi } from '@/api/wcsAlternativeStorageZone'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  sourceZoneName: '',
  alternativeZoneName: '',
  priority: '',
  useState: '전체',
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const useStateFilterOptions = ['전체', 'USE', 'UNUSE']

// 테이블 컬럼 정의
const headers = [
  { title: '소속 공장', key: 'factoryName', align: 'center', width: '100px' },
  { title: '기준(원본) 존', key: 'sourceZoneName', align: 'start', width: '150px', sortable: true },
  { title: '우선순위', key: 'priority', align: 'center', width: '90px' },
  { title: '대체 존', key: 'alternativeZoneName', align: 'start', width: '150px' },
  { title: '전환 조건 (임계치)', key: 'threshold', align: 'end', width: '130px' },
  { title: '최대 수용량', key: 'maxCount', align: 'end', width: '110px' },
  { title: '사용 여부', key: 'useState', align: 'center', width: '100px' },
  { title: '수정자', key: 'eventUser', align: 'center', width: '100px' },
  { title: '수정일시', key: 'eventTime', align: 'center', width: '160px' },
  { title: '비고', key: 'eventComment', align: 'start', width: '150px' },
]

// 1. 역할 분리 아키텍처: 목록 조회 영역은 useDataTable 컴포저블 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchWcsAlternativeStorageZonesApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.factoryName && searchParams.factoryName !== '전체') {
    params.factoryName = searchParams.factoryName
  }
  if (searchParams.sourceZoneName && searchParams.sourceZoneName.trim() !== '') {
    params.sourceZoneName = searchParams.sourceZoneName.trim()
  }
  if (searchParams.alternativeZoneName && searchParams.alternativeZoneName.trim() !== '') {
    params.alternativeZoneName = searchParams.alternativeZoneName.trim()
  }
  if (searchParams.priority !== '' && searchParams.priority !== null && searchParams.priority !== undefined) {
    params.priority = Number(searchParams.priority)
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
      const sz = raw.sourceZoneName || raw.primaryZone || ''
      const az = raw.alternativeZoneName || raw.altZone || ''
      const pri = raw.priority != null ? raw.priority : (i + 1)
      const th = raw.threshold != null ? raw.threshold : (raw.thresholdRate != null ? raw.thresholdRate : 90)

      result.push({
        ...raw,
        compositeKey: fn + '_' + sz + '_' + az + '_' + pri,
        factoryName: fn,
        sourceZoneName: sz,
        alternativeZoneName: az,
        priority: pri,
        threshold: th,
        maxCount: raw.maxCount != null ? raw.maxCount : (raw.maxCapacity != null ? raw.maxCapacity : 0),
        useState: raw.useState || (raw.activeYn === 'N' || raw.useYn === 'N' ? 'UNUSE' : 'USE'),
        eventUser: raw.eventUser || raw.lastEventUser || '-',
        eventTime: raw.eventTime || raw.lastEventTime || raw.updatedAt || null,
        eventComment: raw.eventComment || raw.lastEventComment || raw.description || '',
      })
    }
  }

  return result
})

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
  searchParams.sourceZoneName = ''
  searchParams.alternativeZoneName = ''
  searchParams.priority = ''
  searchParams.useState = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddAltZone() {
  panelStore.openPanel(markRaw(AltZoneViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 대체존 설정 등록',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(AltZoneViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '대체존 설정 정보 수정',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 대체존 설정 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,기준(원본)존,우선순위,대체존,임계적재율(%),최대수용량,사용여부,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.sourceZoneName || '',
      item.priority != null ? item.priority : '',
      item.alternativeZoneName || '',
      item.threshold != null ? item.threshold + '%' : '',
      item.maxCount != null ? item.maxCount : 0,
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
  link.setAttribute('download', 'AlternativeZones_' + new Date().toISOString().slice(0, 10) + '.csv')
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
