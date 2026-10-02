<template>
  <v-container fluid class="pa-4 user-group-user-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$accountMultipleCheck" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">사용자 그룹별 사용자 매핑</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 그룹 사용자 관리
          </v-chip>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            :loading="isGroupLoading || isAllUserLoading || isAssignedLoading"
            v-on:click="onRefreshAll"
          >
            {{ $t('common.refresh') }}
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- 3단 분할 레이아웃 -->
    <v-row class="split-view-row" density="comfortable">
      <!-- ================= [1단] 사용자 그룹 목록 (약 25%) ================= -->
      <v-col cols="12" md="3" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column">
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-subtitle-2 font-weight-bold">사용자 그룹</span>
              <v-chip size="x-small" color="primary" variant="tonal">
                {{ userGroupList.length }}개
              </v-chip>
            </div>

            <!-- 공장 선택 셀렉트박스 -->
            <v-select
              v-model="selectedFactory"
              :items="factoryList"
              label="공장 선택"
              variant="outlined"
              density="compact"
              hide-details
              v-on:update:model-value="onFactoryChange"
            ></v-select>
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- 그룹 목록 스크롤 영역 -->
          <div class="panel-scroll-area flex-grow-1">
            <div v-if="isGroupLoading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <div
              v-else-if="userGroupList.length === 0"
              class="text-center py-8 text-medium-emphasis"
            >
              <v-icon icon="$accountGroup" size="36" color="disabled" class="mb-2" />
              <div class="text-caption">등록된 사용자 그룹이 없습니다.</div>
            </div>

            <div v-else class="group-card-list">
              <div
                v-for="group in userGroupList"
                :key="group.id"
                class="group-list-item pa-3 mb-2 rounded-lg cursor-pointer"
                :class="{ 'active-group': selectedGroup && selectedGroup.id === group.id }"
                v-on:click="selectUserGroup(group)"
              >
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="font-weight-bold text-body-2 text-truncate">
                    {{ group.userGroupName }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="
                      group.useState === 'USE' || group.useState === 'ACTIVE' ? 'success' : 'grey'
                    "
                    variant="flat"
                  >
                    {{
                      group.useState === 'USE' || group.useState === 'ACTIVE' ? '사용' : '미사용'
                    }}
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  {{ group.description || '설명 없음' }}
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- ================= [2단] 선택 그룹 소속 사용자 목록 (약 35~40%) ================= -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column">
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <div>
                <span class="text-subtitle-2 font-weight-bold text-primary">
                  [{{ selectedGroup ? selectedGroup.userGroupName : '그룹 미선택' }}]
                </span>
                <span class="text-subtitle-2 font-weight-bold ml-1">소속 사용자</span>
              </div>
              <v-chip size="x-small" color="primary" variant="flat">
                {{ assignedUsers.length }}명
              </v-chip>
            </div>

            <div class="d-flex align-center justify-space-between">
              <v-text-field
                v-model="assignedSearchKeyword"
                placeholder="사번 / 성명 검색"
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="$magnify"
                class="mr-2"
              ></v-text-field>
              <v-btn
                color="primary"
                variant="elevated"
                size="small"
                prepend-icon="$contentSave"
                class="font-weight-bold"
                :disabled="!selectedGroup || !isModified"
                :loading="isSaving"
                v-on:click="onOpenSaveConfirm"
              >
                저장
              </v-btn>
            </div>
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- 소속 유저 테이블 (선택 후 우측으로 제외 가능) -->
          <div class="panel-scroll-area flex-grow-1">
            <div v-if="isAssignedLoading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <v-table v-else density="compact" hover class="custom-user-table">
              <thead>
                <tr>
                  <th style="width: 40px">
                    <v-checkbox-btn
                      :model-value="isAllAssignedSelected"
                      density="compact"
                      v-on:update:model-value="toggleAllAssignedSelection"
                    />
                  </th>
                  <th class="text-center" style="width: 100px">사번</th>
                  <th class="text-start">성명</th>
                  <th class="text-start">부서</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredAssignedUsers.length === 0">
                  <td colspan="4" class="text-center py-8 text-medium-emphasis text-caption">
                    소속된 사용자가 없습니다.
                  </td>
                </tr>
                <tr
                  v-for="user in filteredAssignedUsers"
                  :key="user.userId"
                  class="cursor-pointer"
                  :class="{ 'selected-row': selectedAssignedIds.indexOf(user.userId) !== -1 }"
                  v-on:click="toggleAssignedUser(user.userId)"
                >
                  <td v-on:click.stop>
                    <v-checkbox-btn
                      :model-value="selectedAssignedIds.indexOf(user.userId) !== -1"
                      density="compact"
                      v-on:update:model-value="toggleAssignedUser(user.userId)"
                    />
                  </td>
                  <td class="text-center font-weight-bold text-primary">
                    {{ user.employeeId || user.userId }}
                  </td>
                  <td class="text-start font-weight-medium">{{ user.userName }}</td>
                  <td class="text-start text-caption text-medium-emphasis">
                    {{ user.departmentName || '-' }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card>
      </v-col>

      <!-- ================= [중앙] 이동 조작 버튼 컬럼 ================= -->
      <div
        class="transfer-btn-column d-none d-md-flex flex-column align-center justify-center px-1"
      >
        <!-- 우측에서 좌측으로 추가 -->
        <v-btn
          icon="$chevronLeft"
          color="primary"
          variant="elevated"
          size="small"
          class="mb-3"
          :disabled="!selectedGroup || selectedAvailableIds.length === 0"
          title="그룹에 추가"
          v-on:click="assignSelectedUsers"
        ></v-btn>

        <!-- 좌측에서 우측으로 제외 -->
        <v-btn
          icon="$chevronRight"
          color="secondary"
          variant="elevated"
          size="small"
          :disabled="!selectedGroup || selectedAssignedIds.length === 0"
          title="그룹에서 제외"
          v-on:click="removeSelectedUsers"
        ></v-btn>
      </div>

      <!-- ================= [3단] 전체 사용자 풀 (약 35~40%) ================= -->
      <v-col cols="12" md="4" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column">
          <div class="panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-subtitle-2 font-weight-bold">전체 사용자 목록</span>
              <v-chip size="x-small" color="secondary" variant="tonal">
                미소속 {{ filteredAvailableUsers.length }}명
              </v-chip>
            </div>

            <v-text-field
              v-model="allUserSearchKeyword"
              placeholder="사번 / 성명 / 부서 검색"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
            ></v-text-field>
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- 전체 유저 테이블 (선택 후 좌측으로 추가 가능) -->
          <div class="panel-scroll-area flex-grow-1">
            <div v-if="isAllUserLoading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <v-table v-else density="compact" hover class="custom-user-table">
              <thead>
                <tr>
                  <th style="width: 40px">
                    <v-checkbox-btn
                      :model-value="isAllAvailableSelected"
                      density="compact"
                      v-on:update:model-value="toggleAllAvailableSelection"
                    />
                  </th>
                  <th class="text-center" style="width: 100px">사번</th>
                  <th class="text-start">성명</th>
                  <th class="text-start">부서</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredAvailableUsers.length === 0">
                  <td colspan="4" class="text-center py-8 text-medium-emphasis text-caption">
                    추가 가능한 사용자가 없습니다.
                  </td>
                </tr>
                <tr
                  v-for="user in filteredAvailableUsers"
                  :key="user.userId"
                  class="cursor-pointer"
                  :class="{ 'selected-row': selectedAvailableIds.indexOf(user.userId) !== -1 }"
                  v-on:click="toggleAvailableUser(user.userId)"
                >
                  <td v-on:click.stop>
                    <v-checkbox-btn
                      :model-value="selectedAvailableIds.indexOf(user.userId) !== -1"
                      density="compact"
                      v-on:update:model-value="toggleAvailableUser(user.userId)"
                    />
                  </td>
                  <td class="text-center font-weight-bold">
                    {{ user.employeeId || user.userId }}
                  </td>
                  <td class="text-start font-weight-medium">{{ user.userName }}</td>
                  <td class="text-start text-caption text-medium-emphasis">
                    {{ user.departmentName || '-' }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 저장 확인 다이얼로그 -->
    <ConfirmDialog
      v-model="saveConfirmDialog"
      title="사용자 그룹 매핑 저장"
      :message="saveConfirmMessage"
      confirm-text="저장"
      confirm-color="primary"
      v-on:confirm="onConfirmSave"
    />

    <!-- 스낵바 알림 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" size="small" v-on:click="snackbar.show = false">닫기</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { fetchUserGroupsApi } from '@/api/userGroup'
import { fetchUsersApi } from '@/api/user'
import { fetchUsersByUserGroupIdApi, saveBatchUserGroupUsersApi } from '@/api/userGroupUser'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const factoryList = ['INSERT', 'POWDER', 'COMMON']
const selectedFactory = ref('INSERT')

// 1단: 그룹 상태
const userGroupList = ref([])
const selectedGroup = ref(null)

// 2단: 선택 그룹 소속 유저 목록 및 원본 스냅샷 (배열로 관리)
const assignedUsers = ref([])
const originalAssignedMembers = ref([]) // 원본 UserGroupMemberResponse 목록
const selectedAssignedIds = ref([])
const assignedSearchKeyword = ref('')

// 3단: 전체 유저 목록 및 선택 상태
const allUserList = ref([])
const selectedAvailableIds = ref([])
const allUserSearchKeyword = ref('')

// 저장 모달 및 알림 상태
const saveConfirmDialog = ref(false)
const saveConfirmMessage = ref('')
const snackbar = reactive({ show: false, message: '', color: 'success' })

// API 바인딩
const { loading: isGroupLoading, execute: executeFetchGroups } = useApi(fetchUserGroupsApi)
const { loading: isAllUserLoading, execute: executeFetchAllUsers } = useApi(fetchUsersApi)
const { loading: isAssignedLoading, execute: executeFetchAssignedUsers } = useApi(
  fetchUsersByUserGroupIdApi,
)
const { loading: isSaving, execute: executeSaveBatch } = useApi(saveBatchUserGroupUsersApi)

function showNotification(msg, color) {
  snackbar.message = msg
  snackbar.color = color || 'success'
  snackbar.show = true
}

// 응답 객체에서 순수 배열(Content)을 안전하게 추출하는 헬퍼 함수
function extractArrayFromResponse(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (res.data) {
    if (Array.isArray(res.data)) return res.data
    if (res.data.content && Array.isArray(res.data.content)) return res.data.content
  }
  if (res.content && Array.isArray(res.content)) return res.content
  return []
}

// 변경 여부 계산
const isModified = computed(function () {
  if (assignedUsers.value.length !== originalAssignedMembers.value.length) {
    return true
  }
  const currentSet = {}
  for (let i = 0; i < assignedUsers.value.length; i++) {
    currentSet[String(assignedUsers.value[i].userId)] = true
  }
  for (let i = 0; i < originalAssignedMembers.value.length; i++) {
    if (!currentSet[String(originalAssignedMembers.value[i].userId)]) {
      return true
    }
  }
  return false
})

// 2단 필터링 목록
const filteredAssignedUsers = computed(function () {
  const kw = assignedSearchKeyword.value.trim().toLowerCase()
  if (!kw) return assignedUsers.value

  const result = []
  for (let i = 0; i < assignedUsers.value.length; i++) {
    const u = assignedUsers.value[i]
    const empId = u.employeeId ? String(u.employeeId).toLowerCase() : ''
    const uId = u.userId ? String(u.userId).toLowerCase() : ''
    const uName = u.userName ? String(u.userName).toLowerCase() : ''
    const dept = u.departmentName ? String(u.departmentName).toLowerCase() : ''

    if (
      empId.indexOf(kw) !== -1 ||
      uId.indexOf(kw) !== -1 ||
      uName.indexOf(kw) !== -1 ||
      dept.indexOf(kw) !== -1
    ) {
      result.push(u)
    }
  }
  return result
})

// 3단 필터링 목록 (소속된 유저는 우측 풀에서 제외)
const filteredAvailableUsers = computed(function () {
  const assignedMap = {}
  for (let i = 0; i < assignedUsers.value.length; i++) {
    assignedMap[String(assignedUsers.value[i].userId)] = true
  }

  const kw = allUserSearchKeyword.value.trim().toLowerCase()
  const result = []

  for (let i = 0; i < allUserList.value.length; i++) {
    const u = allUserList.value[i]
    if (!assignedMap[String(u.userId)]) {
      const empId = u.employeeId ? String(u.employeeId).toLowerCase() : ''
      const uId = u.userId ? String(u.userId).toLowerCase() : ''
      const uName = u.userName ? String(u.userName).toLowerCase() : ''
      const dept = u.departmentName ? String(u.departmentName).toLowerCase() : ''

      if (!kw) {
        result.push(u)
      } else if (
        empId.indexOf(kw) !== -1 ||
        uId.indexOf(kw) !== -1 ||
        uName.indexOf(kw) !== -1 ||
        dept.indexOf(kw) !== -1
      ) {
        result.push(u)
      }
    }
  }
  return result
})

// 전체 체크박스 연동
const isAllAssignedSelected = computed(function () {
  return (
    filteredAssignedUsers.value.length > 0 &&
    selectedAssignedIds.value.length === filteredAssignedUsers.value.length
  )
})

const isAllAvailableSelected = computed(function () {
  return (
    filteredAvailableUsers.value.length > 0 &&
    selectedAvailableIds.value.length === filteredAvailableUsers.value.length
  )
})

function toggleAllAssignedSelection() {
  if (isAllAssignedSelected.value) {
    selectedAssignedIds.value = []
  } else {
    const ids = []
    for (let i = 0; i < filteredAssignedUsers.value.length; i++) {
      ids.push(filteredAssignedUsers.value[i].userId)
    }
    selectedAssignedIds.value = ids
  }
}

function toggleAllAvailableSelection() {
  if (isAllAvailableSelected.value) {
    selectedAvailableIds.value = []
  } else {
    const ids = []
    for (let i = 0; i < filteredAvailableUsers.value.length; i++) {
      ids.push(filteredAvailableUsers.value[i].userId)
    }
    selectedAvailableIds.value = ids
  }
}

function toggleAssignedUser(userId) {
  const idx = selectedAssignedIds.value.indexOf(userId)
  if (idx === -1) {
    selectedAssignedIds.value.push(userId)
  } else {
    selectedAssignedIds.value.splice(idx, 1)
  }
}

function toggleAvailableUser(userId) {
  const idx = selectedAvailableIds.value.indexOf(userId)
  if (idx === -1) {
    selectedAvailableIds.value.push(userId)
  } else {
    selectedAvailableIds.value.splice(idx, 1)
  }
}

// ◄ 추가 (우측 풀에서 좌측 소속 목록으로 복사/이동)
function assignSelectedUsers() {
  const targetMap = {}
  for (let i = 0; i < selectedAvailableIds.value.length; i++) {
    targetMap[String(selectedAvailableIds.value[i])] = true
  }

  const added = []
  for (let i = 0; i < allUserList.value.length; i++) {
    if (targetMap[String(allUserList.value[i].userId)]) {
      added.push(allUserList.value[i])
    }
  }

  // assignedUsers가 항상 배열임을 보장하며 병합
  assignedUsers.value = assignedUsers.value.concat(added)
  selectedAvailableIds.value = []
}

// ► 제외 (좌측 소속 목록에서 우측 풀로 이동)
function removeSelectedUsers() {
  const targetMap = {}
  for (let i = 0; i < selectedAssignedIds.value.length; i++) {
    targetMap[String(selectedAssignedIds.value[i])] = true
  }

  const remaining = []
  for (let i = 0; i < assignedUsers.value.length; i++) {
    if (!targetMap[String(assignedUsers.value[i].userId)]) {
      remaining.push(assignedUsers.value[i])
    }
  }

  assignedUsers.value = remaining
  selectedAssignedIds.value = []
}

// [API 1] 사용자 그룹 목록 조회
async function loadUserGroups() {
  try {
    const res = await executeFetchGroups({ page: 0, size: 100, factoryName: selectedFactory.value })
    const list = extractArrayFromResponse(res)
    userGroupList.value = list

    if (list.length > 0) {
      selectUserGroup(list[0])
    } else {
      selectedGroup.value = null
      assignedUsers.value = []
      originalAssignedMembers.value = []
    }
  } catch (err) {
    console.error('Fetch user groups error:', err)
  }
}

// [API 2] 전체 사용자 목록 풀 조회
async function loadAllUsers() {
  try {
    const res = await executeFetchAllUsers({
      page: 0,
      size: 2000,
      factoryName: selectedFactory.value,
    })
    const rawList = extractArrayFromResponse(res)

    // UserGroupMemberResponse 필드 규격에 맞게 통일화
    const normalized = []
    for (let i = 0; i < rawList.length; i++) {
      const u = rawList[i]
      if (u) {
        normalized.push({
          userId: u.id || u.userId, // TSID 식별자
          employeeId: u.userId || u.employeeId || '', // 사번
          userName: u.userName || '',
          departmentName: u.departmentName || '',
          factoryName: u.factoryName || selectedFactory.value,
        })
      }
    }
    allUserList.value = normalized
  } catch (err) {
    console.error('Fetch all users error:', err)
  }
}

// [API 3] 선택 그룹의 소속 유저 조회
async function selectUserGroup(group) {
  if (!group) return
  selectedGroup.value = group
  selectedAssignedIds.value = []
  selectedAvailableIds.value = []

  try {
    const res = await executeFetchAssignedUsers(group.id, { page: 0, size: 2000 })
    // Page<UserGroupMemberResponse>에서 content 배열만 안전하게 추출
    const list = extractArrayFromResponse(res)

    assignedUsers.value = list.slice()
    originalAssignedMembers.value = list.slice() // 원본 스냅샷 보관
  } catch (err) {
    console.error('Fetch assigned users error:', err)
    assignedUsers.value = []
    originalAssignedMembers.value = []
  }
}

function onFactoryChange() {
  loadUserGroups()
  loadAllUsers()
}

function onRefreshAll() {
  loadUserGroups()
  loadAllUsers()
}

function onOpenSaveConfirm() {
  saveConfirmMessage.value =
    '[' +
    selectedGroup.value.userGroupName +
    '] 그룹의 사용자 매핑 정보(' +
    assignedUsers.value.length +
    '명)를 저장하시겠습니까?'
  saveConfirmDialog.value = true
}

// [API 4] 일괄 저장 실행
async function onConfirmSave() {
  if (!selectedGroup.value) return

  try {
    const targetUserIds = []
    for (let i = 0; i < assignedUsers.value.length; i++) {
      targetUserIds.push(assignedUsers.value[i].userId)
    }

    // saveBatchUserGroupUsersApi 스펙에 맞춘 옵션 전달
    await executeSaveBatch({
      userGroupId: selectedGroup.value.id,
      factoryName: selectedFactory.value,
      currentUserGroupMembers: originalAssignedMembers.value,
      userIdList: targetUserIds,
      eventUser: 'aim',
    })

    showNotification('사용자 그룹 매핑이 성공적으로 저장되었습니다.', 'success')
    // 저장 후 최신 데이터 재조회
    await selectUserGroup(selectedGroup.value)
  } catch (err) {
    console.error('Save user group users failed:', err)
    showNotification('저장 중 오류가 발생했습니다.', 'error')
  }
}

onMounted(function () {
  loadUserGroups()
  loadAllUsers()
})
</script>

<style scoped>
.user-group-user-container {
  max-width: 100%;
}

.split-view-row {
  min-height: calc(100vh - 170px);
}

.panel-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 8px;
}

.panel-scroll-area {
  max-height: calc(100vh - 290px);
  overflow-y: auto;
}

.group-list-item {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #fafafa;
  transition: all 0.15s ease-in-out;
}

.group-list-item:hover {
  background-color: rgba(46, 125, 50, 0.06);
  border-color: rgba(46, 125, 50, 0.3);
}

.active-group {
  background-color: rgba(46, 125, 50, 0.12) !important;
  border-color: #2e7d32 !important;
  border-left: 4px solid #2e7d32 !important;
}

.transfer-btn-column {
  width: 44px;
}

.custom-user-table {
  border: 1px solid #e0e0e0;
}

.selected-row {
  background-color: rgba(33, 150, 243, 0.08) !important;
}
</style>
