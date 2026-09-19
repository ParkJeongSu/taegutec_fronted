<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$accountLock" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">관리자 권한 관리 (Admin Authority)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 사용자 및 권한 &gt; 관리자 권한
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
              label="관리자 사번 / 성명"
              placeholder="사번 입력"
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
              label="권한 등급"
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
        item-value="adminId"
        density="compact"
      >
        <template #[`item.role`]="{ item }">
          <v-chip color="error" size="x-small" variant="flat" class="font-weight-bold">
            {{ item.role }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 관리자 권한 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'SUPER_ADMIN', 'SYSTEM_ADMIN', 'AUDIT_ADMIN']

const headers = [
  { title: '관리자 사번', key: 'adminId', align: 'start' },
  { title: '성명', key: 'adminName', align: 'start' },
  { title: '부서', key: 'deptName', align: 'start' },
  { title: '관리 권한 등급', key: 'role', align: 'center' },
  { title: '부여 일자', key: 'grantedAt', align: 'center' },
  { title: '만료 예정일', key: 'expireAt', align: 'center' },
]

const items = ref([
  { adminId: 'admin', adminName: '총괄 관리자', deptName: 'IT운영팀', role: 'SUPER_ADMIN', grantedAt: '2026-01-01', expireAt: '2099-12-31' },
  { adminId: '20260010', adminName: '이시스템', deptName: 'IT운영팀', role: 'SYSTEM_ADMIN', grantedAt: '2026-01-01', expireAt: '2026-12-31' },
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
  alert('관리자 권한 목록을 엑셀로 내보냅니다.')
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
