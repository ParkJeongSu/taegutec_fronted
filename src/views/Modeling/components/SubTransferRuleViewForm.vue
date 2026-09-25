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

        <!-- 대상 설비명 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.equipmentName"
            label="설비 명칭 (EQUIPMENT_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: STK-01, AGV-01, CV-01"
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
            placeholder="예: CRANE-1, CONV-01, MOD-01"
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
            placeholder="예: 1, 101"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 우선순위 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.priority"
            type="number"
            label="우선순위 (PRIORITY)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 1, 2"
            required
          ></v-text-field>
        </v-col>

        <!-- 세부 규칙 명칭 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.ruleName"
            label="세부 규칙 명칭 (RULE_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: 최단경로 우선 배차 규칙"
          ></v-text-field>
        </v-col>

        <!-- 규칙 유형 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.ruleType"
            :items="ruleTypeOptions"
            label="규칙 유형 (RULE_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 동작 유형 (Action Type) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.actionType"
            :items="actionTypeOptions"
            label="동작 유형 (ACTION_TYPE)"
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

        <!-- 비고 / 설명 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.eventComment"
            label="비고 / 설명 (EVENT_COMMENT)"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="하위 반송 규칙 설정 사유 및 특이사항 입력"
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
      :message="'[' + formData.factoryName + ' / ' + formData.equipmentName + ' / ' + formData.moduleName + ' / 링크: ' + formData.routeLinkId + '] 하위 반송 규칙을 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import {
  createWcsSubTransferRuleApi,
  updateWcsSubTransferRuleApi,
  deleteWcsSubTransferRuleApi,
} from '@/api/wcsSubTransferRule'
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
const ruleTypeOptions = [
  'DIRECT',
  'SHORTEST_PATH',
  'CONGESTION_BYPASS',
  'INTERLOCK',
  'SPEED_LIMIT',
  'MANUAL',
]
const actionTypeOptions = [
  'TRANSFER',
  'WAIT',
  'STOP',
  'BYPASS',
  'ROTATE',
]
const useStateOptions = [
  { title: '사용 (USE)', value: 'USE' },
  { title: '미사용 (UNUSE)', value: 'UNUSE' },
]

// useApi를 통한 CUD API 바인딩
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
  factoryName: 'INSERT',
  equipmentName: '',
  moduleName: '',
  routeLinkId: null,
  priority: 1,
  ruleName: '',
  ruleType: 'DIRECT',
  actionType: 'TRANSFER',
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.equipmentName = ''
  formData.moduleName = ''
  formData.routeLinkId = null
  formData.priority = 1
  formData.ruleName = ''
  formData.ruleType = 'DIRECT'
  formData.actionType = 'TRANSFER'
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
      formData.equipmentName = newVal.equipmentName || ''
      formData.moduleName = newVal.moduleName || ''
      formData.routeLinkId = newVal.routeLinkId != null ? Number(newVal.routeLinkId) : null
      formData.priority = newVal.priority != null ? Number(newVal.priority) : 1
      formData.ruleName = newVal.ruleName || newVal.subRuleName || ''
      formData.ruleType = newVal.ruleType || newVal.subRuleType || newVal.algorithm || 'DIRECT'
      formData.actionType = newVal.actionType || newVal.action || 'TRANSFER'
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
      equipmentName: formData.equipmentName.trim(),
      moduleName: formData.moduleName.trim(),
      routeLinkId: Number(formData.routeLinkId),
      priority: Number(formData.priority) || 1,
      ruleName: formData.ruleName ? formData.ruleName.trim() : undefined,
      subRuleName: formData.ruleName ? formData.ruleName.trim() : undefined,
      ruleType: formData.ruleType,
      subRuleType: formData.ruleType,
      actionType: formData.actionType,
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert('신규 하위 반송 규칙이 등록되었습니다.')
    } else {
      // 4개 복합키(factoryName + equipmentName + moduleName + routeLinkId) 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        equipmentName: formData.equipmentName,
        moduleName: formData.moduleName,
        routeLinkId: formData.routeLinkId,
        payload: payload,
      })
      alert('하위 반송 규칙 정보가 수정되었습니다.')
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save sub transfer rule failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '하위 반송 규칙 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 4개 복합키(factoryName + equipmentName + moduleName + routeLinkId) 기준 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      equipmentName: formData.equipmentName,
      moduleName: formData.moduleName,
      routeLinkId: formData.routeLinkId,
    })
    alert('하위 반송 규칙이 삭제되었습니다.')

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete sub transfer rule failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '하위 반송 규칙 삭제 처리 중 오류가 발생했습니다.'
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
