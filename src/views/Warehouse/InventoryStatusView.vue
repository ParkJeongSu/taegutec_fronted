<template>
  <v-container fluid class="pa-4 inventory-status-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$warehouse" size="26" color="primary" class="mr-2" />
          <div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold text-high-emphasis">
                창고별 실시간 재고 현황
              </span>
              <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
                창고 관리 &gt; 재고 관리 &gt; 실시간 재고 모니터링
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              창고(WH1~WH4) 및 자동 창고 스토커에 보관 중인 분말 용기(Container), Pallet, FIBC Bag의 실시간 재고 현황을 모니터링합니다.
            </div>
          </div>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-chip size="small" color="success" variant="flat" class="mr-2 font-weight-bold">
            정상 재고 {{ stockCount }}건
          </v-chip>
          <v-chip size="small" color="warning" variant="flat" class="mr-2 font-weight-bold">
            공정 투입/이동 {{ wipCount }}건
          </v-chip>
          <v-chip size="small" color="error" variant="flat" class="mr-2 font-weight-bold">
            보류(Hold) {{ blockedCount }}건
          </v-chip>
        </div>
      </div>
    </v-card>

    <!-- 검색 필터 카드 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4 search-filter-card">
      <v-row density="compact" align="center">
        <!-- 창고 선택 -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.warehouse"
            :items="warehouseOptions"
            item-title="title"
            item-value="value"
            label="창고 / 스토커"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>

        <!-- 자재/캐리어 구분 -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.materialType"
            :items="materialTypeOptions"
            label="자재 / 캐리어 구분"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>
        </v-col>

        <!-- 통합 검색어 -->
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filters.searchKeyword"
            placeholder="Carrier ID / LOT ID / 품목 검색"
            variant="outlined"
            density="compact"
            hide-details
            prepend-inner-icon="$magnify"
            v-on:keyup.enter="handleSearch"
          ></v-text-field>
        </v-col>

        <!-- 액션 버튼 -->
        <v-col cols="12" sm="6" md="3" class="d-flex justify-end">
          <v-btn
            color="primary"
            variant="elevated"
            class="mr-2 font-weight-bold"
            prepend-icon="$magnify"
            :loading="isLoading"
            v-on:click="handleSearch"
          >
            {{ $t('common.search') }}
          </v-btn>
          <v-btn
            variant="outlined"
            color="secondary"
            class="mr-2 font-weight-medium"
            prepend-icon="$refresh"
            v-on:click="handleReset"
          >
            {{ $t('common.reset') }}
          </v-btn>
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="$fileExcel"
            v-on:click="handleExportExcel"
          >
            엑셀
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- 중앙 데이터 테이블 카드 -->
    <v-card class="elevation-1 rounded-lg pa-4 table-card">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-icon icon="$formatListBulleted" size="20" color="primary" class="mr-2" />
          <span class="text-subtitle-2 font-weight-bold text-high-emphasis">
            보관 재고 목록 (총 {{ totalItems }}건)
          </span>
          <span class="text-caption text-medium-emphasis ml-3">
            * 행을 더블클릭하거나 우측 [상세] 버튼을 클릭하면 캐리어 상세 이력을 확인할 수 있습니다.
          </span>
        </div>
      </div>

      <BaseDataTable
        :headers="tableHeaders"
        :items="inventoryItems"
        :total-items="totalItems"
        :loading="isLoading"
        item-value="carrierId"
        density="compact"
        v-on:update:options="onOptionsUpdate"
        v-on:row-dblclick="handleRowDblClick"
      >
        <!-- Carrier ID -->
        <template #[`item.carrierId`]="{ item }">
          <span
            class="font-weight-bold text-primary cursor-pointer text-decoration-underline"
            v-on:click.stop="openDetailDialog(item.carrierId)"
          >
            {{ item.carrierId }}
          </span>
        </template>

        <!-- 창고명 -->
        <template #[`item.warehouse`]="{ item }">
          <v-chip size="x-small" color="secondary" variant="tonal" class="font-weight-bold">
            {{ item.warehouse }}
          </v-chip>
        </template>

        <!-- 보관 위치 -->
        <template #[`item.location`]="{ item }">
          <v-chip size="x-small" variant="outlined" color="primary" class="font-weight-medium">
            {{ item.location }}
          </v-chip>
        </template>

        <!-- 자재 구분 -->
        <template #[`item.materialType`]="{ item }">
          <span class="text-caption">{{ item.materialType }}</span>
        </template>

        <!-- 품목명 -->
        <template #[`item.itemName`]="{ item }">
          <div class="text-caption font-weight-medium text-high-emphasis text-truncate">
            [{{ item.itemCode }}] {{ item.itemName }}
          </div>
        </template>

        <!-- LOT ID -->
        <template #[`item.lotId`]="{ item }">
          <span class="text-caption font-weight-bold text-high-emphasis">{{ item.lotId }}</span>
        </template>

        <!-- 재고 상태 -->
        <template #[`item.status`]="{ item }">
          <v-chip
            size="x-small"
            :color="item.status === 'STOCK' ? 'success' : item.status === 'WIP' ? 'warning' : 'error'"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.status === 'STOCK' ? '정상보관' : item.status === 'WIP' ? '이동/WIP' : '보류(Hold)' }}
          </v-chip>
        </template>

        <!-- 적재 중량 -->
        <template #[`item.weight`]="{ item }">
          <span class="font-weight-bold">{{ Number(item.weight).toFixed(2) }} t</span>
        </template>

        <!-- 사용 횟수 -->
        <template #[`item.useCount`]="{ item }">
          <span class="text-caption font-weight-medium">{{ item.useCount }}회</span>
        </template>

        <!-- 최종 갱신 일시 -->
        <template #[`item.updatedAt`]="{ item }">
          <span class="text-caption">{{ formatDateTimeText(item.updatedAt) }}</span>
        </template>

        <!-- 액션 (상세보기) -->
        <template #[`item.actions`]="{ item }">
          <v-btn
            size="x-small"
            variant="tonal"
            color="primary"
            prepend-icon="$informationOutline"
            v-on:click.stop="openDetailDialog(item.carrierId)"
          >
            상세
          </v-btn>
        </template>
      </BaseDataTable>
    </v-card>

    <!-- ================= 캐리어 상세 정보 모달 ================= -->
    <v-dialog v-model="detailDialog" max-width="640">
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="$robotIndustrial" class="mr-2" />
            <span class="text-subtitle-1 font-weight-bold">캐리어 / 재고 상세 정보</span>
          </div>
          <v-btn icon="$close" variant="text" size="small" color="white" v-on:click="detailDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <div v-if="isDetailLoading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="primary" size="36"></v-progress-circular>
          </div>

          <div v-else-if="carrierDetail">
            <!-- 상단 헤더 요약 -->
            <div class="d-flex align-center justify-space-between pa-3 bg-surface-variant rounded mb-3">
              <div class="d-flex align-center">
                <v-avatar color="primary" variant="flat" size="36" class="mr-2 text-white font-weight-bold">
                  {{ carrierDetail.materialType ? carrierDetail.materialType.charAt(0) : 'C' }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-subtitle-2 text-primary">{{ carrierDetail.carrierId }}</div>
                  <div class="text-caption text-medium-emphasis">구분: {{ carrierDetail.materialType }}</div>
                </div>
              </div>
              <v-chip
                size="small"
                :color="carrierDetail.status === 'STOCK' ? 'success' : carrierDetail.status === 'WIP' ? 'warning' : 'error'"
                variant="flat"
                class="font-weight-bold"
              >
                {{ carrierDetail.status === 'STOCK' ? '정상 보관' : carrierDetail.status === 'WIP' ? '이동 중/WIP' : '보류(Hold)' }}
              </v-chip>
            </div>

            <!-- 상세 정보 그리드 -->
            <v-row density="compact" class="detail-info-grid">
              <v-col cols="6">
                <div class="detail-label">보관 창고 / 위치</div>
                <div class="detail-value">{{ carrierDetail.warehouse }} / {{ carrierDetail.location }}</div>
              </v-col>
              <v-col cols="6">
                <div class="detail-label">적재 중량</div>
                <div class="detail-value text-primary font-weight-bold">{{ Number(carrierDetail.weight).toFixed(2) }} t</div>
              </v-col>
              <v-col cols="12">
                <div class="detail-label">품목 코드 / 명칭</div>
                <div class="detail-value font-weight-medium">[{{ carrierDetail.itemCode }}] {{ carrierDetail.itemName }}</div>
              </v-col>
              <v-col cols="6">
                <div class="detail-label">재고 LOT ID</div>
                <div class="detail-value font-weight-bold">{{ carrierDetail.lotId }}</div>
              </v-col>
              <v-col cols="6">
                <div class="detail-label">원자재 LOT ID</div>
                <div class="detail-value">{{ carrierDetail.rawLotId || '-' }}</div>
              </v-col>
              <v-col cols="6">
                <div class="detail-label">사용 횟수 (Use Count)</div>
                <div class="detail-value">{{ carrierDetail.useCount }} 회</div>
              </v-col>
              <v-col cols="6">
                <div class="detail-label">최초 입고 일시</div>
                <div class="detail-value">{{ formatDateTimeText(carrierDetail.storedAt) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="detail-label">최종 갱신 일시</div>
                <div class="detail-value">{{ formatDateTimeText(carrierDetail.updatedAt) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="detail-label">최종 작업자</div>
                <div class="detail-value">{{ carrierDetail.lastWorker || '-' }}</div>
              </v-col>
              <v-col cols="12">
                <div class="detail-label">최근 발생 이벤트</div>
                <div class="detail-value text-high-emphasis">{{ carrierDetail.lastEvent || '-' }}</div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 d-flex justify-end">
          <v-btn color="primary" variant="flat" class="font-weight-bold px-6" v-on:click="detailDialog = false">
            {{ $t('common.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { useDataTable } from '@/composables/useDataTable'
import { useApi } from '@/composables/useApi'
import { fetchInventoryStatusApi, fetchCarrierDetailApi } from '@/api/warehouse'
import { formatDateTime } from '@/utils/dateUtils'
import BaseDataTable from '@/components/common/BaseDataTable.vue'

// ==========================================
// 1. 상태 및 옵션 정의
// ==========================================
const filters = reactive({
  warehouse: 'ALL',
  materialType: 'ALL',
  searchKeyword: '',
})

const warehouseOptions = [
  { title: '전체 창고', value: 'ALL' },
  { title: '창고 1 (WH1)', value: 'WH1' },
  { title: '창고 2 (WH2)', value: 'WH2' },
  { title: '창고 3 (WH3)', value: 'WH3' },
  { title: '창고 4 (WH4)', value: 'WH4' },
]

const materialTypeOptions = [
  'ALL',
  'Container',
  'Pallet',
  'FIBC Bag',
]

const tableHeaders = [
  { title: 'Carrier ID', key: 'carrierId', align: 'start', sortable: true },
  { title: '창고', key: 'warehouse', align: 'center', sortable: true },
  { title: '보관 위치 (Shelf)', key: 'location', align: 'center', sortable: true },
  { title: '구분', key: 'materialType', align: 'center', sortable: true },
  { title: '품목명', key: 'itemName', align: 'start', sortable: true },
  { title: 'LOT ID', key: 'lotId', align: 'start', sortable: true },
  { title: '상태', key: 'status', align: 'center', sortable: true },
  { title: '중량', key: 'weight', align: 'end', sortable: true },
  { title: '사용 횟수', key: 'useCount', align: 'end', sortable: true },
  { title: '최종 갱신 일시', key: 'updatedAt', align: 'center', sortable: true },
  { title: '상세', key: 'actions', align: 'center', sortable: false },
]

const detailDialog = ref(false)
const carrierDetail = ref(null)
const snackbar = reactive({ show: false, message: '', color: 'success' })

const {
  items: inventoryItems,
  totalItems,
  loading: isLoading,
  loadData,
  updateOptions,
} = useDataTable(fetchInventoryStatusApi, {
  defaultPageSize: 10,
  initialParams: {
    warehouse: 'ALL',
    materialType: 'ALL',
  },
})

const { loading: isDetailLoading, execute: executeFetchDetail } = useApi(fetchCarrierDetailApi)

// ==========================================
// 2. 계산된 속성 (Computeds)
// ==========================================
const stockCount = computed(function () {
  let count = 0
  for (let i = 0; i < inventoryItems.value.length; i++) {
    if (inventoryItems.value[i].status === 'STOCK') {
      count = count + 1
    }
  }
  return count
})

const wipCount = computed(function () {
  let count = 0
  for (let i = 0; i < inventoryItems.value.length; i++) {
    if (inventoryItems.value[i].status === 'WIP') {
      count = count + 1
    }
  }
  return count
})

const blockedCount = computed(function () {
  let count = 0
  for (let i = 0; i < inventoryItems.value.length; i++) {
    if (inventoryItems.value[i].status === 'BLOCKED') {
      count = count + 1
    }
  }
  return count
})

// ==========================================
// 3. 헬퍼 및 핸들러 함수
// ==========================================
function formatDateTimeText(val) {
  if (!val) return '-'
  return formatDateTime(val)
}

function handleSearch() {
  loadData({
    warehouse: filters.warehouse,
    materialType: filters.materialType,
    searchKeyword: filters.searchKeyword,
  })
}

function handleReset() {
  filters.warehouse = 'ALL'
  filters.materialType = 'ALL'
  filters.searchKeyword = ''
  loadData({
    warehouse: 'ALL',
    materialType: 'ALL',
    searchKeyword: '',
  })
}

function onOptionsUpdate(options) {
  updateOptions(options, {
    warehouse: filters.warehouse,
    materialType: filters.materialType,
    searchKeyword: filters.searchKeyword,
  })
}

function handleExportExcel() {
  snackbar.message = '재고 현황 데이터를 엑셀로 내보냅니다.'
  snackbar.color = 'primary'
  snackbar.show = true
}

async function openDetailDialog(carrierId) {
  try {
    detailDialog.value = true
    const data = await executeFetchDetail(carrierId)
    carrierDetail.value = data
  } catch (err) {
    console.error('Failed to load carrier detail:', err)
  }
}

function handleRowDblClick(event, rowData) {
  const item = (rowData && rowData.item) || rowData
  if (item && item.carrierId) {
    openDetailDialog(item.carrierId)
  }
}

onMounted(function () {
  loadData()
})
</script>

<style scoped>
.inventory-status-container {
  max-width: 100%;
}

.search-filter-card {
  border-left: 4px solid #2e7d32;
}

.table-card {
  border-top: 2px solid #2e7d32;
}

.detail-info-grid {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  padding: 8px;
  background-color: #ffffff;
}

.detail-label {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2px;
}

.detail-value {
  font-size: 0.875rem;
  color: #212121;
}

.header-action-gap {
  gap: 6px;
}
</style>
