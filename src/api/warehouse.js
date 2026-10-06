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
    rawLotId: 'RAW-WO3-2610-01',
    weight: 2.25,
    storedDate: '2026-10-04T11:00:00',
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
    rawLotId: 'RAW-WO3-2610-01',
    weight: 2.25,
    storedDate: '2026-10-04T11:15:00',
    status: 'STORED',
    containerType: 'POWDER_CST',
  },
  {
    id: 9,
    carrierId: 'CST-0104',
    location: '01001201 (R1A-02-01)',
    zoneName: 'Z-INCOME-WH',
    itemCode: 'TT-TIC-003',
    itemName: '티타늄 카바이드 미립 분말 (TiC Grade C)',
    batchLot: 'RAW-TIC-2610-12',
    rawLotId: 'RAW-TIC-2610-12',
    weight: 1.8,
    storedDate: '2026-10-05T08:30:00',
    status: 'STORED',
    containerType: 'POWDER_CST',
  },
  {
    id: 10,
    carrierId: 'CST-0105',
    location: '01001202 (R1A-02-02)',
    zoneName: 'Z-INCOME-WH',
    itemCode: 'TT-TAC-004',
    itemName: '탄탈륨 첨가 분말 (TaC Spec S)',
    batchLot: 'RAW-TAC-2610-21',
    rawLotId: 'RAW-TAC-2610-21',
    weight: 1.5,
    storedDate: '2026-10-05T10:45:00',
    status: 'STORED',
    containerType: 'POWDER_CST',
  },
]

// ==========================================
// 4. 해포(Debagging) 오더 및 Pallet Mock 데이터
// ==========================================
export const DEBAGGING_ORDERS_MOCK = [
  {
    orderId: 'DBG-ORD-2026-001',
    debagEquipId: 'DEBAG-01',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3)',
    rawLotId: 'RAW-WO3-2610-01',
    plannedPalletCount: 4,
    processedPalletCount: 1,
    plannedWeight: 4.0,
    status: 'IN_PROGRESS',
    targetContainerType: 'CST-2.0T (2톤 컨테이너)',
    dueDate: '2026-10-06T18:00:00',
    remarks: '환원 공정 공급용 원자재 백 개봉 및 전용 컨테이너 주입',
  },
  {
    orderId: 'DBG-ORD-2026-002',
    debagEquipId: 'DEBAG-02',
    itemCode: 'TT-WPR-002',
    itemName: '고순도 코발트 산화물 분말 (Co3O4)',
    rawLotId: 'RAW-CO-2610-05',
    plannedPalletCount: 4,
    processedPalletCount: 0,
    plannedWeight: 2.0,
    status: 'READY',
    targetContainerType: 'IBC-1.0T (1톤 밀폐 IBC)',
    dueDate: '2026-10-07T12:00:00',
    remarks: '도핑 공정용 분말 백 해포 및 집진 배기 철저',
  },
  {
    orderId: 'DBG-ORD-2026-003',
    debagEquipId: 'DEBAG-01',
    itemCode: 'TT-TIC-003',
    itemName: '티타늄 카바이드 미립 분말 (TiC Grade C)',
    rawLotId: 'RAW-TIC-2610-12',
    plannedPalletCount: 2,
    processedPalletCount: 0,
    plannedWeight: 2.0,
    status: 'READY',
    targetContainerType: 'CST-2.0T (2톤 컨테이너)',
    dueDate: '2026-10-07T16:00:00',
    remarks: '초경 카바이드 첨가제 투입용',
  },
  {
    orderId: 'DBG-ORD-2026-004',
    debagEquipId: 'DEBAG-02',
    itemCode: 'TT-TAC-004',
    itemName: '탄탈륨 첨가 분말 (TaC Spec S)',
    rawLotId: 'RAW-TAC-2610-21',
    plannedPalletCount: 2,
    processedPalletCount: 2,
    plannedWeight: 1.0,
    status: 'COMPLETED',
    targetContainerType: 'CST-1.0T (1톤 소형 컨테이너)',
    dueDate: '2026-10-05T18:00:00',
    remarks: '해포 완료 및 용기 보관 창고 적재 완료',
  },
]

