<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$history" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">Order 이력 조회</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            생산 &gt; 이력 &gt; Order 이력 조회
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

          <!-- 2. Order ID 검색 필드 (기본값: '1') -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.orderId"
              label="Order ID"
              placeholder="Order ID 입력 (예: 1, ORD-20261001-01)"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 3. Carrier ID 검색 필드 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.carrierId"
              label="Carrier ID"
              placeholder="투입/배출 Carrier ID"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 4. 조업 상태 필터 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-select
              v-model="searchParams.operationStatus"
              :items="statusOptions"
              label="조업 상태"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 5. 조회 시작일 -->
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

          <!-- 6. 조회 종료일 -->
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

          <!-- 7. 검색 및 초기화 버튼 -->
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
        <!-- 1. 이력 일시 포맷팅 -->
        <template #[`item.eventTime`]="{ item }">
          <span class="text-caption font-weight-medium">
            {{ formatDateTime(item.eventTime) }}
          </span>
        </template>

        <!-- 2. Order ID 하이라이트 -->
        <template #[`item.orderId`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.orderId }}</span>
        </template>

        <!-- 3. 설비명 칩 -->
        <template #[`item.equipmentName`]="{ item }">
          <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
            {{ item.equipmentName }}
          </v-chip>
        </template>

        <!-- 4. 공정/설비 타입 -->
        <template #[`item.equipmentType`]="{ item }">
          <span class="text-caption text-medium-emphasis">{{ item.equipmentType }}</span>
        </template>

        <!-- 5. 조업 상태 칩 (START: info / COMPLETE: success / ABORT: error) -->
        <template #[`item.operationStatus`]="{ item }">
          <v-chip
            size="x-small"
            :color="getOperationStatusColor(item.operationStatus)"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.operationStatus }}
          </v-chip>
        </template>

        <!-- 6. 투입 Carrier ID -->
        <template #[`item.inCarrierId`]="{ item }">
          <div class="d-flex align-center">
            <v-icon icon="$trayArrowDown" size="14" color="primary" class="mr-1" />
            <span class="font-weight-medium text-primary">{{ item.inCarrierId || '-' }}</span>
          </div>
        </template>

        <!-- 7. 배출 Carrier ID -->
        <template #[`item.outCarrierId`]="{ item }">
          <div class="d-flex align-center">
            <v-icon
              v-if="item.outCarrierId && item.outCarrierId !== '-'"
              icon="$trayArrowUp"
              size="14"
              color="success"
              class="mr-1"
            />
            <span
              :class="
                item.outCarrierId && item.outCarrierId !== '-'
                  ? 'font-weight-bold text-success'
                  : 'text-medium-emphasis'
              "
            >
              {{ item.outCarrierId || '-' }}
            </span>
          </div>
        </template>

        <!-- 8. Batch LOT -->
        <template #[`item.batchLot`]="{ item }">
          <span class="font-weight-medium text-high-emphasis">{{ item.batchLot || '-' }}</span>
        </template>

        <!-- 9. 중량 (t) -->
        <template #[`item.weight`]="{ item }">
          <span class="font-weight-bold">
            {{ item.weight != null ? Number(item.weight).toFixed(2) + ' t' : '-' }}
          </span>
        </template>

        <!-- 10. 작업자 -->
        <template #[`item.eventUser`]="{ item }">
          <span class="text-caption">{{ item.eventUser || '-' }}</span>
        </template>

        <!-- 11. 비고 / 사유 -->
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
import { fetchOrderHistoryApi } from '@/api/production'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { formatDateTime } from '@/utils/dateUtils'

// ==========================================
// 1. 검색 파라미터 및 필터 옵션
// ==========================================
const searchParams = reactive({
  equipmentName: '전체',
  orderId: '1',
  carrierId: '',
  operationStatus: '전체',
  startDate: '',
  endDate: '',
})

const equipmentOptions = [
  '전체',
  'MIX-01',
  'MIX-02',
  'RED-01',
  'RED-02',
  'CRB-01',
  'BLD-01',
  'BLD-03',
  'SCR-01',
  'INC-01',
  'INC-02',
  'DOP-01',
  'DEA-01',
  'PCK-01',
]

const statusOptions = ['전체', 'START', 'COMPLETE', 'ABORT']

// ==========================================
// 2. 테이블 헤더 정의
// ==========================================
const headers = [
  { title: '이력 일시', key: 'eventTime', width: '150px', align: 'start' },
  { title: 'Order ID', key: 'orderId', width: '130px', align: 'start' },
  { title: '설비명', key: 'equipmentName', width: '110px', align: 'center' },
  { title: '공정 타입', key: 'equipmentType', width: '120px', align: 'start' },
  { title: '조업 상태', key: 'operationStatus', width: '105px', align: 'center' },
  { title: '투입 Carrier ID', key: 'inCarrierId', width: '130px', align: 'start' },
  { title: '배출 Carrier ID', key: 'outCarrierId', width: '130px', align: 'start' },
  { title: 'Batch LOT', key: 'batchLot', width: '150px', align: 'start' },
  { title: '중량(톤)', key: 'weight', width: '95px', align: 'end' },
  { title: '작업자', key: 'eventUser', width: '115px', align: 'center' },
  { title: '비고 / 사유', key: 'eventComment', align: 'start' },
]

// ==========================================
// 3. useDataTable 연동
// ==========================================
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchOrderHistoryApi)

function getSanitizedParams() {
  const params = {}
  if (searchParams.equipmentName && searchParams.equipmentName !== '전체') {
    params.equipmentName = searchParams.equipmentName
  }
  if (searchParams.orderId && searchParams.orderId.trim() !== '') {
    params.orderId = searchParams.orderId.trim()
  }
  if (searchParams.carrierId && searchParams.carrierId.trim() !== '') {
    params.carrierId = searchParams.carrierId.trim()
  }
  if (searchParams.operationStatus && searchParams.operationStatus !== '전체') {
    params.operationStatus = searchParams.operationStatus
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
        orderId: raw.orderId || '',
        equipmentName: raw.equipmentName || '',
        equipmentType: raw.equipmentType || '',
        operationStatus: raw.operationStatus || '',
        inCarrierId: raw.inCarrierId || '-',
        outCarrierId: raw.outCarrierId || '-',
        batchLot: raw.batchLot || '-',
        weight: raw.weight != null ? raw.weight : 0,
        eventUser: raw.eventUser || '-',
        eventComment: raw.eventComment || '',
      })
    }
  }

  return result
})

function getOperationStatusColor(status) {
  if (!status) return 'grey'
  const s = String(status).toUpperCase()
  if (s === 'COMPLETE' || s === 'SUCCESS' || s === 'COMPLETED') return 'success'
  if (s === 'START' || s === 'RUN' || s === 'PROCESSING') return 'info'
  if (s === 'ABORT' || s === 'ERROR' || s === 'FAILED' || s === 'ALARM') return 'error'
  return 'grey'
}

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.equipmentName = '전체'
  searchParams.orderId = '1'
  searchParams.carrierId = ''
  searchParams.operationStatus = '전체'
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
    '이력일시,OrderID,설비명,공정타입,조업상태,투입CarrierID,배출CarrierID,BatchLOT,중량(톤),작업자,비고\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      formatDateTime(item.eventTime),
      item.orderId || '',
      item.equipmentName || '',
      item.equipmentType || '',
      item.operationStatus || '',
      item.inCarrierId || '',
      item.outCarrierId || '',
      item.batchLot || '',
      item.weight != null ? Number(item.weight).toFixed(2) : '',
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
    'OrderHistory_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.csv',
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
