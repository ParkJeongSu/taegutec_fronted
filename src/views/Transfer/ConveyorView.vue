<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$robotIndustrial" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">컨베이어 설비 관리 (Conveyor)</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            반송 &gt; 설비 관리 &gt; 컨베이어
          </v-chip>
        </div>

        <div class="d-flex align-center conveyor-action-buttons">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold mr-2"
            v-on:click="onAddConveyor"
          >
            신규 등록
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium mr-2"
            :loading="isLoading"
            v-on:click="handleSearch"
          >
            새로고침
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$fileExport"
            class="font-weight-medium"
            v-on:click="handleExport"
          >
            엑셀 다운로드
          </v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 검색 필터 패널 -->
      <div class="search-filter-panel mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <!-- 공장 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.factoryName"
              :items="factoryFilterOptions"
              label="소속 공장"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 컨베이어 그룹 검색 필드 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.conveyorGroup"
              label="컨베이어 그룹"
              placeholder="예: CV_GRP_01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 컨베이어 명 검색 필드 -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchParams.conveyorName"
              label="컨베이어 명 / 코드"
              placeholder="예: CV01"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 운전 상태 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.conveyorStatus"
              :items="statusFilterOptions"
              label="운전 상태"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 사용 여부 필터 -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="searchParams.useState"
              :items="useStateFilterOptions"
              label="사용 여부"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 검색 및 초기화 버튼 -->
          <v-col cols="12" sm="6" md="2" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="mr-2 font-weight-medium"
              v-on:click="handleSearch"
            >
              검색
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              class="font-weight-medium"
              v-on:click="handleReset"
            >
              초기화
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- 중앙 데이터 테이블 -->
      <BaseDataTable
        :headers="headers"
        :items="displayItems"
        :total-items="totalItems"
        :loading="isLoading"
        item-value="compositeKey"
        density="compact"
        v-on:click:row="onRowClick"
        v-on:update:options="onUpdateOptions"
      >
        <!-- 운전 상태 컬럼 커스텀 렌더링 -->
        <template #[`item.conveyorStatus`]="{ item }">
          <v-chip
            :color="getStatusColor(item.conveyorStatus)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.conveyorStatus }}
          </v-chip>
        </template>

        <!-- 현재 캐리어 컬럼 커스텀 렌더링 -->
        <template #[`item.currentCarrier`]="{ item }">
          <span v-if="item.currentCarrier && item.currentCarrier !== '-'" class="font-weight-medium text-primary">
            {{ item.currentCarrier }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- 사용 여부 컬럼 커스텀 렌더링 -->
        <template #[`item.useState`]="{ item }">
          <v-chip
            :color="getUseStateColor(item.useState)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ getUseStateText(item.useState) }}
          </v-chip>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>등록된 컨베이어 설비 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, markRaw, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import ConveyorViewForm from './components/ConveyorViewForm.vue'
import { usePanelStore } from '@/stores/panelStore'
import { useApi } from '@/composables/useApi'
import { fetchWcsConveyorsApi } from '@/api/wcsConveyor'

const panelStore = usePanelStore()

// 검색 파라미터 상태
const searchParams = reactive({
  factoryName: '전체',
  conveyorGroup: '',
  conveyorName: '',
  conveyorStatus: '전체',
  useState: '전체',
})

// 페이징 상태
const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
})

const factoryFilterOptions = ['전체', 'INSERT', 'POWDER', 'COMMON']
const statusFilterOptions = ['전체', 'RUN', 'STOP', 'ALARM', 'IDLE', 'ERROR']
const useStateFilterOptions = ['전체', 'USE', 'UNUSE']

// 그리드 데이터 상태
const rawConveyorItems = ref([])
const totalItems = ref(0)

// 테이블 컬럼 정의
const headers = [
  { title: '소속 공장', key: 'factoryName', align: 'center', width: '100px' },
  { title: '그룹', key: 'conveyorGroup', align: 'start', width: '120px' },
  { title: '컨베이어 명', key: 'conveyorName', align: 'start', width: '130px' },
  { title: '번호', key: 'conveyorNumber', align: 'center', width: '80px' },
  { title: '로컬 번호', key: 'localNo', align: 'center', width: '90px' },
  { title: '시작 노드', key: 'fromNode', align: 'start', width: '120px' },
  { title: '도착 노드', key: 'toNode', align: 'start', width: '120px' },
  { title: '운전 상태', key: 'conveyorStatus', align: 'center', width: '100px' },
  { title: '현재 캐리어', key: 'currentCarrier', align: 'center', width: '130px' },
  { title: '사용 여부', key: 'useState', align: 'center', width: '90px' },
  { title: '수정자', key: 'eventUser', align: 'center', width: '100px' },
  { title: '수정일시', key: 'eventTime', align: 'center', width: '160px' },
]

// useApi를 통한 목록 조회 API 바인딩
const { loading: isLoading, execute: executeFetchConveyors } = useApi(fetchWcsConveyorsApi)

