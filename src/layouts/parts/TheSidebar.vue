<template>
  <v-navigation-drawer
    v-model="menuStore.isSidebarOpen"
    location="left"
    :width="260"
    class="sidebar-drawer elevation-1"
  >
    <!-- 사이드바 상단 중메뉴 타이틀 -->
    <div class="sidebar-header px-4 py-3 bg-grey-lighten-4 border-b">
      <div class="text-subtitle-2 font-weight-bold text-high-emphasis">
        {{ currentL2Title }}
      </div>
    </div>

    <!-- 소메뉴(L3/L4) 리스트 -->
    <v-list density="compact" nav class="pa-2">
      <template v-for="l3 in menuStore.currentL3List" :key="l3.id">
        <!-- 1. 하위 자식이 있는 그룹 메뉴 (L4 존재 시) -->
        <v-list-group v-if="l3.children && l3.children.length > 0" :value="l3.id">
          <template #activator="{ props: activatorProps }">
            <v-list-item
              v-bind="activatorProps"
              :prepend-icon="resolveMenuIcon(l3.icon)"
              :title="getMenuTitle(l3)"
              color="primary"
              rounded="lg"
              class="mb-1 font-weight-medium"
            />
          </template>

          <!-- L4 자식 항목들 -->
          <v-list-item
            v-for="l4 in l3.children"
            :key="l4.id"
            :title="getMenuTitle(l4)"
            color="primary"
            rounded="lg"
            class="mb-1 pl-6 text-body-2 sidebar-menu-item"
            :class="{ 'sidebar-item-active': isMenuActive(l4) }"
            v-on:click="onMenuClick(l4)"
          />
        </v-list-group>

        <!-- 2. 단일 메뉴 항목 (L4 없는 일반 메뉴) -->
        <v-list-item
          v-else
          :key="'single-' + l3.id"
          :prepend-icon="resolveMenuIcon(l3.icon)"
          :title="getMenuTitle(l3)"
          color="primary"
          rounded="lg"
          class="mb-1 font-weight-medium sidebar-menu-item"
          :class="{ 'sidebar-item-active': isMenuActive(l3) }"
          v-on:click="onMenuClick(l3)"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores/menuStore'
import { useTabStore } from '@/stores/tabStore'

const { t, te } = useI18n()
const menuStore = useMenuStore()
const tabStore = useTabStore()

function resolveMenuIcon(iconName) {
  if (!iconName) {
    return '$circleSmall'
  }
  if (iconName.indexOf('$') === 0) {
    return iconName
  }
  return '$' + iconName
}

const currentL2Title = computed(function () {
  if (!menuStore.selectedL2) {
    return t('common.selectMenuGuide')
  }
  return getMenuTitle(menuStore.selectedL2)
})

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

// ✨ 현재 열려있는 활성 탭과 메뉴 일치 여부 판별 함수
function isMenuActive(item) {
  if (!item || !tabStore.activeTabId) {
    return false
  }

  // 1. 탭 ID와 메뉴 ID 직접 비교
  if (String(tabStore.activeTabId) === String(item.id)) {
    return true
  }

  // 2. menuId 기준 비교
  if (item.menuId && String(tabStore.activeTabId) === String(item.menuId)) {
    return true
  }

  // 3. 현재 열려있는 탭 목록에서 활성 탭 객체를 찾아 컴포넌트 명칭으로 비교
  const tabs = tabStore.openTabs || []
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i]
    if (String(tab.id) === String(tabStore.activeTabId)) {
      if (tab.componentName && item.componentName && tab.componentName === item.componentName) {
        return true
      }
      if (tab.menuId && item.menuId && tab.menuId === item.menuId) {
        return true
      }
      break
    }
  }

  return false
}

function onMenuClick(menuItem) {
  if (menuItem && menuItem.componentName) {
    tabStore.addTab(menuItem)
  }
}
</script>

<style scoped>
.sidebar-drawer {
  top: 96px !important;
  height: calc(100% - 96px) !important;
  border-right: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.sidebar-header {
  min-height: 48px;
  display: flex;
  align-items: center;
}

.sidebar-menu-item {
  transition: all 0.2s ease-in-out;
  border-left: 3px solid transparent;
}

/*
  ✨ 활성화된 사이드바 메뉴 스타일
  - 좌측에 깔끔한 포인트 보더(Primary 컬러)
  - 은은한 톤의 배경 하이라이트
  - 폰트 굵기 강조
*/
.sidebar-menu-item.sidebar-item-active {
  background-color: rgba(46, 125, 50, 0.12) !important;
  border-left: 3px solid #2e7d32 !important;
  color: #2e7d32 !important;
  font-weight: 700 !important;
}

.sidebar-menu-item.sidebar-item-active :deep(.v-icon) {
  color: #2e7d32 !important;
}
</style>
