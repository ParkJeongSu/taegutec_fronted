<template>
  <v-container fluid class="pa-4 stock-taking-view-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$clipboardCheckOutline" size="26" color="primary" class="mr-2" />
          <div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold text-high-emphasis">
                재고 실사(Stock Taking) 및 실측 중량 보정
              </span>
              <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
                창고 관리 &gt; 재고 실사 &gt; 오더별 실측 및 보정 완료
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              정기/수시 재고 실사 오더에 따라 대상 캐리어를 측정 포트로 반송하고, 현장 실측 중량(Actual Weight)과 전산 중량의 편차를 보정 처리합니다.
            </div>
          </div>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-chip size="small" color="primary" variant="flat" class="mr-2 font-weight-bold">
            대기 실사 {{ readyOrdersCount }}건
          </v-chip>
          <v-chip size="small" color="warning" variant="flat" class="mr-2 font-weight-bold">
            진행 중 {{ inProgressOrdersCount }}건
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
      <!-- ================= [좌측 패널] 재고 실사 오더 카드 리스트 (너비 약 35%) ================= -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column stocktaking-order-panel">
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon icon="$fileDocumentOutline" size="20" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold">ERP 재고 실사 오더</span>
              </div>
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                총 {{ filteredOrders.length }}건
              </v-chip>
            </div>

            <!-- 오더 검색 필드 -->
            <v-text-field
              v-model="orderSearchKeyword"
              placeholder="실사 오더 / 구역 / LOT 검색"
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
              <v-btn value="COMPLETED" size="small" class="flex-grow-1 font-weight-medium">완료</v-btn>
            </v-btn-toggle>
          </div>

          <v-divider class="mb-2"></v-divider>

          <!-- 오더 카드 리스트 스크롤 영역 -->
          <div class="panel-scroll-area flex-grow-1">
            <div v-if="isOrdersLoading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <div v-else-if="filteredOrders.length === 0" class="text-center py-12 text-medium-emphasis">
              <v-icon icon="$clipboardCheckOutline" size="36" color="disabled" class="mb-2" />
              <div class="text-caption">조건에 해당하는 실사 오더가 없습니다.</div>
            </div>

            <div v-else class="order-card-list">
              <div
                v-for="order in filteredOrders"
                :key="order.orderId"
                class="stocktaking-order-card pa-3 mb-2 rounded-lg cursor-pointer"
                :class="{ 'active-order-card': selectedOrder && selectedOrder.orderId === order.orderId }"
                v-on:click="onSelectOrder(order)"
              >
                <!-- 카드 상단: 실사 Order ID 및 상태 칩 -->
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-subtitle-2 text-primary">
                    {{ order.orderId }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="order.status === 'READY' ? 'primary' : order.status === 'IN_PROGRESS' ? 'warning' : 'success'"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{ order.status === 'READY' ? '대기' : order.status === 'IN_PROGRESS' ? '진행 중' : '완료' }}
                  </v-chip>
                </div>

                <!-- 카드 중단: 대상 구역 및 LOT -->
                <div class="d-flex align-center mb-1">
                  <v-icon icon="$mapMarkerOutline" size="14" color="primary" class="mr-1" />
                  <span class="text-caption font-weight-bold text-high-emphasis text-truncate">
                    {{ order.targetZone }}
                  </span>
                </div>

                <div class="text-caption font-weight-medium text-high-emphasis text-truncate mb-1">
                  [{{ order.itemCode }}] {{ order.itemName }}
                </div>
                <div class="text-caption text-medium-emphasis mb-2">
                  대상 LOT: <strong class="text-high-emphasis">{{ order.targetLot }}</strong>
                </div>

                <!-- 카드 하단: 실사 진행률 바 및 수량 -->
                <v-progress-linear
                  :model-value="(order.completedCarriers / order.totalCarriers) * 100"
                  color="primary"
                  height="6"
                  rounded
                  class="mb-2"
                ></v-progress-linear>

                <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis">
                  <span>
                    실사 진행: <strong class="text-primary">{{ order.completedCarriers }}</strong> / {{ order.totalCarriers }}대
                  </span>
                  <span>담당: {{ order.auditor }}</span>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- ================= [우측 패널] 실사 대상 캐리어 목록 및 제어 바 (너비 약 65%) ================= -->
      <v-col cols="12" md="8" class="d-flex flex-column">
        <!-- 상단 선택 오더 요약 인포 바 -->
        <v-card class="elevation-1 rounded-lg pa-4 mb-3 order-summary-banner bg-surface">
          <div v-if="!selectedOrder" class="text-center py-4 text-medium-emphasis">
            <v-icon icon="$clipboardCheckOutline" size="32" color="disabled" class="mb-1" />
            <div class="text-body-2 font-weight-medium">좌측 목록에서 진행할 재고 실사 오더를 선택해주세요.</div>
          </div>

          <div v-else class="d-flex flex-wrap align-center justify-space-between">
            <div class="d-flex align-center">
              <v-avatar color="primary" variant="tonal" size="44" class="mr-3">
                <v-icon icon="$scaleBalance" size="24" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="d-flex align-center flex-wrap">
                  <span class="text-subtitle-1 font-weight-bold text-high-emphasis mr-2">{{ selectedOrder.targetZone }}</span>
                  <v-chip size="small" color="primary" variant="flat" class="font-weight-bold mr-2">
                    {{ selectedOrder.orderId }}
                  </v-chip>
                  <v-chip size="small" color="secondary" variant="tonal" class="font-weight-medium">
                    LOT: {{ selectedOrder.targetLot }}
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  품목: [{{ selectedOrder.itemCode }}] {{ selectedOrder.itemName }} | 실사 예정일: {{ selectedOrder.plannedDate }}
                </div>
              </div>
            </div>

            <div class="d-flex align-center mt-2 mt-sm-0">
              <div class="text-end mr-3">
                <div class="text-caption text-medium-emphasis">실사 완료율</div>
                <div class="text-subtitle-2 font-weight-bold text-primary">
                  {{ selectedOrder.completedCarriers }} / {{ selectedOrder.totalCarriers }}대 ({{ ((selectedOrder.completedCarriers / selectedOrder.totalCarriers) * 100).toFixed(0) }}%)
                </div>
              </div>
              <v-chip size="small" color="primary" variant="outlined" class="font-weight-bold">
                잔여 {{ selectedOrder.totalCarriers - selectedOrder.completedCarriers }}대
              </v-chip>
            </div>
          </div>
        </v-card>

        <!-- 본문 실사 대상 캐리어 데이터 테이블 -->
        <v-card class="elevation-1 rounded-lg pa-4 flex-grow-1 d-flex flex-column stocktaking-table-card">
          <div class="panel-header mb-3">
            <div class="d-flex flex-wrap align-center justify-space-between">
              <div class="d-flex align-center mb-2 mb-sm-0">
                <v-icon icon="$packageVariant" size="18" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold">실사 대상 캐리어 목록</span>
                <v-chip size="x-small" color="primary" variant="tonal" class="ml-2 font-weight-bold">
                  {{ carrierList.length }}대
                </v-chip>
              </div>

              <!-- 검색창 -->
              <div class="d-flex align-center">
                <v-text-field
                  v-model="carrierSearchKeyword"
                  placeholder="Carrier ID / 위치 검색"
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

          <!-- BaseDataTable 연동 실사 대상 캐리어 목록 -->
          <div class="table-container flex-grow-1">
            <BaseDataTable
              v-model="selectedCarriers"
              :headers="carrierHeaders"
              :items="carrierList"
              :total-items="carrierList.length"
              :loading="isCarriersLoading"
              item-value="carrierId"
              :show-select="true"
              density="compact"
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
                <span class="text-caption font-weight-medium text-truncate">{{ item.itemName }}</span>
              </template>

              <!-- LOT ID -->
              <template #[`item.lotId`]="{ item }">
                <span class="text-caption font-weight-bold text-high-emphasis">{{ item.lotId }}</span>
              </template>

              <!-- 전산 등록 중량 (Book Weight) -->
              <template #[`item.bookWeight`]="{ item }">
                <span class="font-weight-medium">{{ item.bookWeight }} kg</span>
              </template>

              <!-- 실측 중량 (Actual Weight) -->
              <template #[`item.actualWeight`]="{ item }">
                <span v-if="item.actualWeight !== null" class="font-weight-bold text-primary">
                  {{ item.actualWeight }} kg
                </span>
                <span v-else class="text-caption text-medium-emphasis">미측정</span>
              </template>

              <!-- 오차 (Diff) -->
              <template #[`item.diffWeight`]="{ item }">
                <span
                  v-if="item.diffWeight !== null"
                  class="font-weight-bold"
                  :class="item.diffWeight < 0 ? 'text-error' : item.diffWeight > 0 ? 'text-warning' : 'text-success'"
                >
                  {{ item.diffWeight > 0 ? '+' : '' }}{{ item.diffWeight }} kg
                </span>
                <span v-else class="text-caption text-medium-emphasis">-</span>
              </template>

              <!-- 실사 상태 -->
              <template #[`item.status`]="{ item }">
                <v-chip
                  size="x-small"
                  :color="item.status === 'READY' ? 'primary' : item.status === 'MOVING' ? 'warning' : 'success'"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ item.status === 'READY' ? '대기' : item.status === 'MOVING' ? '반송 중' : '실사 완료' }}
                </v-chip>
              </template>
            </BaseDataTable>
          </div>

          <!-- 하단 액션 바 -->
          <v-divider class="my-3"></v-divider>
          <div class="d-flex flex-wrap align-center justify-space-between">
            <div class="d-flex align-center action-summary-text">
              <span class="text-caption text-medium-emphasis">선택된 캐리어:</span>
              <strong class="text-primary mx-1">{{ selectedCarriers.length }}대</strong>
            </div>

            <div class="d-flex align-center header-action-gap">
              <!-- 출고대로 반송 요청 버튼 -->
              <v-btn
                color="primary"
                variant="outlined"
                size="default"
                prepend-icon="$transitTransfer"
                class="font-weight-bold px-4 action-btn"
                :disabled="selectedCarriers.length === 0"
                :loading="isTransferring"
                v-on:click="onOpenTransferConfirm"
              >
                출고대로 반송 요청
              </v-btn>

              <!-- 재고 실사 완료 (중량 보정) 버튼 -->
              <v-btn
                color="success"
                variant="elevated"
                size="default"
                prepend-icon="$scaleBalance"
                class="font-weight-bold px-6 action-btn"
                :disabled="selectedCarriers.length !== 1"
                v-on:click="onOpenAdjustmentDialog"
              >
                재고 실사 완료 (중량 보정)
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ================= [팝업] 재고 실사 중량 보정 및 완료 팝업 ================= -->
    <v-dialog v-model="adjustDialog" max-width="650" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-success text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="$scaleBalance" class="mr-2" />
            <span class="text-subtitle-1 font-weight-bold">재고 실사 실측 중량 검증 및 전산 보정</span>
          </div>
          <v-btn icon="$close" variant="text" size="small" color="white" v-on:click="adjustDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <div v-if="targetCarrier" class="pa-3 bg-surface-variant rounded mb-3">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="font-weight-bold text-primary">{{ targetCarrier.carrierId }}</span>
              <v-chip size="x-small" color="secondary" variant="flat">{{ targetCarrier.location }}</v-chip>
            </div>
            <div class="text-caption text-high-emphasis">
              [{{ targetCarrier.itemCode }}] {{ targetCarrier.itemName }} (LOT: {{ targetCarrier.lotId }})
            </div>
          </div>

          <v-row density="comfortable">
            <!-- 전산 수량/중량 -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="adjustForm.bookWeight"
                label="전산 등록 중량 (Book Weight)"
                suffix="kg"
                variant="outlined"
                density="compact"
                readonly
                disabled
              ></v-text-field>
            </v-col>

            <!-- 실제 측정 중량 -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="adjustForm.actualWeight"
                label="실제 측정 중량 (Actual Weight)"
                suffix="kg"
                type="number"
                variant="outlined"
                density="compact"
                prepend-inner-icon="$scaleBalance"
              ></v-text-field>
            </v-col>

            <!-- 오차 자동 계산 라벨 -->
            <v-col cols="12">
              <v-alert
                :type="calculatedDiff < 0 ? 'warning' : calculatedDiff > 0 ? 'info' : 'success'"
                variant="tonal"
                density="compact"
                class="font-weight-medium"
              >
                <div class="d-flex justify-space-between align-center">
                  <span>중량 편차 (오차):</span>
                  <strong class="text-subtitle-2">
                    {{ calculatedDiff > 0 ? '+' : '' }}{{ calculatedDiff }} kg
                    ({{ calculatedDiffPct }}%)
                  </strong>
                </div>
              </v-alert>
            </v-col>

            <!-- 차이 사유 선택 -->
            <v-col cols="12">
              <v-select
                v-model="adjustForm.reasonCode"
                :items="diffReasonOptions"
                label="차이 사유 선택"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>

            <!-- 실사자 코멘트 -->
            <v-col cols="12">
              <v-textarea
                v-model="adjustForm.comments"
                label="실사자 메모 및 특이사항"
                rows="3"
                variant="outlined"
                density="compact"
                placeholder="계량 저울 상태, 분말 비산 발생 여부 등 상세 코멘트 입력"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 d-flex justify-end">
          <v-btn variant="outlined" color="secondary" v-on:click="adjustDialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            class="font-weight-bold px-6"
            :loading="isAdjusting"
            :disabled="!adjustForm.actualWeight"
            v-on:click="onSubmitAdjustment"
          >
            실사 완료 및 재고 보정
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 반송 확인 다이얼로그 -->
    <ConfirmDialog
      v-model="confirmDialog"
      title="실사 측정대 반송 지시 확인"
      :message="confirmMessage"
      confirm-text="반송 명령 전송"
      confirm-color="primary"
      icon="$transitTransfer"
      v-on:confirm="onExecuteTransfer"
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
import { useApi } from '@/composables/useApi'
import {
  fetchStockTakingOrdersApi,
  fetchStockTakingCarriersApi,
  requestStockTakingTransferApi,
  completeStockTakingAdjustmentApi,
} from '@/api/warehouse'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

