// src/api/menu.js
import axiosInstance from '@/api/index'

/**
 * 사용자 권한 메뉴 트리 조회
 * @param {string|number} userId - 사용자 TSID 식별자 또는 사용자 ID
 * @returns {Promise<Object>} API 응답 데이터
 */
export function fetchAuthorizedMenuTreeApi(userId) {
  const targetId = typeof userId === 'object' && userId !== null ? (userId.id || userId.userId) : userId
  const url = '/v1/mng/menu/authorized/' + encodeURIComponent(targetId)
  return axiosInstance.get(url)
}

/**
 * 메뉴 목록 조회 (검색 및 페이징)
 * @param {Object} [params] - { page, size, factoryName, menuName, useState, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export function fetchMenusApi(params) {
  const defaultParams = {
    page: 0,
    size: 200,
  }
  const mergedParams = Object.assign({}, defaultParams, params)
  return axiosInstance.get('/v1/mng/menu', { params: mergedParams })
}

/**
 * 메뉴 트리 목록 조회
 * @param {Object} [params] - { factoryName, useState, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export function fetchMenuTreeApi(params) {
  return axiosInstance.get('/v1/mng/menu/tree', { params: params })
}

/**
 * 메뉴 단건 상세 조회
 * @param {string|number} id - 메뉴 TSID 식별자
 * @returns {Promise<Object>} API 응답 데이터
 */
export function fetchMenuApi(id) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/v1/mng/menu/' + encodeURIComponent(targetId)
  return axiosInstance.get(url)
}

/**
 * 신규 메뉴 등록
 * @param {Object} payload - 신규 메뉴 데이터
 * @returns {Promise<Object>} API 응답 데이터
 */
export function createMenuApi(payload) {
  return axiosInstance.post('/v1/mng/menu', payload)
}

/**
 * 메뉴 정보 수정 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 메뉴 TSID 식별자 또는 수정 데이터 객체
 * @param {Object} [payload] - 수정할 메뉴 정보
 * @returns {Promise<Object>} API 응답 데이터
 */
export function updateMenuApi(id, payload) {
  let targetId = id
  let data = payload

  if (typeof id === 'object' && id !== null && payload === undefined) {
    targetId = id.id
    data = id
  }

  const url = '/v1/mng/menu/' + encodeURIComponent(targetId)
  return axiosInstance.put(url, data)
}

/**
 * 메뉴 단건 삭제 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 삭제할 메뉴 TSID 식별자 또는 객체
 * @param {Object} [params] - 추가 파라미터
 * @returns {Promise<Object>} API 응답 데이터
 */
export function deleteMenuApi(id, params) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/v1/mng/menu/' + encodeURIComponent(targetId)
  return axiosInstance.delete(url, { params: params })
}

// 하위 호환성을 위한 별칭 export
export const fetchAuthorizedMenuTree = fetchAuthorizedMenuTreeApi
export const fetchMenus = fetchMenusApi
export const fetchMenuTree = fetchMenuTreeApi
export const fetchMenu = fetchMenuApi
export const createMenu = createMenuApi
export const updateMenu = updateMenuApi
export const deleteMenu = deleteMenuApi
