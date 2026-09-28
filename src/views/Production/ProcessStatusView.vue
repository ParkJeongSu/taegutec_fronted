<template>
  <DataTableWidget :title="$t('views.production.processStatus.title')">
    <!-- [슬롯 1] 검색 패널 -->
    <template v-slot:search>
      <SearchPanel v-on:search="onSearch">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="searchParams.systemName"
            :label="$t('table.systemName')"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="searchParams.processName"
            :label="$t('table.processName')"
            density="compact"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="searchParams.status"
            :items="['전체', 'RUNNING', 'STOPPED', 'STARTING', 'ERROR']"
            :label="$t('common.status')"
            density="compact"
          ></v-select>
        </v-col>
      </SearchPanel>
    </template>

    <!-- [슬롯 2] 버튼 액션 (상단 공통 버튼) -->
    <template v-slot:actions>
      <!-- 자동 새로고침 설정 영역 -->
      <div class="d-flex align-center mr-4">
        <v-switch
          v-model="isAutoRefresh"
          :label="$t('common.autoRefresh')"
          color="primary"
          hide-details
          density="compact"
          class="mr-2"
        ></v-switch>
        <v-chip v-if="isAutoRefresh" size="small" variant="outlined" color="primary" label>
          {{ $t('common.refreshRemaining', { sec: remainingTime }) }}
        </v-chip>
      </div>
      <v-btn color="primary" prepend-icon="$refresh" v-on:click="manualSearch">{{ $t('common.refresh') }}</v-btn>
      <v-divider vertical class="mx-2"></v-divider>
      <v-btn color="success" prepend-icon="$fileExcel">{{ $t('common.exportOutput') }}</v-btn>
    </template>

    <!-- [슬롯 3] 실제 테이블 -->
    <template v-slot:table>
      <BaseDataTable
        :headers="statusHeaders"
        :items="items"
        :total-items="totalItems"
        :loading="loading"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      >
        <!-- 상태 컬럼 커스텀 (Badge 적용) -->
        <template v-slot:[`item.status`]="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>
        <!-- 시간 컬럼 4종 세트 포맷팅 적용 -->
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

        <!-- 시작 버튼 컬럼 -->
        <template v-slot:[`item.startAction`]="{ item }">
          <v-btn
            v-if="isControllable(item.processName)"
            icon="$play"
            variant="text"
            color="success"
            size="small"
            :disabled="!isStatus(item.status, 'DOWN')"
            v-on:click="onStartProcess(item)"
          ></v-btn>
        </template>

        <!-- 정지 버튼 컬럼 -->
        <template v-slot:[`item.stopAction`]="{ item }">
          <v-btn
            v-if="isControllable(item.processName)"
            icon="$stop"
            variant="text"
            color="error"
            size="small"
            :disabled="!isStatus(item.status, 'RUNNING')"
            v-on:click="onStopProcess(item)"
          ></v-btn>
        </template>
      </BaseDataTable>
    </template>
  </DataTableWidget>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTableWidget from '@/components/widgets/DataTableWidget.vue'
import SearchPanel from '@/components/widgets/SearchPanel.vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import ProcessStatusForm from './components/ProcessStatusForm.vue'
import { useDataTable } from '@/composables/useDataTable'
import { fetchProcessApi, controlProcessApi } from '@/api/process'
import { formatDateTime } from '@/utils/dateUtils'
import { usePanelStore } from '@/stores/panelStore'

const { t } = useI18n()
const panelStore = usePanelStore()

// --- 자동 새로고침 관련 상태 ---
const isAutoRefresh = ref(true)
const remainingTime = ref(30)
const REFRESH_INTERVAL = 30
let timer = null

// 1. 검색 파라미터 및 테이블 헤더 설정
const searchParams = reactive({
  systemName: '',
  processName: '',
  status: '전체',
})

const statusHeaders = computed(() => [
  { title: t('table.port'), key: 'port', align: 'start', sortable: true },
  { title: t('table.system'), key: 'systemName' },
  { title: t('table.group'), key: 'processGroupName' },
  { title: t('table.processName'), key: 'processName' },
  { title: t('common.status'), key: 'status', align: 'center' },
  { title: t('table.pid'), key: 'pid' },
  { title: t('table.startRequestTime'), key: 'startRequestTime' },
  { title: t('table.startTime'), key: 'startTime' },
  { title: t('table.endRequestTime'), key: 'endRequestTime' },
  { title: t('table.endTime'), key: 'endTime' },
  { title: t('common.start'), key: 'startAction', align: 'center', sortable: false },
  { title: t('common.stop'), key: 'stopAction', align: 'center', sortable: false },
])

// 3. Composable 연결
const { items, totalItems, loading, loadData, updateOptions } = useDataTable(fetchProcessApi)

function startTimer() {
  stopTimer()
  timer = setInterval(function () {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      onSearch()
      remainingTime.value = REFRESH_INTERVAL
    }
  }, 1000)
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

function manualSearch() {
  onSearch()
  if (isAutoRefresh.value) {
    remainingTime.value = REFRESH_INTERVAL
  }
}

function isControllable(processName) {
  const protectedProcesses = ['GAL', 'MANTI']
  let canControl = true

  for (let i = 0; i < protectedProcesses.length; i++) {
    if (processName === protectedProcesses[i]) {
      canControl = false
      break
    }
  }
  return canControl
}

function isStatus(currentStatus, targetStatus) {
  if (!currentStatus) {
    return false
  }
  return currentStatus.toUpperCase() === targetStatus
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

async function onStartProcess(item) {
  if (!confirm(t('views.production.processStatus.confirmStart', { name: item.processName }))) return

  try {
    await controlProcessApi(item.port, 'start', { port: item.port })
    alert(t('views.production.processStatus.cmdSent'))
    onSearch()
  } catch (error) {
    alert(t('views.production.processStatus.cmdError'))
  }
}

async function onStopProcess(item) {
  if (!confirm(t('views.production.processStatus.confirmStop', { name: item.processName }))) return

  try {
    await controlProcessApi(item.port, 'stop', { port: item.port })
    alert(t('views.production.processStatus.cmdStopSent'))
    onSearch()
  } catch (error) {
    alert(t('views.production.processStatus.cmdError'))
  }
}

function onSearch() {
  loadData(searchParams)
}

function onRowClick(event, row) {
  panelStore.setSelectedItem(row.item, markRaw(ProcessStatusForm), 'Process Status', 'view')
  panelStore.onSuccess = onSearch
  panelStore.togglePanel()
}

function onUpdateOptions(options) {
  updateOptions(options, searchParams)
}

watch(isAutoRefresh, function (newVal) {
  if (newVal) {
    remainingTime.value = REFRESH_INTERVAL
    startTimer()
  } else {
    stopTimer()
  }
})

onMounted(function () {
  if (isAutoRefresh.value) {
    startTimer()
  }
})

onBeforeUnmount(function () {
  stopTimer()
})
</script>
