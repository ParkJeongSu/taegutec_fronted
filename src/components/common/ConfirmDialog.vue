<!-- src/components/common/ConfirmDialog.vue -->
<template>
  <v-dialog v-model="visible" max-width="400">
    <v-card class="pa-4">
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon color="error" icon="$error" class="mr-2"></v-icon>
        {{ $t('common.deleteConfirmTitle') }}
      </v-card-title>
      <v-card-text>{{ message || $t('common.deleteConfirmMsg') }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" v-on:click="onCancel">{{ $t('common.cancel') }}</v-btn>
        <v-btn color="error" variant="elevated" v-on:click="onConfirm">{{ $t('common.delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  message: { type: String, default: '' },
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
