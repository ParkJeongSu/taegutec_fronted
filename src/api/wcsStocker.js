// src/api/wcsStocker.js
import axiosInstance from '@/api/index' // 프로젝트의 axios 공통 인스턴스

/**
 * WCS 스토커 목록 조회
 * @param {Object} params - { page, size, stockerName, areaName, ... }
 */
export function fetchWcsStockersApi(params) {
  return axiosInstance.get('/v1/wcs/stocker', { params: params })
}
