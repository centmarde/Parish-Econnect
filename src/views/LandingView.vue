<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import AppLayout from '@/components/layout/AppLayout.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import AnnouncementGrid from '@/views/announcements/AnnouncementGrid.vue'
import AnnouncementSearchBar from '@/views/announcements/AnnouncementSearchBar.vue'
import AnnouncementPagination from '@/views/announcements/AnnouncementPagination.vue'
import CalendarViewer from '@/views/announcements/CalendarViewer.vue'
import CalendarDialog from '@/views/announcements/CalendarDialog.vue'
import ContactsWidget from '@/views/adminOld/components/ContactsWidget.vue'
import { useAnnouncementServices } from '@/views/announcements/announcementServices'

// Router for navigation
const router = useRouter()

// Vuetify display breakpoints
const { mobile, xs, sm, mdAndUp } = useDisplay()

// Use the announcement services composable
const {
  paginatedAnnouncements,
  loading,
  searchQuery,
  showPastAnnouncements,
  currentPage,
  itemsPerPage,
  totalItems,
  searchAnnouncements,
  selectAnnouncement,
  setCurrentPage,
  setItemsPerPage
} = useAnnouncementServices()

// Calendar dialog state
const showCalendarDialog = ref(false)

// Computed property for announcements to display (always use paginated)
const displayedAnnouncements = computed(() => {
  return paginatedAnnouncements.value
})

// Event handlers
const handleSearchUpdate = (query) => {
  searchAnnouncements(query)
  setCurrentPage(1) // Reset to first page when searching
}

const handlePastToggleUpdate = (showPast) => {
  showPastAnnouncements.value = showPast
  setCurrentPage(1) // Reset to first page when filtering
}

const handleAnnouncementSelect = (announcement) => {
  selectAnnouncement(announcement.id)
  // You can add navigation logic here, e.g., router.push to announcement details
  console.log('Selected announcement:', announcement)
}

const handlePageChange = (page) => {
  setCurrentPage(page)
}

const handleItemsPerPageChange = (items) => {
  setItemsPerPage(items)
}

const handleShowSchedules = () => {
  showCalendarDialog.value = true
}

const handleBookNow = () => {
  router.push('/auth')
}
</script>

<template>
  <PreloaderView></PreloaderView>
  <AppLayout>
    <template #content>
      <!-- Hero Section with Contact Info -->
      <v-container fluid class="pa-0">
        <v-row no-gutters>
          <v-col cols="12">
            <v-sheet
              :min-height="mobile ? '70vh' : '80vh'"
              class="d-flex align-center hero-background"
            >
              <v-container>
                <v-row align="center" class="fill-height">
                  <!-- Left Column - Hero Content -->
                  <v-col cols="12" md="6" class="text-center text-md-left">
                    <v-card
                      flat
                      color="transparent"
                      class="pa-4"
                    >
                      <v-card-title
                        class="text-white font-weight-bold text-shadow"
                        :class="{
                          'text-h5 justify-center': xs,
                          'text-h4 justify-center': sm,
                          'text-h4 justify-start': mdAndUp
                        }"
                      >
                        Welcome to Our Parish Community
                      </v-card-title>

                      <v-card-text
                        class="text-white mt-4 px-0"
                        :class="mobile ? 'text-body-1' : 'text-h6'"
                      >
                        Join us in faith, service, and unity. Together, we celebrate our spiritual journey.
                      </v-card-text>

                      <v-card-actions
                        class="px-0 mt-6"
                        :class="mobile ? 'justify-center' : 'justify-start'"
                      >
                        <v-btn
                          :size="mobile ? 'default' : 'large'"
                          variant="flat"
                          color="white"
                          :class="mobile ? 'text-primary mr-2' : 'text-primary mr-4'"
                          elevation="2"
                          rounded
                          @click="handleBookNow"
                        >
                          Book Now
                        </v-btn>

                        <v-btn
                          :size="mobile ? 'default' : 'large'"
                          variant="outlined"
                          color="white"
                          class="text-white"
                          rounded
                          @click="handleShowSchedules"
                        >
                          Show Schedules
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>

                  <!-- Right Column - Contact Information -->
                  <v-col cols="12" md="6">
                    <ContactsWidget />
                  </v-col>
                </v-row>
              </v-container>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>      <!-- Announcements Section -->
      <v-container :class="mobile ? 'py-8' : 'py-12'">
        <v-row>
          <v-col cols="12">
            <!-- Section Header -->
            <v-container :class="mobile ? 'text-center mb-6' : 'text-center mb-8'">
              <v-row justify="center">
                <v-col cols="12" md="8">
                  <v-card flat color="transparent">
                    <v-card-title
                      class="text-primary mb-4 justify-center"
                      :class="{
                        'text-h5': xs,
                        'text-h4': sm,
                        'text-h3': mdAndUp
                      }"
                    >
                      Parish Announcements
                    </v-card-title>
                    <v-card-text
                      class="text-grey-darken-1"
                      :class="mobile ? 'text-body-1' : 'text-h6'"
                    >
                      Stay updated with our latest news and upcoming events
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>

            <!-- Search Bar -->
            <AnnouncementSearchBar
              v-model="searchQuery"
              :loading="loading"
              :show-past-announcements="showPastAnnouncements"
              placeholder="Search announcements..."
              @update:model-value="handleSearchUpdate"
              @update:show-past-announcements="handlePastToggleUpdate"
            />

            <!-- Announcements Grid -->
            <AnnouncementGrid
              :announcements="displayedAnnouncements"
              :loading="loading"
              :max-display="0"
              @select="handleAnnouncementSelect"
            />

            <!-- Pagination (always show) -->
            <AnnouncementPagination
              :current-page="currentPage"
              :total-items="totalItems"
              :items-per-page="itemsPerPage"
              :loading="loading"
              @update:current-page="handlePageChange"
              @update:items-per-page="handleItemsPerPageChange"
            />

          </v-col>
        </v-row>
      </v-container>

      <!-- Additional Sections can be added here -->
      <!-- For example: Services, Events, Contact, etc. -->
 <CalendarViewer />

      <!-- Calendar Dialog -->
      <CalendarDialog v-model="showCalendarDialog" />
    </template>

    <!-- Floating Calendar Icon -->

  </AppLayout>
</template>

<style scoped>
/* Minimal scoped CSS for hero background - cannot be achieved with Vuetify utilities alone */
.hero-background {
  background-image:
    linear-gradient(rgba(25, 118, 210, 0.7), rgba(66, 165, 245, 0.7)),
    url('/bookevent-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
