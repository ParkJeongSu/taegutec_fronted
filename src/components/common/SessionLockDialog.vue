<template>
  <v-dialog :model-value="isLocked" persistent max-width="420" class="session-lock-dialog">
    <v-card class="pa-6 rounded-xl elevation-12">
      <div class="text-center mb-4">
        <v-avatar size="56" color="warning" class="mb-3 elevation-2">
          <v-icon icon="$lockOutline" size="32" color="white" />
        </v-avatar>
        <div class="text-h6 font-weight-bold">장시간 미사용으로 화면이 잠겼습니다</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          <strong>{{ userDisplayName }}</strong
          >님의 업무 화면을 보호하기 위해 화면이 잠겼습니다.<br />
          비밀번호를 입력하여 잠금을 해제하십시오.
        </div>
      </div>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4 text-caption font-weight-medium"
      >
        {{ errorMessage }}
      </v-alert>

      <v-form ref="formRef" v-on:submit.prevent="handleUnlock">
        <v-text-field
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="비밀번호"
          placeholder="계정 비밀번호 입력"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="$lock"
          :append-inner-icon="showPassword ? '$eyeOff' : '$eye'"
          :rules="[validateRequired]"
          autocomplete="current-password"
          autofocus
          class="mb-2"
          v-on:click:append-inner="togglePassword"
          v-on:keyup.enter="handleUnlock"
        ></v-text-field>

        <div class="d-flex justify-space-between align-center mb-4">
          <span class="text-caption text-error font-weight-bold">
            오류 횟수: {{ failCount }} / {{ maxFailLimit }} (5회 초과 시 로그아웃)
          </span>
          <v-btn
            variant="text"
            color="secondary"
            size="small"
            class="text-caption"
            v-on:click="handleDirectLogout"
          >
            로그아웃
          </v-btn>
        </div>

        <v-btn
          color="primary"
          block
          size="large"
          :loading="isLoading"
          class="font-weight-bold"
          v-on:click="handleUnlock"
        >
          잠금 해제
        </v-btn>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useIdleLock } from '@/composables/useIdleLock'

const authStore = useAuthStore()
const { isLocked, failCount, maxFailLimit, unlockWithPassword, stopWatch } = useIdleLock()

const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const formRef = ref(null)

const userDisplayName = computed(function () {
  if (authStore.currentUser) {
    return authStore.currentUser.userName || authStore.currentUser.userId
  }
  return '사용자'
})

function validateRequired(val) {
  if (val !== null && val !== undefined && String(val).trim() !== '') {
    return true
  }
  return '비밀번호를 입력해주세요.'
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function handleUnlock() {
  if (!password.value) {
    errorMessage.value = '비밀번호를 입력해주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await unlockWithPassword(password.value)
    if (res.success) {
      password.value = ''
      errorMessage.value = ''
    } else if (!res.logout) {
      errorMessage.value = res.message
      password.value = ''
    }
  } finally {
    isLoading.value = false
  }
}

function handleDirectLogout() {
  isLocked.value = false
  stopWatch()
  authStore.logout()
}
</script>

<style scoped>
.session-lock-dialog {
  z-index: 99999 !important;
}
</style>
