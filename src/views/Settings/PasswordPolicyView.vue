<template>
  <v-container fluid class="pa-4 password-policy-view">
    <!-- 상단 타이틀 및 액션 헤더 카드 -->
    <v-card class="elevation-1 rounded-lg pa-4 mb-4 header-card">
      <div class="d-flex flex-wrap align-center justify-space-between header-row">
        <!-- 좌측: 화면 타이틀 & 설명 -->
        <div class="d-flex align-center title-wrapper mb-3 mb-md-0">
          <div class="title-icon-box mr-3">
            <v-icon icon="$lock" size="24" color="primary" />
          </div>
          <div>
            <div class="d-flex align-center">
              <span class="text-h6 font-weight-bold text-high-emphasis mr-3">
                패스워드 정책 관리 (Password Policy)
              </span>
              <v-chip size="small" color="primary" variant="tonal" class="font-weight-medium">
                설정 &gt; 보안 관리 &gt; 패스워드 정책
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              공장별 10대 패스워드 보안 정책을 설정하고 사용자 계정의 비밀번호 복잡도 및 수명주기를 관리합니다.
            </div>
          </div>
        </div>

        <!-- 우측: 공장 선택 및 액션 버튼 툴바 -->
        <div class="d-flex flex-wrap align-center action-toolbar">
          <!-- 공장 선택 드롭다운 -->
          <div class="factory-select-wrapper mr-3 mb-2 mb-sm-0">
            <v-select
              v-model="selectedFactory"
              :items="factoryList"
              label="대상 공장 (Factory)"
              variant="outlined"
              density="compact"
              hide-details
              class="factory-select"
              v-on:update:model-value="onFactoryChange"
            />
          </div>

          <!-- 일괄 제어 버튼 그룹 -->
          <div class="d-flex align-center btn-group">
            <v-btn
              variant="outlined"
              color="success"
              size="small"
              prepend-icon="$check"
              class="mr-2 font-weight-medium"
              v-on:click="toggleAllPolicies('Y')"
            >
              전체 활성화
            </v-btn>

            <v-btn
              variant="outlined"
              color="grey-darken-1"
              size="small"
              prepend-icon="$close"
              class="mr-2 font-weight-medium"
              v-on:click="toggleAllPolicies('N')"
            >
              전체 비활성화
            </v-btn>

            <v-btn
              variant="outlined"
              color="secondary"
              size="small"
              prepend-icon="$refresh"
              class="mr-2 font-weight-medium"
              :disabled="isPolicyLoading || isSaving"
              v-on:click="loadPolicies"
            >
              새로고침
            </v-btn>

            <v-btn
              color="primary"
              variant="elevated"
              size="small"
              prepend-icon="$contentSave"
              class="font-weight-bold"
              :loading="isSaving"
              :disabled="isPolicyLoading"
              v-on:click="handleSave"
            >
              정책 저장
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <!-- 요약 상태 카드 (Stats Banner) -->
    <v-row class="mb-4 stats-banner-row">
      <v-col cols="12" sm="4">
        <v-card variant="outlined" class="pa-3 rounded-lg stats-card bg-surface">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis font-weight-medium">전체 정책 항목</div>
              <div class="text-h5 font-weight-bold mt-1 text-primary">{{ policyMetaList.length }}개</div>
            </div>
            <v-avatar color="primary" variant="tonal" size="40">
              <v-icon icon="$shieldCheck" size="22" color="primary" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card variant="outlined" class="pa-3 rounded-lg stats-card bg-surface">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis font-weight-medium">현재 적용 중인 정책</div>
              <div class="text-h5 font-weight-bold mt-1 text-success">{{ activePolicyCount }}개</div>
            </div>
            <v-avatar color="success" variant="tonal" size="40">
              <v-icon icon="$check" size="22" color="success" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card variant="outlined" class="pa-3 rounded-lg stats-card bg-surface">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis font-weight-medium">미적용 정책</div>
              <div class="text-h5 font-weight-bold mt-1 text-grey-darken-1">{{ inactivePolicyCount }}개</div>
            </div>
            <v-avatar color="grey" variant="tonal" size="40">
              <v-icon icon="$close" size="22" color="grey-darken-1" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 메인 정책 설정 목록 카드 -->
    <v-card class="elevation-1 rounded-lg pa-4 policy-main-card">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-icon icon="$shieldCheck" size="20" color="primary" class="mr-2" />
          <span class="text-subtitle-1 font-weight-bold">
            [{{ selectedFactory }}] 공장 보안 정책 설정 목록
          </span>
        </div>
        <div class="text-caption text-medium-emphasis">
          항목을 클릭하거나 체크박스를 토글하여 정책을 활성화/비활성화할 수 있습니다.
        </div>
      </div>

      <v-divider class="mb-3"></v-divider>

      <!-- 로딩 진행바 -->
      <v-progress-linear
        v-if="isPolicyLoading"
        indeterminate
        color="primary"
        class="mb-3"
      />

      <!-- 10대 정책 리스트 -->
      <div class="policy-items-list">
        <div
          v-for="(meta, index) in policyMetaList"
          :key="meta.key"
          class="policy-item-row pa-3 mb-2 rounded-lg d-flex align-center justify-space-between cursor-pointer"
          :class="{
            'item-active': policyStateMap[meta.key] && policyStateMap[meta.key].isActive === 'Y',
            'item-inactive': !policyStateMap[meta.key] || policyStateMap[meta.key].isActive !== 'Y',
          }"
          v-on:click="toggleSinglePolicy(meta.key)"
        >
          <!-- 좌측: 순번, 토글 체크박스, 아이콘, 정책 설명 -->
          <div class="d-flex align-center policy-left-info flex-grow-1 mr-3">
            <!-- 번호 뱃지 -->
            <span class="index-badge mr-3 text-caption font-weight-bold text-medium-emphasis">
              #{{ index + 1 }}
            </span>

            <!-- 체크박스 -->
            <div class="checkbox-wrapper mr-3" v-on:click.stop>
              <v-checkbox-btn
                :model-value="policyStateMap[meta.key] && policyStateMap[meta.key].isActive === 'Y'"
                color="primary"
                density="compact"
                class="policy-checkbox"
                v-on:update:model-value="onCheckboxUpdate(meta.key, $event)"
              />
            </div>

            <!-- 정책 아이콘 아바타 -->
            <v-avatar
              :color="policyStateMap[meta.key] && policyStateMap[meta.key].isActive === 'Y' ? meta.categoryColor : 'grey-lighten-2'"
              :variant="policyStateMap[meta.key] && policyStateMap[meta.key].isActive === 'Y' ? 'tonal' : 'flat'"
              size="38"
              class="mr-3 policy-icon-avatar"
            >
              <v-icon
                :icon="meta.icon"
                size="20"
                :color="policyStateMap[meta.key] && policyStateMap[meta.key].isActive === 'Y' ? meta.categoryColor : 'grey-darken-1'"
              />
            </v-avatar>

            <!-- 정책명 & 상세 설명 -->
            <div class="policy-text-content">
              <div class="d-flex align-center flex-wrap">
                <span class="policy-title font-weight-bold text-body-1 mr-2">
                  {{ meta.title }}
                </span>
                <v-chip size="x-small" :color="meta.categoryColor" variant="tonal" class="mr-2 font-weight-medium">
                  {{ meta.category }}
                </v-chip>
                <code class="policy-key-code text-caption">{{ meta.key }}</code>
              </div>
              <div class="policy-description text-body-2 text-medium-emphasis mt-1">
                {{ meta.description }}
              </div>
            </div>
          </div>

          <!-- 우측: 기본 권장값 및 적용 상태 뱃지 -->
          <div class="d-flex align-center policy-right-status" v-on:click.stop>
            <div class="default-val-box text-right mr-4 d-none d-md-block">
              <div class="text-caption text-disabled">기본 권장값</div>
              <div class="text-caption font-weight-medium text-high-emphasis">{{ meta.defaultValue }}</div>
            </div>

            <!-- 상태 뱃지 -->
            <v-chip
              size="small"
              :color="policyStateMap[meta.key] && policyStateMap[meta.key].isActive === 'Y' ? 'success' : 'grey'"
              :variant="policyStateMap[meta.key] && policyStateMap[meta.key].isActive === 'Y' ? 'flat' : 'outlined'"
              class="status-chip font-weight-bold"
            >
              <v-icon
                :icon="policyStateMap[meta.key] && policyStateMap[meta.key].isActive === 'Y' ? '$check' : '$close'"
                start
                size="14"
              />
              {{ policyStateMap[meta.key] && policyStateMap[meta.key].isActive === 'Y' ? '적용 중' : '미적용' }}
            </v-chip>
          </div>
        </div>
      </div>

      <!-- 하단 안내문 -->
      <div class="d-flex align-center justify-space-between pt-3 mt-2 border-t">
        <div class="d-flex align-center text-caption text-medium-emphasis">
          <v-icon icon="$information" size="16" color="info" class="mr-1" />
          비밀번호 변경 및 사용자 등록 시 활성화된 정책 조건이 실시간 검증에 적용됩니다.
        </div>
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          prepend-icon="$contentSave"
          class="font-weight-bold"
          :loading="isSaving"
          :disabled="isPolicyLoading"
          v-on:click="handleSave"
        >
          설정 저장하기
        </v-btn>
      </div>
    </v-card>

    <!-- 스낵바 알림 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon :icon="snackbar.icon" class="mr-2" size="20" />
        <span>{{ snackbar.text }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import {
  fetchPasswordPoliciesApi,
  createPasswordPolicyApi,
  updatePasswordPolicyApi,
} from '@/api/passwordPolicy'

// 공장 목록 및 선택 상태
const factoryList = ['INSERT', 'POWDER', 'COMMON']
const selectedFactory = ref('INSERT')

// 10대 정책 고정 메타데이터 정의
const policyMetaList = [
  {
    key: 'MIN_CHARACTERS',
    title: '최소 글자 수 제한',
    category: '복잡도 규칙',
    categoryColor: 'primary',
    icon: '$lock',
    description: '비밀번호의 최소 글자 수를 8자리 이상으로 제한합니다.',
    defaultValue: '8자리 이상',
  },
  {
    key: 'MIN_UPPER_CASE',
    title: '영문 대문자 필수 포함',
    category: '복잡도 규칙',
    categoryColor: 'primary',
    icon: '$shieldCheck',
    description: '비밀번호에 영문 대문자(A-Z)를 최소 1자 이상 포함해야 합니다.',
    defaultValue: '1자 이상',
  },
  {
    key: 'MIN_LOWER_CASE',
    title: '영문 소문자 필수 포함',
    category: '복잡도 규칙',
    categoryColor: 'primary',
    icon: '$shieldCheck',
    description: '비밀번호에 영문 소문자(a-z)를 최소 1자 이상 포함해야 합니다.',
    defaultValue: '1자 이상',
  },
  {
    key: 'MIN_NUMERIC',
    title: '숫자 필수 포함',
    category: '복잡도 규칙',
    categoryColor: 'primary',
    icon: '$shieldCheck',
    description: '비밀번호에 숫자(0-9)를 최소 1자 이상 포함해야 합니다.',
    defaultValue: '1자 이상',
  },
  {
    key: 'MIN_SPECIAL_CHARACTERS',
    title: '특수문자 필수 포함',
    category: '복잡도 규칙',
    categoryColor: 'primary',
    icon: '$shieldCheck',
    description: '비밀번호에 특수문자(!@#$%^&* 등)를 최소 1자 이상 포함해야 합니다.',
    defaultValue: '1자 이상',
  },
  {
    key: 'MAX_IDENTICAL_CONSECUTIVE',
    title: '동일 문자 연속 반복 제한',
    category: '패턴 제한',
    categoryColor: 'warning',
    icon: '$alert',
    description: '동일한 문자가 3회 이상 연속으로 반복(예: aaa, 111)되는 것을 제한합니다.',
    defaultValue: '3회 이상 연속 금지',
  },
  {
    key: 'MAX_FAILED_LOGINS',
    title: '로그인 실패 횟수 제한 (계정 잠금)',
    category: '계정 보호',
    categoryColor: 'error',
    icon: '$accountLock',
    description: '로그인 연속 실패 시 무차별 대입 공격을 차단하기 위해 계정을 잠금 처리합니다.',
    defaultValue: '5회 실패 시 잠금',
  },
  {
    key: 'MAX_DAYS_BEFORE_CHANGE',
    title: '비밀번호 변경 의무 주기 (만료일)',
    category: '수명주기 관리',
    categoryColor: 'info',
    icon: '$clockOutline',
    description: '설정된 기간 경과 시 비밀번호를 의무적으로 변경해야 로그인할 수 있습니다.',
    defaultValue: '90일 주기',
  },
  {
    key: 'MIN_DAYS_BEFORE_CHANGE',
    title: '비밀번호 변경 최소 주기',
    category: '수명주기 관리',
    categoryColor: 'info',
    icon: '$clockOutline',
    description: '비밀번호 변경 후 무분별한 잦은 재변경을 방지하기 위해 최소 대기 기간을 설정합니다.',
    defaultValue: '1일 경과 후 변경 가능',
  },
  {
    key: 'PASSWORD_HISTORY_LIMIT',
    title: '이전 비밀번호 재사용 제한',
    category: '이력 관리',
    categoryColor: 'secondary',
    icon: '$history',
    description: '직전에 사용했던 과거 비밀번호로 다시 재설정하는 것을 금지합니다.',
    defaultValue: '직전 3회 이내 재사용 금지',
  },
]

// 각 정책별 실제 저장 상태 맵: { [policyKey]: { id: string|null, isActive: 'Y'|'N', policyValue: null } }
const policyStateMap = reactive({})

// 초기 기본 상태 세팅 함수
function initializeDefaultPolicyState() {
  for (let i = 0; i < policyMetaList.length; i = i + 1) {
    const meta = policyMetaList[i]
    policyStateMap[meta.key] = {
      id: null,
      isActive: 'Y',
      policyValue: null,
    }
  }
}

// useApi 컴포저블을 활용한 비동기 통신
const { loading: isPolicyLoading, execute: executeFetchPolicies } = useApi(fetchPasswordPoliciesApi)
const isSaving = ref(false)

// 알림 스낵바 상태
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
  icon: '$check',
})

