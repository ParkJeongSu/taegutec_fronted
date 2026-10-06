<template>
  <v-container fluid class="pa-4 outbound-view-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$transitTransfer" size="26" color="primary" class="mr-2" />
          <div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold text-high-emphasis">
                용기 / 캐리어 출고 지시
              </span>
              <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
                창고 관리 &gt; 출고 관리 &gt; 캐리어 출고 지시
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              공정(혼합, 환원, 도핑 등) 투입 요청에 맞춰 창고에 보관 중인 컨테이너 캐리어를 선별하고 WCS 반송 출고 명령을 발행합니다.
            </div>
          </div>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-chip size="small" color="error" variant="flat" class="mr-2 font-weight-bold">
            긴급 오더 {{ emergencyOrdersCount }}건
          </v-chip>
          <v-chip size="small" color="primary" variant="outlined" class="mr-2 font-weight-medium">
            전체 오더 {{ outboundOrderList.length }}건
          </v-chip>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            :loading="isOrdersLoading || isCarriersLoading"
            v-on:click="onRefreshAll"
          >
            {{ $t('common.refresh') }}
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- 2단 분할 레이아웃 -->
    <v-row class="split-view-row" density="comfortable">
      <!-- ================= [좌측 패널] ERP 출고 오더 카드 리스트 (너비 약 35%) ================= -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column outbound-order-panel">
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon icon="$fileDocumentOutline" size="20" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold">ERP 출고 요청 오더</span>
              </div>
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                {{ filteredOrders.length }}건
              </v-chip>
            </div>

            <!-- 오더 검색 필드 -->
            <v-text-field
              v-model="orderSearchKeyword"
              placeholder="오더번호 / 목적지 / 품목 검색"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              class="mb-2"
            ></v-text-field>

            <!-- 긴급도 필터 칩 토글 -->
            <v-btn-toggle
              v-model="urgencyFilter"
              mandatory
              density="compact"
              color="primary"
              variant="outlined"
              class="w-100"
            >
              <v-btn value="ALL" size="small" class="flex-grow-1 font-weight-medium">전체</v-btn>
              <v-btn value="EMERGENCY" size="small" class="flex-grow-1 font-weight-bold text-error">긴급 출고</v-btn>
              <v-btn value="NORMAL" size="small" class="flex-grow-1 font-weight-medium">일반 출고</v-btn>
            </v-btn-toggle>
          </div>

          <v-divider class="mb-2"></v-divider>

          <!-- 출고 오더 카드 리스트 스크롤 영역 -->
          <div class="panel-scroll-area flex-grow-1">
            <div v-if="isOrdersLoading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <div v-else-if="filteredOrders.length === 0" class="text-center py-12 text-medium-emphasis">
              <v-icon icon="$trayArrowUp" size="36" color="disabled" class="mb-2" />
              <div class="text-caption">조건에 해당하는 출고 오더가 없습니다.</div>
            </div>

            <div v-else class="order-card-list">
              <div
                v-for="order in filteredOrders"
                :key="order.orderId"
                class="outbound-order-card pa-3 mb-2 rounded-lg cursor-pointer"
                :class="{ 'active-order-card': selectedOrder && selectedOrder.orderId === order.orderId }"
                v-on:click="onSelectOrder(order)"
              >
                <!-- 카드 상단: 오더번호 및 긴급도 칩 -->
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-subtitle-2 text-primary">
                    {{ order.orderId }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="order.urgency === 'EMERGENCY' ? 'error' : 'primary'"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{ order.urgency === 'EMERGENCY' ? '긴급' : '일반' }}
                  </v-chip>
                </div>

                <!-- 카드 중단: 출고 목적 공정 및 품목명 -->
                <div class="d-flex align-center mb-1">
                  <v-icon icon="$mapMarkerOutline" size="14" color="primary" class="mr-1" />
                  <span class="text-caption font-weight-bold text-high-emphasis text-truncate">
                    {{ order.destinationProcess }}
                  </span>
                </div>

                <div class="text-caption font-weight-medium text-high-emphasis text-truncate mb-1">
                  [{{ order.itemCode }}] {{ order.itemName }}
                </div>
                <div class="text-caption text-medium-emphasis mb-2">
                  요구 LOT: <strong class="text-high-emphasis">{{ order.requiredLot }}</strong>
                </div>

                <!-- 카드 하단: 요청 수량 및 납기 -->
                <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis pt-1 border-top">
                  <span>
                    요청: <strong class="text-primary">{{ order.requestedContainers }}대</strong> ({{ order.requestedWeight.toFixed(1) }} t)
                  </span>
                  <span>{{ order.requester }}</span>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- ================= [우측 패널] 창고 적재 캐리어 선별 및 출고 지시 (너비 약 65%) ================= -->
      <v-col cols="12" md="8" class="d-flex flex-column">
        <!-- 상단 선택 오더 요약 및 충족 인디케이터 바 -->
        <v-card class="elevation-1 rounded-lg pa-4 mb-3 order-summary-banner bg-surface">
          <div v-if="!selectedOrder" class="text-center py-4 text-medium-emphasis">
            <v-icon icon="$transitTransfer" size="32" color="disabled" class="mb-1" />
            <div class="text-body-2 font-weight-medium">좌측 목록에서 출고 처리할 오더를 선택해주세요.</div>
          </div>

          <div v-else>
            <div class="d-flex flex-wrap align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-avatar color="primary" variant="tonal" size="44" class="mr-3">
                  <v-icon icon="$robotIndustrial" size="24" color="primary"></v-icon>
                </v-avatar>
                <div>
                  <div class="d-flex align-center flex-wrap">
                    <span class="text-subtitle-1 font-weight-bold text-high-emphasis mr-2">{{ selectedOrder.destinationProcess }}</span>
                    <v-chip size="small" color="primary" variant="flat" class="font-weight-bold mr-2">
                      {{ selectedOrder.orderId }}
                    </v-chip>
                    <v-chip size="small" color="secondary" variant="tonal" class="font-weight-medium">
                      요구 LOT: {{ selectedOrder.requiredLot }}
                    </v-chip>
                  </div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    품목: [{{ selectedOrder.itemCode }}] {{ selectedOrder.itemName }} | 도착 포트: {{ selectedOrder.destinationPort }}
                  </div>
                </div>
              </div>

              <!-- 충족 중량 표시 -->
              <div class="text-end mt-2 mt-sm-0">
                <div class="text-caption text-medium-emphasis">출고 충족률</div>
                <div class="text-subtitle-2 font-weight-bold" :class="isFulfillmentComplete ? 'text-success' : 'text-primary'">
                  {{ selectedTotalWeight.toFixed(2) }} t / {{ selectedOrder.requestedWeight.toFixed(2) }} t ({{ fulfillmentRate.toFixed(0) }}%)
                </div>
              </div>
            </div>

            <!-- 충족률 프로그레스 바 -->
            <v-progress-linear
              :model-value="fulfillmentRate"
              :color="isFulfillmentComplete ? 'success' : 'primary'"
              height="6"
              rounded
            ></v-progress-linear>
          </div>
        </v-card>

        <!-- 본문 창고 보관 캐리어 재고 테이블 카드 -->
        <v-card class="elevation-1 rounded-lg pa-4 flex-grow-1 d-flex flex-column carriers-table-card">
          <div class="panel-header mb-3">
            <div class="d-flex flex-wrap align-center justify-space-between">
              <div class="d-flex align-center mb-2 mb-sm-0">
                <v-icon icon="$packageVariant" size="18" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold">창고 보관 출고 가능 캐리어 (Container) 목록</span>
                <v-chip v-if="selectedOrder" size="x-small" color="primary" variant="tonal" class="ml-2">
                  품목: {{ selectedOrder.itemCode }}
                </v-chip>
              </div>

              <!-- 빠른 검색 필드 -->
              <div class="d-flex align-center">
                <v-text-field
                  v-model="carrierSearchKeyword"
                  placeholder="Carrier ID / Shelf 위치 검색"
                  variant="outlined"
                  density="compact"
                  hide-details
                  prepend-inner-icon="$magnify"
                  class="mr-2 carrier-search-field"
                  v-on:keyup.enter="handleSearchCarriers"
                ></v-text-field>
                <v-btn color="primary" variant="tonal" size="small" v-on:click="handleSearchCarriers">
                  검색
                </v-btn>
              </div>
            </div>
          </div>

          <!-- BaseDataTable 연동 다중 선택 캐리어 테이블 -->
          <div class="table-container flex-grow-1">
            <BaseDataTable
              v-model="selectedCarriers"
              :headers="carrierHeaders"
              :items="carrierList"
              :total-items="totalCarriers"
              :loading="isCarriersLoading"
              item-value="carrierId"
              :show-select="true"
              density="compact"
              v-on:update:options="onCarrierOptionsUpdate"
            >
              <!-- Carrier ID -->
              <template #[`item.carrierId`]="{ item }">
                <span class="font-weight-bold text-primary">{{ item.carrierId }}</span>
              </template>

              <!-- 보관 위치 -->
              <template #[`item.location`]="{ item }">
                <v-chip size="x-small" variant="outlined" color="primary" class="font-weight-medium">
                  {{ item.location }}
                </v-chip>
              </template>

              <!-- 품목명 -->
              <template #[`item.itemName`]="{ item }">
                <span class="font-weight-medium text-caption">{{ item.itemName }}</span>
              </template>

              <!-- Batch LOT -->
              <template #[`item.batchLot`]="{ item }">
                <span class="text-caption font-weight-bold text-high-emphasis">{{ item.batchLot }}</span>
              </template>

              <!-- 중량 -->
              <template #[`item.weight`]="{ item }">
                <span class="font-weight-bold">{{ Number(item.weight).toFixed(2) }} t</span>
              </template>

              <!-- 입고 일시 -->
              <template #[`item.storedDate`]="{ item }">
                <span class="text-caption">{{ formatOrderDate(item.storedDate) }}</span>
              </template>

              <!-- 상태 -->
              <template #[`item.status`]="{ item }">
                <v-chip
                  size="x-small"
                  :color="item.status === 'STORED' ? 'success' : item.status === 'AVAILABLE' ? 'primary' : 'warning'"
                  variant="flat"
                >
                  {{ item.status }}
                </v-chip>
              </template>
            </BaseDataTable>
          </div>

          <!-- 하단 액션 바 -->
          <v-divider class="my-3"></v-divider>
          <div class="d-flex flex-wrap align-center justify-space-between">
            <div class="d-flex align-center action-summary-text">
              <span class="text-caption text-medium-emphasis">선택 캐리어:</span>
              <strong class="text-primary mx-1">{{ selectedCarriers.length }}개</strong>
              <span class="text-caption text-medium-emphasis">| 총 중량:</span>
              <strong class="text-success mx-1">{{ selectedTotalWeight.toFixed(2) }} t</strong>
              <span v-if="selectedOrder" class="text-caption text-medium-emphasis">
                (요청: {{ selectedOrder.requestedWeight.toFixed(2) }} t)
              </span>
            </div>

            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              prepend-icon="$transitTransfer"
              class="font-weight-bold px-8 dispatch-cta-btn"
              :disabled="!canDispatchOutbound"
              :loading="isDispatching"
              v-on:click="onOpenDispatchConfirm"
            >
              출고 지시 (WCS 반송 명령 발행)
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 출고 지시 확인 다이얼로그 -->
    <ConfirmDialog
      v-model="confirmDialog"
      title="WCS 출고 반송 명령 발행 확인"
      :message="confirmMessage"
      confirm-text="출고 명령 전송"
      confirm-color="primary"
      icon="$transitTransfer"
      v-on:confirm="onConfirmDispatch"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useDataTable } from '@/composables/useDataTable'
