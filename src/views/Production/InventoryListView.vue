<template>
  <DataTableWidget :title="$t('views.production.inventory.title')">
    <!-- [슬롯 1] 규격화된 검색 패널 사용 -->
    <template v-slot:search>
      <SearchPanel v-on:search="onSearch">
        <!-- 화면별로 다른 입력 항목만 여기에 작성 -->
        <v-col cols="12" md="3">
          <v-text-field v-model="searchParams.itemCode" :label="$t('table.itemCode')"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="searchParams.whType"
            :items="['전체', '창고A', '창고B']"
            :label="$t('views.production.inventory.whType')"
          ></v-select>
        </v-col>
      </SearchPanel>
    </template>

    <!-- [슬롯 2] 버튼 액션 -->
    <template v-slot:actions>
      <v-btn color="primary" prepend-icon="$plus" v-on:click="onAdd">{{ $t('common.create') }}</v-btn>
      <v-btn color="error" prepend-icon="$delete" v-on:click="onOpenDelete">{{ $t('common.delete') }}</v-btn>
      <v-divider vertical class="mx-2"></v-divider>
      <v-btn color="success" prepend-icon="$fileExcel">{{ $t('common.exportOutput') }}</v-btn>
    </template>

    <!-- [슬롯 3] 실제 테이블 -->
    <template v-slot:table>
      <BaseDataTable
        :headers="inventoryHeaders"
        :items="items"
        :total-items="totalItems"
        :loading="loading"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      />
    </template>
  </DataTableWidget>
  <!-- 공통 삭제 확인 팝업 -->
  <ConfirmDialog
    v-model="deleteDialog"
    :message="$t('views.production.inventory.deleteConfirm', { count: selectedRows.length })"
    v-on:confirm="onDeleteConfirm"
  />
</template>

<script setup>
import { ref, reactive, computed, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTableWidget from '@/components/widgets/DataTableWidget.vue'
import { usePanelStore } from '@/stores/panelStore'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import InventoryForm from './components/InventoryForm.vue'
import { useDataTable } from '@/composables/useDataTable'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const { t } = useI18n()
const panelStore = usePanelStore()
const selectedRows = ref([])
const deleteDialog = ref(false)

// [기능 1] 추가 버튼 클릭
function onAdd() {
  panelStore.setSelectedItem(null, markRaw(InventoryForm), t('views.production.inventory.createTitle'), 'add')
  if (!panelStore.isOpen) panelStore.togglePanel()
}

// [기능 2] 삭제 버튼 클릭 (팝업 열기)
function onOpenDelete() {
  if (selectedRows.value.length === 0) return alert(t('validation.selectItemToDelete'))
  deleteDialog.value = true
}

// [기능 3] 실제 삭제 처리
function onDeleteConfirm() {
  selectedRows.value = []
}

// [기능 4] 로우 클릭 시 (수정 모드로 패널 열기)
function onRowClick(event, row) {
  panelStore.setSelectedItem(
    row.item,
    markRaw(InventoryForm),
    t('views.production.inventory.detailTitle'),
    'view',
  )
}

async function fetchInventoryMock(params) {
  await new Promise(function (resolve) {
    setTimeout(resolve, 500)
  })

  return {
    total: 2,
    data: [
      { id: 1, whName: '자재1창고', itemCode: 'ITEM-001', qty: 500 },
      { id: 2, whName: '제품A창고', itemCode: 'ITEM-002', qty: 1200 },
    ],
  }
}

const searchParams = reactive({ itemCode: '' })
const inventoryHeaders = computed(() => [
  { title: t('table.whName'), key: 'whName' },
  { title: t('table.itemCode'), key: 'itemCode' },
  { title: t('table.currentQty'), key: 'qty', align: 'end' },
])

const { items, totalItems, loading, loadData, updateOptions } = useDataTable(fetchInventoryMock)

function onSearch() {
  loadData(searchParams)
}

function onUpdateOptions(options) {
  updateOptions(options, searchParams)
}
</script>
