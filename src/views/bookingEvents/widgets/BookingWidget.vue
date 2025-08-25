<script setup>
import { getEventItems, cleanEventName, isWeddingEvent } from '../functions/helpers'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const items = getEventItems()
const isVisible = ref(false)
const router = useRouter()

onMounted(() => {
  // animate in effect para sa more engaging experience
  setTimeout(() => {
    isVisible.value = true
  }, 200)
})

// Handle booking action for each item. If the item is the wedding event,
// redirect directly to the wedding form route.
const handleBooking = (item) => {
  if (!item) return

  if (isWeddingEvent(item)) {
    // direct navigation to the wedding form
    router.push('/wedding-mass-form')
    return
  }

  // Fallback behavior for other items - open dialog or continue booking flow
  // For now just log selection; other flows can be implemented later.
  console.log('Selected booking item:', item)
}
</script>

<template>
  <div 
    class="booking-widget-container pa-0"
    :class="{ 'animate-in': isVisible }"
  >
    <!-- Header Section with enhanced styling -->
    <div class="text-center mb-6">
      <v-chip
        color="primary"
        variant="outlined"
        size="small"
        class="mb-3"
        prepend-icon="mdi-calendar-heart"
      >
        Quick Booking
      </v-chip>
      <h2 class="text-h5 font-weight-bold text-gradient mb-2">
        Choose Your Event
      </h2>
      <p class="text-body-2 text-medium-emphasis text-center">
        Select ang event nga gusto nimo i-book para sa inyong pamilya
      </p>
    </div>

    <!-- Mobile: 2 rows x 2 columns, Desktop: 1 row x 4 columns -->
    <v-row class="g-4">
      <v-col 
        v-for="(item, index) in items" 
        :key="item.name" 
        cols="6" 
        md="3"
        class="event-card-col"
        :style="{ '--delay': `${index * 100}ms` }"
      >
        <div
          :class="[item.color, 'event-card']"

          class="h-100 d-flex flex-column"
        >
          <v-card-text class="pa-4 text-center flex-grow-1 d-flex flex-column">
            <!-- Icon with pulsing effect -->
            <div class="icon-container mb-3">
              <v-icon 
                :icon="item.icon" 
                size="40" 
                color="primary" 
                class="event-icon"
              />
            </div>

            <!-- Event name with better typography -->
            <h3 class="text-subtitle-1 font-weight-bold mb-2 event-title">
              {{ cleanEventName(item.name) }}
            </h3>

            <!-- Description -->
            <p >
              {{ item.description }}
            </p>

            <!-- Book button with enhanced styling -->
            <v-btn
              color="primary"
              size="small"
              variant="contained"
              rounded="pill"
              class="book-btn elevation-4"
              prepend-icon="mdi-calendar-plus"
              @click.prevent="handleBooking(item)"
            >
              Book Now
            </v-btn>
          </v-card-text>
        </div>
      </v-col>
    </v-row>
  </div>

</template>

<style scoped>
/* Main container with enhanced styling - no card wrapper */
.booking-widget-container {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.booking-widget-container.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Header gradient text effect */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Event card column with staggered animation */
.event-card-col {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: var(--delay);
}

.animate-in .event-card-col {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Enhanced event card styling */
.event-card {
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 200px;
}

.event-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
}

/* Icon container with pulsing effect */
.icon-container {
  position: relative;
  display: inline-block;
}

.event-icon {
  transform: scale(1);
  transition: all 0.3s ease;
}

.event-card:hover .event-icon {
  transform: scale(1.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1.1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1.1); }
}



.event-card:hover .event-title {
  color: #1976d2;
}

/* Enhanced button styling */
.book-btn {
  transform: scale(1);
  transition: all 0.2s ease;
  font-weight: 600;
  /* push the button to the bottom of the flex column */
  margin-top: auto;
}

.event-card:hover .book-btn {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(25, 118, 210, 0.3) !important;
}

/* Mobile responsiveness - 2 rows x 2 columns */
@media (max-width: 768px) {
  .event-card {
    min-height: 180px;
  }
  
  .event-icon {
    font-size: 32px !important;
  }
  
  .event-title {
    font-size: 0.95rem;
  }
  
  .booking-widget-container {
    margin: 0 8px;
  }
}

@media (max-width: 600px) {
  .event-card {
    min-height: 160px;
  }
  
  .event-icon {
    font-size: 28px !important;
  }
  
  .event-title {
    font-size: 0.9rem;
  }
  
  .book-btn {
    font-size: 0.75rem;
    padding: 4px 12px;
  }
}


</style>