import { useApi } from '@/composables/useApi'
import {
  fetchOutboundOrdersApi,
  fetchWarehouseCarriersApi,
  dispatchOutboundCarriersApi,
} from '@/api/warehouse'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { formatDateTime } from '@/utils/dateUtils'

// ==========================================
// 1. 상태 정의
// ==========================================
const outboundOrderList = ref([])
const selectedOrder = ref(null)
const orderSearchKeyword = ref('')
const urgencyFilter = ref('ALL')

const carrierSearchKeyword = ref('')
const selectedCarriers = ref([])

const confirmDialog = ref(false)
const confirmMessage = ref('')
const snackbar = reactive({ show: false, message: '', color: 'success' })

const { loading: isOrdersLoading, execute: executeFetchOrders } = useApi(fetchOutboundOrdersApi)
const { loading: isDispatching, execute: executeDispatchOutbound } = useApi(dispatchOutboundCarriersApi)

// ==========================================
// 2. BaseDataTable / useDataTable 연동
// ==========================================
const {
  items: carrierList,
  totalItems: totalCarriers,
  loading: isCarriersLoading,
  loadData: loadCarriersData,
  updateOptions: updateCarrierOptions,
} = useDataTable(fetchWarehouseCarriersApi)

const carrierHeaders = [
  { title: 'Carrier ID', key: 'carrierId', width: '105px', align: 'start' },
  { title: '보관 위치 (Shelf/Zone)', key: 'location', width: '150px', align: 'start' },
  { title: '품목명', key: 'itemName', align: 'start' },
  { title: 'Batch LOT 번호', key: 'batchLot', width: '140px', align: 'start' },
  { title: '적재중량', key: 'weight', width: '90px', align: 'end' },
  { title: '입고일시', key: 'storedDate', width: '100px', align: 'center' },
  { title: '상태', key: 'status', width: '85px', align: 'center' },
]

