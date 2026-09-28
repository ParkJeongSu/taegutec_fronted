<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 소속 공장 (PK 1) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.factoryName"
            :items="factoryOptions"
            :label="$t('views.transfer.conveyor.formFactory')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-select>
        </v-col>

        <!-- 컨베이어 그룹 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.conveyorGroup"
            :label="$t('views.transfer.conveyor.formGroup')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :placeholder="$t('views.transfer.conveyor.placeholderGroupEx')"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 컨베이어 명 (PK 3) -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.conveyorName"
            :label="$t('views.transfer.conveyor.formName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :placeholder="$t('views.transfer.conveyor.placeholderNameEx')"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 컨베이어 번호 (PK 4) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.conveyorNumber"
            type="number"
            :label="$t('table.conveyorNo')"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="1"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 로컬 번호 (PK 5) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.localNo"
            type="number"
            :label="$t('table.conveyorNo')"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="1"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 시작 노드 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.fromNode"
            :label="$t('table.fromNode')"
            variant="outlined"
            density="compact"
            placeholder="NODE-01"
          ></v-text-field>
        </v-col>

        <!-- 도착 노드 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.toNode"
            :label="$t('table.toNode')"
            variant="outlined"
            density="compact"
            placeholder="NODE-05"
          ></v-text-field>
        </v-col>

        <!-- 운전 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.conveyorStatus"
            :items="conveyorStatusOptions"
            :label="$t('table.status')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 사용 여부 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.useState"
            :items="useStateOptions"
            :label="$t('views.transfer.conveyor.formUseState')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 현재 캐리어 ID -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.currentCarrier"
            :label="$t('table.carrierId')"
            variant="outlined"
            density="compact"
            placeholder="CARRIER-012"
          ></v-text-field>
        </v-col>

        <!-- 비고 / 설명 -->
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
  createWcsConveyorApi,
  updateWcsConveyorApi,
  deleteWcsConveyorApi,
} from '@/api/wcsConveyor'
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

const factoryOptions = ['INSERT', 'POWDER', 'COMMON']
const conveyorStatusOptions = ['RUN', 'STOP', 'ALARM', 'IDLE', 'ERROR']
const useStateOptions = [
  { title: t('common.useStatusActive'), value: 'USE' },
  { title: t('common.useStatusInactive'), value: 'UNUSE' },
]

// useApi를 통한 API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createWcsConveyorApi)
const { loading: isUpdating, execute: executeUpdate } = useApi(updateWcsConveyorApi)
const { loading: isDeleting, execute: executeDelete } = useApi(deleteWcsConveyorApi)

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  factoryName: 'INSERT',
  conveyorGroup: '',
  conveyorName: '',
  conveyorNumber: 1,
  localNo: 1,
  fromNode: '',
  toNode: '',
  conveyorStatus: 'RUN',
  currentCarrier: '',
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.conveyorGroup = ''
  formData.conveyorName = ''
  formData.conveyorNumber = 1
  formData.localNo = 1
  formData.fromNode = ''
  formData.toNode = ''
  formData.conveyorStatus = 'RUN'
  formData.currentCarrier = ''
  formData.useState = 'USE'
  formData.eventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.factoryName = newVal.factoryName || 'INSERT'
      formData.conveyorGroup = newVal.conveyorGroup || ''
      formData.conveyorName = newVal.conveyorName || newVal.lineName || newVal.cvId || ''
      formData.conveyorNumber = newVal.conveyorNumber != null ? Number(newVal.conveyorNumber) : 1
      formData.localNo = newVal.localNo != null ? Number(newVal.localNo) : 1
      formData.fromNode = newVal.fromNode || ''
      formData.toNode = newVal.toNode || ''
      formData.conveyorStatus = newVal.conveyorStatus || newVal.status || 'RUN'
      formData.currentCarrier = newVal.currentCarrier || ''
      formData.useState = newVal.useState || (newVal.useYn === 'N' ? 'UNUSE' : 'USE')
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

function validateRequiredNumber(value) {
  if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
    return true
  }
  return t('validation.numberOnly')
}

function getConveyorDisplayTitle() {
  return (
    formData.factoryName +
    ' / ' +
    formData.conveyorGroup +
    ' / ' +
    formData.conveyorName +
    ' (' +
    formData.conveyorNumber +
    '-' +
    formData.localNo +
    ')'
  )
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
      factoryName: formData.factoryName,
      conveyorGroup: formData.conveyorGroup,
      conveyorName: formData.conveyorName,
      conveyorNumber: Number(formData.conveyorNumber),
      localNo: Number(formData.localNo),
      fromNode: formData.fromNode || undefined,
      toNode: formData.toNode || undefined,
      conveyorStatus: formData.conveyorStatus,
      currentCarrier: formData.currentCarrier || undefined,
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 5개 복합키 기준으로 수정 요청
      await executeUpdate(
        formData.factoryName,
        formData.conveyorGroup,
        formData.conveyorName,
        formData.conveyorNumber,
        formData.localNo,
        payload,
      )
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save conveyor failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 5개 복합키 기준으로 삭제 요청
    await executeDelete(
      formData.factoryName,
      formData.conveyorGroup,
      formData.conveyorName,
      formData.conveyorNumber,
      formData.localNo,
    )
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete conveyor failed:', error)
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
