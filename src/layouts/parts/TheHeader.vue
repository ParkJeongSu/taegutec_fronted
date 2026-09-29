<template>
  <div class="header-container">
    <!-- L1: 최상단 대메뉴 바 -->
    <v-app-bar color="primary" density="comfortable" elevation="0" flat class="l1-app-bar px-4">
      <div class="l1-nav-grid w-100">
        <!-- 좌측: 로고 -->
        <div class="nav-left d-flex align-center">
          <v-icon icon="$robotIndustrial" size="24" color="white" class="mr-2" />
          <span class="font-weight-bold brand-title text-truncate">{{ currentPlantTitle }}</span>
        </div>

        <!-- 중앙: 대메뉴 탭 -->
        <div class="nav-center d-flex justify-center align-center">
          <v-tabs
            :model-value="String(menuStore.selectedL1Id)"
            color="white"
            slider-color="white"
            align-tabs="center"
            selected-class="l1-tab-active"
            class="l1-tabs"
            v-on:update:model-value="handleL1Change"
          >
            <v-tab
              v-for="l1 in menuStore.menuTree"
              :key="l1.id"
              :value="String(l1.id)"
              class="l1-tab-item font-weight-medium"
            >
              {{ getMenuTitle(l1) }}
            </v-tab>
          </v-tabs>
        </div>

        <!-- 우측: 알람 / 플랜트 칩 / 사용자 드롭다운 -->
        <div class="nav-right d-flex align-center justify-end">
          <v-btn
            icon
            variant="text"
            color="white"
            class="mr-2 alarm-bell-btn"
            :title="$t('common.realtimeAlarm')"
            v-on:click="alarmStore.togglePanel"
          >
            <v-badge
              :content="alarmStore.unreadCount"
              :model-value="alarmStore.unreadCount > 0"
              color="error"
              max="99"
            >
              <v-icon :icon="alarmStore.unreadCount > 0 ? '$bellRing' : '$bellOutline'" size="20" />
            </v-badge>
          </v-btn>

          <v-chip
            variant="tonal"
            color="white"
            size="small"
            class="mr-3 font-weight-bold plant-tag-chip"
          >
            {{ plantCode }}
          </v-chip>

          <v-menu location="bottom end" transition="scale-transition">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                color="white"
                class="user-menu-btn text-none px-2 rounded-lg"
              >
                <v-avatar size="28" color="rgba(255, 255, 255, 0.2)" class="mr-2">
                  <v-icon icon="$account" size="18" color="white" />
                </v-avatar>
                <span class="user-display-name mr-1">{{ displayUserLabel }}</span>
                <v-icon icon="$dropdown" size="16" />
              </v-btn>
            </template>

            <v-card min-width="260" class="elevation-6 rounded-lg user-dropdown-card mt-1">
              <v-list density="compact" class="py-2">
                <v-list-item class="px-4 py-2">
                  <template #prepend>
                    <v-avatar color="primary" size="36" class="mr-3">
                      <v-icon icon="$account" color="white" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">
                    {{ displayEmployeeId }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption text-medium-emphasis">
                    {{ plantDescription }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-divider class="my-1"></v-divider>

                <v-list-item prepend-icon="$translate" :title="$t('common.language')">
                  <template #append>
                    <v-btn-toggle
                      v-model="currentLocale"
                      mandatory
                      density="compact"
                      variant="outlined"
                      color="primary"
                      class="locale-btn-toggle"
                      v-on:update:model-value="changeLocale"
                    >
                      <v-btn value="ko" size="x-small" class="font-weight-bold">KO</v-btn>
                      <v-btn value="en" size="x-small" class="font-weight-bold">EN</v-btn>
                    </v-btn-toggle>
                  </template>
                </v-list-item>

                <v-list-item
                  prepend-icon="$bellRing"
                  :title="$t('common.realtimeAlarm')"
                  class="alarm-menu-item font-weight-medium"
                  v-on:click="handleOpenAlarmPanel"
                >
                  <template #append>
                    <v-chip
                      v-if="alarmStore.unreadCount > 0"
                      color="error"
                      size="x-small"
                      variant="flat"
                      class="font-weight-bold"
                    >
                      {{ alarmStore.unreadCount }}{{ $t('common.countUnit') }}
                    </v-chip>
                    <v-chip v-else color="grey-lighten-1" size="x-small" variant="tonal">
                      {{ alarmStore.alarmList.length }}{{ $t('common.countUnit') }}
                    </v-chip>
                  </template>
                </v-list-item>

                <v-divider class="my-1"></v-divider>

                <v-list-item
                  prepend-icon="$logout"
                  :title="$t('common.logout')"
                  class="logout-item text-error font-weight-medium"
                  v-on:click="handleLogout"
                ></v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </div>
    </v-app-bar>

    <!-- L2: 중메뉴 바 -->
    <v-sheet color="secondary" class="l2-menu-bar d-flex align-center">
      <!-- 사이드바 열기/닫기 토글 -->
      <v-btn icon variant="text" color="white" class="mx-2" v-on:click="menuStore.toggleSidebar">
        <v-icon :icon="menuStore.isSidebarOpen ? '$close' : '$menu'" />
      </v-btn>

      <!--
        ✨ 해결 포인트 1: :key="menuStore.selectedL1Id"
        L1 대메뉴가 바뀔 때마다 L2 탭 인스턴스를 완전히 리셋하여,
        첫 번째 탭에 l2-tab-active CSS와 슬라이더가 100% 즉시 활성화됩니다.
      -->
      <v-tabs
        :key="String(menuStore.selectedL1Id)"
        :model-value="String(menuStore.selectedL2Id)"
        color="white"
        slider-color="white"
        selected-class="l2-tab-active"
        class="l2-tabs-container"
        v-on:update:model-value="handleL2Change"
      >
        <v-tab
          v-for="l2 in menuStore.currentL2List"
          :key="l2.id"
          :value="String(l2.id)"
          class="l2-tab-item"
        >
          {{ getMenuTitle(l2) }}
        </v-tab>
      </v-tabs>
    </v-sheet>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores/menuStore'
import { useAuthStore } from '@/stores/auth'
import { useAlarmStore } from '@/stores/alarmStore'
import { APP_TITLE, PLANT_TYPE, isInsert, isPowder } from '@/constants/plant'

const { locale, t, te } = useI18n()
const menuStore = useMenuStore()
const authStore = useAuthStore()
const alarmStore = useAlarmStore()

const currentLocale = ref(locale.value)
const currentPlantTitle = APP_TITLE
const plantCode = PLANT_TYPE

function getMenuTitle(item) {
  if (!item) {
    return ''
  }
  const code = item.menuId || item.id
  if (code) {
    const key = 'menu.' + code
    if (te(key)) {
      return t(key)
    }
  }
  return item.title || item.menuName || item.id
}

function handleL1Change(newVal) {
  if (newVal !== null && newVal !== undefined) {
    menuStore.selectL1(String(newVal))
  }
}

function handleL2Change(newVal) {
  if (newVal !== null && newVal !== undefined) {
    menuStore.selectL2(String(newVal))
  }
}

function changeLocale(newLocale) {
  if (newLocale) {
    locale.value = newLocale
    currentLocale.value = newLocale
    localStorage.setItem('user_locale', newLocale)
  }
}

const displayEmployeeId = computed(function () {
  if (authStore.currentUser && authStore.currentUser.employeeId) {
    return authStore.currentUser.employeeId
  }
  return t('common.employee')
})

const displayUserLabel = computed(function () {
  if (authStore.currentUser && authStore.currentUser.employeeId) {
    const suffix = t('common.userSuffix')
    return suffix
      ? `${authStore.currentUser.employeeId} ${suffix}`
      : authStore.currentUser.employeeId
  }
  return t('common.user')
})

const plantDescription = computed(function () {
  if (isInsert()) {
    return t('common.insertPlantAffiliation')
  }
  if (isPowder()) {
    return t('common.powderPlantAffiliation')
  }
  return t('common.plantAffiliation', { plant: plantCode })
})

function handleOpenAlarmPanel() {
  alarmStore.openPanel()
}

function handleLogout() {
  authStore.logout()
}
</script>

<style scoped>
.header-container {
  position: relative;
  z-index: 1000;
}

.l1-app-bar {
  display: flex;
  align-items: center;
}

.l1-nav-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
  align-items: center;
  width: 100%;
}

.nav-left {
  justify-self: start;
}

.nav-center {
  justify-self: center;
}

.nav-right {
  justify-self: end;
}

.brand-title {
  font-size: 1.15rem;
  letter-spacing: -0.3px;
}

.l1-tabs {
  height: 48px;
}

.l1-tab-item {
  letter-spacing: 0.3px;
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.2s ease-in-out;
  border-radius: 4px 4px 0 0;
}

.l1-tab-item.l1-tab-active {
  color: #ffffff !important;
  font-weight: 700 !important;
  background-color: rgba(255, 255, 255, 0.18) !important;
}

.plant-tag-chip {
  letter-spacing: 0.5px;
}

.user-menu-btn {
  height: 36px;
  background-color: rgba(255, 255, 255, 0.1);
}

.user-menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-display-name {
  font-size: 0.875rem;
  font-weight: 600;
}

.user-dropdown-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.locale-btn-toggle {
  height: 28px;
}

.logout-item:hover {
  background-color: rgba(255, 82, 82, 0.08);
}

/* L2 부모 컨테이너: 정확히 48px */
.l2-menu-bar {
  height: 48px;
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  z-index: 999;
}

/*
  ✨ 해결 포인트 2: 중메뉴 수직 정중앙 정렬
  - 부모 48px 전체를 채우도록 설정
  - 내부 슬라이드 그룹 컨테이너를 세로 중앙으로 강제 정렬
*/
.l2-tabs-container {
  height: 48px !important;
}

:deep(.l2-tabs-container .v-slide-group__container) {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
}

:deep(.l2-tabs-container .v-slide-group__content) {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
}

/* 탭 버튼 자체의 높이 및 내부 글씨 정렬 */
.l2-tab-item {
  height: 36px !important;
  min-height: 36px !important;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.2px;
  font-size: 0.875rem;
  margin: 0 2px;
  padding: 0 16px;
  border-radius: 4px;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease-in-out;
}

/* L2 탭 내부의 Vuetify 텍스트 래퍼 (.v-btn__content) 중앙 강제 */
:deep(.l2-tab-item .v-btn__content) {
  display: flex !important;
  align-items: center !important;
  line-height: 1 !important;
}

/* L2 선택된 탭 활성 스타일 */
.l2-tab-item.l2-tab-active {
  color: #ffffff !important;
  font-weight: 700 !important;
  background-color: rgba(255, 255, 255, 0.22) !important;
}
</style>
