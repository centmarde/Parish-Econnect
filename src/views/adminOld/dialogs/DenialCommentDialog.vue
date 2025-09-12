<script>
</script>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  denialDialog: Boolean,
  denialComment: String,
  selectedBooking: Object,
  bookingActionLoading: Boolean
})

// Emits
const emit = defineEmits(['update:denialDialog', 'update:denialComment', 'cancel', 'confirm'])

// Local computed properties for v-model support
const denialDialog = computed({
  get: () => props.denialDialog,
  set: (value) => emit('update:denialDialog', value)
})

const denialComment = computed({
  get: () => props.denialComment,
  set: (value) => emit('update:denialComment', value)
})

// Methods
const cancelDenialDialog = () => {
  emit('cancel')
}

const confirmDenyBooking = () => {
  emit('confirm')
}
</script>

<template>
    <!-- Denial Comment Dialog -->
      <v-dialog v-model="denialDialog" max-width="500" persistent>
        <v-card class="glass-card">
          <v-card-title class="d-flex align-center text-error">
            <v-icon class="me-2" color="error" size="32">mdi-close-circle</v-icon>
            Deny Booking
          </v-card-title>

          <v-card-text class="pa-6">
            <p class="mb-4">
              Please provide a reason for denying this {{ props.selectedBooking?.type }} booking:
            </p>

            <v-textarea
              v-model="denialComment"
              label="Reason for denial"
              placeholder="Enter the reason why this booking is being denied..."
              rows="4"
              required
              :rules="[(v) => !!v || 'Reason is required']"
              variant="outlined"
            />
          </v-card-text>

          <v-card-actions class="pa-6">
            <v-spacer />
            <v-btn variant="outlined" @click="cancelDenialDialog" class="me-3"> Cancel </v-btn>
            <v-btn
              color="error"
              @click="confirmDenyBooking"
              :loading="props.bookingActionLoading"
              :disabled="!denialComment.trim()"
            >
              <v-icon class="me-1">mdi-close</v-icon>
              Confirm Denial
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>
