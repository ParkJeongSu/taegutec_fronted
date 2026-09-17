<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$lock" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">패스워드 정책 설정 (Password Policy)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 시스템 정책 &gt; 패스워드 정책
          </v-chip>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn color="primary" variant="flat" size="small" prepend-icon="$check" v-on:click="handleSave">
            설정 저장
          </v-btn>
          <v-btn variant="outlined" size="small" prepend-icon="$refresh" v-on:click="handleReset">
            초기화
          </v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 정책 설정 폼 -->
      <v-card variant="outlined" class="pa-4 mb-4 rounded-lg">
        <v-card-title class="text-subtitle-1 font-weight-bold px-0 pt-0">
          계정 보안 및 비밀번호 복잡도 규칙
        </v-card-title>
        <v-card-text class="px-0 pb-0">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="policy.minLength"
                type="number"
                label="최소 비밀번호 길이"
                variant="outlined"
                density="compact"
                suffix="자리 이상"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model.number="policy.expireDays"
                type="number"
                label="비밀번호 만료 주기"
                variant="outlined"
                density="compact"
                suffix="일"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model.number="policy.maxFailAttempts"
                type="number"
                label="로그인 연속 실패 허용 횟수 (계정 잠금)"
                variant="outlined"
                density="compact"
                suffix="회"
                class="mb-3"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-checkbox
                v-model="policy.requireUppercase"
                label="영문 대문자 포함 필수"
                density="compact"
                color="primary"
                hide-details
              ></v-checkbox>
              <v-checkbox
                v-model="policy.requireSpecialChar"
                label="특수문자(!@#$%^&*) 포함 필수"
                density="compact"
                color="primary"
                hide-details
              ></v-checkbox>
              <v-checkbox
                v-model="policy.preventReuseCount"
                label="직전 사용한 비밀번호 3회 이내 재사용 금지"
                density="compact"
                color="primary"
                hide-details
              ></v-checkbox>
              <v-checkbox
                v-model="policy.notifyBeforeExpire"
                label="만료 7일 전 로그인 시 변경 알림 팝업 표시"
                density="compact"
                color="primary"
                hide-details
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const policy = ref({
  minLength: 8,
  expireDays: 90,
  maxFailAttempts: 5,
  requireUppercase: true,
  requireSpecialChar: true,
  preventReuseCount: true,
  notifyBeforeExpire: true,
})

function handleSave() {
  alert('패스워드 정책이 성공적으로 저장되었습니다.')
}

function handleReset() {
  policy.value = {
    minLength: 8,
    expireDays: 90,
    maxFailAttempts: 5,
    requireUppercase: true,
    requireSpecialChar: true,
    preventReuseCount: true,
    notifyBeforeExpire: true,
  }
}
</script>

<style scoped>
.view-page-container {
  max-width: 100%;
}
.gap-2 {
  gap: 8px;
}
</style>
