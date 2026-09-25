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

        <!-- 라우트 링크 ID (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.routeLinkId"
            type="number"
            label="링크 ID (ROUTE_LINK_ID)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 1"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 링크 명칭 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.linkName"
            label="링크 명칭 (LINK_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: LINK-01-05"
          ></v-text-field>
        </v-col>

        <!-- 링크 방향성 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.direction"
            :items="directionOptions"
            label="링크 방향성 (DIRECTION)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 시작 노드 ID / 명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.fromNode"
            label="시작 노드 (FROM_NODE)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: 101 또는 NODE-01"
            required
          ></v-text-field>
        </v-col>

        <!-- 도착 노드 ID / 명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.toNode"
            label="도착 노드 (TO_NODE)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: 105 또는 NODE-05"
            required
          ></v-text-field>
        </v-col>

        <!-- 구간 거리 (m) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.distance"
            type="number"
            label="구간 거리 m (DISTANCE)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 18.5"
            required
          ></v-text-field>
        </v-col>

        <!-- 제한 속도 (m/s) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.speedLimit"
            type="number"
            label="제한 속도 m/s (SPEED_LIMIT)"
            variant="outlined"
            density="compact"
            placeholder="예: 2.0"
          ></v-text-field>
        </v-col>

        <!-- 링크 타입 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.linkType"
            :items="linkTypeOptions"
            label="링크 타입 (LINK_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 링크 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.linkStatus"
            :items="linkStatusOptions"
            label="링크 상태 (LINK_STATUS)"
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
      :message="'[' + formData.factoryName + ' / ' + formData.routeLinkId + ' (' + (formData.fromNode + ' -> ' + formData.toNode) + ')] 라우트 링크를 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import {
  createWcsRouteLinkApi,
  updateWcsRouteLinkApi,
  deleteWcsRouteLinkApi,
} from '@/api/wcsRouteLink'
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
const directionOptions = [
  'ONE_WAY',
  'BI_DIRECTIONAL',
  'REVERSE',
]
const linkTypeOptions = [
  'CONVEYOR',
  'TRACK',
  'PATH',
  'AIR',
  'NORMAL',
]
const linkStatusOptions = [
  'AVAILABLE',
  'BLOCKED',
  'MAINTENANCE',
]
const useStateOptions = [
  { title: '사용 (USE)', value: 'USE' },
  { title: '미사용 (UNUSE)', value: 'UNUSE' },
]

// useApi를 통한 CUD API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createWcsRouteLinkApi)

const { loading: isUpdating, execute: executeUpdate } = useApi(function (params) {
  return updateWcsRouteLinkApi(params.factoryName, params.routeLinkId, params.payload)
})

const { loading: isDeleting, execute: executeDelete } = useApi(function (params) {
  return deleteWcsRouteLinkApi(params.factoryName, params.routeLinkId)
})

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  factoryName: 'INSERT',
  routeLinkId: null,
  linkName: '',
  fromNode: '',
  toNode: '',
  distance: 10.0,
  speedLimit: 2.0,
  direction: 'ONE_WAY',
  linkType: 'CONVEYOR',
  linkStatus: 'AVAILABLE',
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.routeLinkId = null
  formData.linkName = ''
  formData.fromNode = ''
  formData.toNode = ''
  formData.distance = 10.0
  formData.speedLimit = 2.0
  formData.direction = 'ONE_WAY'
  formData.linkType = 'CONVEYOR'
  formData.linkStatus = 'AVAILABLE'
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
      formData.routeLinkId = newVal.routeLinkId != null ? Number(newVal.routeLinkId) : (newVal.linkId != null ? Number(newVal.linkId) : null)
      formData.linkName = newVal.linkName || newVal.name || ''
      formData.fromNode = newVal.fromNode != null ? String(newVal.fromNode) : (newVal.fromNodeId != null ? String(newVal.fromNodeId) : '')
      formData.toNode = newVal.toNode != null ? String(newVal.toNode) : (newVal.toNodeId != null ? String(newVal.toNodeId) : '')
      formData.distance = newVal.distance != null ? Number(newVal.distance) : 10.0
      formData.speedLimit = newVal.speedLimit != null ? Number(newVal.speedLimit) : (newVal.maxSpeed != null ? Number(newVal.maxSpeed) : 2.0)
      formData.direction = newVal.direction || newVal.directionType || 'ONE_WAY'
      formData.linkType = newVal.linkType || 'CONVEYOR'
      formData.linkStatus = newVal.linkStatus || 'AVAILABLE'
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
      routeLinkId: Number(formData.routeLinkId),
      linkName: formData.linkName || undefined,
      fromNode: formData.fromNode,
      toNode: formData.toNode,
      fromNodeId: formData.fromNode,
      toNodeId: formData.toNode,
      distance: Number(formData.distance) || 0,
      speedLimit: Number(formData.speedLimit) || 0,
      direction: formData.direction,
      linkType: formData.linkType,
      linkStatus: formData.linkStatus,
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert('신규 라우트 링크가 등록되었습니다.')
    } else {
      // 복합키(factoryName + routeLinkId) 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        routeLinkId: formData.routeLinkId,
        payload: payload,
      })
      alert('라우트 링크 정보가 수정되었습니다.')
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save route link failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '라우트 링크 정보 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 복합키(factoryName + routeLinkId) 기준 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      routeLinkId: formData.routeLinkId,
    })
    alert('라우트 링크가 삭제되었습니다.')

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete route link failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '라우트 링크 삭제 처리 중 오류가 발생했습니다.'
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
