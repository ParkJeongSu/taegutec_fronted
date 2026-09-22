<template>
  <v-container fluid class="pa-4 menu-auth-container">
    <!-- 상단 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$accountKey" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">메뉴 권한 관리 (Menu Authority)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 사용자 및 권한 &gt; 메뉴 권한
          </v-chip>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium"
            :loading="isGroupLoading || isMenuLoading"
            v-on:click="onRefreshAll"
          >
            전체 새로고침
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Master-Detail 2단 분할 레이아웃 -->
    <v-row class="split-view-row">
      <!-- [좌측 패널] 사용자 그룹 목록 (약 30~35%) -->
      <v-col cols="12" md="4" lg="4" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column">
          <div class="group-panel-header mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-subtitle-2 font-weight-bold text-high-emphasis">
                사용자 그룹 목록
              </span>
              <v-chip size="x-small" color="primary" variant="tonal">
                {{ userGroupList.length }}개 그룹
              </v-chip>
            </div>

            <!-- 공장 선택 셀렉트박스 -->
            <v-select
              v-model="selectedFactory"
              :items="factoryList"
              label="소속 공장 선택"
              variant="outlined"
              density="compact"
              hide-details
              v-on:update:model-value="onFactoryChange"
            ></v-select>
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- 사용자 그룹 리스트 -->
          <div class="group-list-scroll-area flex-grow-1">
            <div v-if="isGroupLoading" class="d-flex justify-center align-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <div v-else-if="userGroupList.length === 0" class="empty-group-state text-center py-8 text-medium-emphasis">
              <v-icon icon="$accountGroup" size="36" color="disabled" class="mb-2" />
              <div>등록된 사용자 그룹이 없습니다.</div>
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
                  <div class="d-flex align-center">
                    <v-icon
                      icon="$accountGroup"
                      size="18"
                      :color="selectedGroup && selectedGroup.id === group.id ? 'primary' : 'grey-darken-1'"
                      class="mr-2"
                    />
                    <span class="font-weight-bold group-title text-truncate">
                      {{ group.userGroupName }}
                    </span>
                  </div>
                  <v-chip
                    size="x-small"
                    :color="group.useState === 'ACTIVE' || group.useState === 'USE' ? 'success' : 'grey'"
                    variant="flat"
                    class="font-weight-medium status-badge"
                  >
                    {{ group.useState === 'ACTIVE' || group.useState === 'USE' ? '사용' : '미사용' }}
                  </v-chip>
                </div>

                <div class="group-description text-caption text-medium-emphasis text-truncate pl-6">
                  {{ group.description || '설명 없음' }}
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- [우측 패널] 메뉴 권한 매트릭스 트리 뷰 (약 65~70%) -->
      <v-col cols="12" md="8" lg="8" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column">
          <!-- 상단 툴바: 선택 그룹 안내 및 권한 조작 버튼 -->
          <div class="auth-toolbar-section mb-3">
            <div class="d-flex flex-wrap align-center justify-space-between toolbar-inner-gap">
              <div class="d-flex align-center">
                <v-icon icon="$shieldCheck" size="22" color="primary" class="mr-2" />
                <div>
                  <span class="text-subtitle-1 font-weight-bold text-high-emphasis">
                    {{ selectedGroup ? selectedGroup.userGroupName + ' 권한 설정' : '사용자 그룹을 선택해주세요' }}
                  </span>
                  <span v-if="selectedGroup" class="text-caption text-medium-emphasis ml-2">
                    (체크된 메뉴: {{ checkedMenuIds.length }}개)
                  </span>
                </div>
              </div>

              <!-- 우측 액션 버튼들 -->
              <div class="d-flex flex-wrap align-center btn-actions-gap">
                <v-btn
                  variant="text"
                  size="x-small"
                  color="primary"
                  v-on:click="expandAllNodes"
                >
                  모두 펼치기
                </v-btn>
                <v-btn
                  variant="text"
                  size="x-small"
                  color="secondary"
                  v-on:click="collapseAllNodes"
                >
                  모두 접기
                </v-btn>
                <v-btn
                  variant="tonal"
                  color="secondary"
                  size="small"
                  :disabled="!selectedGroup || menuTreeList.length === 0"
                  v-on:click="onSelectAll"
                >
                  전체 선택
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="secondary"
                  size="small"
                  :disabled="!selectedGroup || menuTreeList.length === 0"
                  v-on:click="onDeselectAll"
                >
                  전체 해제
                </v-btn>
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="small"
                  prepend-icon="$contentSave"
                  class="font-weight-bold"
                  :loading="isSaving"
                  :disabled="!selectedGroup"
                  v-on:click="handleSaveAuth"
                >
                  권한 저장
                </v-btn>
              </div>
            </div>
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- 메뉴 권한 트리 뷰 영역 -->
          <div class="auth-tree-scroll-area flex-grow-1">
            <!-- 미선택 상태 안내 -->
            <div v-if="!selectedGroup" class="empty-auth-state d-flex flex-column justify-center align-center py-12 text-medium-emphasis">
              <v-icon icon="$accountSearch" size="48" color="disabled" class="mb-3" />
              <div class="text-subtitle-1 font-weight-medium mb-1">사용자 그룹이 선택되지 않았습니다.</div>
              <div class="text-body-2 text-disabled">좌측 목록에서 권한을 설정할 사용자 그룹을 클릭하세요.</div>
            </div>

            <!-- 로딩 상태 -->
            <div v-else-if="isAuthLoading || isMenuLoading" class="d-flex justify-center align-center py-12">
              <v-progress-circular indeterminate color="primary" size="36"></v-progress-circular>
            </div>

            <!-- 메뉴 데이터 없음 -->
            <div v-else-if="menuTreeList.length === 0" class="empty-auth-state d-flex flex-column justify-center align-center py-12 text-medium-emphasis">
              <v-icon icon="$formatListBulleted" size="40" color="disabled" class="mb-2" />
              <div>등록된 메뉴 데이터가 없습니다.</div>
            </div>

            <!-- 계층형 권한 트리 본문 -->
            <div v-else class="menu-auth-tree-container">
              <!-- Level 1 Items -->
              <div v-for="node1 in menuTreeList" :key="node1.id" class="tree-branch">
                <!-- Level 1 Node Row -->
                <div class="tree-node-row level-1-row" :class="{ 'node-checked': isMenuChecked(node1.id) }">
                  <button
                    type="button"
                    class="node-toggle-btn"
                    :class="{ 'invisible-btn': !node1.children || node1.children.length === 0 }"
                    v-on:click.stop="toggleExpand(node1.id)"
                  >
                    <v-icon :icon="isExpanded(node1.id) ? '$chevronDown' : '$chevronRight'" size="18" />
                  </button>

                  <v-checkbox-btn
                    :model-value="isMenuChecked(node1.id)"
                    density="compact"
                    color="primary"
                    class="node-checkbox"
                    v-on:update:model-value="onToggleMenuAuth(node1)"
                  />

                  <v-chip size="x-small" color="primary" variant="flat" class="mr-2 font-weight-bold level-badge">
                    L1
                  </v-chip>

                  <v-icon
                    :icon="node1.iconName || (node1.children && node1.children.length > 0 ? '$folder' : '$fileDocument')"
                    size="18"
                    color="primary"
                    class="mr-2"
                  />

                  <span class="node-title font-weight-bold text-truncate flex-grow-1" v-on:click="onToggleMenuAuth(node1)">
                    {{ node1.menuName }}
                  </span>

                  <span class="node-id-caption text-caption text-disabled ml-2">
                    {{ node1.menuId }}
                  </span>
                </div>

                <!-- Level 2 Children -->
                <div v-if="isExpanded(node1.id) && node1.children && node1.children.length > 0" class="tree-sub-container">
                  <div v-for="node2 in node1.children" :key="node2.id" class="tree-branch">
                    <!-- Level 2 Node Row -->
                    <div class="tree-node-row level-2-row" :class="{ 'node-checked': isMenuChecked(node2.id) }">
                      <button
                        type="button"
                        class="node-toggle-btn"
                        :class="{ 'invisible-btn': !node2.children || node2.children.length === 0 }"
                        v-on:click.stop="toggleExpand(node2.id)"
                      >
                        <v-icon :icon="isExpanded(node2.id) ? '$chevronDown' : '$chevronRight'" size="18" />
                      </button>

                      <v-checkbox-btn
                        :model-value="isMenuChecked(node2.id)"
                        density="compact"
                        color="primary"
                        class="node-checkbox"
                        v-on:update:model-value="onToggleMenuAuth(node2)"
                      />

                      <v-chip size="x-small" color="info" variant="tonal" class="mr-2 font-weight-bold level-badge">
                        L2
                      </v-chip>

                      <v-icon
                        :icon="node2.iconName || (node2.children && node2.children.length > 0 ? '$folderOpen' : '$fileDocument')"
                        size="18"
                        color="info"
                        class="mr-2"
                      />

                      <span class="node-title font-weight-medium text-truncate flex-grow-1" v-on:click="onToggleMenuAuth(node2)">
                        {{ node2.menuName }}
                      </span>

                      <span class="node-id-caption text-caption text-disabled ml-2">
                        {{ node2.menuId }}
                      </span>
                    </div>

                    <!-- Level 3 Children -->
                    <div v-if="isExpanded(node2.id) && node2.children && node2.children.length > 0" class="tree-sub-container">
                      <div v-for="node3 in node2.children" :key="node3.id" class="tree-branch">
                        <!-- Level 3 Node Row -->
                        <div class="tree-node-row level-3-row" :class="{ 'node-checked': isMenuChecked(node3.id) }">
                          <button
                            type="button"
                            class="node-toggle-btn"
                            :class="{ 'invisible-btn': !node3.children || node3.children.length === 0 }"
                            v-on:click.stop="toggleExpand(node3.id)"
                          >
                            <v-icon :icon="isExpanded(node3.id) ? '$chevronDown' : '$chevronRight'" size="18" />
                          </button>

                          <v-checkbox-btn
                            :model-value="isMenuChecked(node3.id)"
                            density="compact"
                            color="primary"
                            class="node-checkbox"
                            v-on:update:model-value="onToggleMenuAuth(node3)"
                          />

                          <v-chip size="x-small" color="warning" variant="tonal" class="mr-2 font-weight-bold level-badge">
                            L3
                          </v-chip>

                          <v-icon
                            :icon="node3.iconName || (node3.children && node3.children.length > 0 ? '$folderOpen' : '$fileDocument')"
                            size="18"
                            color="secondary"
                            class="mr-2"
                          />

                          <span class="node-title font-weight-regular text-truncate flex-grow-1" v-on:click="onToggleMenuAuth(node3)">
                            {{ node3.menuName }}
                          </span>

                          <span class="node-id-caption text-caption text-disabled ml-2">
                            {{ node3.menuId }}
                          </span>
                        </div>

                        <!-- Level 4 Children (최하위) -->
                        <div v-if="isExpanded(node3.id) && node3.children && node3.children.length > 0" class="tree-sub-container">
                          <div v-for="node4 in node3.children" :key="node4.id" class="tree-branch">
                            <!-- Level 4 Node Row -->
                            <div class="tree-node-row level-4-row" :class="{ 'node-checked': isMenuChecked(node4.id) }">
                              <span class="leaf-spacer"></span>

                              <v-checkbox-btn
                                :model-value="isMenuChecked(node4.id)"
                                density="compact"
                                color="primary"
                                class="node-checkbox"
                                v-on:update:model-value="onToggleMenuAuth(node4)"
                              />

                              <v-chip size="x-small" color="grey" variant="flat" class="mr-2 font-weight-bold level-badge">
                                L4
                              </v-chip>

                              <v-icon
                                :icon="node4.iconName || '$fileDocument'"
                                size="16"
                                color="grey-darken-1"
                                class="mr-2"
                              />

                              <span class="node-title font-weight-regular text-truncate flex-grow-1" v-on:click="onToggleMenuAuth(node4)">
                                {{ node4.menuName }}
                              </span>

                              <span class="node-id-caption text-caption text-disabled ml-2">
                                {{ node4.menuId }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { fetchUserGroupsApi } from '@/api/userGroup'
import { fetchMenusApi } from '@/api/menu'
import { fetchMenuAuthsByGroupApi, saveBatchMenuAuthApi } from '@/api/menuAuth'

const factoryList = ['INSERT', 'POWDER', 'COMMON']
const selectedFactory = ref('INSERT')

// 사용자 그룹 및 선택 상태
const userGroupList = ref([])
const selectedGroup = ref(null)

// 메뉴 트리 및 체크 상태
const menuTreeList = ref([])
const checkedMenuIds = ref([])
const expandedNodeMap = reactive({})

// useApi 컴포저블을 활용한 비동기 통신 바인딩
const { loading: isGroupLoading, execute: executeFetchGroups } = useApi(fetchUserGroupsApi)
const { loading: isMenuLoading, execute: executeFetchMenus } = useApi(fetchMenusApi)
const { loading: isAuthLoading, execute: executeFetchAuths } = useApi(fetchMenuAuthsByGroupApi)
const { loading: isSaving, execute: executeSaveAuth } = useApi(saveBatchMenuAuthApi)

/**
 * 1차원 평면 배열을 계층형 트리 구조로 변환하는 함수
 * (화살표 함수 없이 명시적 for 루프 및 객체 참조 맵 활용)
 * @param {Array} list - 백엔드에서 수신한 평면 메뉴 목록
 * @returns {Array} 트리 구조 배열
 */
function buildMenuTree(list) {
  if (!list || !Array.isArray(list) || list.length === 0) {
    return []
  }

  const nodeMap = {}
  const treeRoots = []

  // 1차 패스: 모든 노드를 정제하여 nodeMap에 등록
  for (let i = 0; i < list.length; i = i + 1) {
    const rawItem = list[i]
    if (rawItem) {
      const node = {
        id: rawItem.id || rawItem.menuId,
        menuId: rawItem.menuId || '',
        menuName: rawItem.menuName || rawItem.name || '',
        factoryName: rawItem.factoryName || 'INSERT',
        parentId: rawItem.parentId || null,
        parentMenuName: rawItem.parentMenuName || '',
        menuLevel: Number(rawItem.menuLevel) || 1,
        filePath: rawItem.filePath || '',
        routerPath: rawItem.routerPath || '',
        iconName: rawItem.iconName || '',
        displayOrder: Number(rawItem.displayOrder) || i + 1,
        isVisible: rawItem.isVisible || 'Y',
        useState: rawItem.useState || rawItem.status || 'ACTIVE',
        children: [],
      }
      nodeMap[node.id] = node
      if (rawItem.menuId && String(rawItem.menuId) !== String(node.id)) {
        nodeMap[rawItem.menuId] = node
      }
    }
  }

  // 2차 패스: 부모-자식 계층 연결
  for (let i = 0; i < list.length; i = i + 1) {
    const rawItem = list[i]
    if (rawItem) {
      const currentId = rawItem.id || rawItem.menuId
      const node = nodeMap[currentId]
      if (node) {
        const parentId = node.parentId
        if (parentId && nodeMap[parentId]) {
          nodeMap[parentId].children.push(node)
        } else {
          treeRoots.push(node)
        }
      }
    }
  }

  // 3차 정렬: 각 레벨별 displayOrder 기준 오름차순 정렬
  function sortChildren(nodes) {
    for (let i = 0; i < nodes.length - 1; i = i + 1) {
      for (let j = 0; j < nodes.length - 1 - i; j = j + 1) {
        const orderA = nodes[j].displayOrder !== undefined ? Number(nodes[j].displayOrder) : 0
        const orderB = nodes[j + 1].displayOrder !== undefined ? Number(nodes[j + 1].displayOrder) : 0
        if (orderA > orderB) {
          const temp = nodes[j]
          nodes[j] = nodes[j + 1]
          nodes[j + 1] = temp
        }
      }
    }
    for (let i = 0; i < nodes.length; i = i + 1) {
      if (nodes[i].children && nodes[i].children.length > 0) {
        sortChildren(nodes[i].children)
      }
    }
  }

  sortChildren(treeRoots)
  return treeRoots
}

/**
 * 공장 기준 사용자 그룹 목록 조회
 */
async function loadUserGroups() {
  try {
    const params = {
      page: 0,
      size: 100,
      factoryName: selectedFactory.value,
    }
    const response = await executeFetchGroups(params)
    let list = []

    if (response) {
      if (response.data && Array.isArray(response.data.content)) {
        list = response.data.content
      } else if (response.content && Array.isArray(response.content)) {
        list = response.content
      } else if (response.data && Array.isArray(response.data)) {
        list = response.data
      } else if (Array.isArray(response)) {
        list = response
      }
    }

    userGroupList.value = list

    // 그룹 목록이 변경되었을 때 기존 선택 유지 또는 첫 번째 그룹 자동 선택
    if (list.length > 0) {
      let matched = null
      if (selectedGroup.value) {
        for (let i = 0; i < list.length; i = i + 1) {
          if (String(list[i].id) === String(selectedGroup.value.id)) {
            matched = list[i]
            break
          }
        }
      }
      selectUserGroup(matched || list[0])
    } else {
      selectedGroup.value = null
      checkedMenuIds.value = []
    }
  } catch (error) {
    console.error('Load user groups failed:', error)
    userGroupList.value = []
    selectedGroup.value = null
    checkedMenuIds.value = []
  }
}

/**
 * 전체 메뉴 목록 조회 및 트리 구성
 */
async function loadMenus() {
  try {
    const params = {
      page: 0,
      size: 300,
      factoryName: selectedFactory.value,
    }
    const response = await executeFetchMenus(params)
    let list = []

    if (response) {
      if (response.data && Array.isArray(response.data.content)) {
        list = response.data.content
      } else if (response.content && Array.isArray(response.content)) {
        list = response.content
      } else if (response.data && Array.isArray(response.data)) {
        list = response.data
      } else if (Array.isArray(response)) {
        list = response
      }
    }

    menuTreeList.value = buildMenuTree(list)

    // 1~2레벨 노드 기본 펼침 처리
    for (let i = 0; i < menuTreeList.value.length; i = i + 1) {
      expandedNodeMap[menuTreeList.value[i].id] = true
      if (menuTreeList.value[i].children) {
        for (let j = 0; j < menuTreeList.value[i].children.length; j = j + 1) {
          expandedNodeMap[menuTreeList.value[i].children[j].id] = true
        }
      }
    }
  } catch (error) {
    console.error('Load menus failed:', error)
    menuTreeList.value = []
  }
}

/**
 * 사용자 그룹 선택 시 해당 그룹의 메뉴 권한 조회 및 체크 목록 바인딩
 * @param {Object} group - 선택된 사용자 그룹
 */
async function selectUserGroup(group) {
  if (!group) {
    selectedGroup.value = null
    checkedMenuIds.value = []
    return
  }

  selectedGroup.value = group

  try {
    const response = await executeFetchAuths(group.id)
    let authItems = []

    if (response) {
      if (response.data && Array.isArray(response.data)) {
        authItems = response.data
      } else if (Array.isArray(response)) {
        authItems = response
      } else if (response.content && Array.isArray(response.content)) {
        authItems = response.content
      } else if (response.authList && Array.isArray(response.authList)) {
        authItems = response.authList
      }
    }

    const ids = []
    for (let i = 0; i < authItems.length; i = i + 1) {
      const item = authItems[i]
      if (item) {
        // 객체 형태({ menuId: '...' }) 또는 단순 문자열 ID 지원
        const menuId = item.menuId || item.id || item
        if (menuId) {
          ids.push(menuId)
        }
      }
    }

    checkedMenuIds.value = ids
  } catch (error) {
    console.error('Fetch group menu auths failed:', error)
    checkedMenuIds.value = []
  }
}

function onFactoryChange() {
  selectedGroup.value = null
  checkedMenuIds.value = []
  loadUserGroups()
  loadMenus()
}

function onRefreshAll() {
  loadUserGroups()
  loadMenus()
}

// 트리 노드 펼침/접힘 제어 함수
function isExpanded(nodeId) {
  return !!expandedNodeMap[nodeId]
}

function toggleExpand(nodeId) {
  expandedNodeMap[nodeId] = !expandedNodeMap[nodeId]
}

function expandAllNodes() {
  function expandRecursive(nodes) {
    for (let i = 0; i < nodes.length; i = i + 1) {
      expandedNodeMap[nodes[i].id] = true
      if (nodes[i].children && nodes[i].children.length > 0) {
        expandRecursive(nodes[i].children)
      }
    }
  }
  expandRecursive(menuTreeList.value)
}

function collapseAllNodes() {
  const keys = Object.keys(expandedNodeMap)
  for (let i = 0; i < keys.length; i = i + 1) {
    expandedNodeMap[keys[i]] = false
  }
}

// 체크 여부 판정 함수
function isMenuChecked(nodeId) {
  for (let i = 0; i < checkedMenuIds.value.length; i = i + 1) {
    if (String(checkedMenuIds.value[i]) === String(nodeId)) {
      return true
    }
  }
  return false
}

/**
 * 특정 노드와 하위 모든 자식 노드의 ID 목록을 수집하는 재귀 함수
 * @param {Object} node - 대상 메뉴 노드
 * @param {Array} resultList - ID를 누적할 배열
 */
function collectAllDescendantIds(node, resultList) {
  if (!node) {
    return
  }
  resultList.push(node.id)
  if (node.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i = i + 1) {
      collectAllDescendantIds(node.children[i], resultList)
    }
  }
}

