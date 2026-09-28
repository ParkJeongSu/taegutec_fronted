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

        <!-- 프로세스명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.processName"
            :label="$t('table.processName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="WCS_ROUTING_SRV"
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

        <!-- 이벤트 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.eventTime"
            :label="$t('table.eventTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 처리자 (User) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.eventUser"
            :label="$t('table.eventUser')"
            variant="outlined"
            density="compact"
            placeholder="SYSTEM"
          ></v-text-field>
        </v-col>

        <!-- 기동 요청 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.startRequestTime"
            :label="$t('table.startRequestTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 기동 완료 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.startTime"
            :label="$t('table.startTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 정지 요청 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.endRequestTime"
            :label="$t('table.endRequestTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 정지 완료 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.endTime"
            :label="$t('table.endTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 비고 / 설명 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            :label="$t('common.comment')"
            variant="outlined"
            density="compact"
            rows="3"
            :placeholder="$t('common.comment')"
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
const isSaving = ref(false)
const isDeleting = ref(false)

const statusOptions = ['RUNNING', 'DOWN', 'STARTING', 'STOPPING', 'ERROR']

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  port: null,
  processName: '',
  status: 'RUNNING',
  pid: null,
  eventTime: '',
  startRequestTime: '',
  startTime: '',
  endRequestTime: '',
  endTime: '',
  eventUser: '',
  description: '',
})

function resetForm() {
  formData.port = null
  formData.processName = ''
  formData.status = 'RUNNING'
  formData.pid = null
  formData.eventTime = ''
  formData.startRequestTime = ''
  formData.startTime = ''
  formData.endRequestTime = ''
  formData.endTime = ''
  formData.eventUser = ''
  formData.description = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.port = isCreateMode.value ? null : (newVal.port != null ? Number(newVal.port) : null)
      formData.processName = newVal.processName || ''
      formData.status = newVal.status || 'RUNNING'
      formData.pid = newVal.pid != null ? Number(newVal.pid) : null
      formData.eventTime = newVal.eventTime || ''
      formData.startRequestTime = newVal.startRequestTime || ''
      formData.startTime = newVal.startTime || ''
      formData.endRequestTime = newVal.endRequestTime || ''
      formData.endTime = newVal.endTime || ''
      formData.eventUser = newVal.eventUser || ''
      formData.description = newVal.description || newVal.eventComment || ''
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

  isSaving.value = true
  try {
    alert(t('common.saveSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save process status history failed:', error)
    alert(t('common.saveFail'))
  } finally {
    isSaving.value = false
  }
}

async function onConfirmDelete() {
  isDeleting.value = true
  try {
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete process status history failed:', error)
    alert(t('common.deleteFail'))
  } finally {
    isDeleting.value = false
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
