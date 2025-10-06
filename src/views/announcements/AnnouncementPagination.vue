<script setup>
import { computed } from 'vue'

// Define props
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    default: 0
  },
  itemsPerPage: {
    type: Number,
    default: 6 // Changed from 10 to 6
  },
  loading: {
    type: Boolean,
    default: false
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [6, 12, 18, 24] // Updated options for 6-based pagination
  }
})

// Define emits
const emit = defineEmits([
  'update:currentPage',
  'update:itemsPerPage'
])

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage
  return Math.min(end, props.totalItems)
})

const pageInfo = computed(() => {
  if (props.totalItems === 0) {
    return '0 of 0'
  }
  return `${startItem.value}-${endItem.value} of ${props.totalItems}`
})

const itemsPerPageSelectOptions = computed(() => {
  return props.itemsPerPageOptions.map(option => ({
    title: option.toString(),
    value: option
  }))
})

// Event handlers
const handlePageChange = (page) => {
  if (page !== props.currentPage && page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}

const handleItemsPerPageChange = (itemsPerPage) => {
  if (itemsPerPage !== props.itemsPerPage) {
    emit('update:itemsPerPage', itemsPerPage)
    // Reset to first page when changing items per page
    if (props.currentPage !== 1) {
      emit('update:currentPage', 1)
    }
  }
}

const goToPreviousPage = () => {
  handlePageChange(props.currentPage - 1)
}

const goToNextPage = () => {
  handlePageChange(props.currentPage + 1)
}
</script>

<template>
  <div class="data-table-pagination mt-3">
    <v-row align="center" justify="space-between" no-gutters class="pa-3">
      <!-- Items per page selector -->
      <v-col cols="auto">
        <div class="d-flex align-center">
          <span class="text-caption text-medium-emphasis mr-2">
            Items per page:
          </span>
          <v-select
            :model-value="itemsPerPage"
            :items="itemsPerPageSelectOptions"
            variant="outlined"
            density="compact"
            hide-details
            style="width: 80px"
            :disabled="loading"
            @update:model-value="handleItemsPerPageChange"
          />
        </div>
      </v-col>

      <!-- Page info and navigation -->
      <v-col cols="auto">
        <div class="d-flex align-center">
          <!-- Page info -->
          <span class="text-caption text-medium-emphasis mr-4">
            {{ pageInfo }}
          </span>

          <!-- Previous button -->
          <v-btn
            size="small"
            variant="text"
            :disabled="currentPage <= 1 || loading"
            @click="goToPreviousPage"
            class="mr-2"
          >
            <v-icon>mdi-chevron-left</v-icon>
            <v-tooltip activator="parent">Previous page</v-tooltip>
          </v-btn>

          <!-- Current page indicator -->
          <div class="d-flex align-center mx-2">
            <span class="text-body-2 font-weight-medium">
              {{ currentPage }}
            </span>
            <span class="text-caption text-medium-emphasis mx-1">
              of
            </span>
            <span class="text-body-2 font-weight-medium">
              {{ totalPages }}
            </span>
          </div>

          <!-- Next button -->
          <v-btn
            size="small"
            variant="text"
            :disabled="currentPage >= totalPages || loading"
            @click="goToNextPage"
            class="ml-2"
          >
            <v-icon>mdi-chevron-right</v-icon>
            <v-tooltip activator="parent">Next page</v-tooltip>
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.data-table-pagination {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: rgb(var(--v-theme-surface));
  min-height: 52px;
}

/* Match Vuetify data table pagination styling */
.text-caption {
  font-size: 0.75rem !important;
  line-height: 1.25rem;
  letter-spacing: 0.0333333333em !important;
}

.text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity)) !important;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .data-table-pagination .v-row {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .data-table-pagination .v-col {
    justify-content: center;
  }

  .d-flex.align-center {
    justify-content: center;
  }
}
</style>
