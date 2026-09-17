<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$fileImport" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">SAP Idoc 인터페이스 이력</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            오더 &gt; 인터페이스 &gt; Idoc 이력
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
              label="Idoc 번호 / 오더 번호"
              placeholder="DOC-001 등"
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
              label="처리 상태"
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
          <v-chip :color="item.status === 'SUCCESS' ? 'success' : 'error'" size="x-small" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 Idoc 인터페이스 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'SUCCESS', 'PENDING', 'ERROR']

const headers = [
  { title: 'Idoc 번호', key: 'idocNumber', align: 'start' },
  { title: '메시지 타입', key: 'msgType', align: 'start' },
  { title: '수신/송신', key: 'direction', align: 'center' },
  { title: '오더 번호', key: 'orderNo', align: 'start' },
  { title: '수신 일시', key: 'receivedAt', align: 'center' },
  { title: '처리 상태', key: 'status', align: 'center' },
  { title: '응답 메시지', key: 'responseMsg', align: 'start' },
]

const items = ref([
  { idocNumber: '000000010928371', msgType: 'ORDERS05', direction: 'INBOUND', orderNo: 'ORD-202609-01', receivedAt: '2026-09-17 10:11:23', status: 'SUCCESS', responseMsg: '정상 수신 및 MES 오더 생성 완료' },
  { idocNumber: '000000010928372', msgType: 'WMMBID02', direction: 'OUTBOUND', orderNo: 'ORD-202609-02', receivedAt: '2026-09-17 11:20:45', status: 'SUCCESS', responseMsg: 'SAP 입고 확정 전송 완료' },
  { idocNumber: '000000010928373', msgType: 'ORDERS05', direction: 'INBOUND', orderNo: 'ORD-202609-03', receivedAt: '2026-09-17 12:05:10', status: 'SUCCESS', responseMsg: '정상 수신 및 MES 오더 생성 완료' },
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
  alert('Idoc 이력 목록을 엑셀로 내보냅니다.')
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
