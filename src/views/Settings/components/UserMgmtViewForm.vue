<template>
  <div class="form-container d-flex flex-column fill-height">
    <!-- 입력 폼 영역 -->
    <v-form ref="formRef" class="flex-grow-1 overflow-y-auto pa-4">
      <v-row density="comfortable">
        <!-- 사번 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.userId"
            :label="$t('views.settings.userMgmt.form.userId')"
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
            :label="$t('views.settings.userMgmt.form.userName')"
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
            :label="$t('views.settings.userMgmt.form.factory')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 비밀번호 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('views.settings.userMgmt.form.password')"
            variant="outlined"
            density="compact"
            :placeholder="isCreateMode ? '비밀번호를 입력하세요' : '변경 시에만 입력하세요'"
            :rules="isCreateMode ? [validateRequired, validatePassword] : []"
            :append-inner-icon="showPassword ? '$eyeOff' : '$eye'"
            v-on:click:append-inner="togglePasswordVisibility"
            autocomplete="new-password"
          ></v-text-field>
        </v-col>

        <!-- 소속 부서 선택 (v-autocomplete) -->
        <v-col cols="12" sm="6">
          <v-autocomplete
            v-model="formData.departmentId"
            :items="departmentOptions"
            item-title="departmentName"
            item-value="id"
            :label="$t('views.settings.userMgmt.form.dept')"
            :placeholder="$t('views.settings.userMgmt.form.dept')"
            variant="outlined"
            density="compact"
            clearable
            :loading="isDeptLoading"
            v-on:update:model-value="onDepartmentChange"
          ></v-autocomplete>
        </v-col>

        <!-- 상태 -->
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.userState"
            :items="statusOptions"
            :label="$t('views.settings.userMgmt.form.useYn')"
            variant="outlined"
            density="compact"
          ></v-select>
        </v-col>

        <!-- 이메일 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.email"
            :label="$t('views.settings.userMgmt.form.email')"
            type="email"
            variant="outlined"
            density="compact"
            placeholder="example@taegutec.co.kr"
            autocomplete="email"
          ></v-text-field>
        </v-col>

        <!-- 전화번호 -->
        <v-col cols="12">
          <v-text-field
            v-model="formData.phone"
            :label="$t('views.settings.userMgmt.form.phone')"
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
        >{{ $t('common.delete') }}</v-btn
      >

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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { createUserApi, updateUserApi, deleteUserApi } from '@/api/user'
import { fetchDepartmentsApi } from '@/api/department'
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
const showPassword = ref(false)
const deleteConfirmDialog = ref(false)

// 식별자 TSID 대리키 보관 상태
const currentId = ref(null)

const plantOptions = ['INSERT', 'POWDER', 'COMMON']
const statusOptions = computed(() => [
  { title: t('common.userStatusActive'), value: 'ACTIVE' },
  { title: t('common.userStatusInactive'), value: 'INACTIVE' },
])

// 부서 옵션 상태 목록
const departmentOptions = ref([])

// useApi를 통한 API 바인딩
const {
  data: deptData,
  loading: isDeptLoading,
  execute: executeFetchDepts,
} = useApi(fetchDepartmentsApi)
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

/**
 * 부서 선택 시 호출되는 체인지 핸들러
 * @param {string|number|null} selectedId - 선택된 부서 ID
 */
function onDepartmentChange(selectedId) {
  if (!selectedId) {
    formData.departmentId = ''
    formData.departmentName = ''
    return
  }

  let matchedDeptName = ''
  for (let i = 0; i < departmentOptions.value.length; i = i + 1) {
    const item = departmentOptions.value[i]
    if (item && String(item.id) === String(selectedId)) {
      matchedDeptName = item.departmentName
      break
    }
  }

  formData.departmentId = selectedId
  formData.departmentName = matchedDeptName
}

/**
 * 부서 목록 API 조회 및 옵션 목록 구성
 */
