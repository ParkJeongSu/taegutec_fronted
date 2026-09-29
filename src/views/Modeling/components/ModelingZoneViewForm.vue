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
            :label="$t('table.factoryName') + ' (FACTORY_NAME)'"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-select>
        </v-col>

        <!-- 존 명칭 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.zoneName"
            label="존 명칭 (ZONE_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: ZONE_A, BUF_01"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 존 타입 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.zoneType"
            :items="zoneTypeOptions"
            label="존 타입 (ZONE_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 적재 방식 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.loadType"
            :items="loadTypeOptions"
            label="적재 방식 (LOAD_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 선반 선택 모드 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.shelfSelectMode"
            :items="shelfSelectModeOptions"
            label="선반 선택 모드 (SHELF_SELECT_MODE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 존 용량 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.zoneCapacity"
            type="number"
            label="존 용량 (ZONE_CAPACITY)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 100"
            required
          ></v-text-field>
        </v-col>

        <!-- 존 크기 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.zoneSize"
            type="number"
            label="존 크기 (ZONE_SIZE)"
            variant="outlined"
            density="compact"
            placeholder="예: 1"
          ></v-text-field>
        </v-col>

        <!-- 전열 간격 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.frontRowInterval"
            type="number"
            label="전열 간격 (FRONT_ROW_INTERVAL)"
            variant="outlined"
            density="compact"
            placeholder="예: 0"
          ></v-text-field>
        </v-col>

        <!-- 최대 적재율 (%) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.maxCapacityPercent"
            type="number"
            label="최대 적재율 % (MAX_CAPACITY_PERCENT)"
            variant="outlined"
            density="compact"
            :rules="[validatePercent]"
            placeholder="예: 95"
          ></v-text-field>
        </v-col>

        <!-- 사용 적재율 (%) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.useCapacityPercent"
            type="number"
            label="사용 적재율 % (USE_CAPACITY_PERCENT)"
            variant="outlined"
            density="compact"
            :rules="[validatePercent]"
            placeholder="예: 0"
          ></v-text-field>
        </v-col>

        <!-- 존 색상 코드 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.zoneColor"
            label="존 색상 코드 (ZONE_COLOR)"
            variant="outlined"
            density="compact"
            placeholder="예: #1976D2"
          ></v-text-field>
        </v-col>

        <!-- 딥 우선 여부 & 대기 구역 여부 -->
        <v-col cols="12" sm="6" class="d-flex align-center switch-group-col">
          <v-switch
            v-model="formData.deepFirstFlag"
            label="딥 우선 여부 (DEEP_FIRST)"
            color="primary"
            density="compact"
            hide-details
            class="mr-4"
          ></v-switch>
          <v-switch
            v-model="formData.waitingAreaFlag"
            label="대기 구역 여부 (WAITING_AREA)"
            color="teal"
            density="compact"
            hide-details
          ></v-switch>
        </v-col>

        <!-- 비고 / 사유 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.lastEventComment"
            :label="$t('common.comment')"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="비고 또는 특이사항 입력"
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
      :message="'[' + formData.factoryName + ' / ' + formData.zoneName + '] 보관 존을 삭제하시겠습니까?'"
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
  createWcsZoneApi,
  updateWcsZoneApi,
  deleteWcsZoneApi,
} from '@/api/wcsZone'
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
const zoneTypeOptions = ['STORAGE', 'BUFFER', 'REJECT', 'RACK', 'TEMPORARY']
const loadTypeOptions = ['SINGLE', 'DOUBLE']
const shelfSelectModeOptions = ['NEAREST', 'RANDOM', 'SEQUENTIAL']

// useApi를 통한 트랜잭션 CUD API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createWcsZoneApi)

const { loading: isUpdating, execute: executeUpdate } = useApi(function (params) {
  return updateWcsZoneApi(params.factoryName, params.zoneName, params.payload)
})

