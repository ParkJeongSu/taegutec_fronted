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
            :label="$t('views.modeling.routeNode.formFactory')"
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
            label="라우트 노드 ID (ROUTE_NODE_ID)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 1000"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 노드 비즈니스 코드 (nodeId) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.nodeId"
            label="노드 코드 (NODE_ID)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: WH01_IN_OUT_01"
            required
          ></v-text-field>
        </v-col>

        <!-- 노드 명칭 (nodeName) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.nodeName"
            label="노드 명칭 (NODE_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: WH01 IN OUT PORT 01"
            required
          ></v-text-field>
        </v-col>

        <!-- 노드 유형 (routeNodeType) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.routeNodeType"
            :items="routeNodeTypeOptions"
            label="노드 유형 (ROUTE_NODE_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 리라우트 유형 (rerouteType) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.rerouteType"
            :items="rerouteTypeOptions"
            label="리라우트 유형 (REROUTE_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 베이 ID (bayId) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.bayId"
            label="베이 ID (BAY_ID)"
            variant="outlined"
            density="compact"
            placeholder="예: GR313"
          ></v-text-field>
        </v-col>

        <!-- 유닛 ID (unitId) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.unitId"
            label="유닛 ID (UNIT_ID)"
            variant="outlined"
            density="compact"
            placeholder="예: 31303"
          ></v-text-field>
        </v-col>

        <!-- 설비 ID (equipmentId) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.equipmentId"
            label="설비 ID (EQUIPMENT_ID)"
            variant="outlined"
            density="compact"
            placeholder="예: WH1"
          ></v-text-field>
        </v-col>

        <!-- 크레인 ID (craneId) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.craneId"
            label="크레인 ID (CRANE_ID)"
            variant="outlined"
            density="compact"
            placeholder="예: CR01"
          ></v-text-field>
        </v-col>

        <!-- 제어기 타입 (controllerType) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.controllerType"
            label="제어기 타입 (CONTROLLER_TYPE)"
            variant="outlined"
            density="compact"
            placeholder="예: SCS"
          ></v-text-field>
        </v-col>

        <!-- 순번 (nodeSeq) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.nodeSeq"
            type="number"
            label="노드 순번 (NODE_SEQ)"
            variant="outlined"
            density="compact"
            placeholder="1"
          ></v-text-field>
        </v-col>

        <!-- 사용 여부 (useYn) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.useYn"
            :items="useYnOptions"
            :label="$t('table.useYn')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 설명 (description) -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            label="노드 설명 (DESCRIPTION)"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="포트 설명 또는 특이사항 입력"
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
        formData.routeNodeId +
        ' (' +
        (formData.nodeName || formData.nodeId) +
        ')] 라우트 노드를 삭제하시겠습니까?'
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
  createWcsRouteNodeApi,
  updateWcsRouteNodeApi,
  deleteWcsRouteNodeApi,
} from '@/api/wcsRouteNode'
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
const routeNodeTypeOptions = ['INOUT_PORT', 'IN_PORT', 'OUT_PORT', 'STATION', 'BRANCH', 'MERGE']
const rerouteTypeOptions = ['ON_ARRIVAL', 'NONE', 'DYNAMIC']
const useYnOptions = [
  { title: t('common.use'), value: 'Y' },
  { title: t('common.unuse'), value: 'N' },
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
  factoryName: 'insert',
  routeNodeId: null,
  nodeId: '',
  nodeName: '',
  routeNodeType: 'INOUT_PORT',
  rerouteType: 'ON_ARRIVAL',
  bayId: '',
  unitId: '',
  equipmentId: 'WH1',
  craneId: 'CR01',
  controllerType: 'SCS',
  nodeSeq: 1,
  useYn: 'Y',
  description: '',
})

function resetForm() {
  formData.factoryName = 'insert'
  formData.routeNodeId = null
  formData.nodeId = ''
  formData.nodeName = ''
  formData.routeNodeType = 'INOUT_PORT'
  formData.rerouteType = 'ON_ARRIVAL'
  formData.bayId = ''
  formData.unitId = ''
  formData.equipmentId = 'WH1'
  formData.craneId = 'CR01'
  formData.controllerType = 'SCS'
  formData.nodeSeq = 1
  formData.useYn = 'Y'
  formData.description = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.factoryName = newVal.factoryName || 'insert'
      formData.routeNodeId = isCreateMode.value
        ? null
        : newVal.routeNodeId != null
          ? Number(newVal.routeNodeId)
          : null
      formData.nodeId = newVal.nodeId || ''
      formData.nodeName = newVal.nodeName || ''
      formData.routeNodeType = newVal.routeNodeType || 'INOUT_PORT'
      formData.rerouteType = newVal.rerouteType || 'ON_ARRIVAL'
      formData.bayId = newVal.bayId || ''
      formData.unitId = newVal.unitId || ''
      formData.equipmentId = newVal.equipmentId || 'WH1'
      formData.craneId = newVal.craneId || 'CR01'
      formData.controllerType = newVal.controllerType || 'SCS'
      formData.nodeSeq = newVal.nodeSeq != null ? Number(newVal.nodeSeq) : 1
      formData.useYn = newVal.useYn || 'Y'
      formData.description = newVal.description || ''
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
      routeNodeId: Number(formData.routeNodeId),
      nodeId: formData.nodeId,
      nodeName: formData.nodeName,
      routeNodeType: formData.routeNodeType,
      rerouteType: formData.rerouteType,
      bayId: formData.bayId || undefined,
      unitId: formData.unitId || undefined,
      equipmentId: formData.equipmentId || undefined,
      craneId: formData.craneId || undefined,
      controllerType: formData.controllerType || undefined,
      nodeSeq: Number(formData.nodeSeq) || 1,
      useYn: formData.useYn,
      description: formData.description || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      await executeUpdate({
        factoryName: formData.factoryName,
        routeNodeId: formData.routeNodeId,
        payload: payload,
      })
      alert(t('common.saveSuccess'))
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
    await executeDelete({
      factoryName: formData.factoryName,
      routeNodeId: formData.routeNodeId,
    })
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete route node failed:', error)
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
