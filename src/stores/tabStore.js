import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTabStore = defineStore('tab', function () {
  const openTabs = ref([]) // { id, title, titleKey, componentName, params } 형태
  const activeTabId = ref(null)

  // 탭 추가 또는 이동 함수
  function addTab(menuItem) {
    // 1. 이미 열려 있는지 확인
    const existingTab = openTabs.value.find(function (tab) {
      return tab.id === menuItem.id
    })

    if (existingTab) {
      // 2. 이미 있다면 해당 탭으로 활성화
      activeTabId.value = existingTab.id
    } else {
      // 3. 없다면 새로 추가
      const newTab = {
        id: menuItem.id,
        title: menuItem.title,
        titleKey: 'menu.' + menuItem.id,
        componentName: menuItem.componentName, // 화면 컴포넌트 명
      }
      openTabs.value.push(newTab)
      activeTabId.value = newTab.id
    }
  }

  // 단일 탭 닫기 함수
  function closeTab(tabId) {
    const index = openTabs.value.findIndex(function (tab) {
      return tab.id === tabId
    })
    if (index !== -1) {
      openTabs.value.splice(index, 1)
      // 닫은 탭이 현재 활성 탭이면 다른 탭으로 이동 로직
      if (activeTabId.value === tabId) {
        if (openTabs.value.length > 0) {
          activeTabId.value = openTabs.value[openTabs.value.length - 1].id
        } else {
          activeTabId.value = null
        }
      }
    }
  }

  // 다른 탭 모두 닫기 함수
  function closeOtherTabs(tabId) {
    const targetTab = openTabs.value.find(function (tab) {
      return tab.id === tabId
    })

    if (targetTab) {
      openTabs.value = [targetTab]
      activeTabId.value = tabId
    }
  }

  // 모든 탭 닫기 함수
  function closeAllTabs() {
    openTabs.value = []
    activeTabId.value = null
  }

  // clearTabs alias
  function clearTabs() {
    closeAllTabs()
  }

  return {
    openTabs,
    activeTabId,
    addTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    clearTabs,
  }
})
