<template>
  <v-container fluid class="pa-4 dept-mgmt-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$accountMultiple" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">부서 관리 (Department)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 사용자 및 권한 &gt; 부서
          </v-chip>
        </div>

        <div class="d-flex align-center dept-action-buttons">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddDepartment"
          >
            신규 등록
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium"
            :loading="isLoading"
            v-on:click="handleSearch"
          >
            새로고침
          </v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 검색 필터 패널 -->
      <div class="search-filter-panel mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <!-- 공장 필터 -->
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="searchParams.factoryName"
              :items="factoryOptions"
              label="소속 공장"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 부서명 검색 필드 -->
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchParams.departmentName"
              label="부서명"
              placeholder="부서명 입력"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 상태 필터 -->
          <v-col cols="12" sm="4" md="2">
            <v-select
              v-model="searchParams.useState"
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
            >
              검색
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              class="font-weight-medium"
              v-on:click="handleReset"
            >
              초기화
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- 중앙 데이터 테이블 -->
      <BaseDataTable
        :headers="headers"
        :items="deptItems"
        :total-items="totalItems"
        :loading="isLoading"
        item-value="id"
        density="compact"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      >
        <!-- 사용 상태 컬럼 커스텀 렌더링 -->
        <template #[`item.useState`]="{ item }">
          <v-chip
            :color="getUseStateColor(item.useState || item.useYn)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ getUseStateText(item.useState || item.useYn) }}
          </v-chip>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 부서 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import DeptMgmtViewForm from './components/DeptMgmtViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { fetchDepartmentsApi } from '@/api/department'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  departmentName: '',
  useState: '전체',
})

// 페이징 상태
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
})

const factoryOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const stateFilterOptions = ['전체', 'ACTIVE', 'INACTIVE']

// 그리드 데이터 상태
const deptItems = ref([])
const totalItems = ref(0)

// 테이블 컬럼 정의 (id는 대리키이므로 그리드에는 미노출)
const headers = [
  { title: '소속 공장', key: 'factoryName', align: 'center', width: '120px' },
  { title: '부서명', key: 'departmentName', align: 'start' },
  { title: '사용 상태', key: 'useState', align: 'center', width: '120px' },
  { title: '수정자', key: 'eventUser', align: 'center', width: '120px' },
  { title: '수정일시', key: 'eventTime', align: 'center', width: '180px' },
]

// useApi 컴포저블을 활용한 목록 조회 바인딩
const { loading: isLoading, execute: executeFetchDepartments } = useApi(fetchDepartmentsApi)

// 상태별 칩 색상 및 텍스트 매핑 함수
function getUseStateColor(state) {
  if (state === 'ACTIVE' || state === 'Y' || state === '사용') {
    return 'success'
  }
  if (state === 'INACTIVE' || state === 'N' || state === '미사용') {
    return 'grey'
  }
  return 'default'
}

function getUseStateText(state) {
  if (state === 'ACTIVE' || state === 'Y' || state === '사용') {
    return '사용'
  }
  if (state === 'INACTIVE' || state === 'N' || state === '미사용') {
    return '미사용'
  }
  return state || '-'
}

// 부서 목록 API 조회 함수
async function fetchDepartments() {
  try {
    const params = {
      page: pagination.page - 1,
      size: pagination.itemsPerPage,
      factoryName: searchParams.factoryName !== '전체' ? searchParams.factoryName : undefined,
      departmentName: searchParams.departmentName || undefined,
      keyword: searchParams.departmentName || undefined,
      useState: searchParams.useState !== '전체' ? searchParams.useState : undefined,
    }

    const response = await executeFetchDepartments(params)

    if (response) {
      if (response.data && Array.isArray(response.data.content)) {
        deptItems.value = response.data.content
        totalItems.value = response.data.totalElements || response.data.content.length
      } else if (response.content && Array.isArray(response.content)) {
        deptItems.value = response.content
        totalItems.value = response.totalElements || (response.page && response.page.totalElements) || response.content.length
      } else if (response.data && Array.isArray(response.data)) {
        deptItems.value = response.data
        totalItems.value = response.total || response.data.length
      } else if (Array.isArray(response)) {
        deptItems.value = response
        totalItems.value = response.length
      } else {
        deptItems.value = []
        totalItems.value = 0
      }
    }
  } catch (error) {
    console.error('Fetch departments error:', error)
    deptItems.value = []
    totalItems.value = 0
  }
}

function onUpdateOptions(options) {
  if (options) {
    pagination.page = options.page || 1
    pagination.itemsPerPage = options.itemsPerPage || 10
  }
  fetchDepartments()
}

function handleSearch() {
  pagination.page = 1
  fetchDepartments()
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.departmentName = ''
  searchParams.useState = '전체'
  pagination.page = 1
  fetchDepartments()
}

// [신규 등록] 버튼 클릭 시 우측 패널 오픈
function onAddDepartment() {
  panelStore.openPanel(markRaw(DeptMgmtViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 부서 등록',
    onSuccess: fetchDepartments,
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 패널 오픈 (id 포함 데이터 전달)
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(DeptMgmtViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '부서 정보 수정',
    onSuccess: fetchDepartments,
  })
}

onMounted(function () {
  fetchDepartments()
})
</script>

<style scoped>
.dept-mgmt-container {
  max-width: 100%;
}
.search-filter-panel {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.dept-action-buttons {
  gap: 8px;
}
</style>
