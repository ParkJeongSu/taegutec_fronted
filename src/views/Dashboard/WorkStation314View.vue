<template>
  <v-container fluid class="pa-4 workstation-view-container">
    <!-- 상단: 타이틀 및 웹소켓 연결 상태 바 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">
            창고 1 &gt; WorkStation 314 모니터링
          </span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            대시보드 &gt; 운영 모니터링 &gt; 창고1 &gt; workstation314
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
                WorkStation 314 도면 및 크레인 위치
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
              src="/drawings/wh1_ws314.svg"
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
  { title: '자재코드', key: 'matCode', align: 'start' },
  { title: '상태', key: 'status', align: 'center' },
  { title: '발생시간', key: 'timestamp', align: 'center' },
]

// 5. 입고 오더 목데이터 (Inbound Mock Data)
const inboundOrders = ref([
  {
    orderNo: 'ORD-IN-314-01',
    trayId: 'TRAY-31401',
    matCode: 'CNMG 120408-PV',
    status: '진행중',
    timestamp: '2026-09-18 09:30:40',
  },
  {
    orderNo: 'ORD-IN-314-02',
    trayId: 'TRAY-31402',
    matCode: 'WNMG 080408-PV',
    status: '대기',
    timestamp: '2026-09-18 09:36:50',
  },
  {
    orderNo: 'ORD-IN-314-03',
    trayId: 'TRAY-31403',
    matCode: 'TNMG 160404-PV',
    status: '대기',
    timestamp: '2026-09-18 09:43:40',
  },
  {
    orderNo: 'ORD-IN-314-04',
    trayId: 'TRAY-31404',
    matCode: 'SNMG 120412-PV',
    status: '대기',
    timestamp: '2026-09-18 09:51:00',
  },
])

// 6. 출고 오더 목데이터 (Outbound Mock Data)
const outboundOrders = ref([
  {
    orderNo: 'ORD-OUT-314-01',
    trayId: 'TRAY-31404',
    matCode: 'DNMG 150608-PV',
    status: '진행중',
    timestamp: '2026-09-18 09:28:50',
  },
  {
    orderNo: 'ORD-OUT-314-02',
    trayId: 'TRAY-31405',
    matCode: 'CCMT 09T304-PV',
    status: '대기',
    timestamp: '2026-09-18 09:34:40',
  },
  {
    orderNo: 'ORD-OUT-314-03',
    trayId: 'TRAY-31406',
    matCode: 'VBMT 160404-PV',
    status: '대기',
    timestamp: '2026-09-18 09:46:50',
  },
  {
    orderNo: 'ORD-OUT-314-04',
    trayId: 'TRAY-31407',
    matCode: 'DCMT 11T308-PV',
    status: '대기',
    timestamp: '2026-09-18 09:53:10',
  },
])

// 7. 상태 칩 색상 변환 함수
function getStatusColor(status) {
  if (status === '진행중') {
    return 'primary'
  }
  if (status === '대기') {
    return 'warning'
  }
  if (status === '완료') {
    return 'success'
  }
  return 'default'
}

// 8. 새로고침 핸들러
function handleRefreshOrders() {
  isLoading.value = true
  setTimeout(function () {
    isLoading.value = false
  }, 400)
}

// 9. 트레이 포지션 클릭 핸들러 (이벤트 위임 수신)
function handlePositionClick(posId) {
  selectedPosition.value = posId
  console.log('[WorkStation314] 트레이 포지션 클릭:', posId)
}
</script>

<style scoped>
.workstation-view-container {
  min-height: calc(100vh - 120px);
}

.pulse-dot {
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
}

.order-tabs {
  border-bottom: none;
}
</style>
