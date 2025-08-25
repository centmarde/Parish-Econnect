<script setup>
import { ref, computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

// Props para sa calendar component
const props = defineProps({
  events: {
    type: Array,
    default: () => []
  },
  variant: {
    type: String,
    default: 'default' // options: 'default', 'compact', 'monthly'
  }
})

// Emit events para sa parent component
const emit = defineEmits(['date-selected', 'event-clicked'])

// Reactive data para sa selected date - read-only range view
const _start = new Date()
const _end = new Date()
_end.setDate(_end.getDate() + 7)
const selectedDate = ref([_start, _end]) // Always range mode, read-only

// Computed properties
const isCompact = computed(() => props.variant === 'compact')
const isMonthly = computed(() => props.variant === 'monthly')

// Methods para sa calendar interactions - read-only mode
const handleEventClick = (event) => {
  emit('event-clicked', event)
}

// Helper to format selected date(s) for display
const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })
}

const selectedLabel = computed(() => {
  const val = selectedDate.value
  if (Array.isArray(val)) {
    const [s, e] = val
    return `${formatDate(s)} — ${formatDate(e)}`
  }
  return formatDate(val)
})

// Calendar configuration - read-only range view
const calendarConfig = computed(() => ({
  inline: true,
  autoApply: true,
  enableTimePicker: false,
  multiCalendars: isMonthly.value ? 2 : 1,
  monthPicker: isCompact.value,
  range: true, // Always range mode
  readonly: true, // Make calendar read-only
  disabled: false, // Keep interactions for viewing
  clearable: false // Prevent clearing selection
}))

// Format events para sa calendar markers
const eventsForCalendar = computed(() => {
  return props.events.map(event => ({
    date: new Date(event.date),
    highlight: true,
    tooltip: event.title,
    popover: {
      label: event.title,
      visibility: 'hover'
    }
  }))
})
</script>

<template>
  <v-card class="ma-2" :elevation="2">
    <v-card-title class="d-flex align-center pa-3 pa-sm-4">
      <span class="text-h6 text-sm-h5 primary--text">
        {{ isCompact ? 'Quick Date Range' : 'Event Calendar Range' }}
      </span>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-2 pa-sm-4">
      <v-container fluid>
        <v-row>
          <v-col cols="12" :lg="isMonthly ? 12 : 8">
            <!-- Main calendar component -->
            <div class="calendar-wrapper">
              <div class="selected-range-label mb-3" v-if="selectedLabel">
                <v-chip size="small" variant="tonal" color="primary">
                  <v-icon start size="x-small">mdi-calendar-range</v-icon>
                  {{ selectedLabel }}
                </v-chip>
              </div>
              <VueDatePicker
                :model-value="selectedDate"
                v-bind="calendarConfig"
                :dark="false"
                :highlighted="eventsForCalendar"
                placeholder="Date range view"
                class="custom-calendar"
                :class="{ 'mobile-calendar': $vuetify.display.xs }"
              />
            </div>
          </v-col>

          <v-col 
            v-if="!isCompact && !isMonthly" 
            cols="12" 
            lg="4"
            class="hidden-md-and-down"
          >
            <!-- Event list sidebar - hidden on mobile, shown as separate section -->
            <v-card variant="outlined" class="pa-3">
              <v-card-title class="text-h6 pb-2">
                Upcoming Events
              </v-card-title>
              
              <v-divider class="mb-3"></v-divider>
              
              <div v-if="props.events.length > 0">
                <v-list density="compact">
                  <v-list-item
                    v-for="event in props.events.slice(0, 5)"
                    :key="event.id"
                    @click="handleEventClick(event)"
                    class="mb-1"
                  >
                    <template #prepend>
                      <v-icon :color="event.color || 'primary'" size="small">
                        mdi-calendar-check
                      </v-icon>
                    </template>
                    
                    <v-list-item-title class="text-body-2">
                      {{ event.title }}
                    </v-list-item-title>
                    
                    <v-list-item-subtitle class="text-caption">
                      {{ new Date(event.date).toLocaleDateString() }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </div>
              
              <v-alert 
                v-else 
                type="info" 
                variant="tonal" 
                density="compact"
                class="text-caption"
              >
                No upcoming events scheduled
              </v-alert>
            </v-card>
          </v-col>
        </v-row>

        <!-- Mobile events list - shown below calendar on mobile -->
        <v-row v-if="!isCompact && !isMonthly" class="hidden-lg-and-up mt-2">
          <v-col cols="12">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel
                title="Upcoming Events"
                :text="`${props.events.length} events scheduled`"
              >
                <template #text>
                  <div v-if="props.events.length > 0" class="pa-2">
                    <v-chip
                      v-for="event in props.events.slice(0, 8)"
                      :key="event.id"
                      :color="event.color || 'primary'"
                      size="small"
                      class="ma-1"
                      @click="handleEventClick(event)"
                    >
                      <v-icon start size="x-small">mdi-calendar-check</v-icon>
                      {{ event.title }}
                    </v-chip>
                  </div>
                  <v-alert v-else type="info" variant="tonal" density="compact">
                    No upcoming events scheduled
                  </v-alert>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>

        <!-- Selected date info -->
        <v-row v-if="selectedDate" class="mt-2">
          <v-col cols="12">
            <v-alert 
              type="success" 
              variant="tonal" 
              density="compact"
              class="text-body-2"
            >
              <v-icon class="me-2">mdi-calendar-today</v-icon>
              Selected: {{ new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) }}
            </v-alert>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.calendar-wrapper {
  width: 100%;
}

/* Custom styling para sa calendar na aligned sa Vuetify theme */
:deep(.dp__main) {
  font-family: 'Roboto', sans-serif;
}

:deep(.dp__calendar_header) {
  background-color: var(--v-theme-primary);
  color: white;
}

:deep(.dp__calendar_header_item) {
  color: white;
}

:deep(.dp__today) {
  border: 2px solid var(--v-theme-primary);
}

:deep(.dp__active_date) {
  background-color: var(--v-theme-primary);
  color: white;
}

:deep(.dp__date_hover) {
  background-color: var(--v-theme-primary-lighten-1);
  color: white;
}

/* Enhanced mobile responsiveness */
@media (max-width: 599px) {
  .calendar-wrapper {
    font-size: 0.875rem;
  }
  
  :deep(.dp__calendar) {
    font-size: 0.75rem;
  }
  
  .mobile-calendar :deep(.dp__calendar_header) {
    padding: 8px 4px;
  }
  
  .mobile-calendar :deep(.dp__calendar_item) {
    padding: 4px;
    min-height: 32px;
  }
  
  .mobile-calendar :deep(.dp__btn) {
    padding: 4px 8px;
    font-size: 0.75rem;
  }
  
  .mobile-calendar :deep(.dp__calendar_row) {
    margin: 2px 0;
  }
}

@media (max-width: 479px) {
  .calendar-wrapper {
    font-size: 0.8rem;
  }
  
  :deep(.dp__calendar) {
    font-size: 0.7rem;
  }
  
  .mobile-calendar :deep(.dp__calendar_item) {
    padding: 2px;
    min-height: 28px;
    font-size: 0.7rem;
  }
  
  .mobile-calendar :deep(.dp__btn) {
    padding: 2px 6px;
    font-size: 0.7rem;
  }
}

/* Touch-friendly enhancements */
@media (pointer: coarse) {
  :deep(.dp__calendar_item) {
    min-height: 44px; /* Minimum touch target size */
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  :deep(.dp__btn) {
    min-height: 44px;
    padding: 8px 12px;
  }
}
</style>