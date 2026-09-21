<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 사번 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.userId"
            label="사번 (USER_ID)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            :readonly="!isCreateMode"
            :hint="isCreateMode ? '신규 등록 시 사번을 입력하세요' : '사번은 수정할 수 없습니다'"
            persistent-hint
            required
          ></v-text-field>
        </v-col>

        <!-- 성명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.userName"
            label="성명 (USER_NAME)"
            variant="outlined"
            density="compact"
            :rules="[validateRequired]"
            required
          ></v-text-field>
        </v-col>

        <!-- 소속 공장 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.factoryName"
            :items="plantOptions"
            label="소속 공장"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 비밀번호 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            label="비밀번호 (PASSWORD)"
            variant="outlined"
            density="compact"
            :placeholder="isCreateMode ? '비밀번호를 입력하세요' : '변경 시에만 입력하세요'"
            :rules="isCreateMode ? [validateRequired, validatePassword] : []"
            :append-inner-icon="showPassword ? '$eyeOff' : '$eye'"
            v-on:click:append-inner="togglePasswordVisibility"
          ></v-text-field>
        </v-col>

        <!-- 부서명 -->
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.departmentName"
            label="부서명"
            variant="outlined"
            density="compact"
            placeholder="부서명을 입력하세요"
          ></v-text-field>
        </v-col>

        <!-- 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.userState"
            :items="statusOptions"
            label="계정 상태 (USER_STATE)"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 이메일 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.email"
            label="이메일"
            type="email"
            variant="outlined"
            density="compact"
            placeholder="example@taegutec.co.kr"
          ></v-text-field>
        </v-col>

        <!-- 전화번호 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.phone"
            label="전화번호"
            variant="outlined"
            density="compact"
            placeholder="010-0000-0000"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-form>

    <v-divider></v-divider>

    <!-- 하단 액션 버튼 영역 -->
    <v-card-actions class="pa-4 action-buttons-container">
      <v-btn
        variant="outlined"
        color="secondary"
        v-on:click="onClose"
      >
        취소
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
        삭제
      </v-btn>

      <!-- 저장 / 수정 실행 버튼 -->
      <v-btn
        color="primary"
        variant="elevated"
        :loading="isSaving"
        v-on:click="onHandleSave"
      >
        {{ isCreateMode ? '저장' : '수정' }}
      </v-btn>
    </v-card-actions>

    <!-- 삭제 확인 모달 -->
    <ConfirmDialog
      v-model="deleteConfirmDialog"
      :message="'[' + formData.userId + ' (' + formData.userName + ')] 사용자를 삭제하시겠습니까?'"
      v-on:confirm="onConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { createUserApi, updateUserApi, deleteUserApi } from '@/api/user'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

const panelStore = usePanelStore()
const formRef = ref(null)
const showPassword = ref(false)
const deleteConfirmDialog = ref(false)

// 식별자 TSID 대리키 보관 상태
const currentId = ref(null)

const plantOptions = ['INSERT', 'POWDER', 'COMMON']
const statusOptions = [
  { title: '정상 (ACTIVE)', value: 'ACTIVE' },
  { title: '잠금/비활성 (INACTIVE)', value: 'INACTIVE' },
]

// useApi를 통한 API 바인딩
const { loading: isCreating, execute: executeCreate } = useApi(createUserApi)
const { loading: isUpdating, execute: executeUpdate } = useApi(updateUserApi)
const { loading: isDeleting, execute: executeDelete } = useApi(deleteUserApi)

const isSaving = computed(function () {
  return isCreating.value || isUpdating.value
})

const isCreateMode = computed(function () {
  return panelStore.mode === 'CREATE' || panelStore.mode === 'add'
})

const formData = reactive({
  userId: '',
  userName: '',
  password: '',
  factoryName: 'INSERT',
  departmentId: '',
  departmentName: '',
  email: '',
  phone: '',
  userState: 'ACTIVE',
})

function resetForm() {
  currentId.value = null
  formData.userId = ''
  formData.userName = ''
  formData.password = ''
  formData.factoryName = 'INSERT'
  formData.departmentId = ''
  formData.departmentName = ''
  formData.email = ''
  formData.phone = ''
  formData.userState = 'ACTIVE'
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      currentId.value = newVal.id || null
      formData.userId = newVal.userId || newVal.USER_ID || ''
      formData.userName = newVal.userName || newVal.USER_NAME || ''
      formData.password = ''
      formData.factoryName = newVal.factoryName || newVal.FACTORY_NAME || newVal.plant || 'INSERT'
      formData.departmentId = newVal.departmentId || newVal.DEPARTMENT_ID || ''
      formData.departmentName = newVal.departmentName || newVal.deptName || ''
      formData.email = newVal.email || ''
      formData.phone = newVal.phone || ''
      formData.userState = newVal.userState || newVal.USER_STATE || newVal.status || 'ACTIVE'
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

function validatePassword(value) {
  if (!value) {
    return true
  }
  if (String(value).length >= 4) {
    return true
  }
  return '비밀번호는 4자리 이상 입력해주세요.'
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
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
      userId: formData.userId,
      userName: formData.userName,
      factoryName: formData.factoryName,
      departmentId: formData.departmentId,
      departmentName: formData.departmentName,
      email: formData.email,
      phone: formData.phone,
      userState: formData.userState,
      status: formData.userState,
    }

    if (formData.password) {
      payload.password = formData.password
    }

    if (isCreateMode.value) {
      await executeCreate(payload)
      alert('신규 사용자가 등록되었습니다.')
    } else {
      // 대리키 id 기준으로 수정 요청 수행
      const targetId = currentId.value || formData.userId
      await executeUpdate(targetId, payload)
      alert('사용자 정보가 수정되었습니다.')
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save user failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '사용자 정보 저장 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 대리키 id 기준으로 삭제 요청 수행
    const targetId = currentId.value || formData.userId
    await executeDelete(targetId)
    alert('사용자가 삭제되었습니다.')

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete user failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) ||
      '사용자 삭제 처리 중 오류가 발생했습니다.'
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
