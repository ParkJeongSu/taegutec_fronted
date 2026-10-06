// src/api/equipment.js
import api from './index'

// ==========================================

// 1. 설비별 상세 레시피(SV/PV) 및 알람 Mock 데이터
// ==========================================
export const EQUIPMENT_DETAIL_MOCK = {
  'INC-01': {
    utilizationRate: 0.0,
    runningHours: '0h 00m',
    stopHours: '24h 00m',
    maintenanceMemo: '정기 센서 영점 조정 완료 (담당: 김엔지니어)',
    alarms: [],
    recipeSV: [
      { paramName: '투입 피더 속도', sv: '0', tolerance: '±5', unit: 'rpm' },
      { paramName: '호퍼 내부 압력', sv: '0.0', tolerance: '±0.1', unit: 'bar' },
      { paramName: '호퍼 내부 온도', sv: '22.0', tolerance: '±3.0', unit: '°C' },
    ],
    recipePV: [
      { paramName: '투입 피더 속도', pv: '0', deviation: '0', status: 'NORMAL', unit: 'rpm' },
      { paramName: '호퍼 내부 압력', pv: '0.0', deviation: '0.0', status: 'NORMAL', unit: 'bar' },
      { paramName: '호퍼 내부 온도', pv: '22.5', deviation: '+0.5', status: 'NORMAL', unit: '°C' },
    ],
  },
  'INC-02': {
    utilizationRate: 92.5,
    runningHours: '19h 30m',
    stopHours: '4h 30m',
    maintenanceMemo: '고속 분말 자동 투입 피더 2호기 정상 가동 중. 스크류 마모 상태 양호.',
    alarms: [],
    recipeSV: [
      { paramName: '피더 이송 속도', sv: '45', tolerance: '±3', unit: 'rpm' },
      { paramName: '호퍼 공급 압력', sv: '1.2', tolerance: '±0.2', unit: 'bar' },
      { paramName: '투입 챔버 온도', sv: '24.0', tolerance: '±2.0', unit: '°C' },
      { paramName: '설비 모터 부하율', sv: '80', tolerance: '±10', unit: '%' },
    ],
    recipePV: [
      { paramName: '피더 이송 속도', pv: '45', deviation: '0', status: 'NORMAL', unit: 'rpm' },
      { paramName: '호퍼 공급 압력', pv: '1.2', deviation: '0.0', status: 'NORMAL', unit: 'bar' },
      { paramName: '투입 챔버 온도', pv: '24.1', deviation: '+0.1', status: 'NORMAL', unit: '°C' },
      { paramName: '설비 모터 부하율', pv: '78', deviation: '-2', status: 'NORMAL', unit: '%' },
    ],
  },
  'RED-01': {
    utilizationRate: 95.8,
    runningHours: '22h 10m',
    stopHours: '1h 50m',
    maintenanceMemo: '로터리 킬른 환원로 1호기 열교환기 점검 완료. H2 가스 누설 센서 정상 작동 확인.',
    alarms: [],
    recipeSV: [
      { paramName: '1구역 환원 온도', sv: '750.0', tolerance: '±10.0', unit: '°C' },
      { paramName: '2구역 중심 온도', sv: '865.0', tolerance: '±5.0', unit: '°C' },
      { paramName: '3구역 냉각 온도', sv: '450.0', tolerance: '±15.0', unit: '°C' },
      { paramName: 'H2 가스 공급 유량', sv: '125.0', tolerance: '±5.0', unit: 'Nm³/h' },
      { paramName: '노내 챔버 압력', sv: '0.25', tolerance: '±0.03', unit: 'MPa' },
      { paramName: '로터리 회전 속도', sv: '8.0', tolerance: '±0.5', unit: 'rpm' },
    ],
    recipePV: [
      { paramName: '1구역 환원 온도', pv: '748.5', deviation: '-1.5', status: 'NORMAL', unit: '°C' },
      { paramName: '2구역 중심 온도', pv: '864.2', deviation: '-0.8', status: 'NORMAL', unit: '°C' },
      { paramName: '3구역 냉각 온도', pv: '452.1', deviation: '+2.1', status: 'NORMAL', unit: '°C' },
      { paramName: 'H2 가스 공급 유량', pv: '124.8', deviation: '-0.2', status: 'NORMAL', unit: 'Nm³/h' },
      { paramName: '노내 챔버 압력', pv: '0.25', deviation: '0.00', status: 'NORMAL', unit: 'MPa' },
      { paramName: '로터리 회전 속도', pv: '8.0', deviation: '0.0', status: 'NORMAL', unit: 'rpm' },
    ],
  },
  'RED-03': {
    utilizationRate: 45.2,
    runningHours: '2h 10m',
    stopHours: '21h 50m',
    maintenanceMemo: 'H2 유량 제어 밸브 이상 발생. 보전팀 점검 대기 중.',
    alarms: [
      {
        id: 'ALM-RED-001',
        eventTime: '2026-10-06T13:15:02',
        alarmCode: 'E-302',
        severity: 'CRITICAL',
        description: '수소 공급 유량 임계치 저하 경보 (설정: 120, 측정: 45 Nm³/h)',
      },
      {
        id: 'ALM-RED-002',
        eventTime: '2026-10-06T13:16:30',
        alarmCode: 'W-105',
        severity: 'MAJOR',
        description: '노내 압력 상승 경보 (0.42 MPa 초과)',
      },
    ],
    recipeSV: [
      { paramName: '노내 환원 온도', sv: '900.0', tolerance: '±10.0', unit: '°C' },
      { paramName: 'H2 공급 유량', sv: '120.0', tolerance: '±5.0', unit: 'Nm³/h' },
      { paramName: '노내 압력', sv: '0.25', tolerance: '±0.05', unit: 'MPa' },
    ],
    recipePV: [
      { paramName: '노내 환원 온도', pv: '915.2', deviation: '+15.2', status: 'WARNING', unit: '°C' },
      { paramName: 'H2 공급 유량', pv: '45.0', deviation: '-75.0', status: 'ALARM', unit: 'Nm³/h' },
      { paramName: '노내 압력', pv: '0.42', deviation: '+0.17', status: 'ALARM', unit: 'MPa' },
    ],
  },
  'MIX-01': {
    utilizationRate: 88.4,
    runningHours: '18h 45m',
    stopHours: '5h 15m',
    maintenanceMemo: '고전단 어트리터 믹서 1호기 임펠러 및 베어링 윤활 완료. 습식 밀링 4시간 배치 진행 중.',
    alarms: [],
    recipeSV: [
      { paramName: '교반 모터 RPM', sv: '180', tolerance: '±5', unit: 'rpm' },
      { paramName: '냉각 자켓 온도', sv: '35.0', tolerance: '±3.0', unit: '°C' },
      { paramName: '냉각수 공급 압력', sv: '3.0', tolerance: '±0.3', unit: 'bar' },
      { paramName: '모터 토크 부하율', sv: '85', tolerance: '±10', unit: '%' },
    ],
    recipePV: [
      { paramName: '교반 모터 RPM', pv: '180', deviation: '0', status: 'NORMAL', unit: 'rpm' },
      { paramName: '냉각 자켓 온도', pv: '38.5', deviation: '+3.5', status: 'WARNING', unit: '°C' },
      { paramName: '냉각수 공급 압력', pv: '3.2', deviation: '+0.2', status: 'NORMAL', unit: 'bar' },
      { paramName: '모터 토크 부하율', pv: '84', deviation: '-1', status: 'NORMAL', unit: '%' },
    ],
  },
  'BLD-01': {
    utilizationRate: 91.0,
    runningHours: '20h 30m',
    stopHours: '3h 30m',
    maintenanceMemo: '더블콘 블렌더 1호기 분말 균일도 98.5% 측정 완료.',
    alarms: [],
    recipeSV: [
      { paramName: '블렌더 회전수', sv: '32', tolerance: '±2', unit: 'rpm' },
      { paramName: '혼합 챔버 온도', sv: '30.0', tolerance: '±5.0', unit: '°C' },
      { paramName: '목표 균일도', sv: '98.0', tolerance: '±1.0', unit: '%' },
    ],
    recipePV: [
      { paramName: '블렌더 회전수', pv: '32', deviation: '0', status: 'NORMAL', unit: 'rpm' },
      { paramName: '혼합 챔버 온도', pv: '31.2', deviation: '+1.2', status: 'NORMAL', unit: '°C' },
      { paramName: '목표 균일도', pv: '98.5', deviation: '+0.5', status: 'NORMAL', unit: '%' },
    ],
  },
  'CRB-01': {
    utilizationRate: 96.5,
    runningHours: '23h 10m',
    stopHours: '0h 50m',
    maintenanceMemo: '진공 고온 탄화로 1호기 1450℃ 진공 합성 공정 이상 무.',
    alarms: [],
    recipeSV: [
      { paramName: '노내 탄화 온도', sv: '1450.0', tolerance: '±5.0', unit: '°C' },
      { paramName: '진공 챔버 압력', sv: '1.2e-3', tolerance: '±0.3e-3', unit: 'Pa' },
      { paramName: 'CO/CO2 가스비', sv: '1.15', tolerance: '±0.05', unit: '-' },
    ],
    recipePV: [
      { paramName: '노내 탄화 온도', pv: '1450.0', deviation: '0.0', status: 'NORMAL', unit: '°C' },
      { paramName: '진공 챔버 압력', pv: '1.2e-3', deviation: '0.0', status: 'NORMAL', unit: 'Pa' },
      { paramName: 'CO/CO2 가스비', pv: '1.15', deviation: '0.00', status: 'NORMAL', unit: '-' },
    ],
  },
}

