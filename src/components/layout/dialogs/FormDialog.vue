<script setup>
import {
  getBookingTitle,
  getBookingIcon,
  getBookingTypeLabel
} from '../utils/helpers'

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  booking: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Deletion'
  },
  confirmText: {
    type: String,
    default: 'Delete'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// For formatting date - we'll need handlers passed from parent or use a simpler approach
const formatDate = (booking) => {
  if (!booking) return ''

  const dateField = booking.bookingType === 'wedding' ? booking.wedding_date
    : booking.bookingType === 'funeral' ? booking.funeral_date
    : booking.bookingType === 'baptism' ? booking.baptism_date
    : booking.thanksgiving_date

  if (!dateField) return ''

  // Simple date formatting - can be enhanced with proper handlers if needed
  return new Date(dateField).toLocaleDateString()
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="400"
    persistent
  >
    <v-card>
      <v-card-title class="text-h6 font-weight-medium">
        <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
        {{ title }}
      </v-card-title>

      <v-card-text>
        <p class="mb-2">Are you sure you want to delete this booking?</p>
        <div v-if="booking" class="pa-3 bg-grey-lighten-4 rounded">
          <div class="d-flex align-center mb-2">
            <v-icon :color="getBookingIcon(booking)" class="mr-2">
              {{ getBookingIcon(booking) }}
            </v-icon>
            <span class="font-weight-medium">{{ getBookingTitle(booking) }}</span>
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ getBookingTypeLabel(booking) }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ formatDate(booking) }}
          </div>
        </div>
        <v-alert type="warning" variant="tonal" class="mt-3">
          <template #text>
            This action cannot be undone. The booking will be permanently removed from your records.
          </template>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          @click="handleConfirm"
          :loading="loading"
          :disabled="loading"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
