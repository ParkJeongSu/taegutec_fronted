<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$history" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">반송 이력 조회</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            반송 &gt; 반송 이력 &gt; 반송이력
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
              label="반송 명령 ID / 캐리어 ID"
              placeholder="CMD-001 등"
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
              label="반송 결과"
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
        item-value="commandId"
        density="compact"
      >
        <template #[`item.result`]="{ item }">
          <v-chip :color="item.result === 'COMPLETED' ? 'success' : 'error'" size="x-small" variant="flat">
            {{ item.result }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 반송 이력 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'COMPLETED', 'ABORTED', 'FAILED']

const headers = [
  { title: '명령 ID', key: 'commandId', align: 'start' },
  { title: '캐리어 ID', key: 'carrierId', align: 'start' },
  { title: '출발 노드', key: 'fromNode', align: 'start' },
  { title: '도착 노드', key: 'toNode', align: 'start' },
  { title: '시작 시간', key: 'startTime', align: 'center' },
  { title: '완료 시간', key: 'endTime', align: 'center' },
  { title: '결과', key: 'result', align: 'center' },
]

const items = ref([
  { commandId: 'CMD-20260917-001', carrierId: 'RGV-01', fromNode: 'NODE-01', toNode: 'NODE-10', startTime: '2026-09-17 13:10:00', endTime: '2026-09-17 13:14:20', result: 'COMPLETED' },
  { commandId: 'CMD-20260917-002', carrierId: 'OHT-01', fromNode: 'NODE-10', toNode: 'NODE-30', startTime: '2026-09-17 13:20:00', endTime: '2026-09-17 13:25:40', result: 'COMPLETED' },
  { commandId: 'CMD-20260917-003', carrierId: 'RGV-02', fromNode: 'NODE-05', toNode: 'NODE-12', startTime: '2026-09-17 13:40:00', endTime: '2026-09-17 13:42:10', result: 'COMPLETED' },
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
  alert('반송 이력 목록을 엑셀로 내보냅니다.')
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
