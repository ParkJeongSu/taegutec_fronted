<template>
  <v-container fluid class="pa-4 menu-mgmt-container">
    <!-- 상단 페이지 헤더 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4">
      <div class="d-flex flex-wrap align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="$formatListBulleted" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis"
            >메뉴 관리 (Menu Management)</span
          >
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 사용자 및 권한 &gt; 메뉴 관리
          </v-chip>
        </div>

        <div class="d-flex align-center header-action-gap">
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium"
            :loading="isLoading"
            v-on:click="handleSearch"
          >
            전체 새로고침
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- 좌우 Split View 레이아웃 -->
    <v-row class="split-view-row">
      <!-- [좌측 영역] 메뉴 트리 뷰 (너비 약 35~40%) -->
      <v-col cols="12" md="5" lg="4" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column">
          <!-- 좌측 상단 툴바: 공장 선택 및 트리 조작 버튼 -->
          <div class="tree-toolbar-section mb-3">
            <v-row density="compact" class="align-center mb-2">
              <v-col cols="12">
                <v-select
                  v-model="selectedFactory"
                  :items="factoryFilterOptions"
                  label="소속 공장 필터"
                  variant="outlined"
                  density="compact"
                  hide-details
                  v-on:update:model-value="handleSearch"
                ></v-select>
              </v-col>
            </v-row>

            <div class="d-flex flex-wrap align-center justify-space-between tree-actions-bar pt-2">
              <div class="d-flex align-center tree-btn-gap">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="small"
                  prepend-icon="$plus"
                  class="font-weight-bold"
                  v-on:click="onAddRootMenu"
                >
                  최상위 추가
                </v-btn>
                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="$plus"
                  class="font-weight-medium"
                  :disabled="!selectedMenu || selectedMenu.menuLevel >= 4"
                  v-on:click="onAddChildMenu"
                >
                  하위 추가
                </v-btn>
              </div>

              <div class="d-flex align-center expand-btn-gap">
                <v-btn variant="text" size="x-small" color="primary" v-on:click="expandAllNodes">
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
              </div>
            </div>
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- 트리 목록 영역 -->
          <div class="tree-list-scroll-area flex-grow-1">
            <div v-if="isLoading" class="d-flex justify-center align-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            </div>

            <div
              v-else-if="menuTreeData.length === 0"
              class="empty-tree-state text-center py-8 text-medium-emphasis"
            >
              <v-icon icon="$formatListBulleted" size="36" color="disabled" class="mb-2" />
              <div>등록된 메뉴 데이터가 없습니다.</div>
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                class="mt-3"
                prepend-icon="$plus"
                v-on:click="onAddRootMenu"
              >
                첫 메뉴 등록하기
              </v-btn>
            </div>

            <div v-else class="menu-tree-container">
              <!-- Level 1 Items -->
              <div v-for="node1 in menuTreeData" :key="node1.id" class="tree-branch">
                <!-- Level 1 Node Row -->
                <div
                  class="tree-node-row level-1-row"
                  :class="{ 'node-active': selectedMenu && selectedMenu.id === node1.id }"
                  v-on:click="onSelectNode(node1)"
                >
                  <button
                    type="button"
                    class="node-toggle-btn"
                    :class="{ 'invisible-btn': !node1.children || node1.children.length === 0 }"
                    v-on:click.stop="toggleExpand(node1.id)"
                  >
                    <v-icon
                      :icon="isExpanded(node1.id) ? '$chevronDown' : '$chevronRight'"
                      size="18"
                    />
                  </button>

                  <v-chip
                    size="x-small"
                    color="primary"
                    variant="flat"
                    class="mr-2 font-weight-bold level-badge"
                  >
                    L1
                  </v-chip>

                  <v-icon
                    :icon="
                      node1.iconName ||
                      (node1.children && node1.children.length > 0 ? '$folder' : '$fileDocument')
                    "
                    size="18"
                    color="primary"
                    class="mr-2"
                  />

                  <span class="node-title font-weight-bold text-truncate flex-grow-1">
                    {{ node1.menuName }}
                  </span>

                  <span class="node-id-caption text-caption text-disabled ml-2">
                    {{ node1.menuId }}
                  </span>
                </div>

                <!-- Level 2 Children -->
                <div
                  v-if="isExpanded(node1.id) && node1.children && node1.children.length > 0"
                  class="tree-sub-container"
                >
                  <div v-for="node2 in node1.children" :key="node2.id" class="tree-branch">
                    <!-- Level 2 Node Row -->
                    <div
                      class="tree-node-row level-2-row"
                      :class="{ 'node-active': selectedMenu && selectedMenu.id === node2.id }"
                      v-on:click="onSelectNode(node2)"
                    >
                      <button
                        type="button"
                        class="node-toggle-btn"
                        :class="{ 'invisible-btn': !node2.children || node2.children.length === 0 }"
                        v-on:click.stop="toggleExpand(node2.id)"
                      >
                        <v-icon
                          :icon="isExpanded(node2.id) ? '$chevronDown' : '$chevronRight'"
                          size="18"
                        />
                      </button>

                      <v-chip
                        size="x-small"
                        color="info"
                        variant="tonal"
                        class="mr-2 font-weight-bold level-badge"
                      >
                        L2
                      </v-chip>

                      <v-icon
                        :icon="
                          node2.iconName ||
                          (node2.children && node2.children.length > 0
                            ? '$folderOpen'
                            : '$fileDocument')
                        "
                        size="18"
                        color="info"
                        class="mr-2"
                      />

                      <span class="node-title font-weight-medium text-truncate flex-grow-1">
                        {{ node2.menuName }}
                      </span>

                      <span class="node-id-caption text-caption text-disabled ml-2">
                        {{ node2.menuId }}
                      </span>
                    </div>

                    <!-- Level 3 Children -->
                    <div
                      v-if="isExpanded(node2.id) && node2.children && node2.children.length > 0"
                      class="tree-sub-container"
                    >
                      <div v-for="node3 in node2.children" :key="node3.id" class="tree-branch">
                        <!-- Level 3 Node Row -->
                        <div
                          class="tree-node-row level-3-row"
                          :class="{ 'node-active': selectedMenu && selectedMenu.id === node3.id }"
                          v-on:click="onSelectNode(node3)"
                        >
                          <button
                            type="button"
                            class="node-toggle-btn"
                            :class="{
                              'invisible-btn': !node3.children || node3.children.length === 0,
                            }"
                            v-on:click.stop="toggleExpand(node3.id)"
                          >
                            <v-icon
                              :icon="isExpanded(node3.id) ? '$chevronDown' : '$chevronRight'"
                              size="18"
                            />
                          </button>

                          <v-chip
                            size="x-small"
                            color="warning"
                            variant="tonal"
                            class="mr-2 font-weight-bold level-badge"
                          >
                            L3
                          </v-chip>

                          <v-icon
                            :icon="
                              node3.iconName ||
                              (node3.children && node3.children.length > 0
                                ? '$folderOpen'
                                : '$fileDocument')
                            "
                            size="18"
                            color="secondary"
                            class="mr-2"
                          />

                          <span class="node-title font-weight-regular text-truncate flex-grow-1">
                            {{ node3.menuName }}
                          </span>

                          <span class="node-id-caption text-caption text-disabled ml-2">
                            {{ node3.menuId }}
                          </span>
                        </div>

                        <!-- Level 4 Children (최하위) -->
                        <div
                          v-if="isExpanded(node3.id) && node3.children && node3.children.length > 0"
                          class="tree-sub-container"
                        >
                          <div v-for="node4 in node3.children" :key="node4.id" class="tree-branch">
                            <!-- Level 4 Node Row -->
                            <div
                              class="tree-node-row level-4-row"
                              :class="{
                                'node-active': selectedMenu && selectedMenu.id === node4.id,
                              }"
                              v-on:click="onSelectNode(node4)"
                            >
                              <span class="leaf-spacer"></span>

                              <v-chip
                                size="x-small"
                                color="grey"
                                variant="flat"
                                class="mr-2 font-weight-bold level-badge"
                              >
                                L4
                              </v-chip>

                              <v-icon
                                :icon="node4.iconName || '$fileDocument'"
                                size="16"
                                color="grey-darken-1"
                                class="mr-2"
                              />

                              <span
                                class="node-title font-weight-regular text-truncate flex-grow-1"
                              >
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

      <!-- [우측 영역] 메뉴 상세 정보 및 편집/등록 폼 (너비 약 60~65%) -->
      <v-col cols="12" md="7" lg="8" class="d-flex flex-column">
        <v-card class="elevation-1 rounded-lg pa-4 fill-height d-flex flex-column">
          <!-- 폼 상단 타이틀 영역 -->
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-icon
                :icon="mode === 'CREATE' ? '$plus' : mode === 'UPDATE' ? '$pencil' : '$info'"
                size="22"
                :color="mode === 'CREATE' ? 'success' : mode === 'UPDATE' ? 'primary' : 'grey'"
                class="mr-2"
              />
              <div>
                <span class="text-subtitle-1 font-weight-bold text-high-emphasis">
                  {{ formHeaderTitle }}
                </span>
                <span v-if="formHeaderSubtitle" class="text-caption text-medium-emphasis ml-2">
                  {{ formHeaderSubtitle }}
                </span>
              </div>
            </div>

            <!-- 현재 모드 상태 배지 -->
            <v-chip
              size="small"
              :color="mode === 'CREATE' ? 'success' : mode === 'UPDATE' ? 'primary' : 'default'"
              variant="flat"
              class="font-weight-bold"
            >
              {{ mode === 'CREATE' ? '신규 등록 모드' : mode === 'UPDATE' ? '수정 모드' : '대기' }}
            </v-chip>
          </div>

          <v-divider class="mb-4"></v-divider>

          <!-- READY 모드: 선택된 항목이 없을 때 안내 화면 -->
          <div
            v-if="mode === 'READY'"
            class="empty-form-state flex-grow-1 d-flex flex-column justify-center align-center py-12 text-medium-emphasis"
          >
            <v-icon icon="$mouse" size="48" color="disabled" class="mb-3" />
            <div class="text-subtitle-1 font-weight-medium mb-1">메뉴가 선택되지 않았습니다.</div>
            <div class="text-body-2 text-disabled mb-4">
              좌측 트리에서 메뉴를 선택하거나 새로운 메뉴를 추가하세요.
            </div>
            <div class="d-flex gap-2">
              <v-btn color="primary" variant="flat" prepend-icon="$plus" v-on:click="onAddRootMenu">
                최상위 메뉴 추가
              </v-btn>
            </div>
          </div>

          <!-- CREATE / UPDATE 모드 폼 영역 -->
          <v-form v-else ref="formRef" class="menu-edit-form flex-grow-1 overflow-y-auto pr-1 pt-3">
            <v-row density="comfortable">
              <!-- 1. 계층 및 공장 정보 -->
              <v-col cols="12" sm="4">
                <v-select
                  v-model="formData.factoryName"
                  :items="factoryList"
                  label="소속 공장 (FACTORY_NAME)"
                  variant="outlined"
                  density="compact"
                  :rules="[validateRequired]"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="formData.parentMenuName"
                  label="상위 메뉴 정보"
                  variant="outlined"
                  density="compact"
                  readonly
                  :hint="
                    formData.parentId ? '상위 메뉴 ID: ' + formData.parentId : '최상위(Root) 메뉴'
                  "
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="formData.menuLevel"
                  label="메뉴 레벨 (MENU_LEVEL)"
                  variant="outlined"
                  density="compact"
                  readonly
                  hint="1~4 레벨"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <!-- 2. 메뉴 식별자 및 명칭 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.menuId"
                  label="메뉴 ID (MENU_ID)"
                  variant="outlined"
                  density="compact"
                  placeholder="예: DASHBOARD, USER_MGMT"
                  :rules="[validateRequired]"
                  :readonly="mode === 'UPDATE'"
                  :hint="
                    mode === 'UPDATE'
                      ? '메뉴 ID는 수정할 수 없습니다'
                      : '고유한 메뉴 코드를 입력하세요'
                  "
                  persistent-hint
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.menuName"
                  label="메뉴 명칭 (MENU_NAME)"
                  variant="outlined"
                  density="compact"
                  placeholder="예: 사용자 관리"
                  :rules="[validateRequired]"
                  required
                ></v-text-field>
              </v-col>

              <!-- 3. 화면 경로 및 컴포넌트 정보 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.routerPath"
                  label="라우터 경로 (ROUTER_PATH)"
                  variant="outlined"
                  density="compact"
                  placeholder="예: /settings/user-mgmt"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.filePath"
                  label="컴포넌트 파일 경로 (FILE_PATH)"
                  variant="outlined"
                  density="compact"
                  placeholder="예: @/views/Settings/UserMgmtView.vue"
                ></v-text-field>
              </v-col>

              <!-- 4. 아이콘 및 정렬 순서 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.iconName"
                  label="아이콘명 (ICON_NAME)"
                  variant="outlined"
                  density="compact"
                  placeholder="예: $accountGroup, $cog"
                  :append-inner-icon="formData.iconName || undefined"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.displayOrder"
                  type="number"
                  label="표시 순서 (DISPLAY_ORDER)"
                  variant="outlined"
                  density="compact"
                  placeholder="10"
                  :rules="[validateRequired]"
                  required
                ></v-text-field>
              </v-col>

              <!-- 5. 노출 및 사용 상태 -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.isVisible"
                  :items="visibleOptions"
                  label="노출 여부 (IS_VISIBLE)"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.useState"
                  :items="statusOptions"
                  label="사용 상태 (USE_STATE)"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>

          <!-- 폼 하단 액션 버튼 영역 -->
          <div v-if="mode !== 'READY'" class="form-bottom-actions pt-4 mt-2">
            <v-divider class="mb-4"></v-divider>
            <div class="d-flex align-center justify-space-between">
              <v-btn variant="outlined" color="secondary" v-on:click="onCancelForm"> 취소 </v-btn>

              <div class="d-flex align-center btn-group-gap">
                <!-- UPDATE 모드일 때 삭제 버튼 제공 -->
                <v-btn
                  v-if="mode === 'UPDATE'"
                  color="error"
                  variant="outlined"
                  :loading="isDeleting"
                  v-on:click="onOpenDelete"
                >
                  삭제
                </v-btn>

                <!-- 저장 / 수정 버튼 -->
                <v-btn color="primary" variant="elevated" :loading="isSaving" v-on:click="onSave">
                  {{ mode === 'CREATE' ? '신규 저장' : '수정 저장' }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 삭제 확인 모달 -->
    <ConfirmDialog
      v-model="deleteConfirmDialog"
      :message="
        '[' + (formData.menuName || formData.menuId || '선택한') + '] 메뉴를 삭제하시겠습니까?'
      "
      v-on:confirm="onConfirmDelete"
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { fetchMenusApi, createMenuApi, updateMenuApi, deleteMenuApi } from '@/api/menu'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

// 공장 옵션 목록
const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const factoryList = ['INSERT', 'POWDER', 'COMMON']

const visibleOptions = [
  { title: '노출 (Y)', value: 'Y' },
  { title: '미노출 (N)', value: 'N' },
]

const statusOptions = [
  { title: '사용 (ACTIVE)', value: 'ACTIVE' },
  { title: '미사용 (INACTIVE)', value: 'INACTIVE' },
]

// 화면 상태 변수
const mode = ref('READY') // 'READY' | 'CREATE' | 'UPDATE'
const selectedFactory = ref('전체')
const selectedMenu = ref(null)
const formRef = ref(null)
const deleteConfirmDialog = ref(false)

// 트리 데이터 및 펼침 상태 맵
const menuTreeData = ref([])
const rawMenuList = ref([])
const expandedNodeMap = reactive({})

// 폼 바인딩 데이터
const formData = reactive({
  id: null,
  factoryName: 'INSERT',
  menuId: '',
  menuName: '',
  parentId: null,
  parentMenuName: '최상위(Root) 메뉴',
  menuLevel: 1,
  filePath: '',
  routerPath: '',
  iconName: '',
  displayOrder: 10,
  isVisible: 'Y',
  useState: 'ACTIVE',
})

// useApi 비동기 통신 바인딩
const { loading: isLoading, execute: executeFetchMenus } = useApi(fetchMenusApi)
const { loading: isCreating, execute: executeCreate } = useApi(createMenuApi)
const { loading: isUpdating, execute: executeUpdate } = useApi(updateMenuApi)
const { loading: isDeleting, execute: executeDelete } = useApi(deleteMenuApi)

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const formHeaderTitle = computed(function () {
  if (mode.value === 'CREATE') {
    if (formData.parentId) {
      return '하위 메뉴 등록'
    }
    return '최상위 메뉴 등록'
  }
  if (mode.value === 'UPDATE') {
    return '메뉴 상세 정보 및 수정'
  }
  return '메뉴 정보'
})

const formHeaderSubtitle = computed(function () {
  if (mode.value === 'CREATE') {
    if (formData.parentId) {
      return '[' + formData.parentMenuName + '] 의 하위 레벨 (L' + formData.menuLevel + ')'
    }
    return '대분류 모듈 (Level 1)'
  }
  if (mode.value === 'UPDATE' && selectedMenu.value) {
    return '[' + selectedMenu.value.menuName + '] (' + selectedMenu.value.menuId + ')'
  }
  return ''
})

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

  // 1차 패스: 모든 노드를 정제하여 nodeMap에 TSID id 및 menuId로 등록
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
        raw: rawItem,
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
          if (!node.parentMenuName) {
            node.parentMenuName = nodeMap[parentId].menuName
          }
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
        const orderB =
          nodes[j + 1].displayOrder !== undefined ? Number(nodes[j + 1].displayOrder) : 0
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
 * 메뉴 목록 API 조회
 */
async function fetchMenus() {
  try {
    const params = {
      page: 0,
      size: 300,
      factoryName: selectedFactory.value !== '전체' ? selectedFactory.value : undefined,
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

    rawMenuList.value = list
    menuTreeData.value = buildMenuTree(list)

    // 1레벨 노드들은 기본 펼침 처리
    for (let i = 0; i < menuTreeData.value.length; i = i + 1) {
      expandedNodeMap[menuTreeData.value[i].id] = true
    }

    // 기존 선택된 노드가 있다면 트리에서 다시 찾아 동기화
    if (selectedMenu.value && selectedMenu.value.id) {
      let foundNode = null
      function findNodeInTree(nodes) {
        for (let i = 0; i < nodes.length; i = i + 1) {
          if (String(nodes[i].id) === String(selectedMenu.value.id)) {
            foundNode = nodes[i]
            return
          }
          if (nodes[i].children && nodes[i].children.length > 0) {
            findNodeInTree(nodes[i].children)
            if (foundNode) {
              return
            }
          }
        }
      }
      findNodeInTree(menuTreeData.value)
      if (foundNode) {
        onSelectNode(foundNode)
      } else {
        resetForm()
      }
    }
  } catch (error) {
    console.error('Fetch menus failed:', error)
    menuTreeData.value = []
  }
}

function handleSearch() {
  fetchMenus()
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
  expandRecursive(menuTreeData.value)
}

function collapseAllNodes() {
  const keys = Object.keys(expandedNodeMap)
  for (let i = 0; i < keys.length; i = i + 1) {
    expandedNodeMap[keys[i]] = false
  }
}

// 트리 노드 선택 시 호출
function onSelectNode(node) {
  mode.value = 'UPDATE'
  selectedMenu.value = node

  formData.id = node.id
  formData.factoryName = node.factoryName || 'INSERT'
  formData.menuId = node.menuId || ''
  formData.menuName = node.menuName || ''
  formData.parentId = node.parentId || null
  formData.parentMenuName =
    node.parentMenuName || (node.parentId ? node.parentId : '최상위(Root) 메뉴')
  formData.menuLevel = Number(node.menuLevel) || 1
  formData.routerPath = node.routerPath || ''
  formData.filePath = node.filePath || ''
  formData.iconName = node.iconName || ''
  formData.displayOrder = node.displayOrder !== undefined ? Number(node.displayOrder) : 10
  formData.isVisible = node.isVisible || 'Y'
  formData.useState = node.useState || 'ACTIVE'
}

// [최상위 메뉴 추가] 클릭 시
function onAddRootMenu() {
  mode.value = 'CREATE'
  selectedMenu.value = null

  formData.id = null
  formData.factoryName = selectedFactory.value !== '전체' ? selectedFactory.value : 'INSERT'
  formData.menuId = ''
  formData.menuName = ''
  formData.parentId = null
  formData.parentMenuName = '최상위(Root) 메뉴'
  formData.menuLevel = 1
  formData.routerPath = ''
  formData.filePath = ''
  formData.iconName = ''
  formData.displayOrder = (menuTreeData.value.length + 1) * 10
  formData.isVisible = 'Y'
  formData.useState = 'ACTIVE'
}

// [하위 메뉴 추가] 클릭 시
function onAddChildMenu() {
  if (!selectedMenu.value) {
    alert('하위 메뉴를 추가할 상위 메뉴를 먼저 선택해주세요.')
    return
  }

  const parentLevel = Number(selectedMenu.value.menuLevel) || 1
  if (parentLevel >= 4) {
    alert('메뉴는 최대 4단계(Level 4)까지만 등록 가능합니다.')
    return
  }

  mode.value = 'CREATE'
  const parentNode = selectedMenu.value

  // 부모 노드 자동 펼침
  expandedNodeMap[parentNode.id] = true

  const childCount = parentNode.children ? parentNode.children.length : 0

  formData.id = null
  formData.factoryName = parentNode.factoryName || 'INSERT'
  formData.menuId = ''
  formData.menuName = ''
  formData.parentId = parentNode.id
  formData.parentMenuName = parentNode.menuName + ' (' + parentNode.menuId + ')'
  formData.menuLevel = parentLevel + 1
  formData.routerPath = ''
  formData.filePath = ''
  formData.iconName = ''
  formData.displayOrder = (childCount + 1) * 10
  formData.isVisible = 'Y'
  formData.useState = 'ACTIVE'
}

function resetForm() {
  mode.value = 'READY'
  selectedMenu.value = null
  formData.id = null
  formData.factoryName = 'INSERT'
  formData.menuId = ''
  formData.menuName = ''
  formData.parentId = null
  formData.parentMenuName = '최상위(Root) 메뉴'
  formData.menuLevel = 1
  formData.routerPath = ''
  formData.filePath = ''
  formData.iconName = ''
  formData.displayOrder = 10
  formData.isVisible = 'Y'
  formData.useState = 'ACTIVE'
}

function onCancelForm() {
  if (selectedMenu.value && mode.value === 'CREATE') {
    onSelectNode(selectedMenu.value)
  } else {
    resetForm()
  }
}

function validateRequired(value) {
  if (value !== null && value !== undefined && String(value).trim() !== '') {
    return true
  }
  return '필수 입력 항목입니다.'
}

// 삭제 모달 열기 (하위 메뉴 존재 여부 사전에 엄격 검증)
function onOpenDelete() {
  if (!formData.id) {
    return
  }

  if (selectedMenu.value && selectedMenu.value.children && selectedMenu.value.children.length > 0) {
    alert('하위 메뉴가 존재하는 메뉴는 삭제할 수 없습니다. 하위 메뉴를 먼저 삭제해주세요.')
    return
  }

  deleteConfirmDialog.value = true
}

// 삭제 실행
async function onConfirmDelete() {
  try {
    const targetId = formData.id
    await executeDelete(targetId)
    alert('메뉴가 성공적으로 삭제되었습니다.')
    resetForm()
    await fetchMenus()
  } catch (error) {
    console.error('Delete menu failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '메뉴 삭제 처리 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

// 저장 / 수정 실행
async function onSave() {
  if (!formRef.value) {
    return
  }

  const validationResult = await formRef.value.validate()
  if (!validationResult.valid) {
    return
  }

  try {
    const payload = {
      factoryName: formData.factoryName,
      menuId: formData.menuId,
      menuName: formData.menuName,
      parentId: formData.parentId || null,
      menuLevel: Number(formData.menuLevel),
      routerPath: formData.routerPath || '',
      filePath: formData.filePath || '',
      iconName: formData.iconName || '',
      displayOrder: Number(formData.displayOrder),
      isVisible: formData.isVisible,
      useState: formData.useState,
    }

    if (mode.value === 'CREATE') {
      await executeCreate(payload)
      alert('신규 메뉴가 등록되었습니다.')
    } else {
      const targetId = formData.id
      await executeUpdate(targetId, payload)
      alert('메뉴 정보가 수정되었습니다.')
    }

    await fetchMenus()
  } catch (error) {
    console.error('Save menu failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '메뉴 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

onMounted(function () {
  fetchMenus()
})
</script>

<style scoped>
.menu-edit-form {
  padding-top: 14px;
}

.menu-mgmt-container {
  max-width: 100%;
}
.header-action-gap {
  gap: 8px;
}
.split-view-row {
  min-height: calc(100vh - 170px);
}
.tree-toolbar-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 8px;
}
.tree-actions-bar {
  gap: 8px;
}
.tree-btn-gap {
  gap: 6px;
}
.expand-btn-gap {
  gap: 4px;
}
.tree-list-scroll-area {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  padding-right: 4px;
}
.menu-tree-container {
  display: flex;
  flex-direction: column;
}
.tree-branch {
  position: relative;
}
.tree-node-row {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background-color 0.15s ease-in-out;
  user-select: none;
}
.tree-node-row:hover {
  background-color: rgba(46, 125, 50, 0.06);
}
.node-active {
  background-color: rgba(46, 125, 50, 0.14) !important;
  border-left: 3px solid #2e7d32;
}
.node-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}
.invisible-btn {
  visibility: hidden;
}
.leaf-spacer {
  display: inline-block;
  width: 24px;
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
}
.node-id-caption {
  font-size: 11px;
}
.empty-form-state {
  min-height: 350px;
}
.gap-2 {
  gap: 8px;
}
.btn-group-gap {
  gap: 8px;
}
</style>
