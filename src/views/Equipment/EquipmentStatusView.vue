<template>
  <v-container fluid class="pa-4 equipment-status-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$devices" size="26" color="primary" class="mr-2" />
          <div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold text-high-emphasis">설비 현황 모니터링</span>
              <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
                설비 관리 &gt; 설비 모니터링 &gt; 설비 현황
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              대구텍 분말(POWDER) 11개 공정 설비의 실시간 운전 상태, 가동률, 점검 메모, 알람 및
              SV/PV 레시피를 모니터링합니다.
            </div>
          </div>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-chip size="small" color="success" variant="flat" class="mr-2 font-weight-bold">
            가동 {{ runningEquipmentCount }}대
          </v-chip>
          <v-chip
            v-if="alarmEquipmentCount > 0"
            size="small"
            color="error"
            variant="flat"
            class="mr-2 font-weight-bold"
          >
            알람 {{ alarmEquipmentCount }}대
          </v-chip>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            :loading="isEquipmentLoading || isDetailLoading"
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
                      <v-icon
                        :icon="group.icon || '$cubeOutline'"
                        size="18"
                        color="primary"
                        class="mr-2"
                      />
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
                      :class="{
                        'active-equipment-card':
                          selectedEquipment && selectedEquipment.eqpId === eqp.eqpId,
                      }"
                      v-on:click="onSelectEquipment(eqp)"
                    >
                      <div class="d-flex align-center justify-space-between mb-1">
                        <div class="d-flex align-center">
                          <span class="font-weight-bold text-caption text-primary mr-1">
                            {{ eqp.eqpId }}
                          </span>
                          <span
                            class="text-caption text-high-emphasis text-truncate font-weight-medium eqp-name-label"
                          >
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

                      <div
                        class="d-flex align-center justify-space-between text-caption text-medium-emphasis"
                      >
                        <span class="text-truncate">
                          {{ eqp.currentOrder !== '-' ? eqp.currentOrder : '대기' }}
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
        <!-- [우측 상단 패널] 설비 가동률 요약 및 설비 메모/지시사항 영역 -->
        <v-card class="elevation-1 rounded-lg pa-4 mb-4 eqp-summary-card">
          <div v-if="!selectedEquipment" class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$robotIndustrial" size="36" color="disabled" class="mb-2" />
            <div class="text-body-2 font-weight-medium">좌측 목록에서 설비를 선택해주세요.</div>
          </div>

          <div v-else>
            <v-row density="comfortable" class="align-center">
              <!-- 설비 메타 정보 및 가동률 게이지 (좌측 60%) -->
              <v-col cols="12" lg="7">
                <div class="d-flex align-center mb-3">
                  <v-avatar color="primary" variant="tonal" size="48" class="mr-3">
                    <v-icon icon="$robotIndustrial" size="28" color="primary"></v-icon>
                  </v-avatar>
                  <div>
                    <div class="d-flex align-center flex-wrap">
                      <span class="text-h6 font-weight-bold mr-2">{{
                        selectedEquipment.eqpName
                      }}</span>
                      <v-chip
                        size="small"
                        color="primary"
                        variant="flat"
                        class="font-weight-bold mr-2"
                      >
                        {{ selectedEquipment.eqpId }}
                      </v-chip>
                      <v-chip
                        size="small"
                        color="secondary"
                        variant="tonal"
                        class="font-weight-medium mr-2"
                      >
                        {{ selectedEquipment.eqpType }}
                      </v-chip>
                      <v-chip
                        size="small"
                        :color="getEqpStatusColor(selectedEquipment.status)"
                        variant="flat"
                        class="font-weight-bold"
                      >
                        {{ selectedEquipment.status }}
                      </v-chip>
                    </div>
                    <div class="text-caption text-medium-emphasis mt-1">
                      설치 위치: {{ selectedEquipment.location || 'POWDER-1공장' }} | 현재 오더:
                      {{ selectedEquipment.currentOrder }} | 배치:
                      {{ selectedEquipment.currentLot }}
                    </div>
                  </div>
                </div>

                <!-- 가동률 프로그레스 바 & 시간 메트릭 -->
                <div class="utilization-box pa-3 rounded-lg bg-grey-lighten-4 mb-2">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-caption font-weight-bold text-high-emphasis"
                      >실시간 설비 가동률 (Overall Equipment Efficiency)</span
                    >
                    <span class="text-subtitle-2 font-weight-bold text-primary"
                      >{{ currentDetail.utilizationRate.toFixed(1) }}%</span
                    >
                  </div>
                  <v-progress-linear
                    :model-value="currentDetail.utilizationRate"
                    :color="
                      currentDetail.utilizationRate >= 80
                        ? 'success'
                        : currentDetail.utilizationRate >= 50
                          ? 'primary'
                          : 'warning'
                    "
                    height="8"
                    rounded
                    class="mb-2"
                  ></v-progress-linear>
                  <div
                    class="d-flex align-center justify-space-between text-caption text-medium-emphasis"
                  >
                    <span
                      >금일 가동 시간:
                      <strong class="text-high-emphasis">{{
                        currentDetail.runningHours
                      }}</strong></span
                    >
                    <span
                      >정지/대기 시간:
                      <strong class="text-high-emphasis">{{
                        currentDetail.stopHours
                      }}</strong></span
                    >
                    <span
                      >온도:
                      <strong class="text-primary">{{
                        selectedEquipment.temperature || '-'
                      }}</strong></span
                    >
                  </div>
                </div>
              </v-col>

              <!-- 설비 메모 입력창 (Maintenance Memo) (우측 40%) -->
              <v-col cols="12" lg="5">
                <v-card variant="outlined" class="pa-3 memo-card bg-surface">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <div class="d-flex align-center">
                      <v-icon icon="$pencil" size="16" color="primary" class="mr-1" />
                      <span class="text-caption font-weight-bold text-high-emphasis"
                        >설비 점검 메모 / 인수인계</span
                      >
                    </div>
                    <v-btn
                      color="primary"
                      size="x-small"
                      variant="flat"
                      prepend-icon="$contentSave"
                      :loading="isSavingMemo"
                      v-on:click="onSaveMemo"
                    >
                      메모 저장
                    </v-btn>
                  </div>
                  <v-textarea
                    v-model="maintenanceMemoText"
                    rows="3"
                    placeholder="설비 특이사항, 점검 내용 또는 작업자 인수인계 메모를 입력하세요."
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="memo-textarea text-caption text-high-emphasis"
                  ></v-textarea>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card>

        <!-- [우측 하단 패널] 설비 상세 모니터링 3-Grid 영역 (알람 / SV / PV) -->
        <v-row density="comfortable" class="flex-grow-1">
          <!-- ================= [카드 1] 실시간 알람 현황 (Real-Time Alarms) ================= -->
          <v-col cols="12" lg="4" class="d-flex flex-column">
            <v-card
              class="elevation-1 rounded-lg pa-3 fill-height d-flex flex-column sub-grid-card"
            >
              <div class="panel-header mb-2 d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon
                    icon="$alarm"
                    size="18"
                    :color="currentDetail.alarms.length > 0 ? 'error' : 'success'"
                    class="mr-1"
                  />
                  <span class="text-subtitle-2 font-weight-bold">실시간 알람 현황</span>
                </div>
                <v-chip
                  size="x-small"
                  :color="currentDetail.alarms.length > 0 ? 'error' : 'success'"
                  variant="flat"
                >
                  {{ currentDetail.alarms.length }}건
                </v-chip>
              </div>

              <div class="grid-content-area flex-grow-1">
                <div v-if="currentDetail.alarms.length === 0" class="text-center py-8">
                  <v-icon icon="$checkCircle" size="36" color="success" class="mb-2" />
                  <div class="text-caption text-success font-weight-medium">
                    현재 발생 중인 알람이 없습니다.
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    설비가 정상 규격 내에서 안정적으로 운전 중입니다.
                  </div>
                </div>

                <v-table v-else density="compact" class="custom-monitoring-table">
                  <thead>
                    <tr>
                      <th class="text-start">발생 일시</th>
                      <th class="text-center">코드</th>
                      <th class="text-center">등급</th>
                      <th class="text-start">알람 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="alm in currentDetail.alarms" :key="alm.id">
                      <td class="text-caption">{{ formatDateTime(alm.eventTime) }}</td>
                      <td class="text-center font-weight-bold text-error">{{ alm.alarmCode }}</td>
                      <td class="text-center">
                        <v-chip
                          size="x-small"
                          :color="alm.severity === 'CRITICAL' ? 'error' : 'warning'"
                          variant="flat"
                        >
                          {{ alm.severity }}
                        </v-chip>
                      </td>
                      <td class="text-caption text-truncate" :title="alm.description">
                        {{ alm.description }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </v-card>
          </v-col>

          <!-- ================= [카드 2] 작업 설정 레시피 (Recipe Setting Value - SV) ================= -->
          <v-col cols="12" lg="4" class="d-flex flex-column">
            <v-card
              class="elevation-1 rounded-lg pa-3 fill-height d-flex flex-column sub-grid-card"
            >
              <div class="panel-header mb-2 d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon icon="$cogOutline" size="18" color="primary" class="mr-1" />
                  <span class="text-subtitle-2 font-weight-bold">설정 레시피 (Recipe SV)</span>
                </div>
                <v-chip size="x-small" color="primary" variant="tonal"> 기준 목표치 </v-chip>
              </div>

              <div class="grid-content-area flex-grow-1">
                <v-table density="compact" class="custom-monitoring-table">
                  <thead>
                    <tr>
                      <th class="text-start">파라미터명</th>
                      <th class="text-end">설정값 (SV)</th>
                      <th class="text-center">허용 공차</th>
                      <th class="text-center">단위</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in currentDetail.recipeSV" :key="'sv-' + idx">
                      <td class="font-weight-medium text-caption">{{ item.paramName }}</td>
                      <td class="text-end font-weight-bold text-primary">{{ item.sv }}</td>
                      <td class="text-center text-caption text-medium-emphasis">
                        {{ item.tolerance }}
                      </td>
                      <td class="text-center text-caption">{{ item.unit }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </v-card>
          </v-col>

          <!-- ================= [카드 3] 실시간 측정 레시피 (Recipe Present Value - PV) ================= -->
          <v-col cols="12" lg="4" class="d-flex flex-column">
            <v-card
              class="elevation-1 rounded-lg pa-3 fill-height d-flex flex-column sub-grid-card"
            >
              <div class="panel-header mb-2 d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon icon="$chartLine" size="18" color="success" class="mr-1" />
                  <span class="text-subtitle-2 font-weight-bold">실시간 측정값 (Recipe PV)</span>
                </div>
                <v-chip size="x-small" color="success" variant="tonal"> PLC 실측 </v-chip>
              </div>

              <div class="grid-content-area flex-grow-1">
                <v-table density="compact" class="custom-monitoring-table">
                  <thead>
                    <tr>
                      <th class="text-start">파라미터명</th>
                      <th class="text-end">현재값 (PV)</th>
                      <th class="text-end">편차</th>
                      <th class="text-center">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in currentDetail.recipePV" :key="'pv-' + idx">
                      <td class="font-weight-medium text-caption">{{ item.paramName }}</td>
                      <td class="text-end font-weight-bold text-high-emphasis">
                        {{ item.pv }} {{ item.unit }}
                      </td>
                      <td
                        class="text-end font-weight-medium text-caption"
                        :class="
                          item.deviation.indexOf('+') === 0
                            ? 'text-error'
                            : item.deviation.indexOf('-') === 0
                              ? 'text-primary'
                              : 'text-medium-emphasis'
                        "
                      >
                        {{ item.deviation }}
                      </td>
                      <td class="text-center">
                        <v-chip
                          size="x-small"
                          :color="
                            item.status === 'NORMAL'
                              ? 'success'
                              : item.status === 'WARNING'
                                ? 'warning'
                                : 'error'
                          "
                          variant="flat"
                          class="font-weight-bold"
                        >
                          {{ item.status }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 스낵바 알림 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
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
import { fetchEquipmentHierarchyApi } from '@/api/production'
import { fetchEquipmentDetailApi, saveEquipmentMemoApi } from '@/api/equipment'
import { formatDateTime } from '@/utils/dateUtils'

// ==========================================
// 1. 상태 정의
// ==========================================
const equipmentGroups = ref([])
const selectedEquipment = ref(null)
const equipmentSearchKeyword = ref('')
const openedPanelIndexes = ref([0, 1, 2, 6, 7])

const currentDetail = ref({
  utilizationRate: 0.0,
  runningHours: '0h 00m',
  stopHours: '0h 00m',
  maintenanceMemo: '',
  alarms: [],
  recipeSV: [],
  recipePV: [],
})

const maintenanceMemoText = ref('')
const snackbar = reactive({ show: false, message: '', color: 'success' })

const { loading: isEquipmentLoading, execute: executeFetchEquipments } = useApi(
  fetchEquipmentHierarchyApi,
)
const { loading: isDetailLoading, execute: executeFetchDetail } = useApi(fetchEquipmentDetailApi)
const { loading: isSavingMemo, execute: executeSaveMemo } = useApi(saveEquipmentMemoApi)

// ==========================================
// 2. 계산된 속성 (Computeds)
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

const alarmEquipmentCount = computed(function () {
  let count = 0
  for (let i = 0; i < equipmentGroups.value.length; i++) {
    const list = equipmentGroups.value[i].equipments
    for (let j = 0; j < list.length; j++) {
      if (list[j].status === 'ALARM') {
        count = count + 1
      }
    }
  }
  return count
})

// ==========================================
// 3. 헬퍼 및 핸들러 함수
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

function showNotification(msg, color) {
  snackbar.message = msg
  snackbar.color = color || 'success'
  snackbar.show = true
}

async function onSelectEquipment(eqp) {
  selectedEquipment.value = eqp

  try {
    const res = await executeFetchDetail(eqp.eqpId)
    if (res && res.data) {
      currentDetail.value = res.data
      maintenanceMemoText.value = res.data.maintenanceMemo || ''
    }
  } catch (err) {
    console.error('Failed to load equipment detail:', err)
  }
}

async function onSaveMemo() {
  if (!selectedEquipment.value) return

  try {
    await executeSaveMemo({
      eqpId: selectedEquipment.value.eqpId,
      memo: maintenanceMemoText.value,
      updatedAt: new Date().toISOString(),
    })
    currentDetail.value.maintenanceMemo = maintenanceMemoText.value
    showNotification('설비 점검 메모가 저장되었습니다.', 'success')
  } catch (err) {
    console.error('Failed to save memo:', err)
    showNotification('메모 저장 중 오류가 발생했습니다.', 'error')
  }
}

async function loadEquipmentTree() {
  try {
    const res = await executeFetchEquipments()
    if (res && res.data && Array.isArray(res.data)) {
      equipmentGroups.value = res.data
    } else if (Array.isArray(res)) {
      equipmentGroups.value = res
    }

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
  if (selectedEquipment.value) {
    onSelectEquipment(selectedEquipment.value)
  }
}

onMounted(function () {
  loadEquipmentTree()
})
</script>

<style scoped>
.equipment-status-container {
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

.eqp-summary-card {
  border-left: 4px solid #2e7d32;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbf9 100%);
}

.utilization-box {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.memo-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.memo-textarea :deep(textarea) {
  font-size: 0.825rem;
}

.sub-grid-card {
  min-height: 380px;
  max-height: 440px;
  border-top: 2px solid #2e7d32;
}

.grid-content-area {
  overflow-y: auto;
  max-height: 340px;
}

.custom-monitoring-table {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.custom-monitoring-table th {
  background-color: #f8faf8;
  font-weight: bold !important;
  font-size: 0.8rem;
}

.custom-monitoring-table td {
  font-size: 0.8rem;
}

.header-action-gap {
  gap: 6px;
}

.memo-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #ffffff !important;
}

/* textarea 내부 입력 텍스트 및 placeholder 색상 명시 */
.memo-textarea :deep(textarea) {
  font-size: 0.825rem;
  color: #212121 !important;
  line-height: 1.4;
}

.memo-textarea :deep(textarea::placeholder) {
  color: #9e9e9e !important;
}
</style>
