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

        <!-- 컨베이어 그룹 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.conveyorGroup"
            label="컨베이어 그룹 (CONVEYOR_GROUP)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: CV_GRP_01"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 컨베이어 명 (PK 3) -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.conveyorName"
            label="컨베이어 명 (CONVEYOR_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: CV01, MAIN_LINE"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 컨베이어 번호 (PK 4) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.conveyorNumber"
            type="number"
            label="컨베이어 번호 (CONVEYOR_NUMBER)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 1"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 로컬 번호 (PK 5) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.localNo"
            type="number"
            label="로컬 번호 (LOCAL_NO)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 1"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 시작 노드 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.fromNode"
            label="시작 노드 (FROM_NODE)"
            variant="outlined"
            density="compact"
            placeholder="예: NODE-01"
          ></v-text-field>
        </v-col>

        <!-- 도착 노드 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.toNode"
            label="도착 노드 (TO_NODE)"
            variant="outlined"
            density="compact"
            placeholder="예: NODE-05"
          ></v-text-field>
        </v-col>

        <!-- 운전 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.conveyorStatus"
            :items="conveyorStatusOptions"
            label="운전 상태 (CONVEYOR_STATUS)"
            variant="outlined"
            density="compact"
          ></v-select>
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

        <!-- 현재 캐리어 ID -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.currentCarrier"
            label="현재 캐리어 ID (CURRENT_CARRIER)"
            variant="outlined"
            density="compact"
            placeholder="예: CARRIER-012"
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
      :message="'[' + getConveyorDisplayTitle() + '] 컨베이어를 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import {
  createWcsConveyorApi,
  updateWcsConveyorApi,
  deleteWcsConveyorApi,
} from '@/api/wcsConveyor'
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
const conveyorStatusOptions = ['RUN', 'STOP', 'ALARM', 'IDLE', 'ERROR']
const useStateOptions = [
  { title: '사용 (USE)', value: 'USE' },
  { title: '미사용 (UNUSE)', value: 'UNUSE' },
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
  return '필수 입력 항목입니다.'
}

function validateRequiredNumber(value) {
  if (value !== null && value !== undefined && value !== '' && !isNaN(Number(value))) {
    return true
  }
  return '올바른 숫자를 입력하세요.'
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
      alert('신규 컨베이어가 등록되었습니다.')
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
      alert('컨베이어 정보가 수정되었습니다.')
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save conveyor failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '컨베이어 정보 저장 중 오류가 발생했습니다.'
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
    alert('컨베이어가 삭제되었습니다.')

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete conveyor failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '컨베이어 삭제 처리 중 오류가 발생했습니다.'
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
