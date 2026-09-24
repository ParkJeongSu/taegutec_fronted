<template>
  <v-container fluid class="pa-4 workstation-view-container">
    <!-- 상단: 타이틀 및 웹소켓 연결 상태 바 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">
            창고 6 &gt; WorkStation 361 모니터링
          </span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            대시보드 &gt; 운영 모니터링 &gt; 창고6 &gt; workstation361
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
            {{ connectionStatusText }}
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
                WorkStation 361 도면 및 크레인 위치
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
              :loading="isLoading"
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
              <template #no-data>
                <div class="text-center py-6 text-medium-emphasis">
                  <v-icon icon="$table" size="32" color="disabled" class="mb-1" />
                  <div>입고 오더 내역이 없습니다.</div>
                </div>
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
              <template #no-data>
                <div class="text-center py-6 text-medium-emphasis">
                  <v-icon icon="$table" size="32" color="disabled" class="mb-1" />
                  <div>출고 오더 내역이 없습니다.</div>
                </div>
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
import { useStompSocket } from '@/composables/useStompSocket'
import { fetchRecentTransportOrdersApi } from '@/api/transportOrder'

// script setup 영역
const baseUrl = import.meta.env.BASE_URL // '/wcs-web/' (로컬 개발 서버에선 '/')
const warehouseId = '6'
const wsNo = '361'

const drawingSrc = baseUrl + 'drawings/wh' + warehouseId + '_ws' + wsNo + '.svg'
const craneTopic = '/topic/warehouse/' + warehouseId + '/crane'
const conveyorTopic = '/topic/warehouse/' + warehouseId + '/conveyor'

// 1. 범용 STOMP WebSocket Composable 연결
const { isConnected, connectionStatusText, subscribe, unsubscribe } = useStompSocket()

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

// 4. 실시간 컨베이어 상태 수신 핸들러 (확장용 뼈대)
function handleConveyorStatus(payload) {
  if (!payload) {
    return
  }
  console.log('[WorkStation' + wsNo + '] 컨베이어 상태 수신:', payload)
}

// 5. 선택된 트레이 포지션 ID
const selectedPosition = ref(null)

// 6. 활성 오더 탭 상태 및 로딩 상태
const activeTab = ref('inbound')
const isLoading = ref(false)

// 7. 오더 테이블 컬럼 정의
const orderHeaders = [
  { title: '오더번호', key: 'orderNo', align: 'start' },
  { title: '트레이 ID', key: 'trayId', align: 'start' },
  { title: '자재코드', key: 'matCode', align: 'start' },
  { title: '상태', key: 'status', align: 'center' },
  { title: '발생시간', key: 'timestamp', align: 'center' },
]

// 8. 오더 목록 반응형 상태 (초기 빈 배열) 및 폴링 타이머
const inboundOrders = ref([])
const outboundOrders = ref([])
let orderPollingTimer = null

// 9. 백엔드 데이터 정규화 헬퍼 함수
function mapTransportOrderItem(item) {
  if (!item) {
    return {}
  }
  return {
    ...item,
    orderNo: item.orderNo || item.transportOrderNo || item.transportOrderId || item.orderId || (item.id != null ? String(item.id) : ''),
    trayId: item.trayId || item.carrierId || item.palletId || item.trayNo || '',
    matCode: item.matCode || item.materialCode || item.itemCode || item.matId || '',
    status: item.status || item.transportStatus || item.orderStatus || item.state || '',
    timestamp: item.timestamp || item.createdTime || item.createdAt || item.createDt || item.orderTime || '',
  }
}

// 10. 입고 오더 조회 API 호출
async function fetchInboundOrders() {
  try {
    const params = {
      'work-station-id': wsNo,
      'transport-type': 'I',
      limit: 10,
    }
    const res = await fetchRecentTransportOrdersApi(params)
    const rawList = (res && res.content) ? res.content : (res && res.data && res.data.content) ? res.data.content : (Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []))
    const list = []
    for (let i = 0; i < rawList.length; i++) {
      list.push(mapTransportOrderItem(rawList[i]))
    }
    inboundOrders.value = list
  } catch (error) {
    console.error('[WorkStation' + wsNo + '] 입고 오더 조회 실패:', error)
    inboundOrders.value = []
  }
}

// 11. 출고 오더 조회 API 호출
async function fetchOutboundOrders() {
  try {
    const params = {
      'work-station-id': wsNo,
      'transport-type': 'O',
      limit: 10,
    }
    const res = await fetchRecentTransportOrdersApi(params)
    const rawList = (res && res.content) ? res.content : (res && res.data && res.data.content) ? res.data.content : (Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []))
    const list = []
    for (let i = 0; i < rawList.length; i++) {
      list.push(mapTransportOrderItem(rawList[i]))
    }
    outboundOrders.value = list
  } catch (error) {
    console.error('[WorkStation' + wsNo + '] 출고 오더 조회 실패:', error)
    outboundOrders.value = []
  }
}

// 12. 전체 오더 새로고침 핸들러
async function handleRefreshOrders() {
  isLoading.value = true
  try {
    await Promise.all([fetchInboundOrders(), fetchOutboundOrders()])
  } finally {
    isLoading.value = false
  }
}

// 13. 상태 칩 색상 변환 함수
function getStatusColor(status) {
  if (status === '진행중' || status === 'PROCESSING' || status === 'RUNNING' || status === 'IN_PROGRESS') {
    return 'primary'
  }
  if (status === '대기' || status === 'WAITING' || status === 'PENDING' || status === 'READY') {
    return 'warning'
  }
  if (status === '완료' || status === 'COMPLETED' || status === 'DONE' || status === 'SUCCESS') {
    return 'success'
  }
  if (status === '에러' || status === 'ERROR' || status === 'FAILED' || status === 'ABORTED') {
    return 'error'
  }
  return 'default'
}

// 14. 트레이 포지션 클릭 핸들러 (이벤트 위임 수신)
function handlePositionClick(posId) {
  selectedPosition.value = posId
  console.log('[WorkStation' + wsNo + '] 트레이 포지션 클릭:', posId)
}

// 라이프사이클: 웹소켓 토픽 구독, 초기 오더 조회 및 30초 자동 폴링 타이머 설정
onMounted(function () {
  subscribe(craneTopic, handleCraneMovement)
  subscribe(conveyorTopic, handleConveyorStatus)
  handleRefreshOrders()

  orderPollingTimer = setInterval(function () {
    fetchInboundOrders()
    fetchOutboundOrders()
  }, 30000)
})

onBeforeUnmount(function () {
  if (orderPollingTimer) {
    clearInterval(orderPollingTimer)
    orderPollingTimer = null
  }
  unsubscribe(craneTopic, handleCraneMovement)
  unsubscribe(conveyorTopic, handleConveyorStatus)
})
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
