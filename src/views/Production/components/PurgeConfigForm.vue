<template>
  <div class="form-container d-flex flex-column fill-height">
    <v-form class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <v-col cols="6">
          <v-text-field
            v-model="formData.id"
            :label="$t('views.definition.purgeConfig.form.policyId')"
            type="number"
            :readonly="panelStore.mode === 'edit'"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-select v-model="formData.isActive" :items="['Y', 'N']" :label="$t('views.definition.purgeConfig.form.isActive')"></v-select>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.dbName" :label="$t('views.definition.purgeConfig.form.dbName')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.schemaName" :label="$t('views.definition.purgeConfig.form.schemaName')"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="formData.tableName" :label="$t('views.definition.purgeConfig.form.tableName')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.targetColumnName" :label="$t('views.definition.purgeConfig.form.targetColumn')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="formData.dataType"
            :items="['DATE', 'NUMBER', 'STRING']"
            :label="$t('views.definition.purgeConfig.form.dataType')"
          ></v-select>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.operator" :label="$t('views.definition.purgeConfig.form.operator')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.compValue" :label="$t('views.definition.purgeConfig.form.compValue')"></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-text-field v-model="formData.batchSize" :label="$t('views.definition.purgeConfig.form.batchSize')" type="number"></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model="formData.maxLoopCount"
            :label="$t('views.definition.purgeConfig.form.maxLoop')"
            type="number"
          ></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-text-field v-model="formData.delayMs" :label="$t('views.definition.purgeConfig.form.delayMs')" type="number"></v-text-field>
        </v-col>
      </v-row>
    </v-form>

    <v-divider></v-divider>
    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" color="secondary" v-on:click="panelStore.closePanel">{{ $t('common.close') }}</v-btn>
      <v-btn color="primary" variant="elevated" :loading="isSaving" v-on:click="onHandleSave">
        {{ $t('common.save') }}
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePanelStore } from '@/stores/panelStore'
import { useBaseForm } from '@/composables/useBaseForm'
import { savePurgeConfigApi } from '@/api/purgeConfig'

const { t } = useI18n()
const panelStore = usePanelStore()
const formData = reactive({
  id: null,
  dbName: '',
  schemaName: 'dbo',
  tableName: '',
  targetColumnName: '',
  dataType: 'DATE',
  operator: '<',
  compValue: '',
  batchSize: 1000,
  maxLoopCount: 10,
  delayMs: 100,
  isActive: 'Y',
})

const { isSaving, submitForm } = useBaseForm(savePurgeConfigApi)

watch(
  function () {
    return panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) Object.assign(formData, newVal)
  },
  { immediate: true },
)

async function onHandleSave() {
  await submitForm(panelStore.mode, formData, function () {
    alert(t('views.definition.purgeConfig.form.saved'))
    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  })
}
</script>

<style scoped>
.form-container {
  height: 100%;
}
</style>
