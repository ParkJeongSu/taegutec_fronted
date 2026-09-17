<template>
  <div class="header-container">
    <!-- L1: 최상단 바 (좌-중-우 3분할 정렬) -->
    <v-app-bar color="primary" density="comfortable" elevation="0" flat class="l1-app-bar px-4">
      <div class="l1-nav-grid w-100">
        <!-- 좌측: 로고 및 타이틀 -->
        <div class="nav-left d-flex align-center">
          <v-icon icon="$robotIndustrial" size="24" color="white" class="mr-2" />
          <span class="font-weight-bold brand-title text-truncate">{{ currentPlantTitle }}</span>
        </div>

        <!-- 중앙: 대메뉴 탭 네비게이션 (헤더 정중앙 배치 & i18n 적용) -->
        <div class="nav-center d-flex justify-center align-center">
          <v-tabs
            :model-value="menuStore.selectedL1Id"
            color="white"
            align-tabs="center"
            class="l1-tabs"
            v-on:update:model-value="menuStore.selectL1"
          >
            <v-tab
              v-for="l1 in menuStore.menuTree"
              :key="l1.id"
              :value="l1.id"
              class="l1-tab-item font-weight-bold"
            >
              {{ getMenuTitle(l1) }}
            </v-tab>
          </v-tabs>
        </div>

        <!-- 우측: 플랜트 칩 & 사용자 메뉴 드롭다운 -->
        <div class="nav-right d-flex align-center justify-end">
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

                <!-- 언어(Locale) 변경 항목 (로그아웃 위) -->
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

                <v-divider class="my-1"></v-divider>

                <!-- 로그아웃 항목 -->
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

    <!-- L2: 중메뉴 바 (여기에 토글 버튼 배치 & i18n 적용) -->
    <v-sheet color="secondary" class="l2-menu-bar d-flex align-center">
      <!-- 사이드바 토글 버튼 -->
      <v-btn icon variant="text" color="white" class="mx-2" v-on:click="menuStore.toggleSidebar">
        <v-icon :icon="menuStore.isSidebarOpen ? '$close' : '$menu'" />
      </v-btn>

      <v-tabs
        :model-value="menuStore.selectedL2Id"
        color="white"
        slider-color="white"
        density="compact"
        selected-class="l2-tab-active"
        v-on:update:model-value="menuStore.selectL2"
      >
        <v-tab
          v-for="l2 in menuStore.currentL2List"
          :key="l2.id"
          :value="l2.id"
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
import { APP_TITLE, PLANT_TYPE, isInsert, isPowder } from '@/constants/plant'

const { locale, t, te } = useI18n()
const menuStore = useMenuStore()
const authStore = useAuthStore()

const currentLocale = ref(locale.value)

const currentPlantTitle = APP_TITLE
const plantCode = PLANT_TYPE

function getMenuTitle(item) {
  if (!item) {
    return ''
  }
  const key = 'menu.' + item.id
  if (te(key)) {
    return t(key)
  }
  return item.title || item.id
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
  return '사원'
})

const displayUserLabel = computed(function () {
  if (authStore.currentUser && authStore.currentUser.employeeId) {
    return authStore.currentUser.employeeId + ' 님'
  }
  return '사용자'
})

const plantDescription = computed(function () {
  if (isInsert()) {
    return 'INSERT 공장 소속'
  }
  if (isPowder()) {
    return 'POWDER 공장 소속'
  }
  return plantCode + ' 공장'
})

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

.l2-menu-bar {
  height: 48px;
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  z-index: 999;
}

.l2-tab-item {
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.2px;
  transition: all 0.2s ease-in-out;
}

.l2-tab-item.l2-tab-active {
  color: #ffffff !important;
  font-weight: 700 !important;
  background-color: rgba(255, 255, 255, 0.15) !important;
  border-radius: 4px;
}
</style>
