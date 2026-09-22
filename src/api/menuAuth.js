// src/api/menuAuth.js
import axios from 'axios'

/**
 * 특정 사용자 그룹의 메뉴 권한 목록 조회
 * @param {string|number} userGroupId - 사용자 그룹 TSID 식별자
 * @returns {Promise<Object>} API 응답 데이터 (권한 목록 배열 또는 DTO)
 */
export async function fetchMenuAuthsByGroupApi(userGroupId) {
  const targetId = typeof userGroupId === 'object' && userGroupId !== null ? userGroupId.id : userGroupId
  const url = '/wcs-web/api/v1/mng/user-group-menu-auth/by-group/' + encodeURIComponent(targetId)
  const response = await axios.get(url)
  return response.data
}

/**
 * 사용자 그룹별 메뉴 권한 일괄 저장
 * @param {Object} payload - { userGroupId, factoryName, authList: [...], eventUser, eventComment }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function saveBatchMenuAuthApi(payload) {
  const response = await axios.post('/wcs-web/api/v1/mng/user-group-menu-auth/batch-save', payload)
  return response.data
}

// 하위 호환성을 위한 별칭 export
export const fetchMenuAuthsByGroup = fetchMenuAuthsByGroupApi
export const saveBatchMenuAuth = saveBatchMenuAuthApi
