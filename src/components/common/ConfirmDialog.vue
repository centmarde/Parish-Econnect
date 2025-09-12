<script setup>
// Props para sa ConfirmDialog
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmColor: {
    type: String,
    default: 'primary'
  },
  loading: {
    type: Boolean,
    default: false
  },
  persistent: {
    type: Boolean,
    default: true
  }
})

// Emits para sa dialog actions
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// Handle dialog close
const handleClose = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

// Handle confirm action
const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="400"
    :persistent="persistent"
  >
    <v-card class="glass-card">
      <v-card-title class="pa-6">
        <v-icon color="warning" size="24" class="mr-2">mdi-alert-circle</v-icon>
        {{ title }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <p class="text-body-1" v-html="message"></p>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="handleClose"
          :disabled="loading"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