// ==========================================
// 1. 상태 정의
// ==========================================
const stockOrderList = ref([])
const selectedOrder = ref(null)
const orderSearchKeyword = ref('')
const statusFilter = ref('ALL')

const carrierList = ref([])
const selectedCarriers = ref([])
const carrierSearchKeyword = ref('')

const adjustDialog = ref(false)
const targetCarrier = ref(null)
const adjustForm = reactive({
  bookWeight: 1000,
  actualWeight: 950,
  reasonCode: '공정 비산 및 계량 오차',
  comments: '현장 실측 저울 칭량 결과 50kg 감모 확인됨.',
})

const diffReasonOptions = [
  '공정 비산 및 계량 오차',
  '자연 건조 및 수분 증발 감모',
  '용기 벽면 잔류 분말',
  '전산 입력 착오 보정',
  '정상 일치 (오차 없음)',
]

const confirmDialog = ref(false)
const confirmMessage = ref('')
const snackbar = reactive({ show: false, message: '', color: 'success' })

const carrierHeaders = [
  { title: 'Carrier ID', key: 'carrierId', align: 'start', sortable: true },
  { title: '보관 위치 (Shelf)', key: 'location', align: 'center', sortable: true },
  { title: '품목명', key: 'itemName', align: 'start', sortable: true },
  { title: 'LOT ID', key: 'lotId', align: 'start', sortable: true },
  { title: '전산 중량', key: 'bookWeight', align: 'end', sortable: true },
  { title: '실측 중량', key: 'actualWeight', align: 'end', sortable: true },
  { title: '오차 (Diff)', key: 'diffWeight', align: 'end', sortable: true },
  { title: '실사 상태', key: 'status', align: 'center', sortable: true },
]

