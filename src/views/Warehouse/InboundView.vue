<template>
  <v-container fluid class="pa-4 inbound-view-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$trayArrowDown" size="26" color="primary" class="mr-2" />
          <div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold text-high-emphasis">
                원자재 FIBC Bag 입고 처리
              </span>
              <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
                창고 관리 &gt; 입고 관리 &gt; 원자재 입고 등록
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              대구텍 분말(POWDER) 공정용 원자재(WO3, Co, TiC 등) FIBC Bag의 실측 중량을 검수하고 WCS 창고 자동 적재 지시를 수행합니다.
            </div>
          </div>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-chip size="small" color="primary" variant="flat" class="mr-2 font-weight-bold">
            대기 오더 {{ readyOrdersCount }}건
          </v-chip>
          <v-chip size="small" color="warning" variant="flat" class="mr-2 font-weight-bold">
            진행 중 {{ inProgressOrdersCount }}건
          </v-chip>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            :loading="isOrdersLoading"
            v-on:click="onRefreshAll"
          >
            {{ $t('common.refresh') }}
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- 2단 분할 레이아웃 -->
    <v-row class="split-view-row" density="comfortable">
      <!-- ================= [좌측 패널] ERP 입고 오더 카드 리스트 (너비 약 35%) ================= -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column inbound-order-panel">
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon icon="$fileDocumentOutline" size="20" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold">ERP 입고 오더 목록</span>
              </div>
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                총 {{ filteredOrders.length }}건
              </v-chip>
            </div>

            <!-- 오더 검색 필드 -->
            <v-text-field
              v-model="orderSearchKeyword"
              placeholder="오더번호 / 품목명 / LOT 검색"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              class="mb-2"
            ></v-text-field>

            <!-- 상태 필터 칩 토글 -->
            <v-btn-toggle
              v-model="statusFilter"
              mandatory
              density="compact"
              color="primary"
              variant="outlined"
              class="w-100"
            >
              <v-btn value="ALL" size="small" class="flex-grow-1 font-weight-medium">전체</v-btn>
              <v-btn value="READY" size="small" class="flex-grow-1 font-weight-medium">대기</v-btn>
              <v-btn value="IN_PROGRESS" size="small" class="flex-grow-1 font-weight-medium">진행 중</v-btn>
            </v-btn-toggle>
          </div>

          <v-divider class="mb-2"></v-divider>

          <!-- 오더 카드 리스트 스크롤 영역 -->
          <div class="panel-scroll-area flex-grow-1">
            <div v-if="isOrdersLoading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <div v-else-if="filteredOrders.length === 0" class="text-center py-12 text-medium-emphasis">
              <v-icon icon="$trayArrowDown" size="36" color="disabled" class="mb-2" />
              <div class="text-caption">조건에 해당하는 입고 오더가 없습니다.</div>
            </div>

            <div v-else class="order-card-list">
              <div
                v-for="order in filteredOrders"
                :key="order.orderId"
                class="inbound-order-card pa-3 mb-2 rounded-lg cursor-pointer"
                :class="{ 'active-order-card': selectedOrder && selectedOrder.orderId === order.orderId }"
                v-on:click="onSelectOrder(order)"
              >
                <!-- 카드 상단: 오더번호 및 상태 칩 -->
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-subtitle-2 text-primary">
                    {{ order.orderId }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="order.status === 'READY' ? 'primary' : 'warning'"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{ order.status === 'READY' ? '대기' : '진행 중' }}
                  </v-chip>
                </div>

                <!-- 카드 중단: 품목 정보 및 원자재 LOT -->
                <div class="text-caption font-weight-bold text-high-emphasis text-truncate mb-1">
                  [{{ order.itemCode }}] {{ order.itemName }}
                </div>
                <div class="text-caption text-medium-emphasis mb-2">
                  원자재 LOT: <strong class="text-high-emphasis">{{ order.rawLotId }}</strong>
                </div>

                <!-- 카드 하단: 입고 진행률 및 수량/중량 -->
                <v-progress-linear
                  :model-value="(order.processedBagCount / order.totalBagCount) * 100"
                  color="primary"
                  height="6"
                  rounded
                  class="mb-2"
                ></v-progress-linear>

                <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis">
                  <span>
                    실적: <strong class="text-primary">{{ order.processedBagCount }}</strong> / {{ order.totalBagCount }} Bags
                  </span>
                  <span class="font-weight-bold text-high-emphasis">
                    {{ order.totalPlannedWeight.toFixed(1) }} t
                  </span>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- ================= [우측 패널] 현장 실측 및 입고 등록 폼 (너비 약 65%) ================= -->
      <v-col cols="12" md="8" class="d-flex flex-column">
        <!-- 상단 선택 오더 요약 바 -->
        <v-card class="elevation-1 rounded-lg pa-4 mb-3 order-summary-banner bg-surface">
          <div v-if="!selectedOrder" class="text-center py-4 text-medium-emphasis">
            <v-icon icon="$trayArrowDown" size="32" color="disabled" class="mb-1" />
            <div class="text-body-2 font-weight-medium">좌측 목록에서 입고 처리할 ERP 오더를 선택해주세요.</div>
          </div>

          <div v-else class="d-flex flex-wrap align-center justify-space-between">
            <div class="d-flex align-center">
              <v-avatar color="primary" variant="tonal" size="44" class="mr-3">
                <v-icon icon="$packageVariant" size="24" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="d-flex align-center flex-wrap">
                  <span class="text-subtitle-1 font-weight-bold text-high-emphasis mr-2">{{ selectedOrder.itemName }}</span>
                  <v-chip size="small" color="primary" variant="flat" class="font-weight-bold mr-2">
                    {{ selectedOrder.orderId }}
                  </v-chip>
                  <v-chip size="small" color="secondary" variant="tonal" class="font-weight-medium">
                    LOT: {{ selectedOrder.rawLotId }}
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  공급처: {{ selectedOrder.supplier }} | 대상 보관 존: {{ selectedOrder.targetZone }}
                </div>
              </div>
            </div>

            <div class="d-flex align-center mt-2 mt-sm-0">
              <div class="text-end mr-3">
                <div class="text-caption text-medium-emphasis">Bag당 기준 중량</div>
                <div class="text-subtitle-2 font-weight-bold text-primary">
                  {{ selectedOrder.bagPlannedWeight.toFixed(3) }} t / Bag
                </div>
              </div>
              <v-chip size="small" color="primary" variant="outlined" class="font-weight-bold">
                잔여 {{ selectedOrder.totalBagCount - selectedOrder.processedBagCount }} Bags
              </v-chip>
            </div>
          </div>
        </v-card>

        <!-- 본문 실측 및 입고 등록 폼 -->
        <v-card class="elevation-1 rounded-lg pa-4 flex-grow-1 d-flex flex-column inbound-form-card">
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="$pencil" size="18" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold">현장 실측 정보 및 WCS 입고 등록</span>
              </div>
              <v-chip
                v-if="selectedOrder && weightDeviation !== null"
                size="small"
                :color="isDeviationNormal ? 'success' : 'warning'"
                variant="flat"
                class="font-weight-bold"
              >
                중량 편차: {{ weightDeviationText }}
              </v-chip>
            </div>
          </div>

          <v-form ref="inboundFormRef" class="form-body flex-grow-1">
            <v-row density="comfortable">
              <!-- 1. 투입 포트 / 현재 위치 -->
              <v-col cols="12" sm="6">
                <div class="text-caption font-weight-bold mb-1 text-high-emphasis">
                  투입 포트 / 입고 위치 *
                </div>
                <v-select
                  v-model="formData.inboundPort"
                  :items="portOptions"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="$mapMarkerOutline"
                  hide-details="auto"
                  :disabled="!selectedOrder"
                ></v-select>
              </v-col>

              <!-- 2. Pallet ID -->
              <v-col cols="12" sm="6">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="text-caption font-weight-bold text-high-emphasis">Pallet ID (팔레트 번호) *</span>
                  <span class="text-caption text-medium-emphasis">바코드 스캔 대응</span>
                </div>
                <v-text-field
                  v-model="formData.palletId"
                  placeholder="예: PLT-20261006-001"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="$cubeOutline"
                  hide-details="auto"
                  :disabled="!selectedOrder"
                  v-on:keyup.enter="focusNextField('fibcBagId')"
                ></v-text-field>
              </v-col>

              <!-- 3. FIBC Bag ID -->
              <v-col cols="12" sm="6">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="text-caption font-weight-bold text-high-emphasis">FIBC Bag ID (백 식별번호) *</span>
                  <span class="text-caption text-medium-emphasis">바코드 스캔 대응</span>
                </div>
                <v-text-field
                  ref="fibcBagInputRef"
                  v-model="formData.fibcBagId"
                  placeholder="예: BAG-WP-9921"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="$tagOutline"
                  hide-details="auto"
                  :disabled="!selectedOrder"
                  v-on:keyup.enter="focusNextField('actualWeight')"
                ></v-text-field>
              </v-col>

              <!-- 4. 원자재 LOT ID -->
              <v-col cols="12" sm="6">
                <div class="text-caption font-weight-bold mb-1 text-high-emphasis">
                  원자재 LOT 번호 *
                </div>
                <v-text-field
                  v-model="formData.rawLotId"
                  placeholder="예: RAW-WO3-2610-01"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  :disabled="!selectedOrder"
                ></v-text-field>
              </v-col>

              <!-- 5. ERP 계획 중량 (Readonly) -->
              <v-col cols="12" sm="6">
                <div class="text-caption font-weight-bold mb-1 text-medium-emphasis">
                  ERP 기준 계획 중량 (t)
                </div>
                <v-text-field
                  :model-value="selectedOrder ? selectedOrder.bagPlannedWeight.toFixed(3) : '0.000'"
                  readonly
                  disabled
                  variant="outlined"
                  density="compact"
                  suffix="Ton"
                  hide-details="auto"
                  class="bg-grey-lighten-4"
                ></v-text-field>
              </v-col>

              <!-- 6. 현장 실측 중량 (Actual Weight) -->
              <v-col cols="12" sm="6">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="text-caption font-weight-bold text-primary">현장 실측 중량 (t) *</span>
                  <span v-if="weightDeviation !== null" class="text-caption" :class="isDeviationNormal ? 'text-success' : 'text-warning'">
                    오차: {{ weightDeviation > 0 ? '+' : '' }}{{ weightDeviation.toFixed(3) }} t
                  </span>
                </div>
                <v-text-field
                  ref="actualWeightInputRef"
                  v-model.number="formData.actualWeight"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.000"
                  variant="outlined"
                  density="compact"
                  suffix="Ton"
                  hide-details="auto"
                  :disabled="!selectedOrder"
                ></v-text-field>
              </v-col>

              <!-- 7. 입고 특이사항 및 검수 메모 -->
              <v-col cols="12">
                <div class="text-caption font-weight-bold mb-1 text-high-emphasis">
                  입고 검수 메모 및 특이사항
                </div>
                <v-textarea
                  v-model="formData.inspectionMemo"
                  rows="3"
                  placeholder="포장 상태(찢김, 습기), 분말 누출 여부, 계량 검수 특이사항을 입력하세요."
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  :disabled="!selectedOrder"
                  class="memo-textarea text-caption"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>

          <!-- 하단 제어 액션 바 -->
          <v-divider class="my-3"></v-divider>
          <div class="d-flex align-center justify-space-between">
            <v-btn
              variant="outlined"
              color="secondary"
              size="large"
              :disabled="!selectedOrder || isRegistering"
              v-on:click="onResetForm"
            >
              입고 취소 / 초기화
            </v-btn>

            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              prepend-icon="$trayArrowDown"
              class="font-weight-bold px-8 submit-inbound-btn"
              :disabled="!canSubmitInbound"
              :loading="isRegistering"
              v-on:click="onOpenInboundConfirm"
            >
              WCS 입고 요청 (창고 적재 지시)
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 입고 확인 다이얼로그 -->
    <ConfirmDialog
      v-model="confirmDialog"
      title="WCS 입고 적재 지시 확인"
      :message="confirmMessage"
      confirm-text="입고 요청 전송"
      confirm-color="primary"
      icon="$trayArrowDown"
      v-on:confirm="onConfirmInbound"
    />

    <!-- 스낵바 알림 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3500"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" size="small" v-on:click="snackbar.show = false">닫기</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useApi } from '@/composables/useApi'
