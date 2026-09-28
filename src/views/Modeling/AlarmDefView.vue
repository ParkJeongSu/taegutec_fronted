<template>
  <v-container fluid class="pa-4 view-page-container">
    <v-card class="elevation-1 rounded-lg pa-4">
      <!-- 상단 헤더 및 액션 툴바 -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-4">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-icon icon="$alarmPanel" size="24" color="primary" class="mr-2" />
          <span class="text-h6 font-weight-bold text-high-emphasis">{{ $t('views.modeling.alarmDef.title') }}</span>
          <v-chip size="small" color="primary" variant="tonal" class="ml-3 font-weight-medium">
            {{ $t('views.modeling.alarmDef.breadcrumb') }}
          </v-chip>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            prepend-icon="$plus"
            class="font-weight-bold"
            v-on:click="onAddAlarmDef"
          >
            {{ $t('common.create') }}
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            size="small"
            prepend-icon="$refresh"
            class="font-weight-medium"
            :loading="isLoading"
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

      <!-- 검색 필터 바 -->
      <div class="search-filter-bar mb-4 pa-3 rounded bg-grey-lighten-4">
        <v-row density="compact" class="align-center">
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchKeyword"
              :label="$t('views.modeling.alarmDef.alarmCode')"
              :placeholder="$t('views.modeling.alarmDef.placeholderAlarmCode')"
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
              :label="$t('views.modeling.alarmDef.alarmLevel')"
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

      <!-- 중앙 데이터 테이블 -->
      <BaseDataTable
        :headers="headers"
        :items="filteredItems"
        :total-items="filteredItems.length"
        :loading="isLoading"
        item-value="alarmCode"
        density="compact"
        v-on:click:row="onRowClick"
      >
        <template #[`item.severity`]="{ item }">
          <v-chip :color="getSeverityColor(item.severity)" size="x-small" variant="flat" class="font-weight-bold">
            {{ item.severity }}
          </v-chip>
        </template>
        <template #no-data>
          <div class="text-center py-6 text-medium-emphasis">
            <v-icon icon="$table" size="36" color="disabled" class="mb-2" />
            <div>{{ $t('views.modeling.alarmDef.noData') }}</div>
          </div>
        </template>
      </BaseDataTable>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePanelStore } from '@/stores/panelStore'
import BaseDataTable from '@/components/common/BaseDataTable.vue'
import AlarmDefViewForm from './components/AlarmDefViewForm.vue'

const { t } = useI18n()
const panelStore = usePanelStore()

const searchKeyword = ref('')
const statusFilter = ref('전체')
const isLoading = ref(false)

const statusOptions = ['전체', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']

const headers = [
  { title: t('table.alarmCode'), key: 'alarmCode', align: 'start', width: '140px' },
  { title: '알람 명칭', key: 'alarmName', align: 'start', width: '200px' },
  { title: '심각도', key: 'severity', align: 'center', width: '110px' },
  { title: '발생 대상 설비', key: 'targetEquipment', align: 'start', width: '130px' },
  { title: '자동 복구 여부', key: 'autoRecover', align: 'center', width: '120px' },
  { title: '조치 가이드', key: 'actionGuide', align: 'start' },
]

const items = ref([
  {
    alarmCode: 'ALM-STK-001',
    alarmName: '스토커 포크 타임아웃',
    severity: 'CRITICAL',
    targetEquipment: 'STOCKER',
    autoRecover: 'N',
    actionGuide: '설비 현장 확인 후 수동 리셋',
    useYn: 'Y',
    description: '스토커 포크 동작 중 제한 시간 초과',
  },
  {
    alarmCode: 'ALM-CV-002',
    alarmName: '컨베이어 센서 감지 오류',
    severity: 'MAJOR',
    targetEquipment: 'CONVEYOR',
    autoRecover: 'Y',
    actionGuide: '센서 이물질 점검',
    useYn: 'Y',
    description: '컨베이어 입구 감지 센서 에러',
  },
  {
    alarmCode: 'ALM-BAT-003',
    alarmName: '캐리어 저배터리 경고',
    severity: 'MINOR',
    targetEquipment: 'CARRIER',
    autoRecover: 'Y',
    actionGuide: '충전소 자동 복귀 지시',
    useYn: 'Y',
    description: '배터리 20% 이하 감지',
  },
])

const filteredItems = computed(function () {
  return items.value.filter(function (item) {
    const matchKeyword =
      !searchKeyword.value ||
      (item.alarmCode && item.alarmCode.toLowerCase().includes(searchKeyword.value.toLowerCase())) ||
      (item.alarmName && item.alarmName.toLowerCase().includes(searchKeyword.value.toLowerCase()))

    const matchStatus =
      statusFilter.value === '전체' || item.severity === statusFilter.value

    return matchKeyword && matchStatus
  })
})

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
  }, 200)
}

function handleReset() {
  searchKeyword.value = ''
  statusFilter.value = '전체'
  handleSearch()
}

function onFormSuccess(payload, actionType) {
  if (actionType === 'DELETE') {
    items.value = items.value.filter(function (el) {
      return el.alarmCode !== payload.alarmCode
    })
  } else if (actionType === 'CREATE') {
    items.value.unshift(payload)
  } else if (actionType === 'UPDATE') {
    const idx = items.value.findIndex(function (el) {
      return el.alarmCode === payload.alarmCode
    })
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...payload }
    }
  }
  handleSearch()
}

// [신규 등록] 버튼 클릭 시 우측 슬라이드 패널 오픈
function onAddAlarmDef() {
  panelStore.openPanel(markRaw(AlarmDefViewForm), {
    mode: 'CREATE',
    data: null,
    title: t('views.modeling.alarmDef.createTitle'),
    onSuccess: onFormSuccess,
  })
}

// 행(Row) 클릭 시 수정 모드로 우측 슬라이드 패널 오픈
function onRowClick(event, row) {
  const itemData = (row && row.item) ? row.item : row
  panelStore.openPanel(markRaw(AlarmDefViewForm), {
    mode: 'UPDATE',
    data: itemData,
    title: t('views.modeling.alarmDef.editTitle'),
    onSuccess: onFormSuccess,
  })
}

function handleExport() {
  alert(t('views.modeling.alarmDef.exportAlert'))
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
