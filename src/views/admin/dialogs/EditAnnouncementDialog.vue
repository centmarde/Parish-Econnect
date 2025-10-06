<template>
  <v-dialog
    v-model="isVisible"
    max-width="700px"
    scrollable
    persistent
    :disabled="loading"
  >
    <v-card>
      <!-- Dialog Header -->
      <v-card-title class="pa-6 pb-3 bg-primary-lighten-5">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon
              size="large"
              color="primary"
              class="mr-3"
            >
              mdi-pencil-box
            </v-icon>
            <h2 class="text-h5 font-weight-bold text-primary">
              Edit Announcement
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
          @submit.prevent="handleSubmit"
        >
          <!-- Title Field -->
          <v-text-field
            v-model="formData.title"
            label="Announcement Title"
            placeholder="Enter announcement title..."
            variant="outlined"
            color="primary"
            :disabled="loading"
            :counter="100"
            maxlength="100"
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
            :disabled="loading"
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
            :disabled="loading"
            :counter="500"
            maxlength="500"
            rows="4"
            auto-grow
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
      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!hasChanges"
          @click="handleSubmit"
        >
          <v-icon start>mdi-content-save</v-icon>
          Save Changes
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
  },
  announcement: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'announcement-updated'
])

// Composables
const announcementServices = useAnnouncementServices()
const { updateAnnouncement, formAction } = announcementServices



// Reactive state
const loading = ref(false)
const originalData = ref({})

// Form data with proper initialization
const formData = ref({
  title: '',
  date: '',
  starting_time: '',
  ending_time: '',
  description: ''
})

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Check if form has changes
const hasChanges = computed(() => {
  if (!originalData.value || !formData.value) return false

  return (
    formData.value.title !== originalData.value.title ||
    formData.value.date !== originalData.value.date ||
    formData.value.starting_time !== originalData.value.starting_time ||
    formData.value.ending_time !== originalData.value.ending_time ||
    formData.value.description !== originalData.value.description
  )
})



// Methods
const populateForm = () => {
  if (!props.announcement) return

  // Convert date to YYYY-MM-DD format for input[type="date"]
  const announcementDate = new Date(props.announcement.date)
  const formattedDate = announcementDate.toISOString().split('T')[0]

  const data = {
    title: props.announcement.title || '',
    date: formattedDate,
    starting_time: props.announcement.starting_time || '',
    ending_time: props.announcement.ending_time || '',
    description: props.announcement.description || ''
  }

  formData.value = { ...data }
  originalData.value = { ...data }
}

const handleSubmit = async () => {
  if (!props.announcement || !hasChanges.value) return

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

    const result = await updateAnnouncement(props.announcement.id, cleanedData)

    if (result.success) {
      emit('announcement-updated', result.data)
      await nextTick()
      isVisible.value = false
    }
  } catch (error) {
    console.error('Error updating announcement:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (loading.value) return
  isVisible.value = false
}

const resetForm = () => {
  // Reset form action if needed
  if (formAction.value.formErrorMessage || formAction.value.formSuccessMessage) {
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

// Watch for dialog visibility changes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.announcement) {
      nextTick(() => {
        populateForm()
        resetForm()
      })
    }
  }
)

// Watch for announcement prop changes
watch(
  () => props.announcement,
  () => {
    if (props.modelValue && props.announcement) {
      nextTick(() => {
        populateForm()
      })
    }
  }
)
</script>