const { loading: isDeleting, execute: executeDelete } = useApi(function (params) {
  return deleteWcsZoneApi(
    params.factoryName,
    params.zoneName,
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
  factoryName: 'INSERT',
  zoneName: '',
  zoneType: 'STORAGE',
  loadType: 'SINGLE',
  shelfSelectMode: 'NEAREST',
  zoneCapacity: 100,
  zoneSize: 1,
  frontRowInterval: 0,
  maxCapacityPercent: 95,
  useCapacityPercent: 0,
  zoneColor: '#1976D2',
  deepFirstFlag: false,
  waitingAreaFlag: false,
  lastEventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.zoneName = ''
  formData.zoneType = 'STORAGE'
  formData.loadType = 'SINGLE'
  formData.shelfSelectMode = 'NEAREST'
  formData.zoneCapacity = 100
  formData.zoneSize = 1
  formData.frontRowInterval = 0
  formData.maxCapacityPercent = 95
  formData.useCapacityPercent = 0
  formData.zoneColor = '#1976D2'
  formData.deepFirstFlag = false
  formData.waitingAreaFlag = false
  formData.lastEventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.factoryName = newVal.factoryName || 'INSERT'
      formData.zoneName = isCreateMode.value ? '' : (newVal.zoneName || '')
      formData.zoneType = newVal.zoneType || 'STORAGE'
      formData.loadType = newVal.loadType || 'SINGLE'
      formData.shelfSelectMode = newVal.shelfSelectMode || 'NEAREST'
      formData.zoneCapacity = newVal.zoneCapacity != null ? Number(newVal.zoneCapacity) : 100
      formData.zoneSize = newVal.zoneSize != null ? Number(newVal.zoneSize) : 1
      formData.frontRowInterval = newVal.frontRowInterval != null ? Number(newVal.frontRowInterval) : 0
      formData.maxCapacityPercent = newVal.maxCapacityPercent != null ? Number(newVal.maxCapacityPercent) : 95
      formData.useCapacityPercent = newVal.useCapacityPercent != null ? Number(newVal.useCapacityPercent) : 0
      formData.zoneColor = newVal.zoneColor || '#1976D2'
      formData.deepFirstFlag =
        newVal.deepFirstFlag === true ||
        newVal.deepFirstFlag === 'Y' ||
        newVal.deepFirstFlag === 'true'
      formData.waitingAreaFlag =
        newVal.waitingAreaFlag === true ||
        newVal.waitingAreaFlag === 'Y' ||
        newVal.waitingAreaFlag === 'true'
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
  if (value !== null && value !== undefined && String(value).trim() !== '' && !isNaN(Number(value))) {
    return true
  }
  return '숫자를 입력해주세요.'
}

function validatePercent(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return true
  }
  const num = Number(value)
  if (isNaN(num) || num < 0 || num > 100) {
    return '0 ~ 100 사이의 숫자를 입력해주세요.'
  }
  return true
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
      zoneName: formData.zoneName,
      zoneType: formData.zoneType,
      loadType: formData.loadType,
      shelfSelectMode: formData.shelfSelectMode,
      zoneCapacity: Number(formData.zoneCapacity) || 0,
      zoneSize: Number(formData.zoneSize) || 0,
      frontRowInterval: Number(formData.frontRowInterval) || 0,
      maxCapacityPercent: Number(formData.maxCapacityPercent) || 0,
      useCapacityPercent: Number(formData.useCapacityPercent) || 0,
      zoneColor: formData.zoneColor || undefined,
      deepFirstFlag: formData.deepFirstFlag ? 'Y' : 'N',
      waitingAreaFlag: formData.waitingAreaFlag ? 'Y' : 'N',
      lastEventComment: formData.lastEventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 복합키(factoryName + zoneName) 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        zoneName: formData.zoneName,
        payload: payload,
      })
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save zone failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '보관 존 정보 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 복합키(factoryName + zoneName) 기준 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      zoneName: formData.zoneName,
      eventUser: 'SYSTEM',
      eventComment: 'Zone deleted',
    })
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete zone failed:', error)
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

.switch-group-col {
  min-height: 56px;
}
</style>
