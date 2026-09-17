<template>
  <v-container fluid class="login-container pa-4 d-flex justify-center align-center">
    <v-card class="login-card elevation-8 rounded-xl pa-8" max-width="460">
      <!-- 상단 로고 및 공장 식별 영역 -->
      <div class="text-center mb-6">
        <div class="brand-badge-wrapper mb-3 d-inline-flex align-center justify-center">
          <v-avatar size="44" color="primary" class="mr-3 elevation-2">
            <v-icon icon="$robotIndustrial" size="24" color="white" />
          </v-avatar>
          <span class="text-h4 font-weight-black brand-title">TaeguTec</span>
        </div>

        <div class="text-subtitle-2 font-weight-medium text-medium-emphasis mb-3">
          Manufacturing Execution System
        </div>

        <!-- 공장 식별 칩 -->
        <div class="d-flex justify-center align-center">
          <v-chip
            :color="plantChipColor"
            variant="flat"
            size="small"
            class="font-weight-bold px-3 plant-badge elevation-1"
          >
            <v-icon icon="$bullseyeArrow" start size="14" />
            {{ currentPlantTitle }}
          </v-chip>
        </div>
      </div>

      <v-divider class="mb-6 divider-accent"></v-divider>

      <!-- 에러 메시지 알림 -->
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
        closable
        v-on:click:close="clearErrorMessage"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- 로그인 폼 -->
      <v-form ref="formRef" v-model="isFormValid" v-on:submit.prevent="handleLogin">
        <!-- 사번 입력 필드 -->
        <div class="mb-4">
          <label class="form-label text-caption font-weight-bold text-medium-emphasis mb-1 d-block">
            사번 (Employee ID)
          </label>
          <v-text-field
            v-model="employeeId"
            variant="outlined"
            density="comfortable"
            placeholder="사번을 입력해주세요"
            prepend-inner-icon="$account"
            :rules="[validateRequired, validateEmployeeId]"
            autocomplete="username"
            v-on:keyup.enter="handleLogin"
            required
          ></v-text-field>
        </div>

        <!-- 비밀번호 입력 필드 -->
        <div class="mb-4">
          <label class="form-label text-caption font-weight-bold text-medium-emphasis mb-1 d-block">
            비밀번호 (Password)
          </label>
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            placeholder="비밀번호를 입력해주세요"
            prepend-inner-icon="$lock"
            :append-inner-icon="showPassword ? '$eyeOff' : '$eye'"
            :rules="[validateRequired, validatePassword]"
            autocomplete="current-password"
            v-on:click:append-inner="togglePasswordVisibility"
            v-on:keyup.enter="handleLogin"
            required
          ></v-text-field>
        </div>

        <!-- 옵션 영역 (사번 저장 및 공장 코드 표시) -->
        <div class="d-flex justify-space-between align-center mb-6">
          <v-checkbox
            v-model="rememberMe"
            label="사번 저장"
            density="compact"
            color="primary"
            hide-details
          ></v-checkbox>
          <span class="text-caption text-medium-emphasis font-weight-bold plant-code-text">
            PLANT : {{ plantCode }}
          </span>
        </div>

        <!-- 로그인 실행 버튼 -->
        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="isLoading"
          class="login-btn font-weight-bold text-body-1"
        >
          로그인
        </v-btn>
      </v-form>

      <!-- 하단 카피라이트 -->
      <div class="text-center mt-6">
        <p class="text-caption text-disabled mb-0">
          &copy; TaeguTec Ltd. All rights reserved.
        </p>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { APP_TITLE, PLANT_TYPE, isInsert, isPowder } from '@/constants/plant'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)

const employeeId = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const isFormValid = ref(false)
const errorMessage = ref('')

const plantCode = PLANT_TYPE
const currentPlantTitle = APP_TITLE

const plantChipColor = computed(function () {
  if (isInsert()) {
    return 'primary'
  }
  if (isPowder()) {
    return 'warning'
  }
  return 'secondary'
})

function validateRequired(value) {
  if (value !== null && value !== undefined && String(value).trim() !== '') {
    return true
  }
  return '필수 입력 항목입니다.'
}

function validateEmployeeId(value) {
  if (!value) {
    return true
  }
  if (String(value).trim().length >= 2) {
    return true
  }
  return '사번은 2자리 이상 입력해주세요.'
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

function clearErrorMessage() {
  errorMessage.value = ''
}

async function handleLogin() {
  if (!formRef.value) {
    return
  }

  const validationResult = await formRef.value.validate()
  if (!validationResult.valid) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 1. 사번 저장 옵션 처리
    if (rememberMe.value) {
      localStorage.setItem('saved_employee_id', employeeId.value)
    } else {
      localStorage.removeItem('saved_employee_id')
    }

    // 2. 인증 토큰 및 사용자 정보 저장
    const token = 'tegutec-token-' + Date.now()
    const userInfo = {
      employeeId: employeeId.value,
      plant: plantCode,
      loginAt: new Date().toISOString(),
    }

    authStore.setAuth(token, userInfo)

    // 3. 메인 업무 화면으로 이동
    router.push('/')
  } catch (error) {
    errorMessage.value = '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(function () {
  const savedId = localStorage.getItem('saved_employee_id')
  if (savedId) {
    employeeId.value = savedId
    rememberMe.value = true
  }
})
</script>

<style scoped>
.login-container {
  width: 100%;
  position: relative;
  z-index: 2;
}

.login-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(0, 77, 64, 0.15);
  box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.45) !important;
}

.brand-badge-wrapper {
  letter-spacing: -0.5px;
}

.brand-title {
  color: #004d40;
  letter-spacing: -0.5px;
}

.plant-badge {
  letter-spacing: 0.5px;
}

.divider-accent {
  opacity: 0.12;
}

.form-label {
  letter-spacing: 0.2px;
}

.plant-code-text {
  font-family: monospace;
  letter-spacing: 0.5px;
}

.login-btn {
  height: 48px;
  letter-spacing: 0.5px;
}
</style>
