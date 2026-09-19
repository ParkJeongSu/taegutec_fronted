<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$formatListBulleted" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">메뉴 관리 (Menu)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            설정 &gt; 사용자 및 권한 &gt; 메뉴
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
              label="메뉴 코드 / 명칭"
              placeholder="메뉴명 입력"
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
              label="메뉴 레벨"
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
        item-value="menuId"
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
            <div>등록된 메뉴 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'L1 (대메뉴)', 'L2 (중메뉴)', 'L3 (소메뉴)']

const headers = [
  { title: '메뉴 ID', key: 'menuId', align: 'start' },
  { title: '메뉴 명칭', key: 'menuName', align: 'start' },
  { title: '메뉴 레벨', key: 'level', align: 'center' },
  { title: '상위 메뉴 ID', key: 'parentId', align: 'start' },
  { title: '연결 컴포넌트', key: 'componentName', align: 'start' },
  { title: '사용 여부', key: 'useYn', align: 'center' },
]

const items = ref([
  { menuId: 'DASHBOARD', menuName: '대시보드', level: 'L1', parentId: '-', componentName: '-', useYn: 'Y' },
  { menuId: 'TRANSFER', menuName: '반송', level: 'L1', parentId: '-', componentName: '-', useYn: 'Y' },
  { menuId: 'ORDER', menuName: '오더', level: 'L1', parentId: '-', componentName: '-', useYn: 'Y' },
  { menuId: 'MODELING', menuName: '모델링', level: 'L1', parentId: '-', componentName: '-', useYn: 'Y' },
  { menuId: 'SETTINGS', menuName: '설정', level: 'L1', parentId: '-', componentName: '-', useYn: 'Y' },
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
  alert('메뉴 목록을 엑셀로 내보냅니다.')
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
