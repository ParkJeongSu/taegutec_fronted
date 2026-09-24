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

        <!-- 스토커 명 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.stockerName"
            :items="stockerOptions"
            label="스토커 명 (STOCKER_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-select>
        </v-col>

        <!-- 셸프 코드 / 명 (PK 3) -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.shelfName"
            label="셸프 코드 / 명 (SHELF_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: 010101, A0101"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 셸프 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.shelfStatus"
            :items="shelfStatusOptions"
            label="셸프 상태 (SHELF_STATUS)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 존(Zone) 명 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.zoneName"
            :items="zoneOptions"
            label="존 명 (ZONE_NAME)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- Bank (뱅크) -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.bank"
            type="number"
            label="Bank (BANK)"
            variant="outlined"
            density="compact"
            placeholder="1"
          ></v-text-field>
        </v-col>

        <!-- Bay (열) -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.bay"
            type="number"
            label="Bay 열 (BAY)"
            variant="outlined"
            density="compact"
            placeholder="1"
          ></v-text-field>
        </v-col>

        <!-- Level (단) -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.level"
            type="number"
            label="Level 단 (LEVEL)"
            variant="outlined"
            density="compact"
            placeholder="1"
          ></v-text-field>
        </v-col>

        <!-- 적재 캐리어 / 트레이 ID -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.carrierId"
            label="적재 캐리어/트레이 ID (CARRIER_ID)"
            variant="outlined"
            density="compact"
            placeholder="예: TRAY-31101"
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

        <!-- 비고 / 설명 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.eventComment"
            label="비고 / 설명 (EVENT_COMMENT)"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="비고 또는 셸프 특이사항 입력"
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
      :message="'[' + getShelfDisplayTitle() + '] 셸프를 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { createWcsShelfApi, updateWcsShelfApi, deleteWcsShelfApi } from '@/api/wcsShelf'
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
const stockerOptions = ['WH1', 'WH2', 'WH3', 'WH4', 'WH5', 'WH6', 'WH7']
const shelfStatusOptions = ['EMPTY', 'OCCUPIED', 'RESERVED', 'PROHIBITED', 'DISABLED']
const zoneOptions = ['EMPTY', 'ZONE_A', 'ZONE_B', 'ZONE_C', 'ZONE_D', 'RAW_MAT', 'FINISHED']
const useStateOptions = [
  { title: '사용 (USE)', value: 'USE' },
  { title: '미사용 (UNUSE)', value: 'UNUSE' },
]

// useApi를 통한 API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createWcsShelfApi)
const { loading: isUpdating, execute: executeUpdate } = useApi(updateWcsShelfApi)
const { loading: isDeleting, execute: executeDelete } = useApi(deleteWcsShelfApi)

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  factoryName: 'INSERT',
  stockerName: 'WH1',
  shelfName: '',
  shelfStatus: 'EMPTY',
  zoneName: 'EMPTY',
  bank: 1,
  bay: 1,
  level: 1,
  carrierId: '',
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.stockerName = 'WH1'
  formData.shelfName = ''
  formData.shelfStatus = 'EMPTY'
  formData.zoneName = 'EMPTY'
  formData.bank = 1
  formData.bay = 1
  formData.level = 1
  formData.carrierId = ''
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
      formData.stockerName = newVal.stockerName || 'WH1'
      formData.shelfName = newVal.shelfName || newVal.shelfCode || ''
      formData.shelfStatus = newVal.shelfStatus || newVal.status || 'EMPTY'
      formData.zoneName = newVal.zoneName || 'EMPTY'
      formData.bank = newVal.bank != null ? Number(newVal.bank) : 1
      formData.bay = newVal.bay != null ? Number(newVal.bay) : (newVal.row != null ? Number(newVal.row) : 1)
      formData.level = newVal.level != null ? Number(newVal.level) : (newVal.stage != null ? Number(newVal.stage) : 1)
      formData.carrierId = newVal.carrierId || newVal.trayId || ''
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

function getShelfDisplayTitle() {
  return (
    formData.factoryName +
    ' / ' +
    formData.stockerName +
    ' / ' +
    formData.shelfName
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
      stockerName: formData.stockerName,
      shelfName: formData.shelfName,
      shelfStatus: formData.shelfStatus,
      zoneName: formData.zoneName || undefined,
      bank: Number(formData.bank) || 1,
      bay: Number(formData.bay) || 1,
      level: Number(formData.level) || 1,
      carrierId: formData.carrierId || undefined,
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert('신규 셸프가 등록되었습니다.')
    } else {
      // 3개 복합키(factoryName + stockerName + shelfName) 기준으로 수정 요청
      await executeUpdate(formData.factoryName, formData.stockerName, formData.shelfName, payload)
      alert('셸프 정보가 수정되었습니다.')
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save shelf failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '셸프 정보 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 3개 복합키(factoryName + stockerName + shelfName) 기준으로 삭제 요청
    await executeDelete(formData.factoryName, formData.stockerName, formData.shelfName)
    alert('셸프가 삭제되었습니다.')

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete shelf failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '셸프 삭제 처리 중 오류가 발생했습니다.'
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