const { loading: isOrdersLoading, execute: executeFetchOrders } = useApi(fetchStockTakingOrdersApi)
const { loading: isCarriersLoading, execute: executeFetchCarriers } = useApi(fetchStockTakingCarriersApi)
const { loading: isTransferring, execute: executeTransfer } = useApi(requestStockTakingTransferApi)
const { loading: isAdjusting, execute: executeAdjust } = useApi(completeStockTakingAdjustmentApi)

// ==========================================
// 2. 계산된 속성 (Computeds)
// ==========================================
const filteredOrders = computed(function () {
  const kw = orderSearchKeyword.value.trim().toLowerCase()
  const st = statusFilter.value
  const result = []

  for (let i = 0; i < stockOrderList.value.length; i++) {
    const o = stockOrderList.value[i]

    if (st !== 'ALL' && o.status !== st) {
      continue
    }

    if (kw) {
      const matchId = o.orderId.toLowerCase().indexOf(kw) !== -1
      const matchZone = o.targetZone.toLowerCase().indexOf(kw) !== -1
      const matchLot = o.targetLot.toLowerCase().indexOf(kw) !== -1
      const matchName = o.itemName.toLowerCase().indexOf(kw) !== -1

      if (!matchId && !matchZone && !matchLot && !matchName) {
        continue
      }
    }

    result.push(o)
  }

  return result
})

