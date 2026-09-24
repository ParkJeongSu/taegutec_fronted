// src/api/wcsShelf.js
import axiosInstance from '@/api/index'

/**
 * WCS 셸프 목록 조회
 * @param {Object} params - { page, size, factoryName, stockerName, shelfName, shelfStatus, zoneName, useState, ... }
 */
export function fetchWcsShelvesApi(params) {
  return axiosInstance.get('/v1/wcs/shelf', { params: params })
}

/**
 * WCS 셸프 단건 상세 조회 (3개 복합키: factoryName, stockerName, shelfName)
 * @param {string} factoryName
 * @param {string} stockerName
 * @param {string} shelfName
 */
export function fetchWcsShelfByIdApi(factoryName, stockerName, shelfName) {
  const path =
    '/v1/wcs/shelf/' +
    encodeURIComponent(factoryName) +
    '/' +
    encodeURIComponent(stockerName) +
    '/' +
    encodeURIComponent(shelfName)
  return axiosInstance.get(path)
}

/**
 * WCS 셸프 신규 등록
 * @param {Object} payload
 */
export function createWcsShelfApi(payload) {
  return axiosInstance.post('/v1/wcs/shelf', payload)
}

/**
 * WCS 셸프 단건 수정 (3개 복합키: factoryName, stockerName, shelfName)
 * @param {string} factoryName
 * @param {string} stockerName
 * @param {string} shelfName
 * @param {Object} payload
 */
export function updateWcsShelfApi(factoryName, stockerName, shelfName, payload) {
  const path =
    '/v1/wcs/shelf/' +
    encodeURIComponent(factoryName) +
    '/' +
    encodeURIComponent(stockerName) +
    '/' +
    encodeURIComponent(shelfName)
  return axiosInstance.put(path, payload)
}

/**
 * WCS 셸프 단건 삭제 (3개 복합키: factoryName, stockerName, shelfName)
 * @param {string} factoryName
 * @param {string} stockerName
 * @param {string} shelfName
 * @param {Object} [params]
 */
export function deleteWcsShelfApi(factoryName, stockerName, shelfName, params) {
  const path =
    '/v1/wcs/shelf/' +
    encodeURIComponent(factoryName) +
    '/' +
    encodeURIComponent(stockerName) +
    '/' +
    encodeURIComponent(shelfName)
  return axiosInstance.delete(path, { params: params })
}
