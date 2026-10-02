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
            placeholder="예: 311, 312"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 컨베이어 명 (PK 3) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.conveyorName"
            :label="$t('views.transfer.conveyor.formName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: 31103, 31112"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 컨베이어 라인 번호 (PK 4) -->
        <v-col cols="12" sm="3">
          <v-text-field
            v-model.number="formData.conveyorNumber"
            type="number"
            label="라인 No (CONVEYOR_NUMBER)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="1"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 로컬 번호 (PK 5) -->
        <v-col cols="12" sm="3">
          <v-text-field
            v-model.number="formData.localNo"
            type="number"
            label="로컬 No (LOCAL_NO)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="1"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 컨베이어 타입 (conveyorType) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.conveyorType"
            :items="conveyorTypeOptions"
            label="컨베이어 타입 (CONVEYOR_TYPE)"
            variant="outlined"
            density="compact"
            clearable
            placeholder="예: WORKSTATIONCV"
          ></v-combobox>
        </v-col>

        <!-- 운전 상태 (status) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.status"
            :items="statusOptions"
            :label="$t('table.status') + ' (STATUS)'"
            variant="outlined"
            density="compact"
          ></v-combobox>
        </v-col>

        <!-- 반송 방향 (direction) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.direction"
            :items="directionOptions"
            label="반송 방향 (DIRECTION)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 캐리어 유무 (carrierExist) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.carrierExist"
            :items="carrierExistOptions"
            label="캐리어 적재 상태 (CARRIER_EXIST)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 현재 적재 캐리어 ID (carrierName) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.carrierName"
            :label="$t('table.carrierId') + ' (CARRIER_NAME)'"
            variant="outlined"
            density="compact"
            placeholder="예: CR0012, TRAY01"
          ></v-text-field>
        </v-col>

        <!-- 구역명 (areaName) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.areaName"
            label="구역 명칭 (AREA_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: Area01"
          ></v-text-field>
        </v-col>

        <!-- 서버명 (serverName) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.serverName"
            label="서버 명칭 (SERVER_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: insertCCS"
          ></v-text-field>
        </v-col>

        <!-- 그룹 번호 (conveyorGroupNumber) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.conveyorGroupNumber"
            type="number"
            label="그룹 번호 (GROUP_NUMBER)"
            variant="outlined"
            density="compact"
            placeholder="1"
          ></v-text-field>
        </v-col>

        <!-- 비고 / 사유 (lastEventComment) -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.lastEventComment"
            :label="$t('common.comment')"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="컨베이어 정보 변경 사유 및 비고 입력"
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
        class="mr-2 font-weight-medium"
        v-on:click="onOpenDeleteDialog"
      >
        {{ $t('common.delete') }}
      </v-btn>

      <!-- 저장 / 수정 실행 버튼 -->
      <v-btn
        color="primary"
        variant="elevated"
        :loading="isSaving"
        class="font-weight-medium"
        v-on:click="onHandleSave"
      >
        {{ isCreateMode ? $t('common.save') : $t('common.edit') }}
      </v-btn>
    </v-card-actions>

    <!-- 삭제 확인 모달 -->
    <ConfirmDialog
      v-model="deleteConfirmDialog"
      :message="'[' + getConveyorDisplayTitle() + '] 컨베이어 설비를 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { createWcsConveyorApi, updateWcsConveyorApi, deleteWcsConveyorApi } from '@/api/wcsConveyor'
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

const factoryOptions = ['insert', 'powder', 'common']
const conveyorTypeOptions = ['WORKSTATIONCV', 'MAIN_CV', 'TRANSFER_CV', 'BUFFER_CV']
const statusOptions = ['Idle', 'Run', 'Stop', 'Alarm', 'Error']
const directionOptions = ['Inbound', 'Outbound', 'Both']
const carrierExistOptions = ['Empty', 'Exist']

// useApi를 통한 CUD API 바인딩 (단일 params 객체 처리 규격 준수)
const { loading: isCreating, execute: executeCreate } = useApi(createWcsConveyorApi)

