<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$fileImport" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">INSERT SAP Idoc 인터페이스 이력</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            오더 &gt; 인터페이스 &gt; INSERT Idoc 이력
          </v-chip>
          <v-chip size="small" color="primary" variant="flat" class="ml-2 font-weight-bold">
            INSERT 공장
          </v-chip>
        </div>

        <div class="d-flex align-center action-button-group">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium mr-2"
            :loading="loading"
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
          <!-- 조회 시작일 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.startDate"
              label="조회 시작일"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>

          <!-- 조회 종료일 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.endDate"
              label="조회 종료일"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>

          <!-- 문서 번호 / Idoc Key -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.docNum"
              label="문서 번호(Doc Num)"
              placeholder="DOC-001 등"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- Line ID -->
          <v-col cols="12" sm="6" md="3" lg="1">
            <v-text-field
              v-model="searchParams.lineId"
              label="Line ID"
              placeholder="1"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- IDOC 타입 ID -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.idocTypId"
              label="IDOC 타입 ID"
              placeholder="예: 01, ORDERS05"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 구분 (Inbound / Outbound) -->
          <v-col cols="12" sm="6" md="3" lg="1">
            <v-select
              v-model="searchParams.transTy"
              :items="['전체', 'INBOUND', 'OUTBOUND']"
              label="구분"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 처리 상태 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-select
              v-model="searchParams.status"
              :items="statusFilterOptions"
              label="처리 상태"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <!-- 송신처 (Source) -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.source"
              label="송신처 (Source)"
              placeholder="SAP 등"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 수신처 (Dest) -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.destination"
              label="수신처 (Dest)"
              placeholder="WCS 등"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 에러 코드 -->
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.errorCode"
              label="에러 코드"
              placeholder="0, 99 등"
              variant="outlined"
              density="compact"
              hide-details
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <!-- 검색 및 초기화 버튼 -->
          <v-col cols="12" sm="6" md="6" lg="6" class="d-flex align-center">
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

      <!-- 중앙 데이터 테이블 (useDataTable 컴포저블 전담 연동) -->
      <BaseDataTable
        :headers="headers"
        :items="displayItems"
        :total-items="Number(totalItems)"
        :loading="loading"
        item-value="compositeKey"
        density="compact"
        v-on:update:options="onUpdateOptions"
        v-on:click:row="onRowClick"
      >
        <!-- 문서 번호 하이라이트 -->
        <template #[`item.docNum`]="{ item }">
          <span class="font-weight-bold text-primary cursor-pointer">{{ item.docNum }}</span>
        </template>

        <!-- IDOC 타입 ID 칩 -->
        <template #[`item.idocTypId`]="{ item }">
          <v-chip size="x-small" color="secondary" variant="tonal" class="font-weight-bold">
            {{ item.idocTypId || item.idocType || '-' }}
          </v-chip>
        </template>

        <!-- 구분(Trans Type) 칩 -->
        <template #[`item.transTy`]="{ item }">
          <v-chip
            v-if="item.transTy || item.direction"
            size="x-small"
            variant="flat"
            :color="(item.transTy === 'INBOUND' || item.direction === 'INBOUND') ? 'blue-grey' : 'teal'"
            class="font-weight-medium"
          >
            {{ item.transTy || item.direction }}
          </v-chip>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- 처리 상태 칩 -->
        <template #[`item.status`]="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="x-small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <!-- 에러 코드 칩 -->
        <template #[`item.errorCode`]="{ item }">
          <v-chip
            :color="isErrorCodeZero(item.errorCode) ? 'success' : 'error'"
            size="x-small"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ item.errorCode != null ? item.errorCode : '-' }}
          </v-chip>
        </template>

        <!-- 에러 내용 말줄임 및 툴팁 -->
        <template #[`item.errorDescription`]="{ item }">
          <span :title="item.errorDescription || item.errDsc || item.responseMsg" class="error-text-cell">
            {{ item.errorDescription || item.errDsc || item.responseMsg || '-' }}
          </span>
        </template>

        <!-- 생성 일시 포맷팅 -->
        <template #[`item.createTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.createTime || item.crtTime) }}</span>
        </template>

        <!-- 수정 일시 포맷팅 -->
        <template #[`item.modTime`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.modTime || item.updateTime) }}</span>
        </template>

        <!-- 데이터 없음 슬롯 -->
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>조회된 INSERT Idoc 인터페이스 데이터가 없습니다.</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>

    <!-- 공통 상세 조회 모달 -->
    <IdocDetailModal
      v-model="isDetailModalOpen"
      :item="selectedItem"
      factory="INSERT"
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import IdocDetailModal from './components/IdocDetailModal.vue'
import { useDataTable } from '@/composables/useDataTable'
import { fetchGalInterfacesApi } from '@/api/galInterface'
import { formatDateTime } from '@/utils/dateUtils'