export const DEBAGGING_PALLETS_MOCK = [
  {
    id: 1,
    orderId: 'DBG-ORD-2026-001',
    palletId: 'PLT-20261006-001',
    fibcBagId: 'BAG-WP-9921',
    rawLotId: 'RAW-WO3-2610-01',
    weight: 1.002,
    location: 'IN_PORT_01',
    status: 'READY',
    registeredAt: '2026-10-06T09:15:00',
  },
  {
    id: 2,
    orderId: 'DBG-ORD-2026-001',
    palletId: 'PLT-20261006-002',
    fibcBagId: 'BAG-WP-9922',
    rawLotId: 'RAW-WO3-2610-01',
    weight: 0.998,
    location: 'IN_PORT_01',
    status: 'READY',
    registeredAt: '2026-10-06T09:20:00',
  },
  {
    id: 3,
    orderId: 'DBG-ORD-2026-001',
    palletId: 'PLT-20261006-003',
    fibcBagId: 'BAG-WP-9923',
    rawLotId: 'RAW-WO3-2610-01',
    weight: 1.005,
    location: 'STAGE_BUFFER_01',
    status: 'MOVING',
    registeredAt: '2026-10-06T09:25:00',
  },
  {
    id: 4,
    orderId: 'DBG-ORD-2026-001',
    palletId: 'PLT-20261006-004',
    fibcBagId: 'BAG-WP-9920',
    rawLotId: 'RAW-WO3-2610-01',
    weight: 1.000,
    location: 'DEBAG-01',
    status: 'COMPLETED',
    registeredAt: '2026-10-06T08:50:00',
  },
  {
    id: 5,
    orderId: 'DBG-ORD-2026-002',
    palletId: 'PLT-20261006-011',
    fibcBagId: 'BAG-CO-8811',
    rawLotId: 'RAW-CO-2610-05',
    weight: 0.501,
    location: 'IN_PORT_02',
    status: 'READY',
    registeredAt: '2026-10-06T10:00:00',
  },
  {
    id: 6,
    orderId: 'DBG-ORD-2026-002',
    palletId: 'PLT-20261006-012',
    fibcBagId: 'BAG-CO-8812',
    rawLotId: 'RAW-CO-2610-05',
    weight: 0.499,
    location: 'IN_PORT_02',
    status: 'READY',
    registeredAt: '2026-10-06T10:05:00',
  },
  {
    id: 7,
    orderId: 'DBG-ORD-2026-003',
    palletId: 'PLT-20261006-021',
    fibcBagId: 'BAG-TIC-7701',
    rawLotId: 'RAW-TIC-2610-12',
    weight: 1.001,
    location: 'DOCK_A',
    status: 'READY',
    registeredAt: '2026-10-06T11:00:00',
  },
]

