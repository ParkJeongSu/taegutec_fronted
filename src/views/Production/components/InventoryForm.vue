<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 품목 코드 (PK) -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.itemCode"
            :label="$t('table.itemCode')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="ITEM-001"
            :disabled="!isCreateMode"
            required
          ></v-text-field>
        </v-col>

        <!-- 창고 명칭 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.whName"
            :label="$t('table.whName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="자재1창고"
            required
          ></v-text-field>
        </v-col>

        <!-- 창고 유형 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.whType"
            :items="whTypeOptions"
            :label="$t('views.production.inventory.whType')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 현재 재고 수량 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="formData.qty"
            type="number"
            :label="$t('table.currentQty')"
            variant="outlined"
            density="compact"
            placeholder="500"
          ></v-text-field>
        </v-col>

        <!-- LOT 번호 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.lotNo"
            label="LOT 번호"
            variant="outlined"
            density="compact"
            placeholder="LOT-2026-0928"
          ></v-text-field>
        </v-col>

        <!-- 단위 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.unit"
            label="수량 단위"
            variant="outlined"
            density="compact"
            placeholder="EA"
          ></v-text-field>
        </v-col>

        <!-- 사용 여부 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.useState"
            :items="useStateOptions"
            :label="$t('table.useYn')"
            variant="outlined"
            density="compact"
          ></v-select>
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
import { saveInventoryApi, deleteInventoryApi } from '@/api/inventory'
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

const whTypeOptions = ['창고A', '창고B', '원자재창고', '완제품창고', '공정간창고']
const useStateOptions = [
  { title: t('common.use'), value: 'USE' },
  { title: t('common.unuse'), value: 'UNUSE' },
]

const { loading: isSavingApi, execute: executeSave } = useApi(saveInventoryApi)
const { loading: isDeletingApi, execute: executeDelete } = useApi(deleteInventoryApi)

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
  itemCode: '',
  whName: '',
  whType: '창고A',
  qty: 0,
  lotNo: '',
  unit: 'EA',
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  formData.id = null
  formData.itemCode = ''
  formData.whName = ''
  formData.whType = '창고A'
  formData.qty = 0
  formData.lotNo = ''
  formData.unit = 'EA'
  formData.useState = 'USE'
  formData.eventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      formData.id = isCreateMode.value ? null : (newVal.id || null)
      formData.itemCode = isCreateMode.value ? '' : (newVal.itemCode || '')
      formData.whName = newVal.whName || ''
      formData.whType = newVal.whType || '창고A'
      formData.qty = newVal.qty != null ? Number(newVal.qty) : 0
      formData.lotNo = isCreateMode.value ? '' : (newVal.lotNo || '')
      formData.unit = newVal.unit || 'EA'
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
      id: formData.id || undefined,
      itemCode: formData.itemCode,
      whName: formData.whName,
      whType: formData.whType,
      qty: Number(formData.qty) || 0,
      lotNo: formData.lotNo || undefined,
      unit: formData.unit || 'EA',
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    const apiMode = isCreateMode.value ? 'add' : 'edit'
    await executeSave(apiMode, payload)
    alert(t('common.saveSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save inventory failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    if (formData.id) {
      await executeDelete(formData.id)
    }
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete inventory failed:', error)
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
