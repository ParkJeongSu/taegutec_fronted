<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$accountGroup" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">사용자 관리 (User)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 사용자 및 권한 &gt; 사용자
          </v-chip>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn color="primary" variant="flat" size="small" prepend-icon="$refresh" v-on:click="handleSearch">
            새로고침
          </v-btn>
          <v-btn color="secondary" variant="tonal" size="small" prepend-icon="$fileExport" v-on:click="handleExport">
            엑셀 다운로드
          </v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <div class="search-filter-bar mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchKeyword"
              label="사번 / 사용자명"
              placeholder="사번 또는 이름 입력"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="소속 공장"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" md="3" class="d-flex align-center">
            <v-btn color="primary" variant="flat" size="small" class="mr-2" v-on:click="handleSearch">
              검색
            </v-btn>
            <v-btn variant="outlined" size="small" v-on:click="handleReset">
              초기화
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <BaseDataTable
        :headers="headers"
        :items="items"
        :total-items="items.length"
        :loading="isLoading"
        item-value="userId"
        density="compact"
      >
        <template #[`item.status`]="{ item }">
          <v-chip :color="item.status === 'ACTIVE' ? 'success' : 'grey'" size="x-small" variant="flat">
            {{ item.status === 'ACTIVE' ? '정상' : '잠금' }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 사용자 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'

const searchKeyword = ref('')
const statusFilter = ref('전체')
const isLoading = ref(false)

const statusOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']

const headers = [
  { title: '사번', key: 'userId', align: 'start' },
  { title: '사용자명', key: 'userName', align: 'start' },
  { title: '부서명', key: 'deptName', align: 'start' },
  { title: '소속 공장', key: 'plant', align: 'center' },
  { title: '역할 권한', key: 'role', align: 'center' },
  { title: '상태', key: 'status', align: 'center' },
  { title: '최종 접속', key: 'lastLogin', align: 'center' },
]

const items = ref([
  { userId: 'admin', userName: '시스템 관리자', deptName: 'IT운영팀', plant: 'COMMON', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '2026-09-17 14:00' },
  { userId: '20260101', userName: '홍길동', deptName: 'INSERT 생산1팀', plant: 'INSERT', role: 'OPERATOR', status: 'ACTIVE', lastLogin: '2026-09-17 13:45' },
  { userId: '20260102', userName: '김철수', deptName: 'POWDER 생산2팀', plant: 'POWDER', role: 'OPERATOR', status: 'ACTIVE', lastLogin: '2026-09-17 12:30' },
])

function handleSearch() {
  isLoading.value = true
  setTimeout(function () {
    isLoading.value = false
  }, 300)
}

function handleReset() {
  searchKeyword.value = ''
  statusFilter.value = '전체'
  handleSearch()
}

function handleExport() {
  alert('사용자 목록을 엑셀로 내보냅니다.')
}
</script>

<style scoped>
.view-page-container {
  max-width: 100%;
}
.search-filter-bar {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.gap-2 {
  gap: 8px;
}
</style>
