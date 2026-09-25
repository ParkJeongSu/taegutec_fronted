// src/api/galInterface.js
import axiosInstance from '@/api/index'

/**
 * GAL Interface 메인 목록 조회
 * @param {Object} params - { page, size, sortBy, sortOrder, factoryName, docNum, lineId, idocTypId, source, destination, status, errorCode, startDate, endDate }
 */
export function fetchGalInterfacesApi(params) {
  return axiosInstance.get('/v1/mng/interface', { params: params })
}

/**
 * GAL Interface 상세 목록/단건 조회
 * @param {Object} params - { docNum, lineId, page, size }
 */
export function fetchGalDetailInterfacesApi(params) {
  return axiosInstance.get('/v1/mng/interface/detail', { params: params })
}

/**
 * GAL Part 정보 목록/단건 조회 (POWDER idocTypId === 19 전용)
 * @param {Object} params - { docNum, lineId, page, size }
 */
export function fetchGalPartsApi(params) {
  return axiosInstance.get('/v1/mng/interface/part', { params: params })
}
