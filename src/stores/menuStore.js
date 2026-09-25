// src/stores/menuStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchAuthorizedMenuTreeApi } from '@/api/menu'

export const useMenuStore = defineStore('menu', function () {
  // 동적 메뉴 트리 상태 (초기값: 빈 배열)
  const menuTree = ref([])
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref(null)

  // 선택된 메뉴 ID 상태
  const selectedL1Id = ref('')
  const selectedL2Id = ref('')
  const isSidebarOpen = ref(true)

  // 대메뉴(L1) 객체 계산 (selectedL1Id 기반)
  const selectedL1 = computed(function () {
    if (!menuTree.value || menuTree.value.length === 0) {
      return null
    }
    for (let i = 0; i < menuTree.value.length; i++) {
      if (menuTree.value[i].id === selectedL1Id.value) {
        return menuTree.value[i]
      }
    }
    return menuTree.value[0]
  })

  // 중메뉴(L2) 목록 계산 (selectedL1의 children)
  const currentL2List = computed(function () {
    if (selectedL1.value && selectedL1.value.children) {
      return selectedL1.value.children
    }
    return []
  })

  // 중메뉴(L2) 객체 계산 (currentL2List 내 selectedL2Id 일치 항목 또는 첫 번째 요소)
  const selectedL2 = computed(function () {
    const l2List = currentL2List.value
    if (!l2List || l2List.length === 0) {
      return null
    }
    for (let i = 0; i < l2List.length; i++) {
      if (l2List[i].id === selectedL2Id.value) {
        return l2List[i]
      }
    }
    return l2List[0]
  })

  // 소메뉴(L3) 목록 계산 (selectedL2의 children)
  const currentL3List = computed(function () {
    if (selectedL2.value && selectedL2.value.children) {
      return selectedL2.value.children
    }
    return []
  })

  // 대메뉴 선택: selectedL1Id 갱신 및 첫 번째 자식 L2 ID 즉시 할당
  function selectL1(menuOrId) {
    const l1Id = typeof menuOrId === 'object' && menuOrId !== null ? menuOrId.id : menuOrId
    selectedL1Id.value = l1Id

    let targetL1 = null
    for (let i = 0; i < menuTree.value.length; i++) {
      if (menuTree.value[i].id === l1Id) {
        targetL1 = menuTree.value[i]
        break
      }
    }

    if (targetL1 && targetL1.children && targetL1.children.length > 0) {
      selectedL2Id.value = targetL1.children[0].id
      isSidebarOpen.value = true
    } else {
      selectedL2Id.value = ''
    }
  }

  // 중메뉴 선택: selectedL2Id 갱신 및 사이드바 오픈 보장
  function selectL2(menuOrId) {
    const l2Id = typeof menuOrId === 'object' && menuOrId !== null ? menuOrId.id : menuOrId
    selectedL2Id.value = l2Id
    if (!isSidebarOpen.value) {
      isSidebarOpen.value = true
    }
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  // 알려진 메뉴 ID 및 컴포넌트 매핑 테이블
  function getKnownComponentMapping(menuId) {
    if (!menuId) return ''
    const upper = String(menuId).toUpperCase().trim()
    const map = {
      WAREHOUSE_ROOT: 'WarehouseView',
      WAREHOUSE: 'WarehouseView',
      WORK_STATION: 'WorkStationView',
      STOCKER: 'StockerView',
      CONVEYOR: 'ConveyorView',
      CARRIER: 'CarrierView',
      ZONE: 'ZoneView',
      SHELF: 'ShelfView',
      TRANSFER_COMMAND_HISTORY: 'TransferCommandHistoryView',
      TRANSFER_HISTORY: 'TransferCommandHistoryView',
      INSERT_IDOC_HISTORY: 'InsertIdocHistoryView',
      POWDER_IDOC_HISTORY: 'PowderIdocHistoryView',
      ROUTE_NODE: 'RouteNodeView',
      ROUTE_LINK: 'RouteLinkView',
      ALT_ZONE: 'AltZoneView',
      ALARM_DEF: 'AlarmDefView',
      SUB_TRANSFER_RULE: 'SubTransferRuleView',
      USER_MGMT: 'UserMgmtView',
      DEPT_MGMT: 'DeptMgmtView',
      USER_GROUP_MGMT: 'UserGroupMgmtView',
      MENU_MGMT: 'MenuMgmtView',
      MENU_AUTH: 'MenuAuthView',
      PASSWORD_POLICY: 'PasswordPolicyView',
      PROCESS_STATUS: 'ProcessStatusView',
      PROCESS_STATUS_VER2: 'ProcessStatusVer2View',
      PURGE_CONFIG: 'PurgeConfigView',
      PROCESS_INFO: 'ProcessInfoView',
      PURGE_LOG: 'PurgeLogView',
      PROCESS_STATUS_HISTORY: 'ProcessStatusHistoryView',
    }

    if (map[upper]) {
      return map[upper]
    }

    // WORK_STATION_311 -> WorkStation311View 형식 처리
    if (upper.indexOf('WORK_STATION_') === 0) {
      const suffix = upper.replace('WORK_STATION_', '')
      return 'WorkStation' + suffix + 'View'
    }

    // 스네이크 케이스 -> 파스칼 케이스 변환
    const words = upper.split('_')
    let pascal = ''
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      if (w) {
        pascal = pascal + w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      }
    }
    if (pascal && pascal.indexOf('View') === -1) {
      pascal = pascal + 'View'
    }
    return pascal
  }

  // 컴포넌트 명칭 추출 함수
  function resolveComponentName(rawNode) {
    if (!rawNode) return ''

    // 1. DTO에 componentName이 직접 지정된 경우
    if (rawNode.componentName) {
      return rawNode.componentName
    }

    // 2. filePath 경로가 있는 경우 (예: "@/views/Transfer/StockerView.vue")
    if (rawNode.filePath) {
      const pathStr = String(rawNode.filePath).trim()
      const parts = pathStr.split('/')
      const fileName = parts[parts.length - 1]
      const compName = fileName.replace(/\.vue$/i, '')
      if (compName) {
        return compName
      }
    }

    // 3. menuId 기준 매핑 테이블 및 변환 규칙 적용
    const menuId = rawNode.menuId || rawNode.id
    if (menuId) {
      const mapped = getKnownComponentMapping(menuId)
      if (mapped) {
        return mapped
      }
    }

    return ''
  }

  // 백엔드 트리 노드 정규화
  function normalizeMenuNode(rawNode) {
    if (!rawNode) return null

    const id = rawNode.menuId || (rawNode.id != null ? String(rawNode.id) : '')
    const title = rawNode.menuName || rawNode.title || id
    const path = rawNode.routerPath || rawNode.path || ''
    const icon = rawNode.iconName || rawNode.icon || ''
    const compName = resolveComponentName(rawNode)

    const normalized = {
      ...rawNode,
      id: id,
      dbId: rawNode.id,
      menuId: rawNode.menuId || id,
      title: title,
      menuName: rawNode.menuName || title,
      path: path,
      routerPath: path,
      icon: icon,
      iconName: icon,
      componentName: compName,
      menuLevel: rawNode.menuLevel || 1,
      children: [],
    }

    if (rawNode.children && Array.isArray(rawNode.children)) {
      const childrenList = []
      for (let i = 0; i < rawNode.children.length; i++) {
        const child = normalizeMenuNode(rawNode.children[i])
        if (child) {
          childrenList.push(child)
        }
      }
      normalized.children = childrenList
    }

    return normalized
  }

  // 초기 선택값 (selectedL1Id, selectedL2Id) 재동기화
  function syncSelectedIds() {
    if (!menuTree.value || menuTree.value.length === 0) {
      selectedL1Id.value = ''
      selectedL2Id.value = ''
      return
    }

    let currentL1Exists = false
    let matchedL1 = null
    for (let i = 0; i < menuTree.value.length; i++) {
      if (menuTree.value[i].id === selectedL1Id.value) {
        currentL1Exists = true
        matchedL1 = menuTree.value[i]
        break
      }
    }

    if (!currentL1Exists) {
      matchedL1 = menuTree.value[0]
      selectedL1Id.value = matchedL1.id
    }

    if (matchedL1 && matchedL1.children && matchedL1.children.length > 0) {
      let currentL2Exists = false
      for (let j = 0; j < matchedL1.children.length; j++) {
        if (matchedL1.children[j].id === selectedL2Id.value) {
          currentL2Exists = true
          break
        }
      }
      if (!currentL2Exists) {
        selectedL2Id.value = matchedL1.children[0].id
      }
    } else {
      selectedL2Id.value = ''
    }
  }

  // 사용자 권한 메뉴 트리 조회 액션
  async function fetchUserMenuTree(userId) {
    if (!userId) {
      console.warn('fetchUserMenuTree: userId가 유효하지 않습니다.')
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetchAuthorizedMenuTreeApi(userId)

      let rawList = []
      if (response) {
        if (Array.isArray(response)) {
          rawList = response
        } else if (response.data && Array.isArray(response.data)) {
          rawList = response.data
        } else if (response.result === 'SUCCESS' && Array.isArray(response.data)) {
          rawList = response.data
        }
      }

      const normalizedTree = []
      for (let i = 0; i < rawList.length; i++) {
        const node = normalizeMenuNode(rawList[i])
        if (node) {
          normalizedTree.push(node)
        }
      }

      menuTree.value = normalizedTree
      isLoaded.value = true

      // L1 / L2 선택값 동기화
      syncSelectedIds()

      return menuTree.value
    } catch (err) {
      console.error('Failed to fetch user menu tree:', err)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 메뉴 상태 초기화 (로그아웃 등)
  function clearMenu() {
    menuTree.value = []
    selectedL1Id.value = ''
    selectedL2Id.value = ''
    isLoaded.value = false
    error.value = null
  }

  return {
    menuTree: menuTree,
    selectedL1Id: selectedL1Id,
    selectedL2Id: selectedL2Id,
    selectedL1: selectedL1,
    selectedL2: selectedL2,
    currentL2List: currentL2List,
    currentL3List: currentL3List,
    isSidebarOpen: isSidebarOpen,
    isLoading: isLoading,
    isLoaded: isLoaded,
    error: error,
    selectL1: selectL1,
    selectL2: selectL2,
    toggleSidebar: toggleSidebar,
    syncSelectedIds: syncSelectedIds,
    fetchUserMenuTree: fetchUserMenuTree,
    clearMenu: clearMenu,
  }
})
