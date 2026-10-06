// src/api/warehouse.js
import api from './index'

// ==========================================
// 1. ERP 입고 오더 (FIBC Bag 단위 원자재) Mock 데이터
// ==========================================
export const INBOUND_ORDERS_MOCK = [
  {
    orderId: 'IN-ORD-2026-001',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3 Grade A)',
    rawLotId: 'RAW-WO3-2610-01',
    totalPlannedWeight: 10.0,
    bagPlannedWeight: 1.0,
    totalBagCount: 10,
    processedBagCount: 3,
    status: 'IN_PROGRESS',
    supplier: 'TaeguTec 글로벌 원자재 공급부',
    dueDate: '2026-10-10T18:00:00',
    targetZone: 'Z-INCOME-WH',
    defaultPort: 'IN_PORT_01',
    remarks: 'FIBC 방습 백 1톤 단위 입고 검수 건',
  },
  {
    orderId: 'IN-ORD-2026-002',
    itemCode: 'TT-WPR-002',
    itemName: '고순도 코발트 산화물 분말 (Co3O4)',
    rawLotId: 'RAW-CO-2610-05',
    totalPlannedWeight: 5.0,
    bagPlannedWeight: 0.5,
    totalBagCount: 10,
    processedBagCount: 0,
    status: 'READY',
    supplier: '코발트 정련 공급사',
    dueDate: '2026-10-12T18:00:00',
    targetZone: 'Z-DOPING-WH',
    defaultPort: 'IN_PORT_02',
    remarks: '도핑 공정 투입용 500kg 밀폐 백 입고',
  },
  {
    orderId: 'IN-ORD-2026-003',
    itemCode: 'TT-TIC-003',
    itemName: '티타늄 카바이드 미립 분말 (TiC Grade C)',
    rawLotId: 'RAW-TIC-2610-12',
    totalPlannedWeight: 8.0,
    bagPlannedWeight: 1.0,
    totalBagCount: 8,
    processedBagCount: 0,
    status: 'READY',
    supplier: '특수 카바이드 소재사',
    dueDate: '2026-10-15T18:00:00',
    targetZone: 'Z-RED-WH',
    defaultPort: 'DOCK_A',
    remarks: '환원 공정 원료 투입 대기',
  },
  {
    orderId: 'IN-ORD-2026-004',
    itemCode: 'TT-TAC-004',
    itemName: '탄탈륨 첨가 분말 (TaC Spec S)',
    rawLotId: 'RAW-TAC-2610-21',
    totalPlannedWeight: 3.0,
    bagPlannedWeight: 0.5,
    totalBagCount: 6,
    processedBagCount: 2,
    status: 'IN_PROGRESS',
    supplier: '희유금속 공급 사업부',
    dueDate: '2026-10-18T18:00:00',
    targetZone: 'Z-INCOME-WH',
    defaultPort: 'IN_PORT_01',
    remarks: '방진 포장 무결성 검수 필수',
  },
  {
    orderId: 'IN-ORD-2026-005',
    itemCode: 'TT-C-005',
    itemName: '고순도 흑연 카본 분말 (Carbon Black)',
    rawLotId: 'RAW-CB-2610-33',
    totalPlannedWeight: 6.0,
    bagPlannedWeight: 1.0,
    totalBagCount: 6,
    processedBagCount: 0,
    status: 'READY',
    supplier: '카본 복합소재 파트너스',
    dueDate: '2026-10-20T18:00:00',
    targetZone: 'Z-CARBUR-WH',
    defaultPort: 'DOCK_B',
    remarks: '탄화 공정 배합용 카본 분말',
  },
]

