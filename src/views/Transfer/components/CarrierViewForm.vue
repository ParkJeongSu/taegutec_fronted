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
            :label="$t('views.transfer.carrier.formFactory')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :disabled="!isCreateMode"
            required
          ></v-select>
        </v-col>

        <!-- 캐리어 코드 / 명 (PK 2) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.carrierName"
            :label="$t('views.transfer.carrier.formCarrierName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :placeholder="$t('views.transfer.carrier.placeholderCarrierCode')"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 캐리어 타입 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.carrierType"
            :items="carrierTypeOptions"
            :label="$t('views.transfer.carrier.formCarrierType')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 동작 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.carrierStatus"
            :items="carrierStatusOptions"
            :label="$t('views.transfer.carrier.formCarrierStatus')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 현재 위치 노드 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.currentNode"
            :label="$t('table.currentNode')"
            variant="outlined"
            density="compact"
            placeholder="NODE-04"
          ></v-text-field>
        </v-col>

        <!-- 목적지 노드 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.destNode"
            :label="$t('table.destNode')"
            variant="outlined"
            density="compact"
            placeholder="NODE-10"
          ></v-text-field>
        </v-col>

        <!-- 배터리 잔량 (%) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.battery"
            type="number"
            :label="$t('table.battery')"
            variant="outlined"
            density="compact"
            placeholder="85"
          ></v-text-field>
        </v-col>

        <!-- 사용 여부 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.useState"
            :items="useStateOptions"
            :label="$t('views.transfer.carrier.formUseState')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 적재 트레이 ID -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.loadedTrayId"
            :label="$t('table.loadedTrayId')"
            variant="outlined"
            density="compact"
            placeholder="TRAY-31101"
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
import {
  createWcsCarrierApi,
  updateWcsCarrierApi,
  deleteWcsCarrierApi,
} from '@/api/wcsCarrier'
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
const carrierTypeOptions = ['RGV', 'OHT', 'AGV', 'AMR']
const carrierStatusOptions = [
  'IDLE',
  'MOVING',
  'LOADING',
  'UNLOADING',
  'CHARGING',
  'ERROR',
  'DOWN',
]
const useStateOptions = [
  { title: t('common.useStatusActive'), value: 'USE' },
  { title: t('common.useStatusInactive'), value: 'UNUSE' },
]

// useApi를 통한 API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createWcsCarrierApi)
const { loading: isUpdating, execute: executeUpdate } = useApi(updateWcsCarrierApi)
const { loading: isDeleting, execute: executeDelete } = useApi(deleteWcsCarrierApi)

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  factoryName: 'INSERT',
  carrierName: '',
  carrierType: 'RGV',
  carrierStatus: 'IDLE',
  currentNode: '',
  destNode: '',
  battery: 100,
  loadedTrayId: '',
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.factoryName = 'INSERT'
  formData.carrierName = ''
  formData.carrierType = 'RGV'
  formData.carrierStatus = 'IDLE'
  formData.currentNode = ''
  formData.destNode = ''
  formData.battery = 100
  formData.loadedTrayId = ''
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
      formData.carrierName = isCreateMode.value ? '' : (newVal.carrierName || newVal.carrierId || '')
      formData.carrierType = newVal.carrierType || newVal.type || 'RGV'
      formData.carrierStatus = newVal.carrierStatus || newVal.status || 'IDLE'
      formData.currentNode = newVal.currentNode || ''
      formData.destNode = newVal.destNode || ''
      formData.battery = newVal.battery != null ? Number(newVal.battery) : 100
      formData.loadedTrayId = newVal.loadedTrayId || newVal.trayId || ''
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
      carrierName: formData.carrierName,
      carrierType: formData.carrierType,
      carrierStatus: formData.carrierStatus,
      currentNode: formData.currentNode || undefined,
      destNode: formData.destNode || undefined,
      battery: Number(formData.battery) || 0,
      loadedTrayId: formData.loadedTrayId || undefined,
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 복합키(factoryName + carrierName) 기준으로 수정 요청
      await executeUpdate(formData.factoryName, formData.carrierName, payload)
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save carrier failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 복합키(factoryName + carrierName) 기준으로 삭제 요청
    await executeDelete(formData.factoryName, formData.carrierName)
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete carrier failed:', error)
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
