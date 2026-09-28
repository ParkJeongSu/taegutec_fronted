// src/stores/panelStore.js
import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

export const usePanelStore = defineStore('panel', function () {
  const isOpen = ref(false)
  const selectedItem = ref(null)
  const selectedRowData = ref(null) // 현재 선택된 Row 데이터 보존
  const formComponent = shallowRef(null)
  const title = ref('상세 정보')
  const mode = ref('view')
  const onSuccess = ref(null)

  // 1. 데이터만 설정하는 함수 (행 클릭 시 호출)
  function setSelectedItem(item, component, panelTitle, targetMode) {
    selectedItem.value = item
    if (item) {
      selectedRowData.value = item
    }
    formComponent.value = component
    title.value = panelTitle || '상세 정보'
    mode.value = targetMode || 'view'
  }

  // 2. 선택된 Row 데이터 명시적 저장 / 초기화 함수
  function setSelectedRowData(item) {
    selectedRowData.value = item || null
  }

  function clearSelectedRowData() {
    selectedRowData.value = null
  }

  // 3. 패널 상태만 토글하는 함수 (버튼 클릭 시 호출)
  function togglePanel() {
    isOpen.value = !isOpen.value
  }

  function closePanel() {
    isOpen.value = false
    // [중요] 패널이 닫힐 때 다른 화면의 콜백과 꼬이지 않도록 깔끔하게 청소합니다.
    onSuccess.value = null
  }

  // 4. 패널 열기 및 데이터 설정 통합 헬퍼 함수
  function openPanel(component, options) {
    const opts = options || {}
    const isCreate = opts.mode === 'CREATE' || opts.mode === 'add'

    if (opts.data) {
      selectedItem.value = opts.data
      selectedRowData.value = opts.data
    } else if (isCreate && selectedRowData.value) {
      // 신규 등록 시 data가 전달되지 않았더라도 선택된 행 데이터(selectedRowData)가 있다면 복사(Pre-fill)용으로 전달
      selectedItem.value = { ...selectedRowData.value }
    } else {
      selectedItem.value = opts.data || null
    }

    formComponent.value = component
    title.value = opts.title || (isCreate ? '신규 등록' : '상세 정보')
    mode.value = opts.mode || 'view'
    if (opts.onSuccess) {
      onSuccess.value = opts.onSuccess
    }
    isOpen.value = true
  }

  return {
    isOpen,
    selectedItem,
    selectedRowData,
    formComponent,
    title,
    mode,
    onSuccess,
    setSelectedItem,
    setSelectedRowData,
    clearSelectedRowData,
    togglePanel,
    closePanel,
    openPanel,
  }
})

