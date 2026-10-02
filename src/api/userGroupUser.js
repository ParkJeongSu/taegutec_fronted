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
 * [프론트 편의 함수] 3단 화면 일괄 저장용 헬퍼 함수
 * 선택된 유저 목록과 기존 소속 목록의 차집합을 계산하여, 신규 대상은 POST 등록하고 제외 대상은 batch-delete 삭제를 수행합니다.
 * @param {Object} options - { userGroupId, factoryName, currentUserGroupMembers: Array<UserGroupMemberResponse>, targetUserIds: Array<number|string>, eventUser: string }
 */
export async function saveBatchUserGroupUsersApi(options) {
  const userGroupId = options.userGroupId
  const factoryName = options.factoryName || 'INSERT'
  const currentMembers = options.currentUserGroupMembers || []
  const targetUserIds = options.targetUserIds || []
  const eventUser = options.eventUser || 'SYSTEM'

  // 1. 기존 매핑 맵 생성 (userId -> mappingId)
  const currentMemberMap = {}
  for (let i = 0; i < currentMembers.length; i = i + 1) {
    const member = currentMembers[i]
    if (member && member.userId) {
      currentMemberMap[String(member.userId)] = member.id
    }
  }

  // 2. 목표 유저 맵 생성
  const targetUserMap = {}
  for (let i = 0; i < targetUserIds.length; i = i + 1) {
    targetUserMap[String(targetUserIds[i])] = true
  }

  // 3. 삭제 대상(기존에는 있었으나 목표 목록에서 빠진 매핑 ID들) 추출
  const idsToDelete = []
  for (let i = 0; i < currentMembers.length; i = i + 1) {
    const member = currentMembers[i]
    if (member && member.userId) {
      if (!targetUserMap[String(member.userId)]) {
        idsToDelete.push(member.id)
      }
    }
  }

  // 4. 추가 대상(목표 목록에는 있으나 기존 매핑에 없던 사용자들) 추출
  const usersToCreate = []
  for (let i = 0; i < targetUserIds.length; i = i + 1) {
    const uId = targetUserIds[i]
    if (!currentMemberMap[String(uId)]) {
      usersToCreate.push(uId)
    }
  }

  // 5. 삭제 일괄 실행
  if (idsToDelete.length > 0) {
    await deleteUserGroupMembersBatchApi(idsToDelete)
  }

  // 6. 추가 등록 순차 실행 (루프 처리)
  for (let i = 0; i < usersToCreate.length; i = i + 1) {
    await createUserGroupMemberApi({
      factoryName: factoryName,
      userGroupId: userGroupId,
      userId: usersToCreate[i],
      eventName: 'UserGroupMemberCreated',
      eventUser: eventUser,
      eventComment: 'Group assignment updated from UI',
    })
  }

  return true
}