// ==========================================
// 3. 계산된 속성 (Computeds)
// ==========================================
const filteredOrders = computed(function () {
  const kw = orderSearchKeyword.value.trim().toLowerCase()
  const urg = urgencyFilter.value
  const result = []

  for (let i = 0; i < outboundOrderList.value.length; i++) {
    const o = outboundOrderList.value[i]

    if (urg !== 'ALL' && o.urgency !== urg) {
      continue
    }

    if (kw) {
      const matchId = o.orderId.toLowerCase().indexOf(kw) !== -1
      const matchCode = o.itemCode.toLowerCase().indexOf(kw) !== -1
      const matchName = o.itemName.toLowerCase().indexOf(kw) !== -1
      const matchDest = o.destinationProcess.toLowerCase().indexOf(kw) !== -1

      if (!matchId && !matchCode && !matchName && !matchDest) {
        continue
      }
    }

    result.push(o)
  }

  return result
})

const emergencyOrdersCount = computed(function () {
  let count = 0
  for (let i = 0; i < outboundOrderList.value.length; i++) {
    if (outboundOrderList.value[i].urgency === 'EMERGENCY') {
      count = count + 1
    }
  }
  return count
})

const selectedTotalWeight = computed(function () {
  let total = 0
  for (let i = 0; i < selectedCarriers.value.length; i++) {
    const c = selectedCarriers.value[i]
    if (c && c.weight) {
      total = total + Number(c.weight)
    }
  }
  return total
})

