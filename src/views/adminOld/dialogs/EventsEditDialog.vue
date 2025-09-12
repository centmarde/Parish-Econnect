<script setup>
import { computed } from 'vue'

// Props para sa dialog data
const props = defineProps({
  editDialog: Boolean,
  editForm: Object,
  eventCategories: Array,
  actionLoading: Boolean,
})

// Emits para sa parent component interactions
const emit = defineEmits(['closeDialogs', 'updateEvent', 'update:editDialog', 'update:editForm'])

// Computed property para sa dialog visibility
const dialogVisible = computed({
  get: () => props.editDialog,
  set: (value) => emit('update:editDialog', value)
})

// Computed properties para sa form fields with proper reactivity
const formTitle = computed({
  get: () => props.editForm?.title || '',
  set: (value) => {
    const updatedForm = { ...props.editForm, title: value }
    emit('update:editForm', updatedForm)
  }
})

const formDescription = computed({
  get: () => props.editForm?.description || '',
  set: (value) => {
    const updatedForm = { ...props.editForm, description: value }
    emit('update:editForm', updatedForm)
  }
})

const formDate = computed({
  get: () => props.editForm?.date || '',
  set: (value) => {
    const updatedForm = { ...props.editForm, date: value }
    emit('update:editForm', updatedForm)
  }
})

const formStartingTime = computed({
  get: () => props.editForm?.starting_time || '',
  set: (value) => {
    const updatedForm = { ...props.editForm, starting_time: value }
    emit('update:editForm', updatedForm)
  }
})

const formEndingTime = computed({
  get: () => props.editForm?.ending_time || '',
  set: (value) => {
    const updatedForm = { ...props.editForm, ending_time: value }
    emit('update:editForm', updatedForm)
  }
})

const formType = computed({
  get: () => props.editForm?.type || 'announcement',
  set: (value) => {
    const updatedForm = { ...props.editForm, type: value }
    emit('update:editForm', updatedForm)
  }
})

const closeDialogs = () => {
  emit('closeDialogs')
}

const updateEvent = () => {
  emit('updateEvent')
}
</script>

<template>
 <!-- Edit Dialog (Only for announcements) -->
      <v-dialog v-model="dialogVisible" max-width="600" persistent>
        <v-card class="glass-card">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-pencil</v-icon>
            Edit Announcement
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <v-form @submit.prevent="updateEvent">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formTitle"
                    label="Title"
                    variant="outlined"
                    required
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="formDescription"
                    label="Description"
                    variant="outlined"
                    rows="3"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formDate"
                    label="Date"
                    type="date"
                    variant="outlined"
                    required
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formStartingTime"
                    label="Start Time"
                    type="time"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formEndingTime"
                    label="End Time"
                    type="time"
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="formType"
                    :items="eventCategories"
                    item-title="label"
                    item-value="name"
                    label="Event Type"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-6">
            <v-spacer />
            <v-btn @click="closeDialogs" variant="outlined">Cancel</v-btn>
            <v-btn @click="updateEvent" color="primary" :loading="actionLoading">
              Update Event
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>
