<script setup>
import { ref, watch, inject } from 'vue'

// Inject the shared composable instance from parent
const membersManagement = inject('membersManagement')

// Destructure needed properties from the composable
const {
  selectedMember,
  editMemberDialog,
  actionLoading,
  updateMemberInfo,
  nameRules,
  emailRules
} = membersManagement

// Local form state
const editForm = ref(null)
const formValid = ref(false)
const editedMember = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'user'
})

// Phone validation rules
const phoneRules = [
  v => !v || /^\+?[\d\s-()]+$/.test(v) || 'Phone number must be valid'
]

// Watch for dialog open and populate form
watch(() => editMemberDialog.value, (isOpen) => {
  if (isOpen && selectedMember.value) {
    editedMember.value = {
      first_name: selectedMember.value.first_name || '',
      last_name: selectedMember.value.last_name || '',
      email: selectedMember.value.email || '',
      phone: selectedMember.value.phone || '',
      role: selectedMember.value.role || 'user'
    }
  }
})

// Handle save
const handleSave = async () => {
  if (!formValid.value) return

  const { valid } = await editForm.value.validate()
  if (valid) {
    await updateMemberInfo(selectedMember.value.id, editedMember.value)
  }
}

// Handle cancel
const handleCancel = () => {
  editMemberDialog.value = false
  editForm.value?.reset()
}
</script>

<template>
  <!-- Edit Member Dialog -->
  <v-dialog v-model="editMemberDialog" max-width="600" persistent>
    <v-card>
      <v-card-title class="bg-primary pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-2">
            <v-icon color="on-primary">mdi-account-edit</v-icon>
            <span class="text-h6 text-on-primary">Edit Member</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="on-primary"
            :disabled="actionLoading"
            @click="handleCancel"
          />
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="editForm" v-model="formValid" @submit.prevent="handleSave">
          <v-row>
            <!-- First Name -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedMember.first_name"
                label="First Name"
                :rules="nameRules"
                :disabled="actionLoading"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account"
                required
              />
            </v-col>

            <!-- Last Name -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editedMember.last_name"
                label="Last Name"
                :rules="nameRules"
                :disabled="actionLoading"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account"
                required
              />
            </v-col>

            <!-- Email -->
            <v-col cols="12">
              <v-text-field
                v-model="editedMember.email"
                label="Email"
                type="email"
                :rules="emailRules"
                :disabled="actionLoading"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-email"
                required
              />
            </v-col>

            <!-- Phone -->
            <v-col cols="12">
              <v-text-field
                v-model="editedMember.phone"
                label="Phone Number"
                :rules="phoneRules"
                :disabled="actionLoading"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-phone"
                hint="Optional"
                persistent-hint
              />
            </v-col>

            <!-- Role -->
            <v-col cols="12">
              <v-select
                v-model="editedMember.role"
                label="Role"
                :items="[
                  { value: 'user', title: 'User', icon: 'mdi-account' },
                  { value: 'moderator', title: 'Moderator', icon: 'mdi-shield-check' },
                  { value: 'admin', title: 'Administrator', icon: 'mdi-shield-crown' }
                ]"
                :disabled="actionLoading"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-shield-account"
                required
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :icon="item.raw.icon" />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <!-- Info Alert -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mt-4"
            icon="mdi-information"
          >
            Changing the email or role will affect the member's access and permissions.
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 bg-surface-light">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="actionLoading"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="actionLoading"
          :disabled="!formValid"
          @click="handleSave"
        >
          <v-icon start>mdi-content-save</v-icon>
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
