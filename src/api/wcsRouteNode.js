// src/api/wcsRouteNode.js
import axiosInstance from '@/api/index'

/**
 * WCS 라우트 노드 목록 조회 (페이징, 정렬, 조건 검색)
 * @param {Object} params - { page, size, sortBy, sortOrder, factoryName, routeNodeId, nodeName, nodeType, useState, ... }
 */
export function fetchWcsRouteNodesApi(params) {
  return axiosInstance.get('/v1/wcs/route-node', { params: params })
}

/**
 * WCS 라우트 노드 단건 상세 조회 (복합키: factoryName + routeNodeId)
 * @param {string} factoryName
 * @param {number|string} routeNodeId
 */
export function fetchWcsRouteNodeByIdApi(factoryName, routeNodeId) {
  const path = '/v1/wcs/route-node/' + encodeURIComponent(factoryName) + '/' + routeNodeId
  return axiosInstance.get(path)
}

/**
 * WCS 라우트 노드 신규 등록
 * @param {Object} payload
 */
export function createWcsRouteNodeApi(payload) {
  return axiosInstance.post('/v1/wcs/route-node', payload)
}

/**
 * WCS 라우트 노드 단건 수정 (복합키: factoryName + routeNodeId)
 * @param {string} factoryName
 * @param {number|string} routeNodeId
 * @param {Object} payload
 */
export function updateWcsRouteNodeApi(factoryName, routeNodeId, payload) {
  const path = '/v1/wcs/route-node/' + encodeURIComponent(factoryName) + '/' + routeNodeId
  return axiosInstance.put(path, payload)
}

/**
 * WCS 라우트 노드 단건 삭제 (복합키: factoryName + routeNodeId)
 * @param {string} factoryName
 * @param {number|string} routeNodeId
 */
export function deleteWcsRouteNodeApi(factoryName, routeNodeId) {
  const path = '/v1/wcs/route-node/' + encodeURIComponent(factoryName) + '/' + routeNodeId
  return axiosInstance.delete(path)
}
