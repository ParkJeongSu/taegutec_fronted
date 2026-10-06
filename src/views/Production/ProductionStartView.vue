<template>
  <v-container fluid class="pa-4 production-view-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$play" size="26" color="primary" class="mr-2" />
          <div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold text-high-emphasis">
                조업 시작 (수동 투입 제어)
              </span>
              <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
                생산 관리 &gt; 수동 조업 제어 &gt; 투입 시작
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              대구텍 분말(POWDER) 공정 설비별 ERP 오더 및 원자재/중간재 LOT 캐리어를 지정하여 수동 투입 조업을 시작합니다.
            </div>
          </div>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-chip size="small" color="success" variant="flat" class="mr-2 font-weight-bold">
            가동 설비 {{ runningEquipmentCount }}대
          </v-chip>
          <v-chip size="small" color="primary" variant="outlined" class="mr-2 font-weight-medium">
            대기 오더 {{ readyOrderCount }}건
          </v-chip>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            :loading="isEquipmentLoading || isOrderLoading || isLotLoading"
            v-on:click="onRefreshAll"
          >
            {{ $t('common.refresh') }}
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- 3단 분할 레이아웃 -->
    <v-row class="split-view-row" density="comfortable">
      <!-- ================= [좌측 패널] 설비 계층 선택 트리 (너비 약 25%) ================= -->
      <v-col cols="12" md="3" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column equipment-panel">
          <!-- 좌측 상단 헤더 & 검색 -->
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon icon="$robotIndustrial" size="20" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold">설비 계층 목록</span>
              </div>
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                11개 그룹 / {{ totalEquipmentCount }}대
              </v-chip>
            </div>

            <v-text-field
              v-model="equipmentSearchKeyword"
              placeholder="설비명 / 코드 검색"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              class="mb-2"
            ></v-text-field>
          </div>

          <v-divider class="mb-2"></v-divider>

          <!-- 설비 아코디언 트리 영역 -->
          <div class="panel-scroll-area flex-grow-1">
            <div v-if="isEquipmentLoading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <v-expansion-panels
              v-else
              v-model="openedPanelIndexes"
              multiple
              variant="accordion"
              class="custom-expansion-panels"
            >
              <v-expansion-panel
                v-for="(group, gIdx) in filteredEquipmentGroups"
                :key="group.typeId"
                :value="gIdx"
                class="equipment-type-panel mb-2 rounded-lg"
              >
                <v-expansion-panel-title class="py-2 px-3">
                  <div class="d-flex align-center justify-space-between w-100 mr-2">
                    <div class="d-flex align-center">
                      <v-icon :icon="group.icon || '$cubeOutline'" size="18" color="primary" class="mr-2" />
                      <span class="font-weight-bold text-caption text-truncate">
                        {{ group.typeName }}
                      </span>
                    </div>
                    <v-chip size="x-small" :color="getGroupChipColor(group)" variant="flat">
                      {{ group.equipments.length }}대
                    </v-chip>
                  </div>
                </v-expansion-panel-title>

                <v-expansion-panel-text class="pa-0">
                  <div class="equipment-unit-list pt-1">
                    <div
                      v-for="eqp in group.equipments"
                      :key="eqp.eqpId"
                      class="equipment-unit-card pa-2 mb-1 rounded cursor-pointer"
                      :class="{ 'active-equipment-card': selectedEquipment && selectedEquipment.eqpId === eqp.eqpId }"
                      v-on:click="onSelectEquipment(eqp)"
                    >
                      <div class="d-flex align-center justify-space-between mb-1">
                        <div class="d-flex align-center">
                          <span class="font-weight-bold text-caption text-primary mr-1">
                            {{ eqp.eqpId }}
                          </span>
                          <span class="text-caption text-high-emphasis text-truncate font-weight-medium eqp-name-label">
                            {{ eqp.eqpName }}
                          </span>
                        </div>
                        <v-chip
                          size="x-small"
                          :color="getEqpStatusColor(eqp.status)"
                          variant="flat"
                          class="font-weight-bold"
                        >
                          {{ eqp.status }}
                        </v-chip>
                      </div>

                      <div class="d-flex align-center justify-space-between text-caption text-medium-emphasis">
                        <span class="text-truncate">
                          {{ eqp.currentOrder !== '-' ? eqp.currentOrder : '대기중' }}
                        </span>
                        <span>{{ eqp.temperature || '-' }}</span>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card>
      </v-col>

      <!-- ================= [우측 전체 영역] (너비 약 75%) ================= -->
      <v-col cols="12" md="9" class="d-flex flex-column">
        <!-- [우측 상단 패널] 설비 상태 대시보드 -->
        <v-card class="elevation-1 rounded-lg pa-4 mb-4 eqp-dashboard-card">
          <div v-if="!selectedEquipment" class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$robotIndustrial" size="36" color="disabled" class="mb-2" />
            <div class="text-body-2 font-weight-medium">좌측 목록에서 작업 대상 설비를 선택해주세요.</div>
          </div>

          <div v-else>
            <!-- 대시보드 헤더 -->
            <div class="d-flex flex-wrap align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-avatar color="primary" variant="tonal" size="42" class="mr-3">
                  <v-icon icon="$robotIndustrial" size="24" color="primary"></v-icon>
                </v-avatar>
                <div>
                  <div class="d-flex align-center">
                    <span class="text-subtitle-1 font-weight-bold mr-2">{{ selectedEquipment.eqpName }}</span>
                    <v-chip size="small" color="primary" variant="flat" class="font-weight-bold mr-2">
                      {{ selectedEquipment.eqpId }}
                    </v-chip>
                    <v-chip size="small" color="secondary" variant="tonal" class="font-weight-medium mr-2">
                      공정: {{ selectedEquipment.eqpType }}
                    </v-chip>
                    <v-chip size="small" :color="getEqpStatusColor(selectedEquipment.status)" variant="flat" class="font-weight-bold">
                      운전 상태: {{ selectedEquipment.status }}
                    </v-chip>
                  </div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ selectedEquipment.description }} (설비 설치 위치: {{ selectedEquipment.location || 'POWDER-1공장' }})
                  </div>
                </div>
              </div>

              <div class="d-flex align-center dashboard-action-chips">
                <v-chip size="small" variant="outlined" color="primary" class="font-weight-medium">
                  현재 오더: {{ selectedEquipment.currentOrder }}
                </v-chip>
                <v-chip size="small" variant="outlined" color="secondary" class="ml-2 font-weight-medium">
                  현재 배치: {{ selectedEquipment.currentLot }}
                </v-chip>
              </div>
            </div>

            <v-divider class="mb-3"></v-divider>

            <!-- 설비 상태 및 파라미터 4단 메트릭 카드 -->
            <v-row density="compact" class="dashboard-metrics-row">
              <v-col cols="6" sm="3">
                <div class="metric-box pa-2 rounded-lg bg-grey-lighten-4">
                  <div class="text-caption text-medium-emphasis">운전 / 누적 시간</div>
                  <div class="text-subtitle-2 font-weight-bold text-high-emphasis mt-1">
                    {{ selectedEquipment.runningHours || '0h 0m' }}
                  </div>
                </div>
              </v-col>

              <v-col cols="6" sm="3">
                <div class="metric-box pa-2 rounded-lg bg-grey-lighten-4">
                  <div class="text-caption text-medium-emphasis">공정 온도 (°C)</div>
                  <div class="text-subtitle-2 font-weight-bold text-primary mt-1">
                    {{ selectedEquipment.temperature || '-' }}
                  </div>
                </div>
              </v-col>

              <v-col cols="6" sm="3">
                <div class="metric-box pa-2 rounded-lg bg-grey-lighten-4">
                  <div class="text-caption text-medium-emphasis">압력 / 유량</div>
                  <div class="text-subtitle-2 font-weight-bold text-high-emphasis mt-1">
                    {{ selectedEquipment.pressure || selectedEquipment.flowRate || '-' }}
                  </div>
                </div>
              </v-col>

              <v-col cols="6" sm="3">
                <div class="metric-box pa-2 rounded-lg bg-grey-lighten-4">
                  <div class="text-caption text-medium-emphasis">설비 부하 / 속도</div>
                  <div class="text-subtitle-2 font-weight-bold text-success mt-1">
                    {{ selectedEquipment.speed || selectedEquipment.load || '-' }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card>

        <!-- [우측 하단 분할 패널] ERP 오더 목록 (좌측 50%) & LOT/Carrier 목록 (우측 50%) -->
        <v-row density="comfortable" class="flex-grow-1">
          <!-- ================= [우측 하단-좌측] 투입 가능 ERP 오더 목록 ================= -->
          <v-col cols="12" lg="6" class="d-flex flex-column">
            <v-card class="elevation-1 rounded-lg pa-3 fill-height d-flex flex-column sub-table-card">
              <div class="panel-header mb-2">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center">
                    <v-icon icon="$table" size="18" color="primary" class="mr-1" />
                    <span class="text-subtitle-2 font-weight-bold">투입 가능 ERP 오더 목록</span>
                  </div>
                  <v-chip size="x-small" color="primary" variant="flat">
                    {{ erpOrderList.length }}건
                  </v-chip>
                </div>

                <div class="d-flex align-center">
                  <v-text-field
                    v-model="orderSearchKeyword"
                    placeholder="오더번호 / 품목코드 / 품목명 검색"
                    variant="outlined"
                    density="compact"
                    hide-details
                    prepend-inner-icon="$magnify"
                    class="mr-2"
                    v-on:keyup.enter="handleSearchOrders"
                  ></v-text-field>
                  <v-btn color="primary" variant="tonal" size="small" v-on:click="handleSearchOrders">
                    검색
                  </v-btn>
                </div>
              </div>

              <!-- BaseDataTable 연동 오더 테이블 -->
              <div class="table-container flex-grow-1">
                <BaseDataTable
                  :headers="orderHeaders"
                  :items="erpOrderList"
                  :total-items="totalOrders"
                  :loading="isOrderLoading"
                  item-value="orderId"
                  :selected-key="selectedOrder ? selectedOrder.orderId : null"
                  density="compact"
                  v-on:click:row="onOrderRowClick"
                  v-on:update:options="onOrderOptionsUpdate"
                >
                  <template #[`item.selectRadio`]="{ item }">
                    <v-icon
                      :icon="selectedOrder && selectedOrder.orderId === item.orderId ? '$checkCircle' : '$checkboxOff'"
                      :color="selectedOrder && selectedOrder.orderId === item.orderId ? 'primary' : 'grey'"
                      size="18"
                    />
                  </template>

                  <template #[`item.orderId`]="{ item }">
                    <span class="font-weight-bold text-primary">{{ item.orderId }}</span>
                  </template>

                  <template #[`item.targetWeight`]="{ item }">
                    <span class="font-weight-medium">{{ Number(item.targetWeight).toFixed(2) }} t</span>
                  </template>

                  <template #[`item.status`]="{ item }">
                    <v-chip
                      size="x-small"
                      :color="item.status === 'RELEASED' ? 'success' : item.status === 'READY' ? 'primary' : 'grey'"
                      variant="flat"
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>

                  <template #[`item.dueDate`]="{ item }">
                    <span class="text-caption">{{ formatOrderDate(item.dueDate) }}</span>
                  </template>
                </BaseDataTable>
              </div>
            </v-card>
          </v-col>

          <!-- ================= [우측 하단-우측] 투입 대상 LOT & Carrier 목록 ================= -->
          <v-col cols="12" lg="6" class="d-flex flex-column">
            <v-card class="elevation-1 rounded-lg pa-3 fill-height d-flex flex-column sub-table-card">
              <div class="panel-header mb-2">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center">
                    <v-icon icon="$packageVariant" size="18" color="secondary" class="mr-1" />
                    <span class="text-subtitle-2 font-weight-bold">투입 대상 LOT &amp; Carrier 목록</span>
                    <v-chip v-if="selectedOrder" size="x-small" color="primary" variant="tonal" class="ml-2">
                      오더: {{ selectedOrder.orderId }}
                    </v-chip>
                  </div>
                  <v-chip size="x-small" color="secondary" variant="flat">
                    선택 {{ selectedLotItems.length }}건 / 총 {{ lotCarrierList.length }}건
                  </v-chip>
                </div>

                <div class="d-flex align-center">
                  <v-text-field
                    v-model="lotSearchKeyword"
                    placeholder="Carrier ID / LOT 번호 검색"
                    variant="outlined"
                    density="compact"
                    hide-details
                    prepend-inner-icon="$magnify"
                    class="mr-2"
                    v-on:keyup.enter="handleSearchLots"
                  ></v-text-field>
                  <v-btn color="secondary" variant="tonal" size="small" v-on:click="handleSearchLots">
                    검색
                  </v-btn>
                </div>
              </div>

              <!-- BaseDataTable 연동 LOT & Carrier 테이블 (다중 체크박스) -->
              <div class="table-container flex-grow-1">
                <BaseDataTable
                  v-model="selectedLotItems"
                  :headers="lotHeaders"
                  :items="lotCarrierList"
                  :total-items="totalLots"
                  :loading="isLotLoading"
                  item-value="carrierId"
                  :show-select="true"
                  density="compact"
                  v-on:update:options="onLotOptionsUpdate"
                >
                  <template #[`item.carrierId`]="{ item }">
                    <span class="font-weight-bold text-high-emphasis">{{ item.carrierId }}</span>
                  </template>

                  <template #[`item.batchLotNo`]="{ item }">
                    <span class="font-weight-medium text-primary">{{ item.batchLotNo }}</span>
                  </template>

                  <template #[`item.weight`]="{ item }">
                    <span class="font-weight-bold">{{ Number(item.weight).toFixed(2) }} t</span>
                  </template>

                  <template #[`item.status`]="{ item }">
                    <v-chip
                      size="x-small"
                      :color="item.status === 'STOCK' ? 'success' : item.status === 'WIP' ? 'warning' : 'grey'"
                      variant="flat"
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>

                  <template #[`item.location`]="{ item }">
                    <v-chip size="x-small" variant="outlined" color="primary">
                      {{ item.location }}
                    </v-chip>
                  </template>
                </BaseDataTable>

              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- ================= [우측 최하단] 조업 제어 액션 바 ================= -->
        <v-card class="elevation-2 rounded-lg pa-4 mt-4 action-bar-card bg-surface">
          <div class="d-flex flex-wrap align-center justify-space-between">
            <!-- 선택 요약 영역 -->
            <div class="d-flex flex-wrap align-center action-summary-group">
              <div class="summary-item mr-4 mb-2 mb-md-0">
                <span class="text-caption text-medium-emphasis">선택 설비:</span>
                <span class="font-weight-bold text-primary ml-1">
                  {{ selectedEquipment ? '[' + selectedEquipment.eqpId + '] ' + selectedEquipment.eqpName : '설비 미선택' }}
                </span>
              </div>

              <div class="summary-item mr-4 mb-2 mb-md-0">
                <span class="text-caption text-medium-emphasis">선택 오더:</span>
                <span class="font-weight-bold text-high-emphasis ml-1">
                  {{ selectedOrder ? selectedOrder.orderId + ' (' + selectedOrder.itemName + ')' : '오더 미선택' }}
                </span>
              </div>

              <div class="summary-item mr-4 mb-2 mb-md-0">
                <span class="text-caption text-medium-emphasis">투입 Carrier/LOT:</span>
                <span class="font-weight-bold text-success ml-1">
                  {{ selectedLotItems.length }}개
                </span>
                <span class="text-caption text-medium-emphasis ml-1">
                  (총 {{ selectedTotalWeight.toFixed(2) }} t)
                </span>
              </div>
            </div>

            <!-- 조업 시작 대형 CTA 버튼 -->
            <div class="d-flex align-center action-button-group">
              <v-btn
                color="primary"
                size="large"
                variant="elevated"
                prepend-icon="$play"
                class="font-weight-bold px-6 start-cta-btn"
                :disabled="!canStartProduction"
                :loading="isStarting"
                v-on:click="onOpenStartConfirm"
              >
                조업 시작 (수동 투입)
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 조업 시작 확인 다이얼로그 -->
    <ConfirmDialog
      v-model="confirmDialog"
      title="수동 조업 시작 확인"
      :message="confirmMessage"
      confirm-text="조업 시작"
      confirm-color="primary"
      icon="$play"
      v-on:confirm="onConfirmStart"
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
  fetchEquipmentHierarchyApi,
  fetchErpOrdersApi,
  fetchLotsAndCarriersApi,
  startProductionApi,
} from '@/api/production'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { formatDateTime } from '@/utils/dateUtils'

