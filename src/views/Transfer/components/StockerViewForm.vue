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
            :label="$t('views.transfer.stocker.formFactory')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-select>
        </v-col>

        <!-- 스토커 코드 / 명 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.stockerName"
            :label="$t('views.transfer.stocker.formName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: WH1, STK01"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 구역명 (areaName) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.areaName"
            :label="$t('views.transfer.stocker.formArea')"
            variant="outlined"
            density="compact"
            placeholder="예: Area01"
          ></v-text-field>
        </v-col>

        <!-- 스토커 번호 (stockerNumber) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.stockerNumber"
            label="스토커 번호 (STOCKER_NUMBER)"
            variant="outlined"
            density="compact"
            placeholder="예: 2"
          ></v-text-field>
        </v-col>

        <!-- 설비 동작 상태 (stockerStatus) -->
        <v-col cols="12" sm="4">
          <v-combobox
            v-model="formData.stockerStatus"
            :items="stockerStatusOptions"
            label="설비 상태 (STOCKER_STATUS)"
            variant="outlined"
            density="compact"
          ></v-combobox>
        </v-col>

        <!-- 통신 연결 상태 (stockerConnectionStatus) -->
        <v-col cols="12" sm="4">
          <v-select
            v-model="formData.stockerConnectionStatus"
            :items="connectionStatusOptions"
            label="통신 상태 (CONNECTION_STATUS)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 온라인 제어 상태 (onlineControlStatus) -->
        <v-col cols="12" sm="4">
          <v-select
            v-model="formData.onlineControlStatus"
            :items="onlineControlStatusOptions"
            label="온라인 제어 (ONLINE_CONTROL)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 스토커 운전 모드 (stockerMode) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.stockerMode"
            :items="stockerModeOptions"
            label="운전 모드 (STOCKER_MODE)"
            variant="outlined"
            density="compact"
          ></v-combobox>
        </v-col>

        <!-- 동작 모드 (operationMode) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.operationMode"
            :items="operationModeOptions"
            label="동작 모드 (OPERATION_MODE)"
            variant="outlined"
            density="compact"
          ></v-combobox>
        </v-col>

        <!-- 스토커 타입 (stockerType) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.stockerType"
            label="스토커 타입 (STOCKER_TYPE)"
            variant="outlined"
            density="compact"
            placeholder="예: WH"
          ></v-text-field>
        </v-col>

        <!-- 머신 타입 명칭 (machineTypeName) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.machineTypeName"
            label="머신 타입 명칭 (MACHINE_TYPE_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: WHStacker#1"
          ></v-text-field>
        </v-col>

        <!-- 디스패칭 우선순위 (dispatchingPriority) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.dispatchingPriority"
            :items="dispatchingPriorityOptions"
            label="디스패칭 우선순위"
            variant="outlined"
            density="compact"
          ></v-combobox>
        </v-col>

        <!-- 서버 명칭 (serverName) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.serverName"
            label="서버 명칭 (SERVER_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: InsertSCS"
          ></v-text-field>
        </v-col>

        <!-- 총 셀 수 (totalShelfCount) -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.totalShelfCount"
            type="number"
            :label="$t('table.totalShelfCount')"
            variant="outlined"
            density="compact"
            placeholder="0"
          ></v-text-field>
        </v-col>

        <!-- 적재 셀 수 (useShelfCount) -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.useShelfCount"
            type="number"
            :label="$t('table.useShelfCount')"
            variant="outlined"
            density="compact"
            placeholder="0"
          ></v-text-field>
        </v-col>

        <!-- 공선반 수 (emptyShelfCount) -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.emptyShelfCount"
            type="number"
            label="공선반 수 (EMPTY_SHELF)"
            variant="outlined"
            density="compact"
            placeholder="0"
          ></v-text-field>
        </v-col>

        <!-- 비고 / 설명 (lastEventComment) -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.lastEventComment"
            :label="$t('common.comment')"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="스토커 정보 변경 사유 및 비고 입력"
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
      :message="
        '[' +
        formData.factoryName +
        ' / ' +
        formData.stockerName +
        '] 스토커 설비를 삭제하시겠습니까?'
      "
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { createWcsStockerApi, updateWcsStockerApi, deleteWcsStockerApi } from '@/api/wcsStocker'
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
const stockerStatusOptions = ['Active', 'Idle', 'OutOfService', 'RUNNING', 'ERROR', 'DOWN']
const connectionStatusOptions = ['Connected', 'Disconnected']
const onlineControlStatusOptions = ['Online', 'Offline']
const stockerModeOptions = ['Auto', 'Manual']
const operationModeOptions = ['Normal', 'Maintenance', 'Emergency']
const dispatchingPriorityOptions = ['CloseToInPort', 'FIFO', 'LIFO', 'NEAREST']

