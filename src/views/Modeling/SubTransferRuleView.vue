<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$cogSyncOutline" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">Sub Transfer Rule (하위 반송 규칙)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            모델링 &gt; 제어 규칙 &gt; Sub Transfer Rule
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
              label="규칙 ID / 명칭"
              placeholder="RULE-01 등"
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
              label="적용 상태"
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
        item-value="ruleId"
        density="compact"
      >
        <template #[`item.activeYn`]="{ item }">
          <v-chip :color="item.activeYn === 'Y' ? 'success' : 'grey'" size="x-small" variant="flat">
            {{ item.activeYn === 'Y' ? '적용' : '미적용' }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 Sub Transfer Rule 데이터가 없습니다.</div>
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
  { title: '규칙 ID', key: 'ruleId', align: 'start' },
  { title: '규칙 명칭', key: 'ruleName', align: 'start' },
  { title: '대상 출발 구역', key: 'sourceZone', align: 'start' },
  { title: '대상 도착 구역', key: 'destZone', align: 'start' },
  { title: '분기 알고리즘', key: 'algorithm', align: 'center' },
  { title: '적용 여부', key: 'activeYn', align: 'center' },
]

const items = ref([
  { ruleId: 'RULE-001', ruleName: 'INSERT 원자재 최단경로 우선 배차', sourceZone: 'ZONE-A', destZone: 'ZONE-B', algorithm: 'SHORTEST_PATH', activeYn: 'Y' },
  { ruleId: 'RULE-002', ruleName: 'POWDER 버퍼 정체시 우회 반송', sourceZone: 'ZONE-B', destZone: 'ZONE-C', algorithm: 'CONGESTION_BYPASS', activeYn: 'Y' },
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
  alert('Sub Transfer Rule 목록을 엑셀로 내보냅니다.')
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
