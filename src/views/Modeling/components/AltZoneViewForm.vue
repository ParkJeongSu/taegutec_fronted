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

        <!-- 우선순위 (PK 4) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.priority"
            type="number"
            label="우선순위 (PRIORITY)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 1, 2"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 원본 보관 존 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.sourceZoneName"
            label="원본 존 명칭 (SOURCE_ZONE_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: ZONE_A, RAW_MAT"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 대체 보관 존 (PK 3) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.alternativeZoneName"
            label="대체 존 명칭 (ALTERNATIVE_ZONE_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: ZONE_B, BUFFER_ZONE"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 임계 적재율 (%) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.threshold"
            type="number"
            label="전환 임계 적재율 % (THRESHOLD)"
            variant="outlined"
            density="compact"
            placeholder="예: 90"
          ></v-text-field>
        </v-col>

        <!-- 최대 수용 수량 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.maxCount"
            type="number"
            label="최대 수용 수량 (MAX_COUNT)"
            variant="outlined"
            density="compact"
            placeholder="예: 50"
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
            placeholder="대체존 설정 사유 및 특이사항 입력"
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
        class="mr-2 font-weight-medium"
        v-on:click="onOpenDeleteDialog"
      >
        삭제
      </v-btn>

      <!-- 저장 / 수정 실행 버튼 -->
      <v-btn
        color="primary"
        variant="elevated"
        :loading="isSaving"
        class="font-weight-medium"
        v-on:click="onHandleSave"
      >
        {{ isCreateMode ? '저장' : '수정' }}
      </v-btn>
    </v-card-actions>

    <!-- 삭제 확인 모달 -->
    <ConfirmDialog
      v-model="deleteConfirmDialog"
      :message="'[' + formData.factoryName + ' / ' + formData.sourceZoneName + ' -> ' + formData.alternativeZoneName + ' (우선순위: ' + formData.priority + ')] 대체존 설정을 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import {
  createWcsAlternativeStorageZoneApi,
  updateWcsAlternativeStorageZoneApi,
  deleteWcsAlternativeStorageZoneApi,
} from '@/api/wcsAlternativeStorageZone'
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
const useStateOptions = [
  { title: '사용 (USE)', value: 'USE' },
  { title: '미사용 (UNUSE)', value: 'UNUSE' },
]

// useApi를 통한 CUD API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createWcsAlternativeStorageZoneApi)

const { loading: isUpdating, execute: executeUpdate } = useApi(function (params) {
  return updateWcsAlternativeStorageZoneApi(
    params.factoryName,
    params.sourceZoneName,
    params.alternativeZoneName,
    params.priority,
    params.payload,
  )
})

const { loading: isDeleting, execute: executeDelete } = useApi(function (params) {
  return deleteWcsAlternativeStorageZoneApi(
    params.factoryName,
    params.sourceZoneName,
    params.alternativeZoneName,
    params.priority,
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
  sourceZoneName: '',
  alternativeZoneName: '',
  priority: 1,
  threshold: 90,
  maxCount: 0,
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.sourceZoneName = ''
  formData.alternativeZoneName = ''
  formData.priority = 1
  formData.threshold = 90
  formData.maxCount = 0
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
      formData.sourceZoneName = newVal.sourceZoneName || newVal.primaryZone || ''
      formData.alternativeZoneName = newVal.alternativeZoneName || newVal.altZone || ''
      formData.priority = newVal.priority != null ? Number(newVal.priority) : 1
      formData.threshold = newVal.threshold != null ? Number(newVal.threshold) : (newVal.thresholdRate != null ? Number(newVal.thresholdRate) : 90)
      formData.maxCount = newVal.maxCount != null ? Number(newVal.maxCount) : 0
      formData.useState = newVal.useState || (newVal.activeYn === 'N' || newVal.useYn === 'N' ? 'UNUSE' : 'USE')
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
  if (value !== null && value !== undefined && String(value).trim() !== '' && !isNaN(Number(value))) {
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
      sourceZoneName: formData.sourceZoneName.trim(),
      alternativeZoneName: formData.alternativeZoneName.trim(),
      priority: Number(formData.priority),
      threshold: Number(formData.threshold) || 0,
      thresholdRate: Number(formData.threshold) || 0,
      maxCount: Number(formData.maxCount) || 0,
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert('신규 대체존 설정이 등록되었습니다.')
    } else {
      // 4개 복합키 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        sourceZoneName: formData.sourceZoneName,
        alternativeZoneName: formData.alternativeZoneName,
        priority: formData.priority,
        payload: payload,
      })
      alert('대체존 설정 정보가 수정되었습니다.')
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save alt zone failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '대체존 설정 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 4개 복합키 기준 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      sourceZoneName: formData.sourceZoneName,
      alternativeZoneName: formData.alternativeZoneName,
      priority: formData.priority,
    })
    alert('대체존 설정이 삭제되었습니다.')

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete alt zone failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '대체존 설정 삭제 처리 중 오류가 발생했습니다.'
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
