<template>
  <div class="detail-container d-flex flex-column fill-height">
    <!-- 상세 정보 본문 영역 -->
    <div class="flex-grow-1 overflow-y-auto pa-4">
      <v-card variant="outlined" class="mb-4 pa-4 bg-grey-lighten-5 rounded-lg border">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-caption text-medium-emphasis">이벤트 타임 키</span>
          <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
            {{ detailData.eventTimeKey || '-' }}
          </v-chip>
        </div>
        <div class="text-h6 font-weight-bold text-primary mb-1">
          {{ detailData.transferCommandName || '-' }}
        </div>
        <div class="text-caption text-medium-emphasis">
          {{ formatDateTime(detailData.eventTime) }} ({{ detailData.eventName || 'EVENT' }})
        </div>
      </v-card>

      <!-- 정보 필드 그리드 -->
      <v-row density="compact">
        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">캐리어 ID</div>
            <div class="info-value font-weight-bold">{{ detailData.carrierName || '-' }}</div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">명령 상태</div>
            <div class="info-value">
              <v-chip
                :color="getCommandStatusColor(detailData.commandStatus)"
                size="x-small"
                variant="flat"
                class="font-weight-bold"
              >
                {{ detailData.commandStatus || '-' }}
              </v-chip>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">오더 유형</div>
            <div class="info-value">{{ detailData.orderType || '-' }}</div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">현재 설비</div>
            <div class="info-value font-weight-medium">
              {{ detailData.currentEquipmentName || '-' }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">출발지 (Source)</div>
            <div class="info-value text-teal-darken-2 font-weight-bold">
              {{ detailData.source || '-' }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">목적지 (Target)</div>
            <div class="info-value text-primary-darken-2 font-weight-bold">
              {{ detailData.target || '-' }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">목적지 설비</div>
            <div class="info-value">{{ detailData.targetEquipmentName || '-' }}</div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">서브 작업 번호 / 상태</div>
            <div class="info-value">
              {{ detailData.subCommandJobNo || '-' }}
              <span v-if="detailData.subCommandStatus">({{ detailData.subCommandStatus }})</span>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">작업 시작 일시</div>
            <div class="info-value text-caption">{{ formatDateTime(detailData.jobStartTime) }}</div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">작업 완료 일시</div>
            <div class="info-value text-caption">
              {{ formatDateTime(detailData.jobCompletedTime) }}
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">명령 생성 일시</div>
            <div class="info-value text-caption">{{ formatDateTime(detailData.createTime) }}</div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="info-block">
            <div class="info-label">처리자 (Operator)</div>
            <div class="info-value">{{ detailData.eventUser || '-' }}</div>
          </div>
        </v-col>

        <v-col cols="12">
          <div class="info-block mt-2">
            <div class="info-label">이벤트 비고 / 사유</div>
            <div class="info-value comment-box pa-3 rounded bg-grey-lighten-4 mt-1">
              {{ detailData.eventComment || '등록된 사유가 없습니다.' }}
            </div>
          </div>
        </v-col>
      </v-row>
    </div>

    <v-divider></v-divider>

    <!-- 하단 닫기 버튼 영역 -->
    <v-card-actions class="pa-4 bg-grey-lighten-5">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" color="secondary" v-on:click="onClose">
        {{ $t('common.close') || '닫기' }}
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { formatDateTime } from '@/utils/dateUtils'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

const panelStore = usePanelStore()

const detailData = computed(function () {
  return props.data || panelStore.selectedItem || {}
})

function getCommandStatusColor(status) {
  if (!status) return 'grey'
  const s = String(status).toUpperCase()
  if (s === 'COMPLETED' || s === 'SUCCESS') return 'success'
  if (s === 'EXECUTING' || s === 'ASSIGNED' || s === 'PROCESSING') return 'info'
  if (s === 'REQUESTED' || s === 'INIT' || s === 'WAITING') return 'warning'
  if (s === 'ABORTED' || s === 'FAILED' || s === 'ERROR' || s === 'CANCEL') return 'error'
  return 'grey'
}

function onClose() {
  panelStore.closePanel()
}
</script>

<style scoped>
.detail-container {
  height: 100%;
}

.info-block {
  margin-bottom: 12px;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2px;
}

.info-value {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
}

.comment-box {
  min-height: 60px;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
