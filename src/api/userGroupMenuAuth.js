// src/api/userGroupMenuAuth.js
import axiosInstance from '@/api/index'

/**
 * 선택된 사용자 그룹의 메뉴 권한 목록 조회
 * @param {string|number|Object} userGroupId - 사용자 그룹 TSID 식별자 또는 객체
 * @returns {Promise<Object>} API 응답 데이터 (List<UserGroupMenuAuthResponse>)
 */
export function fetchAuthsByGroupIdApi(userGroupId) {
  const targetId = typeof userGroupId === 'object' && userGroupId !== null ? (userGroupId.id || userGroupId.userGroupId) : userGroupId
  const url = '/v1/mng/user-group-menu-auth/by-group/' + encodeURIComponent(targetId)
  return axiosInstance.get(url)
}

/**
 * 사용자 그룹별 메뉴 권한 일괄 저장
 * @param {Object} payload - { factoryName, userGroupId, eventName, eventUser, eventComment, authList: [{ menuId, authSelect, authSave, authDelete }] }
 * @returns {Promise<Object>} API 응답 데이터
 */
export function saveBatchMenuAuthApi(payload) {
  return axiosInstance.post('/v1/mng/user-group-menu-auth/batch-save', payload)
}

// 하위 호환성 및 편의를 위한 별칭 export
export const fetchAuthsByGroupId = fetchAuthsByGroupIdApi
export const saveBatchMenuAuth = saveBatchMenuAuthApi
export const fetchMenuAuthsByGroupApi = fetchAuthsByGroupIdApi
export const fetchMenuAuthsByGroup = fetchAuthsByGroupIdApi
