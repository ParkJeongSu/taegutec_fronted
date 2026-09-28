<template>
  <v-data-table-server
    v-model="selectedItems"
    v-model:items-per-page="internalItemsPerPage"
    :headers="headers"
    :items="items"
    :items-length="computedTotalItems"
    :loading="loading"
    :density="density"
    :hover="hover"
    :fixed-header="fixedHeader"
    :item-value="itemValue"
    :show-select="showSelect"
    :row-props="getRowProps"
    return-object
    :class="['base-data-table', { 'hide-footer-table': hideFooter }]"
    v-on:update:options="onUpdateOptions"
    v-on:update:items-per-page="onUpdateItemsPerPage"
    v-on:click:row="onRowClick"
    v-on:dblclick:row="onRowDblClick"
  >
    <!-- dynamic slot 전달 (부모에서 특정 컬럼 및 템플릿 커스텀 지원) -->
    <template v-for="slotName in Object.keys($slots)" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}"></slot>
    </template>

    <!-- 하단 페이지네이션 숨김 처리 (hideFooter가 true이고 $slots['bottom']이 정의되지 않았을 때) -->
    <template v-if="hideFooter && !$slots['bottom']" #bottom></template>

    <!-- 데이터가 없을 때 기본 표시 -->
    <template v-if="!$slots['no-data']" #no-data>
      <v-alert type="warning" variant="tonal" class="ma-4">
        {{ $t('common.noData') }}
      </v-alert>
    </template>
  </v-data-table-server>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    default: function () {
      return []
    },
  },
  totalItems: {
    type: [Number, String],
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  density: {
    type: String,
    default: 'compact',
  },
  hover: {
    type: Boolean,
    default: true,
  },
  fixedHeader: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: Array,
    default: function () {
      return []
    },
  },
  itemValue: {
    type: String,
    default: 'id',
  },
  showSelect: {
    type: Boolean,
    default: false,
  },
  hideFooter: {
    type: Boolean,
    default: false,
  },
  selectedKey: {
    type: [String, Number, Object],
    default: null,
  },
})

const emit = defineEmits([
  'update:options',
  'update:modelValue',
  'update:itemsPerPage',
  'update:selectedKey',
  'click:row',
  'dblclick:row',
])

const computedTotalItems = computed(function () {
  return Number(props.totalItems || 0)
})

const internalItemsPerPage = ref(props.itemsPerPage)
const selectedItems = ref(props.modelValue || [])
const activeSelectedKey = ref(props.selectedKey || null)

watch(
  function () {
    return props.itemsPerPage
  },
  function (newVal) {
    internalItemsPerPage.value = newVal
  },
)

watch(
  function () {
    return props.modelValue
  },
  function (newVal) {
    selectedItems.value = newVal || []
  },
)

watch(
  function () {
    return selectedItems.value
  },
  function (newVal) {
    emit('update:modelValue', newVal)
  },
)

watch(
  function () {
    return props.selectedKey
  },
  function (newVal) {
    activeSelectedKey.value = newVal
  },
)

// ✨ 누락되었던 핸들러 함수 정의
function onUpdateOptions(options) {
  emit('update:options', options)
}

function onUpdateItemsPerPage(itemsPerPage) {
  internalItemsPerPage.value = itemsPerPage
  emit('update:itemsPerPage', itemsPerPage)
}

function extractItem(row) {
  if (!row) return null
  if (row.item) {
    return row.item.raw || row.item
  }
  if (row.raw) {
    return row.raw
  }
  return row
}

function getRowKey(rawItem) {
  if (!rawItem) return null
  const item = extractItem(rawItem)
  if (!item) return null

  const keyProp = props.itemValue || 'id'
  if (item[keyProp] !== undefined && item[keyProp] !== null) {
    return item[keyProp]
  }
  if (item.compositeKey !== undefined && item.compositeKey !== null) {
    return item.compositeKey
  }
  if (item.id !== undefined && item.id !== null) {
    return item.id
  }
  if (item.code !== undefined && item.code !== null) {
    return item.code
  }
  return item
}

function onRowClick(event, row) {
  const itemData = extractItem(row)
  if (itemData) {
    activeSelectedKey.value = getRowKey(itemData)
    emit('update:selectedKey', activeSelectedKey.value)
  }
  emit('click:row', event, row)
}

function onRowDblClick(event, row) {
  emit('dblclick:row', event, row)
}

function getRowProps(data) {
  const item = extractItem(data)
  const currentKey = getRowKey(item)
  const isSelected =
    activeSelectedKey.value !== null &&
    currentKey !== null &&
    (activeSelectedKey.value === currentKey ||
      (typeof activeSelectedKey.value === 'object' && activeSelectedKey.value === item))

  return {
    class: isSelected ? 'selected-table-row' : '',
  }
}
</script>

<style scoped>
.base-data-table {
  border-top: 2px solid rgb(var(--v-theme-primary));
}

:deep(.v-data-table-header) {
  background-color: #f1f8e9;
}

:deep(.v-data-table-header th) {
  font-weight: bold !important;
  color: #2e7d32 !important;
}

:deep(.v-data-table__tr:hover) {
  background-color: #f9fbe7 !important;
}

/* ✨ 선택 행: 확실한 시인성을 위해 명도 강화 (배경 진하게 + 4px 진한 초록 바) */
:deep(.v-data-table__tr.selected-table-row),
:deep(tr.selected-table-row) {
  background-color: #c8e6c9 !important; /* 밝고 선명한 민트-연두 계열 */
  border-left: 4px solid #1b5e20 !important;
}

:deep(.v-data-table__tr.selected-table-row:hover),
:deep(tr.selected-table-row:hover) {
  background-color: #a5d6a7 !important;
}

:deep(.v-data-table__tr.selected-table-row > td),
:deep(tr.selected-table-row > td) {
  background-color: transparent !important;
  font-weight: 500 !important;
}

.hide-footer-table :deep(.v-table__wrapper) {
  margin-bottom: 0;
}
</style>
