<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 소속 공장 -->
        <v-col cols="12">
          <v-select
            v-model="formData.factoryName"
            :items="factoryOptions"
            :label="$t('views.transfer.stocker.formFactory')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-select>
        </v-col>

        <!-- 스토커 코드 / 명 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.stockerName"
            :label="$t('views.transfer.stocker.formName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :placeholder="$t('views.transfer.stocker.placeholderStockerEx')"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 구역명 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.areaName"
            :label="$t('views.transfer.stocker.formArea')"
            variant="outlined"
            density="compact"
            :placeholder="$t('views.transfer.stocker.placeholderArea')"
          ></v-text-field>
        </v-col>

        <!-- 설비 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.stockerStatus"
            :items="stockerStatusOptions"
            :label="$t('views.transfer.stocker.formStatus')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 사용 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.useState"
            :items="useStateOptions"
            :label="$t('views.transfer.stocker.formUseState')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 총 셀 수 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.totalShelfCount"
            type="number"
            :label="$t('table.totalShelfCount')"
            variant="outlined"
            density="compact"
            placeholder="0"
          ></v-text-field>
        </v-col>

        <!-- 적재 셀 수 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.useShelfCount"
            type="number"
            :label="$t('table.useShelfCount')"
            variant="outlined"
            density="compact"
            placeholder="0"
          ></v-text-field>
        </v-col>

        <!-- 비고 / 설명 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.eventComment"
            :label="$t('common.comment')"
            variant="outlined"
            density="compact"
            rows="3"
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
import { useApi } from '@/composables/useApi'
import { createWcsStockerApi, updateWcsStockerApi, deleteWcsStockerApi } from '@/api/wcsStocker'
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

const factoryOptions = ['INSERT', 'POWDER', 'COMMON']
const stockerStatusOptions = ['IDLE', 'RUNNING', 'ERROR', 'DOWN', 'OFFLINE']
const useStateOptions = [
  { title: t('common.useStatusActive'), value: 'USE' },
  { title: t('common.useStatusInactive'), value: 'UNUSE' },
]

// useApi를 통한 API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createWcsStockerApi)
const { loading: isUpdating, execute: executeUpdate } = useApi(updateWcsStockerApi)
const { loading: isDeleting, execute: executeDelete } = useApi(deleteWcsStockerApi)

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  factoryName: 'INSERT',
  stockerName: '',
  areaName: '',
  stockerStatus: 'IDLE',
  totalShelfCount: 0,
  useShelfCount: 0,
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.stockerName = ''
  formData.areaName = ''
  formData.stockerStatus = 'IDLE'
  formData.totalShelfCount = 0
  formData.useShelfCount = 0
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
      formData.stockerName = newVal.stockerName || newVal.stockerId || ''
      formData.areaName = newVal.areaName || ''
      formData.stockerStatus = newVal.stockerStatus || newVal.status || 'IDLE'
      formData.totalShelfCount = Number(newVal.totalShelfCount || newVal.totalSlots) || 0
      formData.useShelfCount = Number(newVal.useShelfCount || newVal.usedSlots) || 0
      formData.useState = newVal.useState || (newVal.useYn === 'N' ? 'UNUSE' : 'USE')
      formData.eventComment = newVal.eventComment || newVal.description || ''
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
      factoryName: formData.factoryName,
      stockerName: formData.stockerName,
      areaName: formData.areaName || undefined,
      stockerStatus: formData.stockerStatus,
      totalShelfCount: Number(formData.totalShelfCount) || 0,
      useShelfCount: Number(formData.useShelfCount) || 0,
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 복합키(factoryName + stockerName) 기준으로 수정 요청
      await executeUpdate(formData.factoryName, formData.stockerName, payload)
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save stocker failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 복합키(factoryName + stockerName) 기준으로 삭제 요청
    await executeDelete(formData.factoryName, formData.stockerName)
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete stocker failed:', error)
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
