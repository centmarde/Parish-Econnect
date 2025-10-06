<script setup>
import { ref, watch } from 'vue'

// Define props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Search announcements...'
  },
  showPastFilter: {
    type: Boolean,
    default: true
  },
  showPastAnnouncements: {
    type: Boolean,
    default: true // Changed to true for "show all" as default
  }
})

// Define emits
const emit = defineEmits([
  'update:modelValue',
  'update:showPastAnnouncements',
  'clear'
])

// Local reactive state
const searchInput = ref(props.modelValue)
const showPast = ref(props.showPastAnnouncements)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  searchInput.value = newValue
})

// Watch for external changes to showPastAnnouncements
watch(() => props.showPastAnnouncements, (newValue) => {
  showPast.value = newValue
})

// Handle search input
const handleSearchInput = () => {
  emit('update:modelValue', searchInput.value)
}

// Handle past announcements toggle
const handlePastToggle = () => {
  emit('update:showPastAnnouncements', showPast.value)
}

// Clear search
const clearSearch = () => {
  searchInput.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <v-card class="announcement-search-bar elevation-2">
    <v-card-text class="pa-4">
      <v-row align="center" no-gutters>
        <!-- Search Input -->
        <v-col cols="12" md="8">
          <v-text-field
            v-model="searchInput"
            :placeholder="placeholder"
            :loading="loading"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            @input="handleSearchInput"
            @click:clear="clearSearch"
          >
            <template #prepend-inner>
              <v-icon color="grey-darken-1">
                mdi-magnify
              </v-icon>
            </template>
          </v-text-field>
        </v-col>

        <!-- Past Announcements Filter -->
        <v-col v-if="showPastFilter" cols="12" md="4" class="mt-3 mt-md-0 pl-md-3">
          <v-switch
            v-model="showPast"
            color="primary"
            density="comfortable"
            hide-details
            @change="handlePastToggle"
          >
            <template #label>
              <span class="text-body-2">
                {{ showPast ? 'Show All' : 'Upcoming Only' }}
              </span>
            </template>
          </v-switch>
        </v-col>
      </v-row>

      <!-- Search Results Info -->
      <v-row v-if="searchInput.trim()" class="mt-2">
        <v-col>
          <v-chip
            size="small"
            color="primary"
            variant="outlined"
            closable
            @click:close="clearSearch"
          >
            <v-icon start>mdi-magnify</v-icon>
            Searching: "{{ searchInput }}"
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.announcement-search-bar {
  margin-bottom: 16px;
}

@media (max-width: 959px) {
  .v-switch {
    display: flex;
    justify-content: center;
  }
}
</style>