/**
 * 특정 노드의 체크박스 토글 핸들러 (Cascade Check 지원)
 * @param {Object} node - 토글된 메뉴 노드
 */
function onToggleMenuAuth(node) {
  if (!node || !selectedGroup.value) {
    return
  }

  const isCurrentlyChecked = isMenuChecked(node.id)
  const targetCheckState = !isCurrentlyChecked

  // 대상 노드 및 모든 하위 자식 노드들의 ID 수집
  const affectedIds = []
  collectAllDescendantIds(node, affectedIds)

  if (targetCheckState) {
    // 체크 활성화: affectedIds 중 checkedMenuIds에 없는 ID들을 추가
    for (let i = 0; i < affectedIds.length; i = i + 1) {
      const idToAdd = affectedIds[i]
      let exists = false
      for (let j = 0; j < checkedMenuIds.value.length; j = j + 1) {
        if (String(checkedMenuIds.value[j]) === String(idToAdd)) {
          exists = true
          break
        }
      }
      if (!exists) {
        checkedMenuIds.value.push(idToAdd)
      }
    }
  } else {
    // 체크 해제: affectedIds에 포함된 ID들을 checkedMenuIds에서 제거
    const newCheckedList = []
    for (let i = 0; i < checkedMenuIds.value.length; i = i + 1) {
      const currentId = checkedMenuIds.value[i]
      let shouldRemove = false
      for (let j = 0; j < affectedIds.length; j = j + 1) {
        if (String(affectedIds[j]) === String(currentId)) {
          shouldRemove = true
          break
        }
      }
      if (!shouldRemove) {
        newCheckedList.push(currentId)
      }
    }
    checkedMenuIds.value = newCheckedList
  }
}

