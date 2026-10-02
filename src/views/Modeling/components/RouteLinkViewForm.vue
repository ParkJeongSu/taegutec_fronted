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
            :label="$t('views.modeling.routeLink.formFactory')"
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
            placeholder="예: 1000"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 시작 노드 ID (fromNodeId) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.fromNodeId"
            label="시작 노드 (FROM_NODE_ID)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: WH03_OUT_03"
            required
          ></v-text-field>
        </v-col>

        <!-- 도착 노드 ID (toNodeId) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.toNodeId"
            label="도착 노드 (TO_NODE_ID)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: CNV02_IN_15"
            required
          ></v-text-field>
        </v-col>

        <!-- 링크 타입 (routeLinkType) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.routeLinkType"
            :items="routeLinkTypeOptions"
            label="링크 타입 (ROUTE_LINK_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 공정 유형 (processType) -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.processType"
            :items="processTypeOptions"
            label="공정 유형 (PROCESS_TYPE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 구간 길이 (length, m) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.length"
            type="number"
            label="구간 길이 m (LENGTH)"
            variant="outlined"
            density="compact"
            :rules="[validateRequiredNumber]"
            placeholder="예: 1"
            required
          ></v-text-field>
        </v-col>

        <!-- 우선순위 (priority) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.priority"
            type="number"
            label="우선순위 (PRIORITY)"
            variant="outlined"
            density="compact"
            placeholder="예: 0"
          ></v-text-field>
        </v-col>

        <!-- 통과 여부 (passYn) -->
        <v-col cols="12" sm="4">
          <v-select
            v-model="formData.passYn"
            :items="ynOptions"
            label="통과 여부 (PASS_YN)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 가용 상태 (usableYn) -->
        <v-col cols="12" sm="4">
          <v-select
            v-model="formData.usableYn"
            :items="ynOptions"
            label="가용 상태 (USABLE_YN)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 사용 여부 (useYn) -->
        <v-col cols="12" sm="4">
          <v-select
            v-model="formData.useYn"
            :items="useYnOptions"
            :label="$t('table.useYn')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 링크 설명 (description) -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            label="링크 설명 (DESCRIPTION)"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="예: WH03 출고 -> CNV02 투입 경로 설명"
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
        formData.routeLinkId +
        ' (' +
        formData.fromNodeId +
        ' -> ' +
        formData.toNodeId +
        ')] 라우트 링크를 삭제하시겠습니까?'
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
  createWcsRouteLinkApi,
  updateWcsRouteLinkApi,
  deleteWcsRouteLinkApi,
} from '@/api/wcsRouteLink'
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
const routeLinkTypeOptions = ['INTER', 'INTRA', 'CONVEYOR', 'PATH', 'TRACK']
const processTypeOptions = ['ALL', 'INBOUND', 'OUTBOUND']
const ynOptions = [
  { title: 'Y (가능/가용)', value: 'Y' },
  { title: 'N (차단/불가)', value: 'N' },
]
const useYnOptions = [
  { title: t('common.use'), value: 'Y' },
  { title: t('common.unuse'), value: 'N' },
]

// useApi를 통한 CUD API 바인딩 (단일 params 객체 수신 형태 유지)
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
  factoryName: 'insert',
  routeLinkId: null,
  fromNodeId: '',
  toNodeId: '',
  routeLinkType: 'INTER',
  processType: 'ALL',
  length: 1,
  priority: 0,
  passYn: 'Y',
  usableYn: 'Y',
  useYn: 'Y',
  description: '',
})

function resetForm() {
  formData.factoryName = 'insert'
  formData.routeLinkId = null
  formData.fromNodeId = ''
  formData.toNodeId = ''
  formData.routeLinkType = 'INTER'
  formData.processType = 'ALL'
  formData.length = 1
  formData.priority = 0
  formData.passYn = 'Y'
  formData.usableYn = 'Y'
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
      formData.routeLinkId = isCreateMode.value
        ? null
        : newVal.routeLinkId != null
          ? Number(newVal.routeLinkId)
          : null
      formData.fromNodeId = newVal.fromNodeId || newVal.fromNode || ''
      formData.toNodeId = newVal.toNodeId || newVal.toNode || ''
      formData.routeLinkType = newVal.routeLinkType || newVal.linkType || 'INTER'
      formData.processType = newVal.processType || 'ALL'
      formData.length =
        newVal.length != null
          ? Number(newVal.length)
          : newVal.distance != null
            ? Number(newVal.distance)
            : 1
      formData.priority = newVal.priority != null ? Number(newVal.priority) : 0
      formData.passYn = newVal.passYn || 'Y'
      formData.usableYn = newVal.usableYn || 'Y'
      formData.useYn = newVal.useYn || (newVal.useState === 'UNUSE' ? 'N' : 'Y')
      formData.description = newVal.description || newVal.eventComment || ''
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
      routeLinkId: Number(formData.routeLinkId),
      fromNodeId: formData.fromNodeId,
      toNodeId: formData.toNodeId,
      routeLinkType: formData.routeLinkType,
      processType: formData.processType,
      length: Number(formData.length) || 1,
      priority: Number(formData.priority) || 0,
      passYn: formData.passYn,
      usableYn: formData.usableYn,
      useYn: formData.useYn,
      description: formData.description || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      await executeUpdate({
        factoryName: formData.factoryName,
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
    console.error('Save route link failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '라우트 링크 정보 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    await executeDelete({
      factoryName: formData.factoryName,
      routeLinkId: formData.routeLinkId,
    })
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete route link failed:', error)
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