/**
 * 스낵바 토스트 알림을 띄우는 함수
 * @param {string} message - 안내 메시지
 * @param {string} [type='success'] - 'success' | 'error' | 'info' | 'warning'
 */
function showToast(message, type) {
  snackbar.text = message
  if (type === 'error') {
    snackbar.color = 'error'
    snackbar.icon = '$alertCircle'
  } else if (type === 'warning') {
    snackbar.color = 'warning'
    snackbar.icon = '$alert'
  } else if (type === 'info') {
    snackbar.color = 'info'
    snackbar.icon = '$information'
  } else {
    snackbar.color = 'success'
    snackbar.icon = '$check'
  }
  snackbar.show = true
}

// 적용 중 / 미적용 정책 수 계산
const activePolicyCount = computed(function () {
  let count = 0
  for (let i = 0; i < policyMetaList.length; i = i + 1) {
    const key = policyMetaList[i].key
    if (policyStateMap[key] && policyStateMap[key].isActive === 'Y') {
      count = count + 1
    }
  }
  return count
})

const inactivePolicyCount = computed(function () {
  return policyMetaList.length - activePolicyCount.value
})

/**
 * 백엔드에서 현재 선택된 공장의 패스워드 정책 목록을 조회하고 맵에 바인딩
 */
async function loadPolicies() {
  try {
    initializeDefaultPolicyState()
    const fetchedData = await executeFetchPolicies({ factoryName: selectedFactory.value })

    let list = []
    if (Array.isArray(fetchedData)) {
      list = fetchedData
    } else if (fetchedData && Array.isArray(fetchedData.content)) {
      list = fetchedData.content
    } else if (fetchedData && Array.isArray(fetchedData.data)) {
      list = fetchedData.data
    }

    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i = i + 1) {
        const item = list[i]
        if (item && item.policyName && policyStateMap[item.policyName]) {
          policyStateMap[item.policyName].id = item.id || null
          policyStateMap[item.policyName].isActive = item.isActive === 'Y' || item.isActive === true ? 'Y' : 'N'
          if (item.policyValue !== undefined) {
            policyStateMap[item.policyName].policyValue = item.policyValue
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to load password policies:', err)
    showToast('패스워드 정책 목록을 불러오는 중 오류가 발생했습니다.', 'error')
  }
}

/**
 * 대상 공장 변경 이벤트 핸들러
 */
function onFactoryChange() {
  loadPolicies()
}

/**
 * 단일 정책 활성화/비활성화 토글
 * @param {string} policyKey - 정책 식별 키
 */
function toggleSinglePolicy(policyKey) {
  if (!policyStateMap[policyKey]) {
    policyStateMap[policyKey] = { id: null, isActive: 'Y', policyValue: null }
  }
  const current = policyStateMap[policyKey].isActive
  policyStateMap[policyKey].isActive = current === 'Y' ? 'N' : 'Y'
}

/**
 * 체크박스 값 변경 이벤트 핸들러
 * @param {string} policyKey - 정책 식별 키
 * @param {boolean} checked - 체크 여부
 */
function onCheckboxUpdate(policyKey, checked) {
  if (!policyStateMap[policyKey]) {
    policyStateMap[policyKey] = { id: null, isActive: 'Y', policyValue: null }
  }
  policyStateMap[policyKey].isActive = checked ? 'Y' : 'N'
}

/**
 * 전체 정책 일괄 활성화 또는 비활성화
 * @param {'Y'|'N'} targetState - 설정할 상태값
 */
function toggleAllPolicies(targetState) {
  for (let i = 0; i < policyMetaList.length; i = i + 1) {
    const key = policyMetaList[i].key
    if (!policyStateMap[key]) {
      policyStateMap[key] = { id: null, isActive: targetState, policyValue: null }
    } else {
      policyStateMap[key].isActive = targetState
    }
  }
}

/**
 * 전체 패스워드 정책 일괄 저장 처리
 */
async function handleSave() {
  isSaving.value = true
  let successCount = 0
  let errorCount = 0

  try {
    for (let i = 0; i < policyMetaList.length; i = i + 1) {
      const meta = policyMetaList[i]
      const state = policyStateMap[meta.key]
      const isActiveValue = state && state.isActive === 'Y' ? 'Y' : 'N'

      try {
        if (state && state.id) {
          // 1. 기존 데이터 수정 (PUT)
          await updatePasswordPolicyApi(state.id, {
            factoryName: selectedFactory.value,
            policyName: meta.key,
            isActive: isActiveValue,
            eventUser: 'SYSTEM',
            eventComment: 'Password policy updated',
          })
          successCount = successCount + 1
        } else {
          // 2. 신규 정책 등록 (POST)
          const createRes = await createPasswordPolicyApi({
            factoryName: selectedFactory.value,
            policyName: meta.key,
            isActive: isActiveValue,
            eventUser: 'SYSTEM',
            eventComment: 'Initial password policy created',
          })
          if (createRes && createRes.id) {
            state.id = createRes.id
          }
          successCount = successCount + 1
        }
      } catch (err) {
        console.error('Error saving policy item ' + meta.key + ':', err)
        errorCount = errorCount + 1
      }
    }

    if (errorCount === 0) {
      showToast('[' + selectedFactory.value + '] 공장의 10대 패스워드 정책이 성공적으로 저장되었습니다.', 'success')
      await loadPolicies()
    } else {
      showToast(successCount + '건 저장 완료, ' + errorCount + '건 저장 실패. 재시도 해주세요.', 'warning')
    }
  } catch (generalErr) {
    console.error('General error in handleSave:', generalErr)
    showToast('정책 저장 중 예기치 못한 오류가 발생했습니다.', 'error')
  } finally {
    isSaving.value = false
  }
}

// 컴포넌트 마운트 시 정책 목록 로드
onMounted(function () {
  initializeDefaultPolicyState()
  loadPolicies()
})
</script>

<style scoped>
.password-policy-view {
  max-width: 100%;
}

.header-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.title-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.factory-select-wrapper {
  min-width: 170px;
}

.policy-items-list {
  display: flex;
  flex-direction: column;
}

.policy-item-row {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  transition: all 0.2s ease-in-out;
  user-select: none;
}

.policy-item-row.item-active {
  background-color: rgba(var(--v-theme-primary), 0.03);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.policy-item-row.item-inactive {
  background-color: rgba(var(--v-theme-surface), 1);
  opacity: 0.85;
}

.policy-item-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.07);
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.index-badge {
  min-width: 28px;
  text-align: center;
}

.policy-key-code {
  background-color: rgba(var(--v-border-color), 0.12);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
}

.policy-checkbox {
  margin: 0;
  padding: 0;
}

.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.status-chip {
  min-width: 82px;
  justify-content: center;
}

.stats-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
