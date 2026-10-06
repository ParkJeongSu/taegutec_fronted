<template>
  <v-container fluid class="pa-4 debagging-view-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$packageVariantClosed" size="26" color="primary" class="mr-2" />
          <div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold text-high-emphasis">
                원자재 해포(Debagging) 작업 및 설비 제어
              </span>
              <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
                창고 관리 &gt; 해포 공정 &gt; Pallet 반송 및 완료 제어
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              입고된 FIBC Bag 원자재 Pallet을 전용 해포 설비(DEBAG-01/02)로 반송 지시하고,
              용기(Container) 분말 주입 실적을 수동/자동 완료 처리합니다.
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
            :loading="isOrdersLoading || isPalletsLoading"
            v-on:click="onRefreshAll"
          >
            {{ $t('common.refresh') }}
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- 2단 분할 레이아웃 -->
    <v-row class="split-view-row" density="comfortable">
      <!-- ================= [좌측 패널] 해포 오더 카드 리스트 (너비 약 35%) ================= -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card
          class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column debag-order-panel"
        >
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon icon="$fileDocumentOutline" size="20" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold">해포 작업 오더 목록</span>
              </div>
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                총 {{ filteredOrders.length }}건
              </v-chip>
            </div>

            <!-- 오더 검색 필드 -->
            <v-text-field
              v-model="orderSearchKeyword"
              placeholder="오더번호 / 설비 / 품목 검색"
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
              <v-btn value="IN_PROGRESS" size="small" class="flex-grow-1 font-weight-medium"
                >진행 중</v-btn
              >
            </v-btn-toggle>
          </div>

          <v-divider class="mb-2"></v-divider>

          <!-- 오더 카드 리스트 스크롤 영역 -->
          <div class="panel-scroll-area flex-grow-1">
            <div v-if="isOrdersLoading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <div
              v-else-if="filteredOrders.length === 0"
              class="text-center py-12 text-medium-emphasis"
            >
              <v-icon icon="$packageVariantClosed" size="36" color="disabled" class="mb-2" />
              <div class="text-caption">조건에 해당하는 해포 오더가 없습니다.</div>
            </div>

            <div v-else class="order-card-list">
              <div
                v-for="order in filteredOrders"
                :key="order.orderId"
                class="debag-order-card pa-3 mb-2 rounded-lg cursor-pointer"
                :class="{
                  'active-order-card': selectedOrder && selectedOrder.orderId === order.orderId,
                }"
                v-on:click="onSelectOrder(order)"
              >
                <!-- 카드 상단: 오더 ID 및 상태 칩 -->
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-subtitle-2 text-primary">
                    {{ order.orderId }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="
                      order.status === 'READY'
                        ? 'primary'
                        : order.status === 'IN_PROGRESS'
                          ? 'warning'
                          : 'success'
                    "
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{
                      order.status === 'READY'
                        ? '대기'
                        : order.status === 'IN_PROGRESS'
                          ? '진행 중'
                          : '완료'
                    }}
                  </v-chip>
                </div>

                <!-- 카드 중단: 지정 해포 설비 및 품목명 -->
                <div class="d-flex align-center mb-1">
                  <v-chip
                    size="x-small"
                    color="secondary"
                    variant="tonal"
                    class="mr-2 font-weight-bold"
                  >
                    {{ order.debagEquipId }}
                  </v-chip>
                  <span class="text-caption font-weight-bold text-high-emphasis text-truncate">
                    [{{ order.itemCode }}] {{ order.itemName }}
                  </span>
                </div>

                <div class="text-caption text-medium-emphasis mb-2">
                  원자재 LOT: <strong class="text-high-emphasis">{{ order.rawLotId }}</strong>
                </div>

                <!-- 카드 하단: 진행률 바 및 수량/중량 -->
                <v-progress-linear
                  :model-value="(order.processedPalletCount / order.plannedPalletCount) * 100"
                  color="primary"
                  height="6"
                  rounded
                  class="mb-2"
                ></v-progress-linear>

                <div
                  class="d-flex align-center justify-space-between text-caption text-medium-emphasis"
                >
                  <span>
                    해포 실적:
                    <strong class="text-primary">{{ order.processedPalletCount }}</strong> /
                    {{ order.plannedPalletCount }} Pallets
                  </span>
                  <span class="font-weight-bold text-high-emphasis">
                    {{ order.plannedWeight.toFixed(1) }} t
                  </span>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- ================= [우측 패널] 해포 대상 Pallet 목록 및 제어 바 (너비 약 65%) ================= -->
      <v-col cols="12" md="8" class="d-flex flex-column">
        <!-- 상단 선택 오더 요약 인포 바 -->
        <v-card class="elevation-1 rounded-lg pa-4 mb-3 order-summary-banner bg-surface">
          <div v-if="!selectedOrder" class="text-center py-4 text-medium-emphasis">
            <v-icon icon="$packageVariantClosed" size="32" color="disabled" class="mb-1" />
            <div class="text-body-2 font-weight-medium">
              좌측 목록에서 작업할 해포 오더를 선택해주세요.
            </div>
          </div>

          <div v-else class="d-flex flex-wrap align-center justify-space-between">
            <div class="d-flex align-center">
              <v-avatar color="primary" variant="tonal" size="44" class="mr-3">
                <v-icon icon="$robotIndustrial" size="24" color="primary"></v-icon>
              </v-avatar>
              <div>
                <div class="d-flex align-center flex-wrap">
                  <span class="text-subtitle-1 font-weight-bold text-high-emphasis mr-2">{{
                    selectedOrder.itemName
                  }}</span>
                  <v-chip size="small" color="primary" variant="flat" class="font-weight-bold mr-2">
                    {{ selectedOrder.orderId }}
                  </v-chip>
                  <v-chip size="small" color="secondary" variant="tonal" class="font-weight-medium">
                    지정 설비: {{ selectedOrder.debagEquipId }}
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  원자재 LOT: {{ selectedOrder.rawLotId }} | 대상 용기:
                  {{ selectedOrder.targetContainerType }}
                </div>
              </div>
            </div>

            <div class="d-flex align-center mt-2 mt-sm-0">
              <div class="text-end mr-3">
                <div class="text-caption text-medium-emphasis">해포 진행률</div>
                <div class="text-subtitle-2 font-weight-bold text-primary">
                  {{ selectedOrder.processedPalletCount }} /
                  {{ selectedOrder.plannedPalletCount }} Pallets ({{
                    (
                      (selectedOrder.processedPalletCount / selectedOrder.plannedPalletCount) *
                      100
                    ).toFixed(0)
                  }}%)
                </div>
              </div>
              <v-chip size="small" color="primary" variant="outlined" class="font-weight-bold">
                잔여
                {{ selectedOrder.plannedPalletCount - selectedOrder.processedPalletCount }} Pallets
              </v-chip>
            </div>
          </div>
        </v-card>

        <!-- 본문 해포 대상 Pallet 데이터 테이블 -->
        <v-card class="elevation-1 rounded-lg pa-4 flex-grow-1 d-flex flex-column debag-table-card">
          <div class="panel-header mb-3">
            <div class="d-flex flex-wrap align-center justify-space-between">
              <div class="d-flex align-center mb-2 mb-sm-0">
                <v-icon icon="$pallet" size="18" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold"
                  >해포 대기 Pallet 목록 (FIBC Bag)</span
                >
                <v-chip
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="ml-2 font-weight-bold"
                >
                  {{ palletList.length }}개
                </v-chip>
              </div>

              <!-- 빠른 검색창 -->
              <div class="d-flex align-center">
                <v-text-field
                  v-model="palletSearchKeyword"
                  placeholder="Pallet ID / Bag ID 검색"
                  variant="outlined"
                  density="compact"
                  hide-details
                  prepend-inner-icon="$magnify"
                  class="mr-2 pallet-search-field"
                  v-on:keyup.enter="handleSearchPallets"
                ></v-text-field>
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  v-on:click="handleSearchPallets"
                >
                  검색
                </v-btn>
              </div>
            </div>
          </div>

          <!-- BaseDataTable 연동 Pallet 목록 -->
          <div class="table-container flex-grow-1">
            <BaseDataTable
              v-model="selectedPallets"
              :headers="palletHeaders"
              :items="palletList"
              :total-items="palletList.length"
              :loading="isPalletsLoading"
              item-value="palletId"
              :show-select="true"
              density="compact"
            >
              <!-- Pallet ID -->
              <template #[`item.palletId`]="{ item }">
                <span class="font-weight-bold text-primary">{{ item.palletId }}</span>
              </template>

              <!-- FIBC Bag ID -->
              <template #[`item.fibcBagId`]="{ item }">
                <v-chip
                  size="x-small"
                  variant="outlined"
                  color="primary"
                  class="font-weight-medium"
                >
                  {{ item.fibcBagId }}
                </v-chip>
              </template>

              <!-- 원자재 LOT -->
              <template #[`item.rawLotId`]="{ item }">
                <span class="text-caption font-weight-bold text-high-emphasis">{{
                  item.rawLotId
                }}</span>
              </template>

              <!-- 중량 -->
              <template #[`item.weight`]="{ item }">
                <span class="font-weight-bold">{{ Number(item.weight).toFixed(3) }} t</span>
              </template>

              <!-- 현재 위치 -->
              <template #[`item.location`]="{ item }">
                <v-chip size="x-small" variant="tonal" color="secondary" class="font-weight-medium">
                  {{ item.location }}
                </v-chip>
              </template>

              <!-- 상태 -->
              <template #[`item.status`]="{ item }">
                <v-chip
                  size="x-small"
                  :color="
                    item.status === 'READY'
                      ? 'primary'
                      : item.status === 'MOVING'
                        ? 'warning'
                        : 'success'
                  "
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{
                    item.status === 'READY' ? '대기' : item.status === 'MOVING' ? '반송 중' : '완료'
                  }}
                </v-chip>
              </template>
            </BaseDataTable>
          </div>

          <!-- 하단 액션 바 -->
          <v-divider class="my-3"></v-divider>
          <div class="d-flex flex-wrap align-center justify-space-between">
            <div class="d-flex align-center action-summary-text">
              <span class="text-caption text-medium-emphasis">선택된 Pallet:</span>
              <strong class="text-primary mx-1">{{ selectedPallets.length }}개</strong>
              <span class="text-caption text-medium-emphasis">| 총 중량:</span>
              <strong class="text-success mx-1">{{ selectedTotalWeight.toFixed(3) }} t</strong>
            </div>

            <div class="d-flex align-center header-action-gap">
              <!-- 해포 설비 반송 버튼 -->
              <v-btn
                color="primary"
                variant="outlined"
                size="default"
                prepend-icon="$transitTransfer"
                class="font-weight-bold px-4 action-btn"
                :disabled="selectedPallets.length === 0"
                v-on:click="onOpenTransferDialog"
              >
                해포 설비 반송
              </v-btn>

              <!-- 해포 완료 처리 (수동) 버튼 -->
              <v-btn
                color="success"
                variant="elevated"
                size="default"
                prepend-icon="$checkCircle"
                class="font-weight-bold px-6 action-btn"
                :disabled="!selectedOrder || selectedPallets.length === 0"
                v-on:click="onOpenManualCompleteDialog"
              >
                해포 완료 처리 (수동)
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ================= [팝업 1] 해포 설비 반송 팝업 ================= -->
    <v-dialog v-model="transferDialog" max-width="700" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="$transitTransfer" class="mr-2" />
            <span class="text-subtitle-1 font-weight-bold">해포 설비 반송 요청</span>
          </div>
          <v-btn
            icon="$close"
            variant="text"
            size="small"
            color="white"
            v-on:click="transferDialog = false"
          ></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <!-- AS-IS: class="mb-4 pa-3 bg-surface-variant rounded" -->
          <!-- TO-BE: -->
          <div v-if="selectedOrder" class="mb-4 pa-3 order-info-box rounded">
            <div class="text-caption text-secondary-label mb-1">선택 오더 정보</div>
            <div class="font-weight-bold text-main-title">
              [{{ selectedOrder.orderId }}] {{ selectedOrder.itemName }} (LOT:
              {{ selectedOrder.rawLotId }})
            </div>
          </div>

          <div class="mb-3">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-1">
              반송 대상 Pallet 목록 (총 {{ selectedPallets.length }}건 /
              {{ selectedTotalWeight.toFixed(3) }} t)
            </div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="p in selectedPallets"
                :key="p.palletId"
                size="small"
                color="primary"
                variant="outlined"
                class="mr-1 mb-1 font-weight-medium"
              >
                {{ p.palletId }} ({{ p.fibcBagId }})
              </v-chip>
            </div>
          </div>

          <v-row density="compact" class="mt-2">
            <v-col cols="12" sm="6">
              <v-select
                v-model="transferForm.destinationEquip"
                :items="debagEquipOptions"
                label="목적지 해포 설비"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="transferForm.priority"
                :items="['NORMAL', 'HIGH', 'EMERGENCY']"
                label="반송 우선순위"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="transferForm.memo"
                label="반송 지시 메모"
                placeholder="설비 버퍼 인입 시 특이사항 입력"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 d-flex justify-end">
          <v-btn variant="outlined" color="secondary" v-on:click="transferDialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="font-weight-bold px-6"
            :loading="isTransferring"
            v-on:click="onSubmitTransfer"
          >
            반송 요청 (WCS 전송)
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================= [팝업 2] 해포 수동 완료 팝업 ================= -->
    <v-dialog v-model="manualCompleteDialog" max-width="800" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-success text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="$checkCircle" class="mr-2" />
            <span class="text-subtitle-1 font-weight-bold"
              >해포 완료 및 용기(Container) 주입 실적 등록</span
            >
          </div>
          <v-btn
            icon="$close"
            variant="text"
            size="small"
            color="white"
            v-on:click="manualCompleteDialog = false"
          ></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row density="comfortable">
            <!-- 좌측: 투입 대상 Pallet/Bag 요약 -->
            <v-col cols="12" md="5" class="border-end">
              <div class="text-subtitle-2 font-weight-bold text-high-emphasis mb-2">
                투입 원자재 요약
              </div>
              <!-- AS-IS: class="pa-3 bg-surface-variant rounded mb-3" -->
              <!-- TO-BE: -->
              <div v-if="selectedOrder" class="pa-3 order-info-box rounded mb-3">
                <div class="text-caption text-secondary-label">해포 오더</div>
                <div class="font-weight-bold text-main-title mb-1">{{ selectedOrder.orderId }}</div>
                <div class="text-caption text-secondary-label">품목 / LOT</div>
                <div class="font-weight-bold text-item-name">{{ selectedOrder.itemName }}</div>
                <div class="text-caption text-secondary-label">({{ selectedOrder.rawLotId }})</div>
              </div>

              <div class="text-caption font-weight-bold text-medium-emphasis mb-1">
                해포 처리 Pallet ({{ selectedPallets.length }}건)
              </div>
              <div class="selected-pallets-scroll pa-2 border rounded">
                <div
                  v-for="p in selectedPallets"
                  :key="p.palletId"
                  class="d-flex justify-space-between text-caption py-1 border-bottom"
                >
                  <span class="font-weight-medium text-high-emphasis">{{ p.palletId }}</span>
                  <span class="text-primary font-weight-bold"
                    >{{ Number(p.weight).toFixed(3) }} t</span
                  >
                </div>
              </div>
            </v-col>

            <!-- 우측: 수동 완료 입력 폼 -->
            <v-col cols="12" md="7">
              <div class="text-subtitle-2 font-weight-bold text-high-emphasis mb-2">
                용기 주입 및 실적 등록
              </div>

              <v-text-field
                v-model="manualCompleteForm.containerId"
                label="주입 완료 Container ID (바코드 스캔)"
                placeholder="예: CST-0101, CST-0102"
                variant="outlined"
                density="compact"
                prepend-inner-icon="$barcodeScan"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model.number="manualCompleteForm.actualWeight"
                label="분말 이송 실측 중량 (Actual Weight)"
                suffix="t"
                type="number"
                step="0.001"
                variant="outlined"
                density="compact"
                prepend-inner-icon="$scaleBalance"
                class="mb-3"
              ></v-text-field>

              <v-textarea
                v-model="manualCompleteForm.comments"
                label="특이사항 및 작업 코멘트"
                rows="3"
                variant="outlined"
                density="compact"
                placeholder="해포 설비 호퍼 투입 상태, 잔류 분말 여부, 특이사항 입력"
                class="memo-textarea"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 d-flex justify-end">
          <v-btn variant="outlined" color="secondary" v-on:click="manualCompleteDialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            class="font-weight-bold px-6"
            :loading="isCompleting"
            :disabled="!manualCompleteForm.containerId || !manualCompleteForm.actualWeight"
            v-on:click="onSubmitManualComplete"
          >
            해포 완료 실적 전송
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 확인 다이얼로그 -->
    <ConfirmDialog
      v-model="confirmDialog"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-text="confirmBtnText"
      confirm-color="primary"
      icon="$packageVariantClosed"
      v-on:confirm="onExecuteConfirmAction"
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
  fetchDebaggingOrdersApi,
  fetchDebaggingPalletsApi,
  transferPalletsToDebagEquipApi,
  completeManualDebaggingApi,
} from '@/api/warehouse'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

