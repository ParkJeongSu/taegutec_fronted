<template>
  <DataTableWidget title="프로세스 실시간 상태 모니터링">
    <!-- [슬롯 1] 검색 패널 -->
    <template v-slot:search>
      <SearchPanel v-on:search="onSearch">
        <!-- 시스템명 콤보박스 -->
        <v-col cols="12" md="4">
          <v-select
            v-model="searchParams.systemName"
            :items="systemNameOptions"
            label="시스템명"
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
            label="프로세스 그룹명"
            density="compact"
            clearable
            hide-details
          ></v-select>
        </v-col>

        <!-- 프로세스명 텍스트필드 -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchParams.processName"
            label="프로세스명"
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
          label="자동 갱신"
          color="primary"
          hide-details
          density="compact"
          class="mr-2"
        ></v-switch>
        <v-chip v-if="isAutoRefresh" size="small" variant="outlined" color="primary" label>
          {{ remainingTime }}초 후 갱신
        </v-chip>
      </div>
      <v-btn color="primary" prepend-icon="$refresh" v-on:click="manualSearch">새로고침</v-btn>
      <v-divider vertical class="mx-2"></v-divider>
      <v-btn color="success" prepend-icon="$fileExcel">엑셀 출력</v-btn>
    </template>

    <!-- [슬롯 3] 실제 테이블 (좌우 2분할 구조로 개편) -->
    <template v-slot:table>
      <v-row density="comfortable">
        <!-- [왼쪽 그리드] 가동 프로세스 영역 (RUNNING, STARTING) -->
        <v-col cols="12" lg="6">
          <v-card variant="outlined" class="pa-2">
            <div class="d-flex align-center justify-between mb-2 pa-2">
              <span class="text-subtitle-1 font-weight-bold text-success">
                ● 가동 및 기동중 프로세스 ({{ runningItems.length }}건)
              </span>
              <v-btn
                color="error"
                size="small"
                prepend-icon="$stop"
                :disabled="selectedRunningRows.length === 0"
                v-on:click="onBatchControl('stop')"
              >
                선택 일괄 정지
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
                ● 정지 및 오류 프로세스 ({{ stoppedItems.length }}건)
              </span>
              <v-btn
                color="success"
                size="small"
                prepend-icon="$play"
                :disabled="selectedStoppedRows.length === 0"
                v-on:click="onBatchControl('start')"
              >
                선택 일괄 시작
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
import { ref, reactive, onMounted, onBeforeUnmount, watch, markRaw } from 'vue'
import DataTableWidget from '@/components/widgets/DataTableWidget.vue'
import SearchPanel from '@/components/widgets/SearchPanel.vue'
import ProcessStatusForm from './components/ProcessStatusForm.vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import { useDataTable } from '@/composables/useDataTable'
import { fetchProcessApi, controlProcessApi } from '@/api/process'
import { formatDateTime } from '@/utils/dateUtils'
import { usePanelStore } from '@/stores/panelStore'

const panelStore = usePanelStore()
const isAutoRefresh = ref(true)
const remainingTime = ref(30)
const REFRESH_INTERVAL = 30
let timer = null

// 각각의 그리드에서 선택된 항목을 담을 반응형 배열 객체
const selectedRunningRows = ref([])
const selectedStoppedRows = ref([])

// 분리 대상 데이터 리스트 정의
const runningItems = ref([])
const stoppedItems = ref([])

// 콤보박스 바인딩용 목록
const systemNameOptions = ref([])
const processGroupNameOptions = ref([])

// 공통 검색 조건 (상태 select는 제거하고 시스템명, 프로세스명만 유지)
const searchParams = reactive({
  systemName: null,
  processGroupName: null,
  processName: '',
})

// 가로 너비 균형과 가독성을 위해 헤더 항목 최적화
const gridHeaders = [
  { title: 'PORT', key: 'port', align: 'start', sortable: true },
  { title: '시스템', key: 'systemName', minWidth: '100px' },
  { title: '그룹', key: 'processGroupName', minWidth: '100px' },
  { title: '프로세스명', key: 'processName' },
  { title: '상태', key: 'status', align: 'center' },
  { title: 'PID', key: 'pid' },
  { title: '시간', key: 'startTime' }, // 왼쪽은 startTime, 오른쪽은 endTime 바인딩 유연화
  { title: '제어', key: 'startAction', align: 'center', sortable: false }, // 시작 혹은 정지 단일 액션화
]

