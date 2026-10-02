<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$cogSyncOutline" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis"
            >세부 반송 룰(Sub Transfer Rule) 관리</span
          >
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.modeling.subTransferRule.breadcrumb') }}
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

          <!-- 설비명 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.equipmentName"
              label="설비 명칭"
              placeholder="예: WH1, STK01"
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
              placeholder="예: CR01, CONV01"
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
              label="라우트 링크 ID"
              placeholder="예: 1000"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 모듈 타입 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.moduleType"
              :items="moduleTypeFilterOptions"
              label="모듈 타입"
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
          <span class="font-weight-bold">{{ item.moduleName }}</span>
        </template>

        <!-- 라우트 링크 ID -->
        <template #[`item.routeLinkId`]="{ item }">
          <v-chip size="x-small" color="blue-grey" variant="outlined" class="font-weight-bold">
            LINK #{{ item.routeLinkId }}
          </v-chip>
        </template>

        <!-- 모듈 타입 칩 -->
        <template #[`item.moduleType`]="{ item }">
          <v-chip
            :color="getModuleTypeColor(item.moduleType)"
            size="x-small"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ item.moduleType || '-' }}
          </v-chip>
        </template>

        <!-- 캐리어 수량 -->
        <template #[`item.carrierCount`]="{ item }">
          <span class="font-weight-medium">{{ formatNumber(item.carrierCount) }}</span>
        </template>

        <!-- NG 상태 칩 -->
        <template #[`item.ngStatus`]="{ item }">
          <v-chip
            :color="getNgStatusColor(item.ngStatus)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.ngStatus || '-' }}
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
            <div>{{ $t('views.modeling.subTransferRule.noData') }}</div>
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
import SubTransferRuleViewForm from './components/SubTransferRuleViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchWcsSubTransferRulesApi } from '@/api/wcsSubTransferRule'
import { formatDateTime } from '@/utils/dateUtils'

const panelStore = usePanelStore()
const { t } = useI18n()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  equipmentName: '',
  moduleName: '',
  routeLinkId: '',
  moduleType: '전체',
})

const factoryFilterOptions = ['전체', 'insert', 'powder', 'common']
const moduleTypeFilterOptions = ['전체', 'CRANE', 'CONVEYOR', 'PORT', 'VEHICLE', 'STATION']

// 백엔드 WcsSubTransferRuleResponse 필드 기준 테이블 헤더 정의
const headers = [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '90px' },
  { title: '설비 명칭', key: 'equipmentName', align: 'start', width: '130px', sortable: true },
  { title: '모듈 명칭', key: 'moduleName', align: 'start', width: '130px', sortable: true },
  { title: '링크 ID', key: 'routeLinkId', align: 'center', width: '110px', sortable: true },
  { title: '모듈 타입', key: 'moduleType', align: 'center', width: '110px' },
  { title: '캐리어 수량', key: 'carrierCount', align: 'end', width: '100px' },
  { title: '불량(NG) 상태', key: 'ngStatus', align: 'center', width: '110px' },
  { title: '설명', key: 'description', align: 'start', width: '180px' },
  { title: t('table.eventUser'), key: 'lastEventUser', align: 'center', width: '100px' },
  { title: t('table.eventTime'), key: 'lastEventTime', align: 'center', width: '160px' },
  { title: t('table.eventComment'), key: 'lastEventComment', align: 'start', width: '160px' },
]

// 1. 목록 조회는 useDataTable 전담
const { items, totalItems, loading, options, loadData, updateOptions } = useDataTable(
  fetchWcsSubTransferRulesApi,
)

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
  if (
    searchParams.routeLinkId !== '' &&
    searchParams.routeLinkId !== null &&
    searchParams.routeLinkId !== undefined
  ) {
    params.routeLinkId = Number(searchParams.routeLinkId)
  }
  if (searchParams.moduleType && searchParams.moduleType !== '전체') {
    params.moduleType = searchParams.moduleType
  }
  return params
}

// 데이터 정규화 및 4개 복합키(factoryName + equipmentName + moduleName + routeLinkId) 결합
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'insert'
      const eq = raw.equipmentName || ''
      const mod = raw.moduleName || ''
      const rId = raw.routeLinkId != null ? raw.routeLinkId : i + 1

      result.push({
        ...raw,
        compositeKey: fn + '_' + eq + '_' + mod + '_' + rId,
        factoryName: fn,
        equipmentName: eq,
        moduleName: mod,
        routeLinkId: rId,
        carrierCount: raw.carrierCount != null ? raw.carrierCount : 0,
        moduleType: raw.moduleType || '-',
        ngStatus: raw.ngStatus || '-',
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

function getModuleTypeColor(type) {
  if (!type) return 'grey'
  const t = String(type).toUpperCase()
  if (t === 'CRANE') return 'primary'
  if (t === 'CONVEYOR') return 'teal'
  if (t === 'PORT') return 'indigo'
  if (t === 'VEHICLE') return 'orange'
  return 'blue-grey'
}

function getNgStatusColor(status) {
  if (!status) return 'grey'
  const s = String(status).toUpperCase()
  if (s === 'NORMAL' || s === 'OK' || s === 'GOOD' || s === 'NONE') return 'success'
  if (s === 'NG' || s === 'ERROR' || s === 'FAULT' || s === 'REJECT') return 'error'
  if (s === 'WARN' || s === 'WARNING') return 'warning'
  return 'blue-grey'
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
  searchParams.equipmentName = ''
  searchParams.moduleName = ''
  searchParams.routeLinkId = ''
  searchParams.moduleType = '전체'
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onAddRule() {
  panelStore.openPanel(markRaw(SubTransferRuleViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 세부 반송 룰 등록',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
  panelStore.openPanel(markRaw(SubTransferRuleViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '세부 반송 룰 정보 수정',
    onSuccess: function () {
      loadData(getSanitizedParams())
    },
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 세부 반송 룰 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속공장,설비명칭,모듈명칭,링크ID,모듈타입,캐리어수량,NG상태,설명,수정자,수정일시,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.equipmentName || '',
      item.moduleName || '',
      item.routeLinkId != null ? item.routeLinkId : '',
      item.moduleType || '',
      item.carrierCount != null ? item.carrierCount : 0,
      item.ngStatus || '',
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
    'SubTransferRules_' + new Date().toISOString().slice(0, 10) + '.csv',
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