const { loading: isUpdating, execute: executeUpdate } = useApi(function (params) {
  return updateWcsConveyorApi(
    params.factoryName,
    params.conveyorGroup,
    params.conveyorName,
    params.conveyorNumber,
    params.localNo,
    params.payload,
  )
})

const { loading: isDeleting, execute: executeDelete } = useApi(function (params) {
  return deleteWcsConveyorApi(
    params.factoryName,
    params.conveyorGroup,
    params.conveyorName,
    params.conveyorNumber,
    params.localNo,
    params.eventUser,
    params.eventComment,
  )
})

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  factoryName: 'insert',
  conveyorGroup: '',
  conveyorName: '',
  conveyorNumber: 1,
  localNo: 1,
  conveyorType: 'WORKSTATIONCV',
  status: 'Idle',
  direction: 'Inbound',
  carrierExist: 'Empty',
  carrierName: '',
  areaName: 'Area01',
  serverName: 'insertCCS',
  conveyorGroupNumber: 1,
  lastEventComment: '',
})

function resetForm() {
  formData.factoryName = 'insert'
  formData.conveyorGroup = ''
  formData.conveyorName = ''
  formData.conveyorNumber = 1
  formData.localNo = 1
  formData.conveyorType = 'WORKSTATIONCV'
  formData.status = 'Idle'
  formData.direction = 'Inbound'
  formData.carrierExist = 'Empty'
  formData.carrierName = ''
  formData.areaName = 'Area01'
  formData.serverName = 'insertCCS'
  formData.conveyorGroupNumber = 1
  formData.lastEventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.factoryName = newVal.factoryName || 'insert'
      formData.conveyorGroup = newVal.conveyorGroup || ''
      formData.conveyorName = isCreateMode.value ? '' : newVal.conveyorName || ''
      formData.conveyorNumber = newVal.conveyorNumber != null ? Number(newVal.conveyorNumber) : 1
      formData.localNo = newVal.localNo != null ? Number(newVal.localNo) : 1
      formData.conveyorType = newVal.conveyorType || 'WORKSTATIONCV'
      formData.status = newVal.status || 'Idle'
      formData.direction = newVal.direction || 'Inbound'
      formData.carrierExist = newVal.carrierExist || 'Empty'
      formData.carrierName = newVal.carrierName || ''
      formData.areaName = newVal.areaName || 'Area01'
      formData.serverName = newVal.serverName || 'insertCCS'
      formData.conveyorGroupNumber =
        newVal.conveyorGroupNumber != null ? Number(newVal.conveyorGroupNumber) : 1
      formData.lastEventComment = newVal.lastEventComment || newVal.eventComment || ''
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
    ' (No.' +
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
      conveyorGroup: formData.conveyorGroup.trim(),
      conveyorName: formData.conveyorName.trim(),
      conveyorNumber: Number(formData.conveyorNumber),
      localNo: Number(formData.localNo),
      conveyorType: formData.conveyorType || undefined,
      status: formData.status,
      direction: formData.direction || undefined,
      carrierExist: formData.carrierExist || 'Empty',
      carrierName: formData.carrierName || undefined,
      areaName: formData.areaName || undefined,
      serverName: formData.serverName || undefined,
      conveyorGroupNumber: Number(formData.conveyorGroupNumber) || 1,
      lastEventComment: formData.lastEventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 5개 복합키 기준으로 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        conveyorGroup: formData.conveyorGroup,
        conveyorName: formData.conveyorName,
        conveyorNumber: formData.conveyorNumber,
        localNo: formData.localNo,
        payload: payload,
      })
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save conveyor failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) || t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 5개 복합키 기준으로 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      conveyorGroup: formData.conveyorGroup,
      conveyorName: formData.conveyorName,
      conveyorNumber: formData.conveyorNumber,
      localNo: formData.localNo,
      eventUser: 'aim',
      eventComment: 'Conveyor deleted',
    })
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
