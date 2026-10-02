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
            :label="$t('views.transfer.shelf.formFactory')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-select>
        </v-col>

        <!-- 스토커 명 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.stockerName"
            :items="stockerOptions"
            :label="$t('views.transfer.shelf.formStocker')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-combobox>
        </v-col>

        <!-- 셸프 코드 / 명 (PK 3) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.shelfName"
            :label="$t('views.transfer.shelf.formCode')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: 01001101"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 존(Zone) 명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.zoneName"
            :label="$t('table.zone')"
            variant="outlined"
            density="compact"
            placeholder="예: R1A, C1C"
          ></v-text-field>
        </v-col>

        <!-- Row (열) -->
        <v-col cols="12" sm="3">
          <v-text-field
            v-model.number="formData.row"
            type="number"
            label="Row (열)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="1"
            required
          ></v-text-field>
        </v-col>

        <!-- Col (칸) -->
        <v-col cols="12" sm="3">
          <v-text-field
            v-model.number="formData.col"
            type="number"
            label="Col (칸)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="1"
            required
          ></v-text-field>
        </v-col>

        <!-- Stage (단/층) -->
        <v-col cols="12" sm="3">
          <v-text-field
            v-model.number="formData.stage"
            type="number"
            label="Stage (단)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="1"
            required
          ></v-text-field>
        </v-col>

        <!-- Bin -->
        <v-col cols="12" sm="3">
          <v-text-field
            v-model.number="formData.bin"
            type="number"
            label="Bin"
            variant="outlined"
            density="compact"
            placeholder="1"
          ></v-text-field>
        </v-col>

        <!-- 셸프 상태 (shelfStatus) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.shelfStatus"
            :items="shelfStatusOptions"
            :label="$t('views.transfer.shelf.formStatus')"
            variant="outlined"
            density="compact"
          ></v-combobox>
        </v-col>

        <!-- 셸프 타입 (shelfType) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.shelfType"
            :items="shelfTypeOptions"
            label="셸프 타입 (SHELF_TYPE)"
            variant="outlined"
            density="compact"
          ></v-combobox>
        </v-col>

        <!-- 가용 모드 (shelfEnableMode) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.shelfEnableMode"
            :items="shelfEnableModeOptions"
            label="가용 모드 (ENABLE_MODE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 적재 캐리어 / 트레이 ID (carrierName) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.carrierName"
            label="적재 캐리어/트레이 (CARRIER_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: TRAY_000001"
          ></v-text-field>
        </v-col>

        <!-- 사용 횟수 (numberOfUses) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.numberOfUses"
            type="number"
            label="사용 횟수 (NUMBER_OF_USES)"
            variant="outlined"
            density="compact"
            placeholder="0"
          ></v-text-field>
        </v-col>

        <!-- 마지막 반송 명령 (lastTransferCmdName) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.lastTransferCmdName"
            label="마지막 반송 명령"
            variant="outlined"
            density="compact"
            placeholder="예: CMD_20260901"
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
            placeholder="셸프 정보 변경 사유 및 특이사항 입력"
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
      :message="'[' + getShelfDisplayTitle() + '] 셸프를 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { createWcsShelfApi, updateWcsShelfApi, deleteWcsShelfApi } from '@/api/wcsShelf'
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
const stockerOptions = ['WH1', 'WH2', 'WH3', 'WH4', 'WH5', 'WH6', 'WH7', 'STK01', 'STK02', 'STK03']
const shelfStatusOptions = ['Idle', 'Empty', 'Occupied', 'Reserved', 'Prohibited', 'Disabled']
const shelfTypeOptions = ['NormalShelf', 'Empty', 'SpecialShelf']
const shelfEnableModeOptions = ['Enable', 'Disable']

// useApi를 통한 CUD API 바인딩 (단일 params 객체 처리 규격 준수)
const { loading: isCreating, execute: executeCreate } = useApi(createWcsShelfApi)

