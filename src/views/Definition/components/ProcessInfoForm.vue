<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 포트 번호 (PK) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.port"
            :label="$t('table.port')"
            type="number"
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
            :label="$t('views.definition.processInfo.form.systemName')"
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
            :label="$t('views.definition.processInfo.form.groupName')"
            variant="outlined"
            density="compact"
            placeholder="ROUTING_GROUP"
          ></v-text-field>
        </v-col>

        <!-- 프로세스명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.processName"
            :label="$t('views.definition.processInfo.form.processName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="WCS_ROUTING_SRV"
            required
          ></v-text-field>
        </v-col>

        <!-- 실행 파일명 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.fileName"
            :label="$t('views.definition.processInfo.form.fileName')"
            variant="outlined"
            density="compact"
            placeholder="wcs_routing.exe"
          ></v-text-field>
        </v-col>

        <!-- 복사 디렉토리 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.copyDir"
            :label="$t('views.definition.processInfo.form.copyDir')"
            variant="outlined"
            density="compact"
            placeholder="C:/app/wcs/deploy"
          ></v-text-field>
        </v-col>

        <!-- 작업 디렉토리 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.workingDir"
            :label="$t('views.definition.processInfo.form.workingDir')"
            variant="outlined"
            density="compact"
            placeholder="C:/app/wcs/runtime"
          ></v-text-field>
        </v-col>

        <!-- 배치 디렉토리 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.batchDir"
            :label="$t('views.definition.processInfo.form.batchDir')"
            variant="outlined"
            density="compact"
            placeholder="C:/app/wcs/batch"
          ></v-text-field>
        </v-col>

        <!-- 배치 파일명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.batchName"
            :label="$t('views.definition.processInfo.form.batchName')"
            variant="outlined"
            density="compact"
            placeholder="start_routing.bat"
          ></v-text-field>
        </v-col>

        <!-- 설명 / 비고 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            :label="$t('views.definition.processInfo.form.description')"
            variant="outlined"
            density="compact"
            rows="3"
            :placeholder="$t('views.definition.processInfo.form.description')"
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
  fileName: '',
  processGroupName: '',
  processName: '',
  description: '',
  copyDir: '',
  workingDir: '',
  batchDir: '',
  batchName: '',
})

function resetForm() {
  formData.port = null
  formData.systemName = ''
  formData.fileName = ''
  formData.processGroupName = ''
  formData.processName = ''
  formData.description = ''
  formData.copyDir = ''
  formData.workingDir = ''
  formData.batchDir = ''
  formData.batchName = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.port = isCreateMode.value ? null : (newVal.port != null ? Number(newVal.port) : null)
      formData.systemName = newVal.systemName || ''
      formData.fileName = newVal.fileName || ''
      formData.processGroupName = newVal.processGroupName || ''
      formData.processName = newVal.processName || ''
      formData.description = newVal.description || ''
      formData.copyDir = newVal.copyDir || ''
      formData.workingDir = newVal.workingDir || ''
      formData.batchDir = newVal.batchDir || ''
      formData.batchName = newVal.batchName || ''
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
      fileName: formData.fileName || undefined,
      processGroupName: formData.processGroupName || undefined,
      processName: formData.processName,
      description: formData.description || undefined,
      copyDir: formData.copyDir || undefined,
      workingDir: formData.workingDir || undefined,
      batchDir: formData.batchDir || undefined,
      batchName: formData.batchName || undefined,
    }

    await executeSave(panelStore.mode, payload)
    alert(t('views.definition.processInfo.form.saved') || t('common.saveSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save process info failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    if (formData.port) {
      await executeDelete({ ids: [formData.port] })
    }
    alert(t('views.definition.processInfo.deleteSuccess') || t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete process info failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('views.definition.processInfo.deleteFail') ||
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
