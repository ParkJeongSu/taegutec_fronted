// src/api/wcsTransferCommand.js
import axiosInstance from '@/api/index'

/**
 * WCS 반송 명령 이력 목록 조회 (페이징 및 동적 조건)
 * @param {Object} params - { page, size, sortBy, sortOrder, transferCommandName, carrierName, commandStatus, currentEquipmentName, orderType, eventUser, startDate, endDate }
 */
export function fetchTransferCommandHistoriesApi(params) {
  return axiosInstance.get('/v1/wcs/transfer-command/history', { params: params })
}

/**
 * WCS 반송 명령 목록 조회
 * @param {Object} params
 */
export function fetchTransferCommandsApi(params) {
  return axiosInstance.get('/v1/wcs/transfer-command', { params: params })
}

/**
 * WCS 반송 명령 단건 상세 조회
 * @param {string} transferCommandName
 */
export function fetchTransferCommandByNameApi(transferCommandName) {
  const path = '/v1/wcs/transfer-command/' + encodeURIComponent(transferCommandName)
  return axiosInstance.get(path)
}

/**
 * 신규 WCS 반송 명령 등록
 * @param {Object} payload
 */
export function createTransferCommandApi(payload) {
  return axiosInstance.post('/v1/wcs/transfer-command', payload)
}

/**
 * WCS 반송 명령 수정
 * @param {string} transferCommandName
 * @param {Object} payload
 */
export function updateTransferCommandApi(transferCommandName, payload) {
  const path = '/v1/wcs/transfer-command/' + encodeURIComponent(transferCommandName)
  return axiosInstance.put(path, payload)
}

/**
 * WCS 반송 명령 삭제
 * @param {string} transferCommandName
 * @param {Object} [params]
 */
export function deleteTransferCommandApi(transferCommandName, params) {
  const path = '/v1/wcs/transfer-command/' + encodeURIComponent(transferCommandName)
  return axiosInstance.delete(path, { params: params })
}
