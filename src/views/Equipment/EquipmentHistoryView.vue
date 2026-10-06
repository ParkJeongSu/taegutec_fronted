<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$history" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">설비 이력 조회</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설비 관리 &gt; 이력 관리 &gt; 설비 상태 / 알람 이력
          </v-chip>
        </div>

        <div class="d-flex align-center action-button-group">
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
          <!-- 1. 설비 선택 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-select
              v-model="searchParams.equipmentName"
              :items="equipmentOptions"
              label="설비 선택"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 2. 이력 구분 선택 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-select
              v-model="searchParams.eventType"
              :items="eventTypeOptions"
              label="이력 구분"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 3. 조회 시작일 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.startDate"
              :label="$t('common.startDate')"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>

          <!-- 4. 조회 종료일 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.endDate"
              :label="$t('common.endDate')"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>

          <!-- 5. 검색 및 초기화 버튼 -->
          <v-col cols="12" sm="6" md="6" lg="4" class="d-flex align-center mt-2 mt-lg-0">
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
        item-value="id"
        density="compact"
        v-on:update:options="onUpdateOptions"
      >
        <!-- 1. 발생 일시 포맷팅 -->
        <template #[`item.eventTime`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ formatDateTime(item.eventTime) }}
          </span>
        </template>

        <!-- 2. 설비명 칩 -->
        <template #[`item.equipmentName`]="{ item }">
          <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
            {{ item.equipmentName }}
          </v-chip>
        </template>

        <!-- 3. 설비 타입 -->
        <template #[`item.equipmentType`]="{ item }">
          <span class="text-caption text-medium-emphasis">{{ item.equipmentType }}</span>
        </template>

        <!-- 4. 이전 상태 ➔ 변경 상태 -->
        <template #[`item.statusChange`]="{ item }">
          <div class="d-flex align-center justify-center">
            <v-chip size="x-small" :color="getStatusColor(item.previousStatus)" variant="tonal">
              {{ item.previousStatus }}
            </v-chip>
            <v-icon icon="$chevronRight" size="14" color="grey" class="mx-1" />
            <v-chip size="x-small" :color="getStatusColor(item.currentStatus)" variant="flat" class="font-weight-bold">
              {{ item.currentStatus }}
            </v-chip>
          </div>
        </template>

        <!-- 5. 이벤트 / 알람 코드 -->
        <template #[`item.eventCode`]="{ item }">
          <span class="font-weight-bold" :class="item.eventCode.indexOf('E-') === 0 || item.eventCode.indexOf('A-') === 0 ? 'text-error' : 'text-primary'">
            {{ item.eventCode }}
          </span>
        </template>

        <!-- 6. 상세 내용 -->
        <template #[`item.eventDescription`]="{ item }">
          <span class="text-caption font-weight-medium">{{ item.eventDescription }}</span>
        </template>

        <!-- 7. 확인 여부 -->
        <template #[`item.acknowledgedState`]="{ item }">
          <v-chip
            size="x-small"
            :color="item.acknowledgedState === 'Y' ? 'success' : 'error'"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.acknowledgedState === 'Y' ? '확인완료' : '미확인' }}
          </v-chip>
        </template>

        <!-- 8. 작업자 -->
        <template #[`item.eventUser`]="{ item }">
          <span class="text-caption">{{ item.eventUser || '-' }}</span>
        </template>

        <!-- 9. 조치 코멘트 -->
        <template #[`item.eventComment`]="{ item }">
          <span class="text-caption text-medium-emphasis">{{ item.eventComment || '-' }}</span>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useDataTable } from '@/composables/useDataTable'
import { fetchEquipmentHistoryApi } from '@/api/equipment'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { formatDateTime } from '@/utils/dateUtils'

// ==========================================
// 1. 검색 필터 파라미터 및 옵션
// ==========================================
const searchParams = reactive({
  equipmentName: '전체',
  eventType: '전체',
  startDate: '',
  endDate: '',
})

