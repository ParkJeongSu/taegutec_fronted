<template>
  <v-container fluid class="pa-4 user-group-mgmt-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$accountGroup" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">사용자 그룹 관리 (User Group)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 사용자 및 권한 &gt; 사용자 그룹
          </v-chip>
        </div>

        <div class="d-flex align-center user-group-action-buttons">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddUserGroup"
          >
            신규 등록
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium"
            :loading="loading"
            v-on:click="onSearch"
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
              :items="factoryFilterOptions"
              label="소속 공장"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 사용자 그룹명 검색 필드 -->
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchParams.userGroupName"
              label="사용자 그룹명"
              placeholder="그룹명 입력"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="onSearch"
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
              v-on:click="onSearch"
            >
              검색
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              class="font-weight-medium"
              v-on:click="onReset"
            >
              초기화
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- 중앙 데이터 테이블 (useDataTable 연동) -->
      <BaseDataTable
        :headers="headers"
        :items="items"
        :total-items="totalItems"
        :loading="loading"
        item-value="id"
        density="compact"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      >
        <!-- 계정 상태 컬럼 커스텀 렌더링 -->
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
            <div>등록된 사용자 그룹 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import UserGroupMgmtViewForm from './components/UserGroupMgmtViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchUserGroupsApi } from '@/api/userGroup'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  userGroupName: '',
  useState: '전체',
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const stateFilterOptions = ['전체', 'ACTIVE', 'INACTIVE']

// 테이블 컬럼 정의 (id는 대리키이므로 그리드에는 미노출)
const headers = [
  { title: '소속 공장', key: 'factoryName', align: 'center', width: '120px' },
  { title: '사용자 그룹명', key: 'userGroupName', align: 'start' },
  { title: '그룹 설명', key: 'description', align: 'start' },
  { title: '계정 상태', key: 'useState', align: 'center', width: '120px' },
  { title: '수정자', key: 'eventUser', align: 'center', width: '120px' },
  { title: '수정일시', key: 'eventTime', align: 'center', width: '180px' },
]

// useDataTable 컴포저블을 활용한 서버사이드 페이징 및 정렬 바인딩
const { items, totalItems, loading, loadData, updateOptions } = useDataTable(fetchUserGroupsApi)

// 상태별 칩 색상 및 텍스트 매핑 함수
function getUseStateColor(state) {
  if (state === 'ACTIVE' || state === 'Y' || state === '사용' || state === 'USE') {
    return 'success'
  }
  if (state === 'INACTIVE' || state === 'N' || state === '미사용' || state === 'UNUSE') {
    return 'grey'
  }
  return 'default'
}

function getUseStateText(state) {
  if (state === 'ACTIVE' || state === 'Y' || state === '사용' || state === 'USE') {
    return '사용'
  }
  if (state === 'INACTIVE' || state === 'N' || state === '미사용' || state === 'UNUSE') {
    return '미사용'
  }
  return state || '-'
}

/**
 * 검색 파라미터 빌드 함수
 */
function getQueryParams() {
  return {
    factoryName: searchParams.factoryName !== '전체' ? searchParams.factoryName : undefined,
    userGroupName: searchParams.userGroupName || undefined,
    keyword: searchParams.userGroupName || undefined,
    useState: searchParams.useState !== '전체' ? searchParams.useState : undefined,
  }
}

function onSearch() {
  loadData(getQueryParams())
}

function onUpdateOptions(options) {
  updateOptions(options, getQueryParams())
}

function onReset() {
  searchParams.factoryName = '전체'
  searchParams.userGroupName = ''
  searchParams.useState = '전체'
  onSearch()
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddUserGroup() {
  panelStore.openPanel(markRaw(UserGroupMgmtViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 사용자 그룹 등록',
    onSuccess: onSearch,
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 패널 오픈
function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
  panelStore.openPanel(markRaw(UserGroupMgmtViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '사용자 그룹 정보 수정',
    onSuccess: onSearch,
  })
}

onMounted(function () {
  onSearch()
})
</script>

<style scoped>
.user-group-mgmt-container {
  max-width: 100%;
}
.search-filter-panel {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.user-group-action-buttons {
  gap: 8px;
}
</style>
