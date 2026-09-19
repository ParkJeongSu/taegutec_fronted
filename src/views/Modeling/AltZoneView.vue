<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$transfer" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">대체존(Alternative Zone) 설정</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            모델링 &gt; 경로 설정 &gt; 대체존 설정
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
              label="기준 존 코드"
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
              label="활성화 상태"
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
        item-value="primaryZone"
        density="compact"
      >
        <template #[`item.activeYn`]="{ item }">
          <v-chip :color="item.activeYn === 'Y' ? 'success' : 'grey'" size="x-small" variant="flat">
            {{ item.activeYn === 'Y' ? '활성' : '비활성' }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 대체존 설정 데이터가 없습니다.</div>
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
  { title: '기준 존', key: 'primaryZone', align: 'start' },
  { title: '우선순위', key: 'priority', align: 'center' },
  { title: '대체 존', key: 'altZone', align: 'start' },
  { title: '전환 조건 (임계 적재율)', key: 'threshold', align: 'center' },
  { title: '활성화', key: 'activeYn', align: 'center' },
  { title: '수정일시', key: 'updatedAt', align: 'center' },
]

const items = ref([
  { primaryZone: 'ZONE-A (원자재 입고)', priority: 1, altZone: 'ZONE-B (버퍼존)', threshold: '90% 초과 시', activeYn: 'Y', updatedAt: '2026-09-15 09:30' },
  { primaryZone: 'ZONE-B (버퍼존)', priority: 1, altZone: 'ZONE-C (출하존)', threshold: '95% 초과 시', activeYn: 'Y', updatedAt: '2026-09-15 09:30' },
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
  alert('대체존 목록을 엑셀로 내보냅니다.')
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
