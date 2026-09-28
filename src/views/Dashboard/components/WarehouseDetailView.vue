<template>
  <div class="detail-view-container d-flex flex-column fill-height">
    <!-- 상세 정보 본문 영역 (스크롤 가능) -->
    <div class="flex-grow-1 overflow-y-auto pa-4">
      <!-- 1. 기본 헤더 정보 카드 -->
      <v-card variant="outlined" class="mb-4 pa-4 rounded-lg bg-surface">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-icon icon="$robotIndustrial" size="28" color="primary" class="mr-2" />
            <div>
              <div class="text-h6 font-weight-bold text-high-emphasis">
                {{ detailData.stockerName || '-' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ detailData.areaName || detailData.stockerName || '-' }}
              </div>
            </div>
          </div>
          <v-chip
            :color="getStatusColor(detailData.stockerStatus)"
            size="small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ detailData.stockerStatus || 'IDLE' }}
          </v-chip>
        </div>

        <v-divider class="my-2"></v-divider>

        <v-row density="compact" class="mt-1">
          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.factoryName') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.factoryName || '-' }}</div>
          </v-col>
          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.stockerCode') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.stockerName || '-' }}</div>
          </v-col>
        </v-row>
      </v-card>

      <!-- 2. 쉘프 적재 현황 카드 -->
      <v-card variant="outlined" class="mb-4 pa-4 rounded-lg bg-surface">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-icon icon="$packageVariant" size="20" color="primary" class="mr-2" />
            <span class="text-subtitle-2 font-weight-bold">쉘프 적재 현황</span>
          </div>
          <span class="text-subtitle-2 font-weight-bold" :class="getRateTextColor(detailData.occupancyRate)">
            {{ detailData.occupancyRate || 0 }}%
          </span>
        </div>

        <!-- 프로그레스 바 -->
        <v-progress-linear
          :model-value="detailData.occupancyRate || 0"
          :color="getRateColor(detailData.occupancyRate)"
          height="14"
          rounded
          class="mb-4"
        ></v-progress-linear>

        <!-- 수치 그리드 -->
        <v-row density="compact" class="text-center">
          <v-col cols="4">
            <div class="pa-2 rounded bg-grey-lighten-4">
              <div class="text-caption text-medium-emphasis">{{ $t('table.totalShelfCount') }}</div>
              <div class="text-h6 font-weight-bold text-high-emphasis">
                {{ formatNumber(detailData.totalShelfCount) }}
              </div>
            </div>
          </v-col>
          <v-col cols="4">
            <div class="pa-2 rounded bg-blue-lighten-5">
              <div class="text-caption text-primary font-weight-medium">{{ $t('table.useShelfCount') }}</div>
              <div class="text-h6 font-weight-bold text-primary">
                {{ formatNumber(detailData.useShelfCount) }}
              </div>
            </div>
          </v-col>
          <v-col cols="4">
            <div class="pa-2 rounded bg-grey-lighten-4">
              <div class="text-caption text-medium-emphasis">{{ $t('table.emptyShelfCount') }}</div>
              <div class="text-h6 font-weight-bold text-medium-emphasis">
                {{ formatNumber(detailData.emptyShelfCount) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- 3. 상태 및 진단 정보 카드 -->
      <v-card variant="outlined" class="pa-4 rounded-lg bg-surface">
        <div class="d-flex align-center mb-3">
          <v-icon icon="$informationOutline" size="20" color="primary" class="mr-2" />
          <span class="text-subtitle-2 font-weight-bold">상태 및 진단 정보</span>
        </div>

        <v-row density="comfortable">
          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.equipmentStatus') }}</div>
            <div class="info-value font-weight-medium text-body-2">
              <v-chip size="x-small" :color="getStatusColor(detailData.stockerStatus)" variant="flat">
                {{ detailData.stockerStatus || 'IDLE' }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">통신 상태</div>
            <div class="info-value font-weight-medium text-body-2">
              <v-chip size="x-small" color="success" variant="tonal">
                ONLINE
              </v-chip>
            </div>
          </v-col>

          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.eventUser') }}</div>
            <div class="info-value font-weight-medium text-body-2">{{ detailData.eventUser || 'SYSTEM' }}</div>
          </v-col>

          <v-col cols="6">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('table.eventTime') }}</div>
            <div class="info-value font-weight-medium text-caption">{{ detailData.eventTime || detailData.updateTime || '-' }}</div>
          </v-col>

          <v-col cols="12" v-if="detailData.eventComment || detailData.description">
            <div class="info-label text-caption text-medium-emphasis">{{ $t('common.comment') }}</div>
            <div class="info-value text-body-2 text-medium-emphasis pa-2 bg-grey-lighten-4 rounded mt-1">
              {{ detailData.eventComment || detailData.description }}
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
  factoryName: '',
  stockerName: '',
  areaName: '',
  totalShelfCount: 0,
  useShelfCount: 0,
  emptyShelfCount: 0,
  occupancyRate: 0,
  stockerStatus: 'IDLE',
  eventUser: '',
  eventTime: '',
  updateTime: '',
  eventComment: '',
  description: '',
})

