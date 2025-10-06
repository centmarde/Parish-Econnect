<script setup>
import { ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import AnnouncementSearchBar from '@/views/announcements/AnnouncementSearchBar.vue'
import AnnouncementGrid from '@/views/announcements/AnnouncementGrid.vue'
import AnnouncementPagination from '@/views/announcements/AnnouncementPagination.vue'
import AnnouncementAddDialog from '@/views/admin/dialogs/AnnouncementAddDialog.vue'
import EditAnnouncementDialog from '@/views/admin/dialogs/EditAnnouncementDialog.vue'
import DeleteConfirmationAnnouncementDialog from '@/views/admin/dialogs/DeleteConfirmationAnnouncementDialog.vue'
import { useAnnouncementServices } from '@/views/announcements/announcementServices'

// Composables
const { mobile } = useDisplay()
const announcementServices = useAnnouncementServices()

// Destructure what we need from the services
const {
  paginatedAnnouncements,
  loading,
  searchQuery,
  showPastAnnouncements,
  currentPage,
  itemsPerPage,
  totalItems,
  searchAnnouncements,
  setCurrentPage,
  formatDate,
  formatTime
} = announcementServices

// Component-specific reactive state
const selectedAnnouncement = ref(null)
const showAnnouncementDialog = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const announcementToEdit = ref(null)
const announcementToDelete = ref(null)

// Watch for search changes to reset pagination
watch([searchQuery, showPastAnnouncements], () => {
  setCurrentPage(1)
})

// Methods
const handleAnnouncementSelect = (announcement) => {
  selectedAnnouncement.value = announcement
  showAnnouncementDialog.value = true
}

const handleAnnouncementEdit = (announcement) => {
  announcementToEdit.value = announcement
  showEditDialog.value = true
}

const handleAnnouncementDelete = (announcement) => {
  announcementToDelete.value = announcement
  showDeleteDialog.value = true
}

const handleSearchClear = () => {
  searchAnnouncements('')
  setCurrentPage(1)
}

const handleAddAnnouncement = () => {
  showAddDialog.value = true
}

const handleAnnouncementCreated = (announcement) => {
  console.log('New announcement created:', announcement)
  // The services will automatically refresh the data
}

const handleAnnouncementUpdated = (announcement) => {
  console.log('Announcement updated:', announcement)
  // The services will automatically refresh the data
}

const handleAnnouncementDeleted = (announcement) => {
  console.log('Announcement deleted:', announcement)
  // The services will automatically refresh the data
}
</script>

<template>
  <AdminHeader>
    <template #content>
      <div class="announcement-view">
        <!-- Page Header -->
        <v-row class="mb-6">
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between flex-wrap">
              <div class="page-header-content">
                <h1 class="text-h4 font-weight-bold text-primary mb-2">
                  <v-icon size="large" class="mr-3">mdi-bullhorn</v-icon>
                  Announcements Management
                </h1>
                <p class="text-body-1 text-grey-darken-1 ma-0">
                  Manage parish announcements and upcoming events
                </p>
              </div>

              <div class="page-actions">
                <v-btn
                  color="primary"
                  size="large"
                  variant="elevated"
                  :class="mobile ? 'mb-3' : ''"
                  @click="handleAddAnnouncement"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Add Announcement
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Search Bar -->
        <AnnouncementSearchBar
          v-model="searchQuery"
          v-model:show-past-announcements="showPastAnnouncements"
          :loading="loading"
          placeholder="Search announcements by title or description..."
          @clear="handleSearchClear"
        />

        <!-- Announcements Grid -->
        <AnnouncementGrid
          :announcements="paginatedAnnouncements"
          :loading="loading"
          show-actions
          @select="handleAnnouncementSelect"
          @edit="handleAnnouncementEdit"
          @delete="handleAnnouncementDelete"
        />

        <!-- Pagination -->
        <AnnouncementPagination
          v-if="totalItems > 0"
          v-model:current-page="currentPage"
          v-model:items-per-page="itemsPerPage"
          :total-items="totalItems"
          :loading="loading"
        />

        <!-- Empty State when no results -->
        <v-card
          v-if="!loading && totalItems === 0 && (searchQuery || !showPastAnnouncements)"
          class="pa-8 text-center elevation-1 mt-4"
        >
          <v-icon
            size="64"
            color="grey-lighten-1"
            class="mb-4"
          >
            mdi-file-search-outline
          </v-icon>
          <h3 class="text-h5 text-grey-darken-1 mb-2">
            No Results Found
          </h3>
          <p class="text-body-1 text-grey mb-4">
            <span v-if="searchQuery">
              No announcements found for "{{ searchQuery }}"
            </span>
            <span v-else-if="!showPastAnnouncements">
              No upcoming announcements found
            </span>
          </p>
          <v-btn
            color="primary"
            variant="outlined"
            @click="handleSearchClear"
          >
            <v-icon start>mdi-refresh</v-icon>
            Clear Filters
          </v-btn>
        </v-card>

        <!-- Announcement Detail Dialog -->
        <v-dialog
          v-model="showAnnouncementDialog"
          max-width="800px"
          scrollable
        >
          <v-card v-if="selectedAnnouncement" class="announcement-detail-dialog">
            <!-- Dialog Header -->
            <v-card-title class="pa-6 pb-3">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="flex-grow-1">
                  <h2 class="text-h5 font-weight-bold text-primary">
                    {{ selectedAnnouncement.title || 'Untitled Announcement' }}
                  </h2>
                </div>
                <v-btn
                  icon
                  variant="text"
                  @click="showAnnouncementDialog = false"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </v-card-title>

            <v-divider />

            <!-- Dialog Content -->
            <v-card-text class="pa-6">
              <!-- Date and Time Info -->
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-3">mdi-calendar</v-icon>
                    <div>
                      <div class="text-body-2 text-grey-darken-1">Date</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ formatDate(selectedAnnouncement.date) }}
                      </div>
                    </div>
                  </div>
                </v-col>

                <v-col
                  v-if="selectedAnnouncement.starting_time || selectedAnnouncement.ending_time"
                  cols="12"
                  md="6"
                >
                  <div class="d-flex align-center mb-2">
                    <v-icon color="primary" class="mr-3">mdi-clock-outline</v-icon>
                    <div>
                      <div class="text-body-2 text-grey-darken-1">Time</div>
                      <div class="text-body-1 font-weight-medium">
                        <span v-if="selectedAnnouncement.starting_time">
                          {{ formatTime(selectedAnnouncement.starting_time) }}
                        </span>
                        <span v-if="selectedAnnouncement.starting_time && selectedAnnouncement.ending_time">
                          -
                        </span>
                        <span v-if="selectedAnnouncement.ending_time">
                          {{ formatTime(selectedAnnouncement.ending_time) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Description -->
              <div v-if="selectedAnnouncement.description">
                <h3 class="text-h6 mb-3 text-primary">
                  <v-icon class="mr-2">mdi-text</v-icon>
                  Description
                </h3>
                <p class="text-body-1" style="line-height: 1.6; white-space: pre-wrap;">
                  {{ selectedAnnouncement.description }}
                </p>
              </div>

              <div v-else class="text-center text-grey font-italic">
                <v-icon size="large" color="grey-lighten-1" class="mb-2">
                  mdi-text-box-outline
                </v-icon>
                <p>No description provided for this announcement</p>
              </div>
            </v-card-text>

            <!-- Dialog Actions -->
            <v-divider />
            <v-card-actions class="pa-6">
              <v-spacer />
              <v-btn
                color="grey"
                variant="text"
                @click="showAnnouncementDialog = false"
              >
                Close
              </v-btn>
              <v-btn
                color="primary"
                variant="outlined"
                @click="handleAnnouncementEdit(selectedAnnouncement)"
              >
                <v-icon start>mdi-pencil</v-icon>
                Edit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Add Announcement Dialog -->
        <AnnouncementAddDialog
          v-model="showAddDialog"
          @announcement-created="handleAnnouncementCreated"
        />

        <!-- Edit Announcement Dialog -->
        <EditAnnouncementDialog
          v-model="showEditDialog"
          :announcement="announcementToEdit"
          @announcement-updated="handleAnnouncementUpdated"
        />

        <!-- Delete Confirmation Dialog -->
        <DeleteConfirmationAnnouncementDialog
          v-model="showDeleteDialog"
          :announcement="announcementToDelete"
          @announcement-deleted="handleAnnouncementDeleted"
        />
      </div>
    </template>
  </AdminHeader>
</template>

<style scoped>
.announcement-view {
  min-height: 100vh;
}

.page-header-content {
  flex: 1;
}

.page-actions {
  flex-shrink: 0;
}

.announcement-detail-dialog {
  max-height: 90vh;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .page-header-content {
    text-align: center;
    margin-bottom: 16px;
  }

  .page-actions {
    width: 100%;
    text-align: center;
  }

  .announcement-view h1 {
    font-size: 1.5rem !important;
  }
}

@media (max-width: 959px) {
  .d-flex.align-center.justify-space-between.flex-wrap {
    flex-direction: column;
    align-items: center !important;
  }
}
</style>
