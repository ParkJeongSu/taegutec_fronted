<template>
  <v-container fluid class="pa-4 production-view-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$checkCircle" size="26" color="success" class="mr-2" />
          <div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold text-high-emphasis">
                조업 완료 (수동 완료 / 실적 등록)
              </span>
              <v-chip size="small" color="success" variant="tonal" class="ml-3 font-weight-medium">
                생산 관리 &gt; 수동 조업 제어 &gt; 실적 완료 처리
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              가공 진행 중인 설비의 공정을 완료하고, 최종 생산 LOT 번호, 실적 중량, 회수 용기 및 수율 정보를 등록합니다.
            </div>
          </div>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-chip size="small" color="success" variant="flat" class="mr-2 font-weight-bold">
            가동 중 설비 {{ runningEquipmentCount }}대
          </v-chip>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            :loading="isEquipmentLoading || isLotLoading"
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
          <!-- 좌측 상단 헤더 & 검색/필터 -->
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon icon="$robotIndustrial" size="20" color="primary" class="mr-1" />
                <span class="text-subtitle-2 font-weight-bold">설비 계층 목록</span>
              </div>
              <v-chip size="x-small" color="success" variant="tonal" class="font-weight-bold">
                가동 {{ runningEquipmentCount }} / 전체 {{ totalEquipmentCount }}대
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

            <v-btn-toggle
              v-model="filterOnlyRunning"
              mandatory
              density="compact"
              color="primary"
              variant="outlined"
              class="w-100"
            >
              <v-btn :value="false" size="small" class="flex-grow-1 font-weight-medium">전체 설비</v-btn>
              <v-btn :value="true" size="small" class="flex-grow-1 font-weight-bold" color="success">가동 중 설비만</v-btn>
            </v-btn-toggle>
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
                          {{ eqp.currentOrder !== '-' ? eqp.currentOrder : '가동 대기' }}
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
            <div class="text-body-2 font-weight-medium">좌측 목록에서 조업 완료할 설비를 선택해주세요.</div>
          </div>

          <div v-else>
            <!-- 대시보드 헤더 -->
            <div class="d-flex flex-wrap align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-avatar color="success" variant="tonal" size="42" class="mr-3">
                  <v-icon icon="$robotIndustrial" size="24" color="success"></v-icon>
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
                <v-chip size="small" variant="flat" color="primary" class="font-weight-bold">
                  완료 대상 오더: {{ selectedEquipment.currentOrder }}
                </v-chip>
                <v-chip size="small" variant="outlined" color="success" class="ml-2 font-weight-bold">
                  투입 배치: {{ selectedEquipment.currentLot }}
                </v-chip>
              </div>
            </div>

            <v-divider class="mb-3"></v-divider>

            <!-- 설비 상태 및 파라미터 4단 메트릭 카드 -->
            <v-row density="compact" class="dashboard-metrics-row">
              <v-col cols="6" sm="3">
                <div class="metric-box pa-2 rounded-lg bg-grey-lighten-4">
                  <div class="text-caption text-medium-emphasis">가공 가동 시간</div>
                  <div class="text-subtitle-2 font-weight-bold text-success mt-1">
                    {{ selectedEquipment.runningHours || '0h 0m' }}
                  </div>
                </div>
              </v-col>

              <v-col cols="6" sm="3">
                <div class="metric-box pa-2 rounded-lg bg-grey-lighten-4">
                  <div class="text-caption text-medium-emphasis">공정 완료 온도</div>
                  <div class="text-subtitle-2 font-weight-bold text-primary mt-1">
                    {{ selectedEquipment.temperature || '-' }}
                  </div>
                </div>
              </v-col>

              <v-col cols="6" sm="3">
                <div class="metric-box pa-2 rounded-lg bg-grey-lighten-4">
                  <div class="text-caption text-medium-emphasis">챔버 압력 / 유량</div>
                  <div class="text-subtitle-2 font-weight-bold text-high-emphasis mt-1">
                    {{ selectedEquipment.pressure || selectedEquipment.flowRate || '-' }}
                  </div>
                </div>
              </v-col>

              <v-col cols="6" sm="3">
                <div class="metric-box pa-2 rounded-lg bg-grey-lighten-4">
                  <div class="text-caption text-medium-emphasis">가공 부하 / 회전 속도</div>
                  <div class="text-subtitle-2 font-weight-bold text-high-emphasis mt-1">
                    {{ selectedEquipment.speed || selectedEquipment.load || '-' }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card>

        <!-- [우측 하단 분할 패널] 투입 현황 LOT 목록 (좌측 45%) & 실적 등록 폼 (우측 55%) -->
        <v-row density="comfortable" class="flex-grow-1">
          <!-- ================= [우측 하단-좌측] 현재 설비 투입 LOT 목록 ================= -->
          <v-col cols="12" lg="5" class="d-flex flex-column">
            <v-card class="elevation-1 rounded-lg pa-3 fill-height d-flex flex-column sub-table-card">
              <div class="panel-header mb-2">
                <div class="d-flex align-center justify-space-between mb-1">
                  <div class="d-flex align-center">
                    <v-icon icon="$table" size="18" color="primary" class="mr-1" />
                    <span class="text-subtitle-2 font-weight-bold">현재 투입 LOT &amp; Carrier</span>
                  </div>
                  <v-chip size="x-small" color="primary" variant="flat">
                    {{ currentEqpLotList.length }}건
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">
                  오더: {{ selectedEquipment ? selectedEquipment.currentOrder : '-' }} | 투입 총량: {{ inputTotalWeight.toFixed(2) }} t
                </div>
              </div>

              <!-- BaseDataTable 연동 현재 투입 LOT 테이블 -->
              <div class="table-container flex-grow-1">
                <BaseDataTable
                  :headers="activeLotHeaders"
                  :items="currentEqpLotList"
                  :total-items="currentEqpLotList.length"
                  :loading="isLotLoading"
                  item-value="carrierId"
                  density="compact"
                  :hide-footer="true"
                >
                  <template #[`item.carrierId`]="{ item }">
                    <span class="font-weight-bold text-primary">{{ item.carrierId }}</span>
                  </template>

                  <template #[`item.batchLotNo`]="{ item }">
                    <span class="font-weight-medium">{{ item.batchLotNo }}</span>
                  </template>

                  <template #[`item.weight`]="{ item }">
                    <span class="font-weight-bold">{{ Number(item.weight).toFixed(2) }} t</span>
                  </template>

                  <template #[`item.status`]="{ item }">
                    <v-chip
                      size="x-small"
                      :color="item.status === 'WIP' || item.status === 'RUN' ? 'warning' : 'success'"
                      variant="flat"
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                </BaseDataTable>

              </div>
            </v-card>
          </v-col>

          <!-- ================= [우측 하단-우측] 실적 등록 및 완료 입력 폼 ================= -->
          <v-col cols="12" lg="7" class="d-flex flex-column">
            <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column performance-form-card">
              <div class="panel-header mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <div class="d-flex align-center">
                    <v-icon icon="$contentSave" size="18" color="success" class="mr-1" />
                    <span class="text-subtitle-2 font-weight-bold">생산 실적 및 회수 정보 등록</span>
                  </div>
                  <v-chip
                    v-if="calculatedYield > 0"
                    size="small"
                    :color="calculatedYield >= 95 ? 'success' : calculatedYield >= 85 ? 'warning' : 'error'"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    공정 수율: {{ calculatedYield.toFixed(1) }}%
                  </v-chip>
                </div>
              </div>

              <!-- 실적 입력 폼 -->
              <div class="form-content-area flex-grow-1">
                <v-row density="compact">
                  <!-- 1. 생성 완료 배치 LOT 번호 -->
                  <v-col cols="12" sm="6">
                    <div class="text-caption font-weight-bold mb-1">생산 완료 LOT 번호 *</div>
                    <v-text-field
                      v-model="performanceForm.producedLotNo"
                      placeholder="예: LOT-PROD-20261006-001"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="$tagOutline"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 2. 실적 중량 (톤) -->
                  <v-col cols="12" sm="6">
                    <div class="text-caption font-weight-bold mb-1">실적 생산 중량 (t) *</div>
                    <v-text-field
                      v-model.number="performanceForm.actualWeight"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      variant="outlined"
                      density="compact"
                      suffix="Ton"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 3. 회수 대상 Carrier ID -->
                  <v-col cols="12" sm="6">
                    <div class="text-caption font-weight-bold mb-1">적재 회수 Carrier ID *</div>
                    <v-text-field
                      v-model="performanceForm.targetCarrierId"
                      placeholder="예: CR-901"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="$cubeOutline"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 4. 보관 적재 위치 / 포트 -->
                  <v-col cols="12" sm="6">
                    <div class="text-caption font-weight-bold mb-1">입고 적재 위치 (Shelf / Port) *</div>
                    <v-select
                      v-model="performanceForm.targetLocation"
                      :items="locationOptions"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                    ></v-select>
                  </v-col>

                  <!-- 5. 품질 판정 결과 -->
                  <v-col cols="12" sm="6">
                    <div class="text-caption font-weight-bold mb-1">품질 판정 결과</div>
                    <v-select
                      v-model="performanceForm.qualityResult"
                      :items="qualityOptions"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                    ></v-select>
                  </v-col>

                  <!-- 6. 스크랩/손실 중량 -->
                  <v-col cols="12" sm="6">
                    <div class="text-caption font-weight-bold mb-1">스크랩 / 손실 중량 (t)</div>
                    <v-text-field
                      v-model.number="performanceForm.scrapWeight"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      variant="outlined"
                      density="compact"
                      suffix="Ton"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 7. 작업자 성명 -->
                  <v-col cols="12" sm="6">
                    <div class="text-caption font-weight-bold mb-1">작업자 (사번 / 성명)</div>
                    <v-text-field
                      v-model="performanceForm.workerName"
                      placeholder="OP_POWDER_01 (홍길동)"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 8. 다음 공정 / 특이사항 -->
                  <v-col cols="12" sm="6">
                    <div class="text-caption font-weight-bold mb-1">다음 연계 공정</div>
                    <v-select
                      v-model="performanceForm.nextProcess"
                      :items="nextProcessOptions"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                    ></v-select>
                  </v-col>

                  <!-- 9. 조업 특이사항 및 비고 -->
                  <v-col cols="12">
                    <div class="text-caption font-weight-bold mb-1">조업 완료 비고 / 특이사항</div>
                    <v-textarea
                      v-model="performanceForm.remarks"
                      rows="2"
                      placeholder="가공 완료 상태, 분말 입도 측정치, 시료 채취 여부 등을 입력하세요."
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                    ></v-textarea>
                  </v-col>
                </v-row>
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
                <span class="text-caption text-medium-emphasis">완료 대상 설비:</span>
                <span class="font-weight-bold text-success ml-1">
                  {{ selectedEquipment ? '[' + selectedEquipment.eqpId + '] ' + selectedEquipment.eqpName : '설비 미선택' }}
                </span>
              </div>

              <div class="summary-item mr-4 mb-2 mb-md-0">
                <span class="text-caption text-medium-emphasis">오더 / 배치:</span>
                <span class="font-weight-bold text-high-emphasis ml-1">
                  {{ selectedEquipment ? selectedEquipment.currentOrder + ' / ' + selectedEquipment.currentLot : '-' }}
                </span>
              </div>

              <div class="summary-item mr-4 mb-2 mb-md-0">
                <span class="text-caption text-medium-emphasis">등록 실적:</span>
                <span class="font-weight-bold text-primary ml-1">
                  {{ performanceForm.actualWeight > 0 ? performanceForm.actualWeight + ' t' : '미입력' }}
                </span>
                <span v-if="calculatedYield > 0" class="text-caption text-medium-emphasis ml-1">
                  (수율 {{ calculatedYield.toFixed(1) }}%)
                </span>
              </div>
            </div>

            <!-- 조업 완료 대형 CTA 버튼 -->
            <div class="d-flex align-center action-button-group">
              <v-btn
                color="success"
                size="large"
                variant="elevated"
                prepend-icon="$checkCircle"
                class="font-weight-bold px-6 end-cta-btn"
                :disabled="!canEndProduction"
                :loading="isEnding"
                v-on:click="onOpenEndConfirm"
              >
                조업 완료 (실적 처리)
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 조업 완료 확인 다이얼로그 -->
    <ConfirmDialog
      v-model="confirmDialog"
      title="수동 조업 완료 및 실적 처리 확인"
      :message="confirmMessage"
      confirm-text="조업 완료 처리"
      confirm-color="success"
      icon="$checkCircle"
      v-on:confirm="onConfirmEnd"
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
  fetchLotsAndCarriersApi,
  endProductionApi,
} from '@/api/production'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

