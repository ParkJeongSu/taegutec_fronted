<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$history" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">반송 명령 이력 조회</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            반송 &gt; 반송 이력 &gt; 반송 명령 이력
          </v-chip>
        </div>

        <div class="d-flex align-center action-button-group">
          <v-btn
            color="primary"
            variant="flat"
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
          <!-- 조회 시작일 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.startDate"
              label="조회 시작일"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>

          <!-- 조회 종료일 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.endDate"
              label="조회 종료일"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>

          <!-- 반송 명령 ID -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.transferCommandName"
              label="반송 명령 ID"
              placeholder="예: CMD-001"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 캐리어 ID -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.carrierName"
              label="캐리어 ID"
              placeholder="예: RGV-01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 명령 상태 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-select
              v-model="searchParams.commandStatus"
              :items="commandStatusFilterOptions"
              label="명령 상태"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 오더 타입 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-select
              v-model="searchParams.orderType"
              :items="orderTypeFilterOptions"
              label="오더 유형"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 현재 설비명 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.currentEquipmentName"
              label="현재 설비명"
              placeholder="예: CV-01, STK-01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 처리자 / 이벤트 사용자 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.eventUser"
              label="처리자(User)"
              placeholder="예: SYSTEM, ADMIN"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 검색 및 초기화 버튼 -->
          <v-col cols="12" sm="6" md="6" lg="4" class="d-flex align-center">
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

      <!-- 중앙 이력 데이터 테이블 (useDataTable 컴포저블 전담 연동) -->
      <BaseDataTable
        :headers="headers"
        :items="displayItems"
        :total-items="Number(totalItems)"
        :loading="loading"
        item-value="eventTimeKey"
        density="compact"
        v-on:update:options="onUpdateOptions"
        v-on:click:row="onRowClick"
      >
        <!-- 이벤트 일시 포맷팅 -->
        <template #[`item.eventTime`]="{ item }">
          <span class="font-weight-medium text-caption">{{ formatDateTime(item.eventTime) }}</span>
        </template>

        <!-- 이벤트 명 렌더링 -->
        <template #[`item.eventName`]="{ item }">
          <v-chip size="x-small" variant="tonal" color="indigo" class="font-weight-bold">
            {{ item.eventName || '-' }}
          </v-chip>
        </template>

        <!-- 반송 명령 ID 하이라이트 -->
        <template #[`item.transferCommandName`]="{ item }">
          <span class="font-weight-bold text-primary">{{ item.transferCommandName }}</span>
        </template>

        <!-- 캐리어 ID 렌더링 -->
        <template #[`item.carrierName`]="{ item }">
          <span v-if="item.carrierName" class="font-weight-medium">{{ item.carrierName }}</span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- 명령 상태 칩 -->
        <template #[`item.commandStatus`]="{ item }">
          <v-chip
            :color="getCommandStatusColor(item.commandStatus)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.commandStatus || '-' }}
          </v-chip>
        </template>

        <!-- 오더 유형 칩 -->
        <template #[`item.orderType`]="{ item }">
          <v-chip
            v-if="item.orderType"
            color="secondary"
            size="x-small"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ item.orderType }}
          </v-chip>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- 출발지 / 목적지 경로 표시 -->
        <template #[`item.source`]="{ item }">
          <span>{{ item.source || '-' }}</span>
        </template>

        <template #[`item.target`]="{ item }">
          <span>{{ item.target || '-' }}</span>
        </template>

        <!-- 서브 커맨드 상태 -->
        <template #[`item.subCommandStatus`]="{ item }">
          <span v-if="item.subCommandStatus" class="text-caption font-weight-medium">
            {{ item.subCommandStatus }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- 작업 시작 일시 포맷팅 -->
        <template #[`item.jobStartTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.jobStartTime) }}</span>
        </template>

        <!-- 작업 완료 일시 포맷팅 -->
        <template #[`item.jobCompletedTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.jobCompletedTime) }}</span>
        </template>

        <!-- 생성 일시 포맷팅 -->
        <template #[`item.createTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.createTime) }}</span>
        </template>

        <!-- 이벤트 코멘트 말줄임 처리 -->
        <template #[`item.eventComment`]="{ item }">
          <span :title="item.eventComment" class="comment-text-cell">
            {{ item.eventComment || '-' }}
          </span>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>조회된 반송 명령 이력 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>

    <!-- 상세 보기 다이얼로그 모달 -->
    <v-dialog v-model="isDetailDialogOpen" max-width="700px" scrollable>
      <v-card v-if="selectedDetailItem" class="rounded-lg">
        <v-card-item class="bg-primary-lighten py-3 px-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="$history" size="20" color="primary" class="mr-2" />
              <span class="text-subtitle-1 font-weight-bold text-high-emphasis">반송 명령 이력 상세</span>
            </div>
            <v-btn
              icon="$close"
              variant="text"
              size="small"
              density="compact"
              v-on:click="isDetailDialogOpen = false"
            ></v-btn>
          </div>
        </v-card-item>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-row density="compact">
            <v-col cols="12" sm="6">
              <div class="detail-label">이력 시간 Key</div>
              <div class="detail-value">{{ selectedDetailItem.eventTimeKey || '-' }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="detail-label">이벤트 일시</div>
              <div class="detail-value font-weight-medium">{{ formatDateTime(selectedDetailItem.eventTime) }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="detail-label">이벤트 명</div>
              <div class="detail-value">
                <v-chip size="x-small" variant="tonal" color="indigo" class="font-weight-bold">
                  {{ selectedDetailItem.eventName || '-' }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="detail-label">처리자 (User)</div>
              <div class="detail-value">{{ selectedDetailItem.eventUser || '-' }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="detail-label">반송 명령 ID</div>
              <div class="detail-value font-weight-bold text-primary">{{ selectedDetailItem.transferCommandName }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="detail-label">캐리어 ID</div>
              <div class="detail-value font-weight-medium">{{ selectedDetailItem.carrierName || '-' }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="detail-label">명령 상태</div>
              <div class="detail-value">
                <v-chip
                  :color="getCommandStatusColor(selectedDetailItem.commandStatus)"
                  size="x-small"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ selectedDetailItem.commandStatus || '-' }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="detail-label">오더 유형</div>
              <div class="detail-value">{{ selectedDetailItem.orderType || '-' }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="detail-label">출발지 (Source)</div>
              <div class="detail-value">{{ selectedDetailItem.source || '-' }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="detail-label">도착지 (Target)</div>
              <div class="detail-value">{{ selectedDetailItem.target || '-' }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="detail-label">현재 설비</div>
              <div class="detail-value">{{ selectedDetailItem.currentEquipmentName || '-' }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="detail-label">도착 설비</div>
              <div class="detail-value">{{ selectedDetailItem.targetEquipmentName || '-' }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="detail-label">서브 명령 번호</div>
              <div class="detail-value">{{ selectedDetailItem.subCommandJobNo != null ? selectedDetailItem.subCommandJobNo : '-' }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="detail-label">서브 명령 상태</div>
              <div class="detail-value">{{ selectedDetailItem.subCommandStatus || '-' }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="detail-label">작업 시작 일시</div>
              <div class="detail-value">{{ formatDateTime(selectedDetailItem.jobStartTime) }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="detail-label">작업 완료 일시</div>
              <div class="detail-value">{{ formatDateTime(selectedDetailItem.jobCompletedTime) }}</div>
            </v-col>

            <v-col cols="12" sm="6">
              <div class="detail-label">생성 일시</div>
              <div class="detail-value">{{ formatDateTime(selectedDetailItem.createTime) }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="detail-label">이벤트 코멘트</div>
              <div class="detail-value">{{ selectedDetailItem.eventComment || '-' }}</div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-3 justify-end">
          <v-btn variant="outlined" size="small" v-on:click="isDetailDialogOpen = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { useDataTable } from '@/composables/useDataTable'
import { fetchTransferCommandHistoriesApi } from '@/api/wcsTransferCommand'
import { formatDateTime } from '@/utils/dateUtils'

// 검색 파라미터 상태
const searchParams = reactive({
  startDate: '',
  endDate: '',
  transferCommandName: '',
  carrierName: '',
  commandStatus: '전체',
  orderType: '전체',
  currentEquipmentName: '',
  eventUser: '',
})

const commandStatusFilterOptions = [
  '전체',
  'INIT',
  'REQUESTED',
  'ASSIGNED',
  'EXECUTING',
  'COMPLETED',
  'ABORTED',
  'FAILED',
]

const orderTypeFilterOptions = [
  '전체',
  'STK_TO_WS',
  'WS_TO_STK',
  'WS_TO_WS',
  'STK_TO_STK',
  'DIRECT',
  'RELOCATION',
]

// 테이블 컬럼 정의
const headers = [
  { title: '이력 Key', key: 'eventTimeKey', align: 'start', width: '160px', sortable: true },
  { title: '이벤트 일시', key: 'eventTime', align: 'center', width: '160px', sortable: true },
  { title: '이벤트', key: 'eventName', align: 'center', width: '130px' },
  { title: '반송 명령 ID', key: 'transferCommandName', align: 'start', width: '150px' },
  { title: '캐리어 ID', key: 'carrierName', align: 'start', width: '110px' },
  { title: '명령 상태', key: 'commandStatus', align: 'center', width: '110px' },
  { title: '오더 유형', key: 'orderType', align: 'center', width: '110px' },
  { title: '현재 설비', key: 'currentEquipmentName', align: 'start', width: '110px' },
  { title: '출발지', key: 'source', align: 'start', width: '100px' },
  { title: '도착지', key: 'target', align: 'start', width: '100px' },
  { title: '도착 설비', key: 'targetEquipmentName', align: 'start', width: '110px' },
  { title: '서브 No', key: 'subCommandJobNo', align: 'center', width: '90px' },
  { title: '서브 상태', key: 'subCommandStatus', align: 'center', width: '100px' },
  { title: '작업 시작', key: 'jobStartTime', align: 'center', width: '160px' },
  { title: '작업 완료', key: 'jobCompletedTime', align: 'center', width: '160px' },
  { title: '생성 일시', key: 'createTime', align: 'center', width: '160px' },
  { title: '처리자', key: 'eventUser', align: 'center', width: '90px' },
  { title: '코멘트', key: 'eventComment', align: 'start', width: '150px' },
]

// 1. 역할 분리 아키텍처: 목록 조회 영역은 useDataTable 컴포저블 전담
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchTransferCommandHistoriesApi)

// 상세 보기 다이얼로그 상태
const isDetailDialogOpen = ref(false)
const selectedDetailItem = ref(null)

// 백엔드 스키마 명세에 맞추어 파라미터를 정제하는 함수
function getSanitizedParams() {
  const params = {}

  if (searchParams.transferCommandName && searchParams.transferCommandName.trim() !== '') {
    params.transferCommandName = searchParams.transferCommandName.trim()
  }
  if (searchParams.carrierName && searchParams.carrierName.trim() !== '') {
    params.carrierName = searchParams.carrierName.trim()
  }
  if (searchParams.commandStatus && searchParams.commandStatus !== '전체') {
    params.commandStatus = searchParams.commandStatus
  }
  if (searchParams.orderType && searchParams.orderType !== '전체') {
    params.orderType = searchParams.orderType
  }
  if (searchParams.currentEquipmentName && searchParams.currentEquipmentName.trim() !== '') {
    params.currentEquipmentName = searchParams.currentEquipmentName.trim()
  }
  if (searchParams.eventUser && searchParams.eventUser.trim() !== '') {
    params.eventUser = searchParams.eventUser.trim()
  }
  if (searchParams.startDate) {
    params.startDate = searchParams.startDate + 'T00:00:00'
  }
  if (searchParams.endDate) {
    params.endDate = searchParams.endDate + 'T23:59:59'
  }

  return params
}

// 데이터 정규화 및 바인딩 리스트 계산
const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      result.push({
        eventTimeKey: raw.eventTimeKey || '',
        transferCommandName: raw.transferCommandName || '',
        carrierName: raw.carrierName || '',
        commandStatus: raw.commandStatus || '',
        currentEquipmentName: raw.currentEquipmentName || '',
        orderType: raw.orderType || '',
        source: raw.source || '',
        target: raw.target || '',
        targetEquipmentName: raw.targetEquipmentName || '',
        subCommandJobNo: raw.subCommandJobNo,
        subCommandStatus: raw.subCommandStatus || '',
        jobStartTime: raw.jobStartTime || null,
        jobCompletedTime: raw.jobCompletedTime || null,
        createTime: raw.createTime || null,
        eventName: raw.eventName || '',
        eventTime: raw.eventTime || null,
        eventUser: raw.eventUser || '',
        eventComment: raw.eventComment || '',
      })
    }
  }

  return result
})

function getCommandStatusColor(status) {
  if (!status) return 'grey'
  const s = status.toUpperCase()
  if (s === 'COMPLETED' || s === 'SUCCESS') {
    return 'success'
  }
  if (s === 'EXECUTING' || s === 'ASSIGNED' || s === 'PROCESSING') {
    return 'info'
  }
  if (s === 'REQUESTED' || s === 'INIT' || s === 'WAITING') {
    return 'warning'
  }
  if (s === 'ABORTED' || s === 'FAILED' || s === 'ERROR' || s === 'CANCEL') {
    return 'error'
  }
  return 'grey'
}

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.startDate = ''
  searchParams.endDate = ''
  searchParams.transferCommandName = ''
  searchParams.carrierName = ''
  searchParams.commandStatus = '전체'
  searchParams.orderType = '전체'
  searchParams.currentEquipmentName = ''
  searchParams.eventUser = ''
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  if (itemData) {
    selectedDetailItem.value = itemData
    isDetailDialogOpen.value = true
  }
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 반송 명령 이력 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '이력Key,이벤트일시,이벤트명,반송명령ID,캐리어ID,명령상태,오더유형,현재설비,출발지,도착지,도착설비,서브No,서브상태,작업시작,작업완료,생성일시,처리자,코멘트\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.eventTimeKey || '',
      formatDateTime(item.eventTime),
      item.eventName || '',
      item.transferCommandName || '',
      item.carrierName || '',
      item.commandStatus || '',
      item.orderType || '',
      item.currentEquipmentName || '',
      item.source || '',
      item.target || '',
      item.targetEquipmentName || '',
      item.subCommandJobNo != null ? item.subCommandJobNo : '',
      item.subCommandStatus || '',
      formatDateTime(item.jobStartTime),
      formatDateTime(item.jobCompletedTime),
      formatDateTime(item.createTime),
      item.eventUser || '',
      '"' + (item.eventComment ? item.eventComment.replace(/"/g, '""') : '') + '"',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'TransferCommandHistory_' + new Date().toISOString().slice(0, 10) + '.csv')
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
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bg-primary-lighten {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.detail-label {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2px;
}

.detail-value {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
  word-break: break-all;
}
</style>