const searchParams = reactive({
  startDate: '',
  endDate: '',
  docNum: '',
  lineId: '',
  idocTypId: '',
  transTy: '전체',
  status: '전체',
  source: '',
  destination: '',
  errorCode: '',
})

const statusFilterOptions = ['전체', '0', '1', '2', 'SUCCESS', 'PENDING', 'ERROR']

const headers = [
  { title: '문서 번호', key: 'docNum', align: 'start', width: '160px', sortable: true },
  { title: 'Line ID', key: 'lineId', align: 'center', width: '90px' },
  { title: 'IDOC 타입', key: 'idocTypId', align: 'center', width: '120px' },
  { title: '구분', key: 'transTy', align: 'center', width: '110px' },
  { title: '송신처', key: 'source', align: 'center', width: '100px' },
  { title: '수신처', key: 'destination', align: 'center', width: '100px' },
  { title: '상태', key: 'status', align: 'center', width: '110px' },
  { title: '에러 코드', key: 'errorCode', align: 'center', width: '100px' },
  { title: '에러 내용', key: 'errorDescription', align: 'start', width: '180px' },
  { title: '요청 존', key: 'reqZone', align: 'center', width: '100px' },
  { title: 'T-Code', key: 'tCode', align: 'center', width: '100px' },
  { title: 'Arc Key', key: 'arcKey', align: 'center', width: '100px' },
  { title: '생성 일시', key: 'createTime', align: 'center', width: '160px' },
  { title: '수정 일시', key: 'modTime', align: 'center', width: '160px' },
  { title: '수정자', key: 'usrMod', align: 'center', width: '100px' },
]

// 1. 역할 분리 아키텍처: useDataTable 컴포저블 전담 연동
const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchGalInterfacesApi)

const isDetailModalOpen = ref(false)
const selectedItem = ref(null)

function getSanitizedParams() {
  const params = {
    factoryName: 'INSERT',
  }

  if (searchParams.docNum && searchParams.docNum.trim() !== '') {
    params.docNum = searchParams.docNum.trim()
  }
  if (searchParams.lineId !== '' && searchParams.lineId !== null && searchParams.lineId !== undefined) {
    params.lineId = Number(searchParams.lineId)
  }
  if (searchParams.idocTypId && searchParams.idocTypId.trim() !== '') {
    params.idocTypId = searchParams.idocTypId.trim()
  }
  if (searchParams.transTy && searchParams.transTy !== '전체') {
    params.transTy = searchParams.transTy
  }
  if (searchParams.status && searchParams.status !== '전체') {
    params.status = searchParams.status
  }
  if (searchParams.source && searchParams.source.trim() !== '') {
    params.source = searchParams.source.trim()
  }
  if (searchParams.destination && searchParams.destination.trim() !== '') {
    params.destination = searchParams.destination.trim()
  }
  if (searchParams.errorCode !== '' && searchParams.errorCode !== null && searchParams.errorCode !== undefined) {
    params.errorCode = searchParams.errorCode.trim()
  }
  if (searchParams.startDate) {
    params.startDate = searchParams.startDate + 'T00:00:00'
  }
  if (searchParams.endDate) {
    params.endDate = searchParams.endDate + 'T23:59:59'
  }

  return params
}