// ==========================================
// 1. 설비 상태 관리 (좌측 트리)
// ==========================================
const equipmentGroups = ref([])
const selectedEquipment = ref(null)
const equipmentSearchKeyword = ref('')
const filterOnlyRunning = ref(false)
const openedPanelIndexes = ref([0, 1, 2, 6, 7])

const { loading: isEquipmentLoading, execute: executeFetchEquipments } = useApi(fetchEquipmentHierarchyApi)

// ==========================================
// 2. 현재 투입 LOT 목록 관리 (useDataTable 연동)
// ==========================================
const {
  items: lotCarrierList,
  loading: isLotLoading,
  loadData: loadLotsData,
} = useDataTable(fetchLotsAndCarriersApi)

const activeLotHeaders = [
  { title: 'Carrier ID', key: 'carrierId', width: '90px', align: 'start' },
  { title: '투입 Batch LOT', key: 'batchLotNo', align: 'start' },
  { title: '투입량', key: 'weight', width: '80px', align: 'end' },
  { title: '상태', key: 'status', width: '70px', align: 'center' },
]

// ==========================================
// 3. 실적 등록 폼 모델
// ==========================================
const performanceForm = reactive({
  producedLotNo: '',
  actualWeight: 0,
  targetCarrierId: 'CR-901',
  targetLocation: 'STK-01-PORT-01',
  qualityResult: 'GOOD',
  scrapWeight: 0.02,
  workerName: 'OP_POWDER_01',
  nextProcess: 'Blending',
  remarks: '',
})

