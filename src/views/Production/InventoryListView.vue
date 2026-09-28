<template>
  <DataTableWidget :title="$t('views.production.inventory.title')">
    <!-- [슬롯 1] 규격화된 검색 패널 사용 -->
    <template v-slot:search>
      <SearchPanel v-on:search="onSearch">
        <v-col cols="12" md="3">
          <v-text-field v-model="searchParams.itemCode" :label="$t('table.itemCode')" density="compact"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="searchParams.whType"
            :items="['전체', '창고A', '창고B', '원자재창고', '완제품창고', '공정간창고']"
            :label="$t('views.production.inventory.whType')"
            density="compact"
          ></v-select>
        </v-col>
      </SearchPanel>
    </template>

    <!-- [슬롯 2] 버튼 액션 -->
    <template v-slot:actions>
      <v-btn color="primary" prepend-icon="$plus" class="mr-2" v-on:click="onAdd">{{ $t('common.create') }}</v-btn>
      <v-btn color="secondary" variant="tonal" prepend-icon="$refresh" class="mr-2" v-on:click="onSearch">{{ $t('common.refresh') }}</v-btn>
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
        density="compact"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      />
    </template>
  </DataTableWidget>
</template>

<script setup>
import { ref, reactive, computed, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTableWidget from '@/components/widgets/DataTableWidget.vue'
import { usePanelStore } from '@/stores/panelStore'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import InventoryForm from './components/InventoryForm.vue'
import { useDataTable } from '@/composables/useDataTable'

const { t } = useI18n()
const panelStore = usePanelStore()

// [기능 1] 추가 버튼 클릭
function onAdd() {
  panelStore.openPanel(markRaw(InventoryForm), {
    mode: 'CREATE',
    data: null,
    title: t('views.production.inventory.createTitle'),
    onSuccess: onSearch,
  })
}

// [기능 2] 로우 클릭 시 (수정/상세 모드로 패널 열기)
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  if (itemData) {
    panelStore.openPanel(markRaw(InventoryForm), {
      mode: 'UPDATE',
      data: itemData,
      title: t('views.production.inventory.detailTitle'),
      onSuccess: onSearch,
    })
  }
}

async function fetchInventoryMock(params) {
  await new Promise(function (resolve) {
    setTimeout(resolve, 300)
  })

  return {
    total: 3,
    data: [
      { id: 1, whName: '자재1창고', whType: '창고A', itemCode: 'ITEM-001', qty: 500, lotNo: 'LOT-2026-001', unit: 'EA', useState: 'USE' },
      { id: 2, whName: '제품A창고', whType: '창고B', itemCode: 'ITEM-002', qty: 1200, lotNo: 'LOT-2026-002', unit: 'EA', useState: 'USE' },
      { id: 3, whName: '원자재창고', whType: '원자재창고', itemCode: 'ITEM-003', qty: 850, lotNo: 'LOT-2026-003', unit: 'EA', useState: 'USE' },
    ],
  }
}

const searchParams = reactive({ itemCode: '', whType: '전체' })
const inventoryHeaders = computed(function () {
  return [
    { title: t('table.whName'), key: 'whName' },
    { title: t('views.production.inventory.whType'), key: 'whType' },
    { title: t('table.itemCode'), key: 'itemCode' },
    { title: 'LOT 번호', key: 'lotNo' },
    { title: t('table.currentQty'), key: 'qty', align: 'end' },
    { title: '단위', key: 'unit', align: 'center' },
  ]
})

const { items, totalItems, loading, loadData, updateOptions } = useDataTable(fetchInventoryMock)

function onSearch() {
  loadData(searchParams)
}

function onUpdateOptions(options) {
  updateOptions(options, searchParams)
}
</script>