// ==========================================
// 1. 상태 정의
// ==========================================
const debagOrderList = ref([])
const selectedOrder = ref(null)
const orderSearchKeyword = ref('')
const statusFilter = ref('ALL')

const palletList = ref([])
const selectedPallets = ref([])
const palletSearchKeyword = ref('')

const debagEquipOptions = ['DEBAG-01', 'DEBAG-02', 'DEBAG-03']

const transferDialog = ref(false)
const transferForm = reactive({
  destinationEquip: 'DEBAG-01',
  priority: 'NORMAL',
  memo: '',
})

const manualCompleteDialog = ref(false)
const manualCompleteForm = reactive({
  containerId: 'CST-0101',
  actualWeight: 0,
  comments: '수동 해포 및 컨테이너 주입 정상 완료.',
})

const confirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmBtnText = ref('')
const pendingAction = ref(null)

const snackbar = reactive({ show: false, message: '', color: 'success' })

const palletHeaders = [
  { title: 'Pallet ID', key: 'palletId', align: 'start', sortable: true },
  { title: 'FIBC Bag ID', key: 'fibcBagId', align: 'start', sortable: true },
  { title: '원자재 LOT', key: 'rawLotId', align: 'start', sortable: true },
  { title: '중량 (t)', key: 'weight', align: 'end', sortable: true },
  { title: '현재 위치', key: 'location', align: 'center', sortable: true },
  { title: '상태', key: 'status', align: 'center', sortable: true },
]

