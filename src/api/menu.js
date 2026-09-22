// src/api/menu.js
import axios from 'axios'

/**
 * 메뉴 목록 조회 (검색 및 페이징)
 * @param {Object} [params] - { page, size, factoryName, menuName, useState, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchMenusApi(params) {
  const defaultParams = {
    page: 0,
    size: 200,
  }
  const mergedParams = Object.assign({}, defaultParams, params)
  const response = await axios.get('/wcs-web/api/v1/mng/menu', { params: mergedParams })
  return response.data
}

/**
 * 메뉴 트리 목록 조회
 * @param {Object} [params] - { factoryName, useState, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchMenuTreeApi(params) {
  const response = await axios.get('/wcs-web/api/v1/mng/menu/tree', { params: params })
  return response.data
}

/**
 * 메뉴 단건 상세 조회
 * @param {string|number} id - 메뉴 TSID 식별자
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchMenuApi(id) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/wcs-web/api/v1/mng/menu/' + encodeURIComponent(targetId)
  const response = await axios.get(url)
  return response.data
}

/**
 * 신규 메뉴 등록
 * @param {Object} payload - 신규 메뉴 데이터
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function createMenuApi(payload) {
  const response = await axios.post('/wcs-web/api/v1/mng/menu', payload)
  return response.data
}

/**
 * 메뉴 정보 수정 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 메뉴 TSID 식별자 또는 수정 데이터 객체
 * @param {Object} [payload] - 수정할 메뉴 정보
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function updateMenuApi(id, payload) {
  let targetId = id
  let data = payload

  if (typeof id === 'object' && id !== null && payload === undefined) {
    targetId = id.id
    data = id
  }

  const url = '/wcs-web/api/v1/mng/menu/' + encodeURIComponent(targetId)
  const response = await axios.put(url, data)
  return response.data
}

/**
 * 메뉴 단건 삭제 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 삭제할 메뉴 TSID 식별자 또는 객체
 * @param {Object} [params] - 추가 파라미터
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function deleteMenuApi(id, params) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/wcs-web/api/v1/mng/menu/' + encodeURIComponent(targetId)
  const response = await axios.delete(url, { params: params })
  return response.data
}

// 하위 호환성을 위한 별칭 export
export const fetchMenus = fetchMenusApi
export const fetchMenuTree = fetchMenuTreeApi
export const fetchMenu = fetchMenuApi
export const createMenu = createMenuApi
export const updateMenu = updateMenuApi
export const deleteMenu = deleteMenuApi
