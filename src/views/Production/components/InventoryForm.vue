<template>
  <div class="form-container d-flex flex-column fill-height">
    <v-form class="flex-grow-1 overflow-y-auto pa-4">
      <v-text-field
        v-model="formData.itemCode"
        :label="$t('table.itemCode')"
        :readonly="panelStore.mode === 'view'"
      ></v-text-field>

      <v-select
        v-model="formData.whType"
        :items="['창고A', '창고B']"
        :label="$t('views.production.inventory.whType')"
        :readonly="panelStore.mode === 'view'"
      ></v-select>
    </v-form>

    <v-divider></v-divider>
    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" color="secondary" v-on:click="panelStore.closePanel"> {{ $t('common.close') }} </v-btn>

      <v-btn
        v-if="panelStore.mode !== 'view'"
        color="primary"
        variant="elevated"
        :loading="isSaving"
        v-on:click="onHandleSave"
      >
        {{ panelStore.mode === 'add' ? $t('common.create') : $t('common.edit') }}
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePanelStore } from '@/stores/panelStore'
import { useBaseForm } from '@/composables/useBaseForm'
import { saveInventoryApi } from '@/api/inventory'

const { t } = useI18n()
const panelStore = usePanelStore()
const formData = reactive({ itemCode: '', whType: '' })
const { isSaving, submitForm } = useBaseForm(saveInventoryApi)

watch(
  function () {
    return panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.itemCode = newVal.itemCode
      formData.whType = newVal.whType
    }
  },
  { immediate: true },
)

async function onHandleSave() {
  const success = await submitForm(panelStore.mode, formData, function (res) {
    alert(t('common.saveSuccess'))
    panelStore.closePanel()
  })
  if (success) {
    alert(t('common.saveSuccess'))
    panelStore.closePanel()
  }
}
</script>

<style scoped>
.form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
