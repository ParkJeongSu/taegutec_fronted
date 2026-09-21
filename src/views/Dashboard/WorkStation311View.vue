<template>
  <v-container fluid class="pa-4 workstation-view-container">
    <!-- 상단: 타이틀 및 웹소켓 연결 상태 바 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">
            창고 1 &gt; WorkStation 311 모니터링
          </span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            대시보드 &gt; 운영 모니터링 &gt; 창고1 &gt; workstation311
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
          <v-chip
            :color="isConnected ? 'success' : 'grey'"
            variant="flat"
            size="small"
            class="font-weight-medium"
          >
            <v-icon icon="$radioboxBlank" size="12" class="mr-1 pulse-dot" />
            {{ isConnected ? 'WebSocket 실시간 연결됨' : 'WebSocket 연결 대기' }}
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
                WorkStation 311 도면 및 크레인 위치
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
              :src="drawingSrc"
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
            <v-tabs v-model="activeTab" color="primary" density="compact" class="order-tabs">
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import SvgDrawingViewer from '@/components/widgets/SvgDrawingViewer.vue'
import { useCraneSocket } from '@/composables/useCraneSocket'

// script setup 영역
const baseUrl = import.meta.env.BASE_URL // '/wcs-web/' (로컬 개발 서버에선 '/')
const drawingSrc = baseUrl + 'drawings/wh1_ws311.svg'

// 1. WebSocket 전용 Composable 연결
const { isConnected, connectCraneSocket, disconnectCraneSocket } = useCraneSocket()

// 2. 크레인 실시간 위치 좌표 (반응형 상태)
const cranePos = ref({ x: 200, y: 190 })

// 3. 실시간 크레인 좌표 수신 핸들러
function handleCraneMovement(payload) {
  if (!payload) {
    return
  }
  if (typeof payload.x === 'number' && typeof payload.y === 'number') {
    cranePos.value = {
      x: payload.x,
      y: payload.y,
    }
  }
}

// 라이프사이클: 웹소켓 연결 및 해제
onMounted(function () {
  connectCraneSocket('1', handleCraneMovement)
})

onBeforeUnmount(function () {
  disconnectCraneSocket()
})

// 4. 선택된 트레이 포지션 ID
const selectedPosition = ref(null)

// 5. 활성 오더 탭 상태
const activeTab = ref('inbound')
const isLoading = ref(false)

// 6. 오더 테이블 컬럼 정의
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
    orderNo: 'ORD-IN-311-01',
    trayId: 'TRAY-31101',
    matCode: 'CNMG 120408',
    status: '진행중',
    timestamp: '2026-09-18 09:30:12',
  },
  {
    orderNo: 'ORD-IN-311-02',
    trayId: 'TRAY-31102',
    matCode: 'WNMG 080408',
    status: '대기',
    timestamp: '2026-09-18 09:35:40',
  },
  {
    orderNo: 'ORD-IN-311-03',
    trayId: 'TRAY-31103',
    matCode: 'TNMG 160404',
    status: '대기',
    timestamp: '2026-09-18 09:42:15',
  },
  {
    orderNo: 'ORD-IN-311-04',
    trayId: 'TRAY-31104',
    matCode: 'SNMG 120412',
    status: '대기',
    timestamp: '2026-09-18 09:50:00',
  },
])

// 6. 출고 오더 목데이터 (Outbound Mock Data)
const outboundOrders = ref([
  {
    orderNo: 'ORD-OUT-311-01',
    trayId: 'TRAY-31104',
    matCode: 'DNMG 150608',
    status: '진행중',
    timestamp: '2026-09-18 09:28:05',
  },
  {
    orderNo: 'ORD-OUT-311-02',
    trayId: 'TRAY-31105',
    matCode: 'CCMT 09T304',
    status: '대기',
    timestamp: '2026-09-18 09:33:20',
  },
  {
    orderNo: 'ORD-OUT-311-03',
    trayId: 'TRAY-31106',
    matCode: 'VBMT 160404',
    status: '대기',
    timestamp: '2026-09-18 09:45:10',
  },
  {
    orderNo: 'ORD-OUT-311-04',
    trayId: 'TRAY-31107',
    matCode: 'DCMT 11T308',
    status: '대기',
    timestamp: '2026-09-18 09:52:45',
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
  console.log('[WorkStation311] 트레이 포지션 클릭:', posId)
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
