<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 페이지 헤더 및 브레드크럼 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">워크스테이션 모니터링</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            대시보드 &gt; 운영 모니터링 &gt; 워크스테이션
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

      <!-- 검색 조건 영역 -->
      <div class="search-filter-bar mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchKeyword"
              label="스테이션 ID / 명칭"
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
              label="가동 상태"
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

      <!-- 데이터 테이블 영역 -->
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="isLoading"
        density="compact"
        class="border rounded"
        hover
      >
        <template #[`item.status`]="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.status }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 워크스테이션 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'RUNNING', 'IDLE', 'ERROR', 'MAINTENANCE']

const headers = [
  { title: '스테이션 ID', key: 'stationId', align: 'start' },
  { title: '스테이션 명', key: 'stationName', align: 'start' },
  { title: '작업 구역', key: 'zone', align: 'start' },
  { title: '현재 작업', key: 'currentJob', align: 'start' },
  { title: '가동 상태', key: 'status', align: 'center' },
  { title: '최종 업데이트', key: 'updatedAt', align: 'center' },
]

const items = ref([
  {
    stationId: 'WS-01',
    stationName: '입고 검사 스테이션 #1',
    zone: 'ZONE-A',
    currentJob: 'LOT-202609-001',
    status: 'RUNNING',
    updatedAt: '2026-09-17 14:30:12',
  },
  {
    stationId: 'WS-02',
    stationName: '가공 버퍼 스테이션 #2',
    zone: 'ZONE-B',
    currentJob: 'LOT-202609-004',
    status: 'RUNNING',
    updatedAt: '2026-09-17 14:28:45',
  },
  {
    stationId: 'WS-03',
    stationName: '세척 대기 스테이션 #3',
    zone: 'ZONE-B',
    currentJob: '-',
    status: 'IDLE',
    updatedAt: '2026-09-17 14:15:00',
  },
  {
    stationId: 'WS-04',
    stationName: '출하 포장 스테이션 #4',
    zone: 'ZONE-C',
    currentJob: 'LOT-202609-012',
    status: 'RUNNING',
    updatedAt: '2026-09-17 14:32:01',
  },
])

function getStatusColor(status) {
  if (status === 'RUNNING') {
    return 'success'
  }
  if (status === 'IDLE') {
    return 'info'
  }
  if (status === 'ERROR') {
    return 'error'
  }
  return 'warning'
}

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
  alert('워크스테이션 목록을 엑셀로 내보냅니다.')
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
