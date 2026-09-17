<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">컨베이어 설비 제어</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            반송 &gt; 설비 제어 &gt; 컨베이어
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
              label="컨베이어 ID / 라인"
              placeholder="CV-01 등"
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
              label="라인 상태"
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
        <template #[`item.status`]="{ item }">
          <v-chip :color="item.status === 'RUN' ? 'success' : 'grey'" size="x-small" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 컨베이어 설비 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'RUN', 'STOP', 'ALARM']

const headers = [
  { title: '컨베이어 ID', key: 'cvId', align: 'start' },
  { title: '라인 명', key: 'lineName', align: 'start' },
  { title: '시작 노드', key: 'fromNode', align: 'start' },
  { title: '도착 노드', key: 'toNode', align: 'start' },
  { title: '운전 상태', key: 'status', align: 'center' },
  { title: '현재 캐리어', key: 'currentCarrier', align: 'center' },
]

const items = ref([
  { cvId: 'CV-01', lineName: '입고 반송 라인 1', fromNode: 'NODE-01', toNode: 'NODE-05', status: 'RUN', currentCarrier: 'CARRIER-012' },
  { cvId: 'CV-02', lineName: '가공 배출 라인 2', fromNode: 'NODE-05', toNode: 'NODE-12', status: 'RUN', currentCarrier: 'CARRIER-015' },
  { cvId: 'CV-03', lineName: '출하 공급 라인 3', fromNode: 'NODE-12', toNode: 'NODE-20', status: 'STOP', currentCarrier: '-' },
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
  alert('컨베이어 목록을 엑셀로 내보냅니다.')
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
