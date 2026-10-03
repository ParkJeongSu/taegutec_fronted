// src/api/wcsStocker.js
import axiosInstance from '@/api/index'

/**
 * WCS 스토커 목록 조회
 * @param {Object} params - { page, size, factoryName, stockerName, areaName, stockerStatus, useState, ... }
 */
export function fetchWcsStockersApi(params) {
  return axiosInstance.get('/v1/wcs/stocker', { params: params })
}

/**
 * WCS 스토커 단건 상세 조회 (복합키: factoryName + stockerName)
 * @param {string} factoryName
 * @param {string} stockerName
 */
export function fetchWcsStockerByIdApi(factoryName, stockerName) {
  return axiosInstance.get(
    '/v1/wcs/stocker/' + encodeURIComponent(factoryName) + '/' + encodeURIComponent(stockerName),
  )
}

/**
 * WCS 스토커 신규 등록
 * @param {Object} payload
 */
export function createWcsStockerApi(payload) {
  return axiosInstance.post('/v1/wcs/stocker', payload)
}

/**
 * WCS 스토커 단건 수정 (복합키: factoryName + stockerName)
 * @param {string} factoryName
 * @param {string} stockerName
 * @param {Object} payload
 */
export function updateWcsStockerApi(factoryName, stockerName, payload) {
  return axiosInstance.put(
    '/v1/wcs/stocker/' + encodeURIComponent(factoryName) + '/' + encodeURIComponent(stockerName),
    payload,
  )
}

/**
 * WCS 스토커 삭제
 * @param {string} factoryName
 * @param {string} stockerName
 * @param {string} [eventUser]
 * @param {string} [eventComment]
 */
export function deleteWcsStockerApi(factoryName, stockerName, eventUser, eventComment) {
  const path =
    '/v1/wcs/stocker/' + encodeURIComponent(factoryName) + '/' + encodeURIComponent(stockerName)

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