// 5개 복합키 결합 및 데이터 정규화
const displayItems = computed(function () {
  const list = rawConveyorItems.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const fn = raw.factoryName || 'INSERT'
      const cg = raw.conveyorGroup || ''
      const cn = raw.conveyorName || raw.lineName || raw.cvId || ''
      const cnum = raw.conveyorNumber != null ? raw.conveyorNumber : 1
      const lno = raw.localNo != null ? raw.localNo : 1

      result.push({
        ...raw,
        compositeKey: fn + '_' + cg + '_' + cn + '_' + cnum + '_' + lno,
        factoryName: fn,
        conveyorGroup: cg,
        conveyorName: cn,
        conveyorNumber: cnum,
        localNo: lno,
        fromNode: raw.fromNode || '-',
        toNode: raw.toNode || '-',
        conveyorStatus: raw.conveyorStatus || raw.status || 'RUN',
        currentCarrier: raw.currentCarrier || '-',
        useState: raw.useState || (raw.useYn === 'N' ? 'UNUSE' : 'USE'),
        eventUser: raw.eventUser || '-',
        eventTime: raw.eventTime || raw.updateTime || '-',
      })
    }
  }

  return result
})

function getStatusColor(status) {
  if (status === 'RUN' || status === 'ONLINE' || status === 'RUNNING') {
    return 'success'
  }
  if (status === 'IDLE' || status === 'AUTO') {
    return 'primary'
  }
  if (status === 'STOP' || status === 'MANUAL') {
    return 'grey'
  }
  if (status === 'ALARM' || status === 'ERROR' || status === 'DOWN') {
    return 'error'
  }
  return 'default'
}

function getUseStateColor(state) {
  if (state === 'USE' || state === 'ACTIVE' || state === 'Y' || state === '사용') {
    return 'success'
  }
  if (state === 'UNUSE' || state === 'INACTIVE' || state === 'N' || state === '미사용') {
    return 'grey'
  }
  return 'default'
}

function getUseStateText(state) {
  if (state === 'USE' || state === 'ACTIVE' || state === 'Y' || state === '사용') {
    return '사용'
  }
  if (state === 'UNUSE' || state === 'INACTIVE' || state === 'N' || state === '미사용') {
    return '미사용'
  }
  return state || '-'
}

// 컨베이어 목록 API 조회 함수
async function fetchConveyors() {
  try {
    const params = {
      page: pagination.page - 1,
      size: pagination.itemsPerPage,
      factoryName: searchParams.factoryName !== '전체' ? searchParams.factoryName : undefined,
      conveyorGroup: searchParams.conveyorGroup ? searchParams.conveyorGroup.trim() : undefined,
      conveyorName: searchParams.conveyorName ? searchParams.conveyorName.trim() : undefined,
      conveyorStatus: searchParams.conveyorStatus !== '전체' ? searchParams.conveyorStatus : undefined,
      useState: searchParams.useState !== '전체' ? searchParams.useState : undefined,
    }

    const response = await executeFetchConveyors(params)

    if (response) {
      if (response.data && Array.isArray(response.data.content)) {
        rawConveyorItems.value = response.data.content
        totalItems.value = response.data.totalElements || response.data.content.length
      } else if (response.content && Array.isArray(response.content)) {
        rawConveyorItems.value = response.content
        totalItems.value = response.totalElements || (response.page && response.page.totalElements) || response.content.length
      } else if (response.data && Array.isArray(response.data)) {
        rawConveyorItems.value = response.data
        totalItems.value = response.total || response.data.length
      } else if (Array.isArray(response)) {
        rawConveyorItems.value = response
        totalItems.value = response.length
      } else {
        rawConveyorItems.value = []
        totalItems.value = 0
      }
    }
  } catch (error) {
    console.error('Fetch conveyors error:', error)
    rawConveyorItems.value = []
    totalItems.value = 0
  }
}

function onUpdateOptions(options) {
  if (options) {
    pagination.page = options.page || 1
    pagination.itemsPerPage = options.itemsPerPage || 10
  }
  fetchConveyors()
}

function handleSearch() {
  pagination.page = 1
  fetchConveyors()
}

function handleReset() {
  searchParams.factoryName = '전체'
  searchParams.conveyorGroup = ''
  searchParams.conveyorName = ''
  searchParams.conveyorStatus = '전체'
  searchParams.useState = '전체'
  pagination.page = 1
  fetchConveyors()
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddConveyor() {
  panelStore.openPanel(markRaw(ConveyorViewForm), {
    mode: 'CREATE',
    data: null,
    title: '신규 컨베이어 등록',
    onSuccess: fetchConveyors,
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(ConveyorViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: '컨베이어 정보 수정',
    onSuccess: fetchConveyors,
  })
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 컨베이어 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '소속 공장,컨베이어 그룹,컨베이어 명,번호,로컬 번호,시작 노드,도착 노드,운전 상태,현재 캐리어,사용 여부,수정자,수정일시\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.factoryName || '',
      item.conveyorGroup || '',
      item.conveyorName || '',
      item.conveyorNumber != null ? item.conveyorNumber : '',
      item.localNo != null ? item.localNo : '',
      item.fromNode || '',
      item.toNode || '',
      item.conveyorStatus || '',
      item.currentCarrier || '',
      item.useState || '',
      item.eventUser || '',
      item.eventTime || '',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'Conveyor_List_' + new Date().toISOString().slice(0, 10) + '.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(function () {
  fetchConveyors()
})
</script>

<style scoped>
.view-page-container {
  max-width: 100%;
}
.search-filter-panel {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.conveyor-action-buttons {
  gap: 8px;
}
</style>
