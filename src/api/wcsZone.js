// src/api/wcsZone.js
import axiosInstance from '@/api/index'

/**
 * WCS 보관 존 목록 조회 (페이징, 정렬, 조건 검색)
 * @param {Object} params - { page, size, sortBy, sortOrder, factoryName, zoneName, zoneType, loadType, ... }
 * @returns {Promise<any>}
 */
export function fetchWcsZonesApi(params) {
  return axiosInstance.get('/v1/wcs/zone', { params: params })
}

/**
 * WCS 보관 존 단건 상세 조회 (복합키: factoryName + zoneName)
 * @param {string} factoryName - 공장명
 * @param {string} zoneName - 존 명칭
 * @returns {Promise<any>}
 */
export function fetchWcsZoneDetailApi(factoryName, zoneName) {
  const path =
    '/v1/wcs/zone/' +
    encodeURIComponent(factoryName) +
    '/' +
    encodeURIComponent(zoneName)
  return axiosInstance.get(path)
}

/**
 * WCS 보관 존 단건 상세 조회 별칭 (fetchWcsZoneDetailApi 동일)
 * @param {string} factoryName - 공장명
 * @param {string} zoneName - 존 명칭
 * @returns {Promise<any>}
 */
export function fetchWcsZoneByIdApi(factoryName, zoneName) {
  return fetchWcsZoneDetailApi(factoryName, zoneName)
}

/**
 * WCS 공장별 보관 존 목록 조회
 * @param {string} factoryName - 공장명
 * @returns {Promise<any>}
 */
export function fetchWcsZonesByFactoryApi(factoryName) {
  const path = '/v1/wcs/zone/by-factory/' + encodeURIComponent(factoryName)
  return axiosInstance.get(path)
}

/**
 * WCS 보관 존 신규 등록
 * @param {Object} data - 존 생성 데이터
 * @returns {Promise<any>}
 */
export function createWcsZoneApi(data) {
  return axiosInstance.post('/v1/wcs/zone', data)
}

/**
 * WCS 보관 존 단건 수정 (복합키: factoryName + zoneName)
 * @param {string} factoryName - 공장명
 * @param {string} zoneName - 존 명칭
 * @param {Object} data - 존 수정 데이터
 * @returns {Promise<any>}
 */
export function updateWcsZoneApi(factoryName, zoneName, data) {
  const path =
    '/v1/wcs/zone/' +
    encodeURIComponent(factoryName) +
    '/' +
    encodeURIComponent(zoneName)
  return axiosInstance.put(path, data)
}

/**
 * WCS 보관 존 단건 삭제 (복합키: factoryName + zoneName)
 * @param {string} factoryName - 공장명
 * @param {string} zoneName - 존 명칭
 * @param {string} [eventUser] - 삭제 작업자
 * @param {string} [eventComment] - 삭제 사유
 * @returns {Promise<any>}
 */
export function deleteWcsZoneApi(factoryName, zoneName, eventUser, eventComment) {
  const path =
    '/v1/wcs/zone/' +
    encodeURIComponent(factoryName) +
    '/' +
    encodeURIComponent(zoneName)
  const params = {}
  if (eventUser) {
    params.eventUser = eventUser
  }
  if (eventComment) {
    params.eventComment = eventComment
  }
  return axiosInstance.delete(path, {
    params: Object.keys(params).length > 0 ? params : undefined,
  })
}
