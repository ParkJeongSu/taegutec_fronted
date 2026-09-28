<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 반송 명령 ID (PK) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.transferCommandName"
            :label="$t('views.transfer.commandHistory.commandId')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :placeholder="$t('views.transfer.commandHistory.placeholderCmdId')"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 캐리어 ID -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.carrierName"
            :label="$t('views.transfer.commandHistory.carrierId')"
            variant="outlined"
            density="compact"
            :placeholder="$t('views.transfer.commandHistory.placeholderCarrierId')"
          ></v-text-field>
        </v-col>

        <!-- 명령 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.commandStatus"
            :items="commandStatusOptions"
            :label="$t('views.transfer.commandHistory.commandStatus')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 오더 유형 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.orderType"
            :items="orderTypeOptions"
            :label="$t('views.transfer.commandHistory.orderType')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 출발지 (Source) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.source"
            :label="$t('views.transfer.commandHistory.detailLabels.source')"
            variant="outlined"
            density="compact"
            placeholder="예: STK-01"
          ></v-text-field>
        </v-col>

        <!-- 도착지 (Target) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.target"
            :label="$t('views.transfer.commandHistory.detailLabels.target')"
            variant="outlined"
            density="compact"
            placeholder="예: WS-311"
          ></v-text-field>
        </v-col>

        <!-- 현재 설비명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.currentEquipmentName"
            :label="$t('views.transfer.commandHistory.currentEquipment')"
            variant="outlined"
            density="compact"
            :placeholder="$t('views.transfer.commandHistory.placeholderEquipment')"
          ></v-text-field>
        </v-col>

        <!-- 도착 설비명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.targetEquipmentName"
            :label="$t('views.transfer.commandHistory.detailLabels.targetEq')"
            variant="outlined"
            density="compact"
            placeholder="예: CV-01"
          ></v-text-field>
        </v-col>

        <!-- 서브 명령 번호 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.subCommandJobNo"
            :label="$t('views.transfer.commandHistory.detailLabels.subJobNo')"
            variant="outlined"
            density="compact"
            placeholder="1"
          ></v-text-field>
        </v-col>

        <!-- 서브 명령 상태 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.subCommandStatus"
            :label="$t('views.transfer.commandHistory.detailLabels.subStatus')"
            variant="outlined"
            density="compact"
            placeholder="COMPLETED"
          ></v-text-field>
        </v-col>

        <!-- 작업 시작 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.jobStartTime"
            :label="$t('views.transfer.commandHistory.detailLabels.jobStart')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 작업 완료 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.jobCompletedTime"
            :label="$t('views.transfer.commandHistory.detailLabels.jobEnd')"
            variant="outlined"
            density="compact"
            placeholder="YYYY-MM-DDTHH:mm:ss"
          ></v-text-field>
        </v-col>

        <!-- 처리자 (User) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.eventUser"
            :label="$t('views.transfer.commandHistory.operator')"
            variant="outlined"
            density="compact"
            :placeholder="$t('views.transfer.commandHistory.placeholderOperator')"
          ></v-text-field>
        </v-col>

        <!-- 생성 일시 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.createTime"
            :label="$t('views.transfer.commandHistory.detailLabels.createTime')"
            variant="outlined"
            density="compact"
            disabled
          ></v-text-field>
        </v-col>

        <!-- 이벤트 코멘트 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.eventComment"
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
import { useApi } from '@/composables/useApi'
import {
  createTransferCommandApi,
  updateTransferCommandApi,
  deleteTransferCommandApi,
} from '@/api/wcsTransferCommand'
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

const commandStatusOptions = [
  'INIT',
  'REQUESTED',
  'ASSIGNED',
  'EXECUTING',
  'COMPLETED',
  'ABORTED',
  'FAILED',
]

const orderTypeOptions = [
  'STK_TO_WS',
  'WS_TO_STK',
  'WS_TO_WS',
  'STK_TO_STK',
  'DIRECT',
  'RELOCATION',
]

const { loading: isCreating, execute: executeCreate } = useApi(createTransferCommandApi)
const { loading: isUpdating, execute: executeUpdate } = useApi(updateTransferCommandApi)
const { loading: isDeleting, execute: executeDelete } = useApi(deleteTransferCommandApi)

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  transferCommandName: '',
  carrierName: '',
  commandStatus: 'INIT',
  orderType: 'STK_TO_WS',
  source: '',
  target: '',
  currentEquipmentName: '',
  targetEquipmentName: '',
  subCommandJobNo: null,
  subCommandStatus: '',
  jobStartTime: '',
  jobCompletedTime: '',
  createTime: '',
  eventUser: '',
  eventComment: '',
})

function resetForm() {
  formData.transferCommandName = ''
  formData.carrierName = ''
  formData.commandStatus = 'INIT'
  formData.orderType = 'STK_TO_WS'
  formData.source = ''
  formData.target = ''
  formData.currentEquipmentName = ''
  formData.targetEquipmentName = ''
  formData.subCommandJobNo = null
  formData.subCommandStatus = ''
  formData.jobStartTime = ''
  formData.jobCompletedTime = ''
  formData.createTime = ''
  formData.eventUser = ''
  formData.eventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.transferCommandName = isCreateMode.value ? '' : (newVal.transferCommandName || '')
      formData.carrierName = newVal.carrierName || ''
      formData.commandStatus = newVal.commandStatus || 'INIT'
      formData.orderType = newVal.orderType || 'STK_TO_WS'
      formData.source = newVal.source || ''
      formData.target = newVal.target || ''
      formData.currentEquipmentName = newVal.currentEquipmentName || ''
      formData.targetEquipmentName = newVal.targetEquipmentName || ''
      formData.subCommandJobNo = newVal.subCommandJobNo != null ? newVal.subCommandJobNo : null
      formData.subCommandStatus = newVal.subCommandStatus || ''
      formData.jobStartTime = newVal.jobStartTime || ''
      formData.jobCompletedTime = newVal.jobCompletedTime || ''
      formData.createTime = newVal.createTime || ''
      formData.eventUser = newVal.eventUser || ''
      formData.eventComment = newVal.eventComment || ''
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
      transferCommandName: formData.transferCommandName,
      carrierName: formData.carrierName || undefined,
      commandStatus: formData.commandStatus,
      orderType: formData.orderType,
      source: formData.source || undefined,
      target: formData.target || undefined,
      currentEquipmentName: formData.currentEquipmentName || undefined,
      targetEquipmentName: formData.targetEquipmentName || undefined,
      subCommandJobNo: formData.subCommandJobNo != null ? Number(formData.subCommandJobNo) : undefined,
      subCommandStatus: formData.subCommandStatus || undefined,
      jobStartTime: formData.jobStartTime || undefined,
      jobCompletedTime: formData.jobCompletedTime || undefined,
      eventUser: formData.eventUser || undefined,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      await executeUpdate(formData.transferCommandName, payload)
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save transfer command failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    await executeDelete(formData.transferCommandName)
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete transfer command failed:', error)
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
