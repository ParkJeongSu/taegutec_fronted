<template>
  <div class="order-detail-view-container d-flex flex-column fill-height">
    <!-- 상세 정보 본문 영역 (스크롤 가능) -->
    <div class="flex-grow-1 overflow-y-auto pa-4">
      <!-- 1. 오더 기본 정보 카드 -->
      <v-card variant="outlined" class="mb-4 pa-4 rounded-lg bg-surface border-card">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-icon
              :icon="detailData.transportType === 'O' ? '$trayArrowUp' : '$trayArrowDown'"
              size="28"
              :color="detailData.transportType === 'O' ? 'success' : 'primary'"
              class="mr-2"
            />
            <div>
              <div class="text-h6 font-weight-bold order-title-text">
                {{ detailData.transportOrderId || '-' }}
              </div>
              <div class="text-caption job-sub-text">
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
              :color="getOrderStatusColor(detailData.transportStatus)"
              size="small"
              variant="flat"
              class="font-weight-bold"
            >
              {{ detailData.transportStatus || '-' }}
            </v-chip>
          </div>
        </div>

        <v-divider class="my-2"></v-divider>

        <v-row density="compact" class="mt-1">
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.orderNo') }}</div>
            <div class="info-value font-weight-bold text-body-2 text-primary">
              {{ detailData.transportOrderId || '-' }}
            </div>
          </v-col>
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.idocId') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.idocId || '-' }}
            </div>
          </v-col>
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.status') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              <v-chip
                :color="getOrderStatusColor(detailData.transportStatus)"
                size="x-small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ detailData.transportStatus || '-' }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.priority') || '우선순위' }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.priority != null ? detailData.priority : '-' }}
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- 2. 물류 및 위치 정보 카드 -->
      <v-card variant="outlined" class="mb-4 pa-4 rounded-lg bg-surface border-card">
        <div class="d-flex align-center mb-3">
          <v-icon icon="$mapMarkerRadius" size="20" color="primary" class="mr-2" />
          <span class="text-subtitle-2 font-weight-bold section-title-text">물류 및 위치 정보</span>
        </div>

        <v-row density="comfortable">
          <!-- 트레이 / 캐리어 ID -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.trayId') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              <v-chip
                v-if="detailData.carrierName && detailData.carrierName !== '-'"
                size="x-small"
                color="indigo"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ detailData.carrierName }}
              </v-chip>
              <span v-else class="text-muted">-</span>
            </div>
          </v-col>

          <!-- 캐리어 타입 -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.carrierType') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.carrierType || 'TBD' }}
            </div>
          </v-col>

          <!-- GAL ID -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.galId') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.galId || '-' }}
            </div>
          </v-col>

          <!-- GAL 창고 -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.galWarehouse') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.galWarehouse || '-' }}
            </div>
          </v-col>

          <!-- 워크스테이션 ID -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.workStationId') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.workStationId || '-' }}
            </div>
          </v-col>

          <!-- 컨베이어 / 로케이션 위치 -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.locationId') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.locationId || '-' }}
            </div>
          </v-col>

          <!-- 출발 존 / 목적지 존 -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.sourceZone') || '출발 존' }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.sourceZoneName || '-' }}
            </div>
          </v-col>
          <v-col cols="6">
            <div class="info-label text-caption">
              {{ $t('table.destinationZone') || '목적지 존' }}
            </div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.destinationZoneName || '-' }}
            </div>
          </v-col>

          <!-- 요청 존 -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.requestedZoneName') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.requestedZoneName || '-' }}
            </div>
          </v-col>

          <!-- 주행 프로파일 -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.travelProfile') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.travelProfile || '-' }}
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- 3. 시간 및 이벤트 처리 이력 카드 -->
      <v-card variant="outlined" class="pa-4 rounded-lg bg-surface border-card">
        <div class="d-flex align-center mb-3">
          <v-icon icon="$history" size="20" color="primary" class="mr-2" />
          <span class="text-subtitle-2 font-weight-bold section-title-text">시간 및 처리 이력</span>
        </div>

        <v-row density="comfortable">
          <!-- 생성 일시 -->
          <v-col cols="12" sm="6">
            <div class="info-label text-caption">{{ $t('table.createTime') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ formatDateTime(detailData.createTime) }}
            </div>
          </v-col>

          <!-- 릴리즈 일시 -->
          <v-col cols="12" sm="6">
            <div class="info-label text-caption">
              {{ $t('table.releaseTime') || '릴리즈 일시' }}
            </div>
            <div class="info-value font-weight-medium text-body-2">
              {{ formatDateTime(detailData.releaseTime) }}
            </div>
          </v-col>

          <!-- 완료 일시 -->
          <v-col cols="12" sm="6">
            <div class="info-label text-caption">{{ $t('table.completeTime') || '완료 일시' }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ formatDateTime(detailData.completeTime) }}
            </div>
          </v-col>

          <!-- 회수 일시 -->
          <v-col cols="12" sm="6">
            <div class="info-label text-caption">
              {{ $t('table.retrievalTime') || '회수 일시' }}
            </div>
            <div class="info-value font-weight-medium text-body-2">
              {{ formatDateTime(detailData.retrievalTime) }}
            </div>
          </v-col>

          <!-- 생성자 / 이벤트 사용자 -->
          <v-col cols="6">
            <div class="info-label text-caption">{{ $t('table.createUser') || '생성자' }}</div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.createUser || '-' }}
            </div>
          </v-col>
          <v-col cols="6">
            <div class="info-label text-caption">
              {{ $t('table.eventUser') || '이벤트 사용자' }}
            </div>
            <div class="info-value font-weight-medium text-body-2">
              {{ detailData.eventUser || '-' }}
            </div>
          </v-col>

          <!-- 에러 상세 / 비고 코멘트 -->
          <v-col
            cols="12"
            v-if="detailData.errorText || detailData.eventComment || detailData.description"
          >
            <div class="info-label text-caption">에러 내용 / 코멘트</div>
            <div
              class="info-value text-body-2 pa-3 rounded mt-1"
              :class="detailData.errorText ? 'error-box' : 'comment-box'"
            >
              {{ detailData.errorText || detailData.eventComment || detailData.description }}
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <v-divider></v-divider>

    <!-- 하단 액션 버튼 영역 -->
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
  id: '',
  transportOrderId: '',
  idocId: '',
  transportJobName: '',
  transportType: 'I',
  transportStatus: '',
  carrierName: '',
  carrierType: 'TBD',
  priority: null,
  galId: '',
  galWarehouse: '',
  locationId: '',
  workStationId: '',
  sourceZoneName: '',
  destinationZoneName: '',
  requestedZoneName: '',
  travelProfile: '',
  createTime: '',
  releaseTime: '',
  completeTime: '',
  retrievalTime: '',
  createUser: '',
  releaseUser: '',
  completeUser: '',
  eventName: '',
  eventTime: '',
  eventUser: '',
  eventComment: '',
  errorText: '',
  description: '',
})

