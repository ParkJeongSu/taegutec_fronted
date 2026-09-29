<!-- src/components/common/ConfirmDialog.vue -->
<template>
  <v-dialog v-model="visible" max-width="420">
    <v-card class="pa-4">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon :color="confirmColor" :icon="icon" class="mr-2"></v-icon>
        {{ title || $t('common.deleteConfirmTitle') }}
      </v-card-title>
      <v-card-text class="pt-2">{{ message || $t('common.deleteConfirmMsg') }}</v-card-text>
      <v-card-actions class="pt-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" v-on:click="onCancel">{{ cancelText || $t('common.cancel') }}</v-btn>
        <v-btn :color="confirmColor" variant="elevated" v-on:click="onConfirm">{{ confirmText || $t('common.delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  cancelText: { type: String, default: '' },
  confirmColor: { type: String, default: 'error' },
  icon: { type: String, default: '$error' },
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: function () {
    return props.modelValue
  },
  set: function (val) {
    emit('update:modelValue', val)
  },
})

function onCancel() {
  visible.value = false
}
function onConfirm() {
  emit('confirm')
  visible.value = false
}
</script>
