<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 로그 ID (PK) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.id"
            type="number"
            :label="$t('table.logId')"
            variant="outlined"
            density="compact"
            :disabled="!isCreateMode"
            placeholder="1"
          ></v-text-field>
        </v-col>

        <!-- 정책 ID (PurgeConfig ID) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.purgeConfigId"
            type="number"
            :label="$t('table.configId')"
            variant="outlined"
            density="compact"
            placeholder="101"
          ></v-text-field>
        </v-col>

        <!-- 배치 실행 ID -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.batchId"
            :label="$t('table.batchId')"
            variant="outlined"
            density="compact"
            placeholder="BATCH-PURGE-01"
          ></v-text-field>
        </v-col>

        <!-- 대상 테이블명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.tableName"
            :label="$t('table.targetTable')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="TB_WCS_TRANSFER_COMMAND_HIST"
            required
          ></v-text-field>
        </v-col>

        <!-- 처리 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.status"
            :items="statusOptions"
            :label="$t('common.status')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 삭제 건수 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.deleteCount"
            type="number"
            :label="$t('table.deleteCount')"
            variant="outlined"
            density="compact"
            placeholder="5000"
          ></v-text-field>
        </v-col>

        <!-- 시작 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.startDateTime"
            :label="$t('table.startDateTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 종료 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.endDateTime"
            :label="$t('table.endDateTime')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 오류 메시지 / 상세 내용 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.errorMsg"
            :label="$t('table.errorMsg')"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="오류 발생 시 상세 메시지가 여기에 표시됩니다."
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

const statusOptions = ['SUCCESS', 'FAIL', 'RUNNING', 'ERROR']

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  id: null,
  purgeConfigId: null,
  batchId: '',
  tableName: '',
  startDateTime: '',
  endDateTime: '',
  deleteCount: 0,
  status: 'SUCCESS',
  errorMsg: '',
})

function resetForm() {
  formData.id = null
  formData.purgeConfigId = null
  formData.batchId = ''
  formData.tableName = ''
  formData.startDateTime = ''
  formData.endDateTime = ''
  formData.deleteCount = 0
  formData.status = 'SUCCESS'
  formData.errorMsg = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.id = isCreateMode.value ? null : (newVal.id != null ? Number(newVal.id) : null)
      formData.purgeConfigId = newVal.purgeConfigId != null ? Number(newVal.purgeConfigId) : null
      formData.batchId = isCreateMode.value ? '' : (newVal.batchId || '')
      formData.tableName = newVal.tableName || ''
      formData.startDateTime = newVal.startDateTime || ''
      formData.endDateTime = newVal.endDateTime || ''
      formData.deleteCount = newVal.deleteCount != null ? Number(newVal.deleteCount) : 0
      formData.status = newVal.status || 'SUCCESS'
      formData.errorMsg = newVal.errorMsg || ''
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
    console.error('Save purge log failed:', error)
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
    console.error('Delete purge log failed:', error)
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
