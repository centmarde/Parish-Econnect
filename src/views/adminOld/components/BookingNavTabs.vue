<script setup>
// Props
const props = defineProps({
  currentView: {
    type: String,
    default: 'all'
  }
})

// Emits
const emit = defineEmits(['update:currentView'])

// Methods
const setCurrentView = (view) => {
  emit('update:currentView', view)
}
</script>
<template>
 <!-- Navigation Tabs -->
          <div class="d-flex ga-2 mt-6 overflow-x-auto">
            <v-btn
              :class="['nav-tab', props.currentView === 'all' ? 'active' : '']"
              @click="setCurrentView('all')"
              variant="text"
            >
              <v-icon class="me-2">mdi-view-list</v-icon>
              All Bookings
            </v-btn>
            <v-btn
              :class="['nav-tab', props.currentView === 'wedding' ? 'active' : '']"
              @click="setCurrentView('wedding')"
              variant="text"
            >
              <v-icon class="me-2">mdi-heart</v-icon>
              Weddings
            </v-btn>
            <v-btn
              :class="['nav-tab', props.currentView === 'baptism' ? 'active' : '']"
              @click="setCurrentView('baptism')"
              variant="text"
            >
              <v-icon class="me-2">mdi-water</v-icon>
              Baptisms
            </v-btn>
            <v-btn
              :class="['nav-tab', props.currentView === 'funeral' ? 'active' : '']"
              @click="setCurrentView('funeral')"
              variant="text"
            >
              <v-icon class="me-2">mdi-cross</v-icon>
              Funerals
            </v-btn>
            <v-btn
              :class="['nav-tab', props.currentView === 'thanksgiving' ? 'active' : '']"
              @click="setCurrentView('thanksgiving')"
              variant="text"
            >
              <v-icon class="me-2">mdi-hands-pray</v-icon>
              Thanksgiving
            </v-btn>
            <v-btn
              :class="['nav-tab', props.currentView === 'announcements' ? 'active' : '']"
              @click="setCurrentView('announcements')"
              variant="text"
            >
              <v-icon class="me-2">mdi-bullhorn</v-icon>
              Announcements
            </v-btn>
          </div>
</template>
