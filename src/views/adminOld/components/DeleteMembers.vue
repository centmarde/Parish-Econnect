<script setup>
import { inject } from 'vue'

// Inject the shared composable instance from parent
const membersManagement = inject('membersManagement')

// Destructure needed properties from the composable
const {
  confirmDeleteDialog,
  memberToDelete,
  deleteLoading,
  deleteMember
} = membersManagement

// Handle delete confirmation
const handleDelete = async () => {
  await deleteMember()
}

// Handle cancel
const handleCancel = () => {
  confirmDeleteDialog.value = false
}
</script>

<template>
  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="confirmDeleteDialog" max-width="500" persistent>
    <v-card>
      <v-card-title class="bg-error pa-4">
        <div class="d-flex align-center ga-2">
          <v-icon color="on-error" size="28">mdi-alert-circle</v-icon>
          <span class="text-h6 text-on-error">Confirm Delete Member</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <div v-if="memberToDelete">
          <!-- Warning Message -->
          <v-alert
            type="error"
            variant="tonal"
            prominent
            class="mb-4"
            icon="mdi-alert"
          >
            <div class="text-h6 mb-2">This action cannot be undone!</div>
            <div class="text-body-2">
              All data associated with this member will be permanently deleted.
            </div>
          </v-alert>

          <!-- Member Info -->
          <div class="d-flex align-center ga-4 pa-4 bg-surface-light rounded">
            <v-avatar size="56" :color="memberToDelete.image_url ? undefined : 'error'">
              <v-img v-if="memberToDelete.image_url" :src="memberToDelete.image_url" />
              <span v-else class="text-on-error text-h6 font-weight-bold">
                {{ (memberToDelete.first_name?.[0] || '') + (memberToDelete.last_name?.[0] || '') }}
              </span>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-h6 font-weight-semibold">
                {{ memberToDelete.first_name }} {{ memberToDelete.last_name }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ memberToDelete.email }}
              </div>
              <v-chip
                :color="memberToDelete.role === 'admin' ? 'purple' : memberToDelete.role === 'moderator' ? 'blue' : undefined"
                size="small"
                variant="tonal"
                class="text-capitalize mt-1"
              >
                {{ memberToDelete.role }}
              </v-chip>
            </div>
          </div>

          <!-- Additional Info -->
          <v-list density="compact" class="bg-transparent mt-4">
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-calendar-check</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">Total Bookings</v-list-item-title>
              <v-list-item-subtitle>{{ memberToDelete.bookings?.total || 0 }} booking(s)</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon>mdi-calendar-account</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">Member Since</v-list-item-title>
              <v-list-item-subtitle>
                {{ new Date(memberToDelete.created_at).toLocaleDateString() }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <!-- Warning Note -->
          <div class="mt-4 pa-3 bg-error-lighten rounded">
            <div class="d-flex align-start ga-2">
              <v-icon color="error" size="20">mdi-information</v-icon>
              <div class="text-body-2 text-medium-emphasis">
                <strong>Note:</strong> Deleting this member will also remove:
                <ul class="mt-2">
                  <li>All booking history</li>
                  <li>User account and authentication data</li>
                  <li>Associated role and permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 bg-surface-light">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="deleteLoading"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          :loading="deleteLoading"
          @click="handleDelete"
        >
          <v-icon start>mdi-delete</v-icon>
          Delete Member
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
