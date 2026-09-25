<!-- src/components/common/BaseDataTable.vue -->
<template>
  <v-data-table-server
    v-model="selectedItems"
    v-model:items-per-page="internalItemsPerPage"
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :loading="loading"
    :density="density"
    :hover="hover"
    :fixed-header="fixedHeader"
    :item-value="itemValue"
    :show-select="showSelect"
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
        조회된 데이터가 없습니다.
      </v-alert>
    </template>
  </v-data-table-server>
</template>

<script setup>
import { ref, watch } from 'vue'

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
    type: Number,
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
})

const emit = defineEmits(['update:options', 'update:modelValue', 'update:itemsPerPage', 'click:row', 'dblclick:row'])

const internalItemsPerPage = ref(props.itemsPerPage)
const selectedItems = ref(props.modelValue || [])

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

function onUpdateOptions(options) {
  emit('update:options', options)
}

function onUpdateItemsPerPage(val) {
  internalItemsPerPage.value = val
  emit('update:itemsPerPage', val)
}

function onRowClick(event, row) {
  emit('click:row', event, row)
}

function onRowDblClick(event, row) {
  emit('dblclick:row', event, row)
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

.hide-footer-table :deep(.v-table__wrapper) {
  margin-bottom: 0;
}
</style>
