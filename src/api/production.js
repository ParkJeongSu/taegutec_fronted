// src/api/production.js
import api from './index'

// ==========================================
// 현실적인 대구텍 분말 MES Mock 데이터 정의
// ==========================================

export const EQUIPMENT_GROUPS_MOCK = [
  {
    typeId: 'Income',
    typeName: 'Income (입고/원자재 투입)',
    icon: '$trayArrowDown',
    equipments: [
      {
        eqpId: 'INC-01',
        eqpName: '원자재 수납 호퍼 1호기',
        eqpType: 'Income',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-INC-01',
        temperature: '22.5°C',
        pressure: '0.0 bar',
        speed: '0 rpm',
        load: '0%',
        description: '원자재 WO3/Co 자동 공급 호퍼 시스템',
      },
      {
        eqpId: 'INC-02',
        eqpName: '원자재 수납 호퍼 2호기',
        eqpType: 'Income',
        status: 'RUN',
        currentOrder: 'ORD-2026-101',
        currentLot: 'LOT-WC-2610-001',
        runningHours: '3h 45m',
        location: 'Z-INC-02',
        temperature: '24.1°C',
        pressure: '1.2 bar',
        speed: '45 rpm',
        load: '78%',
        description: '고속 분말 자동 투입 피더',
      },
      {
        eqpId: 'INC-03',
        eqpName: '보조 투입 스테이션 3호기',
        eqpType: 'Income',
        status: 'STOP',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-INC-03',
        temperature: '21.0°C',
        pressure: '0.0 bar',
        speed: '0 rpm',
        load: '0%',
        description: '수동 긴급 투입용 포트',
      },
    ],
  },
  {
    typeId: 'Doping',
    typeName: 'Doping (도핑)',
    icon: '$chartScatter',
    equipments: [
      {
        eqpId: 'DOP-01',
        eqpName: '습식 도핑 믹서 1호기',
        eqpType: 'Doping',
        status: 'RUN',
        currentOrder: 'ORD-2026-103',
        currentLot: 'LOT-DP-2610-005',
        runningHours: '5h 12m',
        location: 'Z-DOP-01',
        temperature: '45.2°C',
        pressure: '1.8 bar',
        speed: '120 rpm',
        load: '82%',
        description: '액상 첨가제 정밀 도핑 유닛',
      },
      {
        eqpId: 'DOP-02',
        eqpName: '건식 첨가제 도핑기 2호기',
        eqpType: 'Doping',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-DOP-02',
        temperature: '23.0°C',
        pressure: '0.0 bar',
        speed: '0 rpm',
        load: '0%',
        description: '초미립 분말 첨가제 혼화기',
      },
    ],
  },
  {
    typeId: 'Reduction',
    typeName: 'Reduction (환원)',
    icon: '$fire',
    equipments: [
      {
        eqpId: 'RED-01',
        eqpName: '로터리 환원로 1호기',
        eqpType: 'Reduction',
        status: 'RUN',
        currentOrder: 'ORD-2026-102',
        currentLot: 'LOT-RD-2610-012',
        runningHours: '14h 20m',
        location: 'Z-RED-01',
        temperature: '865.0°C',
        pressure: '0.25 MPa',
        speed: '8 rpm',
        load: '91%',
        flowRate: '125 Nm³/h',
        description: 'WO3 -> W 고온 수소 환원 로터리 킬른',
      },
      {
        eqpId: 'RED-02',
        eqpName: '푸셔 환원로 2호기',
        eqpType: 'Reduction',
        status: 'RUN',
        currentOrder: 'ORD-2026-104',
        currentLot: 'LOT-RD-2610-014',
        runningHours: '8h 50m',
        location: 'Z-RED-02',
        temperature: '880.5°C',
        pressure: '0.28 MPa',
        speed: '4 push/h',
        load: '88%',
        flowRate: '140 Nm³/h',
        description: '다단 보트식 연속 수소 환원로',
      },
      {
        eqpId: 'RED-03',
        eqpName: '특수 환원로 3호기',
        eqpType: 'Reduction',
        status: 'ALARM',
        currentOrder: 'ORD-2026-105',
        currentLot: 'LOT-RD-2610-015',
        runningHours: '2h 10m',
        location: 'Z-RED-03',
        temperature: '915.2°C',
        pressure: '0.42 MPa',
        speed: '0 rpm',
        load: '95%',
        flowRate: '45 Nm³/h',
        alarmMsg: 'E-302 수소 유량 저하 알람',
        description: '극미립 W 전용 고온 환원 설비',
      },
      {
        eqpId: 'RED-04',
        eqpName: '고온 연속 환원로 4호기',
        eqpType: 'Reduction',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-RED-04',
        temperature: '450.0°C',
        pressure: '0.05 MPa',
        speed: '0 rpm',
        load: '0%',
        flowRate: '0 Nm³/h',
        description: '예열 대기 중인 환원로',
      },
    ],
  },
  {
    typeId: 'H2 purification system',
    typeName: 'H2 purification system (수소 정제)',
    icon: '$cubeOutline',
    equipments: [
      {
        eqpId: 'H2P-01',
        eqpName: 'PSA 수소 정제기 1호기',
        eqpType: 'H2 purification system',
        status: 'RUN',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '120h 30m',
        location: 'Z-H2P-01',
        temperature: '35.0°C',
        pressure: '2.8 MPa',
        speed: '99.999%',
        load: '75%',
        flowRate: '450 Nm³/h',
        description: '환원 공정 공급용 고순도 PSA 수소 정제 시스템',
      },
      {
        eqpId: 'H2P-02',
        eqpName: '백업 수소 정제 시스템 2호기',
        eqpType: 'H2 purification system',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-H2P-02',
        temperature: '25.0°C',
        pressure: '2.5 MPa',
        speed: '99.998%',
        load: '0%',
        flowRate: '0 Nm³/h',
        description: '예비 순환 정제 유닛',
      },
    ],
  },
  {
    typeId: 'Screen',
    typeName: 'Screen (스크린/체분)',
    icon: '$formatListBulleted',
    equipments: [
      {
        eqpId: 'SCR-01',
        eqpName: '진동 스크리닝기 1호기',
        eqpType: 'Screen',
        status: 'RUN',
        currentOrder: 'ORD-2026-106',
        currentLot: 'LOT-SC-2610-021',
        runningHours: '1h 35m',
        location: 'Z-SCR-01',
        temperature: '26.4°C',
        pressure: '0.0 bar',
        speed: '1450 rpm',
        load: '60%',
        mesh: '#400 Mesh',
        description: '환원 후 분말 응집체 제거 진동 체분기',
      },
      {
        eqpId: 'SCR-02',
        eqpName: '초음파 미세 체분기 2호기',
        eqpType: 'Screen',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-SCR-02',
        temperature: '23.0°C',
        pressure: '0.0 bar',
        speed: '0 rpm',
        load: '0%',
        mesh: '#600 Mesh',
        description: '초음파 진동 인가 정밀 분급기',
      },
      {
        eqpId: 'SCR-03',
        eqpName: '정밀 분급 스크린 3호기',
        eqpType: 'Screen',
        status: 'STOP',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-SCR-03',
        temperature: '22.0°C',
        pressure: '0.0 bar',
        speed: '0 rpm',
        load: '0%',
        mesh: '#325 Mesh',
        description: '정기 점검 중',
      },
    ],
  },
  {
    typeId: 'Blending',
    typeName: 'Blending (블렌딩)',
    icon: '$cogSyncOutline',
    equipments: [
      {
        eqpId: 'BLD-01',
        eqpName: '더블콘 블렌더 1호기',
        eqpType: 'Blending',
        status: 'RUN',
        currentOrder: 'ORD-2026-107',
        currentLot: 'LOT-BL-2610-031',
        runningHours: '4h 15m',
        location: 'Z-BLD-01',
        temperature: '31.2°C',
        pressure: '0.0 bar',
        speed: '32 rpm',
        load: '65%',
        homogeneity: '98.5%',
        description: '대용량 텅스텐 분말 균일 혼합 블렌더',
      },
      {
        eqpId: 'BLD-02',
        eqpName: 'V-블렌더 2호기',
        eqpType: 'Blending',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-BLD-02',
        temperature: '24.0°C',
        pressure: '0.0 bar',
        speed: '0 rpm',
        load: '0%',
        homogeneity: '-',
        description: 'V형 용기 회전식 정밀 혼합기',
      },
      {
        eqpId: 'BLD-03',
        eqpName: '고속 배치 블렌더 3호기',
        eqpType: 'Blending',
        status: 'ALARM',
        currentOrder: 'ORD-2026-108',
        currentLot: 'LOT-BL-2610-033',
        runningHours: '0h 45m',
        location: 'Z-BLD-03',
        temperature: '38.6°C',
        pressure: '0.0 bar',
        speed: '12 rpm',
        load: '92%',
        homogeneity: '82.0%',
        alarmMsg: 'A-108 모터 토크 과부하 감지',
        description: '고속 교반 블렌딩 유닛',
      },
    ],
  },
  {
    typeId: 'Mixing',
    typeName: 'Mixing (혼합/밀링)',
    icon: '$robotIndustrial',
    equipments: [
      {
        eqpId: 'MIX-01',
        eqpName: '고전단 어트리터 믹서 1호기',
        eqpType: 'Mixing',
        status: 'RUN',
        currentOrder: 'ORD-2026-109',
        currentLot: 'LOT-MX-2610-041',
        runningHours: '6h 30m',
        location: 'Z-MIX-01',
        temperature: '38.5°C',
        pressure: '3.2 bar',
        speed: '180 rpm',
        load: '84%',
        description: 'WC-Co 바인더 습식 밀링 & 혼합기',
      },
      {
        eqpId: 'MIX-02',
        eqpName: '수평 볼밀 믹서 2호기',
        eqpType: 'Mixing',
        status: 'RUN',
        currentOrder: 'ORD-2026-110',
        currentLot: 'LOT-MX-2610-042',
        runningHours: '12h 00m',
        location: 'Z-MIX-02',
        temperature: '32.1°C',
        pressure: '3.0 bar',
        speed: '45 rpm',
        load: '76%',
        description: '연속식 볼밀 분쇄 혼합 설비',
      },
      {
        eqpId: 'MIX-03',
        eqpName: '플래너터리 믹서 3호기',
        eqpType: 'Mixing',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-MIX-03',
        temperature: '22.0°C',
        pressure: '0.0 bar',
        speed: '0 rpm',
        load: '0%',
        description: '유성형 공전/자전 정밀 혼합기',
      },
      {
        eqpId: 'MIX-04',
        eqpName: '정밀 바인더 혼합기 4호기',
        eqpType: 'Mixing',
        status: 'STOP',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-MIX-04',
        temperature: '21.5°C',
        pressure: '0.0 bar',
        speed: '0 rpm',
        load: '0%',
        description: '파라핀/PEG 바인더 용해 혼합 장비',
      },
    ],
  },
  {
    typeId: 'Carburization',
    typeName: 'Carburization (탄화)',
    icon: '$fire',
    equipments: [
      {
        eqpId: 'CRB-01',
        eqpName: '진공 고온 탄화로 1호기',
        eqpType: 'Carburization',
        status: 'RUN',
        currentOrder: 'ORD-2026-111',
        currentLot: 'LOT-CB-2610-051',
        runningHours: '18h 40m',
        location: 'Z-CRB-01',
        temperature: '1450.0°C',
        pressure: '1.2x10⁻³ Pa',
        speed: '1.15 CO/CO2',
        load: '94%',
        description: 'W + C -> WC 초고온 탄화 합성 반응로',
      },
      {
        eqpId: 'CRB-02',
        eqpName: '흑연 발열 탄화로 2호기',
        eqpType: 'Carburization',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-CRB-02',
        temperature: '25.0°C',
        pressure: '대기압',
        speed: '-',
        load: '0%',
        description: '흑연 발열체 진공 탄화 장치',
      },
      {
        eqpId: 'CRB-03',
        eqpName: '연속 벨트식 탄화로 3호기',
        eqpType: 'Carburization',
        status: 'RUN',
        currentOrder: 'ORD-2026-112',
        currentLot: 'LOT-CB-2610-053',
        runningHours: '9h 15m',
        location: 'Z-CRB-03',
        temperature: '1420.0°C',
        pressure: '1.5x10⁻³ Pa',
        speed: '1.10 CO/CO2',
        load: '89%',
        description: '연속 메쉬 벨트 이송 고온 탄화로',
      },
    ],
  },
  {
    typeId: 'Deagglomeration',
    typeName: 'Deagglomeration (해쇄)',
    icon: '$chartTimeline',
    equipments: [
      {
        eqpId: 'DEA-01',
        eqpName: '제트밀 미립자 해쇄기 1호기',
        eqpType: 'Deagglomeration',
        status: 'RUN',
        currentOrder: 'ORD-2026-113',
        currentLot: 'LOT-DA-2610-061',
        runningHours: '2h 50m',
        location: 'Z-DEA-01',
        temperature: '28.0°C',
        pressure: '0.75 MPa',
        speed: '4200 rpm',
        load: '72%',
        particleSize: 'D50 1.2㎛',
        description: '초음속 공기 제트 기류 응집체 해쇄 설비',
      },
      {
        eqpId: 'DEA-02',
        eqpName: '핀밀 충격 해쇄기 2호기',
        eqpType: 'Deagglomeration',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-DEA-02',
        temperature: '22.0°C',
        pressure: '0.0 MPa',
        speed: '0 rpm',
        load: '0%',
        particleSize: '-',
        description: '회전 핀 디스크 충격 해쇄기',
      },
    ],
  },
  {
    typeId: 'Packing',
    typeName: 'Packing (포장)',
    icon: '$packageVariant',
    equipments: [
      {
        eqpId: 'PCK-01',
        eqpName: '자동 진공 포장 라인 1호기',
        eqpType: 'Packing',
        status: 'RUN',
        currentOrder: 'ORD-2026-114',
        currentLot: 'LOT-PK-2610-071',
        runningHours: '7h 10m',
        location: 'Z-PCK-01',
        temperature: '165°C',
        pressure: '0.0 bar',
        speed: '40 drum/h',
        load: '85%',
        totalPacked: '18.5 t',
        description: '분말 드럼/캔 자동 정밀 계량 및 진공 포장기',
      },
      {
        eqpId: 'PCK-02',
        eqpName: '벌크백 충진 스테이션 2호기',
        eqpType: 'Packing',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-PCK-02',
        temperature: '23°C',
        pressure: '0.0 bar',
        speed: '0 bag/h',
        load: '0%',
        totalPacked: '0.0 t',
        description: '1톤 벌크 톤백 전용 자동 충진기',
      },
      {
        eqpId: 'PCK-03',
        eqpName: '질소 치환 캔 포장기 3호기',
        eqpType: 'Packing',
        status: 'STOP',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-PCK-03',
        temperature: '20°C',
        pressure: '0.0 bar',
        speed: '0 can/h',
        load: '0%',
        totalPacked: '0.0 t',
        description: '산화 방지 질소 충진 밀폐 포장기',
      },
    ],
  },
  {
    typeId: 'Others',
    typeName: 'Others (기타)',
    icon: '$cog',
    equipments: [
      {
        eqpId: 'OTH-01',
        eqpName: '분말 세척/건조기 1호기',
        eqpType: 'Others',
        status: 'IDLE',
        currentOrder: '-',
        currentLot: '-',
        runningHours: '0h 00m',
        location: 'Z-OTH-01',
        temperature: '105°C',
        pressure: '0.0 bar',
        speed: '0 m³/min',
        load: '0%',
        description: '특수 용제 분말 세척 및 진공 건조로',
      },
      {
        eqpId: 'OTH-02',
        eqpName: '재생 분말 회수 시스템 2호기',
        eqpType: 'Others',
        status: 'RUN',
        currentOrder: 'ORD-2026-115',
        currentLot: 'LOT-OT-2610-081',
        runningHours: '11h 20m',
        location: 'Z-OTH-02',
        temperature: '110°C',
        pressure: '0.3 bar',
        speed: '45 m³/min',
        load: '68%',
        description: '공정 부산물 회수 및 재생 정제 유닛',
      },
    ],
  },
]