const readyOrdersCount = computed(function () {
  let count = 0
  for (let i = 0; i < stockOrderList.value.length; i++) {
    if (stockOrderList.value[i].status === 'READY') {
      count = count + 1
    }
  }
  return count
})

const inProgressOrdersCount = computed(function () {
  let count = 0
  for (let i = 0; i < stockOrderList.value.length; i++) {
    if (stockOrderList.value[i].status === 'IN_PROGRESS') {
      count = count + 1
    }
  }
  return count
})

const calculatedDiff = computed(function () {
  const book = Number(adjustForm.bookWeight) || 0
  const actual = Number(adjustForm.actualWeight) || 0
  return actual - book
})

const calculatedDiffPct = computed(function () {
  const book = Number(adjustForm.bookWeight) || 1
  const diff = calculatedDiff.value
  return ((diff / book) * 100).toFixed(1)
})

// ==========================================
// 3. 헬퍼 및 핸들러 함수
// ==========================================
function showNotification(msg, color) {
  snackbar.message = msg
  snackbar.color = color || 'success'
  snackbar.show = true
}

function onSelectOrder(order) {
  selectedOrder.value = order
  selectedCarriers.value = []
  loadCarriers(order.orderId)
}

async function loadStockOrders() {
  try {
    const res = await executeFetchOrders()
    if (res && res.content && Array.isArray(res.content)) {
      stockOrderList.value = res.content
    } else if (Array.isArray(res)) {
      stockOrderList.value = res
    }

    if (stockOrderList.value.length > 0 && !selectedOrder.value) {
      onSelectOrder(stockOrderList.value[0])
    }
  } catch (err) {
    console.error('Failed to load stock taking orders:', err)
  }
}