// ==========================================
// 1. 설비 상태 관리 (좌측 트리)
// ==========================================
const equipmentGroups = ref([])
const selectedEquipment = ref(null)
const equipmentSearchKeyword = ref('')
const openedPanelIndexes = ref([0, 1, 2, 6, 7])

const { loading: isEquipmentLoading, execute: executeFetchEquipments } = useApi(fetchEquipmentHierarchyApi)

// ==========================================
// 2. ERP 오더 목록 관리 (useDataTable 연동)
// ==========================================
const orderSearchKeyword = ref('')
const selectedOrder = ref(null)

const {
  items: erpOrderList,
  totalItems: totalOrders,
  loading: isOrderLoading,
  loadData: loadOrdersData,
  updateOptions: updateOrderOptions,
} = useDataTable(fetchErpOrdersApi)

const orderHeaders = [
  { title: '선택', key: 'selectRadio', width: '50px', align: 'center', sortable: false },
  { title: '오더번호', key: 'orderId', width: '120px', align: 'start' },
  { title: '품목코드', key: 'itemCode', width: '110px', align: 'start' },
  { title: '품목명', key: 'itemName', align: 'start' },
  { title: '목표중량', key: 'targetWeight', width: '90px', align: 'end' },
  { title: '상태', key: 'status', width: '85px', align: 'center' },
  { title: '납기일자', key: 'dueDate', width: '100px', align: 'center' },
]

