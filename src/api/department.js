// src/api/department.js
import axios from 'axios'

/**
 * 부서 목록 조회 (검색 및 페이징)
 * @param {Object} [params] - { page, size, factoryName, departmentName, useState, keyword, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchDepartmentsApi(params) {
  const defaultParams = {
    page: 0,
    size: 100,
    useState: 'ACTIVE',
  }
  const mergedParams = Object.assign({}, defaultParams, params)
  const response = await axios.get('/wcs-web/api/v1/mng/department', { params: mergedParams })
  return response.data
}

/**
 * 부서 단건 상세 조회
 * @param {string|number} id - 부서 TSID 식별자
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchDepartmentApi(id) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/wcs-web/api/v1/mng/department/' + encodeURIComponent(targetId)
  const response = await axios.get(url)
  return response.data
}

/**
 * 신규 부서 등록
 * @param {Object} payload - { factoryName, departmentName, useState, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function createDepartmentApi(payload) {
  const response = await axios.post('/wcs-web/api/v1/mng/department', payload)
  return response.data
}

/**
 * 부서 정보 수정 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 부서 TSID 식별자 또는 수정 데이터 객체
 * @param {Object} [payload] - 수정할 부서 정보
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function updateDepartmentApi(id, payload) {
  let targetId = id
  let data = payload

  if (typeof id === 'object' && id !== null && payload === undefined) {
    targetId = id.id
    data = id
  }

  const url = '/wcs-web/api/v1/mng/department/' + encodeURIComponent(targetId)
  const response = await axios.put(url, data)
  return response.data
}

/**
 * 부서 단건 삭제 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 삭제할 부서 TSID 식별자 또는 객체
 * @param {Object} [params] - 추가 파라미터
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function deleteDepartmentApi(id, params) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/wcs-web/api/v1/mng/department/' + encodeURIComponent(targetId)
  const response = await axios.delete(url, { params: params })
  return response.data
}

// 하위 호환성을 위한 별칭 export
export const fetchDepartments = fetchDepartmentsApi
export const fetchDepartment = fetchDepartmentApi
export const createDepartment = createDepartmentApi
export const updateDepartment = updateDepartmentApi
export const deleteDepartment = deleteDepartmentApi
