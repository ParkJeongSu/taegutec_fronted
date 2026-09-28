<template>
  <DataTableWidget :title="$t('views.definition.purgeConfig.title')">
    <template v-slot:search>
      <SearchPanel v-on:search="onSearch">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchParams.tableName"
            :label="$t('table.tableName')"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="searchParams.isActive"
            :items="['전체', 'Y', 'N']"
            :label="$t('table.isActive')"
            density="compact"
          ></v-select>
        </v-col>
      </SearchPanel>
    </template>

    <template v-slot:actions>
      <v-btn color="primary" prepend-icon="$plus" v-on:click="onAdd">{{ $t('common.create') }}</v-btn>
      <v-btn color="error" prepend-icon="$delete" v-on:click="onOpenDelete">{{ $t('common.delete') }}</v-btn>
    </template>

    <template v-slot:table>
      <BaseDataTable
        v-model="selectedRows"
        :headers="headers"
        :items="items"
        :total-items="totalItems"
        :loading="loading"
        item-value="id"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      >
        <template v-slot:[`item.isActive`]="{ item }">
          <v-chip :color="item.isActive === 'Y' ? 'success' : 'grey'" size="small">
            {{ item.isActive === 'Y' ? $t('common.active') : $t('common.inactive') }}
          </v-chip>
        </template>
      </BaseDataTable>
    </template>
  </DataTableWidget>

  <ConfirmDialog
    v-model="deleteDialog"
    :message="$t('views.definition.purgeConfig.deleteConfirm', { count: selectedRows.length })"
    v-on:confirm="onDeleteConfirm"
  />
</template>

<script setup>
import { ref, reactive, computed, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTableWidget from '@/components/widgets/DataTableWidget.vue'
import SearchPanel from '@/components/widgets/SearchPanel.vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import PurgeConfigForm from './components/PurgeConfigForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchPurgeConfigApi, deletePurgeConfigApi } from '@/api/purgeConfig'

const { t } = useI18n()
const panelStore = usePanelStore()
const selectedRows = ref([])
const deleteDialog = ref(false)

const searchParams = reactive({ tableName: '', isActive: '전체' })

const headers = computed(() => [
  { title: 'ID', key: 'id', width: '80px' },
  { title: t('table.dbName'), key: 'dbName' },
  { title: t('table.tableName'), key: 'tableName' },
  { title: t('table.targetColumn'), key: 'targetColumnName' },
  { title: t('table.compValue'), key: 'compValue' },
  { title: t('table.batchSize'), key: 'batchSize' },
  { title: t('table.isActive'), key: 'isActive', align: 'center' },
])

const { items, totalItems, loading, loadData, updateOptions } = useDataTable(fetchPurgeConfigApi)

function onSearch() {
  loadData(searchParams)
}
function onUpdateOptions(options) {
  updateOptions(options, searchParams)
}

function onAdd() {
  panelStore.setSelectedItem(null, markRaw(PurgeConfigForm), t('views.definition.purgeConfig.createTitle'), 'add')
  panelStore.onSuccess = onSearch
  panelStore.togglePanel()
}

function onRowClick(event, row) {
  panelStore.setSelectedItem(row.item, markRaw(PurgeConfigForm), t('views.definition.purgeConfig.editTitle'), 'edit')
  panelStore.onSuccess = onSearch
  panelStore.togglePanel()
}

function onOpenDelete() {
  if (selectedRows.value.length === 0) return alert(t('validation.selectItemToDelete'))
  deleteDialog.value = true
}

async function onDeleteConfirm() {
  const idList = []
  for (let i = 0; i < selectedRows.value.length; i++) {
    idList.push(selectedRows.value[i].id)
  }

  const payload = {
    ids: idList,
  }
  try {
    await deletePurgeConfigApi(payload)
    alert(t('views.definition.purgeConfig.deleteSuccess'))
    onSearch()
  } catch (error) {
    alert(t('views.definition.purgeConfig.deleteFail'))
  } finally {
    selectedRows.value = []
  }
}
</script>
