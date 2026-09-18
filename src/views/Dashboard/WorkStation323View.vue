<template>
  <v-container fluid class="pa-4 ws-monitoring-container">
    <!-- 상단 헤더 카드: 워크스테이션 타이틀 및 상태 배지 -->
    <v-card class="elevation-1 rounded-lg mb-4 pa-4 header-card">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3">
        <div class="d-flex align-center flex-wrap">
          <v-icon icon="$desktopTowerMonitor" size="28" color="primary" class="mr-3" />
          <span class="text-h6 font-weight-bold text-high-emphasis">
            창고 2 &gt; WorkStation 323 모니터링
          </span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            대시보드 &gt; 운영 모니터링 &gt; 창고2 &gt; workstation323
          </v-chip>
          <v-chip
            v-if="selectedPosition"
            size="small"
            color="secondary"
            variant="flat"
            class="ml-2 font-weight-bold"
          >
            선택 포지션: {{ selectedPosition }}
          </v-chip>
        </div>

        <div class="d-flex align-center">
          <v-chip color="grey" variant="flat" size="small" class="font-weight-medium">
            <v-icon icon="$radioboxBlank" size="12" class="mr-1 pulse-dot" />
            WebSocket 연결 대기
          </v-chip>
        </div>
      </div>
    </v-card>

    <!-- 본문 영역: 좌/우 분할 레이아웃 -->
    <v-row density="comfortable">
      <!-- 좌측: SVG 모니터링 뷰포트 영역 (공통 SvgDrawingViewer 사용) -->
      <v-col cols="12" lg="7">
        <v-card class="elevation-1 rounded-lg pa-4 h-100 d-flex flex-column">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-icon icon="$viewDashboard" size="20" color="primary" class="mr-2" />
              <span class="text-subtitle-1 font-weight-bold">
                WorkStation 323 도면 및 크레인 위치
              </span>
            </div>
            <div class="text-caption text-medium-emphasis">
              크레인 좌표: (X: {{ cranePos.x }}, Y: {{ cranePos.y }})
            </div>
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- 공통 SVG 도면 뷰어 컴포넌트 -->
          <div class="flex-grow-1 d-flex">
            <SvgDrawingViewer
              src="/drawings/wh2_ws323.svg"
              :crane-pos="cranePos"
              v-on:click-position="handlePositionClick"
            />
          </div>
        </v-card>
      </v-col>

      <!-- 우측: 작업 오더 현황 (입고 / 출고) -->
      <v-col cols="12" lg="5">
        <v-card class="elevation-1 rounded-lg pa-4 h-100 d-flex flex-column">
          <!-- 탭 선택 바 (입고 오더 / 출고 오더) -->
          <div class="d-flex align-center justify-space-between mb-2">
            <v-tabs
              v-model="activeTab"
              color="primary"
              density="compact"
              class="order-tabs"
            >
              <v-tab value="inbound" class="font-weight-bold">
                <v-icon icon="$trayArrowDown" size="18" class="mr-1" />
                입고 오더 목록 ({{ inboundOrders.length }})
              </v-tab>
              <v-tab value="outbound" class="font-weight-bold">
                <v-icon icon="$trayArrowUp" size="18" class="mr-1" />
                출고 오더 목록 ({{ outboundOrders.length }})
              </v-tab>
            </v-tabs>

            <v-btn
              color="primary"
              variant="text"
              size="small"
              icon="$refresh"
              v-on:click="handleRefreshOrders"
            ></v-btn>
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- 탭 내용 영역: BaseDataTable 렌더링 -->
          <div class="flex-grow-1">
            <!-- 입고 오더 테이블 -->
            <BaseDataTable
              v-if="activeTab === 'inbound'"
              :headers="orderHeaders"
              :items="inboundOrders"
              :total-items="inboundOrders.length"
              :loading="isLoading"
              :items-per-page="10"
              item-value="orderNo"
            >
              <!-- 상태 컬럼 커스텀 슬롯 -->
              <template #[`item.status`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="x-small"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ item.status }}
                </v-chip>
              </template>
            </BaseDataTable>

            <!-- 출고 오더 테이블 -->
            <BaseDataTable
              v-else
              :headers="orderHeaders"
              :items="outboundOrders"
              :total-items="outboundOrders.length"
              :loading="isLoading"
              :items-per-page="10"
              item-value="orderNo"
            >
              <!-- 상태 컬럼 커스텀 슬롯 -->
              <template #[`item.status`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="x-small"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ item.status }}
                </v-chip>
              </template>
            </BaseDataTable>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import SvgDrawingViewer from '@/components/widgets/SvgDrawingViewer.vue'

// 1. 크레인 실시간 위치 좌표 (반응형 상태)
const cranePos = ref({ x: 200, y: 190 })

// 2. 선택된 트레이 포지션 ID
const selectedPosition = ref(null)

// 3. 활성 오더 탭 상태
const activeTab = ref('inbound')
const isLoading = ref(false)

// 4. 오더 테이블 컬럼 정의
const orderHeaders = [
  { title: '오더번호', key: 'orderNo', align: 'start' },
  { title: '트레이 ID', key: 'trayId', align: 'start' },
  { title: '품목코드', key: 'itemCode', align: 'start' },
  { title: '수량', key: 'qty', align: 'end' },
  { title: '상태', key: 'status', align: 'center' },
  { title: '위치', key: 'pos', align: 'center' },
]

// 5. 입고 오더 목 데이터
const inboundOrders = ref([
  {
    orderNo: 'ORD-323-IN-001',
    trayId: 'TRY-32310',
    itemCode: 'CNMG-120408-TT8115',
    qty: 120,
    status: '입고대기',
    pos: 'POS 32301',
  },
  {
    orderNo: 'ORD-323-IN-002',
    trayId: 'TRY-32311',
    itemCode: 'WNMG-080404-TT5100',
    qty: 80,
    status: '입고대기',
    pos: 'POS 32302',
  },
  {
    orderNo: 'ORD-323-IN-003',
    trayId: 'TRY-32312',
    itemCode: 'TNMG-160408-TT9080',
    qty: 50,
    status: '작업중',
    pos: 'POS 32303',
  },
])

// 6. 출고 오더 목 데이터
const outboundOrders = ref([
  {
    orderNo: 'ORD-323-OUT-001',
    trayId: 'TRY-32320',
    itemCode: 'DCMT-11T304-TT7015',
    qty: 30,
    status: '출고대기',
    pos: 'POS 32304',
  },
  {
    orderNo: 'ORD-323-OUT-002',
    trayId: 'TRY-32321',
    itemCode: 'VBMT-160408-TT8020',
    qty: 60,
    status: '출고대기',
    pos: 'POS 32305',
  },
])

// 7. 상태값에 따른 Vuetify Chip 색상 매핑 함수
function getStatusColor(status) {
  if (status === '작업중') {
    return 'warning'
  }
  if (status === '입고대기') {
    return 'success'
  }
  if (status === '출고대기') {
    return 'info'
  }
  if (status === '완료') {
    return 'grey-darken-1'
  }
  return 'default'
}

// 8. 포지션 클릭 이벤트 핸들러
function handlePositionClick(posId) {
  selectedPosition.value = posId
}

// 9. 오더 목록 새로고침 핸들러
function handleRefreshOrders() {
  isLoading.value = true
  setTimeout(function () {
    isLoading.value = false
  }, 400)
}
</script>

<style scoped>
.ws-monitoring-container {
  max-width: 100%;
}

.header-card {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.order-tabs {
  border-bottom: none;
}

.pulse-dot {
  color: #22c55e;
}
</style>
