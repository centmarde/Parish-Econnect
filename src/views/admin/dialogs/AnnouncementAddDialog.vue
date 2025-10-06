<template>
  <v-dialog
    v-model="isVisible"
    max-width="700px"
    scrollable
    persistent
    :disabled="loading"
  >
    <v-card class="elevation-8">
      <!-- Dialog Header -->
      <v-card-title class="pa-6 pb-3 bg-primary-lighten-5">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon
              size="large"
              color="primary"
              class="mr-3"
            >
              mdi-bullhorn-plus
            </v-icon>
            <h2 class="text-h5 text-sm-h5 text-h6 font-weight-bold text-primary">
              Add New Announcement
            </h2>
          </div>
          <v-btn
            icon
            variant="text"
            :disabled="loading"
            @click="handleCancel"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <!-- Dialog Content -->
      <v-card-text class="pa-6">
        <v-form
          ref="formRef"
          v-model="isFormValid"
          @submit.prevent="handleSubmit"
        >
          <!-- Title Field -->
          <v-text-field
            v-model="formData.title"
            label="Announcement Title"
            placeholder="Enter announcement title..."
            variant="outlined"
            color="primary"
            :rules="titleRules"
            :disabled="loading"
            :counter="100"
            maxlength="100"
            required
            class="mb-4"
          >
            <template #prepend-inner>
              <v-icon color="primary">mdi-format-title</v-icon>
            </template>
          </v-text-field>

          <!-- Date Field -->
          <v-text-field
            v-model="formData.date"
            label="Date"
            type="date"
            variant="outlined"
            color="primary"
            :rules="dateRules"
            :disabled="loading"
            required
            class="mb-4"
          >
            <template #prepend-inner>
              <v-icon color="primary">mdi-calendar</v-icon>
            </template>
          </v-text-field>

          <!-- Time Fields Row -->
          <v-row class="mb-4">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.starting_time"
                label="Start Time (Optional)"
                type="time"
                variant="outlined"
                color="primary"
                :disabled="loading"
                :rules="startTimeRules"
                clearable
              >
                <template #prepend-inner>
                  <v-icon color="primary">mdi-clock-start</v-icon>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.ending_time"
                label="End Time (Optional)"
                type="time"
                variant="outlined"
                color="primary"
                :disabled="loading || !formData.starting_time"
                :rules="endTimeRules"
                clearable
              >
                <template #prepend-inner>
                  <v-icon color="primary">mdi-clock-end</v-icon>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <!-- Description Field -->
          <v-textarea
            v-model="formData.description"
            label="Description"
            placeholder="Enter announcement description..."
            variant="outlined"
            color="primary"
            :rules="descriptionRules"
            :disabled="loading"
            :counter="500"
            maxlength="500"
            rows="4"
            auto-grow
            required
          >
            <template #prepend-inner>
              <v-icon color="primary">mdi-text</v-icon>
            </template>
          </v-textarea>

          <!-- Form Status Messages -->
          <v-alert
            v-if="formAction.formErrorMessage"
            type="error"
            variant="tonal"
            class="mt-4"
            :text="formAction.formErrorMessage"
          />

          <v-alert
            v-if="formAction.formSuccessMessage"
            type="success"
            variant="tonal"
            class="mt-4"
            :text="formAction.formSuccessMessage"
          />
        </v-form>
      </v-card-text>

      <!-- Dialog Actions -->
      <v-divider />
      <v-card-actions class="pa-6 d-flex flex-sm-row flex-column-reverse ga-2">
        <v-spacer class="d-none d-sm-flex" />
        <v-btn
          color="grey"
          variant="text"
          :disabled="loading"
          :class="$vuetify.display.xs ? 'w-100' : ''"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!isFormValid"
          :class="$vuetify.display.xs ? 'w-100' : ''"
          @click="handleSubmit"
        >
          <v-icon start>mdi-plus</v-icon>
          Create Announcement
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAnnouncementServices } from '@/views/announcements/announcementServices'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'announcement-created'
])

// Composables
const announcementServices = useAnnouncementServices()
const { createAnnouncement, formAction } = announcementServices

// Template refs
const formRef = ref(null)

// Reactive state
const isFormValid = ref(false)
const loading = ref(false)

// Form data with proper initialization
const formData = ref({
  title: '',
  date: new Date().toISOString().split('T')[0], // Today's date as default
  starting_time: '',
  ending_time: '',
  description: ''
})

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Form validation rules
const titleRules = [
  (v) => !!v || 'Title is required',
  (v) => (v && v.length <= 100) || 'Title must be 100 characters or less',
  (v) => (v && v.trim().length > 0) || 'Title cannot be empty'
]

const dateRules = [
  (v) => !!v || 'Date is required',
  (v) => {
    if (!v) return true
    const selectedDate = new Date(v)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today || 'Date cannot be in the past'
  }
]

const descriptionRules = [
  (v) => !!v || 'Description is required',
  (v) => (v && v.length <= 500) || 'Description must be 500 characters or less',
  (v) => (v && v.trim().length > 0) || 'Description cannot be empty'
]

const startTimeRules = [
  (v) => {
    if (!v) return true // Optional field
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(v) || 'Please enter a valid time format (HH:MM)'
  }
]

const endTimeRules = [
  (v) => {
    if (!v) return true // Optional field
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(v)) return 'Please enter a valid time format (HH:MM)'

    // Check if end time is after start time
    if (formData.value.starting_time && v) {
      const startTime = new Date(`2000-01-01T${formData.value.starting_time}:00`)
      const endTime = new Date(`2000-01-01T${v}:00`)
      return endTime > startTime || 'End time must be after start time'
    }

    return true
  }
]

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    // Clean the form data before submission
    const cleanedData = {
      title: formData.value.title?.trim(),
      date: formData.value.date,
      description: formData.value.description?.trim(),
      starting_time: formData.value.starting_time || null,
      ending_time: formData.value.ending_time || null
    }

    const result = await createAnnouncement(cleanedData)

    if (result.success) {
      emit('announcement-created', result.data)
      await nextTick()
      handleReset()
      isVisible.value = false
    }
  } catch (error) {
    console.error('Error creating announcement:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (loading.value) return
  handleReset()
  isVisible.value = false
}

const handleReset = () => {
  formData.value = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    starting_time: '',
    ending_time: '',
    description: ''
  }

  if (formRef.value) {
    formRef.value.reset()
    formRef.value.resetValidation()
  }

  // Reset form action if needed
  if (formAction.value.formErrorMessage || formAction.value.formSuccessMessage) {
    // Note: The service should handle this, but we can reset locally too
    setTimeout(() => {
      formAction.value.formStatus = 200
      formAction.value.formErrorMessage = ''
      formAction.value.formSuccessMessage = ''
    }, 100)
  }
}

// Watch for form changes to clear end time when start time is cleared
watch(
  () => formData.value.starting_time,
  (newStartTime) => {
    if (!newStartTime && formData.value.ending_time) {
      formData.value.ending_time = ''
    }
  }
)

// Watch for dialog visibility changes to reset form
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      // Dialog opened - ensure form is reset
      nextTick(() => {
        handleReset()
      })
    }
  }
)
</script>

