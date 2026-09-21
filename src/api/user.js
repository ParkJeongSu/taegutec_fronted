// src/api/user.js
import axios from 'axios'

/**
 * 사용자 목록 조회 (검색 및 페이징)
 * @param {Object} params - { keyword, searchKeyword, status, page, size, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchUsersApi(params) {
  const response = await axios.get('/wcs-web/api/v1/mng/user', { params: params })
  return response.data
}

/**
 * 신규 사용자 등록
 * @param {Object} userData - { userId, userName, password, email, phone, status, userState, factoryName, departmentId, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function createUserApi(userData) {
  const response = await axios.post('/wcs-web/api/v1/mng/user', userData)
  return response.data
}

/**
 * 사용자 정보 수정 (대리키 id 기준)
 * @param {string|number|Object} id - TSID 식별자 또는 수정할 데이터 객체
 * @param {Object} [payload] - 수정할 사용자 정보
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function updateUserApi(id, payload) {
  let targetId = id
  let data = payload

  // 첫 번째 인자가 객체로 전달된 경우 대응
  if (typeof id === 'object' && id !== null && payload === undefined) {
    targetId = id.id || id.userId
    data = id
  }

  const url = '/wcs-web/api/users/' + encodeURIComponent(targetId)
  const response = await axios.put(url, data)
  return response.data
}

/**
 * 사용자 삭제 (대리키 id 기준)
 * @param {string|number|Object} id - 삭제할 사용자 TSID 식별자 또는 객체
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function deleteUserApi(id) {
  const targetId = typeof id === 'object' && id !== null ? id.id || id.userId : id
  const url = '/wcs-web/api/users/' + encodeURIComponent(targetId)
  const response = await axios.delete(url)
  return response.data
}