const locationOptions = [
  'STK-01-PORT-01',
  'STK-01-PORT-02',
  'SH-01-A-01',
  'SH-02-B-04',
  'SH-05-A-03',
  'SH-06-B-01',
  'Z-BUFFER-01',
]

const qualityOptions = [
  { title: 'GOOD (양품 정상)', value: 'GOOD' },
  { title: 'HOLD (검사 대기/보류)', value: 'HOLD' },
  { title: 'REWORK (재작업 요망)', value: 'REWORK' },
]

const nextProcessOptions = [
  'Income',
  'Doping',
  'Reduction',
  'Screen',
  'Blending',
  'Mixing',
  'Carburization',
  'Deagglomeration',
  'Packing',
  '출하 대기창고',
]

// ==========================================
// 4. 조업 완료 액션 및 다이얼로그 상태
// ==========================================
const confirmDialog = ref(false)
const confirmMessage = ref('')
const snackbar = reactive({ show: false, message: '', color: 'success' })

const { loading: isEnding, execute: executeEndProduction } = useApi(endProductionApi)

// ==========================================
// 5. 계산된 속성들 (Computeds)
// ==========================================
const filteredEquipmentGroups = computed(function () {
  const kw = equipmentSearchKeyword.value.trim().toLowerCase()
  const onlyRunning = filterOnlyRunning.value

  const result = []
  for (let i = 0; i < equipmentGroups.value.length; i++) {
    const group = equipmentGroups.value[i]
    const matchedEquipments = []

    for (let j = 0; j < group.equipments.length; j++) {
      const eqp = group.equipments[j]

      if (onlyRunning && eqp.status !== 'RUN') {
        continue
      }

      const idMatch = eqp.eqpId.toLowerCase().indexOf(kw) !== -1
      const nameMatch = eqp.eqpName.toLowerCase().indexOf(kw) !== -1
      const typeMatch = eqp.eqpType.toLowerCase().indexOf(kw) !== -1

      if (!kw || idMatch || nameMatch || typeMatch) {
        matchedEquipments.push(eqp)
      }
    }

    if (matchedEquipments.length > 0) {
      result.push({
        typeId: group.typeId,
        typeName: group.typeName,
        icon: group.icon,
        equipments: matchedEquipments,
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

const currentEqpLotList = computed(function () {
  if (!selectedEquipment.value || selectedEquipment.value.currentOrder === '-') {
    return []
  }
  const orderId = selectedEquipment.value.currentOrder
  const result = []
  for (let i = 0; i < lotCarrierList.value.length; i++) {
    const item = lotCarrierList.value[i]
    if (item.orderId === orderId) {
      result.push(item)
    }
  }
  return result.length > 0 ? result : lotCarrierList.value.slice(0, 2)
})

const inputTotalWeight = computed(function () {
  let total = 0
  for (let i = 0; i < currentEqpLotList.value.length; i++) {
    total = total + Number(currentEqpLotList.value[i].weight || 0)
  }
  return total > 0 ? total : 2.5
})

const calculatedYield = computed(function () {
  const actual = Number(performanceForm.actualWeight || 0)
  const input = Number(inputTotalWeight.value || 0)
  if (input <= 0 || actual <= 0) return 0
  return (actual / input) * 100
})

const canEndProduction = computed(function () {
  return (
    selectedEquipment.value !== null &&
    selectedEquipment.value.status === 'RUN' &&
    performanceForm.producedLotNo.trim().length > 0 &&
    Number(performanceForm.actualWeight) > 0
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
    if (group.equipments[i].status === 'RUN') return 'success'
  }
  for (let i = 0; i < group.equipments.length; i++) {
    if (group.equipments[i].status === 'ALARM') return 'error'
  }
  return 'primary'
}

function showNotification(msg, color) {
  snackbar.message = msg
  snackbar.color = color || 'success'
  snackbar.show = true
}

function generateProducedLotNo(eqp) {
  if (!eqp) return ''
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const prefix = eqp.eqpId ? eqp.eqpId.split('-')[0] : 'PRD'
  return 'LOT-' + prefix + '-' + dateStr + '-01'
}

function onSelectEquipment(eqp) {
  selectedEquipment.value = eqp

  // 생산 완료 폼 기본값 자동 세팅
  performanceForm.producedLotNo = generateProducedLotNo(eqp)
  performanceForm.actualWeight = eqp.status === 'RUN' ? 2.48 : 0
  performanceForm.targetCarrierId = 'CR-' + (Math.floor(Math.random() * 800) + 100)

  // 해당 설비의 오더에 매핑된 LOT 데이터 로드
  loadLotsData({
    orderId: eqp.currentOrder !== '-' ? eqp.currentOrder : null,
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

    // 가동 중인 첫 번째 설비 자동 선택
    if (equipmentGroups.value.length > 0 && !selectedEquipment.value) {
      let foundRunning = null
      for (let i = 0; i < equipmentGroups.value.length; i++) {
        const list = equipmentGroups.value[i].equipments
        for (let j = 0; j < list.length; j++) {
          if (list[j].status === 'RUN') {
            foundRunning = list[j]
            break
          }
        }
        if (foundRunning) break
      }
      if (foundRunning) {
        onSelectEquipment(foundRunning)
      } else if (equipmentGroups.value[0].equipments.length > 0) {
        onSelectEquipment(equipmentGroups.value[0].equipments[0])
      }
    }
  } catch (err) {
    console.error('Failed to load equipment tree in ProductionEndView:', err)
  }
}

function onRefreshAll() {
  loadEquipmentTree()
  if (selectedEquipment.value) {
    loadLotsData({
      orderId: selectedEquipment.value.currentOrder !== '-' ? selectedEquipment.value.currentOrder : null,
    })
  }
}

function onOpenEndConfirm() {
  if (!canEndProduction.value) return

  const eqp = selectedEquipment.value
  const form = performanceForm

  confirmMessage.value =
    '[' +
    eqp.eqpId +
    ' - ' +
    eqp.eqpName +
    '] 설비의 조업을 완료 처리하시겠습니까?\n\n' +
    '• 생산 LOT: ' +
    form.producedLotNo +
    '\n• 실적 중량: ' +
    form.actualWeight +
    ' t (수율 ' +
    calculatedYield.value.toFixed(1) +
    '%)\n' +
    '• 적재 용기: ' +
    form.targetCarrierId +
    ' (' +
    form.targetLocation +
    ')\n' +
    '• 품질 판정: ' +
    form.qualityResult

  confirmDialog.value = true
}

async function onConfirmEnd() {
  try {
    const payload = {
      eqpId: selectedEquipment.value.eqpId,
      orderId: selectedEquipment.value.currentOrder,
      producedLotNo: performanceForm.producedLotNo,
      actualWeight: performanceForm.actualWeight,
      targetCarrierId: performanceForm.targetCarrierId,
      targetLocation: performanceForm.targetLocation,
      qualityResult: performanceForm.qualityResult,
      scrapWeight: performanceForm.scrapWeight,
      workerName: performanceForm.workerName,
      nextProcess: performanceForm.nextProcess,
      remarks: performanceForm.remarks,
      completedAt: new Date().toISOString(),
    }

    await executeEndProduction(payload)

    // 설비 상태 갱신 (IDLE 전환 및 오더/배치 클리어)
    if (selectedEquipment.value) {
      selectedEquipment.value.status = 'IDLE'
      selectedEquipment.value.currentOrder = '-'
      selectedEquipment.value.currentLot = '-'
      selectedEquipment.value.runningHours = '0h 00m'
    }

    showNotification(
      '[' + selectedEquipment.value.eqpId + '] 조업 완료 및 생산 실적(' + performanceForm.actualWeight + 't)이 성공적으로 등록되었습니다.',
      'success',
    )

    // 폼 초기화
    performanceForm.actualWeight = 0
    performanceForm.remarks = ''
    onRefreshAll()
  } catch (err) {
    console.error('End production failed:', err)
    showNotification('조업 완료 처리 중 오류가 발생했습니다.', 'error')
  }
}

onMounted(function () {
  loadEquipmentTree()
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
  max-height: calc(100vh - 315px);
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
  border-left: 4px solid #43a047;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbf8 100%);
}

.metric-box {
  border: 1px solid rgba(0, 0, 0, 0.06);
  min-height: 52px;
}

.sub-table-card {
  min-height: 400px;
  max-height: 460px;
}

.performance-form-card {
  min-height: 400px;
  max-height: 460px;
  border-top: 2px solid #43a047;
}

.form-content-area {
  overflow-y: auto;
  max-height: 380px;
  padding-right: 4px;
}

.table-container {
  overflow-y: auto;
  max-height: 340px;
}

.action-bar-card {
  border-top: 2px solid #43a047;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05) !important;
}

.end-cta-btn {
  letter-spacing: 0.5px;
  height: 46px !important;
  font-size: 0.95rem;
}

.header-action-gap {
  gap: 6px;
}
</style>
