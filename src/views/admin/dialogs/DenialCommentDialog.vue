<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card class="rounded-lg">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between bg-error text-white pa-4">
        <div class="d-flex align-center">
          <v-icon icon="mdi-close-circle" class="me-3" size="28"></v-icon>
          <div>
            <h3 class="text-h6 font-weight-bold mb-0">Deny Event</h3>
            <p class="text-body-2 mb-0 opacity-90">Please provide a reason for denial</p>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="handleCancel"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Content -->
      <v-card-text class="pa-6">
        <!-- Event Information -->
        <v-alert
          v-if="eventTitle"
          type="info"
          variant="tonal"
          class="mb-4"
        >

          <strong>Event:</strong> {{ eventTitle }}
        </v-alert>

        <!-- Comment Form -->
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-textarea
            v-model="comment"
            label="Reason for Denial *"
            placeholder="Please provide a clear reason why this event is being denied..."
            :rules="[rules.required, rules.minLength]"

            rows="4"
            counter="500"
            maxlength="500"
            required
            autofocus
            class="mb-5"
          >
            <template #prepend-inner>
              <v-icon icon="mdi-message-text" color="error"></v-icon>
            </template>
          </v-textarea>

          <!-- Guidelines -->
          <v-card variant="tonal" color="warning" class="mb-4">
            <v-card-text class="pa-3">
              <v-icon icon="mdi-lightbulb" color="warning" class="me-2"></v-icon>
              <strong>Guidelines:</strong>
              <ul class="mt-2 ml-4">
                <li>Be clear and specific about the reason</li>
                <li>Use professional and respectful language</li>
                <li>Include any corrective actions if applicable</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>

        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>

        <v-btn
          color="error"
          variant="elevated"
          prepend-icon="mdi-close-circle"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!comment.trim() || comment.trim().length < 10"
        >
          Deny Event
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Component name for ESLint multi-word rule
defineOptions({
  name: 'DenialCommentDialog'
})

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  eventTitle: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'deny-with-comment', 'cancel'])

// Reactive data
const comment = ref('')
const formRef = ref(null)

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form validation rules
const rules = {
  required: (value) => !!value?.trim() || 'Reason for denial is required',
  minLength: (value) => (value?.trim().length >= 10) || 'Please provide at least 10 characters'
}

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  emit('deny-with-comment', comment.value.trim())
}

const handleCancel = () => {
  emit('cancel')
  resetForm()
}

const resetForm = () => {
  comment.value = ''
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

// Watch for dialog close to reset form
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    setTimeout(() => resetForm(), 300) // Delay to allow dialog animation
  }
})
</script>

<style scoped>
/* Additional styling if needed */
.v-card {
  overflow: visible;
}

.v-textarea :deep(.v-field__field) {
  --v-field-padding-start: 16px;
  --v-field-padding-top: 12px;
}
</style>