const equipmentOptions = [
  '전체',
  'MIX-01',
  'MIX-02',
  'MIX-03',
  'RED-01',
  'RED-02',
  'RED-03',
  'CRB-01',
  'CRB-02',
  'BLD-01',
  'BLD-02',
  'BLD-03',
  'SCR-01',
  'SCR-02',
  'INC-01',
  'INC-02',
  'DOP-01',
  'DOP-02',
  'DEA-01',
  'DEA-02',
  'PCK-01',
  'PCK-02',
  'H2P-01',
  'OTH-01',
]

const eventTypeOptions = [
  { title: '전체 이력', value: '전체' },
  { title: '상태 변경 (STATUS_CHANGE)', value: 'STATUS_CHANGE' },
  { title: '알람 발생 (ALARM_OCCUR)', value: 'ALARM_OCCUR' },
  { title: '파라미터 변경 (PARAM_CHANGE)', value: 'PARAM_CHANGE' },
]

// ==========================================
// 2. 테이블 헤더 정의
// ==========================================
const headers = [
  { title: '발생 일시', key: 'eventTime', width: '150px', align: 'start' },
  { title: '설비명', key: 'equipmentName', width: '110px', align: 'center' },
  { title: '설비 타입', key: 'equipmentType', width: '120px', align: 'start' },
  { title: '상태 전이 (이전 ➔ 현재)', key: 'statusChange', width: '180px', align: 'center', sortable: false },
  { title: '이벤트/알람 코드', key: 'eventCode', width: '130px', align: 'start' },
  { title: '상세 내용', key: 'eventDescription', align: 'start' },
  { title: '확인 여부', key: 'acknowledgedState', width: '95px', align: 'center' },
  { title: '작업자', key: 'eventUser', width: '115px', align: 'center' },
  { title: '조치 코멘트', key: 'eventComment', width: '180px', align: 'start' },
]

// ==========================================
// 3. useDataTable 연동
// ==========================================
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchEquipmentHistoryApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.equipmentName && searchParams.equipmentName !== '전체') {
    params.equipmentName = searchParams.equipmentName
  }
  if (searchParams.eventType && searchParams.eventType !== '전체') {
    params.eventType = searchParams.eventType
  }
  if (searchParams.startDate) {
    params.startDate = searchParams.startDate + 'T00:00:00'
  }
  if (searchParams.endDate) {
    params.endDate = searchParams.endDate + 'T23:59:59'
  }
  return params
}

const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      result.push({
        id: raw.id || i + 1,
        eventTime: raw.eventTime || null,
        equipmentName: raw.equipmentName || '',
        equipmentType: raw.equipmentType || '',
        previousStatus: raw.previousStatus || 'IDLE',
        currentStatus: raw.currentStatus || 'RUN',
        eventType: raw.eventType || '',
        eventCode: raw.eventCode || '',
        eventDescription: raw.eventDescription || '',
        acknowledgedState: raw.acknowledgedState || 'Y',
        eventUser: raw.eventUser || '-',
        eventComment: raw.eventComment || '',
      })
    }
  }

  return result
})

function getStatusColor(status) {
  if (!status) return 'grey'
  const s = String(status).toUpperCase()
  if (s === 'RUN') return 'success'
  if (s === 'IDLE') return 'primary'
  if (s === 'ALARM' || s === 'ERROR') return 'error'
  if (s === 'STOP') return 'grey'
  return 'secondary'
}

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.equipmentName = '전체'
  searchParams.eventType = '전체'
  searchParams.startDate = ''
  searchParams.endDate = ''
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '발생일시,설비명,설비타입,이전상태,현재상태,이벤트코드,상세내용,확인여부,작업자,조치코멘트\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      formatDateTime(item.eventTime),
      item.equipmentName || '',
      item.equipmentType || '',
      item.previousStatus || '',
      item.currentStatus || '',
      item.eventCode || '',
      '"' + (item.eventDescription ? item.eventDescription.replace(/"/g, '""') : '') + '"',
      item.acknowledgedState || '',
      item.eventUser || '',
      '"' + (item.eventComment ? item.eventComment.replace(/"/g, '""') : '') + '"',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute(
    'download',
    'EquipmentHistory_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.csv',
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
</style>