function resetData() {
  detailData.id = ''
  detailData.transportOrderId = ''
  detailData.idocId = ''
  detailData.transportJobName = ''
  detailData.transportType = 'I'
  detailData.transportStatus = ''
  detailData.carrierName = ''
  detailData.carrierType = 'TBD'
  detailData.priority = null
  detailData.galId = ''
  detailData.galWarehouse = ''
  detailData.locationId = ''
  detailData.workStationId = ''
  detailData.sourceZoneName = ''
  detailData.destinationZoneName = ''
  detailData.requestedZoneName = ''
  detailData.travelProfile = ''
  detailData.createTime = ''
  detailData.releaseTime = ''
  detailData.completeTime = ''
  detailData.retrievalTime = ''
  detailData.createUser = ''
  detailData.releaseUser = ''
  detailData.completeUser = ''
  detailData.eventName = ''
  detailData.eventTime = ''
  detailData.eventUser = ''
  detailData.eventComment = ''
  detailData.errorText = ''
  detailData.description = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      detailData.id = newVal.id != null ? String(newVal.id) : ''
      detailData.transportOrderId =
        newVal.transportOrderId || newVal.orderNo || newVal.transportOrderNo || newVal.orderId || ''
      detailData.idocId = newVal.idocId != null ? String(newVal.idocId) : ''
      detailData.transportJobName = newVal.transportJobName || newVal.jobName || ''
      detailData.transportType = newVal.transportType || 'I'
      detailData.transportStatus =
        newVal.transportStatus || newVal.status || newVal.orderStatus || ''
      detailData.carrierName =
        newVal.carrierName || newVal.trayId || newVal.carrierId || newVal.palletId || ''
      detailData.carrierType = newVal.carrierType || 'TBD'
      detailData.priority = newVal.priority != null ? newVal.priority : null
      detailData.galId = newVal.galId != null ? String(newVal.galId) : ''
      detailData.galWarehouse = newVal.galWarehouse || ''
      detailData.locationId = newVal.locationId || newVal.location || ''
      detailData.workStationId = newVal.workStationId || newVal.wsNo || ''
      detailData.sourceZoneName = newVal.sourceZoneName || ''
      detailData.destinationZoneName = newVal.destinationZoneName || ''
      detailData.requestedZoneName = newVal.requestedZoneName || newVal.targetZone || ''
      detailData.travelProfile = newVal.travelProfile || ''
      detailData.createTime = newVal.createTime || newVal.timestamp || ''
      detailData.releaseTime = newVal.releaseTime || ''
      detailData.completeTime = newVal.completeTime || ''
      detailData.retrievalTime = newVal.retrievalTime || ''
      detailData.createUser = newVal.createUser || ''
      detailData.releaseUser = newVal.releaseUser || ''
      detailData.completeUser = newVal.completeUser || ''
      detailData.eventName = newVal.eventName || ''
      detailData.eventTime = newVal.eventTime || ''
      detailData.eventUser = newVal.eventUser || ''
      detailData.eventComment = newVal.eventComment || ''
      detailData.errorText = newVal.errorText || ''
      detailData.description = newVal.description || ''
    } else {
      resetData()
    }
  },
  { immediate: true },
)