// ==========================================
// 3. LOT & Carrier 목록 관리 (useDataTable 연동)
// ==========================================
const lotSearchKeyword = ref('')
const selectedLotItems = ref([])

const {
  items: lotCarrierList,
  totalItems: totalLots,
  loading: isLotLoading,
  loadData: loadLotsData,
  updateOptions: updateLotOptions,
} = useDataTable(fetchLotsAndCarriersApi)

const lotHeaders = [
  { title: 'Carrier ID', key: 'carrierId', width: '95px', align: 'start' },
  { title: 'Batch LOT 번호', key: 'batchLotNo', width: '140px', align: 'start' },
  { title: '원자재 LOT', key: 'rawMaterialLotNo', width: '130px', align: 'start' },
  { title: '중량(톤)', key: 'weight', width: '85px', align: 'end' },
  { title: '용기상태', key: 'status', width: '85px', align: 'center' },
  { title: '보관위치', key: 'location', width: '110px', align: 'center' },
]

// ==========================================
// 4. 조업 시작 액션 및 다이얼로그 상태
// ==========================================
const confirmDialog = ref(false)
const confirmMessage = ref('')
const snackbar = reactive({ show: false, message: '', color: 'success' })

const { loading: isStarting, execute: executeStartProduction } = useApi(startProductionApi)