// ==========================================
// 5. 창고별 실시간 재고 현황 Mock 데이터
// ==========================================
export const INVENTORY_STATUS_MOCK = [
  {
    id: 1,
    carrierId: 'CST-0101',
    warehouse: 'WH1',
    location: '01001101 (R1A-01-01)',
    materialType: 'Container',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    lotId: 'BLOT-261006-01',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'STOCK',
    weight: 2.05,
    useCount: 14,
    updatedAt: '2026-10-06T15:30:00',
    storedAt: '2026-10-05T09:12:00',
    lastWorker: 'OP_MIX_01',
    lastEvent: '혼합 공정 완료 자동 입고',
  },
  {
    id: 2,
    carrierId: 'CST-0102',
    warehouse: 'WH1',
    location: '01001102 (R1A-01-02)',
    materialType: 'Container',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    lotId: 'BLOT-261006-01',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'STOCK',
    weight: 1.98,
    useCount: 12,
    updatedAt: '2026-10-06T15:32:00',
    storedAt: '2026-10-05T09:15:00',
    lastWorker: 'OP_MIX_01',
    lastEvent: '혼합 공정 완료 자동 입고',
  },
  {
    id: 3,
    carrierId: 'CST-0103',
    warehouse: 'WH1',
    location: '01001103 (R1A-01-03)',
    materialType: 'Container',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    lotId: 'BLOT-261006-02',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'WIP',
    weight: 2.01,
    useCount: 8,
    updatedAt: '2026-10-06T14:10:00',
    storedAt: '2026-10-05T15:10:00',
    lastWorker: 'OP_WH_DISPATCH',
    lastEvent: '출고 대기 반송 지시',
  },
  {
    id: 4,
    carrierId: 'CR-201',
    warehouse: 'WH2',
    location: '02002101 (R2B-02-01)',
    materialType: 'Container',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3)',
    lotId: 'RAW-WO3-2610-01',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'STOCK',
    weight: 2.50,
    useCount: 22,
    updatedAt: '2026-10-05T11:00:00',
    storedAt: '2026-10-04T09:00:00',
    lastWorker: 'OP_DEBAG_01',
    lastEvent: '해포 설비 배출 적재',
  },
  {
    id: 5,
    carrierId: 'CR-202',
    warehouse: 'WH2',
    location: '02002102 (R2B-02-02)',
    materialType: 'Container',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3)',
    lotId: 'RAW-WO3-2610-01',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'STOCK',
    weight: 2.49,
    useCount: 21,
    updatedAt: '2026-10-05T11:30:00',
    storedAt: '2026-10-04T09:30:00',
    lastWorker: 'OP_DEBAG_01',
    lastEvent: '해포 설비 배출 적재',
  },
  {
    id: 6,
    carrierId: 'IBC-301',
    warehouse: 'WH3',
    location: '03003101 (R3C-03-01)',
    materialType: 'Container',
    itemCode: 'TT-WPR-002',
    itemName: '고순도 코발트 산화물 (Co3O4)',
    lotId: 'RAW-CO-2610-05',
    rawLotId: 'RAW-CO-2610-05',
    status: 'STOCK',
    weight: 2.00,
    useCount: 15,
    updatedAt: '2026-10-04T16:00:00',
    storedAt: '2026-10-03T16:00:00',
    lastWorker: 'OP_DOPING',
    lastEvent: '도핑 공정 중간재 보관',
  },
  {
    id: 7,
    carrierId: 'PLT-20261006-001',
    warehouse: 'WH1',
    location: 'PORT_IN_01 (입고 1포트)',
    materialType: 'Pallet',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3 Grade A)',
    lotId: 'RAW-WO3-2610-01',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'WIP',
    weight: 1.002,
    useCount: 3,
    updatedAt: '2026-10-06T14:40:00',
    storedAt: '2026-10-06T09:15:00',
    lastWorker: 'OP_INBOUND',
    lastEvent: '현장 실측 입고 등록',
  },
  {
    id: 8,
    carrierId: 'BAG-WP-9921',
    warehouse: 'WH1',
    location: 'PLT-20261006-001 적재',
    materialType: 'FIBC Bag',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3 Grade A)',
    lotId: 'RAW-WO3-2610-01',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'STOCK',
    weight: 1.002,
    useCount: 1,
    updatedAt: '2026-10-06T14:40:00',
    storedAt: '2026-10-06T09:15:00',
    lastWorker: 'OP_INBOUND',
    lastEvent: '원자재 Bag 바코드 바인딩',
  },
  {
    id: 9,
    carrierId: 'CST-0104',
    warehouse: 'WH1',
    location: '01001201 (R1A-02-01)',
    materialType: 'Container',
    itemCode: 'TT-TIC-003',
    itemName: '티타늄 카바이드 미립 분말',
    lotId: 'RAW-TIC-2610-12',
    rawLotId: 'RAW-TIC-2610-12',
    status: 'BLOCKED',
    weight: 1.80,
    useCount: 19,
    updatedAt: '2026-10-06T08:00:00',
    storedAt: '2026-10-05T08:30:00',
    lastWorker: 'QC_INSPECTOR',
    lastEvent: '품질 수분 검사 보류(Hold)',
  },
  {
    id: 10,
    carrierId: 'CR-501',
    warehouse: 'WH4',
    location: '05001103 (R5A-01-03)',
    materialType: 'Container',
    itemCode: 'TT-P30-BLD',
    itemName: 'P30 블렌딩용 중간재 분말',
    lotId: 'LOT-BL-2610-031',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'STOCK',
    weight: 2.25,
    useCount: 26,
    updatedAt: '2026-10-05T17:20:00',
    storedAt: '2026-10-04T11:00:00',
    lastWorker: 'OP_BLEND_01',
    lastEvent: '블렌더 출고 전산 등록',
  },
  {
    id: 11,
    carrierId: 'CST-0105',
    warehouse: 'WH1',
    location: '01001202 (R1A-02-02)',
    materialType: 'Container',
    itemCode: 'TT-TAC-004',
    itemName: '탄탈륨 첨가 분말 (TaC)',
    lotId: 'RAW-TAC-2610-21',
    rawLotId: 'RAW-TAC-2610-21',
    status: 'STOCK',
    weight: 1.50,
    useCount: 9,
    updatedAt: '2026-10-05T13:00:00',
    storedAt: '2026-10-05T10:45:00',
    lastWorker: 'OP_DEBAG_02',
    lastEvent: '해포 완료 입고',
  },
  {
    id: 12,
    carrierId: 'CR-502',
    warehouse: 'WH4',
    location: '05001104 (R5A-01-04)',
    materialType: 'Container',
    itemCode: 'TT-P30-BLD',
    itemName: 'P30 블렌딩용 중간재 분말',
    lotId: 'LOT-BL-2610-031',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'STOCK',
    weight: 2.25,
    useCount: 27,
    updatedAt: '2026-10-05T17:25:00',
    storedAt: '2026-10-04T11:15:00',
    lastWorker: 'OP_BLEND_01',
    lastEvent: '블렌더 출고 전산 등록',
  },
]

