<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">존(Zone) 관리</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            반송 &gt; 설비 제어 &gt; 존
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
              label="존 코드 / 존 명"
              placeholder="ZONE-A 등"
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

      <v-data-table
        :headers="headers"
        :items="items"
        :loading="isLoading"
        density="compact"
        class="border rounded"
        hover
      >
        <template #[`item.useYn`]="{ item }">
          <v-chip :color="item.useYn === 'Y' ? 'success' : 'grey'" size="x-small" variant="flat">
            {{ item.useYn === 'Y' ? '사용' : '미사용' }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 존 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'Y', 'N']

const headers = [
  { title: '존 코드', key: 'zoneCode', align: 'start' },
  { title: '존 명칭', key: 'zoneName', align: 'start' },
  { title: '수용 가능 대수', key: 'capacity', align: 'end' },
  { title: '현재 대수', key: 'currentCount', align: 'end' },
  { title: '사용 여부', key: 'useYn', align: 'center' },
  { title: '비고', key: 'remarks', align: 'start' },
]

const items = ref([
  { zoneCode: 'ZONE-A', zoneName: 'INSERT 원자재 입고존', capacity: 10, currentCount: 4, useYn: 'Y', remarks: '자동 크레인 연동' },
  { zoneCode: 'ZONE-B', zoneName: '가공 버퍼 대기존', capacity: 20, currentCount: 15, useYn: 'Y', remarks: '온습도 관리 구역' },
  { zoneCode: 'ZONE-C', zoneName: '출하 완제품 적재존', capacity: 15, currentCount: 6, useYn: 'Y', remarks: '출하 도크 직결' },
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
  alert('존 목록을 엑셀로 내보냅니다.')
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
