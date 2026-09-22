// src/api/department.js
import axios from 'axios'

/**
 * 부서 목록 조회 (검색 및 페이징)
 * @param {Object} [params] - { page, size, useState, keyword, searchKeyword, ... }
 * @returns {Promise<Object>} API 응답 데이터
 */
export async function fetchDepartmentsApi(params) {
  const defaultParams = {
    page: 0,
    size: 100,
    useState: 'ACTIVE',
  }
  const mergedParams = Object.assign({}, defaultParams, params)
  const response = await axios.get('/wcs-web/api/departments', { params: mergedParams })
  return response.data
}

// 하위 호환성을 위한 별칭 export
export const fetchDepartments = fetchDepartmentsApi