// ==========================================
// 6. 재고 실사(Stock Taking) 오더 및 실사 대상 캐리어 Mock 데이터
// ==========================================
export const STOCK_TAKING_ORDERS_MOCK = [
  {
    orderId: 'ST-202610-001',
    targetZone: 'WH1 (선반 랙 A/B 구역)',
    warehouse: 'WH1',
    targetLot: 'BLOT-261006-01',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    totalCarriers: 4,
    completedCarriers: 1,
    status: 'IN_PROGRESS',
    plannedDate: '2026-10-06',
    auditor: '물류운영팀 이과장',
    remarks: '월간 정기 재고 실사 및 실측 중량 검증',
  },
  {
    orderId: 'ST-202610-002',
    targetZone: 'WH2 (원자재 보관 랙)',
    warehouse: 'WH2',
    targetLot: 'RAW-WO3-2610-01',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3)',
    totalCarriers: 3,
    completedCarriers: 0,
    status: 'READY',
    plannedDate: '2026-10-07',
    auditor: '공정관리팀 박대리',
    remarks: '환원 공정 공급 전 원자재 칭량 오차 확인',
  },
  {
    orderId: 'ST-202610-003',
    targetZone: 'WH3 (첨가제 스토커 존)',
    warehouse: 'WH3',
    targetLot: 'RAW-CO-2610-05',
    itemCode: 'TT-WPR-002',
    itemName: '고순도 코발트 산화물 (Co3O4)',
    totalCarriers: 2,
    completedCarriers: 2,
    status: 'COMPLETED',
    plannedDate: '2026-10-05',
    auditor: '물류운영팀 김주임',
    remarks: '분기 정기 실사 완료 건',
  },
]

export const STOCK_TAKING_CARRIERS_MOCK = [
  {
    id: 1,
    orderId: 'ST-202610-001',
    carrierId: 'CST-0101',
    warehouse: 'WH1',
    location: '01001101 (R1A-01-01)',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    lotId: 'BLOT-261006-01',
    bookWeight: 1000, // kg 단위
    actualWeight: 950, // kg 단위
    diffWeight: -50,
    status: 'COMPLETED',
    reason: '공정 비산 및 계량 편차에 따른 감모',
    auditedAt: '2026-10-06T14:20:00',
    auditor: '물류운영팀 이과장',
  },
  {
    id: 2,
    orderId: 'ST-202610-001',
    carrierId: 'CST-0102',
    warehouse: 'WH1',
    location: '01001102 (R1A-01-02)',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    lotId: 'BLOT-261006-01',
    bookWeight: 1000,
    actualWeight: null,
    diffWeight: null,
    status: 'READY',
    reason: '',
    auditedAt: null,
    auditor: '',
  },
  {
    id: 3,
    orderId: 'ST-202610-001',
    carrierId: 'CST-0103',
    warehouse: 'WH1',
    location: 'PORT_INSP_01 (실사 측정대)',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    lotId: 'BLOT-261006-01',
    bookWeight: 1000,
    actualWeight: null,
    diffWeight: null,
    status: 'MOVING',
    reason: '',
    auditedAt: null,
    auditor: '',
  },
  {
    id: 4,
    orderId: 'ST-202610-001',
    carrierId: 'CST-0104',
    warehouse: 'WH1',
    location: '01001104 (R1A-01-04)',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    lotId: 'BLOT-261006-01',
    bookWeight: 1000,
    actualWeight: null,
    diffWeight: null,
    status: 'READY',
    reason: '',
    auditedAt: null,
    auditor: '',
  },
  {
    id: 5,
    orderId: 'ST-202610-002',
    carrierId: 'CR-201',
    warehouse: 'WH2',
    location: '02002101 (R2B-02-01)',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3)',
    lotId: 'RAW-WO3-2610-01',
    bookWeight: 2500,
    actualWeight: null,
    diffWeight: null,
    status: 'READY',
    reason: '',
    auditedAt: null,
    auditor: '',
  },
  {
    id: 6,
    orderId: 'ST-202610-002',
    carrierId: 'CR-202',
    warehouse: 'WH2',
    location: '02002102 (R2B-02-02)',
    itemCode: 'TT-WP-001',
    itemName: '초미립 텅스텐 산화물 (WO3)',
    lotId: 'RAW-WO3-2610-01',
    bookWeight: 2500,
    actualWeight: null,
    diffWeight: null,
    status: 'READY',
    reason: '',
    auditedAt: null,
    auditor: '',
  },
]

