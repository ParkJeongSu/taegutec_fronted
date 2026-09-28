<template>
  <v-dialog v-model="internalVisible" max-width="960px" scrollable>
    <v-card class="rounded-lg">
      <!-- 모달 상단 헤더 -->
      <v-card-item class="bg-primary-lighten py-3 px-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="$fileImport" size="20" color="primary" class="mr-2" />
            <span class="text-subtitle-1 font-weight-bold text-high-emphasis">
              SAP Idoc 인터페이스 상세 정보
            </span>
            <v-chip
              size="small"
              :color="factory === 'POWDER' ? 'secondary' : 'primary'"
              variant="flat"
              class="ml-3 font-weight-bold"
            >
              {{ factory }} 공장
            </v-chip>
            <v-chip
              v-if="item && (item.idocId || item.docNum)"
              size="small"
              variant="tonal"
              color="indigo"
              class="ml-2 font-weight-medium"
            >
              IDoc ID: {{ item.idocId || item.docNum }}
            </v-chip>
          </div>
          <v-btn
            icon="$close"
            variant="text"
            size="small"
            density="compact"
            v-on:click="closeModal"
          ></v-btn>
        </div>
      </v-card-item>

      <v-divider></v-divider>

      <!-- 탭 바 -->
      <v-tabs v-model="activeTab" color="primary" density="compact" class="border-b px-4">
        <v-tab value="master" class="font-weight-bold">
          <v-icon icon="$information" size="16" class="mr-1" />
          마스터 정보
        </v-tab>
        <v-tab value="detail" class="font-weight-bold">
          <v-icon icon="$table" size="16" class="mr-1" />
          상세 품목 (M/D) ({{ detailItems.length }})
        </v-tab>
        <v-tab v-if="isPartAvailable" value="part" class="font-weight-bold">
          <v-icon icon="$cubeOutline" size="16" class="mr-1" />
          Part 정보 ({{ partItems.length }})
        </v-tab>
      </v-tabs>

      <!-- 모달 본문 영역 -->
      <v-card-text class="pa-4 modal-content-area">
        <v-window v-model="activeTab">
          <!-- 탭 1: 마스터 정보 (Key-Value Grid) -->
          <v-window-item value="master">
            <div v-if="item" class="master-info-card pa-4 rounded-lg bg-surface mb-3">
              <!-- 공통 상단 요약 -->
              <div class="d-flex align-center justify-space-between mb-3 pb-2 border-b">
                <div class="d-flex align-center">
                  <span class="text-subtitle-1 font-weight-bold mr-2 text-primary">
                    {{ item.idocId || '-' }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="getIdocTypColor(item.idocTypId)"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{ getIdocTypText(item.idocTypId) }}
                  </v-chip>
                </div>
                <div class="d-flex align-center">
                  <span class="text-caption text-medium-emphasis mr-2">상태:</span>
                  <v-chip
                    size="x-small"
                    color="primary"
                    variant="tonal"
                    class="font-weight-bold mr-2"
                  >
                    State: {{ item.state || '-' }}
                  </v-chip>
                  <v-chip
                    :color="isErrorCodeZero(item.errorCode) ? 'success' : 'error'"
                    size="x-small"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    Error: {{ item.errorCode != null ? item.errorCode : '-' }}
                  </v-chip>
                </div>
              </div>

              <!-- INSERT 공장 전용 마스터 뷰 (소문자 프로퍼티 완전 대응) -->
              <v-row v-if="factory === 'INSERT'" density="compact">
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">IDoc ID</div>
                  <div class="detail-value font-weight-bold text-primary">
                    {{ item.idocId || '-' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">오더 ID (corderId)</div>
                  <div class="detail-value font-weight-bold">
                    {{ item.corderId || item.cOrderId || '-' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">오더 타입 (corderTy)</div>
                  <div class="detail-value">{{ item.corderTy || item.cOrderTy || '-' }}</div>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">캐리어 명 (ccoId)</div>
                  <div class="detail-value font-weight-medium">
                    {{ item.ccoId || item.cCoId || '-' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">작업장 ID (cwcId)</div>
                  <div class="detail-value font-weight-medium">
                    {{ item.cwcId || item.cWcId || '-' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">위치 ID (clocId)</div>
                  <div class="detail-value">{{ item.clocId || item.cLocId || '-' }}</div>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">GAL ID (cgalId)</div>
                  <div class="detail-value">{{ item.cgalId || item.cGalId || '-' }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">GAL 창고 (cgalWhs)</div>
                  <div class="detail-value">{{ item.cgalWhs || item.cGalWhs || '-' }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">요청 존 (creqZone)</div>
                  <div class="detail-value">{{ item.creqZone || item.cReqZone || '-' }}</div>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">트랜잭션 코드 (ctransTy)</div>
                  <div class="detail-value">{{ item.ctransTy || item.cTransTy || '-' }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">송신처 (Source)</div>
                  <div class="detail-value">{{ getSystemName(item.source) }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">수신처 (Destination)</div>
                  <div class="detail-value">{{ getSystemName(item.destination) }}</div>
                </v-col>

                <v-col cols="12" sm="6" md="6">
                  <div class="detail-label">생성 일시 (dtimeCre)</div>
                  <div class="detail-value">{{ formatDateTime(item.dtimeCre) }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <div class="detail-label">수정 일시 (dtimeMod)</div>
                  <div class="detail-value">{{ formatDateTime(item.dtimeMod) }}</div>
                </v-col>
              </v-row>

              <!-- POWDER 공장 전용 마스터 뷰 (소문자 프로퍼티 완전 대응) -->
              <v-row v-else density="compact">
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">IDoc ID</div>
                  <div class="detail-value font-weight-bold text-secondary">
                    {{ item.idocId || '-' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">오더 ID (corderId)</div>
                  <div class="detail-value font-weight-bold">
                    {{ item.corderId || item.cOrderId || '-' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">오더 타입 (corderTy)</div>
                  <div class="detail-value">{{ item.corderTy || item.cOrderTy || '-' }}</div>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">컨테이너 명 (carrierId)</div>
                  <div class="detail-value font-weight-bold text-indigo">
                    {{ item.carrierId || '-' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">LOT</div>
                  <div class="detail-value font-weight-medium">{{ item.lot || '-' }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">공정 번호 (rrn)</div>
                  <div class="detail-value">{{ item.rrn || '-' }}</div>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">GAL Key</div>
                  <div class="detail-value">{{ item.galKey || '-' }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">MNG Key</div>
                  <div class="detail-value">{{ item.mngKey || '-' }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="detail-label">송신처 / 수신처</div>
                  <div class="detail-value">
                    {{ getSystemName(item.source) }} -> {{ getSystemName(item.destination) }}
                  </div>
                </v-col>

                <v-col cols="12" sm="6" md="6">
                  <div class="detail-label">생성 일시 (dtimeCre)</div>
                  <div class="detail-value">{{ formatDateTime(item.dtimeCre) }}</div>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <div class="detail-label">수정 일시 (dtimeMod)</div>
                  <div class="detail-value">{{ formatDateTime(item.dtimeMod) }}</div>
                </v-col>
              </v-row>
            </div>

            <div v-else class="text-center py-6 text-medium-emphasis">
              선택된 마스터 데이터가 없습니다.
            </div>
          </v-window-item>

          <!-- 탭 2: 상세 품목 리스트 (M/D) -->
          <v-window-item value="detail">
            <div v-if="isDetailLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="36"></v-progress-circular>
              <div class="mt-2 text-caption text-medium-emphasis">
                상세 품목 데이터를 불러오는 중입니다...
              </div>
            </div>

            <div v-else-if="detailItems.length > 0" class="table-container">
              <v-table density="compact" class="elevation-1 rounded border detail-data-table">
                <thead>
                  <tr class="table-header-row">
                    <th class="text-center">순번</th>
                    <th class="text-start">자재 번호</th>
                    <th class="text-start">자재 설명</th>
                    <th class="text-end">수량</th>
                    <th class="text-center">단위</th>
                    <th class="text-center">저장 위치</th>
                    <th class="text-center">배치 번호</th>
                    <th class="text-start">출발 위치</th>
                    <th class="text-start">도착 위치</th>
                    <th class="text-center">생성 일시</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(detail, idx) in detailItems" :key="idx" class="table-body-row">
                    <td class="text-center font-weight-medium">
                      {{ detail.itemNo || detail.posnr || idx + 1 }}
                    </td>
                    <td class="text-start font-weight-bold text-primary">
                      {{ detail.matNr || detail.materialId || detail.materialNo || '-' }}
                    </td>
                    <td class="text-start">{{ detail.matDesc || detail.materialName || '-' }}</td>
                    <td class="text-end font-weight-medium">
                      {{
                        formatNumber(
                          detail.quantity != null
                            ? detail.quantity
                            : detail.menge != null
                              ? detail.menge
                              : detail.qty,
                        )
                      }}
                    </td>
                    <td class="text-center">{{ detail.unit || detail.meins || '-' }}</td>
                    <td class="text-center">
                      {{ detail.locationId || detail.lgort || detail.locId || '-' }}
                    </td>
                    <td class="text-center">{{ detail.batchNo || detail.charg || '-' }}</td>
                    <td class="text-start">{{ detail.fromLoc || '-' }}</td>
                    <td class="text-start">{{ detail.toLoc || '-' }}</td>
                    <td class="text-center text-caption">
                      {{ formatDateTime(detail.createTime) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div v-else class="text-center py-8 text-medium-emphasis">
              <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
              <div>연계된 상세 품목(M/D) 데이터가 없습니다.</div>
            </div>
          </v-window-item>

          <!-- 탭 3: Part 정보 (POWDER idocTypId === 19 전용) -->
          <v-window-item v-if="isPartAvailable" value="part">
            <div v-if="isPartLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="36"></v-progress-circular>
              <div class="mt-2 text-caption text-medium-emphasis">
                Part 정보를 불러오는 중입니다...
              </div>
            </div>

            <div v-else-if="partItems.length > 0" class="table-container">
              <v-table density="compact" class="elevation-1 rounded border detail-data-table">
                <thead>
                  <tr class="table-header-row">
                    <th class="text-center">순번</th>
                    <th class="text-start">Part 번호</th>
                    <th class="text-start">Part 설명</th>
                    <th class="text-start">Lot ID</th>
                    <th class="text-end">수량</th>
                    <th class="text-center">상태</th>
                    <th class="text-center">생성 일시</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(part, pIdx) in partItems" :key="pIdx" class="table-body-row">
                    <td class="text-center font-weight-medium">{{ pIdx + 1 }}</td>
                    <td class="text-start font-weight-bold text-primary">
                      {{ part.partNo || part.partId || '-' }}
                    </td>
                    <td class="text-start">{{ part.partDesc || part.partName || '-' }}</td>
                    <td class="text-start font-weight-medium">
                      {{ part.lotId || part.lotNo || '-' }}
                    </td>
                    <td class="text-end font-weight-medium">
                      {{ formatNumber(part.qty != null ? part.qty : part.quantity) }}
                    </td>
                    <td class="text-center">
                      <v-chip size="x-small" variant="flat" color="info">
                        {{ part.status || '-' }}
                      </v-chip>
                    </td>
                    <td class="text-center text-caption">{{ formatDateTime(part.createTime) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div v-else class="text-center py-8 text-medium-emphasis">
              <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
              <div>연계된 Part 정보 데이터가 없습니다.</div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider></v-divider>

      <!-- 모달 하단 액션 버튼 -->
      <v-card-actions class="pa-3 justify-end">
        <v-btn variant="outlined" size="small" class="font-weight-medium" v-on:click="closeModal">
          {{ $t('common.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { fetchGalDetailInterfacesApi, fetchGalPartsApi } from '@/api/galInterface'
import { formatDateTime } from '@/utils/dateUtils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: null,
  },
  factory: {
    type: String,
    default: 'INSERT',
  },
})

const emit = defineEmits(['update:modelValue'])

const internalVisible = ref(false)
const activeTab = ref('master')
const detailItems = ref([])
const partItems = ref([])
const isDetailLoading = ref(false)
const isPartLoading = ref(false)

const isPartAvailable = computed(function () {
  if (props.factory !== 'POWDER') {
    return false
  }
  if (!props.item) {
    return false
  }
  const typeId = String(props.item.idocTypId || props.item.idocType || '')
  return typeId === '19' || typeId === '019'
})

watch(
  function () {
    return props.modelValue
  },
  function (newVal) {
    internalVisible.value = newVal
    if (newVal && props.item) {
      activeTab.value = 'master'
      loadDetailData()
      if (isPartAvailable.value) {
        loadPartData()
      } else {
        partItems.value = []
      }
    }
  },
)

watch(
  function () {
    return internalVisible.value
  },
  function (newVal) {
    emit('update:modelValue', newVal)
  },
)

function closeModal() {
  internalVisible.value = false
}

function getIdocTypColor(type) {
  if (type === 'I') return 'primary'
  if (type === 'O') return 'success'
  if (type === 'R') return 'warning'
  return 'secondary'
}

function getIdocTypText(type) {
  if (type === 'I') return '입고(I)'
  if (type === 'O') return '출고(O)'
  if (type === 'R') return '재배치(R)'
  return type || '-'
}

function getSystemName(code) {
  if (code === '20') return 'ERP(20)'
  if (code === '1') return 'WMS(1)'
  return code || '-'
}

function isErrorCodeZero(code) {
  if (code === null || code === undefined || code === '' || code === '-') return true
  const str = String(code).trim()
  return str === '0' || str === '00' || str === 'SUCCESS' || str === 'OK'
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '0'
  const num = Number(value)
  return isNaN(num) ? String(value) : num.toLocaleString()
}

async function loadDetailData() {
  const targetId = props.item ? props.item.idocId || props.item.docNum : null
  if (!targetId) {
    detailItems.value = []
    return
  }

  isDetailLoading.value = true
  detailItems.value = []

  try {
    const params = {
      docNum: targetId,
      lineId: props.item.lineId != null ? props.item.lineId : targetId,
      factoryName: props.factory,
      page: 0,
      size: 100,
    }
    const response = await fetchGalDetailInterfacesApi(params)

    if (response && Array.isArray(response.content)) {
      detailItems.value = response.content
    } else if (response && response.data && Array.isArray(response.data.content)) {
      detailItems.value = response.data.content
    } else if (response && response.data && Array.isArray(response.data)) {
      detailItems.value = response.data
    } else if (Array.isArray(response)) {
      detailItems.value = response
    } else {
      detailItems.value = []
    }
  } catch (error) {
    console.error('GAL 상세 품목 조회 중 오류 발생:', error)
    detailItems.value = []
  } finally {
    isDetailLoading.value = false
  }
}

async function loadPartData() {
  const targetId = props.item ? props.item.idocId || props.item.docNum : null
  if (!targetId) {
    partItems.value = []
    return
  }

  isPartLoading.value = true
  partItems.value = []

  try {
    const params = {
      docNum: targetId,
      lineId: props.item.lineId != null ? props.item.lineId : targetId,
      factoryName: props.factory,
      page: 0,
      size: 100,
    }
    const response = await fetchGalPartsApi(params)

    if (response && Array.isArray(response.content)) {
      partItems.value = response.content
    } else if (response && response.data && Array.isArray(response.data.content)) {
      partItems.value = response.data.content
    } else if (response && response.data && Array.isArray(response.data)) {
      partItems.value = response.data
    } else if (Array.isArray(response)) {
      partItems.value = response
    } else {
      partItems.value = []
    }
  } catch (error) {
    console.error('GAL Part 정보 조회 중 오류 발생:', error)
    partItems.value = []
  } finally {
    isPartLoading.value = false
  }
}
</script>

<style scoped>
.modal-content-area {
  max-height: 70vh;
  overflow-y: auto;
  background-color: #f8fafc;
}

.bg-primary-lighten {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.master-info-card {
  border: 1px solid #e2e8f0;
}

.detail-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 0.875rem;
  color: #0f172a;
  margin-bottom: 8px;
  word-break: break-all;
}

.table-container {
  overflow-x: auto;
}

.detail-data-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header-row {
  background-color: #f1f8e9;
}

.table-header-row th {
  font-weight: bold !important;
  color: #2e7d32 !important;
  font-size: 0.8125rem !important;
  white-space: nowrap;
}

.table-body-row:hover {
  background-color: #f9fbe7 !important;
}

.table-body-row td {
  font-size: 0.8125rem !important;
}
</style>
