<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$accountMultiple" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">부서 관리 (Department)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 사용자 및 권한 &gt; 부서
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
              label="부서 코드 / 부서명"
              placeholder="부서명 입력"
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
              label="사용 여부"
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
        item-value="deptCode"
        density="compact"
      >
        <template #[`item.useYn`]="{ item }">
          <v-chip :color="item.useYn === 'Y' ? 'success' : 'grey'" size="x-small" variant="flat">
            {{ item.useYn === 'Y' ? '사용' : '미사용' }}
          </v-chip>
        </template>
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
import { ref } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'

const searchKeyword = ref('')
const statusFilter = ref('전체')
const isLoading = ref(false)

const statusOptions = ['전체', 'Y', 'N']

const headers = [
  { title: '부서 코드', key: 'deptCode', align: 'start' },
  { title: '부서명', key: 'deptName', align: 'start' },
  { title: '상위 부서', key: 'parentDept', align: 'start' },
  { title: '인원 수', key: 'memberCount', align: 'end' },
  { title: '사용 여부', key: 'useYn', align: 'center' },
  { title: '등록일시', key: 'createdAt', align: 'center' },
]

const items = ref([
  { deptCode: 'DEPT-01', deptName: 'IT운영팀', parentDept: '경영지원본부', memberCount: 8, useYn: 'Y', createdAt: '2026-01-01' },
  { deptCode: 'DEPT-02', deptName: 'INSERT 생산1팀', parentDept: '생산본부', memberCount: 32, useYn: 'Y', createdAt: '2026-01-01' },
  { deptCode: 'DEPT-03', deptName: 'POWDER 생산2팀', parentDept: '생산본부', memberCount: 28, useYn: 'Y', createdAt: '2026-01-01' },
  { deptCode: 'DEPT-04', deptName: '품질보증팀', parentDept: '품질본부', memberCount: 15, useYn: 'Y', createdAt: '2026-01-01' },
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
  alert('부서 목록을 엑셀로 내보냅니다.')
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
