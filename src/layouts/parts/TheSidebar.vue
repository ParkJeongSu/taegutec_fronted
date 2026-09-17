<template>
  <v-navigation-drawer
    v-model="menuStore.isSidebarOpen"
    :width="260"
    class="sidebar-drawer"
    elevation="1"
  >
    <v-list-item class="bg-light-green-lighten-5 py-3">
      <v-list-item-title class="font-weight-bold text-subtitle-1">
        {{ menuStore.selectedL2 ? getMenuTitle(menuStore.selectedL2) : $t('common.selectMenuGuide') }}
      </v-list-item-title>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav class="py-2">
      <v-list-item
        v-for="l3 in menuStore.currentL3List"
        :key="l3.id"
        color="primary"
        class="mb-1 rounded"
        v-on:click="onMenuClick(l3)"
      >
        <template #prepend>
          <v-icon icon="$chevronRight" size="16" color="medium-emphasis" />
        </template>
        <v-list-item-title class="font-weight-medium">
          {{ getMenuTitle(l3) }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores/menuStore'
import { useTabStore } from '@/stores/tabStore'

const { t, te } = useI18n()
const menuStore = useMenuStore()
const tabStore = useTabStore()

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
  tabStore.addTab(menuItem)
}
</script>

<style scoped>
.sidebar-drawer {
  /* L1(48px) + L2(48px) = 96px 만큼 위에서 떨어져야 함 */
  top: 96px !important;
  height: calc(100% - 96px) !important;
}
</style>
