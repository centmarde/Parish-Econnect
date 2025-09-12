<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/utils/supabase.js'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import EventCalendar from './components/Calendar.vue'
import { useAdminDashboard } from './composables/adminDashboardCount.js'

// Use admin dashboard composable
const {
  stats,
  statsTrends,
  loading,
  error: dashboardError,
  loadDashboardData
} = useAdminDashboard()

const errorMessage = ref(null)

let subscriptions = []

// Load dashboard data on component mount
onMounted(async () => {
  try {
    await loadDashboardData()
    if (dashboardError.value) {
      errorMessage.value = dashboardError.value
    }
  } catch (err) {
    console.error('Error loading dashboard data:', err)
    errorMessage.value = 'Failed to load dashboard data. Please refresh the page.'
  }
})

onUnmounted(() => {
  subscriptions.forEach((sub) => {
    supabase.removeChannel(sub)
  })
})
</script>

<template>
  <PreloaderView v-if="loading" />
  <AdminHeader v-else>
    <template #content>
      <v-container fluid class="pa-4 pa-md-8 position-relative">
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>

        <!-- Stats Grid -->
        <v-row class="mb-6 mb-md-8">
          <v-col
            cols="6"
            sm="6"
            md="3"
            v-for="(stat, index) in [
              {
                value: stats.totalBookings,
                label: 'Total Bookings',
                icon: 'mdi-book-multiple',
                trend: statsTrends.totalBookings,
                gradient: { start: '#667eea', end: '#764ba2' },
              },
              {
                value: stats.pendingApprovals,
                label: 'Pending Approvals',
                icon: 'mdi-clock-alert',
                trend: statsTrends.pendingApprovals,
                gradient: { start: '#f093fb', end: '#f5576c' },
              },
              {
                value: stats.upcomingEvents,
                label: 'Upcoming Events',
                icon: 'mdi-calendar-check',
                trend: statsTrends.upcomingEvents,
                gradient: { start: '#4facfe', end: '#00f2fe' },
              },
              {
                value: stats.totalMembers,
                label: 'Parish Members',
                icon: 'mdi-account-group',
                trend: statsTrends.totalMembers,
                gradient: { start: '#43e97b', end: '#38f9d7' },
              },
            ]"
            :key="index"
          >
            <v-card
              :style="{
                background: `linear-gradient(135deg, ${stat.gradient.start}, ${stat.gradient.end})`,
                color: 'white'
              }"
              class="rounded-lg overflow-hidden position-relative elevation-4 transition-all-3"
              hover
            >
              <v-card-text class="text-center pa-3 pa-md-4 position-relative">
                <div
                  class="d-flex align-center justify-center mx-auto mb-2 rounded-lg"
                  :style="{
                    width: $vuetify.display.mobile ? '40px' : '48px',
                    height: $vuetify.display.mobile ? '40px' : '48px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }"
                >
                  <v-icon color="white" :size="$vuetify.display.mobile ? 24 : 32">{{
                    stat.icon
                  }}</v-icon>
                </div>
                <h2 class="text-h5 text-md-h4 text-lg-h3 mb-1 font-weight-bold"
                    :style="{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }">
                  {{ stat.value }}
                </h2>
                <p class="text-caption text-sm-body-2 mb-2 white--text">{{ stat.label }}</p>
                <div class="text-caption">
                  <span v-if="typeof stat.trend === 'number'" class="text-green-lighten-2"
                    >↑ {{ stat.trend }}%</span
                  >
                  <span v-else-if="stat.trend?.urgent" class="text-orange-lighten-2"
                    >● {{ stat.trend.urgent }} urgent</span
                  >
                  <span v-else-if="stat.trend?.next" class="white--text">Next: {{ stat.trend.next }}</span>
                  <span v-else-if="stat.trend?.value" class="text-green-lighten-2"
                    >↑ {{ stat.trend.value }} new</span
                  >
                  <span v-else class="white--text">from last month</span>
                </div>
                <!-- Overlay gradient for card shine effect -->
                <div
                  class="position-absolute"
                  :style="{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                    pointerEvents: 'none'
                  }"
                ></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Calendar Section -->
        <v-row class="mb-4">
          <v-col cols="12">
            <EventCalendar />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AdminHeader>
</template>