// ==========================================
// 5. 계산된 속성들 (Computeds)
// ==========================================
const filteredEquipmentGroups = computed(function () {
  const kw = equipmentSearchKeyword.value.trim().toLowerCase()
  if (!kw) {
    return equipmentGroups.value
  }

  const result = []
  for (let i = 0; i < equipmentGroups.value.length; i++) {
    const group = equipmentGroups.value[i]
    const matchedEquipments = []

    for (let j = 0; j < group.equipments.length; j++) {
      const eqp = group.equipments[j]
      const idMatch = eqp.eqpId.toLowerCase().indexOf(kw) !== -1
      const nameMatch = eqp.eqpName.toLowerCase().indexOf(kw) !== -1
      const typeMatch = eqp.eqpType.toLowerCase().indexOf(kw) !== -1

      if (idMatch || nameMatch || typeMatch) {
        matchedEquipments.push(eqp)
      }
    }

    if (matchedEquipments.length > 0 || group.typeName.toLowerCase().indexOf(kw) !== -1) {
      result.push({
        typeId: group.typeId,
        typeName: group.typeName,
        icon: group.icon,
        equipments: matchedEquipments.length > 0 ? matchedEquipments : group.equipments,
      })
    }
  }
  return result
})

const totalEquipmentCount = computed(function () {
  let count = 0
  for (let i = 0; i < equipmentGroups.value.length; i++) {
    count = count + equipmentGroups.value[i].equipments.length
  }
  return count
})

