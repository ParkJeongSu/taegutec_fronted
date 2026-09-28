<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 정책 ID (PK) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.id"
            :label="$t('views.definition.purgeConfig.form.policyId')"
            type="number"
            variant="outlined"
            density="compact"
            placeholder="1"
            :disabled="!isCreateMode"
          ></v-text-field>
        </v-col>

        <!-- 활성화 여부 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.isActive"
            :items="isActiveOptions"
            :label="$t('views.definition.purgeConfig.form.isActive')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- DB 명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.dbName"
            :label="$t('views.definition.purgeConfig.form.dbName')"
            variant="outlined"
            density="compact"
            placeholder="WCS_DB"
          ></v-text-field>
        </v-col>

        <!-- 스키마 명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.schemaName"
            :label="$t('views.definition.purgeConfig.form.schemaName')"
            variant="outlined"
            density="compact"
            placeholder="dbo"
          ></v-text-field>
        </v-col>

        <!-- 대상 테이블명 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.tableName"
            :label="$t('views.definition.purgeConfig.form.tableName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="TB_WCS_TRANSFER_COMMAND_HIST"
            required
          ></v-text-field>
        </v-col>

        <!-- 대상 컬럼명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.targetColumnName"
            :label="$t('views.definition.purgeConfig.form.targetColumn')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="EVENT_TIME"
            required
          ></v-text-field>
        </v-col>

        <!-- 데이터 타입 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.dataType"
            :items="['DATE', 'NUMBER', 'STRING']"
            :label="$t('views.definition.purgeConfig.form.dataType')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 연산자 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.operator"
            :label="$t('views.definition.purgeConfig.form.operator')"
            variant="outlined"
            density="compact"
            placeholder="<"
          ></v-text-field>
        </v-col>

        <!-- 비교 기준값 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.compValue"
            :label="$t('views.definition.purgeConfig.form.compValue')"
            variant="outlined"
            density="compact"
            placeholder="NOW() - INTERVAL '90 DAY'"
          ></v-text-field>
        </v-col>

        <!-- 배치 크기 -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.batchSize"
            :label="$t('views.definition.purgeConfig.form.batchSize')"
            type="number"
            variant="outlined"
            density="compact"
            placeholder="1000"
          ></v-text-field>
        </v-col>

        <!-- 최대 루프 횟수 -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.maxLoopCount"
            :label="$t('views.definition.purgeConfig.form.maxLoop')"
            type="number"
            variant="outlined"
            density="compact"
            placeholder="10"
          ></v-text-field>
        </v-col>

        <!-- 지연 시간 (ms) -->
        <v-col cols="12" sm="4">
          <v-text-field
            v-model.number="formData.delayMs"
            :label="$t('views.definition.purgeConfig.form.delayMs')"
            type="number"
            variant="outlined"
            density="compact"
            placeholder="100"
          ></v-text-field>
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
import { useApi } from '@/composables/useApi'
import { savePurgeConfigApi, deletePurgeConfigApi } from '@/api/purgeConfig'
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

const isActiveOptions = [
  { title: t('common.active'), value: 'Y' },
  { title: t('common.inactive'), value: 'N' },
]

const { loading: isSavingApi, execute: executeSave } = useApi(savePurgeConfigApi)
const { loading: isDeletingApi, execute: executeDelete } = useApi(deletePurgeConfigApi)

const isSaving = computed(function () {
  return isSavingApi.value
})

const isDeleting = computed(function () {
  return isDeletingApi.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  id: null,
  dbName: '',
  schemaName: 'dbo',
  tableName: '',
  targetColumnName: '',
  dataType: 'DATE',
  operator: '<',
  compValue: '',
  batchSize: 1000,
  maxLoopCount: 10,
  delayMs: 100,
  isActive: 'Y',
})

function resetForm() {
  formData.id = null
  formData.dbName = ''
  formData.schemaName = 'dbo'
  formData.tableName = ''
  formData.targetColumnName = ''
  formData.dataType = 'DATE'
  formData.operator = '<'
  formData.compValue = ''
  formData.batchSize = 1000
  formData.maxLoopCount = 10
  formData.delayMs = 100
  formData.isActive = 'Y'
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.id = isCreateMode.value ? null : (newVal.id != null ? Number(newVal.id) : null)
      formData.dbName = newVal.dbName || ''
      formData.schemaName = newVal.schemaName || 'dbo'
      formData.tableName = isCreateMode.value ? '' : (newVal.tableName || '')
      formData.targetColumnName = newVal.targetColumnName || ''
      formData.dataType = newVal.dataType || 'DATE'
      formData.operator = newVal.operator || '<'
      formData.compValue = newVal.compValue || ''
      formData.batchSize = newVal.batchSize != null ? Number(newVal.batchSize) : 1000
      formData.maxLoopCount = newVal.maxLoopCount != null ? Number(newVal.maxLoopCount) : 10
      formData.delayMs = newVal.delayMs != null ? Number(newVal.delayMs) : 100
      formData.isActive = newVal.isActive || 'Y'
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

  try {
    const payload = {
      id: formData.id || undefined,
      dbName: formData.dbName,
      schemaName: formData.schemaName,
      tableName: formData.tableName,
      targetColumnName: formData.targetColumnName,
      dataType: formData.dataType,
      operator: formData.operator,
      compValue: formData.compValue,
      batchSize: Number(formData.batchSize) || 1000,
      maxLoopCount: Number(formData.maxLoopCount) || 10,
      delayMs: Number(formData.delayMs) || 100,
      isActive: formData.isActive,
    }

    await executeSave(payload)
    alert(t('views.definition.purgeConfig.form.saved') || t('common.saveSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save purge config failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    if (formData.id) {
      await executeDelete({ ids: [formData.id] })
    }
    alert(t('views.definition.purgeConfig.deleteSuccess') || t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete purge config failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('views.definition.purgeConfig.deleteFail') ||
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
