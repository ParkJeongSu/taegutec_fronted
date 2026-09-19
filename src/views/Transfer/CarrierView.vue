<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">캐리어 관리 (RGV / OHT)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            반송 &gt; 설비 제어 &gt; 캐리어
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
              label="캐리어 ID"
              placeholder="CARRIER-01 등"
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
              label="캐리어 상태"
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
        item-value="carrierId"
        density="compact"
      >
        <template #[`item.battery`]="{ item }">
          <span class="font-weight-bold" :class="item.battery < 20 ? 'text-error' : 'text-success'">
            {{ item.battery }}%
          </span>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 캐리어 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'MOVING', 'LOADING', 'UNLOADING', 'CHARGING', 'IDLE']

const headers = [
  { title: '캐리어 ID', key: 'carrierId', align: 'start' },
  { title: '타입', key: 'type', align: 'start' },
  { title: '현재 위치 노드', key: 'currentNode', align: 'start' },
  { title: '목적지 노드', key: 'destNode', align: 'start' },
  { title: '배터리 잔량', key: 'battery', align: 'center' },
  { title: '동작 상태', key: 'status', align: 'center' },
]

const items = ref([
  { carrierId: 'RGV-01', type: 'RGV', currentNode: 'NODE-04', destNode: 'NODE-10', battery: 88, status: 'MOVING' },
  { carrierId: 'RGV-02', type: 'RGV', currentNode: 'NODE-12', destNode: 'NODE-12', battery: 95, status: 'LOADING' },
  { carrierId: 'OHT-01', type: 'OHT', currentNode: 'NODE-20', destNode: 'NODE-35', battery: 72, status: 'MOVING' },
  { carrierId: 'OHT-02', type: 'OHT', currentNode: 'CHARGE-01', destNode: '-', battery: 15, status: 'CHARGING' },
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
  alert('캐리어 목록을 엑셀로 내보냅니다.')
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