async function loadDepartments() {
  try {
    const response = await executeFetchDepts({ page: 0, size: 100, useState: 'USE' })
    const targetData = response || deptData.value
    let contentList = []

    if (targetData) {
      if (targetData.data && Array.isArray(targetData.data.content)) {
        contentList = targetData.data.content
      } else if (targetData.content && Array.isArray(targetData.content)) {
        contentList = targetData.content
      } else if (targetData.data && Array.isArray(targetData.data)) {
        contentList = targetData.data
      } else if (Array.isArray(targetData)) {
        contentList = targetData
      }
    }

    const options = []
    for (let i = 0; i < contentList.length; i = i + 1) {
      const dept = contentList[i]
      if (dept) {
        options.push({
          id: dept.id || dept.deptCode || dept.departmentId,
          departmentName: dept.departmentName || dept.deptName || '',
        })
      }
    }
    departmentOptions.value = options

    // formData에 이미 부서 정보가 있는 경우 동기화 보정
    if (formData.departmentId && !formData.departmentName) {
      for (let i = 0; i < options.length; i = i + 1) {
        if (String(options[i].id) === String(formData.departmentId)) {
          formData.departmentName = options[i].departmentName
          break
        }
      }
    } else if (!formData.departmentId && formData.departmentName) {
      for (let i = 0; i < options.length; i = i + 1) {
        if (options[i].departmentName === formData.departmentName) {
          formData.departmentId = options[i].id
          break
        }
      }
    }
  } catch (error) {
    console.error('Fetch departments error:', error)
    departmentOptions.value = []
  }
}

watch(
  function () {
    return props.data || panelStore.selectedItem
  },
  function (newVal) {
    if (newVal) {
      currentId.value = isCreateMode.value ? null : newVal.id || null
      formData.userId = isCreateMode.value ? '' : newVal.userId || newVal.USER_ID || ''
      formData.userName = isCreateMode.value ? '' : newVal.userName || newVal.USER_NAME || ''
      formData.password = ''
      formData.factoryName = newVal.factoryName || newVal.FACTORY_NAME || newVal.plant || 'INSERT'
      formData.departmentId = newVal.departmentId || newVal.DEPARTMENT_ID || newVal.deptCode || ''
      formData.departmentName = newVal.departmentName || newVal.deptName || ''
      formData.email = newVal.email || ''
      formData.phone = newVal.phone || ''
      formData.userState = newVal.userState || newVal.USER_STATE || newVal.status || 'ACTIVE'

      // 부서 목록이 이미 로드되어 있다면 동기화 검증
      if (departmentOptions.value.length > 0) {
        if (formData.departmentId && !formData.departmentName) {
          for (let i = 0; i < departmentOptions.value.length; i = i + 1) {
            if (String(departmentOptions.value[i].id) === String(formData.departmentId)) {
              formData.departmentName = departmentOptions.value[i].departmentName
              break
            }
          }
        } else if (!formData.departmentId && formData.departmentName) {
          for (let i = 0; i < departmentOptions.value.length; i = i + 1) {
            if (departmentOptions.value[i].departmentName === formData.departmentName) {
              formData.departmentId = departmentOptions.value[i].id
              break
            }
          }
        }
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

onMounted(function () {
  loadDepartments()
})

function validateRequired(value) {
  if (value !== null && value !== undefined && String(value).trim() !== '') {
    return true
  }
  return t('validation.required')
}

function validatePassword(value) {
  if (!value) {
    return true
  }
  if (String(value).length >= 4) {
    return true
  }
  return t('validation.passwordLength')
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
      departmentId: formData.departmentId || null,
      departmentName: formData.departmentName || null,
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
      alert(t('common.saveSuccess'))
    } else {
      // 대리키 id 기준으로 수정 요청 수행
      const targetId = currentId.value || formData.userId
      await executeUpdate(targetId, payload)
      alert(t('common.saveSuccess'))
    }

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Save user failed:', error)
    const errorMsg =
      (error.response && error.response.data && error.response.data.message) || t('common.saveFail')
    alert(errorMsg)
  }
}

async function onConfirmDelete() {
  try {
    // 대리키 id 기준으로 삭제 요청 수행
    const targetId = currentId.value || formData.userId
    await executeDelete(targetId)
    alert(t('common.deleteSuccess'))

    if (typeof panelStore.onSuccess === 'function') {
      panelStore.onSuccess()
    }
    panelStore.closePanel()
  } catch (error) {
    console.error('Delete user failed:', error)
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