// =========================================================================
// API Functions
// =========================================================================

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

/**
 * 6. 해포(Debagging) 오더 목록 조회
 */
export async function fetchDebaggingOrdersApi(params) {
  try {
    const res = await api.get('/warehouse/debagging-orders', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchDebaggingOrdersApi fallback to mock:', err)
  }

  let filtered = DEBAGGING_ORDERS_MOCK.slice()
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
          item.debagEquipId.toLowerCase().indexOf(kw) !== -1
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
 * 7. 해포 대상 Pallet 목록 조회
 */
export async function fetchDebaggingPalletsApi(params) {
  try {
    const res = await api.get('/warehouse/debagging-pallets', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchDebaggingPalletsApi fallback to mock:', err)
  }

  let filtered = DEBAGGING_PALLETS_MOCK.slice()
  if (params) {
    if (params.orderId) {
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].orderId === params.orderId) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }
    if (params.searchKeyword) {
      const kw = String(params.searchKeyword).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          item.palletId.toLowerCase().indexOf(kw) !== -1 ||
          item.fibcBagId.toLowerCase().indexOf(kw) !== -1 ||
          item.rawLotId.toLowerCase().indexOf(kw) !== -1
        ) {
          temp.push(item)
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
 * 8. 해포 설비로 Pallet 반송 명령 전송
 */
export async function transferPalletsToDebagEquipApi(payload) {
  try {
    const res = await api.post('/warehouse/transfer-debag', payload)
    return res
  } catch (err) {
    console.debug('transferPalletsToDebagEquipApi mock execution:', err)
    await new Promise(function (resolve) {
      setTimeout(resolve, 400)
    })
    return {
      success: true,
      message: '해포 설비 반송 지시가 성공적으로 전송되었습니다.',
      data: {
        commandId: 'CMD-DBG-TR-' + Date.now(),
        palletIds: payload ? payload.palletIds : [],
        destinationEquip: payload ? payload.destinationEquip : null,
        dispatchedAt: new Date().toISOString(),
      },
    }
  }
}

/**
 * 9. 해포 수동 완료 처리 API
 */
export async function completeManualDebaggingApi(payload) {
  try {
    const res = await api.post('/warehouse/complete-debag', payload)
    return res
  } catch (err) {
    console.debug('completeManualDebaggingApi mock execution:', err)
    await new Promise(function (resolve) {
      setTimeout(resolve, 400)
    })
    return {
      success: true,
      message: '해포 완료 및 Container 투입 실적이 정상 등록되었습니다.',
      data: {
        debagNo: 'DBG-RES-' + Date.now(),
        orderId: payload ? payload.orderId : null,
        containerId: payload ? payload.containerId : null,
        actualWeight: payload ? payload.actualWeight : 0,
        completedAt: new Date().toISOString(),
      },
    }
  }
}

/**
 * 10. 창고별 실시간 재고 현황 목록 조회 (페이징 / 필터)
 */
export async function fetchInventoryStatusApi(params) {
  try {
    const res = await api.get('/warehouse/inventory-status', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchInventoryStatusApi fallback to mock:', err)
  }

  let filtered = INVENTORY_STATUS_MOCK.slice()
  if (params) {
    if (params.warehouse && params.warehouse !== 'ALL') {
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].warehouse === params.warehouse) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }
    if (params.materialType && params.materialType !== 'ALL') {
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].materialType === params.materialType) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }
    if (params.searchKeyword) {
      const kw = String(params.searchKeyword).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          item.carrierId.toLowerCase().indexOf(kw) !== -1 ||
          item.itemCode.toLowerCase().indexOf(kw) !== -1 ||
          item.itemName.toLowerCase().indexOf(kw) !== -1 ||
          item.lotId.toLowerCase().indexOf(kw) !== -1 ||
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
 * 11. 캐리어/용기 상세 정보 단건 조회
 */
export async function fetchCarrierDetailApi(carrierId) {
  try {
    const res = await api.get('/warehouse/carrier/' + carrierId)
    if (res && res.data) {
      return res.data
    }
  } catch (err) {
    console.debug('fetchCarrierDetailApi fallback to mock:', err)
  }

  for (let i = 0; i < INVENTORY_STATUS_MOCK.length; i++) {
    if (INVENTORY_STATUS_MOCK[i].carrierId === carrierId) {
      return INVENTORY_STATUS_MOCK[i]
    }
  }

  // fallback default detail
  return {
    carrierId: carrierId,
    warehouse: 'WH1',
    location: '01001101',
    materialType: 'Container',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 혼합 분말',
    lotId: 'BLOT-261006-01',
    rawLotId: 'RAW-WO3-2610-01',
    status: 'STOCK',
    weight: 2.0,
    useCount: 10,
    updatedAt: new Date().toISOString(),
    storedAt: new Date().toISOString(),
    lastWorker: 'SYSTEM_OP',
    lastEvent: '정상 재고 보관',
  }
}

/**
 * 12. 재고 실사(Stock Taking) 오더 목록 조회
 */
export async function fetchStockTakingOrdersApi(params) {
  try {
    const res = await api.get('/warehouse/stocktaking-orders', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchStockTakingOrdersApi fallback to mock:', err)
  }

  let filtered = STOCK_TAKING_ORDERS_MOCK.slice()
  if (params) {
    if (params.searchKeyword) {
      const kw = String(params.searchKeyword).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          item.orderId.toLowerCase().indexOf(kw) !== -1 ||
          item.targetZone.toLowerCase().indexOf(kw) !== -1 ||
          item.targetLot.toLowerCase().indexOf(kw) !== -1 ||
          item.itemName.toLowerCase().indexOf(kw) !== -1
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
 * 13. 재고 실사 대상 캐리어 목록 조회
 */
export async function fetchStockTakingCarriersApi(params) {
  try {
    const res = await api.get('/warehouse/stocktaking-carriers', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchStockTakingCarriersApi fallback to mock:', err)
  }

  let filtered = STOCK_TAKING_CARRIERS_MOCK.slice()
  if (params) {
    if (params.orderId) {
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].orderId === params.orderId) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }
    if (params.searchKeyword) {
      const kw = String(params.searchKeyword).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          item.carrierId.toLowerCase().indexOf(kw) !== -1 ||
          item.lotId.toLowerCase().indexOf(kw) !== -1 ||
          item.location.toLowerCase().indexOf(kw) !== -1
        ) {
          temp.push(item)
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
 * 14. 재고 실사 대상 캐리어 측정대/작업포트 반송 요청 API
 */
export async function requestStockTakingTransferApi(payload) {
  try {
    const res = await api.post('/warehouse/stocktaking-transfer', payload)
    return res
  } catch (err) {
    console.debug('requestStockTakingTransferApi mock execution:', err)
    await new Promise(function (resolve) {
      setTimeout(resolve, 400)
    })
    return {
      success: true,
      message: '실사 측정 포트로 캐리어 반송 명령이 전송되었습니다.',
      data: {
        commandId: 'CMD-ST-TR-' + Date.now(),
        carrierIds: payload ? payload.carrierIds : [],
        targetPort: 'PORT_INSP_01',
        dispatchedAt: new Date().toISOString(),
      },
    }
  }
}

/**
 * 15. 재고 실사 실측 중량 보정 및 완료 등록 API
 */
export async function completeStockTakingAdjustmentApi(payload) {
  try {
    const res = await api.post('/warehouse/stocktaking-complete', payload)
    return res
  } catch (err) {
    console.debug('completeStockTakingAdjustmentApi mock execution:', err)
    await new Promise(function (resolve) {
      setTimeout(resolve, 400)
    })
    return {
      success: true,
      message: '재고 실사 실측 중량 및 ERP 보정 처리가 완료되었습니다.',
      data: {
        adjustmentNo: 'ADJ-' + Date.now(),
        orderId: payload ? payload.orderId : null,
        carrierId: payload ? payload.carrierId : null,
        bookWeight: payload ? payload.bookWeight : 0,
        actualWeight: payload ? payload.actualWeight : 0,
        diffWeight: payload ? payload.diffWeight : 0,
        reason: payload ? payload.reason : '',
        adjustedAt: new Date().toISOString(),
      },
    }
  }
}
