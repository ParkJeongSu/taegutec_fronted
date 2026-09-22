import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMenuStore = defineStore('menu', function () {
  // 신규 5대 대메뉴 체계 (DASHBOARD, TRANSFER, ORDER, MODELING, SETTINGS)
  const menuTree = ref([
    {
      id: 'DASHBOARD',
      title: '대시보드',
      children: [
        {
          id: 'OPERATION',
          title: '운영 모니터링',
          children: [
            {
              id: 'WAREHOUSE_ROOT',
              title: '창고',
              componentName: 'WarehouseView',
              path: '/dashboard/warehouse',
            },
            {
              id: 'WAREHOUSE_1',
              title: '창고1',
              children: [
                {
                  id: 'WORK_STATION_311',
                  title: 'workstation311',
                  componentName: 'WorkStation311View',
                  path: '/dashboard/warehouse1/ws311',
                },
                {
                  id: 'WORK_STATION_312',
                  title: 'workstation312',
                  componentName: 'WorkStation312View',
                  path: '/dashboard/warehouse1/ws312',
                },
                {
                  id: 'WORK_STATION_313',
                  title: 'workstation313',
                  componentName: 'WorkStation313View',
                  path: '/dashboard/warehouse1/ws313',
                },
                {
                  id: 'WORK_STATION_314',
                  title: 'workstation314',
                  componentName: 'WorkStation314View',
                  path: '/dashboard/warehouse1/ws314',
                },
                {
                  id: 'WORK_STATION_315',
                  title: 'workstation315',
                  componentName: 'WorkStation315View',
                  path: '/dashboard/warehouse1/ws315',
                },
                {
                  id: 'WORK_STATION_316',
                  title: 'workstation316',
                  componentName: 'WorkStation316View',
                  path: '/dashboard/warehouse1/ws316',
                },
              ],
            },
            {
              id: 'WAREHOUSE_2',
              title: '창고2',
              children: [
                {
                  id: 'WORK_STATION_321',
                  title: 'workstation321',
                  componentName: 'WorkStation321View',
                  path: '/dashboard/warehouse2/ws321',
                },
                {
                  id: 'WORK_STATION_322',
                  title: 'workstation322',
                  componentName: 'WorkStation322View',
                  path: '/dashboard/warehouse2/ws322',
                },
                {
                  id: 'WORK_STATION_323',
                  title: 'workstation323',
                  componentName: 'WorkStation323View',
                  path: '/dashboard/warehouse2/ws323',
                },
                {
                  id: 'WORK_STATION_324',
                  title: 'workstation324',
                  componentName: 'WorkStation324View',
                  path: '/dashboard/warehouse2/ws324',
                },
                {
                  id: 'WORK_STATION_325',
                  title: 'workstation325',
                  componentName: 'WorkStation325View',
                  path: '/dashboard/warehouse2/ws325',
                },
                {
                  id: 'WORK_STATION_326',
                  title: 'workstation326',
                  componentName: 'WorkStation326View',
                  path: '/dashboard/warehouse2/ws326',
                },
              ],
            },
            {
              id: 'WAREHOUSE_3',
              title: '창고3',
              children: [
                {
                  id: 'WORK_STATION_331',
                  title: 'workstation331',
                  componentName: 'WorkStation331View',
                  path: '/dashboard/warehouse3/ws331',
                },
              ],
            },
            {
              id: 'WAREHOUSE_4',
              title: '창고4',
              children: [
                {
                  id: 'WORK_STATION_341',
                  title: 'workstation341',
                  componentName: 'WorkStation341View',
                  path: '/dashboard/warehouse4/ws341',
                },
                {
                  id: 'WORK_STATION_342',
                  title: 'workstation342',
                  componentName: 'WorkStation342View',
                  path: '/dashboard/warehouse4/ws342',
                },
                {
                  id: 'WORK_STATION_343',
                  title: 'workstation343',
                  componentName: 'WorkStation343View',
                  path: '/dashboard/warehouse4/ws343',
                },
                {
                  id: 'WORK_STATION_344',
                  title: 'workstation344',
                  componentName: 'WorkStation344View',
                  path: '/dashboard/warehouse4/ws344',
                },
              ],
            },
            {
              id: 'WAREHOUSE_5',
              title: '창고5',
              children: [
                {
                  id: 'WORK_STATION_351',
                  title: 'workstation351',
                  componentName: 'WorkStation351View',
                  path: '/dashboard/warehouse5/ws351',
                },
                {
                  id: 'WORK_STATION_352',
                  title: 'workstation352',
                  componentName: 'WorkStation352View',
                  path: '/dashboard/warehouse5/ws352',
                },
              ],
            },
            {
              id: 'WAREHOUSE_6',
              title: '창고6',
              children: [
                {
                  id: 'WORK_STATION_361',
                  title: 'workstation361',
                  componentName: 'WorkStation361View',
                  path: '/dashboard/warehouse6/ws361',
                },
                {
                  id: 'WORK_STATION_362',
                  title: 'workstation362',
                  componentName: 'WorkStation362View',
                  path: '/dashboard/warehouse6/ws362',
                },
                {
                  id: 'WORK_STATION_363',
                  title: 'workstation363',
                  componentName: 'WorkStation363View',
                  path: '/dashboard/warehouse6/ws363',
                },
              ],
            },
            {
              id: 'WAREHOUSE_7',
              title: '창고7',
              children: [
                {
                  id: 'WORK_STATION_371',
                  title: 'workstation371',
                  componentName: 'WorkStation371View',
                  path: '/dashboard/warehouse7/ws371',
                },
                {
                  id: 'WORK_STATION_372',
                  title: 'workstation372',
                  componentName: 'WorkStation372View',
                  path: '/dashboard/warehouse7/ws372',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'TRANSFER',
      title: '반송',
      children: [
        {
          id: 'EQUIPMENT',
          title: '설비 제어',
          children: [
            {
              id: 'STOCKER',
              title: '스토커',
              componentName: 'StockerView',
              path: '/transfer/stocker',
            },
            {
              id: 'CONVEYOR',
              title: '컨베이어',
              componentName: 'ConveyorView',
              path: '/transfer/conveyor',
            },
            {
              id: 'CARRIER',
              title: '캐리어',
              componentName: 'CarrierView',
              path: '/transfer/carrier',
            },
            {
              id: 'ZONE',
              title: '존',
              componentName: 'ZoneView',
              path: '/transfer/zone',
            },
          ],
        },
        {
          id: 'HISTORY',
          title: '반송 이력',
          children: [
            {
              id: 'TRANSFER_HISTORY',
              title: '반송이력',
              componentName: 'TransferHistoryView',
              path: '/transfer/history',
            },
          ],
        },
      ],
    },
    {
      id: 'ORDER',
      title: '오더',
      children: [
        {
          id: 'SAP_IF',
          title: '인터페이스',
          children: [
            {
              id: 'IDOC_HISTORY',
              title: 'Idoc 이력',
              componentName: 'IdocHistoryView',
              path: '/order/idoc-history',
            },
          ],
        },
      ],
    },
    {
      id: 'MODELING',
      title: '모델링',
      children: [
        {
          id: 'ROUTE',
          title: '경로 설정',
          children: [
            {
              id: 'ROUTE_NODE',
              title: '라우트 노드',
              componentName: 'RouteNodeView',
              path: '/modeling/route-node',
            },
            {
              id: 'ROUTE_LINK',
              title: '라우트 링크',
              componentName: 'RouteLinkView',
              path: '/modeling/route-link',
            },
            {
              id: 'ALT_ZONE',
              title: '대체존 설정',
              componentName: 'AltZoneView',
              path: '/modeling/alt-zone',
            },
          ],
        },
        {
          id: 'RULE',
          title: '제어 규칙',
          children: [
            {
              id: 'ALARM_DEF',
              title: '알람 정의',
              componentName: 'AlarmDefView',
              path: '/modeling/alarm-def',
            },
            {
              id: 'SUB_TRANSFER_RULE',
              title: 'Sub Transfer Rule',
              componentName: 'SubTransferRuleView',
              path: '/modeling/sub-transfer-rule',
            },
          ],
        },
      ],
    },
    {
      id: 'SETTINGS',
      title: '관리자 설정',
      children: [
        {
          id: 'AUTH_USER',
          title: '사용자 및 권한',
          children: [
            {
              id: 'USER_MGMT',
              title: '사용자',
              componentName: 'UserMgmtView',
              path: '/settings/user',
            },
            {
              id: 'DEPT_MGMT',
              title: '부서',
              componentName: 'DeptMgmtView',
              path: '/settings/dept',
            },
            {
              id: 'USER_GROUP_MGMT',
              title: '사용자 그룹',
              componentName: 'UserGroupMgmtView',
              path: '/settings/user-group',
            },
            {
              id: 'MENU_MGMT',
              title: '메뉴',
              componentName: 'MenuMgmtView',
              path: '/settings/menu',
            },
            {
              id: 'MENU_AUTH',
              title: '메뉴 권한',
              componentName: 'MenuAuthView',
              path: '/settings/menu-auth',
            },
            {
              id: 'ADMIN_AUTH',
              title: '관리자 권한',
              componentName: 'AdminAuthView',
              path: '/settings/admin-auth',
            },
          ],
        },
        {
          id: 'POLICY',
          title: '시스템 정책',
          children: [
            {
              id: 'PASSWORD_POLICY',
              title: '패스워드 정책',
              componentName: 'PasswordPolicyView',
              path: '/settings/password-policy',
            },
          ],
        },
      ],
    },
  ])

  // 초기 상태: ID 기준 관리
  const selectedL1Id = ref(menuTree.value.length > 0 ? menuTree.value[0].id : '')
  const selectedL2Id = ref(
    menuTree.value[0] && menuTree.value[0].children && menuTree.value[0].children.length > 0
      ? menuTree.value[0].children[0].id
      : '',
  )
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

  return {
    menuTree,
    selectedL1Id,
    selectedL2Id,
    selectedL1,
    selectedL2,
    currentL2List,
    currentL3List,
    isSidebarOpen,
    selectL1,
    selectL2,
    toggleSidebar,
  }
})
