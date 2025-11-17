<script setup>
import { ref, watch, computed } from 'vue'
import { useBaptismStore } from '@/stores/baptismBookingData.js'
import { useWeddingStore } from '@/stores/weddingBookingData.js'
import { useFuneralStore } from '@/stores/funeralBookingData.js'
import { useThanksGivingStore } from '@/stores/thanksGivingBookingData.js'
import { useOtherStore } from '@/stores/otherData.ts'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

// Initialize stores
const baptismStore = useBaptismStore()
const weddingStore = useWeddingStore()
const funeralStore = useFuneralStore()
const thanksgivingStore = useThanksGivingStore()
const otherStore = useOtherStore()

const error = ref(null)

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Type', key: 'booking_type', sortable: true },
  { title: 'Name', key: 'full_name', sortable: true },
  { title: 'Ref Number', key: 'ref_number', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Event Date', key: 'event_date', sortable: true }
]

const closeDialog = () => {
  emit('update:modelValue', false)
}

// Computed property for loading state
const loading = computed(() => {
  return baptismStore.loading || weddingStore.loading ||
         funeralStore.loading || thanksgivingStore.loading || otherStore.loading
})

// Computed property to combine all bookings
const bookings = computed(() => {
  const allBookings = [
    ...(baptismStore.bookings || []).map(b => ({
      ...b,
      booking_type: 'Baptism',
      full_name: `${b.child_firstname || ''} ${b.child_lastname || ''}`.trim(),
      status: b.is_denied ? 'denied' : b.is_approved ? 'approved' : 'pending',
      event_date: b.baptism_date
    })),
    ...(weddingStore.bookings || []).map(b => ({
      ...b,
      booking_type: 'Wedding',
      full_name: `${b.groom_firstname || ''} ${b.groom_lastname || ''} & ${b.bride_firstname || ''} ${b.bride_lastname || ''}`.trim(),
      status: b.is_denied ? 'denied' : b.is_approved ? 'approved' : 'pending',
      event_date: b.wedding_date
    })),
    ...(funeralStore.bookings || []).map(b => ({
      ...b,
      booking_type: 'Funeral',
      full_name: `${b.deceased_firstname || ''} ${b.deceased_lastname || ''}`.trim(),
      status: b.is_denied ? 'denied' : b.is_approved ? 'approved' : 'pending',
      event_date: b.funeral_date
    })),
    ...(thanksgivingStore.bookings || []).map(b => ({
      ...b,
      booking_type: 'Thanksgiving',
      full_name: b.title || b.organizer || 'N/A',
      status: b.is_denied ? 'denied' : b.is_approved ? 'approved' : 'pending',
      event_date: b.thanksgiving_date
    })),
    ...(otherStore.items || []).map(b => ({
      ...b,
      booking_type: 'Other',
      full_name: b.title || 'N/A',
      status: b.is_denied ? 'denied' : b.is_approved ? 'approved' : 'pending',
      event_date: b.date
    }))
  ]

  // Sort by event_date descending
  return allBookings.sort((a, b) =>
    new Date(b.event_date || 0) - new Date(a.event_date || 0)
  )
})

const fetchBookings = async () => {
  error.value = null
  try {
    // Fetch from all stores
    await Promise.all([
      baptismStore.fetchBookings(),
      weddingStore.fetchBookings(),
      funeralStore.fetchBookings(),
      thanksgivingStore.fetchBookings(),
      otherStore.fetchAll()
    ])
  } catch (err) {
    console.error('Error fetching bookings:', err)
    error.value = 'Failed to load bookings'
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchBookings()
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

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'success',
    rejected: 'error',
    completed: 'blue'
  }
  return colors[status?.toLowerCase()] || 'grey'
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
      <v-card-title class="d-flex align-center justify-space-between bg-primary">
        <div class="d-flex align-center">
          <v-icon class="mr-2" size="28">mdi-book-multiple</v-icon>
          <span class="text-h5">Total Bookings</span>
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
          :items="bookings"
          :loading="loading"
          :items-per-page="10"
          class="elevation-0"
        >
          <template v-slot:[`item.full_name`]="{ item }">
            <div class="font-weight-medium">{{ item.full_name || 'N/A' }}</div>
          </template>

          <template v-slot:[`item.booking_type`]="{ item }">
            <v-chip size="small" :color="
              item.booking_type === 'Baptism' ? 'blue' :
              item.booking_type === 'Wedding' ? 'pink' :
              item.booking_type === 'Funeral' ? 'purple' :
              'green'
            ">
              {{ item.booking_type }}
            </v-chip>
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <v-chip size="small" :color="getStatusColor(item.status)">
              {{ item.status || 'N/A' }}
            </v-chip>
          </template>

          <template v-slot:[`item.event_date`]="{ item }">
            {{ formatDate(item.event_date) }}
          </template>

          <template v-slot:loading>
            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
          </template>

          <template v-slot:no-data>
            <div class="text-center pa-4">
              <v-icon size="48" color="grey">mdi-inbox</v-icon>
              <p class="text-grey mt-2">No bookings found</p>
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
</style>