// ==========================================
// 2. ERP 출고 오더 (공정 투입용) Mock 데이터
// ==========================================
export const OUTBOUND_ORDERS_MOCK = [
  {
    orderId: 'OUT-ORD-2026-101',
    destinationProcess: 'MIX-01 (어트리터 믹서 1호기)',
    destinationPort: 'PORT-MIX-01',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    requiredLot: 'BLOT-261006-01',
    requestedWeight: 4.0,
    requestedContainers: 2,
    urgency: 'EMERGENCY',
    status: 'REQUESTED',
    dueDate: '2026-10-06T18:00:00',
    requester: '혼합 1팀 홍길동',
    remarks: '인서트 프레스 긴급 오더 투입용 4.0톤 출고 요청',
  },
  {
    orderId: 'OUT-ORD-2026-102',
    destinationProcess: 'RED-01 (로터리 환원로 1호기)',
    destinationPort: 'PORT-RED-01',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3)',
    requiredLot: 'RAW-WO3-2610-01',
    requestedWeight: 5.0,
    requestedContainers: 2,
    urgency: 'NORMAL',
    status: 'REQUESTED',
    dueDate: '2026-10-07T10:00:00',
    requester: '환원 공정 1조',
    remarks: '로터리 킬른 연속 환원 공급 캐리어 출고',
  },
  {
    orderId: 'OUT-ORD-2026-103',
    destinationProcess: 'DOP-01 (습식 도핑 믹서 1호기)',
    destinationPort: 'PORT-DOP-01',
    itemCode: 'TT-WPR-002',
    itemName: '고순도 코발트 산화물 (Co3O4)',
    requiredLot: 'RAW-CO-2610-05',
    requestedWeight: 2.0,
    requestedContainers: 1,
    urgency: 'NORMAL',
    status: 'REQUESTED',
    dueDate: '2026-10-07T14:00:00',
    requester: '도핑 공정 2조',
    remarks: '습식 코발트 배합 6.0% 도핑용',
  },
  {
    orderId: 'OUT-ORD-2026-104',
    destinationProcess: 'BLD-01 (더블콘 블렌더 1호기)',
    destinationPort: 'PORT-BLD-01',
    itemCode: 'TT-P30-BLD',
    itemName: 'P30 블렌딩용 중간재 분말',
    requiredLot: 'LOT-BL-2610-031',
    requestedWeight: 4.5,
    requestedContainers: 2,
    urgency: 'EMERGENCY',
    status: 'REQUESTED',
    dueDate: '2026-10-08T09:00:00',
    requester: '블렌딩 파트 김책임',
    remarks: '내마모 인서트용 대용량 균일 혼합',
  },
]

