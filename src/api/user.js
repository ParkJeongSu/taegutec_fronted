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
 * 사용자 정보 수정
 * @param {Object} userData - 수정할 사용자 정보 (userId 포함)
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function updateUserApi(userData) {
  const targetId = userData && (userData.userId || userData.id)
  const url = targetId
    ? '/wcs-web/api/v1/mng/user/' + encodeURIComponent(targetId)
    : '/wcs-web/api/users'
  const response = await axios.put(url, userData)
  return response.data
}

/**
 * 사용자 삭제
 * @param {string|number|Object} userId - 삭제할 사용자 사번 또는 객체
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function deleteUserApi(userId) {
  const targetId =
    typeof userId === 'object' && userId !== null ? userId.userId || userId.id : userId
  const response = await axios.delete('/wcs-web/api/v1/mng/user/' + encodeURIComponent(targetId))
  return response.data
}
