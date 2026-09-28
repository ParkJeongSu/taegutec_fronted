<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$fileImport" size="24" color="secondary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{
            $t('views.order.powderIdoc.title')
          }}</span>
          <v-chip size="small" color="secondary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.order.powderIdoc.breadcrumb') }}
          </v-chip>
          <v-chip size="small" color="secondary" variant="flat" class="ml-2 font-weight-bold">
            {{ $t('common.powderPlantAffiliation') }}
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
            {{ $t('common.refresh') }}
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$fileExport"
            class="font-weight-medium"
            v-on:click="handleExport"
          >
            {{ $t('common.export') }}
          </v-btn>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <!-- 검색 필터 패널 -->
      <div class="search-filter-panel mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.idocId"
              label="IDoc ID"
              placeholder="502529317"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.corderId"
              :label="$t('table.cOrderId') || '오더 ID'"
              placeholder="502529313"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="$magnify"
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.carrierId"
              :label="$t('table.carrierId') || '컨테이너 명'"
              placeholder="CONT-01"
              variant="outlined"
              density="compact"
              hide-details
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.lot"
              :label="$t('table.lot') || 'LOT'"
              placeholder="LOT-1001"
              variant="outlined"
              density="compact"
              hide-details
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6" md="3" lg="2">
            <v-text-field
              v-model="searchParams.errorCode"
              :label="$t('views.order.idocModal.labels.errorCode')"
              placeholder="0"
              variant="outlined"
              density="compact"
              hide-details
              v-on:keyup.enter="handleSearch"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6" md="3" lg="2" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="mr-2 font-weight-medium"
              v-on:click="handleSearch"
            >
              {{ $t('common.search') }}
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              class="font-weight-medium"
              v-on:click="handleReset"
            >
              {{ $t('common.reset') }}
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- BaseDataTable -->
      <BaseDataTable
        :headers="headers"
        :items="displayItems"
        :total-items="Number(totalItems)"
        :loading="loading"
        item-value="idocId"
        density="compact"
        v-on:update:options="onUpdateOptions"
        v-on:dblclick:row="onRowDblClick"
      >
        <!-- IDoc ID 컬럼 강조 -->
        <template #[`item.idocId`]="{ item }">
          <span class="font-weight-bold text-secondary cursor-pointer">{{ item.idocId }}</span>
        </template>

        <!-- IDOC TypId 칩 (I/O/R) -->
        <template #[`item.idocTypId`]="{ item }">
          <v-chip
            size="x-small"
            :color="getIdocTypColor(item.idocTypId)"
            variant="flat"
            class="font-weight-bold"
          >
            {{ getIdocTypText(item.idocTypId) }}
          </v-chip>
        </template>

        <!-- 오더 타입 (corderTy) -->
        <template #[`item.corderTy`]="{ item }">
          <v-chip
            size="x-small"
            :color="item.corderTy === 'O' ? 'success' : 'primary'"
            variant="tonal"
            class="font-weight-bold"
          >
            {{
              item.corderTy === 'O' ? '출고(O)' : item.corderTy === 'I' ? '입고(I)' : item.corderTy
            }}
          </v-chip>
        </template>

        <!-- 컨테이너 명 강조 -->
        <template #[`item.carrierId`]="{ item }">
          <v-chip
            v-if="item.carrierId && item.carrierId !== '-'"
            size="x-small"
            color="indigo"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ item.carrierId }}
          </v-chip>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Source / Destination 시스템명 렌더링 -->
        <template #[`item.source`]="{ item }">
          <span>{{ getSystemName(item.source) }}</span>
        </template>
        <template #[`item.destination`]="{ item }">
          <span>{{ getSystemName(item.destination) }}</span>
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

        <!-- 생성 일시 -->
        <template #[`item.dtimeCre`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.dtimeCre) }}</span>
        </template>

        <!-- 수정 일시 -->
        <template #[`item.dtimeMod`]="{ item }">
          <span class="text-caption">{{ formatDateTime(item.dtimeMod) }}</span>
        </template>
      </BaseDataTable>
    </v-card>

    <!-- 공통 상세 조회 모달 -->
    <IdocDetailModal v-model="isDetailModalOpen" :item="selectedItem" factory="POWDER" />
  </v-container>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref, reactive, computed, onMounted } from 'vue'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import IdocDetailModal from './components/IdocDetailModal.vue'
import { useDataTable } from '@/composables/useDataTable'
import { fetchGalInterfacesApi } from '@/api/galInterface'
import { formatDateTime } from '@/utils/dateUtils'

const { t } = useI18n()

const searchParams = reactive({
  idocId: '',
  corderId: '',
  carrierId: '',
  lot: '',
  errorCode: '',
})

