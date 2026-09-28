<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 포트 번호 (PK) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.port"
            type="number"
            :label="$t('table.port')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="8080"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 시스템명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.systemName"
            :label="$t('table.systemName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="WCS"
            required
          ></v-text-field>
        </v-col>

        <!-- 프로세스 그룹명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.processGroupName"
            :label="$t('table.processGroupName')"
            variant="outlined"
            density="compact"
            placeholder="TRANSFER_GROUP"
          ></v-text-field>
        </v-col>

        <!-- 프로세스명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.processName"
            :label="$t('table.processName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="PROCESS_ROUTER"
            required
          ></v-text-field>
        </v-col>

        <!-- 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.status"
            :items="statusOptions"
            :label="$t('common.status')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- PID -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.pid"
            type="number"
            :label="$t('table.pid')"
            variant="outlined"
            density="compact"
            placeholder="12345"
          ></v-text-field>
        </v-col>

        <!-- 시작 요청 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.startRequestTime"
            :label="$t('table.startRequestTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 시작 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.startTime"
            :label="$t('table.startTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 종료 요청 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.endRequestTime"
            :label="$t('table.endRequestTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 종료 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.endTime"
            :label="$t('table.endTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 설명 / 비고 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            :label="$t('table.description')"
            variant="outlined"
            density="compact"
            rows="3"
            :placeholder="$t('table.description')"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-form>

    <v-divider></v-divider>

    <!-- 하단 액션 버튼 영역 -->
    <v-card-actions class="pa-4 action-buttons-container">
      <v-btn variant="outlined" color="secondary" v-on:click="onClose">
        {{ $t('common.cancel') }}
      </v-btn>

      <v-spacer></v-spacer>

      <!-- UPDATE 모드일 때 삭제 버튼 제공 -->
      <v-btn
        v-if="!isCreateMode"
        color="error"
        variant="outlined"
        :loading="isDeleting"
        class="mr-2"
        v-on:click="onOpenDeleteDialog"
      >
        {{ $t('common.delete') }}
      </v-btn>

      <!-- 저장 / 수정 실행 버튼 -->
      <v-btn
        color="primary"
        variant="elevated"
        :loading="isSaving"
        v-on:click="onHandleSave"
      >
        {{ isCreateMode ? $t('common.save') : $t('common.edit') }}
      </v-btn>
    </v-card-actions>

    <!-- 삭제 확인 모달 -->
    <ConfirmDialog
      v-model="deleteConfirmDialog"
      :message="$t('common.deleteConfirmMsg', { count: 1 })"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { saveProcessInfoApi, deleteProcessInfoApi } from '@/api/processInfo'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const { t } = useI18n()
const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

const panelStore = usePanelStore()
const formRef = ref(null)
const deleteConfirmDialog = ref(false)

const statusOptions = ['RUNNING', 'DOWN', 'STARTING', 'STOPPING', 'ERROR']

const { loading: isSavingApi, execute: executeSave } = useApi(saveProcessInfoApi)
const { loading: isDeletingApi, execute: executeDelete } = useApi(deleteProcessInfoApi)

const isSaving = computed(function () {
  return isSavingApi.value
})

const isDeleting = computed(function () {
  return isDeletingApi.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  port: null,
  systemName: '',
  processGroupName: '',
  processName: '',
  status: 'RUNNING',
  pid: null,
  startRequestTime: null,
  startTime: null,
  endRequestTime: null,
  endTime: '',
  description: '',
})

function resetForm() {
  formData.port = null
  formData.systemName = ''
  formData.processGroupName = ''
  formData.processName = ''
  formData.status = 'RUNNING'
  formData.pid = null
  formData.startRequestTime = null
  formData.startTime = null
  formData.endRequestTime = null
  formData.endTime = ''
  formData.description = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.port = isCreateMode.value ? null : (newVal.port != null ? Number(newVal.port) : null)
      formData.systemName = newVal.systemName || ''
      formData.processGroupName = newVal.processGroupName || ''
      formData.processName = newVal.processName || ''
      formData.status = newVal.status || 'RUNNING'
      formData.pid = newVal.pid != null ? Number(newVal.pid) : null
      formData.startRequestTime = newVal.startRequestTime || null
      formData.startTime = newVal.startTime || null
      formData.endRequestTime = newVal.endRequestTime || null
      formData.endTime = newVal.endTime || ''
      formData.description = newVal.description || ''
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

function validateRequired(value) {
  if (value !== null && value !== undefined && String(value).trim() !== '') {
    return true
  }
  return t('validation.required')
}

function onClose() {
  panelStore.closePanel()
}

function onOpenDeleteDialog() {
  deleteConfirmDialog.value = true
}

async function onHandleSave() {
  if (!formRef.value) {
    return
  }

  const validationResult = await formRef.value.validate()
  if (!validationResult.valid) {
    return
  }

  try {
    const payload = {
      port: Number(formData.port),
      systemName: formData.systemName,
      processGroupName: formData.processGroupName || undefined,
      processName: formData.processName,
      status: formData.status,
      pid: formData.pid != null ? Number(formData.pid) : undefined,
      startRequestTime: formData.startRequestTime || undefined,
      startTime: formData.startTime || undefined,
      endRequestTime: formData.endRequestTime || undefined,
      endTime: formData.endTime || undefined,
      description: formData.description || undefined,
    }

    await executeSave(panelStore.mode, payload)
    alert(t('common.saveSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save process failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    await executeDelete({ ids: [formData.port] })
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete process failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.deleteFail')
    alert(errorMsg)
  }
}
</script>

<style scoped>
.form-container {
  height: 100%;
}
.action-buttons-container {
  background-color: #fafafa;
}
</style>