const { loading: isOrdersLoading, execute: executeFetchOrders } = useApi(fetchDebaggingOrdersApi)
const { loading: isPalletsLoading, execute: executeFetchPallets } = useApi(fetchDebaggingPalletsApi)
const { loading: isTransferring, execute: executeTransfer } = useApi(transferPalletsToDebagEquipApi)
const { loading: isCompleting, execute: executeComplete } = useApi(completeManualDebaggingApi)

// ==========================================
// 2. 계산된 속성 (Computeds)
// ==========================================
const filteredOrders = computed(function () {
  const kw = orderSearchKeyword.value.trim().toLowerCase()
  const st = statusFilter.value
  const result = []

  for (let i = 0; i < debagOrderList.value.length; i++) {
    const o = debagOrderList.value[i]

    if (st !== 'ALL' && o.status !== st) {
      continue
    }

    if (kw) {
      const matchId = o.orderId.toLowerCase().indexOf(kw) !== -1
      const matchCode = o.itemCode.toLowerCase().indexOf(kw) !== -1
      const matchName = o.itemName.toLowerCase().indexOf(kw) !== -1
      const matchEquip = o.debagEquipId.toLowerCase().indexOf(kw) !== -1

      if (!matchId && !matchCode && !matchName && !matchEquip) {
        continue
      }
    }

    result.push(o)
  }

  return result
})

