<template>
  <v-container fluid class="pa-4 user-mgmt-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$accountGroup" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{ $t('views.settings.userMgmt.title') }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.settings.userMgmt.breadcrumb') }}
          </v-chip>
        </div>

        <div class="d-flex align-center user-action-buttons">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddUser"
          >{{ $t('common.create') }}</v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium"
            :loading="isLoading"
            v-on:click="handleSearch"
          >{{ $t('common.refresh') }}</v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 검색 필터 패널 -->
      <div class="search-filter-panel mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <!-- 사번 / 성명 검색 필드 -->
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchParams.keyword"
              :label="$t('views.settings.userMgmt.searchUser')"
              :placeholder="$t('views.settings.userMgmt.placeholderUser')"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 소속 공장 필터 -->
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="searchParams.factoryName"
              :items="factoryOptions"
              :label="$t('table.factoryName')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 상태 필터 -->
          <v-col cols="12" sm="4" md="2">
            <v-select
              v-model="searchParams.userState"
              :items="stateFilterOptions"
              label="상태"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 검색 및 초기화 버튼 -->
          <v-col cols="12" sm="12" md="4" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="mr-2 font-weight-medium"
              v-on:click="handleSearch"
            >{{ $t('common.search') }}</v-btn>
            <v-btn
              variant="outlined"
              size="small"
              class="font-weight-medium"
              v-on:click="handleReset"
            >{{ $t('common.reset') }}</v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- 중앙 데이터 테이블 -->
      <BaseDataTable
        :headers="headers"
        :items="userItems"
        :total-items="totalItems"
        :loading="isLoading"
        item-value="id"
        density="compact"
        v-on:click:row="onRowClick"
      >
        <!-- 상태 컬럼 커스텀 렌더링 -->
        <template #[`item.userState`]="{ item }">
          <v-chip
            :color="getUserStateColor(item.userState || item.status)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ getUserStateText(item.userState || item.status) }}
          </v-chip>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>{{ $t('views.settings.userMgmt.noData') }}</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, markRaw, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import UserMgmtViewForm from './components/UserMgmtViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { fetchUsersApi } from '@/api/user'

const { t } = useI18n()
const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  keyword: '',
  factoryName: '전체',
  userState: '전체',
})

const factoryOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const stateFilterOptions = ['전체', 'ACTIVE', 'INACTIVE']

// 그리드 데이터 상태
const userItems = ref([])
const totalItems = ref(0)

// 테이블 컬럼 정의 (id는 헤더에 미노출, departmentName 추가)
const headers = computed(() => [
  { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '100px' },
  { title: t('table.employeeId'), key: 'userId', align: 'center', width: '110px' },
  { title: t('table.userName'), key: 'userName', align: 'start', width: '120px' },
  { title: t('table.departmentName'), key: 'departmentName', align: 'start', width: '140px' },
  { title: t('table.email'), key: 'email', align: 'start' },
  { title: t('table.phone'), key: 'phone', align: 'center', width: '130px' },
  { title: t('table.useState'), key: 'userState', align: 'center', width: '100px' },
  { title: t('table.eventUser'), key: 'eventUser', align: 'center', width: '110px' },
  { title: t('table.eventTime'), key: 'eventTime', align: 'center', width: '160px' },
])

// useApi 컴포저블을 활용한 목록 조회 바인딩
const { loading: isLoading, execute: executeFetchUsers } = useApi(fetchUsersApi)

// 상태별 칩 색상 및 텍스트 매핑 함수
function getUserStateColor(state) {
  if (state === 'ACTIVE' || state === '정상') {
    return 'success'
  }
  if (state === 'INACTIVE' || state === '잠금' || state === '비활성') {
    return 'grey'
  }
  return 'default'
}

function getUserStateText(state) {
  if (state === 'ACTIVE' || state === '정상') {
    return '정상'
  }
  if (state === 'INACTIVE' || state === '잠금' || state === '비활성') {
    return '잠금'
  }
  return state || '-'
}

// 사용자 목록 API 조회 함수
async function fetchUsers() {
  try {
    const params = {
      keyword: searchParams.keyword || undefined,
      searchKeyword: searchParams.keyword || undefined,
      factoryName: searchParams.factoryName !== '전체' ? searchParams.factoryName : undefined,
      userState: searchParams.userState !== '전체' ? searchParams.userState : undefined,
      status: searchParams.userState !== '전체' ? searchParams.userState : undefined,
    }

    const response = await executeFetchUsers(params)

    if (response) {
      if (response.data && Array.isArray(response.data.content)) {
        userItems.value = response.data.content
        totalItems.value = response.data.totalElements || response.data.content.length
      } else if (response.content && Array.isArray(response.content)) {
        userItems.value = response.content
        totalItems.value = response.totalElements || (response.page && response.page.totalElements) || response.content.length
      } else if (response.data && Array.isArray(response.data)) {
        userItems.value = response.data
        totalItems.value = response.total || response.data.length
      } else if (Array.isArray(response)) {
        userItems.value = response
        totalItems.value = response.length
      } else {
        userItems.value = []
        totalItems.value = 0
      }
    }
  } catch (error) {
    console.error('Fetch users error:', error)
    userItems.value = []
    totalItems.value = 0
  }
}

function handleSearch() {
  fetchUsers()
}

function handleReset() {
  searchParams.keyword = ''
  searchParams.factoryName = '전체'
  searchParams.userState = '전체'
  fetchUsers()
}

// [신규 등록] 버튼 클릭 시 우측 패널 오픈
function onAddUser() {
  panelStore.openPanel(markRaw(UserMgmtViewForm), {
    mode: 'CREATE',
    data: null,
    title: t('views.settings.userMgmt.createTitle'),
    onSuccess: fetchUsers,
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 패널 오픈 (id 포함 데이터 전달)
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(UserMgmtViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: t('views.settings.userMgmt.editTitle'),
    onSuccess: fetchUsers,
  })
}

onMounted(function () {
  fetchUsers()
})
</script>

<style scoped>
.user-mgmt-container {
  max-width: 100%;
}
.search-filter-panel {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.user-action-buttons {
  gap: 8px;
}
</style>
