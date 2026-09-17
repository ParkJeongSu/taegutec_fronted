<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$accountKey" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">메뉴 권한 관리 (Menu Authority)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 사용자 및 권한 &gt; 메뉴 권한
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
              label="권한 그룹명 / 메뉴명"
              placeholder="검색어 입력"
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
              label="역할 그룹"
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

      <v-data-table
        :headers="headers"
        :items="items"
        :loading="isLoading"
        density="compact"
        class="border rounded"
        hover
      >
        <template #[`item.canRead`]="{ item }">
          <v-icon :icon="item.canRead ? '$check' : '$close'" :color="item.canRead ? 'success' : 'grey'" />
        </template>
        <template #[`item.canWrite`]="{ item }">
          <v-icon :icon="item.canWrite ? '$check' : '$close'" :color="item.canWrite ? 'success' : 'grey'" />
        </template>
        <template #[`item.canDelete`]="{ item }">
          <v-icon :icon="item.canDelete ? '$check' : '$close'" :color="item.canDelete ? 'success' : 'grey'" />
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 메뉴 권한 데이터가 없습니다.</div>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const searchKeyword = ref('')
const statusFilter = ref('전체')
const isLoading = ref(false)

const statusOptions = ['전체', 'ADMIN', 'OPERATOR', 'VIEWER']

const headers = [
  { title: '권한 그룹', key: 'roleGroup', align: 'start' },
  { title: '메뉴명', key: 'menuName', align: 'start' },
  { title: '조회 권한', key: 'canRead', align: 'center' },
  { title: '수정/저장 권한', key: 'canWrite', align: 'center' },
  { title: '삭제 권한', key: 'canDelete', align: 'center' },
  { title: '최종 수정자', key: 'updatedBy', align: 'center' },
]

const items = ref([
  { roleGroup: 'OPERATOR (작업자)', menuName: '워크스테이션 모니터링', canRead: true, canWrite: true, canDelete: false, updatedBy: 'admin' },
  { roleGroup: 'OPERATOR (작업자)', menuName: '스토커 설비 제어', canRead: true, canWrite: true, canDelete: false, updatedBy: 'admin' },
  { roleGroup: 'OPERATOR (작업자)', menuName: '사용자 관리', canRead: false, canWrite: false, canDelete: false, updatedBy: 'admin' },
  { roleGroup: 'ADMIN (관리자)', menuName: '전체 메뉴', canRead: true, canWrite: true, canDelete: true, updatedBy: 'admin' },
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
  alert('메뉴 권한 목록을 엑셀로 내보냅니다.')
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