// ==========================================
// 2. 설비 이력 (상태 / 알람 / 파라미터) Mock 데이터
// ==========================================
export const EQUIPMENT_HISTORIES_MOCK = [
  {
    id: 1,
    eventTime: '2026-10-06T14:20:10',
    equipmentName: 'MIX-01',
    equipmentType: 'Mixing',
    previousStatus: 'IDLE',
    currentStatus: 'RUN',
    eventType: 'STATUS_CHANGE',
    eventCode: 'OP-START',
    eventDescription: '오더 ORD-2026-109 수동 조업 시작 (배치 LOT-MX-2610-041 투입)',
    acknowledgedState: 'Y',
    eventUser: 'OP_POWDER_01',
    eventComment: '고전단 어트리터 믹서 가동 개시',
  },
  {
    id: 2,
    eventTime: '2026-10-06T13:15:02',
    equipmentName: 'RED-03',
    equipmentType: 'Reduction',
    previousStatus: 'RUN',
    currentStatus: 'ALARM',
    eventType: 'ALARM_OCCUR',
    eventCode: 'E-302',
    eventDescription: '수소 공급 유량 임계치 저하 경보 (45 Nm³/h 감지)',
    acknowledgedState: 'N',
    eventUser: 'SYSTEM',
    eventComment: '긴급 인터록 감지 및 가스 밸브 차단 대기',
  },
  {
    id: 3,
    eventTime: '2026-10-06T12:00:00',
    equipmentName: 'BLD-01',
    equipmentType: 'Blending',
    previousStatus: 'RUN',
    currentStatus: 'RUN',
    eventType: 'PARAM_CHANGE',
    eventCode: 'PARAM-RPM',
    eventDescription: '교반 모터 RPM 설정값 변경 (30 rpm -> 32 rpm)',
    acknowledgedState: 'Y',
    eventUser: 'ENG_KIM_01',
    eventComment: '분말 혼합 균일도 향상을 위한 회전수 미세 조정',
  },
  {
    id: 4,
    eventTime: '2026-10-06T10:30:15',
    equipmentName: 'DOP-01',
    equipmentType: 'Doping',
    previousStatus: 'IDLE',
    currentStatus: 'RUN',
    eventType: 'STATUS_CHANGE',
    eventCode: 'OP-START',
    eventDescription: '오더 ORD-2026-103 습식 도핑 조업 시작',
    acknowledgedState: 'Y',
    eventUser: 'OP_DOP_02',
    eventComment: '코발트 용액 정밀 정량 펌프 가동',
  },
  {
    id: 5,
    eventTime: '2026-10-06T09:45:00',
    equipmentName: 'INC-02',
    equipmentType: 'Income',
    previousStatus: 'IDLE',
    currentStatus: 'RUN',
    eventType: 'STATUS_CHANGE',
    eventCode: 'OP-START',
    eventDescription: '원자재 수납 호퍼 2호기 투입 시작',
    acknowledgedState: 'Y',
    eventUser: 'OP_POWDER_01',
    eventComment: 'WO3 분말 자동 이송 피더 가동',
  },
  {
    id: 6,
    eventTime: '2026-10-06T07:50:20',
    equipmentName: 'BLD-03',
    equipmentType: 'Blending',
    previousStatus: 'RUN',
    currentStatus: 'ALARM',
    eventType: 'ALARM_OCCUR',
    eventCode: 'A-108',
    eventDescription: '모터 토크 과부하 감지 (부하율 92% 초과)',
    acknowledgedState: 'Y',
    eventUser: 'SYSTEM',
    eventComment: '모터 과열 방지 자동 정지',
  },
  {
    id: 7,
    eventTime: '2026-10-05T20:10:00',
    equipmentName: 'CRB-01',
    equipmentType: 'Carburization',
    previousStatus: 'IDLE',
    currentStatus: 'RUN',
    eventType: 'STATUS_CHANGE',
    eventCode: 'OP-START',
    eventDescription: '진공 고온 탄화로 1450℃ 승온 개시',
    acknowledgedState: 'Y',
    eventUser: 'OP_CRB_01',
    eventComment: 'W+C 분말 탄화 반응 공정 진행',
  },
  {
    id: 8,
    eventTime: '2026-10-05T18:00:30',
    equipmentName: 'SCR-01',
    equipmentType: 'Screen',
    previousStatus: 'RUN',
    currentStatus: 'IDLE',
    eventType: 'STATUS_CHANGE',
    eventCode: 'OP-COMPLETE',
    eventDescription: '#400 메쉬 진동 체분 작업 완료',
    acknowledgedState: 'Y',
    eventUser: 'OP_SCR_01',
    eventComment: '체분 분말 용기 적재 및 검사 완료',
  },
  {
    id: 9,
    eventTime: '2026-10-05T15:30:00',
    equipmentName: 'DEA-01',
    equipmentType: 'Deagglomeration',
    previousStatus: 'RUN',
    currentStatus: 'RUN',
    eventType: 'PARAM_CHANGE',
    eventCode: 'PARAM-PRESS',
    eventDescription: '제트밀 분사 압력 변경 (0.70 MPa -> 0.75 MPa)',
    acknowledgedState: 'Y',
    eventUser: 'ENG_PARK_02',
    eventComment: '미립자 입도 D50 1.2um 기준 충족 조치',
  },
  {
    id: 10,
    eventTime: '2026-10-05T11:20:00',
    equipmentName: 'PCK-01',
    equipmentType: 'Packing',
    previousStatus: 'IDLE',
    currentStatus: 'RUN',
    eventType: 'STATUS_CHANGE',
    eventCode: 'OP-START',
    eventDescription: '자동 진공 포장 라인 포장 개시',
    acknowledgedState: 'Y',
    eventUser: 'OP_PCK_01',
    eventComment: '대구텍 완제품 드럼 실링 작업',
  },
]

