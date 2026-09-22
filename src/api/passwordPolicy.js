// src/api/passwordPolicy.js
import axios from 'axios'

/**
 * 패스워드 정책 목록 조회 (공장별 및 조건 검색)
 * @param {Object} [params] - { factoryName, policyName, isActive, ... }
 * @returns {Promise<Array|Object>} API 응답 데이터 (정책 목록)
 */
export async function fetchPasswordPoliciesApi(params) {
  const response = await axios.get('/wcs-web/api/v1/mng/password-policy', { params: params })
  const resData = response.data

  if (resData) {
    if (resData.data && Array.isArray(resData.data.content)) {
      return resData.data.content
    }
    if (resData.content && Array.isArray(resData.content)) {
      return resData.content
    }
    if (Array.isArray(resData.data)) {
      return resData.data
    }
    if (Array.isArray(resData)) {
      return resData
    }
  }

  return resData || []
}

/**
 * 패스워드 정책 단건 상세 조회 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 패스워드 정책 TSID 식별자 또는 객체
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchPasswordPolicyByIdApi(id) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/wcs-web/api/v1/mng/password-policy/' + encodeURIComponent(targetId)
  const response = await axios.get(url)
  return response.data
}

/**
 * 신규 패스워드 정책 등록
 * @param {Object} payload - { factoryName, policyName, isActive, policyValue, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function createPasswordPolicyApi(payload) {
  const response = await axios.post('/wcs-web/api/v1/mng/password-policy', payload)
  return response.data
}

/**
 * 패스워드 정책 정보 수정 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 패스워드 정책 TSID 식별자 또는 수정 데이터 객체
 * @param {Object} [payload] - 수정할 패스워드 정책 정보
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function updatePasswordPolicyApi(id, payload) {
  let targetId = id
  let data = payload

  if (typeof id === 'object' && id !== null && payload === undefined) {
    targetId = id.id
    data = id
  }

  const url = '/wcs-web/api/v1/mng/password-policy/' + encodeURIComponent(targetId)
  const response = await axios.put(url, data)
  return response.data
}

/**
 * 패스워드 정책 단건 삭제 (대리키 TSID id 기준)
 * @param {string|number|Object} id - 삭제할 패스워드 정책 TSID 식별자 또는 객체
 * @param {Object} [params] - 추가 쿼리 파라미터
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function deletePasswordPolicyApi(id, params) {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  const url = '/wcs-web/api/v1/mng/password-policy/' + encodeURIComponent(targetId)
  const response = await axios.delete(url, { params: params })
  return response.data
}

// 하위 호환성을 위한 별칭 export
export const fetchPasswordPolicies = fetchPasswordPoliciesApi
export const fetchPasswordPolicyById = fetchPasswordPolicyByIdApi
export const createPasswordPolicy = createPasswordPolicyApi
export const updatePasswordPolicy = updatePasswordPolicyApi
export const deletePasswordPolicy = deletePasswordPolicyApi
