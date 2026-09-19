// src/api/zone.js
import api from './index'

/**
 * 뱅크별 랙(Shelf) 목록 조회 API
 * @param {Object} params
 * @param {string} params.factoryName - 공장명 (예: INSERT, POWDER)
 * @param {string} params.stockerName - 스토커/창고명 (예: WH1)
 * @param {number} params.col - Col 번호 (1 또는 2)
 * @param {number} params.bin - Bin 번호 (1 또는 2)
 * @returns {Promise<Array>} 랙 목록 데이터 배열
 */
export function fetchBankShelvesApi(params) {
  return api
    .get('/wcs-web/api/v1/wcs/zones/bankShelves', { params: params })
    .then(function (response) {
      if (response && response.data) {
        return response.data
      }
      return response
    })
    .catch(function (error) {
      console.warn('WCS BankShelves API 호출 실패 (Mock 데이터로 대체 가능):', error)
      throw error
    })
}

// 하위 호환성을 위한 별칭 export
export const fetchBankShelves = fetchBankShelvesApi

/**
 * 랙 존(Zone) 일괄 변경 저장 API
 * @param {Object} payload
 * @param {string} payload.factoryName - 공장명
 * @param {string} payload.stockerName - 스토커명
 * @param {number} payload.col - Col
 * @param {number} payload.bin - Bin
 * @param {Array} payload.shelves - 변경된 랙 목록 [{ shelfCode, zoneName, row, stage }, ...]
 * @returns {Promise<any>}
 */
export function saveBankShelvesZoneApi(payload) {
  return api
    .post('/wcs-web/api/v1/wcs/zones/bankShelves/batch-update', payload)
    .then(function (response) {
      if (response && response.data) {
        return response.data
      }
      return response
    })
}

// 하위 호환성을 위한 별칭 export
export const saveBankShelvesZone = saveBankShelvesZoneApi