import { fetchInboundOrdersApi, registerInboundBagApi } from '@/api/warehouse'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

// ==========================================
// 1. 상태 정의
// ==========================================
const inboundOrderList = ref([])
const selectedOrder = ref(null)
const orderSearchKeyword = ref('')
const statusFilter = ref('ALL')

const portOptions = [
  'IN_PORT_01',
  'IN_PORT_02',
  'DOCK_A',
  'DOCK_B',
  'MANUAL_IN_01',
]

const formData = reactive({
  inboundPort: 'IN_PORT_01',
  palletId: '',
  fibcBagId: '',
  rawLotId: '',
  actualWeight: 0,
  inspectionMemo: '포장 상태 양호, 분말 누출 없음 확인.',
})

const confirmDialog = ref(false)
const confirmMessage = ref('')
const snackbar = reactive({ show: false, message: '', color: 'success' })

const fibcBagInputRef = ref(null)
const actualWeightInputRef = ref(null)

const { loading: isOrdersLoading, execute: executeFetchOrders } = useApi(fetchInboundOrdersApi)
const { loading: isRegistering, execute: executeRegisterInbound } = useApi(registerInboundBagApi)

// ==========================================
// 2. 계산된 속성 (Computeds)
// ==========================================
const filteredOrders = computed(function () {
  const kw = orderSearchKeyword.value.trim().toLowerCase()
  const st = statusFilter.value
  const result = []

  for (let i = 0; i < inboundOrderList.value.length; i++) {
    const o = inboundOrderList.value[i]

    if (st !== 'ALL' && o.status !== st) {
      continue
    }

    if (kw) {
      const matchId = o.orderId.toLowerCase().indexOf(kw) !== -1
      const matchCode = o.itemCode.toLowerCase().indexOf(kw) !== -1
      const matchName = o.itemName.toLowerCase().indexOf(kw) !== -1
      const matchLot = o.rawLotId.toLowerCase().indexOf(kw) !== -1

      if (!matchId && !matchCode && !matchName && !matchLot) {
        continue
      }
    }

    result.push(o)
  }

  return result
})

