import axiosInstance from '@/api/index'

/**
 * 사용자-그룹 매핑 조건별 목록 조회 (페이징 지원)
 * @param {Object} params - { page, size, factoryName, userGroupId, userId, employeeId, userName, ... }
 * @returns {Promise<any>} Page<UserGroupMemberResponse>
 */
export function fetchUserGroupMembersApi(params) {
  return axiosInstance.get('/v1/mng/user-group-member', { params: params })
}

/**
 * 매핑 고유 ID(TSID) 기준 단건 상세 조회
 * @param {string|number} id - USER_GROUP_MEMBER.ID
 * @returns {Promise<any>}
 */
export function fetchUserGroupMemberByIdApi(id) {
  const path = '/v1/mng/user-group-member/' + encodeURIComponent(id)
  return axiosInstance.get(path)
}

/**
 * 특정 사용자의 소속 그룹 매핑 목록 조회
 * @param {string|number} userId - SYS_USER.ID (TSID)
 * @param {Object} [params] - { page, size }
 * @returns {Promise<any>}
 */
export function fetchMembersByUserIdApi(userId, params) {
  const path = '/v1/mng/user-group-member/by-user/' + encodeURIComponent(userId)
  return axiosInstance.get(path, { params: params })
}

/**
 * 특정 그룹의 소속 사용자 매핑 목록 조회 (3단 화면 2단 목록용)
 * @param {string|number} userGroupId - USER_GROUP.ID (TSID)
 * @param {Object} [params] - { page, size }
 * @returns {Promise<any>} Page<UserGroupMemberResponse>
 */
export function fetchUsersByUserGroupIdApi(userGroupId, params) {
  const path = '/v1/mng/user-group-member/by-group/' + encodeURIComponent(userGroupId)
  return axiosInstance.get(path, { params: params })
}

/**
 * 신규 사용자-그룹 매핑 단건 등록
 * @param {Object} payload - { factoryName, userId, userGroupId, eventName, eventUser, eventComment }
 * @returns {Promise<any>}
 */
export function createUserGroupMemberApi(payload) {
  return axiosInstance.post('/v1/mng/user-group-member', payload)
}

/**
 * 사용자-그룹 매핑 단건 수정 (TSID 기준)
 * @param {string|number} id - USER_GROUP_MEMBER.ID
 * @param {Object} payload - UserGroupMemberUpdateRequestDto
 * @returns {Promise<any>}
 */
export function updateUserGroupMemberApi(id, payload) {
  const path = '/v1/mng/user-group-member/' + encodeURIComponent(id)
  return axiosInstance.put(path, payload)
}

/**
 * 사용자-그룹 매핑 단건 삭제 (TSID 기준)
 * @param {string|number} id - USER_GROUP_MEMBER.ID
 * @param {string} [eventUser='SYSTEM']
 * @param {string} [eventComment='User group member deleted']
 * @returns {Promise<any>}
 */
export function deleteUserGroupMemberApi(id, eventUser, eventComment) {
  const path = '/v1/mng/user-group-member/' + encodeURIComponent(id)
  const params = {}
  if (eventUser) {
    params.eventUser = eventUser
  }
  if (eventComment) {
    params.eventComment = eventComment
  }
  return axiosInstance.delete(path, {
    params: Object.keys(params).length > 0 ? params : undefined,
  })
}

/**
 * 사용자-그룹 매핑 복수 벌크 삭제 (In-Batch 삭제)
 * @param {Array<string|number>} ids - 삭제할 매핑 TSID 배열 [id1, id2, ...]
 * @returns {Promise<any>}
 */
export function deleteUserGroupMembersBatchApi(ids) {
  const payload = {
    ids: ids,
  }
  return axiosInstance.delete('/v1/mng/user-group-member/batch-delete', {
    data: payload,
  })
}

/**
 * 사용자 그룹 매핑 일괄 저장 (Clear & Repopulate)
 * @param {Object} payload - { factoryName, userGroupId, userIdList, eventName, eventUser, eventComment }
 * @returns {Promise<Array<UserGroupMemberResponse>>}
 */
export function saveBatchUserGroupUsersApi(payload) {
  return axiosInstance.post('/v1/mng/user-group-member/batch-save', payload)
}
