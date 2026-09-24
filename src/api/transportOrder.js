// src/api/transportOrder.js
import axiosInstance from '@/api/index'

/**
 * WorkStation별 최신 Transport Order 목록 조회
 * @param {Object} params - { 'work-station-id': string, 'transport-type': string, limit: number }
 */
export function fetchRecentTransportOrdersApi(params) {
  return axiosInstance.get('/v1/mng/transport-order/recent', { params: params })
}
