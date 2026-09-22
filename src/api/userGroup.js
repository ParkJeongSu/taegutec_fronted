// src/api/userGroup.js
import axios from 'axios'

/**
 * 사용자 그룹 목록 조회 (페이징 및 조건 검색)
 * @param {Object} [params] - { page, size, factoryName, userGroupName, useState, keyword, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchUserGroupsApi(params) {
  const defaultParams = {
    page: 0,
    size: 10,
  }
  const cleanParams = Object.assign({}, defaultParams, params)

  // Vuetify 1-based page인 경우 0-based로 보정
  if (typeof cleanParams.page === 'number' && cleanParams.page > 0) {
    cleanParams.page = cleanParams.page - 1
  }

  const response = await axios.get('/wcs-web/api/v1/mng/user-group', { params: cleanParams })
  const resData = response.data

  // useDataTable composable 규격({ content: [], page: { totalElements: 0 } }) 호환 매핑
  if (resData) {
    if (resData.data && Array.isArray(resData.data.content)) {
      return {
        content: resData.data.content,
        page: { totalElements: resData.data.totalElements || resData.data.content.length },
        totalElements: resData.data.totalElements || resData.data.content.length,
      }
    }
    if (resData.content && Array.isArray(resData.content)) {
      return {
        content: resData.content,
        page: resData.page || { totalElements: resData.totalElements || resData.content.length },
        totalElements: resData.totalElements || resData.content.length,
      }
    }
    if (Array.isArray(resData.data)) {
      return {
        content: resData.data,
        page: { totalElements: resData.total || resData.data.length },
        totalElements: resData.total || resData.data.length,
      }
    }
    if (Array.isArray(resData)) {
      return {
        content: resData,
        page: { totalElements: resData.length },
        totalElements: resData.length,
      }
    }
  }

  return resData || { content: [], page: { totalElements: 0 }, totalElements: 0 }
}

/**
 * 사용자 그룹 단건 상세 조회
 * @param {string|number} id - 사용자 그룹 TSID 식별자
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchUserGroupApi(id) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/wcs-web/api/v1/mng/user-group/' + encodeURIComponent(targetId)
  const response = await axios.get(url)
  return response.data
}

/**
 * 신규 사용자 그룹 등록
 * @param {Object} payload - { factoryName, userGroupName, description, useState, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function createUserGroupApi(payload) {
  const response = await axios.post('/wcs-web/api/v1/mng/user-group', payload)
  return response.data
}

/**
 * 사용자 그룹 정보 수정 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 사용자 그룹 TSID 식별자 또는 수정 데이터 객체
 * @param {Object} [payload] - 수정할 사용자 그룹 정보
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function updateUserGroupApi(id, payload) {
  let targetId = id
  let data = payload

  if (typeof id === 'object' && id !== null && payload === undefined) {
    targetId = id.id
    data = id
  }

  const url = '/wcs-web/api/v1/mng/user-group/' + encodeURIComponent(targetId)
  const response = await axios.put(url, data)
  return response.data
}

/**
 * 사용자 그룹 단건 삭제 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 삭제할 사용자 그룹 TSID 식별자 또는 객체
 * @param {Object} [params] - 추가 파라미터
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function deleteUserGroupApi(id, params) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/wcs-web/api/v1/mng/user-group/' + encodeURIComponent(targetId)
  const response = await axios.delete(url, { params: params })
  return response.data
}

/**
 * 사용자 그룹 다건 벌크 삭제
 * @param {Object} payload - { ids: [TSID, ...] }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function deleteUserGroupsBatchApi(payload) {
  const response = await axios.delete('/wcs-web/api/v1/mng/user-group/batch-delete', {
    data: payload,
  })
  return response.data
}

// 하위 호환성을 위한 별칭 export
export const fetchUserGroups = fetchUserGroupsApi
export const fetchUserGroup = fetchUserGroupApi
export const createUserGroup = createUserGroupApi
export const updateUserGroup = updateUserGroupApi
export const deleteUserGroup = deleteUserGroupApi
export const deleteUserGroupsBatch = deleteUserGroupsBatchApi
