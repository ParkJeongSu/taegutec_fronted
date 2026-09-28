<template>
  <div class="order-detail-view-container d-flex flex-column fill-height">
    <!-- 상세 정보 본문 영역 (스크롤 가능) -->
    <div class="flex-grow-1 overflow-y-auto pa-4">
      <!-- 1. 오더 기본 정보 카드 -->
      <v-card variant="outlined" class="mb-4 pa-4 rounded-lg bg-surface">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-icon
              :icon="detailData.transportType === 'O' ? '$trayArrowUp' : '$trayArrowDown'"
              size="28"
              :color="detailData.transportType === 'O' ? 'success' : 'primary'"
              class="mr-2"
            />
            <div>
              <div class="text-h6 font-weight-bold text-high-emphasis">
                {{ detailData.orderNo || '-' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ detailData.transportJobName || '반송 오더 작업' }}
              </div>
            </div>
          </div>
          <div class="d-flex align-center gap-1">
            <v-chip
              size="small"
              :color="detailData.transportType === 'O' ? 'success' : 'primary'"
              variant="tonal"
              class="font-weight-bold mr-1"
            >
              {{ detailData.transportType === 'O' ? '출고 (OUT)' : '입고 (IN)' }}
            </v-chip>
            <v-chip
              :color="getOrderStatusColor(detailData.status)"
              size="small"
              variant="flat"
              class="font-weight-bold"
            >
              {{ detailData.status || '-' }}
            </v-chip>
          </div>
        </div>

        <v-divider class="my-2"></v-divider>

        <v-row density="compact" class="mt-1">
          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.orderNo') }}</div>
            <div class="info-value font-weight-bold text-body-2 text-primary">{{ detailData.orderNo || '-' }}</div>
          </v-col>
          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('common.status') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.status || '-' }}</div>
          </v-col>
        </v-row>
      </v-card>

      <!-- 2. 물류 및 위치 정보 카드 -->
      <v-card variant="outlined" class="mb-4 pa-4 rounded-lg bg-surface">
        <div class="d-flex align-center mb-3">
          <v-icon icon="$mapMarkerRadius" size="20" color="primary" class="mr-2" />
          <span class="text-subtitle-2 font-weight-bold">물류 및 위치 정보</span>
        </div>

        <v-row density="comfortable">
          <!-- 트레이 / 캐리어 ID -->
          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.trayId') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              <v-chip v-if="detailData.trayId && detailData.trayId !== '-'" size="x-small" color="indigo" variant="tonal" class="font-weight-bold">
                {{ detailData.trayId }}
              </v-chip>
              <span v-else class="text-medium-emphasis">-</span>
            </div>
          </v-col>

          <!-- 자재 품목 코드 -->
          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.matCode') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.matCode || '-' }}</div>
          </v-col>

          <!-- 출발 위치 / 구역 -->
          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.source') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.sourceLocation || detailData.fromPosition || detailData.source || '-' }}</div>
          </v-col>

          <!-- 도착 위치 / 구역 -->
          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.target') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.targetLocation || detailData.toPosition || detailData.target || '-' }}</div>
          </v-col>

          <!-- 워크스테이션 / 설비 번호 -->
          <v-col cols="12" v-if="detailData.workStationId || detailData.wsNo">
            <div class="info-label text-caption text-medium-emphasis">워크스테이션 ID</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.workStationId || detailData.wsNo }}</div>
          </v-col>
        </v-row>
      </v-card>

      <!-- 3. 시간 및 에러 이력 카드 -->
      <v-card variant="outlined" class="pa-4 rounded-lg bg-surface">
        <div class="d-flex align-center mb-3">
          <v-icon icon="$history" size="20" color="primary" class="mr-2" />
          <span class="text-subtitle-2 font-weight-bold">시간 및 처리 이력</span>
        </div>

        <v-row density="comfortable">
          <!-- 발생 일시 -->
          <v-col cols="12" sm="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.occurredTime') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.timestamp || '-' }}</div>
          </v-col>

          <!-- 작업 시작 일시 -->
          <v-col cols="12" sm="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.jobStartTime') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.jobStartTime || detailData.startTime || '-' }}</div>
          </v-col>

          <!-- 작업 완료 일시 -->
          <v-col cols="12" sm="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.jobCompletedTime') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.jobCompletedTime || detailData.completedTime || '-' }}</div>
          </v-col>

          <!-- 에러 코드 -->
          <v-col cols="12" sm="6" v-if="detailData.errorCode">
            <div class="info-label text-caption text-medium-emphasis">에러 코드</div>
            <div class="info-value font-weight-bold text-error">{{ detailData.errorCode }}</div>
          </v-col>

          <!-- 에러 상세 / 코멘트 -->
          <v-col cols="12" v-if="detailData.errorText || detailData.eventComment || detailData.description">
            <div class="info-label text-caption text-medium-emphasis">에러 내용 / 비고</div>
            <div class="info-value text-body-2 text-error pa-2 bg-red-lighten-5 rounded mt-1">
              {{ detailData.errorText || detailData.eventComment || detailData.description }}
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <v-divider></v-divider>

    <!-- 하단 액션 버튼 영역 (조회 전용: 닫기 버튼 1개만 배치) -->
    <v-card-actions class="pa-4 action-buttons-container">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" color="secondary" v-on:click="onClose">
        {{ $t('common.close') }}
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

