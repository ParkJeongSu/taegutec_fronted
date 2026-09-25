// src/api/wcsRouteLink.js
import axiosInstance from '@/api/index'

/**
 * WCS 라우트 링크 목록 조회 (페이징, 정렬, 조건 검색)
 * @param {Object} params - { page, size, sortBy, sortOrder, factoryName, routeLinkId, fromNodeId, toNodeId, direction, linkType, linkStatus, useState, ... }
 */
export function fetchWcsRouteLinksApi(params) {
  return axiosInstance.get('/v1/wcs/route-link', { params: params })
}

/**
 * WCS 라우트 링크 단건 상세 조회 (복합키: factoryName + routeLinkId)
 * @param {string} factoryName
 * @param {number|string} routeLinkId
 */
export function fetchWcsRouteLinkByIdApi(factoryName, routeLinkId) {
  const path = '/v1/wcs/route-link/' + encodeURIComponent(factoryName) + '/' + routeLinkId
  return axiosInstance.get(path)
}

/**
 * WCS 공장별 라우트 링크 목록 조회
 * @param {string} factoryName
 */
export function fetchWcsRouteLinksByFactoryApi(factoryName) {
  const path = '/v1/wcs/route-link/by-factory/' + encodeURIComponent(factoryName)
  return axiosInstance.get(path)
}

/**
 * WCS 라우트 링크 신규 등록
 * @param {Object} payload
 */
export function createWcsRouteLinkApi(payload) {
  return axiosInstance.post('/v1/wcs/route-link', payload)
}

/**
 * WCS 라우트 링크 단건 수정 (복합키: factoryName + routeLinkId)
 * @param {string} factoryName
 * @param {number|string} routeLinkId
 * @param {Object} payload
 */
export function updateWcsRouteLinkApi(factoryName, routeLinkId, payload) {
  const path = '/v1/wcs/route-link/' + encodeURIComponent(factoryName) + '/' + routeLinkId
  return axiosInstance.put(path, payload)
}

/**
 * WCS 라우트 링크 단건 삭제 (복합키: factoryName + routeLinkId)
 * @param {string} factoryName
 * @param {number|string} routeLinkId
 */
export function deleteWcsRouteLinkApi(factoryName, routeLinkId) {
  const path = '/v1/wcs/route-link/' + encodeURIComponent(factoryName) + '/' + routeLinkId
  return axiosInstance.delete(path)
}