export const ERP_ORDERS_MOCK = [
  {
    orderId: 'ORD-2026-101',
    itemCode: 'TT-WC-F01',
    itemName: '초미립 WC 분말 Grade A',
    targetWeight: 3.5,
    status: 'RELEASED',
    dueDate: '2026-10-15T18:00:00',
    applicableProcess: 'Income',
    customer: 'TaeguTec 대구 본사',
    remarks: '미립자 공구용 원자재 투입 건',
  },
  {
    orderId: 'ORD-2026-102',
    itemCode: 'TT-WC-M02',
    itemName: '중립 WC 분말 Grade B',
    targetWeight: 5.0,
    status: 'RELEASED',
    dueDate: '2026-10-18T18:00:00',
    applicableProcess: 'Reduction',
    customer: '대구텍 환원 라인 1팀',
    remarks: '로터리 환원 연속 투입 지시',
  },
  {
    orderId: 'ORD-2026-103',
    itemCode: 'TT-CO-D01',
    itemName: 'Co-Doped Mixed Powder 6%',
    targetWeight: 2.0,
    status: 'READY',
    dueDate: '2026-10-20T18:00:00',
    applicableProcess: 'Doping',
    customer: '도핑 공정 2조',
    remarks: '코발트 습식 도핑 비율 6.0 wt%',
  },
  {
    orderId: 'ORD-2026-104',
    itemCode: 'TT-TIC-R03',
    itemName: 'TiC Reduced Powder Grade C',
    targetWeight: 4.2,
    status: 'RELEASED',
    dueDate: '2026-10-22T18:00:00',
    applicableProcess: 'Reduction',
    customer: '대구텍 특수재 제조과',
    remarks: '푸셔로 연속 환원 진행',
  },
  {
    orderId: 'ORD-2026-105',
    itemCode: 'TT-TAC-SP1',
    itemName: 'TaC Specialty Powder S',
    targetWeight: 1.8,
    status: 'READY',
    dueDate: '2026-10-25T18:00:00',
    applicableProcess: 'Reduction',
    customer: '내마모 합금 연구팀',
    remarks: '탄탈륨 고온 환원',
  },
  {
    orderId: 'ORD-2026-106',
    itemCode: 'TT-K20-MIX',
    itemName: 'K20 Ready-To-Press Powder',
    targetWeight: 6.0,
    status: 'RELEASED',
    dueDate: '2026-10-28T18:00:00',
    applicableProcess: 'Screen',
    customer: '가공 라인 공급',
    remarks: '체분 400메쉬 통과 규격 검증',
  },
  {
    orderId: 'ORD-2026-107',
    itemCode: 'TT-P30-BLD',
    itemName: 'P30 Heavy Duty Blend',
    targetWeight: 4.5,
    status: 'RELEASED',
    dueDate: '2026-10-30T18:00:00',
    applicableProcess: 'Blending',
    customer: '초경 인서트 제조부',
    remarks: '더블콘 블렌더 균일도 98% 이상',
  },
  {
    orderId: 'ORD-2026-108',
    itemCode: 'TT-CRB-101',
    itemName: 'Ultra-Pure Carburized WC',
    targetWeight: 3.0,
    status: 'READY',
    dueDate: '2026-11-02T18:00:00',
    applicableProcess: 'Carburization',
    customer: '탄화 공정 1파트',
    remarks: '유리 탄소 함량 0.05% 이하 제어',
  },
  {
    orderId: 'ORD-2026-109',
    itemCode: 'TT-RTP-820',
    itemName: 'RTP Powder Grade 820',
    targetWeight: 8.0,
    status: 'RELEASED',
    dueDate: '2026-11-05T18:00:00',
    applicableProcess: 'Mixing',
    customer: '성형 프레스 자동화 라인',
    remarks: '바인더 혼합 및 슬러리 제조',
  },
  {
    orderId: 'ORD-2026-110',
    itemCode: 'TT-CBN-CMP',
    itemName: 'CBN Composite Matrix Powder',
    targetWeight: 2.2,
    status: 'READY',
    dueDate: '2026-11-08T18:00:00',
    applicableProcess: 'Mixing',
    customer: '신소재 개발 파트',
    remarks: '볼밀 밀링 12시간 소요',
  },
  {
    orderId: 'ORD-2026-111',
    itemCode: 'TT-DEA-M15',
    itemName: 'Deagglomerated Fine WC Powder',
    targetWeight: 2.5,
    status: 'RELEASED',
    dueDate: '2026-11-10T18:00:00',
    applicableProcess: 'Deagglomeration',
    customer: '분말 후공정팀',
    remarks: '제트밀 1차 해쇄 분말',
  },
  {
    orderId: 'ORD-2026-112',
    itemCode: 'TT-PCK-DK01',
    itemName: '대구텍 완제품 출하 드럼 포장',
    targetWeight: 5.5,
    status: 'RELEASED',
    dueDate: '2026-11-12T18:00:00',
    applicableProcess: 'Packing',
    customer: '해외 수출 패킹부',
    remarks: '질소 치환 50kg 캔 및 200kg 드럼',
  },
]

