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
            :label="$t('views.modeling.altZone.formFactory')"
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
            :label="$t('views.modeling.altZone.formPriority')"
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
            label="기준(원본) 존 명칭 (SOURCE_ZONE_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: TESTZONE001"
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
            placeholder="예: TESTZONE002"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 사용 여부 -->
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
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.description"
            label="설명 (DESCRIPTION)"
            variant="outlined"
            density="compact"
            placeholder="예: TestInit"
          ></v-text-field>
        </v-col>

        <!-- 비고 / 변경 사유 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.lastEventComment"
            label="비고 / 변경 사유 (LAST_EVENT_COMMENT)"
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
        formData.sourceZoneName +
        ' -> ' +
        formData.alternativeZoneName +
        ' (우선순위: ' +
        formData.priority +
        ')] 대체존 설정을 삭제하시겠습니까?'
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
  createWcsAlternativeStorageZoneApi,
  updateWcsAlternativeStorageZoneApi,
  deleteWcsAlternativeStorageZoneApi,
} from '@/api/wcsAlternativeStorageZone'
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
const useYnOptions = [
  { title: t('common.use'), value: 'Y' },
  { title: t('common.unuse'), value: 'N' },
]

// useApi를 통한 CUD API 바인딩 (단일 params 객체 처리 규격 준수)
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
  factoryName: 'insert',
  sourceZoneName: '',
  alternativeZoneName: '',
  priority: 1,
  useYn: 'Y',
  description: '',
  lastEventComment: '',
})

function resetForm() {
  formData.factoryName = 'insert'
  formData.sourceZoneName = ''
  formData.alternativeZoneName = ''
  formData.priority = 1
  formData.useYn = 'Y'
  formData.description = ''
  formData.lastEventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.factoryName = newVal.factoryName || 'insert'
      formData.sourceZoneName = isCreateMode.value ? '' : newVal.sourceZoneName || ''
      formData.alternativeZoneName = isCreateMode.value ? '' : newVal.alternativeZoneName || ''
      formData.priority = newVal.priority != null ? Number(newVal.priority) : 1
      formData.useYn = newVal.useYn || 'Y'
      formData.description = newVal.description || ''
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
      sourceZoneName: formData.sourceZoneName.trim(),
      alternativeZoneName: formData.alternativeZoneName.trim(),
      priority: Number(formData.priority),
      useYn: formData.useYn,
      description: formData.description || undefined,
      lastEventComment: formData.lastEventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 4개 복합키 기준 수정 요청
      await executeUpdate({
        factoryName: formData.factoryName,
        sourceZoneName: formData.sourceZoneName,
        alternativeZoneName: formData.alternativeZoneName,
        priority: formData.priority,
        payload: payload,
      })
      alert(t('common.saveSuccess'))
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
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete alt zone failed:', error)
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
