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
            :label="$t('views.modeling.subTransferRule.formFactory')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-select>
        </v-col>

        <!-- 대상 설비명 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.equipmentName"
            label="설비 명칭 (EQUIPMENT_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: WH1, STK01"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 대상 모듈명 (PK 3) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.moduleName"
            label="모듈 명칭 (MODULE_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: CR01, CONV01"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 라우트 링크 ID (PK 4) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.routeLinkId"
            type="number"
            label="라우트 링크 ID (ROUTE_LINK_ID)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 1000"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 모듈 타입 (moduleType) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.moduleType"
            :items="moduleTypeOptions"
            label="모듈 타입 (MODULE_TYPE)"
            variant="outlined"
            density="compact"
            clearable
            placeholder="선택 또는 직접 입력 (예: CRANE, CONVEYOR)"
          ></v-combobox>
        </v-col>

        <!-- 캐리어 수량 (carrierCount) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.carrierCount"
            type="number"
            label="캐리어 수량 (CARRIER_COUNT)"
            variant="outlined"
            density="compact"
            placeholder="예: 0"
          ></v-text-field>
        </v-col>

        <!-- NG 상태 (ngStatus) -->
        <v-col cols="12" sm="6">
          <v-combobox
            v-model="formData.ngStatus"
            :items="ngStatusOptions"
            label="불량 상태 (NG_STATUS)"
            variant="outlined"
            density="compact"
            clearable
            placeholder="선택 또는 직접 입력 (예: NORMAL, NG)"
          ></v-combobox>
        </v-col>

        <!-- 설명 (description) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.description"
            label="설명 (DESCRIPTION)"
            variant="outlined"
            density="compact"
            placeholder="세부 반송 룰 설명 입력"
          ></v-text-field>
        </v-col>

        <!-- 비고 / 사유 (lastEventComment) -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.lastEventComment"
            label="비고 / 사유 (LAST_EVENT_COMMENT)"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="세부 반송 룰 설정 사유 및 특이사항 입력"
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
        formData.equipmentName +
        ' / ' +
        formData.moduleName +
        ' / 링크 #' +
        formData.routeLinkId +
        '] 세부 반송 룰을 삭제하시겠습니까?'
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
import {
  createWcsSubTransferRuleApi,
  updateWcsSubTransferRuleApi,
  deleteWcsSubTransferRuleApi,
} from '@/api/wcsSubTransferRule'
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
const moduleTypeOptions = ['CRANE', 'CONVEYOR', 'PORT', 'VEHICLE', 'STATION']
const ngStatusOptions = ['NORMAL', 'NG', 'GOOD', 'FAULT', 'REJECT']

// useApi를 통한 CUD API 바인딩 (단일 params 객체 처리 규격 준수)
const { loading: isCreating, execute: executeCreate } = useApi(createWcsSubTransferRuleApi)

const { loading: isUpdating, execute: executeUpdate } = useApi(function (params) {
  return updateWcsSubTransferRuleApi(
    params.factoryName,
    params.equipmentName,
    params.moduleName,
    params.routeLinkId,
    params.payload,
  )
})

const { loading: isDeleting, execute: executeDelete } = useApi(function (params) {
  return deleteWcsSubTransferRuleApi(
    params.factoryName,
    params.equipmentName,
    params.moduleName,
    params.routeLinkId,
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
  equipmentName: '',
  moduleName: '',
  routeLinkId: null,
  carrierCount: 0,
  description: '',
  moduleType: 'CRANE',
  ngStatus: 'NORMAL',
  lastEventComment: '',
})

function resetForm() {
  formData.factoryName = 'insert'
  formData.equipmentName = ''
  formData.moduleName = ''
  formData.routeLinkId = null
  formData.carrierCount = 0
  formData.description = ''
  formData.moduleType = 'CRANE'
  formData.ngStatus = 'NORMAL'
  formData.lastEventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.factoryName = newVal.factoryName || 'insert'
      formData.equipmentName = isCreateMode.value ? '' : newVal.equipmentName || ''
      formData.moduleName = isCreateMode.value ? '' : newVal.moduleName || ''
      formData.routeLinkId = isCreateMode.value
        ? null
        : newVal.routeLinkId != null
          ? Number(newVal.routeLinkId)
          : null
      formData.carrierCount = newVal.carrierCount != null ? Number(newVal.carrierCount) : 0
      formData.description = newVal.description || ''
      formData.moduleType = newVal.moduleType || 'CRANE'
      formData.ngStatus = newVal.ngStatus || 'NORMAL'
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
      equipmentName: formData.equipmentName.trim(),
      moduleName: formData.moduleName.trim(),
      routeLinkId: Number(formData.routeLinkId),
      carrierCount: Number(formData.carrierCount) || 0,
      description: formData.description || undefined,
      moduleType: formData.moduleType || undefined,
      ngStatus: formData.ngStatus || undefined,
      lastEventComment: formData.lastEventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 4개 복합키(factoryName + equipmentName + moduleName + routeLinkId) 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        equipmentName: formData.equipmentName,
        moduleName: formData.moduleName,
        routeLinkId: formData.routeLinkId,
        payload: payload,
      })
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save sub transfer rule failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '세부 반송 룰 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 4개 복합키 기준 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      equipmentName: formData.equipmentName,
      moduleName: formData.moduleName,
      routeLinkId: formData.routeLinkId,
    })
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete sub transfer rule failed:', error)
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
