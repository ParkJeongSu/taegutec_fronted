<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$alarmPanel" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">알람 정의 (Alarm Definition)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            모델링 &gt; 제어 규칙 &gt; 알람 정의
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
              label="알람 코드 / 알람명"
              placeholder="ERR-001 등"
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
              label="알람 심각도 (Severity)"
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
        item-value="alarmCode"
        density="compact"
      >
        <template #[`item.severity`]="{ item }">
          <v-chip :color="getSeverityColor(item.severity)" size="x-small" variant="flat" class="font-weight-bold">
            {{ item.severity }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 알람 정의 데이터가 없습니다.</div>
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

const statusOptions = ['전체', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']

const headers = [
  { title: '알람 코드', key: 'alarmCode', align: 'start' },
  { title: '알람 명칭', key: 'alarmName', align: 'start' },
  { title: '심각도', key: 'severity', align: 'center' },
  { title: '발생 대상 설비', key: 'targetEquipment', align: 'start' },
  { title: '자동 복구 여부', key: 'autoRecover', align: 'center' },
  { title: '조치 가이드', key: 'actionGuide', align: 'start' },
]

const items = ref([
  { alarmCode: 'ALM-STK-001', alarmName: '스토커 포크 타임아웃', severity: 'CRITICAL', targetEquipment: 'STOCKER', autoRecover: 'N', actionGuide: '설비 현장 확인 후 수동 리셋' },
  { alarmCode: 'ALM-CV-002', alarmName: '컨베이어 센서 감지 오류', severity: 'MAJOR', targetEquipment: 'CONVEYOR', autoRecover: 'Y', actionGuide: '센서 이물질 점검' },
  { alarmCode: 'ALM-BAT-003', alarmName: '캐리어 저배터리 경고', severity: 'MINOR', targetEquipment: 'CARRIER', autoRecover: 'Y', actionGuide: '충전소 자동 복귀 지시' },
])

function getSeverityColor(severity) {
  if (severity === 'CRITICAL') {
    return 'error'
  }
  if (severity === 'MAJOR') {
    return 'warning'
  }
  if (severity === 'MINOR') {
    return 'info'
  }
  return 'secondary'
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
  alert('알람 정의 목록을 엑셀로 내보냅니다.')
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