export const LOT_CARRIERS_MOCK = [
  // ORD-2026-101 관련 후보 (Income)
  {
    id: 1,
    carrierId: 'CR-101',
    batchLotNo: 'LOT-WC-2610-001',
    rawMaterialLotNo: 'RAW-WO3-2609-01',
    weight: 1.75,
    status: 'STOCK',
    location: 'SH-01-A-01',
    orderId: 'ORD-2026-101',
    itemCode: 'TT-WC-F01',
    unit: 't',
    storageZone: 'Z-INCOME-WH',
  },
  {
    id: 2,
    carrierId: 'CR-102',
    batchLotNo: 'LOT-WC-2610-002',
    rawMaterialLotNo: 'RAW-WO3-2609-02',
    weight: 1.75,
    status: 'STOCK',
    location: 'SH-01-A-02',
    orderId: 'ORD-2026-101',
    itemCode: 'TT-WC-F01',
    unit: 't',
    storageZone: 'Z-INCOME-WH',
  },
  {
    id: 3,
    carrierId: 'CR-103',
    batchLotNo: 'LOT-WC-2610-003',
    rawMaterialLotNo: 'RAW-WO3-2609-03',
    weight: 2.0,
    status: 'WIP',
    location: 'PORT-INC-01',
    orderId: 'ORD-2026-101',
    itemCode: 'TT-WC-F01',
    unit: 't',
    storageZone: 'Z-INCOME-WH',
  },

  // ORD-2026-102 관련 후보 (Reduction)
  {
    id: 4,
    carrierId: 'CR-201',
    batchLotNo: 'LOT-RD-2610-011',
    rawMaterialLotNo: 'RAW-W-2609-15',
    weight: 2.5,
    status: 'STOCK',
    location: 'SH-02-B-04',
    orderId: 'ORD-2026-102',
    itemCode: 'TT-WC-M02',
    unit: 't',
    storageZone: 'Z-RED-WH',
  },
  {
    id: 5,
    carrierId: 'CR-202',
    batchLotNo: 'LOT-RD-2610-012',
    rawMaterialLotNo: 'RAW-W-2609-16',
    weight: 2.5,
    status: 'STOCK',
    location: 'SH-02-B-05',
    orderId: 'ORD-2026-102',
    itemCode: 'TT-WC-M02',
    unit: 't',
    storageZone: 'Z-RED-WH',
  },
  {
    id: 6,
    carrierId: 'CR-203',
    batchLotNo: 'LOT-RD-2610-013',
    rawMaterialLotNo: 'RAW-W-2609-17',
    weight: 2.0,
    status: 'WIP',
    location: 'STK-01-PORT-02',
    orderId: 'ORD-2026-102',
    itemCode: 'TT-WC-M02',
    unit: 't',
    storageZone: 'Z-RED-WH',
  },

  // ORD-2026-103 관련 후보 (Doping)
  {
    id: 7,
    carrierId: 'IBC-301',
    batchLotNo: 'LOT-DP-2610-004',
    rawMaterialLotNo: 'RAW-CO-2609-22',
    weight: 1.0,
    status: 'STOCK',
    location: 'SH-03-C-01',
    orderId: 'ORD-2026-103',
    itemCode: 'TT-CO-D01',
    unit: 't',
    storageZone: 'Z-DOPING-WH',
  },
  {
    id: 8,
    carrierId: 'IBC-302',
    batchLotNo: 'LOT-DP-2610-005',
    rawMaterialLotNo: 'RAW-CO-2609-23',
    weight: 1.0,
    status: 'STOCK',
    location: 'SH-03-C-02',
    orderId: 'ORD-2026-103',
    itemCode: 'TT-CO-D01',
    unit: 't',
    storageZone: 'Z-DOPING-WH',
  },

  // ORD-2026-104 관련 후보 (Reduction)
  {
    id: 9,
    carrierId: 'CR-204',
    batchLotNo: 'LOT-RD-2610-014',
    rawMaterialLotNo: 'RAW-TIC-2609-31',
    weight: 2.1,
    status: 'STOCK',
    location: 'SH-02-C-01',
    orderId: 'ORD-2026-104',
    itemCode: 'TT-TIC-R03',
    unit: 't',
    storageZone: 'Z-RED-WH',
  },
  {
    id: 10,
    carrierId: 'CR-205',
    batchLotNo: 'LOT-RD-2610-015',
    rawMaterialLotNo: 'RAW-TIC-2609-32',
    weight: 2.1,
    status: 'STOCK',
    location: 'SH-02-C-02',
    orderId: 'ORD-2026-104',
    itemCode: 'TT-TIC-R03',
    unit: 't',
    storageZone: 'Z-RED-WH',
  },

  // ORD-2026-106 관련 후보 (Screen)
  {
    id: 11,
    carrierId: 'CR-401',
    batchLotNo: 'LOT-SC-2610-021',
    rawMaterialLotNo: 'RAW-K20-2609-50',
    weight: 2.0,
    status: 'STOCK',
    location: 'SH-04-A-01',
    orderId: 'ORD-2026-106',
    itemCode: 'TT-K20-MIX',
    unit: 't',
    storageZone: 'Z-SCREEN-WH',
  },
  {
    id: 12,
    carrierId: 'CR-402',
    batchLotNo: 'LOT-SC-2610-022',
    rawMaterialLotNo: 'RAW-K20-2609-51',
    weight: 2.0,
    status: 'STOCK',
    location: 'SH-04-A-02',
    orderId: 'ORD-2026-106',
    itemCode: 'TT-K20-MIX',
    unit: 't',
    storageZone: 'Z-SCREEN-WH',
  },
  {
    id: 13,
    carrierId: 'CR-403',
    batchLotNo: 'LOT-SC-2610-023',
    rawMaterialLotNo: 'RAW-K20-2609-52',
    weight: 2.0,
    status: 'WIP',
    location: 'PORT-SCR-01',
    orderId: 'ORD-2026-106',
    itemCode: 'TT-K20-MIX',
    unit: 't',
    storageZone: 'Z-SCREEN-WH',
  },

  // ORD-2026-107 관련 후보 (Blending)
  {
    id: 14,
    carrierId: 'CR-501',
    batchLotNo: 'LOT-BL-2610-031',
    rawMaterialLotNo: 'RAW-P30-2609-61',
    weight: 2.25,
    status: 'STOCK',
    location: 'SH-05-A-03',
    orderId: 'ORD-2026-107',
    itemCode: 'TT-P30-BLD',
    unit: 't',
    storageZone: 'Z-BLD-WH',
  },
  {
    id: 15,
    carrierId: 'CR-502',
    batchLotNo: 'LOT-BL-2610-032',
    rawMaterialLotNo: 'RAW-P30-2609-62',
    weight: 2.25,
    status: 'STOCK',
    location: 'SH-05-A-04',
    orderId: 'ORD-2026-107',
    itemCode: 'TT-P30-BLD',
    unit: 't',
    storageZone: 'Z-BLD-WH',
  },

  // ORD-2026-109 관련 후보 (Mixing)
  {
    id: 16,
    carrierId: 'CR-601',
    batchLotNo: 'LOT-MX-2610-041',
    rawMaterialLotNo: 'RAW-RTP-2609-81',
    weight: 2.0,
    status: 'STOCK',
    location: 'SH-06-B-01',
    orderId: 'ORD-2026-109',
    itemCode: 'TT-RTP-820',
    unit: 't',
    storageZone: 'Z-MIX-WH',
  },
  {
    id: 17,
    carrierId: 'CR-602',
    batchLotNo: 'LOT-MX-2610-042',
    rawMaterialLotNo: 'RAW-RTP-2609-82',
    weight: 2.0,
    status: 'STOCK',
    location: 'SH-06-B-02',
    orderId: 'ORD-2026-109',
    itemCode: 'TT-RTP-820',
    unit: 't',
    storageZone: 'Z-MIX-WH',
  },
  {
    id: 18,
    carrierId: 'CR-603',
    batchLotNo: 'LOT-MX-2610-043',
    rawMaterialLotNo: 'RAW-RTP-2609-83',
    weight: 2.0,
    status: 'STOCK',
    location: 'SH-06-B-03',
    orderId: 'ORD-2026-109',
    itemCode: 'TT-RTP-820',
    unit: 't',
    storageZone: 'Z-MIX-WH',
  },
  {
    id: 19,
    carrierId: 'CR-604',
    batchLotNo: 'LOT-MX-2610-044',
    rawMaterialLotNo: 'RAW-RTP-2609-84',
    weight: 2.0,
    status: 'STOCK',
    location: 'SH-06-B-04',
    orderId: 'ORD-2026-109',
    itemCode: 'TT-RTP-820',
    unit: 't',
    storageZone: 'Z-MIX-WH',
  },

  // ORD-2026-111 관련 후보 (Deagglomeration)
  {
    id: 20,
    carrierId: 'CR-701',
    batchLotNo: 'LOT-DA-2610-061',
    rawMaterialLotNo: 'RAW-DA-2609-91',
    weight: 1.25,
    status: 'STOCK',
    location: 'SH-07-C-01',
    orderId: 'ORD-2026-111',
    itemCode: 'TT-DEA-M15',
    unit: 't',
    storageZone: 'Z-DEA-WH',
  },
  {
    id: 21,
    carrierId: 'CR-702',
    batchLotNo: 'LOT-DA-2610-062',
    rawMaterialLotNo: 'RAW-DA-2609-92',
    weight: 1.25,
    status: 'STOCK',
    location: 'SH-07-C-02',
    orderId: 'ORD-2026-111',
    itemCode: 'TT-DEA-M15',
    unit: 't',
    storageZone: 'Z-DEA-WH',
  },

  // ORD-2026-112 관련 후보 (Packing)
  {
    id: 22,
    carrierId: 'CR-801',
    batchLotNo: 'LOT-PK-2610-071',
    rawMaterialLotNo: 'RAW-PK-2609-101',
    weight: 2.75,
    status: 'STOCK',
    location: 'SH-08-A-01',
    orderId: 'ORD-2026-112',
    itemCode: 'TT-PCK-DK01',
    unit: 't',
    storageZone: 'Z-PACK-WH',
  },
  {
    id: 23,
    carrierId: 'CR-802',
    batchLotNo: 'LOT-PK-2610-072',
    rawMaterialLotNo: 'RAW-PK-2609-102',
    weight: 2.75,
    status: 'STOCK',
    location: 'SH-08-A-02',
    orderId: 'ORD-2026-112',
    itemCode: 'TT-PCK-DK01',
    unit: 't',
    storageZone: 'Z-PACK-WH',
  },
]

