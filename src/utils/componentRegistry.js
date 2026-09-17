import { defineAsyncComponent } from 'vue'

export const componentMap = {
  // 1. DASHBOARD (대시보드)
  WorkStationView: defineAsyncComponent(function () {
    return import('@/views/Dashboard/WorkStationView.vue')
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
