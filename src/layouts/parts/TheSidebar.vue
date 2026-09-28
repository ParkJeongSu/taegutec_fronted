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
            class="mb-1 pl-6 text-body-2"
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
          class="mb-1 font-weight-medium"
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
  const key = 'menu.' + item.id
  if (te(key)) {
    return t(key)
  }
  return item.title || item.id
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
</style>