const panelStore = usePanelStore()

const detailData = reactive({
  orderNo: '',
  transportJobName: '',
  transportType: 'I',
  status: '',
  trayId: '',
  matCode: '',
  sourceLocation: '',
  targetLocation: '',
  fromPosition: '',
  toPosition: '',
  source: '',
  target: '',
  workStationId: '',
  wsNo: '',
  timestamp: '',
  jobStartTime: '',
  startTime: '',
  jobCompletedTime: '',
  completedTime: '',
  errorCode: '',
  errorText: '',
  eventComment: '',
  description: '',
})

function resetData() {
  detailData.orderNo = ''
  detailData.transportJobName = ''
  detailData.transportType = 'I'
  detailData.status = ''
  detailData.trayId = ''
  detailData.matCode = ''
  detailData.sourceLocation = ''
  detailData.targetLocation = ''
  detailData.fromPosition = ''
  detailData.toPosition = ''
  detailData.source = ''
  detailData.target = ''
  detailData.workStationId = ''
  detailData.wsNo = ''
  detailData.timestamp = ''
  detailData.jobStartTime = ''
  detailData.startTime = ''
  detailData.jobCompletedTime = ''
  detailData.completedTime = ''
  detailData.errorCode = ''
  detailData.errorText = ''
  detailData.eventComment = ''
  detailData.description = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      detailData.orderNo = newVal.orderNo || newVal.transportOrderNo || newVal.transportOrderId || newVal.orderId || ''
      detailData.transportJobName = newVal.transportJobName || newVal.jobName || ''
      detailData.transportType = newVal.transportType || (newVal.orderType && newVal.orderType.startsWith('WS_TO') ? 'O' : 'I')
      detailData.status = newVal.status || newVal.transportStatus || newVal.orderStatus || ''
      detailData.trayId = newVal.trayId || newVal.carrierId || newVal.palletId || newVal.trayNo || ''
      detailData.matCode = newVal.matCode || newVal.materialCode || newVal.itemCode || ''
      detailData.sourceLocation = newVal.sourceLocation || newVal.fromPosition || newVal.source || ''
      detailData.targetLocation = newVal.targetLocation || newVal.toPosition || newVal.target || ''
      detailData.fromPosition = newVal.fromPosition || ''
      detailData.toPosition = newVal.toPosition || ''
      detailData.source = newVal.source || ''
      detailData.target = newVal.target || ''
      detailData.workStationId = newVal.workStationId || newVal.wsNo || ''
      detailData.wsNo = newVal.wsNo || ''
      detailData.timestamp = newVal.timestamp || newVal.createdTime || newVal.createDt || newVal.eventTime || ''
      detailData.jobStartTime = newVal.jobStartTime || newVal.startTime || ''
      detailData.startTime = newVal.startTime || ''
      detailData.jobCompletedTime = newVal.jobCompletedTime || newVal.completedTime || ''
      detailData.completedTime = newVal.completedTime || ''
      detailData.errorCode = newVal.errorCode || ''
      detailData.errorText = newVal.errorText || newVal.errorMsg || newVal.eventComment || ''
      detailData.eventComment = newVal.eventComment || newVal.description || ''
      detailData.description = newVal.description || ''
    } else {
      resetData()
    }
  },
  { immediate: true },
)

function getOrderStatusColor(status) {
  if (!status) return 'grey'
  const s = String(status).toUpperCase()
  if (s === 'COMPLETED' || s === 'SUCCESS' || s === 'DONE') return 'success'
  if (s === 'RUNNING' || s === 'EXECUTING' || s === 'ASSIGNED' || s === 'PROCESSING') return 'info'
  if (s === 'INIT' || s === 'REQUESTED' || s === 'WAITING' || s === 'PENDING') return 'warning'
  if (s === 'ERROR' || s === 'FAILED' || s === 'ABORTED' || s === 'CANCEL') return 'error'
  return 'grey'
}

function onClose() {
  panelStore.closePanel()
}
</script>

<style scoped>
.order-detail-view-container {
  height: 100%;
}
.action-buttons-container {
  background-color: #fafafa;
}
.info-label {
  margin-bottom: 2px;
}
.info-value {
  word-break: break-all;
}
.gap-1 {
  gap: 4px;
}
</style>