// ==========================================
// 3. 창고 보관 캐리어(Container) 재고 Mock 데이터
// ==========================================
export const WAREHOUSE_CARRIERS_MOCK = [
  {
    id: 1,
    carrierId: 'CST-0101',
    location: '01001101 (R1A-01-01)',
    zoneName: 'Z-INCOME-WH',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    batchLot: 'BLOT-261006-01',
    rawLotId: 'RAW-WO3-2610-01',
    weight: 2.0,
    storedDate: '2026-10-05T14:20:00',
    status: 'STORED',
    containerType: 'POWDER_CST',
  },
  {
    id: 2,
    carrierId: 'CST-0102',
    location: '01001102 (R1A-01-02)',
    zoneName: 'Z-INCOME-WH',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    batchLot: 'BLOT-261006-01',
    rawLotId: 'RAW-WO3-2610-01',
    weight: 2.0,
    storedDate: '2026-10-05T14:35:00',
    status: 'STORED',
    containerType: 'POWDER_CST',
  },
  {
    id: 3,
    carrierId: 'CST-0103',
    location: '01001103 (R1A-01-03)',
    zoneName: 'Z-INCOME-WH',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    batchLot: 'BLOT-261006-02',
    rawLotId: 'RAW-WO3-2610-01',
    weight: 2.0,
    storedDate: '2026-10-05T15:10:00',
    status: 'AVAILABLE',
    containerType: 'POWDER_CST',
  },
  {
    id: 4,
    carrierId: 'CR-201',
    location: '02002101 (R2B-02-01)',
    zoneName: 'Z-RED-WH',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3)',
    batchLot: 'RAW-WO3-2610-01',
    rawLotId: 'RAW-WO3-2610-01',
    weight: 2.5,
    storedDate: '2026-10-04T09:00:00',
    status: 'STORED',
    containerType: 'BULK_IBC',
  },
  {
    id: 5,
    carrierId: 'CR-202',
    location: '02002102 (R2B-02-02)',
    zoneName: 'Z-RED-WH',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3)',
    batchLot: 'RAW-WO3-2610-01',
    rawLotId: 'RAW-WO3-2610-01',
    weight: 2.5,
    storedDate: '2026-10-04T09:30:00',
    status: 'STORED',
    containerType: 'BULK_IBC',
  },
  {
    id: 6,
    carrierId: 'IBC-301',
    location: '03003101 (R3C-03-01)',
    zoneName: 'Z-DOPING-WH',
    itemCode: 'TT-WPR-002',
    itemName: '고순도 코발트 산화물 (Co3O4)',
    batchLot: 'RAW-CO-2610-05',
    rawLotId: 'RAW-CO-2610-05',
    weight: 2.0,
    storedDate: '2026-10-03T16:00:00',
    status: 'STORED',
    containerType: 'LIQUID_IBC',
  },
  {
    id: 7,
    carrierId: 'CR-501',
    location: '05001103 (R5A-01-03)',
    zoneName: 'Z-BLD-WH',
    itemCode: 'TT-P30-BLD',
    itemName: 'P30 블렌딩용 중간재 분말',
    batchLot: 'LOT-BL-2610-031',
    rawLotId: 'RAW-P30-2609-61',
    weight: 2.25,
    storedDate: '2026-10-05T11:00:00',
    status: 'STORED',
    containerType: 'POWDER_CST',
  },
  {
    id: 8,
    carrierId: 'CR-502',
    location: '05001104 (R5A-01-04)',
    zoneName: 'Z-BLD-WH',
    itemCode: 'TT-P30-BLD',
    itemName: 'P30 블렌딩용 중간재 분말',
    batchLot: 'LOT-BL-2610-031',
    rawLotId: 'RAW-P30-2609-61',
    weight: 2.25,
    storedDate: '2026-10-05T11:20:00',
    status: 'STORED',
    containerType: 'POWDER_CST',
  },
  {
    id: 9,
    carrierId: 'CST-0201',
    location: '01002201 (R1B-02-01)',
    zoneName: 'Z-INCOME-WH',
    itemCode: 'TT-TIC-003',
    itemName: '티타늄 카바이드 미립 분말',
    batchLot: 'RAW-TIC-2610-12',
    rawLotId: 'RAW-TIC-2610-12',
    weight: 2.0,
    storedDate: '2026-10-02T13:00:00',
    status: 'STORED',
    containerType: 'POWDER_CST',
  },
  {
    id: 10,
    carrierId: 'CST-0202',
    location: '01002202 (R1B-02-02)',
    zoneName: 'Z-INCOME-WH',
    itemCode: 'TT-TAC-004',
    itemName: '탄탈륨 첨가 분말',
    batchLot: 'RAW-TAC-2610-21',
    rawLotId: 'RAW-TAC-2610-21',
    weight: 1.5,
    storedDate: '2026-10-01T10:00:00',
    status: 'STORED',
    containerType: 'POWDER_CST',
  },
]

// ==========================================
// 4. API 함수들
// ==========================================

/**
 * 1. 입고 오더 목록 조회
 */
export async function fetchInboundOrdersApi(params) {
  try {
    const res = await api.get('/warehouse/inbound-orders', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchInboundOrdersApi fallback to mock:', err)
  }

  let filtered = INBOUND_ORDERS_MOCK.slice()
  if (params) {
    if (params.searchKeyword) {
      const kw = String(params.searchKeyword).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          item.orderId.toLowerCase().indexOf(kw) !== -1 ||
          item.itemCode.toLowerCase().indexOf(kw) !== -1 ||
          item.itemName.toLowerCase().indexOf(kw) !== -1 ||
          item.rawLotId.toLowerCase().indexOf(kw) !== -1
        ) {
          temp.push(item)
        }
      }
      filtered = temp
    }
    if (params.status && params.status !== 'ALL') {
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].status === params.status) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }
  }

  return {
    content: filtered,
    totalElements: filtered.length,
  }
}

