<template>
  <DataTableWidget :title="$t('views.production.processStatus.title')">
    <!-- [슬롯 1] 검색 패널 -->
    <template v-slot:search>
      <SearchPanel v-on:search="onSearch">
        <!-- 시스템명 콤보박스 -->
        <v-col cols="12" md="4">
          <v-select
            v-model="searchParams.systemName"
            :items="systemNameOptions"
            :label="$t('table.systemName')"
            density="compact"
            clearable
            hide-details
          ></v-select>
        </v-col>

        <!-- 프로세스 그룹명 콤보박스 -->
        <v-col cols="12" md="4">
          <v-select
            v-model="searchParams.processGroupName"
            :items="processGroupNameOptions"
            :label="$t('table.processGroupName')"
            density="compact"
            clearable
            hide-details
          ></v-select>
        </v-col>

        <!-- 프로세스명 텍스트필드 -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchParams.processName"
            :label="$t('table.processName')"
            density="compact"
            clearable
            hide-details
            v-on:keyup.enter="onSearch"
          ></v-text-field>
        </v-col>
      </SearchPanel>
    </template>

    <!-- [슬롯 2] 버튼 액션 (상단 공통 버튼 및 자동 갱신) -->
    <template v-slot:actions>
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

    <!-- [슬롯 3] 실제 테이블 (좌우 2분할 구조로 개편) -->
    <template v-slot:table>
      <v-row density="comfortable">
        <!-- [왼쪽 그리드] 가동 프로세스 영역 (RUNNING, STARTING) -->
        <v-col cols="12" lg="6">
          <v-card variant="outlined" class="pa-2">
            <div class="d-flex align-center justify-between mb-2 pa-2">
              <span class="text-subtitle-1 font-weight-bold text-success">
                {{ $t('views.production.processStatus.runningGroupTitle', { count: runningItems.length }) }}
              </span>
              <v-btn
                color="error"
                size="small"
                prepend-icon="$stop"
                :disabled="selectedRunningRows.length === 0"
                v-on:click="onBatchControl('stop')"
              >
                {{ $t('views.production.processStatus.batchStop') }}
              </v-btn>
            </div>
            <BaseDataTable
              v-model="selectedRunningRows"
              :headers="gridHeaders"
              :items="runningItems"
              :total-items="runningItems.length"
              :loading="loading"
              :hide-footer="true"
              item-value="port"
              v-on:click:row="onRowClick"
              v-on:update:options="onUpdateOptions"
            >
              <template v-slot:[`item.status`]="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:[`item.startTime`]="{ item }">
                {{ formatDateTime(item.startTime) }}
              </template>
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
          </v-card>
        </v-col>

        <!-- [오른쪽 그리드] 비가동 프로세스 영역 (DOWN, STOPPING, ERROR) -->
        <v-col cols="12" lg="6">
          <v-card variant="outlined" class="pa-2">
            <div class="d-flex align-center justify-between mb-2 pa-2">
              <span class="text-subtitle-1 font-weight-bold text-error">
                {{ $t('views.production.processStatus.stoppedGroupTitle', { count: stoppedItems.length }) }}
              </span>
              <v-btn
                color="success"
                size="small"
                prepend-icon="$play"
                :disabled="selectedStoppedRows.length === 0"
                v-on:click="onBatchControl('start')"
              >
                {{ $t('views.production.processStatus.batchStart') }}
              </v-btn>
            </div>
            <BaseDataTable
              v-model="selectedStoppedRows"
              :headers="gridHeaders"
              :items="stoppedItems"
              :total-items="stoppedItems.length"
              :loading="loading"
              :hide-footer="true"
              item-value="port"
              v-on:click:row="onRowClick"
              v-on:update:options="onUpdateOptions"
            >
              <template v-slot:[`item.status`]="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
                  {{ item.status }}
                </v-chip>
              </template>
              <template v-slot:[`item.endTime`]="{ item }">
                {{ formatDateTime(item.endTime) }}
              </template>
              <template v-slot:[`item.startAction`]="{ item }">
                <v-btn
                  v-if="isControllable(item.processName)"
                  icon="$play"
                  variant="text"
                  color="success"
                  size="small"
                  :disabled="
                    !isStatus(item.status, 'DOWN') &&
                    !isStatus(item.status, 'STOPPED') &&
                    !isStatus(item.status, 'ERROR')
                  "
                  v-on:click="onStartProcess(item)"
                ></v-btn>
              </template>
            </BaseDataTable>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </DataTableWidget>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTableWidget from '@/components/widgets/DataTableWidget.vue'
import SearchPanel from '@/components/widgets/SearchPanel.vue'
import ProcessStatusForm from './components/ProcessStatusForm.vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { useDataTable } from '@/composables/useDataTable'
import { fetchProcessApi, controlProcessApi } from '@/api/process'
import { formatDateTime } from '@/utils/dateUtils'
import { usePanelStore } from '@/stores/panelStore'

