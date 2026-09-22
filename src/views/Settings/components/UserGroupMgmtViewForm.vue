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
            label="소속 공장 (FACTORY_NAME)"
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
            label="사용자 그룹명 (USER_GROUP_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            placeholder="사용자 그룹명을 입력하세요"
            required
          ></v-text-field>
        </v-col>

        <!-- 계정 상태 -->
        <v-col cols="12">
          <v-select
            v-model="formData.useState"
            :items="statusOptions"
            label="계정 상태 (USE_STATE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 그룹 설명 -->
        <v-col cols="12">
          <v-textarea
            v-model="formData.description"
            label="그룹 설명 (DESCRIPTION)"
            variant="outlined"
            density="compact"
            rows="3"
            placeholder="사용자 그룹에 대한 설명을 입력하세요"
            auto-grow
          ></v-textarea>
        </v-col>

        <!-- 비고 / 코멘트 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.eventComment"
            label="비고 / 코멘트"
            variant="outlined"
            density="compact"
            placeholder="비고사항 입력"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-form>

    <v-divider></v-divider>

    <!-- 하단 액션 버튼 영역 -->
    <v-card-actions class="pa-4 action-buttons-container">
      <v-btn variant="outlined" color="secondary" v-on:click="onClose"> 취소 </v-btn>

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
        삭제
      </v-btn>

      <!-- 저장 / 수정 실행 버튼 -->
      <v-btn color="primary" variant="elevated" :loading="isSaving" v-on:click="onHandleSave">
        {{ isCreateMode ? '저장' : '수정' }}
      </v-btn>
    </v-card-actions>

    <!-- 삭제 확인 모달 -->
    <ConfirmDialog
      v-model="deleteConfirmDialog"
      :message="'[' + (formData.userGroupName || '선택한') + '] 사용자 그룹을 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
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

const panelStore = usePanelStore()
const formRef = ref(null)
const deleteConfirmDialog = ref(false)

// 식별자 TSID 대리키 보관 상태
const currentId = ref(null)

const factoryOptions = ['INSERT', 'POWDER', 'COMMON']
const statusOptions = [
  { title: '사용 (ACTIVE)', value: 'ACTIVE' },
  { title: '미사용 (INACTIVE)', value: 'INACTIVE' },
]

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
  return '필수 입력 항목입니다.'
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
      alert('신규 사용자 그룹이 등록되었습니다.')
    } else {
      // 대리키 TSID id 기준으로 수정 요청 수행
      const targetId = currentId.value
      await executeUpdate(targetId, payload)
      alert('사용자 그룹 정보가 수정되었습니다.')
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save user group failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '사용자 그룹 정보 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 대리키 TSID id 기준으로 삭제 요청 수행
    const targetId = currentId.value
    await executeDelete(targetId)
    alert('사용자 그룹이 삭제되었습니다.')

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete user group failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '사용자 그룹 삭제 처리 중 오류가 발생했습니다.'
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