const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      const docNum = raw.docNum || raw.idocNumber || ''
      const lineId = raw.lineId != null ? raw.lineId : 1

      result.push({
        ...raw,
        compositeKey: docNum + '_' + lineId,
        docNum: docNum,
        lineId: lineId,
        idocTypId: raw.idocTypId || raw.idocType || raw.msgType || '',
        transTy: raw.transTy || raw.direction || '',
        source: raw.source || '',
        destination: raw.destination || raw.dest || '',
        status: raw.status != null ? raw.status : '',
        errorCode: raw.errorCode != null ? raw.errorCode : '',
        errorDescription: raw.errorDescription || raw.errDsc || raw.responseMsg || '',
        reqZone: raw.reqZone || '',
        tCode: raw.tCode || '',
        arcKey: raw.arcKey || '',
        createTime: raw.createTime || raw.crtTime || raw.receivedAt || null,
        modTime: raw.modTime || raw.updateTime || null,
        usrMod: raw.usrMod || raw.modUser || '',
      })
    }
  }

  return result
})

function isErrorCodeZero(code) {
  if (code === null || code === undefined || code === '') return true
  const str = String(code).trim()
  return str === '0' || str === '00' || str === 'SUCCESS' || str === 'OK'
}

function getStatusColor(status) {
  if (status === null || status === undefined || status === '') return 'grey'
  const s = String(status).toUpperCase()
  if (s === 'SUCCESS' || s === 'PROCESSED' || s === '0' || s === 'DONE') {
    return 'success'
  }
  if (s === 'PENDING' || s === 'RECEIVED' || s === '1' || s === 'WAITING') {
    return 'warning'
  }
  if (s === 'ERROR' || s === 'FAIL' || s === 'FAILED' || s === '2') {
    return 'error'
  }
  return 'grey'
}

function getStatusText(status) {
  if (status === null || status === undefined || status === '') return '-'
  const s = String(status).toUpperCase()
  if (s === '0') return 'SUCCESS(0)'
  if (s === '1') return 'PENDING(1)'
  if (s === '2') return 'ERROR(2)'
  return status
}

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.startDate = ''
  searchParams.endDate = ''
  searchParams.docNum = ''
  searchParams.lineId = ''
  searchParams.idocTypId = ''
  searchParams.transTy = '전체'
  searchParams.status = '전체'
  searchParams.source = ''
  searchParams.destination = ''
  searchParams.errorCode = ''
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  if (itemData) {
    selectedItem.value = itemData
    isDetailModalOpen.value = true
  }
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert('내보낼 Idoc 인터페이스 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    '문서번호,LineID,IDOC타입,구분,송신처,수신처,상태,에러코드,에러내용,요청존,T-Code,ArcKey,생성일시,수정일시,수정자\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.docNum || '',
      item.lineId != null ? item.lineId : '',
      item.idocTypId || '',
      item.transTy || '',
      item.source || '',
      item.destination || '',
      getStatusText(item.status),
      item.errorCode != null ? item.errorCode : '',
      '"' + (item.errorDescription ? item.errorDescription.replace(/"/g, '""') : '') + '"',
      item.reqZone || '',
      item.tCode || '',
      item.arcKey || '',
      formatDateTime(item.createTime),
      formatDateTime(item.modTime),
      item.usrMod || '',
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'INSERT_IdocHistory_' + new Date().toISOString().slice(0, 10) + '.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(function () {
  loadData(getSanitizedParams())
})
</script>

<style scoped>
.view-page-container {
  max-width: 100%;
}

.search-filter-panel {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.action-button-group {
  gap: 8px;
}

.error-text-cell {
  display: block;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(var(--v-theme-error));
}

.cursor-pointer {
  cursor: pointer;
}
</style>
