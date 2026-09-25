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

        <!-- 라우트 노드 ID (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.routeNodeId"
            type="number"
            label="노드 ID (ROUTE_NODE_ID)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 101"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 노드 명칭 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.nodeName"
            label="노드 명칭 (NODE_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: NODE-01, 입고 투입 노드"
            required
          ></v-text-field>
        </v-col>

        <!-- 노드 유형 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.nodeType"
            :items="nodeTypeOptions"
            label="노드 유형 (NODE_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- X 좌표 -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.xCoord"
            type="number"
            label="X 좌표 (X_COORD)"
            variant="outlined"
            density="compact"
            placeholder="예: 120.0"
          ></v-text-field>
        </v-col>

        <!-- Y 좌표 -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.yCoord"
            type="number"
            label="Y 좌표 (Y_COORD)"
            variant="outlined"
            density="compact"
            placeholder="예: 450.0"
          ></v-text-field>
        </v-col>

        <!-- Z 좌표 -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.zCoord"
            type="number"
            label="Z 좌표 (Z_COORD)"
            variant="outlined"
            density="compact"
            placeholder="예: 0.0"
          ></v-text-field>
        </v-col>

        <!-- 최대 대기 수 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.maxWait"
            type="number"
            label="최대 대기 수 (MAX_WAIT)"
            variant="outlined"
            density="compact"
            placeholder="예: 2"
          ></v-text-field>
        </v-col>

        <!-- 연결 링크 수 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.linkCount"
            type="number"
            label="연결 링크 수 (LINK_COUNT)"
            variant="outlined"
            density="compact"
            placeholder="예: 1"
          ></v-text-field>
        </v-col>

        <!-- 소속 존(Zone) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.zoneName"
            label="소속 존 명칭 (ZONE_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: ZONE_A, RAW_MAT"
          ></v-text-field>
        </v-col>

        <!-- 스토커 / 창고 명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.stockerName"
            label="스토커 명 (STOCKER_NAME)"
            variant="outlined"
            density="compact"
            placeholder="예: WH1, STK-01"
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
            placeholder="비고 또는 변경 사유 입력"
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
      :message="'[' + formData.factoryName + ' / ' + formData.routeNodeId + ' (' + (formData.nodeName || '') + ')] 라우트 노드를 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import {
  createWcsRouteNodeApi,
  updateWcsRouteNodeApi,
  deleteWcsRouteNodeApi,
} from '@/api/wcsRouteNode'
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
const nodeTypeOptions = [
  'STATION',
  'BRANCH',
  'MERGE',
  'BUFFER',
  'CROSS',
  'NORMAL',
  'DIVERSION',
]
const useStateOptions = [
  { title: '사용 (USE)', value: 'USE' },
  { title: '미사용 (UNUSE)', value: 'UNUSE' },
]

// useApi를 통한 CUD API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createWcsRouteNodeApi)

const { loading: isUpdating, execute: executeUpdate } = useApi(function (params) {
  return updateWcsRouteNodeApi(params.factoryName, params.routeNodeId, params.payload)
})

const { loading: isDeleting, execute: executeDelete } = useApi(function (params) {
  return deleteWcsRouteNodeApi(params.factoryName, params.routeNodeId)
})

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  factoryName: 'INSERT',
  routeNodeId: null,
  nodeName: '',
  nodeType: 'STATION',
  xCoord: 0,
  yCoord: 0,
  zCoord: 0,
  maxWait: 1,
  linkCount: 1,
  zoneName: '',
  stockerName: '',
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.routeNodeId = null
  formData.nodeName = ''
  formData.nodeType = 'STATION'
  formData.xCoord = 0
  formData.yCoord = 0
  formData.zCoord = 0
  formData.maxWait = 1
  formData.linkCount = 1
  formData.zoneName = ''
  formData.stockerName = ''
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
      formData.routeNodeId = newVal.routeNodeId != null ? Number(newVal.routeNodeId) : (newVal.nodeId != null ? Number(newVal.nodeId) : null)
      formData.nodeName = newVal.nodeName || newVal.name || ''
      formData.nodeType = newVal.nodeType || newVal.type || 'STATION'
      formData.xCoord = newVal.xCoord != null ? Number(newVal.xCoord) : (newVal.positionX != null ? Number(newVal.positionX) : (newVal.x != null ? Number(newVal.x) : 0))
      formData.yCoord = newVal.yCoord != null ? Number(newVal.yCoord) : (newVal.positionY != null ? Number(newVal.positionY) : (newVal.y != null ? Number(newVal.y) : 0))
      formData.zCoord = newVal.zCoord != null ? Number(newVal.zCoord) : (newVal.positionZ != null ? Number(newVal.positionZ) : (newVal.z != null ? Number(newVal.z) : 0))
      formData.maxWait = newVal.maxWait != null ? Number(newVal.maxWait) : 1
      formData.linkCount = newVal.linkCount != null ? Number(newVal.linkCount) : 1
      formData.zoneName = newVal.zoneName || ''
      formData.stockerName = newVal.stockerName || ''
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
      routeNodeId: Number(formData.routeNodeId),
      nodeName: formData.nodeName,
      nodeType: formData.nodeType,
      positionX: Number(formData.xCoord) || 0,
      positionY: Number(formData.yCoord) || 0,
      positionZ: Number(formData.zCoord) || 0,
      xCoord: Number(formData.xCoord) || 0,
      yCoord: Number(formData.yCoord) || 0,
      zCoord: Number(formData.zCoord) || 0,
      maxWait: Number(formData.maxWait) || 0,
      linkCount: Number(formData.linkCount) || 0,
      zoneName: formData.zoneName || undefined,
      stockerName: formData.stockerName || undefined,
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert('신규 라우트 노드가 등록되었습니다.')
    } else {
      // 복합키(factoryName + routeNodeId) 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        routeNodeId: formData.routeNodeId,
        payload: payload,
      })
      alert('라우트 노드 정보가 수정되었습니다.')
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save route node failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '라우트 노드 정보 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 복합키(factoryName + routeNodeId) 기준 삭제 요청
    await executeDelete({
      factoryName: formData.factoryName,
      routeNodeId: formData.routeNodeId,
    })
    alert('라우트 노드가 삭제되었습니다.')

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete route node failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '라우트 노드 삭제 처리 중 오류가 발생했습니다.'
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