function formatDateTime(val) {
  if (!val) {
    return '-'
  }
  const s = String(val)
  return s.replace('T', ' ').substring(0, 19)
}

function getOrderStatusColor(status) {
  if (!status) {
    return 'grey'
  }
  const s = String(status).toUpperCase()
  if (s === 'COMPLETED' || s === 'SUCCESS' || s === 'DONE') {
    return 'success'
  }
  if (s === 'STARTED' || s === 'RUNNING' || s === 'PROCESSING' || s === 'ACCEPTED') {
    return 'primary'
  }
  if (s === 'CREATED' || s === 'REQUESTED' || s === 'WAITING' || s === 'PENDING') {
    return 'warning'
  }
  if (s === 'ERROR' || s === 'FAILED' || s === 'ABORTED' || s === 'CANCEL') {
    return 'error'
  }
  return 'grey'
}

function onClose() {
  panelStore.closePanel()
}
</script>

<style scoped>
.order-detail-view-container {
  height: 100%;
  background-color: #ffffff;
}

.border-card {
  border: 1px solid #e2e8f0 !important;
  background-color: #ffffff !important;
}

.action-buttons-container {
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

/* 텍스트 시인성 강제 지정 */
.order-title-text {
  color: #0f172a !important; /* 선명한 블랙 차콜 */
}

.job-sub-text {
  color: #64748b !important; /* 슬레이트 그레이 */
}

.section-title-text {
  color: #1e293b !important; /* 다크 네이비 차콜 */
}

.info-label {
  color: #64748b !important; /* 라벨: 부드러운 슬레이트 그레이 */
  font-weight: 500 !important;
  margin-bottom: 2px;
}

.info-value {
  color: #0f172a !important; /* 실제 값: 또렷한 다크 차콜 */
  word-break: break-all;
}

.text-muted {
  color: #94a3b8 !important;
}

.error-box {
  background-color: #fef2f2 !important;
  border: 1px solid #fecaca !important;
  color: #dc2626 !important;
}

.comment-box {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #334155 !important;
}

.gap-1 {
  gap: 4px;
}
</style>
