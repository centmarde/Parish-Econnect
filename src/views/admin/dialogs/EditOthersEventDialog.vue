<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    persistent
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="d-flex align-center pa-6 bg-primary text-white">
        <v-icon icon="mdi-calendar-edit" size="32" class="me-3"></v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold mb-1">Edit Parish Event</h2>
          <p class="text-body-2 mb-0 opacity-90">Update event details</p>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="dialog = false"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Form Content -->
      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSave">
          <v-row>
            <!-- Event Title -->
            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                label="Event Title"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-format-title"
              ></v-text-field>
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                rows="4"
                prepend-inner-icon="mdi-text"
                placeholder="Enter event description..."
              ></v-textarea>
            </v-col>

            <!-- Date -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.eventDate"
                label="Event Date"
                type="date"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-calendar"
              ></v-text-field>
            </v-col>

            <!-- Start Time -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.starting_time"
                label="Start Time"
                type="time"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-clock-start"
              ></v-text-field>
            </v-col>

            <!-- End Time -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.ending_time"
                label="End Time"
                type="time"
                :rules="[rules.required, rules.endTimeAfterStart]"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-clock-end"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>

        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="dialog = false"
          :disabled="loading"
        >
          Cancel
        </v-btn>

        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-content-save"
          @click="handleSave"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAddEvents } from '../composables/addEvents'

// Component name for ESLint multi-word rule
defineOptions({
  name: 'EditOthersEventDialog'
})

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  event: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'event-updated'])

// Composables
const { updateEvent, loading } = useAddEvents()

// Refs
const formRef = ref(null)
const isFormValid = ref(false)

// Form data
const form = ref({
  title: '',
  description: '',
  eventDate: '',
  starting_time: '',
  ending_time: ''
})

// Validation rules
const rules = {
  required: (value) => !!value || 'This field is required',
  endTimeAfterStart: (value) => {
    if (!value || !form.value.starting_time) return true
    return value > form.value.starting_time || 'End time must be after start time'
  }
}

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    eventDate: '',
    starting_time: '',
    ending_time: ''
  }
}

const loadEventData = () => {
  if (!props.event) return

  // Extract event data from the passed event object
  const eventData = props.event

  form.value = {
    title: eventData.title || eventData.eventName || '',
    description: eventData.description || '',
    eventDate: eventData.eventDate || (eventData.startDate ?
      new Date(eventData.startDate).toISOString().split('T')[0] : ''),
    starting_time: eventData.starting_time || eventData.eventTime || '',
    ending_time: eventData.ending_time || eventData.eventEndTime || ''
  }
}

const handleSave = async () => {
  if (!formRef.value || !formRef.value.validate()) {
    return
  }

  try {
    // Get the event ID
    const eventId = props.event?.id ||
                   props.event?.originalEvent?.id ||
                   props.event?.bookingData?.id

    if (!eventId) {
      console.error('No event ID found for update')
      return
    }

    // Extract numeric ID if needed (e.g., "other_1" -> 1)
    let numericId = eventId
    if (typeof eventId === 'string' && eventId.includes('_')) {
      numericId = parseInt(eventId.split('_')[1])
    }

    const result = await updateEvent(numericId, {
      title: form.value.title,
      description: form.value.description,
      starting_time: form.value.starting_time,
      ending_time: form.value.ending_time
    })

    if (result.success) {
      emit('event-updated', {
        ...props.event,
        title: form.value.title,
        description: form.value.description,
        eventTime: form.value.starting_time,
        eventEndTime: form.value.ending_time,
        starting_time: form.value.starting_time,
        ending_time: form.value.ending_time
      })
      dialog.value = false
    }
  } catch (err) {
    console.error('Error updating event:', err)
  }
}

// Watch for dialog opening to load event data
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.event) {
    loadEventData()
  } else if (!newValue) {
    resetForm()
  }
})

// Watch for event prop changes
watch(() => props.event, () => {
  if (props.modelValue && props.event) {
    loadEventData()
  }
})
</script>

<style scoped>
/* Add any specific styles if needed */
</style>
