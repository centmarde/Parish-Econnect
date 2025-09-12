<script setup>
import { onMounted } from 'vue'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'

// Import ang mga components
import EventsAlerts from './components/EventsAlerts.vue'
import EventsHeader from './components/EventsHeader.vue'
import EventsEditDialog from './dialogs/EventsEditDialog.vue'
import EventsDeleteDialog from './dialogs/EventsDeleteDialog.vue'

// Import ang composable para sa events management
import { useEventsManagement } from './composables/useEventsManagement.js'

// Import ang mga helpers para sa template
import {
  getEventColor,
  getEventIcon,
  formatEventTitle,
  formatEventDescription,
  formatTime,
  isEventPassed
} from './utils/eventsHelpers'

// Use ang composable
const {
  // State
  loading,
  selectedEvent,
  editDialog,
  deleteDialog,
  actionLoading,
  errorMessage,
  successMessage,
  filterType,
  searchQuery,
  editForm,
  eventCategories,

  // Computed
  filteredEvents,
  eventTypeOptions,

  // Methods
  loadAllEvents,
  openEditDialog,
  openDeleteDialog,
  closeDialogs,
  updateEvent,
  deleteEvent,
  clearMessages,
} = useEventsManagement()

onMounted(() => {
  loadAllEvents()
})
</script>

<template>
  <PreloaderView v-if="loading" />
  <AdminHeader v-else>
    <template #content>
      <!-- Animated Background -->
      <div class="animated-bg"></div>
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>

      <v-container fluid class="pa-4 pa-md-8">
        <!-- Header Section -->
        <EventsHeader :filtered-events="filteredEvents" />

        <!-- Alerts Section -->
        <EventsAlerts
          :error-message="errorMessage"
          :success-message="successMessage"
          @clear-messages="clearMessages"
        />

        <!-- Filters and Search -->
        <v-card class="glass-card mb-6">
          <v-card-text class="pa-4">
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  prepend-inner-icon="mdi-magnify"
                  label="Search events..."
                  variant="outlined"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filterType"
                  :items="eventTypeOptions"
                  label="Filter by type"
                  variant="outlined"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="5" class="text-right">
                <v-chip color="primary" variant="tonal">
                  <v-icon start>mdi-calendar-multiple</v-icon>
                  {{ filteredEvents.length }} Events
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Events Feed -->
        <div v-if="filteredEvents.length === 0" class="text-center py-12">
          <v-icon size="64" color="grey" class="mb-4">mdi-calendar-remove</v-icon>
          <h3 class="text-h6 text-grey mb-2">No Events Found</h3>
          <p class="text-grey">
            {{
              searchQuery || filterType !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'No events have been created yet.'
            }}
          </p>
        </div>

        <div v-else>
          <v-row>
            <v-col
              v-for="event in filteredEvents"
              :key="`${event.table_name}-${event.id}`"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card class="glass-card h-100" :class="{ 'opacity-70': isEventPassed(event.event_date) }">
                <v-card-text class="pa-0">
                  <div class="d-flex">
                    <div class="flex-grow-1 pa-4">
                      <!-- Event Header -->
                      <div class="d-flex align-start mb-3">
                        <v-avatar
                          :color="getEventColor(event.type)"
                          size="40"
                          class="me-3"
                        >
                          <v-icon color="white">{{ getEventIcon(event.type) }}</v-icon>
                        </v-avatar>

                        <div class="flex-grow-1">
                          <h3 class="text-h6 mb-1 line-clamp-2">
                            {{ formatEventTitle(event) }}
                          </h3>
                          <v-chip
                            :color="getEventColor(event.type)"
                            size="small"
                            variant="tonal"
                            class="mb-2"
                          >
                            {{ eventCategories.find(cat => cat.name === event.type)?.label || event.type }}
                          </v-chip>
                        </div>

                        <v-chip
                          v-if="isEventPassed(event.event_date)"
                          color="grey"
                          size="small"
                          variant="tonal"
                        >
                          Past
                        </v-chip>
                      </div>

                      <!-- Event Details -->
                      <div class="mb-4">
                        <p class="text-body-2 text-grey mb-3 line-clamp-2">
                          {{ formatEventDescription(event) }}
                        </p>

                        <div class="d-flex flex-column ga-2">
                          <div class="d-flex align-center">
                            <v-icon class="me-2" size="18">mdi-calendar</v-icon>
                            <span class="text-body-2">{{
                              new Date(event.event_date).toLocaleDateString()
                            }}</span>
                          </div>

                          <div v-if="event.starting_time" class="d-flex align-center">
                            <v-icon class="me-2" size="18">mdi-clock-outline</v-icon>
                            <span>{{ formatTime(event.starting_time) }}</span>
                            <span v-if="event.ending_time">
                              - {{ formatTime(event.ending_time) }}</span
                            >
                          </div>

                          <div class="d-flex align-center">
                            <v-icon class="me-2" size="18">mdi-calendar-plus</v-icon>
                            <span
                              >Created {{ new Date(event.created_at).toLocaleDateString() }}</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="d-flex flex-column ga-2 ms-4">
                      <v-btn
                        v-if="event.source === 'announcement'"
                        @click="openEditDialog(event)"
                        color="primary"
                        variant="tonal"
                        size="small"
                        icon="mdi-pencil"
                      />
                      <v-btn
                        @click="openDeleteDialog(event)"
                        color="error"
                        variant="tonal"
                        size="small"
                        icon="mdi-delete"
                      />
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>

      <!-- Dialog Components -->
      <EventsEditDialog
        v-model:edit-dialog="editDialog"
        v-model:edit-form="editForm"
        :event-categories="eventCategories"
        :action-loading="actionLoading"
        @close-dialogs="closeDialogs"
        @update-event="updateEvent"
      />

      <EventsDeleteDialog
        v-model:delete-dialog="deleteDialog"
        :selected-event="selectedEvent"
        :action-loading="actionLoading"
        @close-dialogs="closeDialogs"
        @delete-event="deleteEvent"
      />

    </template>
  </AdminHeader>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  z-index: -2;
}

.floating-shape {
  position: fixed;
  border-radius: 50%;
  opacity: 0.1;
  z-index: -1;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  top: 10%;
  left: 10%;
  animation: float 20s infinite linear;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, #f093fb, #f5576c);
  top: 60%;
  right: 15%;
  animation: float 25s infinite linear reverse;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  bottom: 20%;
  left: 20%;
  animation: float 30s infinite linear;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes float {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateY(30px) rotate(240deg);
  }
  100% {
    transform: translateY(0px) rotate(360deg);
  }
}

.header-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
</style>
