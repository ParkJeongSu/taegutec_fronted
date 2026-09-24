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
            label="소속 공장 (FACTORY_NAME)"
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
            label="캐리어 명 (CARRIER_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: RGV-01, OHT-01"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 캐리어 타입 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.carrierType"
            :items="carrierTypeOptions"
            label="캐리어 타입 (CARRIER_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 동작 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.carrierStatus"
            :items="carrierStatusOptions"
            label="동작 상태 (CARRIER_STATUS)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 현재 위치 노드 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.currentNode"
            label="현재 위치 노드 (CURRENT_NODE)"
            variant="outlined"
            density="compact"
            placeholder="예: NODE-04"
          ></v-text-field>
        </v-col>

        <!-- 목적지 노드 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.destNode"
            label="목적지 노드 (DEST_NODE)"
            variant="outlined"
            density="compact"
            placeholder="예: NODE-10"
          ></v-text-field>
        </v-col>

        <!-- 배터리 잔량 (%) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.battery"
            type="number"
            label="배터리 잔량 % (BATTERY)"
            variant="outlined"
            density="compact"
            placeholder="예: 85"
          ></v-text-field>
        </v-col>

        <!-- 사용 여부 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.useState"
            :items="useStateOptions"
            label="사용 여부 (USE_STATE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 적재 트레이 ID -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.loadedTrayId"
            label="적재 트레이 ID (LOADED_TRAY_ID)"
            variant="outlined"
            density="compact"
            placeholder="예: TRAY-31101"
          ></v-text-field>
        </v-col>

        <!-- 비고 / 설명 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.eventComment"
            label="비고 / 설명 (EVENT_COMMENT)"
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
        취소
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
        삭제
      </v-btn>

      <!-- 저장 / 수정 실행 버튼 -->
      <v-btn
        color="primary"
        variant="elevated"
        :loading="isSaving"
        v-on:click="onHandleSave"
      >
        {{ isCreateMode ? '저장' : '수정' }}
      </v-btn>
    </v-card-actions>

    <!-- 삭제 확인 모달 -->
    <ConfirmDialog
      v-model="deleteConfirmDialog"
      :message="'[' + (formData.factoryName + ' / ' + formData.carrierName) + '] 캐리어를 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import {
  createWcsCarrierApi,
  updateWcsCarrierApi,
  deleteWcsCarrierApi,
} from '@/api/wcsCarrier'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

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
const carrierTypeOptions = ['RGV', 'OHT', 'AGV', 'AMR']
const carrierStatusOptions = [
  'IDLE',
  'MOVING',
  'LOADING',
  'UNLOADING',
  'CHARGING',
  'ERROR',
  'DOWN',
]
const useStateOptions = [
  { title: '사용 (USE)', value: 'USE' },
  { title: '미사용 (UNUSE)', value: 'UNUSE' },
]

// useApi를 통한 API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createWcsCarrierApi)
const { loading: isUpdating, execute: executeUpdate } = useApi(updateWcsCarrierApi)
const { loading: isDeleting, execute: executeDelete } = useApi(deleteWcsCarrierApi)

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  factoryName: 'INSERT',
  carrierName: '',
  carrierType: 'RGV',
  carrierStatus: 'IDLE',
  currentNode: '',
  destNode: '',
  battery: 100,
  loadedTrayId: '',
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.carrierName = ''
  formData.carrierType = 'RGV'
  formData.carrierStatus = 'IDLE'
  formData.currentNode = ''
  formData.destNode = ''
  formData.battery = 100
  formData.loadedTrayId = ''
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
      formData.carrierName = newVal.carrierName || newVal.carrierId || ''
      formData.carrierType = newVal.carrierType || newVal.type || 'RGV'
      formData.carrierStatus = newVal.carrierStatus || newVal.status || 'IDLE'
      formData.currentNode = newVal.currentNode || ''
      formData.destNode = newVal.destNode || ''
      formData.battery = newVal.battery != null ? Number(newVal.battery) : 100
      formData.loadedTrayId = newVal.loadedTrayId || newVal.trayId || ''
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
  return '필수 입력 항목입니다.'
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
      carrierName: formData.carrierName,
      carrierType: formData.carrierType,
      carrierStatus: formData.carrierStatus,
      currentNode: formData.currentNode || undefined,
      destNode: formData.destNode || undefined,
      battery: Number(formData.battery) || 0,
      loadedTrayId: formData.loadedTrayId || undefined,
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert('신규 캐리어가 등록되었습니다.')
    } else {
      // 복합키(factoryName + carrierName) 기준으로 수정 요청
      await executeUpdate(formData.factoryName, formData.carrierName, payload)
      alert('캐리어 정보가 수정되었습니다.')
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save carrier failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '캐리어 정보 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 복합키(factoryName + carrierName) 기준으로 삭제 요청
    await executeDelete(formData.factoryName, formData.carrierName)
    alert('캐리어가 삭제되었습니다.')

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete carrier failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '캐리어 삭제 처리 중 오류가 발생했습니다.'
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
