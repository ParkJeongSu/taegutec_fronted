// src/api/wcsConveyor.js
import axiosInstance from '@/api/index'

/**
 * WCS 컨베이어 목록 조회
 * @param {Object} params - { page, size, factoryName, conveyorGroup, conveyorName, conveyorStatus, useState, ... }
 */
export function fetchWcsConveyorsApi(params) {
  return axiosInstance.get('/v1/wcs/conveyor', { params: params })
}

/**
 * WCS 컨베이어 단건 상세 조회 (5개 복합키: factoryName, conveyorGroup, conveyorName, conveyorNumber, localNo)
 * @param {string} factoryName
 * @param {string} conveyorGroup
 * @param {string} conveyorName
 * @param {number|string} conveyorNumber
 * @param {number|string} localNo
 */
export function fetchWcsConveyorByIdApi(factoryName, conveyorGroup, conveyorName, conveyorNumber, localNo) {
  const path =
    '/v1/wcs/conveyor/' +
    encodeURIComponent(factoryName) +
    '/' +
    encodeURIComponent(conveyorGroup) +
    '/' +
    encodeURIComponent(conveyorName) +
    '/' +
    conveyorNumber +
    '/' +
    localNo
  return axiosInstance.get(path)
}

/**
 * WCS 컨베이어 신규 등록
 * @param {Object} payload
 */
export function createWcsConveyorApi(payload) {
  return axiosInstance.post('/v1/wcs/conveyor', payload)
}

/**
 * WCS 컨베이어 단건 수정 (5개 복합키: factoryName, conveyorGroup, conveyorName, conveyorNumber, localNo)
 * @param {string} factoryName
 * @param {string} conveyorGroup
 * @param {string} conveyorName
 * @param {number|string} conveyorNumber
 * @param {number|string} localNo
 * @param {Object} payload
 */
export function updateWcsConveyorApi(
  factoryName,
  conveyorGroup,
  conveyorName,
  conveyorNumber,
  localNo,
  payload,
) {
  const path =
    '/v1/wcs/conveyor/' +
    encodeURIComponent(factoryName) +
    '/' +
    encodeURIComponent(conveyorGroup) +
    '/' +
    encodeURIComponent(conveyorName) +
    '/' +
    conveyorNumber +
    '/' +
    localNo
  return axiosInstance.put(path, payload)
}

/**
 * WCS 컨베이어 단건 삭제 (5개 복합키: factoryName, conveyorGroup, conveyorName, conveyorNumber, localNo)
 * @param {string} factoryName
 * @param {string} conveyorGroup
 * @param {string} conveyorName
 * @param {number|string} conveyorNumber
 * @param {number|string} localNo
 * @param {Object} [params]
 */
export function deleteWcsConveyorApi(
  factoryName,
  conveyorGroup,
  conveyorName,
  conveyorNumber,
  localNo,
  params,
) {
  const path =
    '/v1/wcs/conveyor/' +
    encodeURIComponent(factoryName) +
    '/' +
    encodeURIComponent(conveyorGroup) +
    '/' +
    encodeURIComponent(conveyorName) +
    '/' +
    conveyorNumber +
    '/' +
    localNo
  return axiosInstance.delete(path, { params: params })
}