const readyOrdersCount = computed(function () {
  let count = 0
  for (let i = 0; i < debagOrderList.value.length; i++) {
    if (debagOrderList.value[i].status === 'READY') {
      count = count + 1
    }
  }
  return count
})

const inProgressOrdersCount = computed(function () {
  let count = 0
  for (let i = 0; i < debagOrderList.value.length; i++) {
    if (debagOrderList.value[i].status === 'IN_PROGRESS') {
      count = count + 1
    }
  }
  return count
})

const selectedTotalWeight = computed(function () {
  let total = 0
  for (let i = 0; i < selectedPallets.value.length; i++) {
    const p = selectedPallets.value[i]
    if (p && p.weight) {
      total = total + Number(p.weight)
    }
  }
  return total
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
  selectedPallets.value = []
  transferForm.destinationEquip = order.debagEquipId || 'DEBAG-01'
  loadPallets(order.orderId)
}

async function loadDebagOrders() {
  try {
    const res = await executeFetchOrders()
    if (res && res.content && Array.isArray(res.content)) {
      debagOrderList.value = res.content
    } else if (Array.isArray(res)) {
      debagOrderList.value = res
    }

    if (debagOrderList.value.length > 0 && !selectedOrder.value) {
      onSelectOrder(debagOrderList.value[0])
    }
  } catch (err) {
    console.error('Failed to load debagging orders:', err)
  }
}

async function loadPallets(orderId) {
  try {
    const res = await executeFetchPallets({
      orderId: orderId,
      searchKeyword: palletSearchKeyword.value,
    })
    if (res && res.content && Array.isArray(res.content)) {
      palletList.value = res.content
    } else if (Array.isArray(res)) {
      palletList.value = res
    }
  } catch (err) {
    console.error('Failed to load debagging pallets:', err)
  }
}

function handleSearchPallets() {
  if (selectedOrder.value) {
    loadPallets(selectedOrder.value.orderId)
  }
}

function onRefreshAll() {
  loadDebagOrders()
  if (selectedOrder.value) {
    loadPallets(selectedOrder.value.orderId)
  }
}

function onOpenTransferDialog() {
  if (selectedPallets.value.length === 0) return
  transferDialog.value = true
}

function onSubmitTransfer() {
  confirmTitle.value = '해포 설비 반송 명령 발행 확인'
  confirmMessage.value =
    '선택한 Pallet ' +
    selectedPallets.value.length +
    '건(총 ' +
    selectedTotalWeight.value.toFixed(3) +
    't)을\n' +
    '해포 설비 [' +
    transferForm.destinationEquip +
    '](으)로 반송 지시하시겠습니까?'
  confirmBtnText.value = '반송 지시 전송'
  pendingAction.value = 'TRANSFER'
  confirmDialog.value = true
}

function onOpenManualCompleteDialog() {
  if (!selectedOrder.value || selectedPallets.value.length === 0) return
  manualCompleteForm.actualWeight = Number(selectedTotalWeight.value.toFixed(3))
  manualCompleteForm.containerId = 'CST-' + (Math.floor(Math.random() * 800) + 100)
  manualCompleteDialog.value = true
}

function onSubmitManualComplete() {
  confirmTitle.value = '해포 완료 및 실적 등록 확인'
  confirmMessage.value =
    '[' +
    selectedOrder.value.orderId +
    '] 오더의\n' +
    '선택된 Pallet ' +
    selectedPallets.value.length +
    '건을\n' +
    'Container [' +
    manualCompleteForm.containerId +
    '](으)로 해포 완료 등록하시겠습니까?\n\n' +
    '• 실측 중량: ' +
    manualCompleteForm.actualWeight +
    ' t'
  confirmBtnText.value = '해포 완료 등록'
  pendingAction.value = 'COMPLETE'
  confirmDialog.value = true
}

async function onExecuteConfirmAction() {
  if (pendingAction.value === 'TRANSFER') {
    try {
      const palletIds = []
      for (let i = 0; i < selectedPallets.value.length; i++) {
        palletIds.push(selectedPallets.value[i].palletId)
      }

      await executeTransfer({
        orderId: selectedOrder.value.orderId,
        palletIds: palletIds,
        destinationEquip: transferForm.destinationEquip,
        priority: transferForm.priority,
        memo: transferForm.memo,
      })

      showNotification('해포 설비 반송 명령이 성공적으로 전송되었습니다.', 'success')
      transferDialog.value = false
      selectedPallets.value = []
      loadPallets(selectedOrder.value.orderId)
    } catch (err) {
      console.error('Transfer failed:', err)
      showNotification('반송 지시 중 오류가 발생했습니다.', 'error')
    }
  } else if (pendingAction.value === 'COMPLETE') {
    try {
      await executeComplete({
        orderId: selectedOrder.value.orderId,
        containerId: manualCompleteForm.containerId,
        actualWeight: manualCompleteForm.actualWeight,
        comments: manualCompleteForm.comments,
      })

      showNotification('해포 완료 및 Container 실적이 정상 등록되었습니다.', 'success')
      manualCompleteDialog.value = false
      selectedPallets.value = []

      if (selectedOrder.value) {
        selectedOrder.value.processedPalletCount = selectedOrder.value.processedPalletCount + 1
        selectedOrder.value.status = 'IN_PROGRESS'
      }

      loadPallets(selectedOrder.value.orderId)
    } catch (err) {
      console.error('Manual complete failed:', err)
      showNotification('완료 실적 등록 중 오류가 발생했습니다.', 'error')
    }
  }
}

onMounted(function () {
  loadDebagOrders()
})
</script>

<style scoped>
.debagging-view-container {
  max-width: 100%;
}

.split-view-row {
  min-height: calc(100vh - 165px);
}

.debag-order-panel {
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

.debag-order-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
  transition: all 0.18s ease-in-out;
}

.debag-order-card:hover {
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

.debag-table-card {
  border-top: 2px solid #2e7d32;
}

.pallet-search-field {
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

.selected-pallets-scroll {
  max-height: 160px;
  overflow-y: auto;
}

.memo-textarea :deep(textarea) {
  font-size: 0.825rem;
  color: #212121 !important;
  line-height: 1.4;
}

.header-action-gap {
  gap: 6px;
}

/* 오더 정보 요약 박스 (팝업 공통) */
.order-info-box {
  background-color: #f1f8e9 !important; /* Vuetify 테마의 background(#F1F8E9)와 동일한 밝은 톤 */
  border: 1px solid #c8e6c9 !important; /* 은은한 녹색 테두리 */
}

/* 라벨 텍스트: 중간 채도 그레이 */
.text-secondary-label {
  color: #558b2f !important;
  font-weight: 500;
}

/* 주요 오더 ID 및 타이틀: 선명한 짙은 흑색 */
.text-main-title {
  color: #1b5e20 !important;
  font-size: 0.95rem;
}

/* 품목명: 강조 텍스트 */
.text-item-name {
  color: #2e7d32 !important;
  font-size: 0.95rem;
}
</style>
