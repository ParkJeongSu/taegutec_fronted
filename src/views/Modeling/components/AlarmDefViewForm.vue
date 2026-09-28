<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 알람 코드 (PK) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.alarmCode"
            :label="$t('table.alarmCode')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :placeholder="$t('views.modeling.alarmDef.placeholderAlarmCode')"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 알람 명칭 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.alarmName"
            label="알람 명칭"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="예: 스토커 포크 타임아웃"
            required
          ></v-text-field>
        </v-col>

        <!-- 알람 심각도 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.severity"
            :items="severityOptions"
            label="심각도 (Severity)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            required
          ></v-select>
        </v-col>

        <!-- 발생 대상 설비 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.targetEquipment"
            :items="targetEquipmentOptions"
            label="발생 대상 설비"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 자동 복구 여부 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.autoRecover"
            :items="autoRecoverOptions"
            label="자동 복구 여부"
            variant="outlined"
            density="compact"
          ></v-select>
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

        <!-- 조치 가이드 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.actionGuide"
            label="조치 가이드"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="현장 조치 및 대응 가이드를 입력하세요."
          ></v-textarea>
        </v-col>

        <!-- 비고 / 설명 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            :label="$t('common.comment')"
            variant="outlined"
            density="compact"
            rows="2"
            :placeholder="$t('common.comment')"
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
        class="mr-2"
        v-on:click="onOpenDeleteDialog"
      >
        {{ $t('common.delete') }}
      </v-btn>

      <!-- 저장 / 수정 실행 버튼 -->
      <v-btn
        color="primary"
        variant="elevated"
        :loading="isSaving"
        v-on:click="onHandleSave"
      >
        {{ isCreateMode ? $t('common.save') : $t('common.edit') }}
      </v-btn>
    </v-card-actions>

    <!-- 삭제 확인 모달 -->
    <ConfirmDialog
      v-model="deleteConfirmDialog"
      :message="$t('common.deleteConfirmMsg', { count: 1 })"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
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
const isSaving = ref(false)
const isDeleting = ref(false)

const severityOptions = ['CRITICAL', 'MAJOR', 'MINOR', 'INFO']
const targetEquipmentOptions = ['STOCKER', 'CONVEYOR', 'CARRIER', 'OHT', 'ROBOT', 'COMMON']
const autoRecoverOptions = [
  { title: 'Y (자동 복구)', value: 'Y' },
  { title: 'N (수동 복구)', value: 'N' },
]
const useYnOptions = [
  { title: t('common.use'), value: 'Y' },
  { title: t('common.unuse'), value: 'N' },
]

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  alarmCode: '',
  alarmName: '',
  severity: 'MAJOR',
  targetEquipment: 'STOCKER',
  autoRecover: 'N',
  actionGuide: '',
  useYn: 'Y',
  description: '',
})

function resetForm() {
  formData.alarmCode = ''
  formData.alarmName = ''
  formData.severity = 'MAJOR'
  formData.targetEquipment = 'STOCKER'
  formData.autoRecover = 'N'
  formData.actionGuide = ''
  formData.useYn = 'Y'
  formData.description = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.alarmCode = isCreateMode.value ? '' : (newVal.alarmCode || '')
      formData.alarmName = newVal.alarmName || ''
      formData.severity = newVal.severity || 'MAJOR'
      formData.targetEquipment = newVal.targetEquipment || 'STOCKER'
      formData.autoRecover = newVal.autoRecover || 'N'
      formData.actionGuide = newVal.actionGuide || ''
      formData.useYn = newVal.useYn || 'Y'
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

  isSaving.value = true
  try {
    const payload = {
      alarmCode: formData.alarmCode,
      alarmName: formData.alarmName,
      severity: formData.severity,
      targetEquipment: formData.targetEquipment,
      autoRecover: formData.autoRecover,
      actionGuide: formData.actionGuide || '',
      useYn: formData.useYn,
      description: formData.description || '',
    }

    // 성공 처리 콜백 및 패널 종료
    alert(t('common.saveSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess(payload, isCreateMode.value ? 'CREATE' : 'UPDATE')
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save alarm definition failed:', error)
    alert(t('common.saveFail'))
  } finally {
    isSaving.value = false
  }
}

async function onConfirmDelete() {
  isDeleting.value = true
  try {
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess({ alarmCode: formData.alarmCode }, 'DELETE')
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete alarm definition failed:', error)
    alert(t('common.deleteFail'))
  } finally {
    isDeleting.value = false
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
