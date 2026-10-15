<template>
  <v-container fluid class="pa-4 workstation-view-container">
    <!-- 상단: 타이틀 및 웹소켓 연결 상태 바 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">
            {{ $t('views.dashboard.workstationTitle', { wh: warehouseId, ws: wsNo }) }}
          </span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.dashboard.workstationBreadcrumb', { wh: warehouseId, ws: wsNo }) }}
          </v-chip>
          <v-chip
            v-if="selectedPosition"
            size="small"
            color="secondary"
            variant="flat"
            class="ml-2 font-weight-bold"
          >
            {{ $t('views.dashboard.selectedPosition', { pos: selectedPosition }) }}
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
                {{ $t('views.dashboard.drawingAndCrane', { ws: wsNo }) }}
              </span>
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ $t('views.dashboard.craneCoord', { x: cranePos.x, y: cranePos.y }) }}
            </div>
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- 공통 SVG 도면 뷰어 컴포넌트 -->
          <div class="flex-grow-1 d-flex">
            <!-- 1. 템플릿 영역: SvgDrawingViewer에 tray-list 바인딩 추가 -->
            <!-- SvgDrawingViewer에 v-on:dblclick-tray 바인딩 추가 -->
            <SvgDrawingViewer
              :src="drawingSrc"
              :crane-pos="cranePos"
              :tray-list="trayList"
              v-on:click-position="handlePositionClick"
              v-on:dblclick-tray="handleTrayDblClick"
            />

            <!-- 캐리어(트레이) 상세 정보 팝업 다이얼로그 -->
            <v-dialog v-model="trayDetailDialogVisible" max-width="480">
              <v-card class="rounded-lg pa-4">
                <v-card-title class="d-flex align-center justify-space-between pb-2">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" variant="tonal" size="36" class="mr-2">
                      <v-icon icon="$cubeOutline" color="primary" size="20"></v-icon>
                    </v-avatar>
                    <span class="text-subtitle-1 font-weight-bold">캐리어(Tray) 상세 정보</span>
                  </div>
                  <v-btn
                    icon="$close"
                    variant="text"
                    size="small"
                    v-on:click="trayDetailDialogVisible = false"
                  ></v-btn>
                </v-card-title>

                <v-divider class="mb-3"></v-divider>

                <v-card-text class="pa-0" v-if="selectedTrayDetail">
                  <v-table density="compact" class="tray-detail-table border rounded">
                    <tbody>
                      <tr>
                        <th class="info-header">캐리어 명</th>
                        <td class="font-weight-bold text-primary">
                          {{ selectedTrayDetail.carrierName }}
                        </td>
                      </tr>
                      <tr>
                        <th class="info-header">캐리어 타입</th>
                        <td>
                          <v-chip size="x-small" color="secondary" variant="tonal">
                            {{ selectedTrayDetail.carrierType }}
                          </v-chip>
                        </td>
                      </tr>
                      <tr>
                        <th class="info-header">오더 ID</th>
                        <td class="font-weight-bold">{{ selectedTrayDetail.orderId }}</td>
                      </tr>
                      <tr>
                        <th class="info-header">적재 중량</th>
                        <td>{{ selectedTrayDetail.weightKg }} kg</td>
                      </tr>
                      <tr>
                        <th class="info-header">현재 위치</th>
                        <td>
                          <v-chip size="x-small" color="primary" variant="flat">
                            {{ selectedTrayDetail.currentPosition }}
                          </v-chip>
                        </td>
                      </tr>
                      <tr>
                        <th class="info-header">상태</th>
                        <td>
                          <v-chip size="x-small" color="success" variant="flat">
                            {{ selectedTrayDetail.status }}
                          </v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>

                <v-divider class="mt-4 mb-2"></v-divider>

                <v-card-actions class="pa-0 d-flex justify-end">
                  <v-btn
                    color="primary"
                    variant="tonal"
                    size="small"
                    v-on:click="trayDetailDialogVisible = false"
                  >
                    확인
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
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
                {{ $t('views.dashboard.inboundOrderList', { count: inboundOrders.length }) }}
              </v-tab>
              <v-tab value="outbound" class="font-weight-bold">
                <v-icon icon="$trayArrowUp" size="18" class="mr-1" />
                {{ $t('views.dashboard.outboundOrderList', { count: outboundOrders.length }) }}
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
              item-value="transportOrderId"
              density="compact"
              v-on:click:row="onRowClick"
            >
              <!-- 상태 컬럼 커스텀 슬롯 -->
              <template #[`item.transportType`]="{ item }">
                <v-chip
                  :color="item.transportType === 'O' ? 'success' : 'primary'"
                  size="x-small"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ item.transportType === 'O' ? '출고 (OUT)' : '입고 (IN)' }}
                </v-chip>
              </template>
              <template #[`item.transportStatus`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.transportStatus)"
                  size="x-small"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ item.transportStatus }}
                </v-chip>
              </template>
              <template #no-data>
                <div class="text-center py-6 text-medium-emphasis">
                  <v-icon icon="$table" size="32" color="disabled" class="mb-1" />
                  <div>{{ $t('views.dashboard.noInboundOrder') }}</div>
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
              item-value="transportOrderId"
              density="compact"
              v-on:click:row="onRowClick"
            >
              <!-- 상태 컬럼 커스텀 슬롯 -->
              <template #[`item.transportType`]="{ item }">
                <v-chip
                  :color="item.transportType === 'O' ? 'success' : 'primary'"
                  size="x-small"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ item.transportType === 'O' ? '출고 (OUT)' : '입고 (IN)' }}
                </v-chip>
              </template>
              <template #[`item.transportStatus`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.transportStatus)"
                  size="x-small"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ item.transportStatus }}
                </v-chip>
              </template>
              <template #no-data>
                <div class="text-center py-6 text-medium-emphasis">
                  <v-icon icon="$table" size="32" color="disabled" class="mb-1" />
                  <div>{{ $t('views.dashboard.noOutboundOrder') }}</div>
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
import { ref, computed, markRaw, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import SvgDrawingViewer from '@/components/widgets/SvgDrawingViewer.vue'
import WorkStationOrderDetailView from './components/WorkStationOrderDetailView.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useStompSocket } from '@/composables/useStompSocket'
import { fetchRecentTransportOrdersApi } from '@/api/transportOrder'

// script setup 영역
const { t } = useI18n()
const panelStore = usePanelStore()
const baseUrl = import.meta.env.BASE_URL // '/wcs-web/' (로컬 개발 서버에선 '/')
const warehouseId = '2'
const wsNo = '326'

const drawingSrc = baseUrl + 'drawings/wh' + warehouseId + '_ws' + wsNo + '.svg'
const craneTopic = '/topic/warehouse/' + warehouseId + '/crane'
const conveyorTopic = '/topic/warehouse/' + warehouseId + '/conveyor'

// 1. 범용 STOMP WebSocket Composable 연결
const { isConnected, connectionStatusText, subscribe, unsubscribe } = useStompSocket()

// 2. 크레인 실시간 위치 좌표 (반응형 상태)
const cranePos = ref({ x: 200, y: 190 })

// [추가] 실시간 컨베이어 상의 트레이 목록 관리 상태
// 형태: [{ carrierName: 'TRAY-01', positionId: 'pos-31101', state: 'MOVING' }]
const trayList = ref([])

// 캐리어 상세 팝업 상태 정의
const trayDetailDialogVisible = ref(false)
const selectedTrayDetail = ref(null)

// 3. 실시간 크레인 좌표 수신 핸들러
function handleCraneMovement(payload) {
  if (!payload) {
    return
  }
  if (typeof payload.x === 'number' && typeof payload.y === 'number') {
    let calculated_y = payload.y
    if (payload.y > 450) {
      calculated_y = calculated_y / 2
    }
    cranePos.value = {
      x: cranePos.value.x,
      y: calculated_y,
    }
  }
}

// 4. 실시간 컨베이어 상태 수신 핸들러 (동일 포지션 점유 충돌 방지 및 고스트 트레이 자동 정리 적용)
function handleConveyorStatus(payload) {
  if (!payload) {
    return
  }

  // 페이로드 정규화: { carrierName: "TRAY-01", positionId: "311-31101", action: "MOVE" | "REMOVE" }
  const carrierName = payload.carrierName || payload.trayId
  const nextPos = payload.positionId || payload.locationId
  const action = payload.action || 'MOVE'

  if (!carrierName) {
    return
  }

  // 1. 트레이 배출/작업 완료로 인한 명시적 제거(REMOVE) 이벤트 처리
  if (action === 'REMOVE') {
    const filtered = []
    for (let i = 0; i < trayList.value.length; i++) {
      if (trayList.value[i].carrierName !== carrierName) {
        filtered.push(trayList.value[i])
      }
    }
    trayList.value = filtered
    return
  }

  // 2. 패킷 유실 대비 포지션 선점 검사
  // 새로 들어올 위치(nextPos)에 이미 다른 트레이(ghost tray)가 남아있다면 즉시 제거
  const cleanedList = []
  for (let i = 0; i < trayList.value.length; i++) {
    const item = trayList.value[i]
    if (item.carrierName !== carrierName && item.positionId === nextPos) {
      console.warn(
        '[WorkStation' +
          wsNo +
          '] 포지션 충돌 감지: ' +
          nextPos +
          ' 위치의 기존 트레이(' +
          item.carrierName +
          ')를 새 트레이(' +
          carrierName +
          ') 진입으로 인해 자동 정리합니다.',
      )
      continue
    }
    cleanedList.push(item)
  }

  // 3. 트레이 위치 갱신 또는 신규 진입 처리
  let exists = false
  const updatedList = []
  for (let i = 0; i < cleanedList.length; i++) {
    const item = cleanedList[i]
    if (item.carrierName === carrierName) {
      updatedList.push({
        ...item,
        positionId: nextPos,
        state: payload.state || 'MOVING',
      })
      exists = true
    } else {
      updatedList.push(item)
    }
  }

  // 신규 진입 트레이인 경우 리스트에 추가
  if (!exists && nextPos) {
    updatedList.push({
      carrierName: carrierName,
      positionId: nextPos,
      state: payload.state || 'ENTER',
    })
  }

  trayList.value = updatedList
  console.log('[WorkStation' + wsNo + '] Tray moved:', carrierName, '->', nextPos)
}

// 5. 선택된 트레이 포지션 ID
const selectedPosition = ref(null)

// 6. 활성 오더 탭 상태 및 로딩 상태
const activeTab = ref('inbound')
const isLoading = ref(false)

// 7. 오더 테이블 컬럼 정의
const orderHeaders = computed(function () {
  return [
    {
      title: t('table.orderNo') || '오더 번호',
      key: 'transportOrderId',
      align: 'start',
      minWidth: '110px',
    },
    { title: t('table.idocId') || 'IDoc ID', key: 'idocId', align: 'start', minWidth: '110px' },
    {
      title: t('table.trayId') || '트레이 ID',
      key: 'carrierName',
      align: 'start',
      minWidth: '100px',
    },
    {
      title: t('table.transportType') || '구분',
      key: 'transportType',
      align: 'center',
      minWidth: '80px',
    },
    {
      title: t('table.status') || '상태',
      key: 'transportStatus',
      align: 'center',
      minWidth: '100px',
    },
    {
      title: t('table.carrierType') || '트레이 타입',
      key: 'carrierType',
      align: 'center',
      minWidth: '100px',
    },
    { title: t('table.galId') || 'GAL ID', key: 'galId', align: 'center', minWidth: '90px' },
    {
      title: t('table.galWarehouse') || '창고',
      key: 'galWarehouse',
      align: 'center',
      minWidth: '90px',
    },
    {
      title: t('table.locationId') || '컨베이어',
      key: 'locationId',
      align: 'center',
      minWidth: '100px',
    },
    {
      title: t('table.workStationId') || '워크스테이션',
      key: 'workStationId',
      align: 'center',
      minWidth: '110px',
    },
    {
      title: t('table.requestedZoneName') || '요청 존',
      key: 'requestedZoneName',
      align: 'center',
      minWidth: '90px',
    },
    {
      title: t('table.travelProfile') || '주행 프로파일',
      key: 'travelProfile',
      align: 'center',
      minWidth: '110px',
    },
    {
      title: t('table.createTime') || '생성 일시',
      key: 'createTime',
      align: 'center',
      minWidth: '160px',
    },
  ]
})

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
    transportOrderId:
      item.transportOrderId ||
      item.orderNo ||
      item.transportOrderNo ||
      item.orderId ||
      (item.id != null ? String(item.id) : '-'),
    idocId: item.idocId || item.idoc || '-',
    carrierName:
      item.carrierName || item.trayId || item.carrierId || item.palletId || item.trayNo || '-',
    transportType:
      item.transportType || (item.orderType && item.orderType.startsWith('WS_TO') ? 'O' : 'I'),
    transportStatus:
      item.transportStatus || item.status || item.orderStatus || item.state || 'IDLE',
    carrierType: item.carrierType || item.trayType || item.type || 'TBD',
    galId: item.galId || '-',
    galWarehouse: item.galWarehouse || '-',
    locationId: item.locationId || item.location || item.conveyorId || '-',
    workStationId: item.workStationId || item.wsNo || wsNo || '-',
    requestedZoneName: item.requestedZoneName || item.targetZone || item.zone || '-',
    travelProfile: item.travelProfile || item.profile || '-',
    createTime:
      item.createTime ||
      item.timestamp ||
      item.createdTime ||
      item.createdAt ||
      item.createDt ||
      '-',
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
    const rawList =
      res && res.content
        ? res.content
        : res && res.data && res.data.content
          ? res.data.content
          : Array.isArray(res)
            ? res
            : res && Array.isArray(res.data)
              ? res.data
              : []
    const list = []
    for (let i = 0; i < rawList.length; i++) {
      list.push(mapTransportOrderItem(rawList[i]))
    }
    inboundOrders.value = list
  } catch (error) {
    console.error('[WorkStation' + wsNo + '] Inbound order fetch error:', error)
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
    const rawList =
      res && res.content
        ? res.content
        : res && res.data && res.data.content
          ? res.data.content
          : Array.isArray(res)
            ? res
            : res && Array.isArray(res.data)
              ? res.data
              : []
    const list = []
    for (let i = 0; i < rawList.length; i++) {
      list.push(mapTransportOrderItem(rawList[i]))
    }
    outboundOrders.value = list
  } catch (error) {
    console.error('[WorkStation' + wsNo + '] Outbound order fetch error:', error)
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
  if (!status) return 'default'
  const s = String(status).toUpperCase()
  if (
    s === '진행중' ||
    s === 'STARTED' ||
    s === 'PROCESSING' ||
    s === 'RUNNING' ||
    s === 'IN_PROGRESS' ||
    s === 'EXECUTING'
  ) {
    return 'primary'
  }
  if (
    s === '대기' ||
    s === 'INIT' ||
    s === 'WAITING' ||
    s === 'PENDING' ||
    s === 'READY' ||
    s === 'REQUESTED'
  ) {
    return 'warning'
  }
  if (s === '완료' || s === 'COMPLETED' || s === 'DONE' || s === 'SUCCESS') {
    return 'success'
  }
  if (s === '에러' || s === 'ERROR' || s === 'FAILED' || s === 'ABORTED' || s === 'CANCEL') {
    return 'error'
  }
  return 'default'
}