async function loadCarriers(orderId) {
  try {
    const res = await executeFetchCarriers({
      orderId: orderId,
      searchKeyword: carrierSearchKeyword.value,
    })
    if (res && res.content && Array.isArray(res.content)) {
      carrierList.value = res.content
    } else if (Array.isArray(res)) {
      carrierList.value = res
    }
  } catch (err) {
    console.error('Failed to load stock taking carriers:', err)
  }
}

function handleSearchCarriers() {
  if (selectedOrder.value) {
    loadCarriers(selectedOrder.value.orderId)
  }
}

function onRefreshAll() {
  loadStockOrders()
  if (selectedOrder.value) {
    loadCarriers(selectedOrder.value.orderId)
  }
}

function onOpenTransferConfirm() {
  if (selectedCarriers.value.length === 0) return

  confirmMessage.value =
    '선택한 캐리어 ' +
    selectedCarriers.value.length +
    '대를\n' +
    '실측 측정 포트 [PORT_INSP_01](으)로 반송 요청하시겠습니까?'

  confirmDialog.value = true
}

async function onExecuteTransfer() {
  try {
    const carrierIds = []
    for (let i = 0; i < selectedCarriers.value.length; i++) {
      carrierIds.push(selectedCarriers.value[i].carrierId)
    }

    await executeTransfer({
      orderId: selectedOrder.value.orderId,
      carrierIds: carrierIds,
    })

    showNotification('실측 측정대로 캐리어 반송 지시가 전송되었습니다.', 'success')
    selectedCarriers.value = []
    loadCarriers(selectedOrder.value.orderId)
  } catch (err) {
    console.error('Transfer failed:', err)
    showNotification('반송 지시 중 오류가 발생했습니다.', 'error')
  }
}

function onOpenAdjustmentDialog() {
  if (selectedCarriers.value.length !== 1) return
  const c = selectedCarriers.value[0]
  targetCarrier.value = c
  adjustForm.bookWeight = c.bookWeight || 1000
  adjustForm.actualWeight = c.actualWeight !== null ? c.actualWeight : c.bookWeight - 50
  adjustDialog.value = true
}

async function onSubmitAdjustment() {
  try {
    await executeAdjust({
      orderId: selectedOrder.value.orderId,
      carrierId: targetCarrier.value.carrierId,
      bookWeight: adjustForm.bookWeight,
      actualWeight: adjustForm.actualWeight,
      diffWeight: calculatedDiff.value,
      reason: adjustForm.reasonCode + ' (' + adjustForm.comments + ')',
    })

    showNotification(
      '[' + targetCarrier.value.carrierId + '] 실측 중량 및 ERP 재고 보정이 완료되었습니다.',
      'success',
    )
    adjustDialog.value = false
    selectedCarriers.value = []

    if (selectedOrder.value) {
      selectedOrder.value.completedCarriers = selectedOrder.value.completedCarriers + 1
      selectedOrder.value.status = 'IN_PROGRESS'
    }

    loadCarriers(selectedOrder.value.orderId)
  } catch (err) {
    console.error('Adjustment failed:', err)
    showNotification('재고 보정 중 오류가 발생했습니다.', 'error')
  }
}

onMounted(function () {
  loadStockOrders()
})
</script>

<style scoped>
.stock-taking-view-container {
  max-width: 100%;
}

.split-view-row {
  min-height: calc(100vh - 165px);
}

.stocktaking-order-panel {
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

.stocktaking-order-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
  transition: all 0.18s ease-in-out;
}

.stocktaking-order-card:hover {
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

.stocktaking-table-card {
  border-top: 2px solid #2e7d32;
}

.carrier-search-field {
  max-width: 220px;
}

.table-container {
  overflow-y: auto;
  max-height: 380px;
}

.action-btn {
  letter-spacing: 0.5px;
  height: 40px !important;
}

.header-action-gap {
  gap: 6px;
}
</style>
