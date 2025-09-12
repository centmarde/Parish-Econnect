

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  bookingDialog: Boolean,
  selectedBooking: Object,
  bookingConflicts: Array,
  bookingActionLoading: Boolean,
  authUser: Object,
  formatBookingDetails: Function,
  getEventColor: Function,
  getStatusColor: Function,
  getStatusText: Function
})

// Emits
const emit = defineEmits(['update:bookingDialog', 'update:selectedBooking', 'close', 'approve', 'deny', 'viewImages'])

// Local computed properties for v-model support
const bookingDialog = computed({
  get: () => props.bookingDialog,
  set: (value) => emit('update:bookingDialog', value)
})

const selectedBooking = computed({
  get: () => props.selectedBooking,
  set: (value) => emit('update:selectedBooking', value)
})

// Methods
const closeBookingDialog = () => {
  emit('close')
}

const handleApproveBooking = () => {
  emit('approve')
}

const handleDenyBooking = () => {
  emit('deny')
}

const viewImages = (booking) => {
  emit('viewImages', booking)
}
</script>

<template>
    <!-- Use the same Booking Details Dialog from AdminDashboard -->
      <v-dialog v-model="bookingDialog" max-width="800" persistent>
        <v-card v-if="selectedBooking" class="glass-card">
          <v-card-title class="d-flex align-center justify-space-between pa-6">
            <div class="d-flex align-center">
              <v-icon class="me-3" :color="props.getEventColor(selectedBooking.type)" size="32">
                {{
                  selectedBooking.type === 'wedding'
                    ? 'mdi-ring'
                    : selectedBooking.type === 'baptism'
                      ? 'mdi-water'
                      : selectedBooking.type === 'funeral'
                        ? 'mdi-cross'
                        : 'mdi-hands-pray'
                }}
              </v-icon>
              <div>
                <h2 class="text-h5 mb-1">{{ props.formatBookingDetails(selectedBooking).title }}</h2>
                <v-chip
                  :color="props.getEventColor(selectedBooking.type)"
                  size="small"
                  class="text-capitalize"
                >
                  {{ selectedBooking.type }}
                </v-chip>
              </div>
            </div>
            <v-btn icon="mdi-close" variant="text" @click="closeBookingDialog" />
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <v-row>
              <!-- Basic Information -->
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="me-2" color="primary">mdi-information</v-icon>
                  Basic Information
                </h3>

                <div class="mb-4">
                  <div class="text-caption text-grey-darken-1 mb-1">Event Date & Time</div>
                  <div class="text-body-1 font-weight-medium">
                    <v-icon class="me-2" size="18">mdi-calendar</v-icon>
                    {{ props.formatBookingDetails(selectedBooking).date }}
                    <v-icon class="me-2 ms-4" size="18">mdi-clock</v-icon>
                    {{ props.formatBookingDetails(selectedBooking).starting_time }} -
                    {{ props.formatBookingDetails(selectedBooking).ending_time }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-grey-darken-1 mb-1">Created On</div>
                  <div class="text-body-2">
                    {{ new Date(selectedBooking.created_at).toLocaleDateString() }}
                  </div>
                </div>

                <div class="mb-4">
                  <div class="text-caption text-grey-darken-1 mb-1">Status</div>
                  <v-chip :color="props.getStatusColor(selectedBooking)" size="small" variant="tonal">
                    {{ props.getStatusText(selectedBooking) }}
                  </v-chip>
                </div>

                <!-- Denial Reason (if booking was denied) -->
                <div v-if="selectedBooking.is_denied && selectedBooking.comment" class="mb-4">
                  <div class="text-caption text-grey-darken-1 mb-1">Denial Reason</div>
                  <v-alert
                    type="error"
                    variant="tonal"
                    density="compact"
                    :text="selectedBooking.comment"
                  />
                </div>
              </v-col>

              <!-- Type-specific Details (same as AdminDashboard) -->
              <v-col cols="12" md="6">
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="me-2" color="secondary">mdi-account-details</v-icon>
                  Details
                </h3>

                <!-- Wedding Details -->
                <div v-if="selectedBooking.type === 'wedding'">
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Bride</div>
                    <div class="text-body-1">
                      {{ selectedBooking.bride_firstname }} {{ selectedBooking.bride_lastname }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Groom</div>
                    <div class="text-body-1">
                      {{ selectedBooking.groom_firstname }} {{ selectedBooking.groom_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.title" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Event Title</div>
                    <div class="text-body-1">{{ selectedBooking.title }}</div>
                  </div>
                  <div v-if="selectedBooking.comment && !selectedBooking.is_denied" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Comments</div>
                    <div class="text-body-2">{{ selectedBooking.comment }}</div>
                  </div>
                </div>

                <!-- Baptism Details -->
                <div v-if="selectedBooking.type === 'baptism'">
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Child</div>
                    <div class="text-body-1">
                      {{ selectedBooking.child_firstname }} {{ selectedBooking.child_lastname }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Date of Birth</div>
                    <div class="text-body-2">
                      {{ new Date(selectedBooking.child_dob).toLocaleDateString() }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.parent_father_firstname" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Father</div>
                    <div class="text-body-2">
                      {{ selectedBooking.parent_father_firstname }}
                      {{ selectedBooking.parent_father_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.parent_mother_firstname" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Mother</div>
                    <div class="text-body-2">
                      {{ selectedBooking.parent_mother_firstname }}
                      {{ selectedBooking.parent_mother_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.godparent_firstname" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Godparent</div>
                    <div class="text-body-2">
                      {{ selectedBooking.godparent_firstname }}
                      {{ selectedBooking.godparent_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.additional_notes" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Additional Notes</div>
                    <div class="text-body-2">{{ selectedBooking.additional_notes }}</div>
                  </div>
                  <div v-if="selectedBooking.comment && !selectedBooking.is_denied" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Comments</div>
                    <div class="text-body-2">{{ selectedBooking.comment }}</div>
                  </div>
                </div>

                <!-- Funeral Details -->
                <div v-if="selectedBooking.type === 'funeral'">
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Deceased</div>
                    <div class="text-body-1">
                      {{ selectedBooking.deceased_firstname }}
                      {{ selectedBooking.deceased_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.deceased_dob" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Date of Birth</div>
                    <div class="text-body-2">
                      {{ new Date(selectedBooking.deceased_dob).toLocaleDateString() }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Date of Death</div>
                    <div class="text-body-2">
                      {{ new Date(selectedBooking.deceased_dod).toLocaleDateString() }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Contact Person</div>
                    <div class="text-body-1">
                      {{ selectedBooking.contact_firstname }} {{ selectedBooking.contact_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.relationship_to_deceased" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Relationship</div>
                    <div class="text-body-2">{{ selectedBooking.relationship_to_deceased }}</div>
                  </div>
                  <div v-if="selectedBooking.contact_phone" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Phone</div>
                    <div class="text-body-2">{{ selectedBooking.contact_phone }}</div>
                  </div>
                  <div v-if="selectedBooking.contact_email" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Email</div>
                    <div class="text-body-2">{{ selectedBooking.contact_email }}</div>
                  </div>
                  <div v-if="selectedBooking.comment && !selectedBooking.is_denied" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Comments</div>
                    <div class="text-body-2">{{ selectedBooking.comment }}</div>
                  </div>
                </div>

                <!-- Thanksgiving Details -->
                <div v-if="selectedBooking.type === 'thanksgiving'">
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Participant</div>
                    <div class="text-body-1">
                      {{ selectedBooking.participant_firstname }}
                      {{ selectedBooking.participant_lastname }}
                    </div>
                  </div>
                  <div v-if="selectedBooking.type_of_thanksgiving" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Type of Thanksgiving</div>
                    <div class="text-body-2 text-capitalize">
                      {{ selectedBooking.type_of_thanksgiving }}
                    </div>
                  </div>
                  <div class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Reason</div>
                    <div class="text-body-2">{{ selectedBooking.reason_for_thanksgiving }}</div>
                  </div>
                  <div v-if="selectedBooking.family_members_count" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Family Members Count</div>
                    <div class="text-body-2">{{ selectedBooking.family_members_count }}</div>
                  </div>
                  <div v-if="selectedBooking.comment && !selectedBooking.is_denied" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Comments</div>
                    <div class="text-body-2">{{ selectedBooking.comment }}</div>
                  </div>
                </div>

                <!-- Announcement Details -->
                <div
                  v-if="
                    selectedBooking.type === 'announcement' ||
                    selectedBooking.type === 'mass' ||
                    selectedBooking.type === 'event' ||
                    selectedBooking.type === 'celebration'
                  "
                >
                  <div v-if="selectedBooking.description" class="mb-3">
                    <div class="text-caption text-grey-darken-1 mb-1">Description</div>
                    <div class="text-body-2">{{ selectedBooking.description }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Conflict Warning -->
            <v-alert
              v-if="props.bookingConflicts && props.bookingConflicts.length > 0"
              type="warning"
              variant="tonal"
              class="mt-4"
              prominent
            >
              <v-alert-title class="d-flex align-center">
                <v-icon class="me-2">mdi-alert</v-icon>
                Schedule Conflict Detected!
              </v-alert-title>
              <div class="mt-2">
                <p class="mb-2">This booking conflicts with:</p>
                <div
                  v-for="conflict in props.bookingConflicts"
                  :key="conflict.id"
                  class="d-flex align-center mb-1"
                >
                  <v-chip :color="props.getEventColor(conflict.type)" size="small" class="me-2">
                    {{ conflict.type }}
                  </v-chip>
                  <span class="text-body-2"
                    >{{ conflict.name }} - {{ conflict.date }} at {{ conflict.starting_time }} -
                    {{ conflict.ending_time }}</span
                  >
                </div>
                <p class="mt-2 text-caption">
                  Please consider rescheduling or contact the conflicting party to resolve this
                  issue.
                </p>
              </div>
            </v-alert>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-6">
            <v-btn
              v-if="props.authUser.getBookingAttachedImages(selectedBooking).length > 0"
              color="info"
              variant="outlined"
              @click="viewImages(selectedBooking)"
              class="me-3"
            >
              <v-icon class="me-1">mdi-image-multiple</v-icon>
              View Images ({{ props.authUser.getBookingAttachedImages(selectedBooking).length }})
            </v-btn>
            <v-spacer />
            <v-btn variant="outlined" @click="closeBookingDialog" class="me-3"> Close </v-btn>
            <template
              v-if="
                selectedBooking.type !== 'announcement' &&
                selectedBooking.type !== 'mass' &&
                selectedBooking.type !== 'event' &&
                selectedBooking.type !== 'celebration' &&
                !selectedBooking.is_approved
              "
            >
              <v-btn
                color="error"
                variant="outlined"
                @click="handleDenyBooking"
                class="me-3"
                :disabled="bookingActionLoading"
              >
                <v-icon class="me-1">mdi-close</v-icon>
                Deny
              </v-btn>
              <v-btn color="success" @click="handleApproveBooking" :loading="bookingActionLoading">
                <v-icon class="me-1">mdi-check</v-icon>
                Approve
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>
