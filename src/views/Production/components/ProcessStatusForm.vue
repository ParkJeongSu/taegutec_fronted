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
          <v-text-field v-model="formData.systemName" :label="$t('table.systemName')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.processGroupName" :label="$t('table.processGroupName')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.processName" :label="$t('table.processName')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.status" :label="$t('common.status')"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.pid" :label="$t('table.pid')" type="number"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="formData.startRequestTime"
            :label="$t('table.startRequestTime')"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="formData.startTime"
            :label="$t('table.startTime')"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="formData.endRequestTime"
            :label="$t('table.endRequestTime')"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="formData.endTime"
            :label="$t('table.endTime')"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="formData.description" :label="$t('table.description')" rows="3"></v-textarea>
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
  processGroupName: '',
  processName: '',
  description: '',
  status: '',
  pid: null,
  startRequestTime: null,
  startTime: null,
  endRequestTime: null,
  endTime: '',
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
  const success = await submitForm(panelStore.mode, formData, function () {
    alert(t('common.saveSuccess'))
    panelStore.closePanel()
  })
}
</script>

<style scoped>
.form-container {
  height: 100%;
}
</style>