/**
 * 전체 메뉴 선택
 */
function onSelectAll() {
  const allIds = []
  function collectTreeIds(nodes) {
    for (let i = 0; i < nodes.length; i = i + 1) {
      allIds.push(nodes[i].id)
      if (nodes[i].children && nodes[i].children.length > 0) {
        collectTreeIds(nodes[i].children)
      }
    }
  }
  collectTreeIds(menuTreeList.value)
  checkedMenuIds.value = allIds
}

/**
 * 전체 메뉴 선택 해제
 */
function onDeselectAll() {
  checkedMenuIds.value = []
}

/**
 * 메뉴 권한 일괄 저장
 */
async function handleSaveAuth() {
  if (!selectedGroup.value) {
    alert('권한을 설정할 사용자 그룹을 먼저 선택해주세요.')
    return
  }

  try {
    const authList = []
    for (let i = 0; i < checkedMenuIds.value.length; i = i + 1) {
      authList.push({
        menuId: checkedMenuIds.value[i],
        authSelect: 'Y',
        authSave: 'Y',
        authDelete: 'Y',
      })
    }

    const payload = {
      userGroupId: selectedGroup.value.id,
      factoryName: selectedFactory.value !== '전체' ? selectedFactory.value : (selectedGroup.value.factoryName || 'INSERT'),
      authList: authList,
      eventUser: 'SYSTEM',
      eventComment: 'Menu auth batch updated',
    }

    await executeSaveAuth(payload)
    alert('[' + selectedGroup.value.userGroupName + '] 그룹의 메뉴 권한이 성공적으로 저장되었습니다.')
  } catch (error) {
    console.error('Save menu auth failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '메뉴 권한 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

onMounted(function () {
  loadUserGroups()
  loadMenus()
})
</script>

<style scoped>
.menu-auth-container {
  max-width: 100%;
}
.header-action-gap {
  gap: 8px;
}
.split-view-row {
  min-height: calc(100vh - 170px);
}
.group-panel-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 8px;
}
.group-list-scroll-area {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: 4px;
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
.group-title {
  font-size: 14px;
}
.status-badge {
  font-size: 10px !important;
  height: 18px !important;
}
.auth-toolbar-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 8px;
}
.toolbar-inner-gap {
  gap: 12px;
}
.btn-actions-gap {
  gap: 8px;
}
.auth-tree-scroll-area {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: 4px;
}
.menu-auth-tree-container {
  display: flex;
  flex-direction: column;
}
.tree-branch {
  position: relative;
}
.tree-node-row {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background-color 0.15s ease-in-out;
  user-select: none;
}
.tree-node-row:hover {
  background-color: rgba(46, 125, 50, 0.06);
}
.node-checked {
  background-color: rgba(46, 125, 50, 0.05);
}
.node-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}
.invisible-btn {
  visibility: hidden;
}
.node-checkbox {
  margin-right: 4px;
}
.leaf-spacer {
  display: inline-block;
  width: 20px;
}
.level-badge {
  font-size: 10px !important;
  height: 18px !important;
  padding: 0 4px !important;
}
.tree-sub-container {
  padding-left: 20px;
  border-left: 1px dashed rgba(0, 0, 0, 0.12);
  margin-left: 10px;
}
.node-title {
  font-size: 13px;
  cursor: pointer;
}
.node-id-caption {
  font-size: 11px;
}
.empty-auth-state,
.empty-group-state {
  min-height: 200px;
}
</style>
