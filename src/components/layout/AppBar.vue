<script setup>
import { useAuthUserStore } from '@/stores/authUser'
import { useNotificationStore } from '@/stores/notification'
import { onMounted, ref } from 'vue'

// Use Pinia Stores
const authStore = useAuthUserStore()
const notificationStore = useNotificationStore()

// Authentication state
const isLoggedIn = ref(false)


// Load functions during component mounting
onMounted(async () => {
  isLoggedIn.value = await authStore.isAuthenticated()
  await notificationStore.loadStoredNotifications()
})
</script>

<template>
  <v-bottom-navigation
    v-model="value"
    bg-color="light-blue-lighten-1"
    class="bottom-nav-bar d-flex d-sm-none"
    height="70"
    elevation="8"
    grow
  >
    <!-- HOME -->
    <v-btn
      value="home"
      class="bottom-nav-btn"
      to="/homepage"
      size="large"
    >
      <v-icon class="bottom-nav-icon" size="24">mdi-home</v-icon>
      <span class="bottom-nav-text">HOME</span>
    </v-btn>

    <!-- BOOK EVENT -->
    <v-btn
      value="book-event"
      class="bottom-nav-btn book-event-highlight"
      to="/book-event"
      size="large"
    >
      <v-icon class="bottom-nav-icon" size="24">mdi-calendar-plus</v-icon>
      <span class="bottom-nav-text">BOOK</span>
    </v-btn>

    <!-- EVENTS -->
    <v-btn
      value="events"
      class="bottom-nav-btn"
      to="/events"
      size="large"
    >
      <v-icon class="bottom-nav-icon" size="24">mdi-calendar-multiselect</v-icon>
      <span class="bottom-nav-text">EVENTS</span>
    </v-btn>

    <!-- NOTIFICATIONS -->
    <v-btn
      value="notifications"
      class="bottom-nav-btn"
      to="/notifications"
      size="large"
    >
      <v-badge
        :model-value="notificationStore.hasUnreadNotifications"
        :content="notificationStore.unreadCount"
        color="error"
        offset-x="5"
        offset-y="8"
        class="bottom-notification-badge"
      >
        <v-icon class="bottom-nav-icon" size="24">mdi-bell</v-icon>
      </v-badge>
      <span class="bottom-nav-text">ALERTS</span>
    </v-btn>

    <!-- THEME TOGGLE -->
  <!-- theme toggle removed -->
  </v-bottom-navigation>
</template>

<style scoped>
/* ===== BOTTOM NAVIGATION BAR ===== */
.bottom-nav-bar {
  backdrop-filter: blur(10px);
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-nav-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(227, 242, 253, 0.9) 0%, rgba(187, 222, 251, 0.9) 100%);
  z-index: -1;
}

/* ===== BOTTOM NAVIGATION BUTTONS ===== */
.bottom-nav-btn {
  position: relative;
  min-width: unset !important;
  width: 100%;
  height: 100% !important;
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  margin: 4px;
  text-transform: none;
  font-weight: 600;
}

.bottom-nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.4s ease;
}

.bottom-nav-btn:hover::before {
  left: 100%;
}

.bottom-nav-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.1) !important;
}

.bottom-nav-btn:active {
  transform: translateY(-1px);
}

/* ===== SPECIAL BOOK EVENT BUTTON ===== */
.book-event-highlight {
  background: linear-gradient(45deg, #2196f3, #1976d2) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.book-event-highlight:hover {
  background: linear-gradient(45deg, #1976d2, #1565c0) !important;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4);
}

/* ===== NAVIGATION ICONS ===== */
.bottom-nav-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1565c0;
  margin-bottom: 2px;
}

.bottom-nav-btn:hover .bottom-nav-icon {
  transform: scale(1.15) rotate(5deg);
  color: #0d47a1;
}

.book-event-highlight .bottom-nav-icon {
  color: white !important;
}

.book-event-highlight:hover .bottom-nav-icon {
  color: white !important;
  transform: scale(1.2) rotate(-5deg);
}

/* ===== NAVIGATION TEXT ===== */
.bottom-nav-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1565c0;
  margin-top: 2px;
  transition: all 0.3s ease;
}

.bottom-nav-btn:hover .bottom-nav-text {
  color: #0d47a1;
  font-weight: 700;
}

.book-event-highlight .bottom-nav-text {
  color: white !important;
}

.book-event-highlight:hover .bottom-nav-text {
  color: white !important;
}

/* ===== THEME TOGGLE BUTTON ===== */
.theme-btn .bottom-nav-icon {
  color: #ff9800;
}

.theme-btn:hover .bottom-nav-icon {
  color: #f57c00;
}

/* ===== NOTIFICATION BADGE ===== */
.bottom-notification-badge .v-badge__badge {
  animation: notificationPulse 2s infinite;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

/* ===== ANIMATIONS ===== */
@keyframes sunPulse {
  0%, 100% { 
    transform: scale(1);
    filter: brightness(1);
  }
  50% { 
    transform: scale(1.1);
    filter: brightness(1.2);
  }
}

@keyframes moonRotate {
  0%, 100% { 
    transform: rotate(0deg);
    filter: brightness(1);
  }
  50% { 
    transform: rotate(15deg);
    filter: brightness(1.1);
  }
}

@keyframes notificationPulse {
  0% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% { 
    transform: scale(1.1);
    box-shadow: 0 0 0 6px rgba(244, 67, 54, 0);
  }
  100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

/* ===== ACTIVE/SELECTED STATE ===== */
.v-btn--active {
  background: rgba(21, 101, 192, 0.15) !important;
}

.v-btn--active .bottom-nav-icon {
  color: #0d47a1 !important;
  transform: scale(1.1);
}

.v-btn--active .bottom-nav-text {
  color: #0d47a1 !important;
  font-weight: 700;
}

.book-event-highlight.v-btn--active {
  background: linear-gradient(45deg, #1976d2, #1565c0) !important;
}

.book-event-highlight.v-btn--active .bottom-nav-icon,
.book-event-highlight.v-btn--active .bottom-nav-text {
  color: white !important;
}

/* ===== DARK THEME ADJUSTMENTS ===== */
.v-theme--dark .bottom-nav-bar::before {
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(30, 64, 175, 0.9) 100%);
}

.v-theme--dark .bottom-nav-icon {
  color: #e3f2fd;
}

.v-theme--dark .bottom-nav-text {
  color: #e3f2fd;
}

.v-theme--dark .bottom-nav-btn:hover .bottom-nav-icon,
.v-theme--dark .bottom-nav-btn:hover .bottom-nav-text {
  color: #ffffff;
}

.v-theme--dark .v-btn--active .bottom-nav-icon,
.v-theme--dark .v-btn--active .bottom-nav-text {
  color: #ffffff !important;
}

.v-theme--dark .v-btn--active {
  background: rgba(227, 242, 253, 0.2) !important;
}

/* ===== RESPONSIVE ADJUSTMENTS ===== */
@media (max-width: 480px) {
  .bottom-nav-text {
    font-size: 10px;
  }
  
  .bottom-nav-icon {
    margin-bottom: 1px;
  }
  
  .bottom-nav-btn {
    margin: 2px;
  }
}

/* ===== ACCESSIBILITY ===== */
.bottom-nav-btn:focus {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.bottom-nav-btn:focus-visible {
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
}

/* ===== TOUCH INTERACTION ===== */
@media (hover: none) and (pointer: coarse) {
  .bottom-nav-btn:hover {
    transform: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .bottom-nav-btn:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
}
</style>