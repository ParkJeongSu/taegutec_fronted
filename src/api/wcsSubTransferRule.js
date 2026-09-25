// src/api/wcsSubTransferRule.js
import axiosInstance from '@/api/index'

/**
 * WCS 하위 반송 규칙(Sub Transfer Rule) 목록 조회 (페이징, 정렬, 조건 검색)
 * @param {Object} params - { page, size, sortBy, sortOrder, factoryName, equipmentName, moduleName, routeLinkId, useState, ... }
 */
export function fetchWcsSubTransferRulesApi(params) {
  return axiosInstance.get('/v1/wcs/sub-transfer-rule', { params: params })
}

/**
 * WCS 하위 반송 규칙 단건 상세 조회 (4개 복합키: factoryName + equipmentName + moduleName + routeLinkId)
 * @param {string} factoryName
 * @param {string} equipmentName
 * @param {string} moduleName
 * @param {number|string} routeLinkId
 */
export function fetchWcsSubTransferRuleByIdApi(factoryName, equipmentName, moduleName, routeLinkId) {
  const path =
    '/v1/wcs/sub-transfer-rule/' +
    encodeURIComponent(factoryName) + '/' +
    encodeURIComponent(equipmentName) + '/' +
    encodeURIComponent(moduleName) + '/' +
    routeLinkId
  return axiosInstance.get(path)
}

/**
 * WCS 설비별 하위 반송 규칙 목록 조회
 * @param {string} factoryName
 * @param {string} equipmentName
 */
export function fetchWcsSubTransferRulesByEquipmentApi(factoryName, equipmentName) {
  const path =
    '/v1/wcs/sub-transfer-rule/by-equipment/' +
    encodeURIComponent(factoryName) + '/' +
    encodeURIComponent(equipmentName)
  return axiosInstance.get(path)
}

/**
 * WCS 하위 반송 규칙 신규 등록
 * @param {Object} payload
 */
export function createWcsSubTransferRuleApi(payload) {
  return axiosInstance.post('/v1/wcs/sub-transfer-rule', payload)
}

/**
 * WCS 하위 반송 규칙 단건 수정 (4개 복합키: factoryName + equipmentName + moduleName + routeLinkId)
 * @param {string} factoryName
 * @param {string} equipmentName
 * @param {string} moduleName
 * @param {number|string} routeLinkId
 * @param {Object} payload
 */
export function updateWcsSubTransferRuleApi(factoryName, equipmentName, moduleName, routeLinkId, payload) {
  const path =
    '/v1/wcs/sub-transfer-rule/' +
    encodeURIComponent(factoryName) + '/' +
    encodeURIComponent(equipmentName) + '/' +
    encodeURIComponent(moduleName) + '/' +
    routeLinkId
  return axiosInstance.put(path, payload)
}

/**
 * WCS 하위 반송 규칙 단건 삭제 (4개 복합키: factoryName + equipmentName + moduleName + routeLinkId)
 * @param {string} factoryName
 * @param {string} equipmentName
 * @param {string} moduleName
 * @param {number|string} routeLinkId
 */
export function deleteWcsSubTransferRuleApi(factoryName, equipmentName, moduleName, routeLinkId) {
  const path =
    '/v1/wcs/sub-transfer-rule/' +
    encodeURIComponent(factoryName) + '/' +
    encodeURIComponent(equipmentName) + '/' +
    encodeURIComponent(moduleName) + '/' +
    routeLinkId
  return axiosInstance.delete(path)
}