const { items, loading, loadData, updateOptions } = useDataTable(fetchProcessApi)

// 콤보박스 목록 갱신 함수 (중복 제거 및 빈 값 필터링)
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

  // 콤보박스 목록 설정
  systemNameOptions.value = Array.from(systemSet)
  processGroupNameOptions.value = Array.from(groupSet)
}

// [검색 조건 일치 여부 판별 함수]
function isMatchFilter(item, searchParams) {
  // 1. 시스템명: 선택값이 존재할 경우 정확히 일치해야 함
  if (searchParams.systemName) {
    if (item.systemName !== searchParams.systemName) {
      return false
    }
  }

  // 2. 프로세스 그룹명: 선택값이 존재할 경우 정확히 일치해야 함
  if (searchParams.processGroupName) {
    if (item.processGroupName !== searchParams.processGroupName) {
      return false
    }
  }

  // 3. 프로세스명: 입력값이 존재할 경우 대소문자 구분 없이 포함(contain)되어야 함
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

// [핵심] items와 searchParams를 반영하여 좌/우 그리드로 분류하는 함수
function filterAndCategorizeItems() {
  const sourceItems = items.value || []
  const newRunningItems = []
  const newStoppedItems = []

  for (let i = 0; i < sourceItems.length; i++) {
    const item = sourceItems[i]

    // 1. 검색 조건 필터 체크 (조건에 맞지 않으면 건너뜀)
    if (!isMatchFilter(item, searchParams)) {
      continue
    }

    // 2. 가동/비가동 상태에 따라 분류
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

// [핵심] 원본 데이터(items)가 백엔드로부터 가동되면 감시(watch)하여 가동/비가동 데이터셋으로 분류
watch(items, function (newItems) {
  // 콤보박스 옵션은 전체 원본 데이터 기준으로 1회 추출 유지
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

// 단일 시작 명령 전송
async function onStartProcess(item) {
  if (!confirm(item.processName + '을(를) 시작하시겠습니까?')) return
  try {
    await controlProcessApi(item.port, 'start', { port: item.port })
    alert('시작 명령을 전달했습니다.')
    onSearch()
  } catch (error) {
    alert('명령 전송 중 오류가 발생했습니다.')
  }
}

// 단일 정지 명령 전송
async function onStopProcess(item) {
  if (!confirm(item.processName + '을(를) 정지하시겠습니까?')) return
  try {
    await controlProcessApi(item.port, 'stop', { port: item.port })
    alert('정지 명령을 전달했습니다.')
    onSearch()
  } catch (error) {
    alert('명령 전송 중 오류가 발생했습니다.')
  }
}

// 밀리초(ms) 단위 대기 함수
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

/**
 * [신규 기능] 상단 다중 체크박스 선택 품목 일괄 가동/정지 제어
 * @param {string} commandType - 'start' 또는 'stop'
 */
async function onBatchControl(commandType) {
  const targetRows = commandType === 'start' ? selectedStoppedRows.value : selectedRunningRows.value
  if (targetRows.length === 0) return

  const confirmMsg =
    targetRows.length +
    '개의 프로세스를 일괄 ' +
    (commandType === 'start' ? '시작' : '정지') +
    '하시겠습니까?'
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
      // 마지막 요소가 아닐 때만 3초(3000ms) 대기
      if (i < targetRows.length - 1) {
        await sleep(3000)
      }
    }
  }

  alert('명령 전송 완료 (성공: ' + successCount + '건, 실패: ' + failCount + '건)')

  // 선택 배열 초기화 및 재조회
  if (commandType === 'start') selectedStoppedRows.value = []
  else selectedRunningRows.value = []

  onSearch()
}

function onSearch() {
  loadData(searchParams)

  // 이미 로드된 클라이언트 데이터 내에서 즉시 필터링도 함께 반영
  filterAndCategorizeItems()
}

function onRowClick(event, row) {
  panelStore.setSelectedItem(row.item, markRaw(ProcessStatusForm), 'Process Status', 'view')
  // [핵심] 성공 시 실행할 조회 함수를 스토어에 바인딩
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

<style scoped>
.justify-between {
  justify-content: space-between;
}
</style>