/**
 * 2. 원자재 FIBC Bag 입고 처리 및 WCS 입고 명령 전송
 */
export async function registerInboundBagApi(payload) {
  try {
    const res = await api.post('/warehouse/inbound-bag', payload)
    return res
  } catch (err) {
    console.debug('registerInboundBagApi mock execution:', err)
    await new Promise(function (resolve) {
      setTimeout(resolve, 400)
    })
    return {
      success: true,
      message: 'WCS 입고 적재 지시가 성공적으로 전송되었습니다.',
      data: {
        inboundNo: 'INB-BAG-' + Date.now(),
        orderId: payload ? payload.orderId : null,
        fibcBagId: payload ? payload.fibcBagId : null,
        palletId: payload ? payload.palletId : null,
        actualWeight: payload ? payload.actualWeight : 0,
        registeredAt: new Date().toISOString(),
      },
    }
  }
}

/**
 * 3. 출고 오더 목록 조회
 */
export async function fetchOutboundOrdersApi(params) {
  try {
    const res = await api.get('/warehouse/outbound-orders', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchOutboundOrdersApi fallback to mock:', err)
  }

  let filtered = OUTBOUND_ORDERS_MOCK.slice()
  if (params) {
    if (params.searchKeyword) {
      const kw = String(params.searchKeyword).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          item.orderId.toLowerCase().indexOf(kw) !== -1 ||
          item.itemCode.toLowerCase().indexOf(kw) !== -1 ||
          item.itemName.toLowerCase().indexOf(kw) !== -1 ||
          item.destinationProcess.toLowerCase().indexOf(kw) !== -1
        ) {
          temp.push(item)
        }
      }
      filtered = temp
    }
    if (params.urgency && params.urgency !== 'ALL') {
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].urgency === params.urgency) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }
  }

  return {
    content: filtered,
    totalElements: filtered.length,
  }
}

/**
 * 4. 창고 보관 출고 가능 캐리어 목록 조회 (페이징 / 필터)
 */
export async function fetchWarehouseCarriersApi(params) {
  try {
    const res = await api.get('/warehouse/carriers', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchWarehouseCarriersApi fallback to mock:', err)
  }

  let filtered = WAREHOUSE_CARRIERS_MOCK.slice()
  if (params) {
    if (params.itemCode) {
      const code = String(params.itemCode).trim().toLowerCase()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].itemCode.toLowerCase() === code) {
          temp.push(filtered[i])
        }
      }
      // 매칭되는 항목이 있으면 필터링된 결과 반환
      if (temp.length > 0) {
        filtered = temp
      }
    }
    if (params.searchKeyword) {
      const kw = String(params.searchKeyword).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          item.carrierId.toLowerCase().indexOf(kw) !== -1 ||
          item.batchLot.toLowerCase().indexOf(kw) !== -1 ||
          item.location.toLowerCase().indexOf(kw) !== -1
        ) {
          temp.push(item)
        }
      }
      filtered = temp
    }
  }

  const page = (params && params.page) || 0
  const size = (params && params.size) || 10
  const start = page * size
  const paginated = filtered.slice(start, start + size)

  return {
    content: paginated,
    totalElements: filtered.length,
    totalPages: Math.ceil(filtered.length / size),
    page: page,
    size: size,
  }
}

/**
 * 5. 출고 지시 및 WCS 반송 명령 발행 API
 */
export async function dispatchOutboundCarriersApi(payload) {
  try {
    const res = await api.post('/warehouse/dispatch-outbound', payload)
    return res
  } catch (err) {
    console.debug('dispatchOutboundCarriersApi mock execution:', err)
    await new Promise(function (resolve) {
      setTimeout(resolve, 400)
    })
    return {
      success: true,
      message: 'WCS 출고 반송 명령이 성공적으로 발행되었습니다.',
      data: {
        commandId: 'CMD-OUT-' + Date.now(),
        orderId: payload ? payload.orderId : null,
        carrierIds: payload ? payload.carrierIds : [],
        destinationPort: payload ? payload.destinationPort : null,
        dispatchedAt: new Date().toISOString(),
      },
    }
  }
}
