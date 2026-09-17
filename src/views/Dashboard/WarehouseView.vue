<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$packageVariant" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">창고 모니터링</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            대시보드 &gt; 운영 모니터링 &gt; 창고 모니터링
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
              label="창고 랙 / 뱅크 / 베이"
              placeholder="위치 코드 입력"
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
              label="적재 상태"
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
        <template #[`item.occupancyRate`]="{ item }">
          <v-progress-linear
            :model-value="item.occupancyRate"
            :color="getRateColor(item.occupancyRate)"
            height="14"
            rounded
          >
            <template #default="{ value }">
              <span class="text-caption font-weight-bold text-white">{{ Math.ceil(value) }}%</span>
            </template>
          </v-progress-linear>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 창고 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'NORMAL', 'WARNING', 'FULL', 'EMPTY']

const headers = [
  { title: '창고 구역', key: 'areaCode', align: 'start' },
  { title: '구역명', key: 'areaName', align: 'start' },
  { title: '총 셀 수', key: 'totalCells', align: 'end' },
  { title: '적재 셀 수', key: 'occupiedCells', align: 'end' },
  { title: '적재율', key: 'occupancyRate', align: 'center', width: '160px' },
  { title: '상태', key: 'status', align: 'center' },
]

const items = ref([
  { areaCode: 'WH-A-01', areaName: 'INSERT 원자재 자동창고 A1', totalCells: 500, occupiedCells: 412, occupancyRate: 82, status: 'NORMAL' },
  { areaCode: 'WH-A-02', areaName: 'INSERT 원자재 자동창고 A2', totalCells: 500, occupiedCells: 480, occupancyRate: 96, status: 'FULL' },
  { areaCode: 'WH-B-01', areaName: 'POWDER 반제품 버퍼 B1', totalCells: 320, occupiedCells: 140, occupancyRate: 43, status: 'NORMAL' },
  { areaCode: 'WH-C-01', areaName: '완제품 자동 출하창고 C1', totalCells: 600, occupiedCells: 290, occupancyRate: 48, status: 'NORMAL' },
])

function getRateColor(rate) {
  if (rate >= 90) {
    return 'error'
  }
  if (rate >= 70) {
    return 'warning'
  }
  return 'primary'
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
  alert('창고 모니터링 목록을 엑셀로 내보냅니다.')
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
