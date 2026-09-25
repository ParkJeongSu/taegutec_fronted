// src/api/wcsAlternativeStorageZone.js
import axiosInstance from '@/api/index'

/**
 * WCS 대체 보관 존 목록 조회 (페이징, 정렬, 조건 검색)
 * @param {Object} params - { page, size, sortBy, sortOrder, factoryName, sourceZoneName, alternativeZoneName, priority, useState, ... }
 */
export function fetchWcsAlternativeStorageZonesApi(params) {
  return axiosInstance.get('/v1/wcs/alternative-storage-zone', { params: params })
}

/**
 * WCS 대체 보관 존 단건 상세 조회 (4개 복합키: factoryName + sourceZoneName + alternativeZoneName + priority)
 * @param {string} factoryName
 * @param {string} sourceZoneName
 * @param {string} alternativeZoneName
 * @param {number|string} priority
 */
export function fetchWcsAlternativeStorageZoneByIdApi(factoryName, sourceZoneName, alternativeZoneName, priority) {
  const path =
    '/v1/wcs/alternative-storage-zone/' +
    encodeURIComponent(factoryName) + '/' +
    encodeURIComponent(sourceZoneName) + '/' +
    encodeURIComponent(alternativeZoneName) + '/' +
    priority
  return axiosInstance.get(path)
}

/**
 * WCS 원본 존별 대체 보관 존 목록 조회
 * @param {string} factoryName
 * @param {string} sourceZoneName
 */
export function fetchWcsAlternativeStorageZonesBySourceZoneApi(factoryName, sourceZoneName) {
  const path =
    '/v1/wcs/alternative-storage-zone/by-source-zone/' +
    encodeURIComponent(factoryName) + '/' +
    encodeURIComponent(sourceZoneName)
  return axiosInstance.get(path)
}

/**
 * WCS 대체 보관 존 신규 등록
 * @param {Object} payload
 */
export function createWcsAlternativeStorageZoneApi(payload) {
  return axiosInstance.post('/v1/wcs/alternative-storage-zone', payload)
}

/**
 * WCS 대체 보관 존 단건 수정 (4개 복합키: factoryName + sourceZoneName + alternativeZoneName + priority)
 * @param {string} factoryName
 * @param {string} sourceZoneName
 * @param {string} alternativeZoneName
 * @param {number|string} priority
 * @param {Object} payload
 */
export function updateWcsAlternativeStorageZoneApi(factoryName, sourceZoneName, alternativeZoneName, priority, payload) {
  const path =
    '/v1/wcs/alternative-storage-zone/' +
    encodeURIComponent(factoryName) + '/' +
    encodeURIComponent(sourceZoneName) + '/' +
    encodeURIComponent(alternativeZoneName) + '/' +
    priority
  return axiosInstance.put(path, payload)
}

/**
 * WCS 대체 보관 존 단건 삭제 (4개 복합키: factoryName + sourceZoneName + alternativeZoneName + priority)
 * @param {string} factoryName
 * @param {string} sourceZoneName
 * @param {string} alternativeZoneName
 * @param {number|string} priority
 */
export function deleteWcsAlternativeStorageZoneApi(factoryName, sourceZoneName, alternativeZoneName, priority) {
  const path =
    '/v1/wcs/alternative-storage-zone/' +
    encodeURIComponent(factoryName) + '/' +
    encodeURIComponent(sourceZoneName) + '/' +
    encodeURIComponent(alternativeZoneName) + '/' +
    priority
  return axiosInstance.delete(path)
}