const runningEquipmentCount = computed(function () {
  let count = 0
  for (let i = 0; i < equipmentGroups.value.length; i++) {
    const list = equipmentGroups.value[i].equipments
    for (let j = 0; j < list.length; j++) {
      if (list[j].status === 'RUN') {
        count = count + 1
      }
    }
  }
  return count
})

const readyOrderCount = computed(function () {
  let count = 0
  for (let i = 0; i < erpOrderList.value.length; i++) {
    if (erpOrderList.value[i].status === 'READY' || erpOrderList.value[i].status === 'RELEASED') {
      count = count + 1
    }
  }
  return count
})

const selectedTotalWeight = computed(function () {
  let total = 0
  for (let i = 0; i < selectedLotItems.value.length; i++) {
    const item = selectedLotItems.value[i]
    if (item && item.weight) {
      total = total + Number(item.weight)
    }
  }
  return total
})

const canStartProduction = computed(function () {
  return (
    selectedEquipment.value !== null &&
    selectedOrder.value !== null &&
    selectedLotItems.value.length > 0
  )
})

// ==========================================
// 6. 헬퍼 및 핸들러 함수들
// ==========================================
function getEqpStatusColor(status) {
  if (status === 'RUN') return 'success'
  if (status === 'IDLE') return 'primary'
  if (status === 'ALARM') return 'error'
  if (status === 'STOP') return 'grey'
  return 'secondary'
}

