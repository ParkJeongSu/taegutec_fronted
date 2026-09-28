<template>
  <DataTableWidget :title="$t('views.history.processStatusHistory.title')">
    <!-- [슬롯 1] 검색 패널 (날짜 컴포넌트 추가) -->
    <template v-slot:search>
      <SearchPanel v-on:search="onSearch">
        <!-- 시작일 선택 -->
        <v-col cols="12" md="2">
          <v-text-field
            v-model="uiParams.fromDate"
            :label="$t('common.startDate')"
            type="date"
            density="compact"
          ></v-text-field>
        </v-col>
        <!-- 종료일 선택 -->
        <v-col cols="12" md="2">
          <v-text-field
            v-model="uiParams.toDate"
            :label="$t('common.endDate')"
            type="date"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="uiParams.processName"
            :label="$t('table.processName')"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="uiParams.port"
            :label="$t('table.port')"
            type="number"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="uiParams.status"
            :items="['전체', 'RUNNING', 'DOWN', 'STARTING', 'STOPPING']"
            :label="$t('common.status')"
            density="compact"
          ></v-select>
        </v-col>
      </SearchPanel>
    </template>

    <!-- [슬롯 2] 상단 액션 버튼 -->
    <template v-slot:actions>
      <v-btn color="primary" prepend-icon="$refresh" v-on:click="onSearch">{{ $t('common.refresh') }}</v-btn>
      <v-divider vertical class="mx-2"></v-divider>
      <v-btn color="success" prepend-icon="$fileExcel">{{ $t('common.exportOutput') }}</v-btn>
    </template>

    <!-- [슬롯 3] 이력 데이터 테이블 -->
    <template v-slot:table>
      <BaseDataTable
        :headers="historyHeaders"
        :items="items"
        :total-items="totalItems"
        :loading="loading"
        v-on:update:options="onUpdateOptions"
      >
        <template v-slot:[`item.status`]="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:[`item.eventTime`]="{ item }">
          {{ formatDateTime(item.eventTime) }}
        </template>
        <template v-slot:[`item.startRequestTime`]="{ item }">
          {{ formatDateTime(item.startRequestTime) }}
        </template>
        <template v-slot:[`item.startTime`]="{ item }">
          {{ formatDateTime(item.startTime) }}
        </template>
        <template v-slot:[`item.endRequestTime`]="{ item }">
          {{ formatDateTime(item.endRequestTime) }}
        </template>
        <template v-slot:[`item.endTime`]="{ item }">
          {{ formatDateTime(item.endTime) }}
        </template>
      </BaseDataTable>
    </template>
  </DataTableWidget>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTableWidget from '@/components/widgets/DataTableWidget.vue'
import SearchPanel from '@/components/widgets/SearchPanel.vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { useDataTable } from '@/composables/useDataTable'
import { fetchProcessHistoryApi } from '@/api/processStatusHistory'
import { formatDateTime } from '@/utils/dateUtils'

const { t } = useI18n()

const uiParams = reactive({
  fromDate: '',
  toDate: '',
  processName: '',
  port: null,
  status: '전체',
})

const historyHeaders = computed(() => [
  { title: t('table.eventTime'), key: 'eventTime', sortable: true, width: '160px' },
  { title: t('table.port'), key: 'port', width: '90px' },
  { title: t('table.processName'), key: 'processName' },
  { title: t('common.status'), key: 'status', align: 'center', width: '110px' },
  { title: t('table.pid'), key: 'pid', width: '90px' },
  { title: t('table.startRequestTime'), key: 'startRequestTime', width: '160px' },
  { title: t('table.startTime'), key: 'startTime', width: '160px' },
  { title: t('table.endRequestTime'), key: 'endRequestTime', width: '160px' },
  { title: t('table.endTime'), key: 'endTime', width: '160px' },
])

const { items, totalItems, loading, loadData, updateOptions } = useDataTable(fetchProcessHistoryApi)

function getFormattedParams() {
  const params = {
    processName: uiParams.processName,
    port: uiParams.port,
    status: uiParams.status,
    fromEventTime: null,
    toEventTime: null,
  }

  if (uiParams.fromDate) {
    params.fromEventTime = uiParams.fromDate + 'T00:00:00'
  }
  if (uiParams.toDate) {
    params.toEventTime = uiParams.toDate + 'T23:59:59'
  }

  return params
}

function onSearch() {
  const finalParams = getFormattedParams()
  loadData(finalParams)
}

function onUpdateOptions(options) {
  const finalParams = getFormattedParams()
  updateOptions(options, finalParams)
}

function getStatusColor(status) {
  if (!status) return 'grey'
  const s = status.toUpperCase()
  if (s === 'RUNNING') return 'success'
  if (s === 'DOWN') return 'error'
  if (s === 'STARTING') return 'info'
  if (s === 'STOPPING') return 'warning'
  return 'grey'
}
</script>
