<script setup>
import { inject } from 'vue'

// Inject the shared composable instance from parent
const membersManagement = inject('membersManagement')

// Destructure needed properties from the composable
const {
  selectedMember,
  memberDialog,
  getRoleColor,
  getBookingTypeColor
} = membersManagement
</script>

<template>
  <!-- View Member Details Dialog -->
  <v-dialog v-model="memberDialog" max-width="800" scrollable>
    <v-card v-if="selectedMember">
      <v-card-title class="d-flex align-center justify-space-between bg-primary pa-4">
        <div class="d-flex align-center ga-3">
          <v-avatar size="48" :color="selectedMember.image_url ? undefined : 'surface'">
            <v-img v-if="selectedMember.image_url" :src="selectedMember.image_url" />
            <span v-else class="text-primary font-weight-bold">
              {{ (selectedMember.first_name?.[0] || '') + (selectedMember.last_name?.[0] || '') }}
            </span>
          </v-avatar>
          <div>
            <div class="text-h6 text-on-primary">
              {{ selectedMember.first_name }} {{ selectedMember.last_name }}
            </div>
            <v-chip
              :color="getRoleColor(selectedMember.role)"
              size="small"
              variant="tonal"
              class="text-capitalize mt-1"
            >
              <v-icon start size="14">
                {{
                  selectedMember.role === 'admin'
                    ? 'mdi-shield-crown'
                    : selectedMember.role === 'moderator'
                      ? 'mdi-shield-check'
                      : 'mdi-account'
                }}
              </v-icon>
              {{ selectedMember.role }}
            </v-chip>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" color="on-primary" @click="memberDialog = false" />
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Personal Information Section -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-account-details</v-icon>
            Personal Information
          </h3>
          <v-list density="compact" class="bg-transparent">
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-email</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">Email</v-list-item-title>
              <v-list-item-subtitle>{{ selectedMember.email }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item v-if="selectedMember.phone">
              <template #prepend>
                <v-icon>mdi-phone</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">Phone</v-list-item-title>
              <v-list-item-subtitle>{{ selectedMember.phone }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>

        <v-divider class="my-4" />

        <!-- Account Information Section -->
        <div class="mb-6">
          <h3 class="text-h6 mb-4 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-information</v-icon>
            Account Information
          </h3>
          <v-list density="compact" class="bg-transparent">
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-calendar-account</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">Member Since</v-list-item-title>
              <v-list-item-subtitle>
                {{ new Date(selectedMember.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon>mdi-login</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">Last Sign In</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedMember.last_sign_in
                  ? new Date(selectedMember.last_sign_in).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Never'
                }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>

        <v-divider class="my-4" />

        <!-- Booking Statistics Section -->
        <div>
          <h3 class="text-h6 mb-4 d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-calendar-check</v-icon>
            Booking Statistics
          </h3>

          <v-row>
            <v-col cols="6" sm="3">
              <v-card class="text-center pa-4 bg-surface-light" elevation="0">
                <div class="text-h4 font-weight-bold text-primary">
                  {{ selectedMember.bookings?.total || 0 }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">Total Bookings</div>
              </v-card>
            </v-col>

            <v-col cols="6" sm="3">
              <v-card class="text-center pa-4 bg-surface-light" elevation="0">
                <div class="text-h4 font-weight-bold text-success">
                  {{ selectedMember.bookings?.approved || 0 }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">Approved</div>
              </v-card>
            </v-col>

            <v-col cols="6" sm="3">
              <v-card class="text-center pa-4 bg-surface-light" elevation="0">
                <div class="text-h4 font-weight-bold text-warning">
                  {{ selectedMember.bookings?.pending || 0 }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">Pending</div>
              </v-card>
            </v-col>

            <v-col cols="6" sm="3">
              <v-card class="text-center pa-4 bg-surface-light" elevation="0">
                <div class="text-h4 font-weight-bold text-error">
                  {{ selectedMember.bookings?.denied || 0 }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">Denied</div>
              </v-card>
            </v-col>
          </v-row>          <!-- Booking Type Breakdown -->
          <div v-if="selectedMember.bookings?.byType" class="mt-4">
            <h4 class="text-subtitle-1 mb-3">Bookings by Type</h4>
            <v-list density="compact" class="bg-transparent">
              <v-list-item
                v-for="(count, type) in selectedMember.bookings.byType"
                :key="type"
              >
                <template #prepend>
                  <v-chip
                    :color="getBookingTypeColor(type)"
                    size="small"
                    variant="flat"
                    class="text-capitalize"
                  >
                    {{ type }}
                  </v-chip>
                </template>
                <v-list-item-title>{{ count }} booking{{ count !== 1 ? 's' : '' }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 bg-surface-light">
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="memberDialog = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