// ==========================================
// 3. API 함수들
// ==========================================

/**
 * 설비별 상세 모니터링 데이터 (가동률, 메모, 레시피 SV/PV, 알람) 조회 API
 */
export async function fetchEquipmentDetailApi(eqpId) {
  try {
    const res = await api.get('/equipment/detail/' + eqpId)
    if (res && res.data) {
      return res
    }
  } catch (err) {
    console.debug('fetchEquipmentDetailApi fallback to mock for ' + eqpId, err)
  }

  // Mock Fallback
  const detail = EQUIPMENT_DETAIL_MOCK[eqpId] || {
    utilizationRate: 85.0,
    runningHours: '16h 00m',
    stopHours: '8h 00m',
    maintenanceMemo: '정기 점검 완료. 정상 운전 중.',
    alarms: [],
    recipeSV: [
      { paramName: '운전 설정 속도', sv: '100', tolerance: '±5', unit: 'rpm' },
      { paramName: '기준 공정 온도', sv: '35.0', tolerance: '±2.0', unit: '°C' },
      { paramName: '시스템 압력', sv: '1.5', tolerance: '±0.2', unit: 'bar' },
    ],
    recipePV: [
      { paramName: '운전 설정 속도', pv: '100', deviation: '0', status: 'NORMAL', unit: 'rpm' },
      { paramName: '기준 공정 온도', pv: '35.2', deviation: '+0.2', status: 'NORMAL', unit: '°C' },
      { paramName: '시스템 압력', pv: '1.5', deviation: '0.0', status: 'NORMAL', unit: 'bar' },
    ],
  }

  return {
    success: true,
    data: detail,
  }
}