const fulfillmentRate = computed(function () {
  if (!selectedOrder.value || selectedOrder.value.requestedWeight <= 0) {
    return 0
  }
  const rate = (selectedTotalWeight.value / selectedOrder.value.requestedWeight) * 100
  return Math.min(rate, 100)
})

const isFulfillmentComplete = computed(function () {
  if (!selectedOrder.value) return false
  return selectedTotalWeight.value >= selectedOrder.value.requestedWeight
})

const canDispatchOutbound = computed(function () {
  return selectedOrder.value !== null && selectedCarriers.value.length > 0
})

// ==========================================
// 4. 헬퍼 및 핸들러 함수
// ==========================================
function formatOrderDate(dateStr) {
  if (!dateStr) return '-'
  const formatted = formatDateTime(dateStr)
  return formatted.split(' ')[0]
}

function showNotification(msg, color) {
  snackbar.message = msg
  snackbar.color = color || 'success'
  snackbar.show = true
}

function onSelectOrder(order) {
  selectedOrder.value = order
  selectedCarriers.value = []

  // 선택된 출고 오더의 품목에 맞춰 캐리어 목록 필터링
  loadCarriersData({
    itemCode: order.itemCode,
    searchKeyword: carrierSearchKeyword.value,
  })
}

function handleSearchCarriers() {
  loadCarriersData({
    itemCode: selectedOrder.value ? selectedOrder.value.itemCode : null,
    searchKeyword: carrierSearchKeyword.value,
  })
}