const readyOrdersCount = computed(function () {
  let count = 0
  for (let i = 0; i < inboundOrderList.value.length; i++) {
    if (inboundOrderList.value[i].status === 'READY') {
      count = count + 1
    }
  }
  return count
})

const inProgressOrdersCount = computed(function () {
  let count = 0
  for (let i = 0; i < inboundOrderList.value.length; i++) {
    if (inboundOrderList.value[i].status === 'IN_PROGRESS') {
      count = count + 1
    }
  }
  return count
})

const weightDeviation = computed(function () {
  if (!selectedOrder.value || !formData.actualWeight) {
    return null
  }
  const planned = selectedOrder.value.bagPlannedWeight
  const actual = Number(formData.actualWeight)
  return actual - planned
})

const isDeviationNormal = computed(function () {
  if (weightDeviation.value === null) return true
  return Math.abs(weightDeviation.value) <= 0.01
})

const weightDeviationText = computed(function () {
  if (weightDeviation.value === null) return ''
  const diff = weightDeviation.value
  const sign = diff >= 0 ? '+' : ''
  const pct = (diff / selectedOrder.value.bagPlannedWeight) * 100
  return sign + diff.toFixed(3) + ' t (' + sign + pct.toFixed(2) + '%)'
})

const canSubmitInbound = computed(function () {
  return (
    selectedOrder.value !== null &&
    formData.inboundPort &&
    formData.palletId.trim().length > 0 &&
    formData.fibcBagId.trim().length > 0 &&
    formData.rawLotId.trim().length > 0 &&
    Number(formData.actualWeight) > 0
  )
})