/**
 * 설비 메모 저장 API
 */
export async function saveEquipmentMemoApi(payload) {
  try {
    const res = await api.post('/equipment/memo', payload)
    return res
  } catch (err) {
    console.debug('saveEquipmentMemoApi mock save:', err)
    await new Promise(function (resolve) {
      setTimeout(resolve, 300)
    })
    return {
      success: true,
      message: '설비 점검 메모가 성공적으로 저장되었습니다.',
      data: payload,
    }
  }
}

/**
 * 설비 이력 (상태/알람/파라미터) 목록 조회 API (페이징 / 검색)
 */
export async function fetchEquipmentHistoryApi(params) {
  try {
    const res = await api.get('/equipment/history', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchEquipmentHistoryApi fallback to mock:', err)
  }

  let filtered = EQUIPMENT_HISTORIES_MOCK.slice()

  if (params) {
    if (params.equipmentName && params.equipmentName !== '전체') {
      const eqp = String(params.equipmentName).trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].equipmentName === eqp) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }

    if (params.eventType && params.eventType !== '전체') {
      const eType = String(params.eventType).trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].eventType === eType) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }

    if (params.startDate) {
      const start = new Date(params.startDate).getTime()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const t = new Date(filtered[i].eventTime).getTime()
        if (t >= start) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }

    if (params.endDate) {
      const end = new Date(params.endDate).getTime()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const t = new Date(filtered[i].eventTime).getTime()
        if (t <= end) {
          temp.push(filtered[i])
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
