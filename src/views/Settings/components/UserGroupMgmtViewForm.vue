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
            :label="$t('views.settings.userGroup.form.factory')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            required
          ></v-select>
        </v-col>

        <!-- 사용자 그룹명 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.userGroupName"
            :label="$t('views.settings.userGroup.form.groupName')"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :placeholder="$t('views.settings.userGroup.form.placeholderGroupName')"
            required
          ></v-text-field>
        </v-col>

        <!-- 계정 상태 -->
        <v-col cols="12">
          <v-select
            v-model="formData.useState"
            :items="statusOptions"
            :label="$t('views.settings.userGroup.form.useYn')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 그룹 설명 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            :label="$t('views.settings.userGroup.form.groupDesc')"
            variant="outlined"
            density="compact"
            rows="3"
            :placeholder="$t('views.settings.userGroup.form.placeholderDesc')"
            auto-grow
          ></v-textarea>
        </v-col>

        <!-- 비고 / 코멘트 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.eventComment"
            :label="$t('common.comment')"
            variant="outlined"
            density="compact"
            :placeholder="$t('common.comment')"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-form>

    <v-divider></v-divider>

    <!-- 하단 액션 버튼 영역 -->
    <v-card-actions class="pa-4 action-buttons-container">
      <v-btn variant="outlined" color="secondary" v-on:click="onClose"> {{ $t('common.cancel') }} </v-btn>

      <v-spacer></v-spacer>

      <!-- UPDATE 모드일 때 삭제 버튼 제공 -->
      <v-btn
        v-if="!isCreateMode"
        color="error"
        variant="outlined"
        :loading="isDeleting"
        class="mr-2"
        v-on:click="onOpenDeleteDialog"
      >{{ $t('common.delete') }}</v-btn>

      <!-- 저장 / 수정 실행 버튼 -->
      <v-btn color="primary" variant="elevated" :loading="isSaving" v-on:click="onHandleSave">
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
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { createUserGroupApi, updateUserGroupApi, deleteUserGroupApi } from '@/api/userGroup'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

const { t } = useI18n()
const panelStore = usePanelStore()
const formRef = ref(null)
const deleteConfirmDialog = ref(false)

// 식별자 TSID 대리키 보관 상태
const currentId = ref(null)

const factoryOptions = ['INSERT', 'POWDER', 'COMMON']
const statusOptions = computed(() => [
  { title: t('common.userStatusActive'), value: 'ACTIVE' },
  { title: t('common.userStatusInactive'), value: 'INACTIVE' },
])

// useApi를 통한 API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createUserGroupApi)
const { loading: isUpdating, execute: executeUpdate } = useApi(updateUserGroupApi)
const { loading: isDeleting, execute: executeDelete } = useApi(deleteUserGroupApi)

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  factoryName: 'INSERT',
  userGroupName: '',
  description: '',
  useState: 'USE',
  eventComment: '',
})

function resetForm() {
  currentId.value = null
  formData.factoryName = 'INSERT'
  formData.userGroupName = ''
  formData.description = ''
  formData.useState = 'USE'
  formData.eventComment = ''
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      currentId.value = newVal.id || null
      formData.factoryName = newVal.factoryName || newVal.plant || 'INSERT'
      formData.userGroupName = newVal.userGroupName || newVal.groupName || ''
      formData.description = newVal.description || ''
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
      userGroupName: formData.userGroupName,
      description: formData.description || '',
      useState: formData.useState,
      eventComment: formData.eventComment || undefined,
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert(t('common.saveSuccess'))
    } else {
      // 대리키 TSID id 기준으로 수정 요청 수행
      const targetId = currentId.value
      await executeUpdate(targetId, payload)
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save user group failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 대리키 TSID id 기준으로 삭제 요청 수행
    const targetId = currentId.value
    await executeDelete(targetId)
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete user group failed:', error)
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
