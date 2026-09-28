<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 페이지 헤더 및 브레드크럼 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{ $t('views.dashboard.wsMonitoringTitle') }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.dashboard.wsMonitoringBreadcrumb') }}
          </v-chip>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn color="primary" variant="flat" size="small" prepend-icon="$refresh" v-on:click="handleSearch">
            {{ $t('common.refresh') }}
          </v-btn>
          <v-btn color="secondary" variant="tonal" size="small" prepend-icon="$fileExport" v-on:click="handleExport">
            {{ $t('common.export') }}
          </v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 검색 조건 영역 -->
      <div class="search-filter-bar mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchKeyword"
              :label="$t('views.dashboard.searchKeyword')"
              :placeholder="$t('views.dashboard.searchKeywordPlaceholder')"
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
              :label="$t('views.dashboard.opStatus')"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" md="3" class="d-flex align-center">
            <v-btn color="primary" variant="flat" size="small" class="mr-2" v-on:click="handleSearch">
              {{ $t('common.search') }}
            </v-btn>
            <v-btn variant="outlined" size="small" v-on:click="handleReset">
              {{ $t('common.reset') }}
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- 데이터 테이블 영역 -->
      <BaseDataTable
        :headers="headers"
        :items="items"
        :total-items="items.length"
        :loading="isLoading"
        item-value="stationId"
        density="compact"
      >
        <template #[`item.status`]="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.status }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>{{ $t('views.dashboard.noWorkstationData') }}</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDataTable from '@/components/common/BaseDataTable.vue'

const { t } = useI18n()
const searchKeyword = ref('')
const statusFilter = ref('전체')
const isLoading = ref(false)

const statusOptions = computed(function () {
  return [
    { title: t('common.all'), value: '전체' },
    { title: 'RUNNING', value: 'RUNNING' },
    { title: 'IDLE', value: 'IDLE' },
    { title: 'ERROR', value: 'ERROR' },
    { title: 'MAINTENANCE', value: 'MAINTENANCE' },
  ]
})

const headers = computed(function () {
  return [
    { title: t('table.stationId'), key: 'stationId', align: 'start' },
    { title: t('table.stationName'), key: 'stationName', align: 'start' },
    { title: t('table.zone'), key: 'zone', align: 'start' },
    { title: t('table.currentJob'), key: 'currentJob', align: 'start' },
    { title: t('table.status'), key: 'status', align: 'center' },
    { title: t('table.updatedAt'), key: 'updatedAt', align: 'center' },
  ]
})

const items = ref([
  {
    stationId: 'WS-01',
    stationName: 'Inspection Station #1',
    zone: 'ZONE-A',
    currentJob: 'LOT-202609-001',
    status: 'RUNNING',
    updatedAt: '2026-09-17 14:30:12',
  },
  {
    stationId: 'WS-02',
    stationName: 'Buffer Station #2',
    zone: 'ZONE-B',
    currentJob: 'LOT-202609-004',
    status: 'RUNNING',
    updatedAt: '2026-09-17 14:28:45',
  },
  {
    stationId: 'WS-03',
    stationName: 'Cleaning Station #3',
    zone: 'ZONE-B',
    currentJob: '-',
    status: 'IDLE',
    updatedAt: '2026-09-17 14:15:00',
  },
  {
    stationId: 'WS-04',
    stationName: 'Shipping Station #4',
    zone: 'ZONE-C',
    currentJob: 'LOT-202609-012',
    status: 'RUNNING',
    updatedAt: '2026-09-17 14:32:01',
  },
])

function getStatusColor(status) {
  if (status === 'RUNNING') {
    return 'success'
  }
  if (status === 'IDLE') {
    return 'info'
  }
  if (status === 'ERROR') {
    return 'error'
  }
  return 'warning'
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
  alert(t('views.dashboard.exportWorkstationAlert'))
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
