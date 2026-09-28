<template>
  <div class="form-container d-flex flex-column fill-height">
    <v-form class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <v-col cols="6">
          <v-text-field
            v-model="formData.port"
            label="PORT (PK)"
            type="number"
            :readonly="panelStore.mode === 'edit'"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.systemName" :label="$t('views.definition.processInfo.form.systemName')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.processGroupName" :label="$t('views.definition.processInfo.form.groupName')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.processName" :label="$t('views.definition.processInfo.form.processName')"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="formData.fileName" :label="$t('views.definition.processInfo.form.fileName')"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="formData.copyDir" :label="$t('views.definition.processInfo.form.copyDir')"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="formData.workingDir" :label="$t('views.definition.processInfo.form.workingDir')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.batchDir" :label="$t('views.definition.processInfo.form.batchDir')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.batchName" :label="$t('views.definition.processInfo.form.batchName')"></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="formData.description" :label="$t('views.definition.processInfo.form.description')" rows="3"></v-textarea>
        </v-col>
      </v-row>
    </v-form>

    <v-divider></v-divider>
    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" color="secondary" v-on:click="panelStore.closePanel">{{ $t('common.cancel') }}</v-btn>
      <v-btn color="primary" variant="elevated" :loading="isSaving" v-on:click="onHandleSave">
        {{ panelStore.mode === 'add' ? $t('common.save') : $t('common.edit') }}
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePanelStore } from '@/stores/panelStore'
import { useBaseForm } from '@/composables/useBaseForm'
import { saveProcessInfoApi } from '@/api/processInfo'

const { t } = useI18n()
const panelStore = usePanelStore()
const formData = reactive({
  port: null,
  systemName: '',
  fileName: '',
  processGroupName: '',
  processName: '',
  description: '',
  copyDir: '',
  workingDir: '',
  batchDir: '',
  batchName: '',
})

const { isSaving, submitForm } = useBaseForm(saveProcessInfoApi)

watch(
  function () {
    return panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      Object.assign(formData, newVal)
    }
  },
  { immediate: true },
)

async function onHandleSave() {
  await submitForm(panelStore.mode, formData, function () {
    alert(t('views.definition.processInfo.form.saved'))
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
