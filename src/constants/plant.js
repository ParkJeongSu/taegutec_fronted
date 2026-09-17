export const VITE_PLANT_TYPE = import.meta.env.VITE_PLANT_TYPE || 'INSERT'
export const VITE_APP_TITLE = import.meta.env.VITE_APP_TITLE || '대구텍 MES - INSERT'
export const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:11421'

export const PLANT_TYPE = VITE_PLANT_TYPE
export const APP_TITLE = VITE_APP_TITLE

export const PLANT_TYPES = {
  INSERT: 'INSERT',
  POWDER: 'POWDER',
}

export function isInsert() {
  return PLANT_TYPE === PLANT_TYPES.INSERT
}

export function isPowder() {
  return PLANT_TYPE === PLANT_TYPES.POWDER
}

export function getPlantType() {
  return PLANT_TYPE
}

export function getAppTitle() {
  return APP_TITLE
}
