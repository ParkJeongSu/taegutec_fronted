// src/api/auth.js
import axios from 'axios'

/**
 * 사용자 로그인 API 호출
 * @param {Object} params - { factoryName: string, userId: string, password: string }
 * @returns {Promise<Object>} API 응답 데이터 (success, accessToken, tokenType, user 등)
 */
export async function loginApi(params) {
  const response = await axios.post('/wcs-web/api/auth/login', params)
  return response.data
}