function getGroupChipColor(group) {
  for (let i = 0; i < group.equipments.length; i++) {
    if (group.equipments[i].status === 'ALARM') return 'error'
  }
  for (let i = 0; i < group.equipments.length; i++) {
    if (group.equipments[i].status === 'RUN') return 'success'
  }
  return 'primary'
}

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

function onSelectEquipment(eqp) {
  selectedEquipment.value = eqp

  // 선택된 설비의 공정 타입에 맞춰 오더 및 LOT 목록 필터 재조회
  loadOrdersData({ applicableProcess: eqp.eqpType, orderId: orderSearchKeyword.value })
  loadLotsData({ orderId: selectedOrder.value ? selectedOrder.value.orderId : null, searchKeyword: lotSearchKeyword.value })
}

function onOrderRowClick(event, row) {
  const item = row && row.item ? (row.item.raw || row.item) : (row && row.raw ? row.raw : row)
  if (!item) return

  selectedOrder.value = item
  selectedLotItems.value = []

  // 선택된 오더에 매핑된 LOT/Carrier 목록 필터링 조회
  loadLotsData({
    orderId: item.orderId,
    searchKeyword: lotSearchKeyword.value,
  })
}

function handleSearchOrders() {
  loadOrdersData({
    orderId: orderSearchKeyword.value,
    applicableProcess: selectedEquipment.value ? selectedEquipment.value.eqpType : null,
  })
}

function handleSearchLots() {
  loadLotsData({
    orderId: selectedOrder.value ? selectedOrder.value.orderId : null,
    searchKeyword: lotSearchKeyword.value,
  })
}

function onOrderOptionsUpdate(options) {
  updateOrderOptions(options, {
    orderId: orderSearchKeyword.value,
    applicableProcess: selectedEquipment.value ? selectedEquipment.value.eqpType : null,
  })
}

function onLotOptionsUpdate(options) {
  updateLotOptions(options, {
    orderId: selectedOrder.value ? selectedOrder.value.orderId : null,
    searchKeyword: lotSearchKeyword.value,
  })
}

async function loadEquipmentTree() {
  try {
    const res = await executeFetchEquipments()
    if (res && res.data && Array.isArray(res.data)) {
      equipmentGroups.value = res.data
    } else if (Array.isArray(res)) {
      equipmentGroups.value = res
    }

    // 초기 선택 설비 자동 지정 (예: 첫 번째 그룹의 첫 번째 가동/대기 설비)
    if (equipmentGroups.value.length > 0 && !selectedEquipment.value) {
      const firstGroup = equipmentGroups.value[0]
      if (firstGroup.equipments && firstGroup.equipments.length > 0) {
        onSelectEquipment(firstGroup.equipments[0])
      }
    }
  } catch (err) {
    console.error('Failed to load equipment tree:', err)
  }
}

