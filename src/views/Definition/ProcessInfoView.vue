<template>
  <DataTableWidget :title="$t('views.definition.processInfo.title')">
    <template v-slot:search>
      <SearchPanel v-on:search="onSearch">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchParams.processName"
            :label="$t('table.processName')"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchParams.systemName"
            :label="$t('table.systemName')"
            density="compact"
          ></v-text-field>
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
        item-value="port"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      />
    </template>
  </DataTableWidget>

  <ConfirmDialog
    v-model="deleteDialog"
    :message="$t('views.definition.processInfo.deleteConfirm', { count: selectedRows.length })"
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
import ProcessInfoForm from './components/ProcessInfoForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchProcessInfoApi, deleteProcessInfoApi } from '@/api/processInfo'

const { t } = useI18n()
const panelStore = usePanelStore()
const selectedRows = ref([])
const deleteDialog = ref(false)

const searchParams = reactive({
  processName: '',
  systemName: '',
})

const headers = computed(() => [
  { title: t('table.port'), key: 'port', width: '100px' },
  { title: t('table.systemName'), key: 'systemName' },
  { title: t('table.groupName'), key: 'processGroupName' },
  { title: t('table.processName'), key: 'processName' },
  { title: t('table.batchName'), key: 'batchName' },
  { title: t('table.description'), key: 'description' },
])

const { items, totalItems, loading, loadData, updateOptions } = useDataTable(fetchProcessInfoApi)

function onSearch() {
  loadData(searchParams)
}

function onUpdateOptions(options) {
  updateOptions(options, searchParams)
}

function onAdd() {
  panelStore.setSelectedItem(null, markRaw(ProcessInfoForm), t('views.definition.processInfo.createTitle'), 'add')
  panelStore.onSuccess = onSearch
  if (!panelStore.isOpen) panelStore.togglePanel()
}

function onOpenDelete() {
  if (selectedRows.value.length === 0) return alert(t('validation.selectItemToDelete'))
  deleteDialog.value = true
}

async function onDeleteConfirm() {
  const portList = []
  for (let i = 0; i < selectedRows.value.length; i++) {
    portList.push(selectedRows.value[i].port)
  }

  const payload = {
    ids: portList,
  }

  try {
    await deleteProcessInfoApi(payload)
    alert(t('views.definition.processInfo.deleteSuccess'))
    onSearch()
  } catch (error) {
    alert(t('views.definition.processInfo.deleteFail'))
  } finally {
    selectedRows.value = []
  }
}

function onRowClick(event, row) {
  panelStore.setSelectedItem(row.item, markRaw(ProcessInfoForm), t('views.definition.processInfo.editTitle'), 'edit')
  panelStore.onSuccess = onSearch
  if (!panelStore.isOpen) panelStore.togglePanel()
}
</script>
