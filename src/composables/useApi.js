// src/composables/useApi.js
import { ref } from 'vue'

/**
 * 페이징이 없는 일반 API 호출을 범용으로 처리하는 컴포저블
 * @param {Function} apiFunc - 호출할 API 비동기 함수
 * @param {any} initialData - 응답 데이터의 초기값
 * @returns {Object} { data, loading, error, execute, reset }
 */
export function useApi(apiFunc, initialData = null) {
  const data = ref(initialData)
  const loading = ref(false)
  const error = ref(null)

  /**
   * API 실행 함수
   * @param {any} params - API 전달 파라미터
   * @returns {Promise<any>}
   */
  async function execute(params) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFunc(params)

      // Axios의 원본 HTTP Response 객체인 경우에만 1회 unwrap (status와 config 존재 여부로 판별)
      if (response && response.status !== undefined && response.config !== undefined) {
        data.value = response.data
      } else {
        // apiFunc에서 이미 response.data를 return했거나 일반 객체인 경우 그대로 유지
        data.value = response
      }

      return data.value
    } catch (err) {
      error.value = err
      console.error('API execution error in useApi:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 상태 초기화 함수
   */
  function reset() {
    data.value = initialData
    loading.value = false
    error.value = null
  }

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}
