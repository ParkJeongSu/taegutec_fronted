<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$mapMarkerPath" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">라우트 노드(Node) 설정</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            모델링 &gt; 경로 설정 &gt; 라우트 노드
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
              label="노드 ID / 명칭"
              placeholder="NODE-01 등"
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
              label="노드 타입"
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
        item-value="nodeId"
        density="compact"
      >
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 노드 설정 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'STATION', 'BRANCH', 'MERGE', 'BUFFER']

const headers = [
  { title: '노드 ID', key: 'nodeId', align: 'start' },
  { title: '노드 명칭', key: 'nodeName', align: 'start' },
  { title: '노드 유형', key: 'nodeType', align: 'center' },
  { title: '좌표 (X, Y, Z)', key: 'coord', align: 'center' },
  { title: '최대 대기 수', key: 'maxWait', align: 'end' },
  { title: '연결 링크 수', key: 'linkCount', align: 'end' },
]

const items = ref([
  { nodeId: 'NODE-01', nodeName: '입고 투입 노드', nodeType: 'STATION', coord: '(120, 450, 0)', maxWait: 2, linkCount: 1 },
  { nodeId: 'NODE-05', nodeName: '가공 라인 분기점', nodeType: 'BRANCH', coord: '(300, 450, 0)', maxWait: 1, linkCount: 3 },
  { nodeId: 'NODE-12', nodeName: '세척 라인 합류점', nodeType: 'MERGE', coord: '(600, 450, 0)', maxWait: 1, linkCount: 2 },
  { nodeId: 'NODE-20', nodeName: '출하 버퍼 노드', nodeType: 'BUFFER', coord: '(900, 450, 0)', maxWait: 4, linkCount: 1 },
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
  alert('노드 목록을 엑셀로 내보냅니다.')
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
