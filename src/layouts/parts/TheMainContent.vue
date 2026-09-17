<template>
  <div class="tab-wrapper">
    <!-- 탭 상단바 (열려있는 탭이 있을 때만 표시) -->
    <v-tabs
      v-if="tabStore.openTabs.length > 0"
      v-model="tabStore.activeTabId"
      color="primary"
      align-tabs="start"
      class="border-b"
    >
      <v-tab
        v-for="tab in tabStore.openTabs"
        :key="tab.id"
        :value="tab.id"
        class="tab-item font-weight-medium"
        v-on:contextmenu.prevent="openContextMenu($event, tab)"
      >
        <span>{{ getTabTitle(tab) }}</span>
        <v-btn
          icon="$close"
          variant="text"
          size="x-small"
          class="ml-2 close-tab-btn"
          v-on:click.stop="tabStore.closeTab(tab.id)"
        ></v-btn>
      </v-tab>
    </v-tabs>

    <!-- 탭 우클릭 컨텍스트 메뉴 -->
    <v-menu
      v-model="isContextMenuOpen"
      :target="contextMenuTarget"
      location="bottom start"
      :close-on-content-click="true"
    >
      <v-list density="compact" class="elevation-6 rounded-lg context-menu-list py-1">
        <v-list-item
          prepend-icon="$close"
          :title="$t('common.closeOthers')"
          class="context-menu-item"
          v-on:click="handleCloseOtherTabs"
        ></v-list-item>
        <v-list-item
          prepend-icon="$delete"
          :title="$t('common.closeAll')"
          class="context-menu-item text-error"
          v-on:click="handleCloseAllTabs"
        ></v-list-item>
      </v-list>
    </v-menu>

    <!-- 탭 내용 영역 -->
    <v-window v-if="tabStore.openTabs.length > 0" v-model="tabStore.activeTabId" class="pa-4">
      <v-window-item v-for="tab in tabStore.openTabs" :key="tab.id" :value="tab.id">
        <keep-alive>
          <component :is="getComponent(tab.componentName)" />
        </keep-alive>
      </v-window-item>
    </v-window>

    <!-- 탭이 하나도 없을 때의 기본 빈 화면 상태 -->
    <div
      v-else
      class="empty-tab-wrapper d-flex flex-column align-center justify-center py-16 text-medium-emphasis"
    >
      <v-icon icon="$dashboard" size="64" color="disabled" class="mb-3" />
      <div class="text-h6 font-weight-bold text-high-emphasis mb-1">
        {{ $t('common.noOpenTabs') }}
      </div>
      <div class="text-body-2 text-medium-emphasis">
        {{ $t('common.selectMenuGuide') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTabStore } from '@/stores/tabStore'
import { componentMap } from '@/utils/componentRegistry'

const { t, te } = useI18n()
const tabStore = useTabStore()

const isContextMenuOpen = ref(false)
const contextMenuTarget = ref([0, 0])
const selectedContextTab = ref(null)

function getTabTitle(tab) {
  if (tab.titleKey && te(tab.titleKey)) {
    return t(tab.titleKey)
  }
  const fallbackKey = 'menu.' + tab.id
  if (te(fallbackKey)) {
    return t(fallbackKey)
  }
  return tab.title || tab.id
}

function openContextMenu(event, tab) {
  selectedContextTab.value = tab
  contextMenuTarget.value = [event.clientX, event.clientY]
  isContextMenuOpen.value = true
}

function handleCloseOtherTabs() {
  if (selectedContextTab.value) {
    tabStore.closeOtherTabs(selectedContextTab.value.id)
  }
}

function handleCloseAllTabs() {
  tabStore.closeAllTabs()
}

function getComponent(name) {
  return componentMap[name] || null
}
</script>

<style scoped>
.tab-wrapper {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 96px);
}

.tab-item {
  letter-spacing: 0.2px;
}

.close-tab-btn {
  opacity: 0.7;
}

.close-tab-btn:hover {
  opacity: 1;
}

.context-menu-list {
  min-width: 160px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.context-menu-item {
  font-size: 0.875rem;
}

.empty-tab-wrapper {
  min-height: 60vh;
}
</style>