function onRefreshAll() {
  loadEquipmentTree()
  handleSearchOrders()
  handleSearchLots()
}

function onOpenStartConfirm() {
  if (!canStartProduction.value) return

  const eqp = selectedEquipment.value
  const order = selectedOrder.value
  const carrierCount = selectedLotItems.value.length
  const weightStr = selectedTotalWeight.value.toFixed(2)

  confirmMessage.value =
    '[' +
    eqp.eqpId +
    ' - ' +
    eqp.eqpName +
    '] 설비에\n' +
    '오더 [' +
    order.orderId +
    ' / ' +
    order.itemName +
    '] 및 Carrier ' +
    carrierCount +
    '건(총 ' +
    weightStr +
    't)을 투입하여 조업을 시작하시겠습니까?'

  confirmDialog.value = true
}

async function onConfirmStart() {
  try {
    const carrierIds = []
    for (let i = 0; i < selectedLotItems.value.length; i++) {
      carrierIds.push(selectedLotItems.value[i].carrierId)
    }

    const payload = {
      eqpId: selectedEquipment.value.eqpId,
      orderId: selectedOrder.value.orderId,
      itemCode: selectedOrder.value.itemCode,
      carrierIds: carrierIds,
      totalWeight: selectedTotalWeight.value,
      operator: 'OP_POWDER_01',
      startMode: 'MANUAL_START',
    }

    await executeStartProduction(payload)

    // 설비 상태 갱신 (RUN 전환 및 현재 오더 매핑)
    if (selectedEquipment.value) {
      selectedEquipment.value.status = 'RUN'
      selectedEquipment.value.currentOrder = selectedOrder.value.orderId
      selectedEquipment.value.currentLot =
        selectedLotItems.value.length > 0 ? selectedLotItems.value[0].batchLotNo : '-'
      selectedEquipment.value.runningHours = '0h 01m'
    }

    showNotification(
      '[' + selectedEquipment.value.eqpId + '] 조업 시작 명령이 성공적으로 실행되었습니다.',
      'success',
    )

    // 선택 초기화 및 데이터 갱신
    selectedLotItems.value = []
    handleSearchOrders()
    handleSearchLots()
  } catch (err) {
    console.error('Start production failed:', err)
    showNotification('조업 시작 중 오류가 발생했습니다.', 'error')
  }
}

onMounted(function () {
  loadEquipmentTree()
  loadOrdersData()
  loadLotsData()
})
</script>

<style scoped>
.production-view-container {
  max-width: 100%;
}

.split-view-row {
  min-height: calc(100vh - 165px);
}

.equipment-panel {
  max-height: calc(100vh - 165px);
}

.panel-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 6px;
}

.panel-scroll-area {
  overflow-y: auto;
  max-height: calc(100vh - 275px);
  padding-right: 4px;
}

.custom-expansion-panels {
  background: transparent;
}

.equipment-type-panel {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
}

.equipment-unit-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
  background-color: #fcfcfc;
  transition: all 0.18s ease-in-out;
}

.equipment-unit-card:hover {
  background-color: rgba(46, 125, 50, 0.06);
  border-color: rgba(46, 125, 50, 0.35);
}

.active-equipment-card {
  background-color: rgba(46, 125, 50, 0.12) !important;
  border: 1px solid #2e7d32 !important;
  border-left: 4px solid #2e7d32 !important;
}

.eqp-name-label {
  max-width: 110px;
}

.eqp-dashboard-card {
  border-left: 4px solid #2e7d32;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbf9 100%);
}

.metric-box {
  border: 1px solid rgba(0, 0, 0, 0.06);
  min-height: 52px;
}

.sub-table-card {
  min-height: 380px;
  max-height: 440px;
}

.table-container {
  overflow-y: auto;
  max-height: 320px;
}

.action-bar-card {
  border-top: 2px solid #2e7d32;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05) !important;
}

.start-cta-btn {
  letter-spacing: 0.5px;
  height: 46px !important;
  font-size: 0.95rem;
}

.header-action-gap {
  gap: 6px;
}
</style>