const headers = computed(function () {
  return [
    { title: 'IDoc ID', key: 'idocId', align: 'start', width: '120px', sortable: true },
    { title: t('table.idocTypId') || '구분', key: 'idocTypId', align: 'center', width: '90px' },
    { title: t('table.cOrderId') || '오더 ID', key: 'corderId', align: 'start', width: '120px' },
    { title: t('table.cOrderTy') || '오더 타입', key: 'corderTy', align: 'center', width: '95px' },
    {
      title: t('table.carrierId') || '컨테이너 명',
      key: 'carrierId',
      align: 'center',
      width: '110px',
    },
    { title: t('table.lot') || 'LOT', key: 'lot', align: 'start', width: '110px' },
    { title: t('table.processRrn') || '공정 번호', key: 'rrn', align: 'center', width: '100px' },
    { title: t('table.galKey') || 'GAL Key', key: 'galKey', align: 'center', width: '100px' },
    { title: t('table.mngKey') || 'MNG Key', key: 'mngKey', align: 'center', width: '100px' },
    { title: t('table.state') || '상태', key: 'state', align: 'center', width: '80px' },
    {
      title: t('views.order.idocModal.labels.errorCode') || '에러코드',
      key: 'errorCode',
      align: 'center',
      width: '90px',
    },
    { title: t('table.source') || '송신처', key: 'source', align: 'center', width: '95px' },
    { title: t('table.target') || '수신처', key: 'destination', align: 'center', width: '95px' },
    { title: t('table.dtimeCre') || '생성 시간', key: 'dtimeCre', align: 'center', width: '150px' },
    { title: t('table.dtimeMod') || '수정 시간', key: 'dtimeMod', align: 'center', width: '150px' },
  ]
})

const { items, totalItems, loading, options, loadData, updateOptions } =
  useDataTable(fetchGalInterfacesApi)

const isDetailModalOpen = ref(false)
const selectedItem = ref(null)

function getSanitizedParams() {
  const params = {
    factoryName: 'POWDER',
  }
  if (searchParams.idocId && searchParams.idocId.trim() !== '') {
    params.idocId = searchParams.idocId.trim()
  }
  if (searchParams.corderId && searchParams.corderId.trim() !== '') {
    params.corderId = searchParams.corderId.trim()
  }
  if (searchParams.carrierId && searchParams.carrierId.trim() !== '') {
    params.carrierId = searchParams.carrierId.trim()
  }
  if (searchParams.lot && searchParams.lot.trim() !== '') {
    params.lot = searchParams.lot.trim()
  }
  if (
    searchParams.errorCode !== '' &&
    searchParams.errorCode !== null &&
    searchParams.errorCode !== undefined
  ) {
    params.errorCode = searchParams.errorCode.trim()
  }
  return params
}

const displayItems = computed(function () {
  const list = items.value || []
  const result = []

  for (let i = 0; i < list.length; i++) {
    const raw = list[i]
    if (raw) {
      result.push({
        ...raw,
        idocId: raw.idocId != null ? String(raw.idocId) : '-',
        idocTypId: raw.idocTypId || '-',
        state: raw.state || '-',
        errorCode: raw.errorCode != null ? String(raw.errorCode) : '-',
        source: raw.source || '-',
        destination: raw.destination || '-',
        dtimeCre: raw.dtimeCre || null,
        dtimeMod: raw.dtimeMod || null,
        corderId: raw.corderId || raw.cOrderId || '-',
        corderTy: raw.corderTy || raw.cOrderTy || '-',
        rrn: raw.rrn || '-',
        lot: raw.lot || '-',
        galKey: raw.galKey || '-',
        carrierId: raw.carrierId || '-',
        mngKey: raw.mngKey || '-',
      })
    }
  }

  return result
})

function getIdocTypColor(type) {
  if (type === 'I') return 'primary'
  if (type === 'O') return 'success'
  if (type === 'R') return 'warning'
  return 'secondary'
}

function getIdocTypText(type) {
  if (type === 'I') return '입고(I)'
  if (type === 'O') return '출고(O)'
  if (type === 'R') return '재배치(R)'
  return type || '-'
}

function getSystemName(code) {
  if (code === '20') return 'ERP(20)'
  if (code === '1') return 'WMS(1)'
  return code || '-'
}

function isErrorCodeZero(code) {
  if (code === null || code === undefined || code === '' || code === '-') return true
  const str = String(code).trim()
  return str === '0' || str === '00' || str === 'SUCCESS' || str === 'OK'
}

function handleSearch() {
  options.page = 0
  loadData(getSanitizedParams())
}

function handleReset() {
  searchParams.idocId = ''
  searchParams.corderId = ''
  searchParams.carrierId = ''
  searchParams.lot = ''
  searchParams.errorCode = ''
  options.page = 0
  loadData(getSanitizedParams())
}

function onUpdateOptions(newOptions) {
  updateOptions(newOptions, getSanitizedParams())
}

function onRowDblClick(event, row) {
  const itemData = row && row.item ? row.item : row
  if (itemData) {
    selectedItem.value = itemData
    isDetailModalOpen.value = true
  }
}

function handleExport() {
  const list = displayItems.value
  if (!list || list.length === 0) {
    alert(t('common.noDataToExport') || '내보낼 데이터가 없습니다.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
  csvContent =
    csvContent +
    'IDoc ID,IDOC 구분,오더 ID,오더 타입,컨테이너 명,LOT,공정 번호,GAL Key,MNG Key,상태,에러코드,송신처,수신처,생성 시간,수정 시간\n'

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const row = [
      item.idocId || '',
      item.idocTypId || '',
      item.corderId || '',
      item.corderTy || '',
      item.carrierId || '',
      item.lot || '',
      item.rrn || '',
      item.galKey || '',
      item.mngKey || '',
      item.state || '',
      item.errorCode || '',
      getSystemName(item.source),
      getSystemName(item.destination),
      formatDateTime(item.dtimeCre),
      formatDateTime(item.dtimeMod),
    ]
    csvContent = csvContent + row.join(',') + '\n'
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute(
    'download',
    'POWDER_IdocHistory_' + new Date().toISOString().slice(0, 10) + '.csv',
  )
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
.cursor-pointer {
  cursor: pointer;
}
</style>