// ==========================================
// 3. 헬퍼 및 핸들러 함수
// ==========================================
function showNotification(msg, color) {
  snackbar.message = msg
  snackbar.color = color || 'success'
  snackbar.show = true
}

function generateNextBagIdentifiers(order) {
  const nextSeq = (order ? order.processedBagCount : 0) + 1
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  formData.palletId = 'PLT-' + dateStr + '-' + String(nextSeq).padStart(3, '0')
  formData.fibcBagId = 'BAG-' + (order ? order.itemCode.split('-')[1] || 'WP' : 'WP') + '-' + (Math.floor(Math.random() * 8000) + 1000)
  formData.rawLotId = order ? order.rawLotId : ''
  formData.inboundPort = order ? order.defaultPort || 'IN_PORT_01' : 'IN_PORT_01'
  // 실측 중량 기본값 (계획 중량 + 약간의 오차)
  const baseWeight = order ? order.bagPlannedWeight : 1.0
  formData.actualWeight = Number((baseWeight + (Math.random() * 0.006 - 0.002)).toFixed(3))
}

function onSelectOrder(order) {
  selectedOrder.value = order
  generateNextBagIdentifiers(order)
}

function focusNextField(fieldName) {
  if (fieldName === 'fibcBagId' && fibcBagInputRef.value) {
    nextTick(function () {
      fibcBagInputRef.value.focus()
    })
  } else if (fieldName === 'actualWeight' && actualWeightInputRef.value) {
    nextTick(function () {
      actualWeightInputRef.value.focus()
    })
  }
}