const { t } = useI18n()
const panelStore = usePanelStore()
const isAutoRefresh = ref(true)
const remainingTime = ref(30)
const REFRESH_INTERVAL = 30
let timer = null

const selectedRunningRows = ref([])
const selectedStoppedRows = ref([])

const runningItems = ref([])
const stoppedItems = ref([])

const systemNameOptions = ref([])
const processGroupNameOptions = ref([])

const searchParams = reactive({
  systemName: null,
  processGroupName: null,
  processName: '',
})

const gridHeaders = computed(() => [
  { title: t('table.port'), key: 'port', align: 'start', sortable: true },
  { title: t('table.system'), key: 'systemName', minWidth: '100px' },
  { title: t('table.group'), key: 'processGroupName', minWidth: '100px' },
  { title: t('table.processName'), key: 'processName' },
  { title: t('common.status'), key: 'status', align: 'center' },
  { title: t('table.pid'), key: 'pid' },
  { title: t('table.time'), key: 'startTime' },
  { title: t('table.control'), key: 'startAction', align: 'center', sortable: false },
])

const { items, loading, loadData, updateOptions } = useDataTable(fetchProcessApi)

function extractComboOptions(itemList) {
  const systemSet = new Set()
  const groupSet = new Set()

  for (let i = 0; i < itemList.length; i++) {
    const row = itemList[i]
    if (row.systemName) {
      systemSet.add(row.systemName)
    }
    if (row.processGroupName) {
      groupSet.add(row.processGroupName)
    }
  }

  systemNameOptions.value = Array.from(systemSet)
  processGroupNameOptions.value = Array.from(groupSet)
}

function isMatchFilter(item, searchParams) {
  if (searchParams.systemName) {
    if (item.systemName !== searchParams.systemName) {
      return false
    }
  }

  if (searchParams.processGroupName) {
    if (item.processGroupName !== searchParams.processGroupName) {
      return false
    }
  }

  if (searchParams.processName && searchParams.processName.trim() !== '') {
    if (!item.processName) {
      return false
    }
    const keyword = searchParams.processName.trim().toLowerCase()
    const targetName = item.processName.toLowerCase()

    if (targetName.indexOf(keyword) === -1) {
      return false
    }
  }

  return true
}

function filterAndCategorizeItems() {
  const sourceItems = items.value || []
  const newRunningItems = []
  const newStoppedItems = []

  for (let i = 0; i < sourceItems.length; i++) {
    const item = sourceItems[i]

    if (!isMatchFilter(item, searchParams)) {
      continue
    }

    const status = item.status ? item.status.toUpperCase() : ''

    if (status === 'RUNNING' || status === 'STARTING') {
      item.startTime = item.startTime || item.startRequestTime
      newRunningItems.push(item)
    } else {
      item.startTime = item.endTime || item.endRequestTime
      stoppedItems.value.push(item)
      newStoppedItems.push(item)
    }
  }

  runningItems.value = newRunningItems
  stoppedItems.value = newStoppedItems
}

watch(items, function (newItems) {
  if (systemNameOptions.value.length === 0 && processGroupNameOptions.value.length === 0) {
    extractComboOptions(newItems)
  }

  filterAndCategorizeItems()
})

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
  if (!currentStatus) return false
  return currentStatus.toUpperCase() === targetStatus
}

function getStatusColor(status) {
  if (!status) return 'grey'
  const s = status.toUpperCase()
  if (s === 'RUNNING') return 'success'
  if (s === 'DOWN' || s === 'STOPPED') return 'error'
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

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

async function onBatchControl(commandType) {
  const targetRows = commandType === 'start' ? selectedStoppedRows.value : selectedRunningRows.value
  if (targetRows.length === 0) return

  const confirmMsg = t('views.production.processStatus.confirmBatchAction', {
    count: targetRows.length,
    action: commandType === 'start' ? t('common.start') : t('common.stop'),
  })
  if (!confirm(confirmMsg)) return

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < targetRows.length; i++) {
    const item = targetRows[i]
    if (isControllable(item.processName)) {
      try {
        await controlProcessApi(item.port, commandType, { port: item.port })
        successCount++
      } catch (error) {
        failCount++
      }
      if (i < targetRows.length - 1) {
        await sleep(3000)
      }
    }
  }

  alert(t('views.production.processStatus.batchResult', { success: successCount, fail: failCount }))

  if (commandType === 'start') selectedStoppedRows.value = []
  else selectedRunningRows.value = []

  onSearch()
}

function onSearch() {
  loadData(searchParams)
  filterAndCategorizeItems()
}

function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  if (itemData) {
    panelStore.openPanel(markRaw(ProcessStatusForm), {
      mode: 'UPDATE',
      data: itemData,
      title: t('views.production.processStatus.title') + ' ' + t('common.detail'),
      onSuccess: onSearch,
    })
  }
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

<style scoped>
.justify-between {
  justify-content: space-between;
}
</style>