function resetData() {
  detailData.factoryName = ''
  detailData.stockerName = ''
  detailData.areaName = ''
  detailData.totalShelfCount = 0
  detailData.useShelfCount = 0
  detailData.emptyShelfCount = 0
  detailData.occupancyRate = 0
  detailData.stockerStatus = 'IDLE'
  detailData.eventUser = ''
  detailData.eventTime = ''
  detailData.updateTime = ''
  detailData.eventComment = ''
  detailData.description = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      const total = Number(newVal.totalShelfCount || newVal.totalSlots) || 0
      const used = Number(newVal.useShelfCount || newVal.usedSlots) || 0
      const empty = Number(newVal.emptyShelfCount) || (total >= used ? total - used : 0)
      let rate = Number(newVal.occupancyRate) || 0
      if (!rate && total > 0) {
        rate = Math.round((used / total) * 100)
      }

      detailData.factoryName = newVal.factoryName || 'INSERT'
      detailData.stockerName = newVal.stockerName || newVal.stockerId || ''
      detailData.areaName = newVal.areaName || newVal.stockerName || ''
      detailData.totalShelfCount = total
      detailData.useShelfCount = used
      detailData.emptyShelfCount = empty
      detailData.occupancyRate = rate
      detailData.stockerStatus = newVal.stockerStatus || newVal.status || 'IDLE'
      detailData.eventUser = newVal.eventUser || '-'
      detailData.eventTime = newVal.eventTime || newVal.updateTime || '-'
      detailData.updateTime = newVal.updateTime || '-'
      detailData.eventComment = newVal.eventComment || newVal.description || ''
      detailData.description = newVal.description || ''
    } else {
      resetData()
    }
  },
  { immediate: true },
)

function getStatusColor(status) {
  if (status === 'RUNNING' || status === 'ONLINE') return 'success'
  if (status === 'IDLE' || status === 'AUTO') return 'info'
  if (status === 'ERROR' || status === 'DOWN') return 'error'
  if (status === 'OFFLINE' || status === 'MANUAL') return 'warning'
  return 'grey'
}

function getRateColor(rate) {
  const val = Number(rate) || 0
  if (val >= 90) return 'error'
  if (val >= 70) return 'warning'
  return 'primary'
}

function getRateTextColor(rate) {
  const val = Number(rate) || 0
  if (val >= 90) return 'text-error'
  if (val >= 70) return 'text-warning'
  return 'text-primary'
}

function formatNumber(val) {
  if (val === null || val === undefined) return '0'
  return Number(val).toLocaleString()
}

function onClose() {
  panelStore.closePanel()
}
</script>

<style scoped>
.detail-view-container {
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
</style>