function onCarrierOptionsUpdate(options) {
  updateCarrierOptions(options, {
    itemCode: selectedOrder.value ? selectedOrder.value.itemCode : null,
    searchKeyword: carrierSearchKeyword.value,
  })
}

async function loadOutboundOrders() {
  try {
    const res = await executeFetchOrders()
    if (res && res.content && Array.isArray(res.content)) {
      outboundOrderList.value = res.content
    } else if (Array.isArray(res)) {
      outboundOrderList.value = res
    }

    if (outboundOrderList.value.length > 0 && !selectedOrder.value) {
      onSelectOrder(outboundOrderList.value[0])
    }
  } catch (err) {
    console.error('Failed to fetch outbound orders:', err)
  }
}

function onRefreshAll() {
  loadOutboundOrders()
  handleSearchCarriers()
}

function onOpenDispatchConfirm() {
  if (!canDispatchOutbound.value) return

  const o = selectedOrder.value
  const carrierCount = selectedCarriers.value.length
  const weightStr = selectedTotalWeight.value.toFixed(2)

  confirmMessage.value =
    '[' +
    o.orderId +
    '] 출고 요청에 대해\n' +
    '선택한 캐리어 ' +
    carrierCount +
    '건(총 ' +
    weightStr +
    't)을\n' +
    '목적지 [' +
    o.destinationProcess +
    ' - ' +
    o.destinationPort +
    '](으)로\n' +
    'WCS 반송 출고 명령을 발행하시겠습니까?'

  confirmDialog.value = true
}

async function onConfirmDispatch() {
  try {
    const carrierIds = []
    for (let i = 0; i < selectedCarriers.value.length; i++) {
      carrierIds.push(selectedCarriers.value[i].carrierId)
    }

    const payload = {
      orderId: selectedOrder.value.orderId,
      destinationProcess: selectedOrder.value.destinationProcess,
      destinationPort: selectedOrder.value.destinationPort,
      carrierIds: carrierIds,
      totalWeight: selectedTotalWeight.value,
      workerName: 'OP_WH_OUTBOUND_01',
    }

    await executeDispatchOutbound(payload)

    showNotification(
      '[' + selectedOrder.value.orderId + '] WCS 출고 반송 명령이 성공적으로 발행되었습니다.',
      'success',
    )

    // 선택 초기화 및 데이터 갱신
    selectedCarriers.value = []
    handleSearchCarriers()
  } catch (err) {
    console.error('Outbound dispatch failed:', err)
    showNotification('출고 지시 중 오류가 발생했습니다.', 'error')
  }
}

onMounted(function () {
  loadOutboundOrders()
  loadCarriersData()
})
</script>

<style scoped>
.outbound-view-container {
  max-width: 100%;
}

.split-view-row {
  min-height: calc(100vh - 165px);
}

.outbound-order-panel {
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

.outbound-order-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
  transition: all 0.18s ease-in-out;
}

.outbound-order-card:hover {
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

.carriers-table-card {
  border-top: 2px solid #2e7d32;
}

.carrier-search-field {
  max-width: 220px;
}

.table-container {
  overflow-y: auto;
  max-height: 380px;
}

.dispatch-cta-btn {
  letter-spacing: 0.5px;
  height: 44px !important;
  font-size: 0.95rem;
}

.header-action-gap {
  gap: 6px;
}
</style>
