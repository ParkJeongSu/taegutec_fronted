<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">스토커 설비 제어</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            반송 &gt; 설비 제어 &gt; 스토커
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
              label="스토커 ID"
              placeholder="STK-01 등"
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
              label="동작 모드"
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
        item-value="stockerId"
        density="compact"
      >
        <template #[`item.onlineStatus`]="{ item }">
          <v-chip :color="item.onlineStatus === 'ONLINE' ? 'success' : 'error'" size="x-small" variant="flat">
            {{ item.onlineStatus }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 스토커 설비 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'AUTO', 'MANUAL', 'OFFLINE']

const headers = [
  { title: '스토커 ID', key: 'stockerId', align: 'start' },
  { title: '설비명', key: 'name', align: 'start' },
  { title: '통신 상태', key: 'onlineStatus', align: 'center' },
  { title: '동작 모드', key: 'mode', align: 'center' },
  { title: '총 슬롯 수', key: 'totalSlots', align: 'end' },
  { title: '사용 슬롯 수', key: 'usedSlots', align: 'end' },
  { title: '에러 코드', key: 'errorCode', align: 'center' },
]

const items = ref([
  { stockerId: 'STK-01', name: 'INSERT 메인 스토커 1호기', onlineStatus: 'ONLINE', mode: 'AUTO', totalSlots: 400, usedSlots: 320, errorCode: '-' },
  { stockerId: 'STK-02', name: 'INSERT 보조 스토커 2호기', onlineStatus: 'ONLINE', mode: 'AUTO', totalSlots: 200, usedSlots: 110, errorCode: '-' },
  { stockerId: 'STK-03', name: 'POWDER 전용 스토커 3호기', onlineStatus: 'ONLINE', mode: 'MANUAL', totalSlots: 300, usedSlots: 240, errorCode: 'WARN-02' },
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
  alert('스토커 목록을 엑셀로 내보냅니다.')
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
