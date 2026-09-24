import { defineAsyncComponent } from 'vue'

export const componentMap = {
  // 1. DASHBOARD (대시보드)
  WorkStationView: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStationView.vue')
  }),
  WorkStation311View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation311View.vue')
  }),
  WorkStation312View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation312View.vue')
  }),
  WorkStation313View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation313View.vue')
  }),
  WorkStation314View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation314View.vue')
  }),
  WorkStation315View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation315View.vue')
  }),
  WorkStation316View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation316View.vue')
  }),

  // 창고 2 (WAREHOUSE_2)
  WorkStation321View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation321View.vue')
  }),
  WorkStation322View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation322View.vue')
  }),
  WorkStation323View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation323View.vue')
  }),
  WorkStation324View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation324View.vue')
  }),
  WorkStation325View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation325View.vue')
  }),
  WorkStation326View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation326View.vue')
  }),

  // 창고 3 (WAREHOUSE_3)
  WorkStation331View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation331View.vue')
  }),

  // 창고 4 (WAREHOUSE_4)
  WorkStation341View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation341View.vue')
  }),
  WorkStation342View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation342View.vue')
  }),
  WorkStation343View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation343View.vue')
  }),
  WorkStation344View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation344View.vue')
  }),

  // 창고 5 (WAREHOUSE_5)
  WorkStation351View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation351View.vue')
  }),
  WorkStation352View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation352View.vue')
  }),

  // 창고 6 (WAREHOUSE_6)
  WorkStation361View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation361View.vue')
  }),
  WorkStation362View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation362View.vue')
  }),
  WorkStation363View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation363View.vue')
  }),

  // 창고 7 (WAREHOUSE_7)
  WorkStation371View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation371View.vue')
  }),
  WorkStation372View: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStation372View.vue')
  }),

  WarehouseView: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WarehouseView.vue')
  }),

  // 2. TRANSFER (반송)
  StockerView: defineAsyncComponent(function () {
    return import('@/views/Transfer/StockerView.vue')
  }),
  ConveyorView: defineAsyncComponent(function () {
    return import('@/views/Transfer/ConveyorView.vue')
  }),
  CarrierView: defineAsyncComponent(function () {
    return import('@/views/Transfer/CarrierView.vue')
  }),
  ZoneView: defineAsyncComponent(function () {
    return import('@/views/Transfer/ZoneView.vue')
  }),
  ShelfView: defineAsyncComponent(function () {
    return import('@/views/Transfer/ShelfView.vue')
  }),
  TransferHistoryView: defineAsyncComponent(function () {
    return import('@/views/Transfer/TransferHistoryView.vue')
  }),

  // 3. ORDER (오더)
  IdocHistoryView: defineAsyncComponent(function () {
    return import('@/views/Order/IdocHistoryView.vue')
  }),

  // 4. MODELING (모델링)
  RouteNodeView: defineAsyncComponent(function () {
    return import('@/views/Modeling/RouteNodeView.vue')
  }),
  RouteLinkView: defineAsyncComponent(function () {
    return import('@/views/Modeling/RouteLinkView.vue')
  }),
  AltZoneView: defineAsyncComponent(function () {
    return import('@/views/Modeling/AltZoneView.vue')
  }),
  AlarmDefView: defineAsyncComponent(function () {
    return import('@/views/Modeling/AlarmDefView.vue')
  }),
  SubTransferRuleView: defineAsyncComponent(function () {
    return import('@/views/Modeling/SubTransferRuleView.vue')
  }),

  // 5. SETTINGS (설정)
  UserMgmtView: defineAsyncComponent(function () {
    return import('@/views/Settings/UserMgmtView.vue')
  }),
  DeptMgmtView: defineAsyncComponent(function () {
    return import('@/views/Settings/DeptMgmtView.vue')
  }),
  UserGroupMgmtView: defineAsyncComponent(function () {
    return import('@/views/Settings/UserGroupMgmtView.vue')
  }),
  MenuMgmtView: defineAsyncComponent(function () {
    return import('@/views/Settings/MenuMgmtView.vue')
  }),
  MenuAuthView: defineAsyncComponent(function () {
    return import('@/views/Settings/MenuAuthView.vue')
  }),
  AdminAuthView: defineAsyncComponent(function () {
    return import('@/views/Settings/AdminAuthView.vue')
  }),
  PasswordPolicyView: defineAsyncComponent(function () {
    return import('@/views/Settings/PasswordPolicyView.vue')
  }),

  // 기존 화면 (하위 호환 유지)
  ProcessStatusView: defineAsyncComponent(function () {
    return import('@/views/Production/ProcessStatusView.vue')
  }),
  ProcessStatusVer2View: defineAsyncComponent(function () {
    return import('@/views/Production/ProcessStatusVer2View.vue')
  }),
  PurgeConfigView: defineAsyncComponent(function () {
    return import('@/views/Definition/PurgeConfigView.vue')
  }),
  ProcessInfoView: defineAsyncComponent(function () {
    return import('@/views/Definition/ProcessInfoView.vue')
  }),
  PurgeLogView: defineAsyncComponent(function () {
    return import('@/views/History/PurgeLogView.vue')
  }),
  ProcessStatusHistoryView: defineAsyncComponent(function () {
    return import('@/views/History/ProcessStatusHistoryView.vue')
  }),
}