// ==========================================
// API 함수들 (Spring MES 백엔드 연동 + Mock Fallback)
// ==========================================

/**
 * 1. 설비 계층 구조 트리 조회
 */
export async function fetchEquipmentHierarchyApi(params) {
  try {
    const res = await api.get('/production/equipment-tree', { params: params })
    if (res && (res.data || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchEquipmentHierarchyApi fallback to mock:', err)
  }
  return {
    success: true,
    data: EQUIPMENT_GROUPS_MOCK,
    total: EQUIPMENT_GROUPS_MOCK.length,
  }
}

/**
 * 2. ERP 오더 목록 조회 (페이징/검색)
 */
export async function fetchErpOrdersApi(params) {
  try {
    const res = await api.get('/production/erp-orders', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchErpOrdersApi fallback to mock:', err)
  }

  // 로컬 필터링 및 페이징 시뮬레이션
  let filtered = ERP_ORDERS_MOCK.slice()
  if (params) {
    if (params.orderId) {
      const q = String(params.orderId).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          item.orderId.toLowerCase().indexOf(q) !== -1 ||
          item.itemCode.toLowerCase().indexOf(q) !== -1 ||
          item.itemName.toLowerCase().indexOf(q) !== -1
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
    if (params.applicableProcess && params.applicableProcess !== 'ALL') {
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].applicableProcess === params.applicableProcess) {
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

/**
 * 3. 투입 대상 LOT & Carrier 목록 조회 (페이징/검색/오더 필터링)
 */
export async function fetchLotsAndCarriersApi(params) {
  try {
    const res = await api.get('/production/lot-carriers', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchLotsAndCarriersApi fallback to mock:', err)
  }

  let filtered = LOT_CARRIERS_MOCK.slice()
  if (params) {
    if (params.orderId) {
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].orderId === params.orderId) {
          temp.push(filtered[i])
        }
      }
      // 해당 오더에 매핑된 데이터가 있으면 반환, 없으면 전체 반환
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
          item.batchLotNo.toLowerCase().indexOf(kw) !== -1 ||
          item.rawMaterialLotNo.toLowerCase().indexOf(kw) !== -1 ||
          item.location.toLowerCase().indexOf(kw) !== -1
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
 * 4. 조업 시작 (수동 투입) 실행 API
 */
export async function startProductionApi(payload) {
  try {
    const res = await api.post('/production/start', payload)
    return res
  } catch (err) {
    console.debug('startProductionApi fallback to mock execution:', err)
    // 백엔드 미구동 시 가상 딜레이 및 성공 응답 반환
    await new Promise(function (resolve) {
      setTimeout(resolve, 500)
    })
    return {
      success: true,
      message: '조업 시작 명령이 성공적으로 전송되었습니다.',
      data: {
        transactionId: 'TX-START-' + Date.now(),
        eqpId: payload ? payload.eqpId : null,
        orderId: payload ? payload.orderId : null,
        carrierIds: payload ? payload.carrierIds : [],
        startedAt: new Date().toISOString(),
      },
    }
  }
}

/**
 * 5. 조업 완료 (수동 완료/실적 등록) 실행 API
 */
export async function endProductionApi(payload) {
  try {
    const res = await api.post('/production/end', payload)
    return res
  } catch (err) {
    console.debug('endProductionApi fallback to mock execution:', err)
    // 백엔드 미구동 시 가상 딜레이 및 성공 응답 반환
    await new Promise(function (resolve) {
      setTimeout(resolve, 500)
    })
    return {
      success: true,
      message: '조업 완료 및 생산 실적이 성공적으로 등록되었습니다.',
      data: {
        transactionId: 'TX-END-' + Date.now(),
        eqpId: payload ? payload.eqpId : null,
        producedLotNo: payload ? payload.producedLotNo : 'LOT-PROD-' + Date.now(),
        actualWeight: payload ? payload.actualWeight : 0,
        completedAt: new Date().toISOString(),
      },
    }
  }
}

// ==========================================
// 6. Order 이력 조회 Mock 데이터 및 API
// ==========================================
export const ORDER_HISTORIES_MOCK = [
  {
    id: 1,
    eventTime: '2026-10-06T13:45:22',
    orderId: '1',
    equipmentName: 'MIX-01',
    equipmentType: 'Mixing',
    operationStatus: 'COMPLETE',
    inCarrierId: 'CST-0101',
    outCarrierId: 'CST-0201',
    batchLot: 'BLOT-261006-01',
    weight: 2.48,
    eventUser: 'OP_POWDER_01',
    eventComment: '습식 고전단 혼합 4시간 완료 및 배출 캐리어 적재',
  },
  {
    id: 2,
    eventTime: '2026-10-06T09:30:10',
    orderId: '1',
    equipmentName: 'MIX-01',
    equipmentType: 'Mixing',
    operationStatus: 'START',
    inCarrierId: 'CST-0101',
    outCarrierId: '-',
    batchLot: 'BLOT-261006-01',
    weight: 2.5,
    eventUser: 'OP_POWDER_01',
    eventComment: '원자재 분말 수동 투입 조업 시작',
  },
  {
    id: 3,
    eventTime: '2026-10-06T08:15:00',
    orderId: '1',
    equipmentName: 'INC-01',
    equipmentType: 'Income',
    operationStatus: 'COMPLETE',
    inCarrierId: 'CST-0050',
    outCarrierId: 'CST-0101',
    batchLot: 'BLOT-261006-01',
    weight: 2.5,
    eventUser: 'OP_INCOME_01',
    eventComment: '원자재 수납 호퍼 계량 투입 완료',
  },
  {
    id: 4,
    eventTime: '2026-10-06T14:10:45',
    orderId: 'ORD-2026-101',
    equipmentName: 'INC-02',
    equipmentType: 'Income',
    operationStatus: 'START',
    inCarrierId: 'CR-101',
    outCarrierId: '-',
    batchLot: 'LOT-WC-2610-001',
    weight: 1.75,
    eventUser: 'OP_POWDER_01',
    eventComment: '초미립 WC 원자재 자동 공급 투입 시작',
  },
  {
    id: 5,
    eventTime: '2026-10-06T12:20:15',
    orderId: 'ORD-2026-102',
    equipmentName: 'RED-01',
    equipmentType: 'Reduction',
    operationStatus: 'START',
    inCarrierId: 'CR-201',
    outCarrierId: '-',
    batchLot: 'LOT-RD-2610-011',
    weight: 2.5,
    eventUser: 'OP_RED_01',
    eventComment: '로터리 환원로 865°C 고온 수소 환원 투입',
  },
  {
    id: 6,
    eventTime: '2026-10-06T11:05:30',
    orderId: 'ORD-2026-103',
    equipmentName: 'DOP-01',
    equipmentType: 'Doping',
    operationStatus: 'COMPLETE',
    inCarrierId: 'IBC-301',
    outCarrierId: 'IBC-302',
    batchLot: 'LOT-DP-2610-004',
    weight: 1.0,
    eventUser: 'OP_DOP_02',
    eventComment: '코발트 첨가제 정밀 습식 도핑 6.0% 완료',
  },
  {
    id: 7,
    eventTime: '2026-10-06T10:40:12',
    orderId: 'ORD-2026-106',
    equipmentName: 'SCR-01',
    equipmentType: 'Screen',
    operationStatus: 'COMPLETE',
    inCarrierId: 'CR-401',
    outCarrierId: 'CR-402',
    batchLot: 'LOT-SC-2610-021',
    weight: 2.0,
    eventUser: 'OP_SCR_01',
    eventComment: '#400 메쉬 진동 체분 통과 완료 및 분급 회수',
  },
  {
    id: 8,
    eventTime: '2026-10-06T09:15:00',
    orderId: 'ORD-2026-107',
    equipmentName: 'BLD-01',
    equipmentType: 'Blending',
    operationStatus: 'START',
    inCarrierId: 'CR-501',
    outCarrierId: '-',
    batchLot: 'LOT-BL-2610-031',
    weight: 2.25,
    eventUser: 'OP_BLD_01',
    eventComment: '더블콘 블렌더 대용량 분말 균일 혼합 시작',
  },
  {
    id: 9,
    eventTime: '2026-10-06T07:50:20',
    orderId: 'ORD-2026-108',
    equipmentName: 'BLD-03',
    equipmentType: 'Blending',
    operationStatus: 'ABORT',
    inCarrierId: 'CR-502',
    outCarrierId: '-',
    batchLot: 'LOT-BL-2610-033',
    weight: 2.25,
    eventUser: 'SYSTEM',
    eventComment: 'A-108 모터 토크 과부하 감지로 조업 긴급 정지',
  },
  {
    id: 10,
    eventTime: '2026-10-05T18:30:00',
    orderId: 'ORD-2026-111',
    equipmentName: 'CRB-01',
    equipmentType: 'Carburization',
    operationStatus: 'COMPLETE',
    inCarrierId: 'CST-0102',
    outCarrierId: 'CST-0202',
    batchLot: 'LOT-CB-2610-051',
    weight: 2.95,
    eventUser: 'OP_CRB_01',
    eventComment: '진공 고온 탄화 합성 반응(1450°C) 정상 완료',
  },
  {
    id: 11,
    eventTime: '2026-10-05T16:15:20',
    orderId: 'ORD-2026-113',
    equipmentName: 'DEA-01',
    equipmentType: 'Deagglomeration',
    operationStatus: 'COMPLETE',
    inCarrierId: 'CR-701',
    outCarrierId: 'CR-702',
    batchLot: 'LOT-DA-2610-061',
    weight: 1.24,
    eventUser: 'OP_DEA_01',
    eventComment: '제트밀 초음속 기류 분말 해쇄 D50 1.2um 달성',
  },
  {
    id: 12,
    eventTime: '2026-10-05T14:00:10',
    orderId: 'ORD-2026-114',
    equipmentName: 'PCK-01',
    equipmentType: 'Packing',
    operationStatus: 'COMPLETE',
    inCarrierId: 'CR-801',
    outCarrierId: 'DRUM-PACK-01',
    batchLot: 'LOT-PK-2610-071',
    weight: 2.75,
    eventUser: 'OP_PCK_01',
    eventComment: '자동 진공 캔 및 드럼 완제품 출하 포장 완료',
  },
]

/**
 * 7. Order 이력 목록 조회 API (페이징 / 검색)
 */
export async function fetchOrderHistoryApi(params) {
  try {
    const res = await api.get('/production/order-history', { params: params })
    if (res && (res.data || res.content || Array.isArray(res))) {
      return res
    }
  } catch (err) {
    console.debug('fetchOrderHistoryApi fallback to mock:', err)
  }

  let filtered = ORDER_HISTORIES_MOCK.slice()

  if (params) {
    if (params.orderId && String(params.orderId).trim() !== '') {
      const q = String(params.orderId).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          String(item.orderId).toLowerCase().indexOf(q) !== -1 ||
          String(item.batchLot).toLowerCase().indexOf(q) !== -1
        ) {
          temp.push(item)
        }
      }
      filtered = temp
    }

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

    if (params.operationStatus && params.operationStatus !== '전체') {
      const st = String(params.operationStatus).trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i].operationStatus === st) {
          temp.push(filtered[i])
        }
      }
      filtered = temp
    }

    if (params.carrierId && String(params.carrierId).trim() !== '') {
      const cId = String(params.carrierId).toLowerCase().trim()
      const temp = []
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i]
        if (
          String(item.inCarrierId).toLowerCase().indexOf(cId) !== -1 ||
          String(item.outCarrierId).toLowerCase().indexOf(cId) !== -1
        ) {
          temp.push(item)
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