function onResetForm() {
  if (selectedOrder.value) {
    generateNextBagIdentifiers(selectedOrder.value)
  } else {
    formData.palletId = ''
    formData.fibcBagId = ''
    formData.rawLotId = ''
    formData.actualWeight = 0
  }
}

async function loadInboundOrders() {
  try {
    const res = await executeFetchOrders()
    if (res && res.content && Array.isArray(res.content)) {
      inboundOrderList.value = res.content
    } else if (Array.isArray(res)) {
      inboundOrderList.value = res
    }

    if (inboundOrderList.value.length > 0 && !selectedOrder.value) {
      onSelectOrder(inboundOrderList.value[0])
    }
  } catch (err) {
    console.error('Failed to fetch inbound orders:', err)
  }
}

function onRefreshAll() {
  loadInboundOrders()
}

function onOpenInboundConfirm() {
  if (!canSubmitInbound.value) return

  const o = selectedOrder.value
  const f = formData

  confirmMessage.value =
    '[' +
    o.orderId +
    ' - ' +
    o.itemName +
    '] 원자재 입고를 진행하시겠습니까?\n\n' +
    '• 투입 포트: ' +
    f.inboundPort +
    '\n• Pallet ID: ' +
    f.palletId +
    '\n• Bag ID: ' +
    f.fibcBagId +
    '\n• 실측 중량: ' +
    f.actualWeight +
    ' t (' +
    weightDeviationText.value +
    ')'

  confirmDialog.value = true
}

async function onConfirmInbound() {
  try {
    const payload = {
      orderId: selectedOrder.value.orderId,
      itemCode: selectedOrder.value.itemCode,
      rawLotId: formData.rawLotId,
      inboundPort: formData.inboundPort,
      palletId: formData.palletId,
      fibcBagId: formData.fibcBagId,
      actualWeight: formData.actualWeight,
      inspectionMemo: formData.inspectionMemo,
      workerName: 'OP_WH_INBOUND_01',
    }

    await executeRegisterInbound(payload)

    // 입고 실적 카운트 증가 및 상태 갱신
    if (selectedOrder.value) {
      selectedOrder.value.processedBagCount = selectedOrder.value.processedBagCount + 1
      selectedOrder.value.status = 'IN_PROGRESS'
    }

    showNotification(
      '[' + formData.fibcBagId + '] WCS 창고 적재 지시가 성공적으로 전송되었습니다.',
      'success',
    )

    // 다음 Bag 입고를 위해 폼 자동 갱신
    generateNextBagIdentifiers(selectedOrder.value)
  } catch (err) {
    console.error('Inbound registration failed:', err)
    showNotification('입고 등록 중 오류가 발생했습니다.', 'error')
  }
}

onMounted(function () {
  loadInboundOrders()
})
</script>

<style scoped>
.inbound-view-container {
  max-width: 100%;
}

.split-view-row {
  min-height: calc(100vh - 165px);
}

.inbound-order-panel {
  max-height: calc(100vh - 165px);
}

.panel-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 6px;
}

.panel-scroll-area {
  overflow-y: auto;
  max-height: calc(100vh - 280px);
  padding-right: 4px;
}

.inbound-order-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
  transition: all 0.18s ease-in-out;
}

.inbound-order-card:hover {
  background-color: rgba(46, 125, 50, 0.05);
  border-color: rgba(46, 125, 50, 0.35);
}

.active-order-card {
  background-color: rgba(46, 125, 50, 0.1) !important;
  border: 1px solid #2e7d32 !important;
  border-left: 4px solid #2e7d32 !important;
}

.order-summary-banner {
  border-left: 4px solid #2e7d32;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbf9 100%);
}

.inbound-form-card {
  border-top: 2px solid #2e7d32;
}

.memo-textarea :deep(textarea) {
  font-size: 0.825rem;
  color: #212121 !important;
  line-height: 1.4;
}

.submit-inbound-btn {
  letter-spacing: 0.5px;
  height: 44px !important;
  font-size: 0.95rem;
}

.header-action-gap {
  gap: 6px;
}
</style>
