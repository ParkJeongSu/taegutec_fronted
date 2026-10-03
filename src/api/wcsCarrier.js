// src/api/wcsCarrier.js
import axiosInstance from '@/api/index'

/**
 * WCS 캐리어 목록 조회
 * @param {Object} params - { page, size, factoryName, carrierName, carrierType, carrierStatus, useState, ... }
 */
export function fetchWcsCarriersApi(params) {
  return axiosInstance.get('/v1/wcs/carrier', { params: params })
}

/**
 * WCS 캐리어 단건 상세 조회 (복합키: factoryName + carrierName)
 * @param {string} factoryName
 * @param {string} carrierName
 */
export function fetchWcsCarrierByIdApi(factoryName, carrierName) {
  const path =
    '/v1/wcs/carrier/' + encodeURIComponent(factoryName) + '/' + encodeURIComponent(carrierName)
  return axiosInstance.get(path)
}

/**
 * WCS 캐리어 신규 등록
 * @param {Object} payload
 */
export function createWcsCarrierApi(payload) {
  return axiosInstance.post('/v1/wcs/carrier', payload)
}

/**
 * WCS 캐리어 단건 수정 (복합키: factoryName + carrierName)
 * @param {string} factoryName
 * @param {string} carrierName
 * @param {Object} payload
 */
export function updateWcsCarrierApi(factoryName, carrierName, payload) {
  const path =
    '/v1/wcs/carrier/' + encodeURIComponent(factoryName) + '/' + encodeURIComponent(carrierName)
  return axiosInstance.put(path, payload)
}

/**
 * WCS 캐리어 단건 삭제 (복합키: factoryName + carrierName)
 * @param {string} factoryName
 * @param {string} carrierName
 * @param {string} [eventUser]
 * @param {string} [eventComment]
 */
export function deleteWcsCarrierApi(factoryName, carrierName, eventUser, eventComment) {
  const path =
    '/v1/wcs/carrier/' + encodeURIComponent(factoryName) + '/' + encodeURIComponent(carrierName)

  const queryParams = {}
  if (eventUser) {
    queryParams.eventUser = eventUser
  }
  if (eventComment) {
    queryParams.eventComment = eventComment
  }

  return axiosInstance.delete(path, {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  })
}
