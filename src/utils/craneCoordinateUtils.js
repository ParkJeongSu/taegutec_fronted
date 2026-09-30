// src/utils/craneCoordinateUtils.js

export const WAREHOUSE_RAIL_MAP = {
  // 지하 창고 레이아웃 (warehouse_underground_layout.svg)
  underground: {
    1: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 1390, y: 700 },
      endPoint: { x: 1390, y: 1170 },
    },
    2: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 890, y: 920 },
      endPoint: { x: 890, y: 1170 },
    },
    3: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 890, y: 680 },
      endPoint: { x: 890, y: 880 },
    },
    2.1: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 930, y: 50 },
      endPoint: { x: 930, y: 470 },
    },
    2.2: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 1410, y: 50 },
      endPoint: { x: 1410, y: 470 },
    },
    6: {
      orientation: 'HORIZONTAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 60, y: 460 },
      endPoint: { x: 520, y: 460 },
    },
    7: {
      orientation: 'HORIZONTAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 60, y: 310 },
      endPoint: { x: 340, y: 310 },
    },
  },

  // 지상 창고 레이아웃 (warehouse_ground_layout.svg)
  ground: {
    1: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 1390, y: 700 },
      endPoint: { x: 1390, y: 1170 },
    },
    2: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 890, y: 800 },
      endPoint: { x: 890, y: 1170 },
    },
    3: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 890, y: 520 },
      endPoint: { x: 890, y: 760 },
    },
    4: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 1390, y: 50 },
      endPoint: { x: 1390, y: 470 },
    },
    5: {
      orientation: 'VERTICAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 890, y: 50 },
      endPoint: { x: 890, y: 470 },
    },
    6: {
      orientation: 'HORIZONTAL',
      localMin: 0,
      localMax: 1000,
      startPoint: { x: 60, y: 420 },
      endPoint: { x: 540, y: 420 },
    },
  },
}

export function calculateGlobalCranePosition(floorType, warehouseId, payload) {
  const currentFloorConfig = WAREHOUSE_RAIL_MAP[floorType]
  if (!currentFloorConfig) {
    return { x: 0, y: 0, transform: 'translate(0, 0)' }
  }

  const rail = currentFloorConfig[String(warehouseId)]
  if (!rail) {
    return { x: 0, y: 0, transform: 'translate(0, 0)' }
  }

  let rawValue = 0
  if (typeof payload === 'number') {
    rawValue = payload
  } else if (payload && typeof payload === 'object') {
    if (rail.orientation === 'HORIZONTAL') {
      rawValue = typeof payload.x === 'number' ? payload.x : payload.y || 0
    } else {
      rawValue = typeof payload.y === 'number' ? payload.y : payload.x || 0
    }
  }

  const min = rail.localMin
  const max = rail.localMax
  if (rawValue < min) rawValue = min
  if (rawValue > max) rawValue = max

  const ratio = max === min ? 0 : (rawValue - min) / (max - min)

  const calcX = rail.startPoint.x + ratio * (rail.endPoint.x - rail.startPoint.x)
  const calcY = rail.startPoint.y + ratio * (rail.endPoint.y - rail.startPoint.y)

  const finalX = Math.round(calcX * 10) / 10
  const finalY = Math.round(calcY * 10) / 10

  return {
    x: finalX,
    y: finalY,
    transform: 'translate(' + finalX + ', ' + finalY + ')',
  }
}
