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
            :label="$t('views.transfer.carrier.formFactory')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-select>
        </v-col>

        <!-- 캐리어 코드 / 명 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.carrierName"
            :label="$t('views.transfer.carrier.formCarrierName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: 3100001, CST001-2026040111000"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 캐리어 그룹 -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.carrierGroup"
            :items="carrierGroupOptions"
            label="캐리어 그룹 (CARRIER_GROUP)"
            variant="outlined"
            density="compact"
            clearable
            placeholder="예: Tray, Container"
          ></v-combobox>
        </v-col>

        <!-- 캐리어 타입 -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.carrierType"
            :items="carrierTypeOptions"
            :label="$t('views.transfer.carrier.formCarrierType')"
            variant="outlined"
            density="compact"
            clearable
            placeholder="예: Container, TWB"
          ></v-combobox>
        </v-col>

        <!-- 상세 유형 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.carrierDetailType"
            label="상세 유형 (CARRIER_DETAIL_TYPE)"
            variant="outlined"
            density="compact"
            placeholder="예: WP, NONE"
          ></v-text-field>
        </v-col>

        <!-- 동작 상태 -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.carrierStatus"
            :items="carrierStatusOptions"
            :label="$t('views.transfer.carrier.formCarrierStatus')"
            variant="outlined"
            density="compact"
            clearable
          ></v-combobox>
        </v-col>

        <!-- 현재 설비 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.currentEquipmentName"
            label="현재 설비 (CURRENT_EQUIPMENT_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: WH1, STK01"
          ></v-text-field>
        </v-col>

        <!-- 현재 위치 (Position) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.currentPositionName"
            label="현재 위치 (CURRENT_POSITION_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: 01003209, 34414"
          ></v-text-field>
        </v-col>

        <!-- 소속 존 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.zoneName"
            label="소속 존 (ZONE_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: R1A, zone01"
          ></v-text-field>
        </v-col>

        <!-- Lot 명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.lotName"
            label="Lot 명 (LOT_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: LOT_001"
          ></v-text-field>
        </v-col>

        <!-- Order ID -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.orderId"
            label="Order ID (ORDER_ID)"
            variant="outlined"
            density="compact"
            placeholder="예: ORDER-003, 502525291"
          ></v-text-field>
        </v-col>

        <!-- 반송 명령 식별자 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.transferCommandName"
            label="반송 명령 (TRANSFER_COMMAND_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: G_20260821110002003"
          ></v-text-field>
        </v-col>

        <!-- 주행 프로파일 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.travelProfile"
            label="주행 프로파일 (TRAVEL_PROFILE)"
            variant="outlined"
            density="compact"
            placeholder="예: A, 1"
          ></v-text-field>
        </v-col>

        <!-- 사용 횟수 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.carrierUseCount"
            type="number"
            label="캐리어 사용 횟수 (USE_COUNT)"
            variant="outlined"
            density="compact"
            placeholder="0"
          ></v-text-field>
        </v-col>

        <!-- 비고 / 설명 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.lastEventComment"
            :label="$t('common.comment')"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="캐리어 정보 변경 사유 및 특이사항 입력"
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
        '[' + formData.factoryName + ' / ' + formData.carrierName + '] 캐리어를 삭제하시겠습니까?'
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
import { createWcsCarrierApi, updateWcsCarrierApi, deleteWcsCarrierApi } from '@/api/wcsCarrier'
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
const carrierGroupOptions = ['Tray', 'Container']
const carrierTypeOptions = ['Container', 'TWB', 'Pallet', 'Box']
const carrierStatusOptions = ['Stored', 'Transferring', 'Abnormal', 'NONE']

// useApi를 통한 CUD API 바인딩 (단일 params 객체 처리 규격 준수)
const { loading: isCreating, execute: executeCreate } = useApi(createWcsCarrierApi)

const { loading: isUpdating, execute: executeUpdate } = useApi(function (params) {
  return updateWcsCarrierApi(params.factoryName, params.carrierName, params.payload)
})

const { loading: isDeleting, execute: executeDelete } = useApi(function (params) {
  return deleteWcsCarrierApi(
    params.factoryName,
    params.carrierName,
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
  carrierName: '',
  carrierGroup: 'Tray',
  carrierType: 'Container',
  carrierDetailType: '',
  carrierStatus: 'Stored',
  currentEquipmentName: '',
  currentPositionName: '',
  zoneName: '',
  lotName: '',
  orderId: '',
  transferCommandName: '',
  travelProfile: '',
  carrierUseCount: 0,
  lastEventComment: '',
})

function resetForm() {
  formData.factoryName = 'insert'
  formData.carrierName = ''
  formData.carrierGroup = 'Tray'
  formData.carrierType = 'Container'
  formData.carrierDetailType = ''
  formData.carrierStatus = 'Stored'
  formData.currentEquipmentName = ''
  formData.currentPositionName = ''
  formData.zoneName = ''
  formData.lotName = ''
  formData.orderId = ''
  formData.transferCommandName = ''
  formData.travelProfile = ''
  formData.carrierUseCount = 0
  formData.lastEventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.factoryName = newVal.factoryName || 'insert'
      formData.carrierName = isCreateMode.value ? '' : newVal.carrierName || ''
      formData.carrierGroup = newVal.carrierGroup || 'Tray'
      formData.carrierType = newVal.carrierType || 'Container'
      formData.carrierDetailType = newVal.carrierDetailType || ''
      formData.carrierStatus = newVal.carrierStatus || 'Stored'
      formData.currentEquipmentName = newVal.currentEquipmentName || ''
      formData.currentPositionName = newVal.currentPositionName || ''
      formData.zoneName = newVal.zoneName || ''
      formData.lotName = newVal.lotName || ''
      formData.orderId = newVal.orderId || ''
      formData.transferCommandName = newVal.transferCommandName || ''
      formData.travelProfile = newVal.travelProfile || ''
      formData.carrierUseCount = newVal.carrierUseCount != null ? Number(newVal.carrierUseCount) : 0
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
      carrierName: formData.carrierName.trim(),
      carrierGroup: formData.carrierGroup || undefined,
      carrierType: formData.carrierType || undefined,
      carrierDetailType: formData.carrierDetailType || undefined,
      carrierStatus: formData.carrierStatus || undefined,
      currentEquipmentName: formData.currentEquipmentName || undefined,
      currentPositionName: formData.currentPositionName || undefined,
      zoneName: formData.zoneName || undefined,
      lotName: formData.lotName || undefined,
      orderId: formData.orderId || undefined,
      transferCommandName: formData.transferCommandName || undefined,
      travelProfile: formData.travelProfile || undefined,
      carrierUseCount: Number(formData.carrierUseCount) || 0,
      lastEventComment: formData.lastEventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 복합키(factoryName + carrierName) 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        carrierName: formData.carrierName,
        payload: payload,
      })
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save carrier failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) || t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 복합키(factoryName + carrierName) 기준 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      carrierName: formData.carrierName,
      eventUser: 'aim',
      eventComment: 'Carrier deleted',
    })
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete carrier failed:', error)
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