// useApi를 통한 CUD API 바인딩 (단일 params 객체 처리 규격 준수)
const { loading: isCreating, execute: executeCreate } = useApi(createWcsStockerApi)

const { loading: isUpdating, execute: executeUpdate } = useApi(function (params) {
  return updateWcsStockerApi(params.factoryName, params.stockerName, params.payload)
})

const { loading: isDeleting, execute: executeDelete } = useApi(function (params) {
  return deleteWcsStockerApi(
    params.factoryName,
    params.stockerName,
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
  stockerName: '',
  areaName: '',
  stockerNumber: '1',
  stockerStatus: 'Idle',
  stockerConnectionStatus: 'Connected',
  onlineControlStatus: 'Online',
  stockerMode: 'Auto',
  operationMode: 'Normal',
  stockerType: 'WH',
  machineTypeName: '',
  dispatchingPriority: 'CloseToInPort',
  serverName: 'InsertSCS',
  totalShelfCount: 0,
  useShelfCount: 0,
  emptyShelfCount: 0,
  lastEventComment: '',
})

function resetForm() {
  formData.factoryName = 'insert'
  formData.stockerName = ''
  formData.areaName = ''
  formData.stockerNumber = '1'
  formData.stockerStatus = 'Idle'
  formData.stockerConnectionStatus = 'Connected'
  formData.onlineControlStatus = 'Online'
  formData.stockerMode = 'Auto'
  formData.operationMode = 'Normal'
  formData.stockerType = 'WH'
  formData.machineTypeName = ''
  formData.dispatchingPriority = 'CloseToInPort'
  formData.serverName = 'InsertSCS'
  formData.totalShelfCount = 0
  formData.useShelfCount = 0
  formData.emptyShelfCount = 0
  formData.lastEventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.factoryName = newVal.factoryName || 'insert'
      formData.stockerName = isCreateMode.value ? '' : newVal.stockerName || ''
      formData.areaName = newVal.areaName || ''
      formData.stockerNumber = newVal.stockerNumber || '1'
      formData.stockerStatus = newVal.stockerStatus || 'Idle'
      formData.stockerConnectionStatus = newVal.stockerConnectionStatus || 'Connected'
      formData.onlineControlStatus = newVal.onlineControlStatus || 'Online'
      formData.stockerMode = newVal.stockerMode || 'Auto'
      formData.operationMode = newVal.operationMode || 'Normal'
      formData.stockerType = newVal.stockerType || 'WH'
      formData.machineTypeName = newVal.machineTypeName || ''
      formData.dispatchingPriority = newVal.dispatchingPriority || 'CloseToInPort'
      formData.serverName = newVal.serverName || 'InsertSCS'
      formData.totalShelfCount = Number(newVal.totalShelfCount) || 0
      formData.useShelfCount = Number(newVal.useShelfCount) || 0
      formData.emptyShelfCount = Number(newVal.emptyShelfCount) || 0
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
      stockerName: formData.stockerName.trim(),
      areaName: formData.areaName || undefined,
      stockerNumber: formData.stockerNumber || undefined,
      stockerStatus: formData.stockerStatus,
      stockerConnectionStatus: formData.stockerConnectionStatus,
      onlineControlStatus: formData.onlineControlStatus,
      stockerMode: formData.stockerMode,
      operationMode: formData.operationMode,
      stockerType: formData.stockerType || undefined,
      machineTypeName: formData.machineTypeName || undefined,
      dispatchingPriority: formData.dispatchingPriority || undefined,
      serverName: formData.serverName || undefined,
      totalShelfCount: Number(formData.totalShelfCount) || 0,
      useShelfCount: Number(formData.useShelfCount) || 0,
      emptyShelfCount: Number(formData.emptyShelfCount) || 0,
      lastEventComment: formData.lastEventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 복합키(factoryName + stockerName) 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        stockerName: formData.stockerName,
        payload: payload,
      })
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save stocker failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) || t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 복합키(factoryName + stockerName) 기준 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      stockerName: formData.stockerName,
      eventUser: 'aim',
      eventComment: 'Stocker deleted',
    })
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete stocker failed:', error)
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