const { loading: isUpdating, execute: executeUpdate } = useApi(function (params) {
  return updateWcsShelfApi(params.factoryName, params.stockerName, params.shelfName, params.payload)
})

const { loading: isDeleting, execute: executeDelete } = useApi(function (params) {
  return deleteWcsShelfApi(
    params.factoryName,
    params.stockerName,
    params.shelfName,
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
  stockerName: 'WH1',
  shelfName: '',
  shelfStatus: 'Idle',
  shelfType: 'NormalShelf',
  shelfEnableMode: 'Enable',
  zoneName: '',
  row: 1,
  col: 1,
  stage: 1,
  bin: 1,
  carrierName: '',
  numberOfUses: 0,
  lastTransferCmdName: '',
  lastEventComment: '',
})

function resetForm() {
  formData.factoryName = 'insert'
  formData.stockerName = 'WH1'
  formData.shelfName = ''
  formData.shelfStatus = 'Idle'
  formData.shelfType = 'NormalShelf'
  formData.shelfEnableMode = 'Enable'
  formData.zoneName = ''
  formData.row = 1
  formData.col = 1
  formData.stage = 1
  formData.bin = 1
  formData.carrierName = ''
  formData.numberOfUses = 0
  formData.lastTransferCmdName = ''
  formData.lastEventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.factoryName = newVal.factoryName || 'insert'
      formData.stockerName = newVal.stockerName || 'WH1'
      formData.shelfName = isCreateMode.value ? '' : newVal.shelfName || ''
      formData.shelfStatus = newVal.shelfStatus || 'Idle'
      formData.shelfType = newVal.shelfType || 'NormalShelf'
      formData.shelfEnableMode = newVal.shelfEnableMode || 'Enable'
      formData.zoneName = newVal.zoneName && newVal.zoneName !== '-' ? newVal.zoneName : ''
      formData.row = newVal.row != null ? Number(newVal.row) : 1
      formData.col = newVal.col != null ? Number(newVal.col) : 1
      formData.stage = newVal.stage != null ? Number(newVal.stage) : 1
      formData.bin = newVal.bin != null ? Number(newVal.bin) : 1
      formData.carrierName = newVal.carrierName || ''
      formData.numberOfUses = newVal.numberOfUses != null ? Number(newVal.numberOfUses) : 0
      formData.lastTransferCmdName = newVal.lastTransferCmdName || ''
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
  if (
    value !== null &&
    value !== undefined &&
    String(value).trim() !== '' &&
    !isNaN(Number(value))
  ) {
    return true
  }
  return '숫자를 입력해주세요.'
}

function getShelfDisplayTitle() {
  return formData.factoryName + ' / ' + formData.stockerName + ' / ' + formData.shelfName
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
      stockerName: formData.stockerName,
      shelfName: formData.shelfName.trim(),
      shelfStatus: formData.shelfStatus,
      shelfType: formData.shelfType || undefined,
      shelfEnableMode: formData.shelfEnableMode,
      zoneName: formData.zoneName || undefined,
      row: Number(formData.row) || 1,
      col: Number(formData.col) || 1,
      stage: Number(formData.stage) || 1,
      bin: Number(formData.bin) || 1,
      carrierName: formData.carrierName || undefined,
      numberOfUses: Number(formData.numberOfUses) || 0,
      lastTransferCmdName: formData.lastTransferCmdName || undefined,
      lastEventComment: formData.lastEventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 3개 복합키(factoryName + stockerName + shelfName) 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        stockerName: formData.stockerName,
        shelfName: formData.shelfName,
        payload: payload,
      })
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save shelf failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) || t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 3개 복합키(factoryName + stockerName + shelfName) 기준 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      stockerName: formData.stockerName,
      shelfName: formData.shelfName,
      eventUser: 'aim',
      eventComment: 'Shelf deleted',
    })
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete shelf failed:', error)
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
