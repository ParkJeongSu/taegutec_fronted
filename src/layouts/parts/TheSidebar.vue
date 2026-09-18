<template>
  <v-navigation-drawer
    v-model="menuStore.isSidebarOpen"
    :width="260"
    class="sidebar-drawer"
    elevation="1"
  >
    <v-list-item class="bg-light-green-lighten-5 py-3">
      <v-list-item-title class="font-weight-bold text-subtitle-1">
        {{
          menuStore.selectedL2 ? getMenuTitle(menuStore.selectedL2) : $t('common.selectMenuGuide')
        }}
      </v-list-item-title>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav class="py-2">
      <template v-for="l3 in menuStore.currentL3List" :key="l3.id">
        <!-- 조건 A (자식이 있는 그룹 메뉴) -->
        <v-list-group v-if="l3.children && l3.children.length > 0" :value="l3.id">
          <template #activator="{ props }">
            <v-list-item v-bind="props" color="primary" class="mb-1 rounded">
              <!-- <template #prepend>
                <v-icon icon="$chevronRight" size="16" color="medium-emphasis" />
              </template> -->
              <v-list-item-title class="font-weight-medium">
                {{ getMenuTitle(l3) }}
              </v-list-item-title>
            </v-list-item>
          </template>
          <!-- L4 자식 항목들 -->
          <v-list-item
            v-for="l4 in l3.children"
            :key="l4.id"
            color="primary"
            class="mb-1 rounded pl-6"
            v-on:click="onMenuClick(l4)"
          >
            <v-list-item-title class="font-weight-regular text-body-2">
              {{ getMenuTitle(l4) }}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>

        <!-- 조건 B (하위 자식이 없는 일반 메뉴) -->
        <v-list-item
          v-else
          :key="l3.id"
          color="primary"
          class="mb-1 rounded"
          v-on:click="onMenuClick(l3)"
        >
          <!-- 자식이 없으므로 $chevronRight 아이콘을 표시하지 않음 -->
          <v-list-item-title class="font-weight-medium">
            {{ getMenuTitle(l3) }}
          </v-list-item-title>
        </v-list-item>
      </template>
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
  if (menuItem && menuItem.componentName) {
    tabStore.addTab(menuItem)
  }
}
</script>

<style scoped>
.sidebar-drawer {
  /* L1(48px) + L2(48px) = 96px 만큼 위에서 떨어져야 함 */
  top: 96px !important;
  height: calc(100% - 96px) !important;
}
</style>
