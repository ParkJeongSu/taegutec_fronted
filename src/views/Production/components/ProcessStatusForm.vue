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
          <v-text-field v-model="formData.systemName" label="시스템명"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.processGroupName" label="프로세스 그룹명"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.processName" label="프로세스명"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.status" label="상태"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field v-model="formData.pid" label="PID" type="number"></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="formData.startRequestTime"
            label="시작 요청 시간"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="formData.startTime"
            label="시작 시간"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="formData.endRequestTime"
            label="종료 요청 시간"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="formData.endTime"
            label="종료 시간"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="formData.description" label="프로세스 설명" rows="3"></v-textarea>
        </v-col>
      </v-row>
    </v-form>

    <v-divider></v-divider>
    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" color="secondary" v-on:click="panelStore.closePanel">취소</v-btn>
      <v-btn color="primary" variant="elevated" :loading="isSaving" v-on:click="onHandleSave">
        {{ panelStore.mode === 'add' ? '저장' : '수정' }}
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useBaseForm } from '@/composables/useBaseForm'
import { saveProcessInfoApi } from '@/api/processInfo'

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
    alert('정상적으로 처리되었습니다.')
    panelStore.closePanel()
  })
}
</script>