// 14. 트레이 포지션 클릭 핸들러 (이벤트 위임 수신)
function handlePositionClick(posId) {
  selectedPosition.value = posId
  console.log('[WorkStation' + wsNo + '] Tray position clicked:', posId)
}

// 15. 행(Row) 클릭 시 반송 오더 상세 정보 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = row && row.item ? row.item.raw || row.item : row
  if (itemData) {
    panelStore.openPanel(markRaw(WorkStationOrderDetailView), {
      mode: 'VIEW',
      data: {
        ...itemData,
        orderNo: itemData.transportOrderId,
        trayId: itemData.carrierName,
        status: itemData.transportStatus,
        timestamp: itemData.createTime,
        transportType: itemData.transportType || (activeTab.value === 'inbound' ? 'I' : 'O'),
        wsNo: wsNo,
        workStationId: itemData.workStationId || wsNo,
      },
      title: t('views.dashboard.orderDetailTitle') || '반송 오더 상세 정보',
    })
  }
}

// 더블클릭 시 호출되는 핸들러 (더미데이터 매핑)
function handleTrayDblClick(carrierName) {
  // 현재 트레이의 위치 조회
  let currentPos = '-'
  for (let i = 0; i < trayList.value.length; i++) {
    if (trayList.value[i].carrierName === carrierName) {
      currentPos = trayList.value[i].positionId
      break
    }
  }

  // 상세 정보 세팅 (현재는 더미데이터 바인딩)
  selectedTrayDetail.value = {
    carrierName: carrierName,
    carrierType: 'INSERT_TRAY_A',
    weightKg: 12.5,
    orderId: 'ORD-20261013-001',
    currentPosition: currentPos,
    status: 'IN_TRANSIT',
  }

  trayDetailDialogVisible.value = true
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
.tray-detail-table th.info-header {
  width: 35%;
  background-color: #f8fafc;
  font-weight: 600 !important;
  color: #475569;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.tray-detail-table td {
  padding-left: 12px !important;
}
</style>
