<template>
  <v-container fluid class="pa-4 user-group-mgmt-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$accountGroup" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{ $t('views.settings.userGroup.title') }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.settings.userGroup.breadcrumb') }}
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
          >{{ $t('common.create') }}</v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium"
            :loading="loading"
            v-on:click="onSearch"
          >{{ $t('common.refresh') }}</v-btn>
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
              :label="$t('table.factoryName')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 사용자 그룹명 검색 필드 -->
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchParams.userGroupName"
              :label="$t('views.settings.userGroup.groupName')"
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
              :label="$t('common.status')"
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
            >{{ $t('common.search') }}</v-btn>
            <v-btn
              variant="outlined"
              size="small"
              class="font-weight-medium"
              v-on:click="onReset"
            >{{ $t('common.reset') }}</v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- 중앙 데이터 테이블 (useDataTable 연동) -->
      <BaseDataTable
        :headers="headers"
        :items="items"
        :total-items="Number(totalItems)"
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
            <div>{{ $t('views.settings.userGroup.noData') }}</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { reactive, computed, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import UserGroupMgmtViewForm from './components/UserGroupMgmtViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useDataTable } from '@/composables/useDataTable'
import { fetchUserGroupsApi } from '@/api/userGroup'

const { t } = useI18n()
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
const headers = computed(function () {
  return [
    { title: t('table.factoryName'), key: 'factoryName', align: 'center', width: '120px' },
    { title: t('table.userGroupName'), key: 'userGroupName', align: 'start' },
    { title: t('table.description'), key: 'description', align: 'start' },
    { title: t('table.useState'), key: 'useState', align: 'center', width: '100px' },
    { title: t('table.eventUser'), key: 'eventUser', align: 'center', width: '120px' },
    { title: t('table.eventTime'), key: 'eventTime', align: 'center', width: '180px' },
  ]
})

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
    title: t('views.settings.userGroup.createTitle'),
    onSuccess: onSearch,
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 패널 오픈
function onRowClick(event, row) {
  const itemData = row && row.item ? row.item : row
  panelStore.openPanel(markRaw(UserGroupMgmtViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: t('views.settings.userGroup.editTitle'),
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
