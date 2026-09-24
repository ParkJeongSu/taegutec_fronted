/**
 * DB에 저장된 메뉴 아이콘 문자열(mdi-* 형식) 또는 카멜케이스 별칭을 Vuetify mdi-svg 별칭($alias)으로 변환하는 공통 유틸
 * @param {string} iconName - DB 또는 설정에서 전달된 iconName 값 (예: 'mdi-warehouse', 'viewDashboard')
 * @param {boolean} isFolder - 하위 노드가 존재하는 폴더 여부
 * @param {boolean} isExpanded - 폴더 노드의 펼침 상태
 * @returns {string} Vuetify icon alias (예: '$warehouse', '$folderOpen')
 */
export function resolveMenuIcon(iconName, isFolder, isExpanded) {
  if (!iconName || typeof iconName !== 'string') {
    if (isFolder) {
      return isExpanded ? '$folderOpen' : '$folder'
    }
    return '$fileDocument'
  }

  const trimmed = iconName.trim()

  // 1. 이미 '$' 접두사가 붙은 Vuetify alias인 경우 그대로 반환
  if (trimmed.startsWith('$')) {
    return trimmed
  }

  // 2. DB의 mdi-* 웹폰트 클래스명 및 camelCase alias명을 vuetify-mdi-icons.js에 등록된 alias로 매핑
  switch (trimmed) {
    case 'mdi-warehouse':
    case 'warehouse':
      return '$warehouse'
    case 'mdi-home-outline':
    case 'homeOutline':
      return '$homeOutline'
    case 'mdi-home':
    case 'home':
    case 'mdi-domain':
      return '$home'
    case 'mdi-view-dashboard':
    case 'mdi-view-dashboard-outline':
    case 'viewDashboard':
    case 'dashboard':
      return '$viewDashboard'
    case 'mdi-monitor-dashboard':
    case 'mdi-chart-line':
    case 'chartLine':
      return '$chartLine'
    case 'mdi-conveyor-belt':
    case 'mdi-robot-industrial':
    case 'robotIndustrial':
      return '$robotIndustrial'
    case 'mdi-server':
    case 'mdi-database-outline':
    case 'databaseOutline':
      return '$databaseOutline'
    case 'mdi-cog-outline':
    case 'mdi-tune':
    case 'cogSyncOutline':
      return '$cogSyncOutline'
    case 'mdi-cog':
    case 'cog':
      return '$cog'
    case 'mdi-account-outline':
    case 'mdi-account-group-outline':
    case 'accountGroup':
      return '$accountGroup'
    case 'mdi-account':
    case 'account':
      return '$account'
    case 'mdi-swap-horizontal':
    case 'transfer':
      return '$transfer'
    case 'mdi-history':
    case 'history':
      return '$history'
    case 'mdi-bell-outline':
    case 'bellOutline':
      return '$bellOutline'
    case 'mdi-file-document-outline':
    case 'fileDocument':
      return '$fileDocument'
    case 'mdi-lock-check-outline':
    case 'shieldCheck':
      return '$shieldCheck'
    case 'mdi-desktop-classic':
    case 'device':
    case 'devices':
      return '$device'
    case 'mdi-tray-arrow-down':
    case 'trayArrowDown':
      return '$trayArrowDown'
    case 'mdi-tray-arrow-up':
    case 'trayArrowUp':
      return '$trayArrowUp'
    case 'mdi-radiobox-blank':
    case 'radioboxBlank':
      return '$radioboxBlank'
    case 'mdi-circle':
    case 'circle':
      return '$circle'
    case 'mdi-package-variant':
    case 'packageVariant':
      return '$packageVariant'
    default:
      // 매핑되지 않은 임의의 mdi 클래스는 SVG path 에러 방지를 위해 기본 아이콘으로 fallback
      if (isFolder) {
        return isExpanded ? '$folderOpen' : '$folder'
      }
      return '$fileDocument'
  }
}
