<script setup>
import { ref, watch, computed } from 'vue'
import { useUsersStore } from '@/stores/usersData.js'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const usersStore = useUsersStore()
const error = ref(null)

const headers = [
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Joined Date', key: 'created_at', sortable: true }
]

const closeDialog = () => {
  emit('update:modelValue', false)
}

const loading = computed(() => usersStore.loading)
const members = computed(() => usersStore.users)

const fetchMembers = async () => {
  error.value = null
  try {
    await usersStore.fetchUsers()
  } catch (err) {
    console.error('Error fetching members:', err)
    error.value = 'Failed to load parish members'
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchMembers()
  }
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getEmailInitials = (email) => {
  if (!email) return '??'
  const slug = email.split('@')[0]
  const initials = slug.slice(0, 2).toUpperCase()
  return initials
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="closeDialog"
    max-width="1200"
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between bg-green">
        <div class="d-flex align-center">
          <v-icon class="mr-2" size="28">mdi-account-group</v-icon>
          <span class="text-h5">Parish Members</span>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-0">
        <v-alert v-if="error" type="error" variant="tonal" class="ma-4">
          {{ error }}
        </v-alert>

        <v-data-table
          :headers="headers"
          :items="members"
          :loading="loading"
          :items-per-page="10"
          class="elevation-0"
        >
          <!-- Email with Avatar -->
          <template v-slot:[`item.email`]="{ item }">
            <div class="d-flex align-center ga-3">
              <v-avatar size="40" :color="item.image_url ? undefined : 'primary'">
                <v-img v-if="item.image_url" :src="item.image_url" />
                <span v-else class="text-white font-weight-bold">
                  {{ getEmailInitials(item.email) }}
                </span>
              </v-avatar>
              <div class="text-body-2">{{ item.email || 'N/A' }}</div>
            </div>
          </template>

          <!-- Joined Date -->
          <template v-slot:[`item.created_at`]="{ item }">
            <div class="text-body-2">{{ formatDate(item.created_at) }}</div>
          </template>

          <template v-slot:loading>
            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
          </template>

          <template v-slot:no-data>
            <div class="text-center pa-4">
              <v-icon size="48" color="grey">mdi-account-off</v-icon>
              <p class="text-grey mt-2">No members found</p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-data-table {
  font-size: 0.875rem;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
