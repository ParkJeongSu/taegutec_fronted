<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$transfer" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis"
            >대체존(Alternative Zone) 설정</span
          >
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.modeling.altZone.breadcrumb') }}
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

          <!-- 원본 존 -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="searchParams.sourceZoneName"
              label="기준(원본) 존 명칭"
              placeholder="예: TESTZONE001"
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
              placeholder="예: TESTZONE002"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 우선순위 -->
          <v-col cols="12" sm="6" md="2">
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
        <!-- 기준(원본) 존 하이라이트 -->
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
            <div>등록된 대체존 설정 데이터가 없습니다.</div>
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
import AltZoneViewForm from './components/AltZoneViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsAlternativeStorageZonesApi } from '@/api/wcsAlternativeStorageZone'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()
const { t } = useI18n()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  sourceZoneName: '',
  alternativeZoneName: '',
  priority: '',
  useYn: '전체',
})

const factoryFilterOptions = ['전체', 'insert', 'powder', 'common']
const useYnFilterOptions = ['전체', 'Y', 'N']

// 백엔드 DTO(WcsAlternativeStorageZoneResponse) 규격에 일치하는 헤더 목록
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '100px' },
  { title: '기준(원본) 존', key: 'sourceZoneName', align: 'start', width: '160px', sortable: true },
  { title: t('table.priority'), key: 'priority', align: 'center', width: '100px', sortable: true },
  { title: '대체 존', key: 'alternativeZoneName', align: 'start', width: '160px' },
  { title: t('table.useState'), key: 'useYn', align: 'center', width: '100px' },
  { title: '설명', key: 'description', align: 'start', width: '200px' },
  { title: t('table.eventUser'), key: 'lastEventUser', align: 'center', width: '110px' },
  { title: t('table.eventTime'), key: 'lastEventTime', align: 'center', width: '160px' },
  { title: t('table.eventComment'), key: 'lastEventComment', align: 'start', width: '160px' },
]

// 목록 조회는 useDataTable 전담
const { items, totalItems, loading, options, loadData, updateOptions } = useDataTable(
  fetchWcsAlternativeStorageZonesApi,
)

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
  if (
    searchParams.priority !== '' &&
    searchParams.priority !== null &&
    searchParams.priority !== undefined
  ) {
    params.priority = Number(searchParams.priority)
  }
  if (searchParams.useYn && searchParams.useYn !== '전체') {
    params.useYn = searchParams.useYn
  }
  return params
}

// 4개 복합키(factoryName + sourceZoneName + alternativeZoneName + priority) 결합 및 필드 정규화
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'insert'
      const sz = raw.sourceZoneName || ''
      const az = raw.alternativeZoneName || ''
      const pri = raw.priority != null ? raw.priority : i + 1

      result.push({
        ...raw,
        compositeKey: fn + '_' + sz + '_' + az + '_' + pri,
        factoryName: fn,
        sourceZoneName: sz,
        alternativeZoneName: az,
        priority: pri,
        useYn: raw.useYn || 'Y',
        description: raw.description || '-',
        lastEventUser: raw.lastEventUser || raw.eventUser || '-',
        lastEventTime: raw.lastEventTime || raw.eventTime || null,
        lastEventName: raw.lastEventName || '',
        lastEventComment: raw.lastEventComment || raw.eventComment || '',
      })
    }
  }

  return result
})

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
  searchParams.sourceZoneName = ''
  searchParams.alternativeZoneName = ''
  searchParams.priority = ''
  searchParams.useYn = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

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

function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
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
    csvContent + '소속공장,기준(원본)존,우선순위,대체존,사용여부,설명,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.sourceZoneName || '',
      item.priority != null ? item.priority : '',
      item.alternativeZoneName || '',
      item.useYn || 'Y',
      '"' + (item.description ? item.description.replace(/"/g, '""') : '') + '"',
      item.lastEventUser || '',
      formatDateTime(item.lastEventTime),
      '"' + (item.lastEventComment ? item.lastEventComment.replace(/"/g, '""') : '') + '"',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute(
    'download',
    'AlternativeZones_' + new Date().toISOString().slice(0, 10) + '.csv',
  )
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
