<script setup>
import { useAuthUserStore } from '@/stores/authUser'
import { useNotificationStore } from '@/stores/notification'
import ProfileHeader from '@/components/layout/ProfileHeader.vue'
import { onMounted } from 'vue'

// Use Pinia Stores
const authStore = useAuthUserStore()
const notificationStore = useNotificationStore()

import { ref, computed } from 'vue'
const theme = ref(localStorage.getItem('theme') ?? 'light')

const isDark = computed({
  get: () => theme.value === 'dark',
  set: (val) => {
    theme.value = val ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
  },
})

const isLoggedIn = ref(false)
const drawer = ref(false)

function onClick() {
  localStorage.setItem('theme', theme.value)
}
import { useDisplay } from 'vuetify'
const { mobile, mdAndDown } = useDisplay()

// Load Functions during component rendering
onMounted(async () => {
  isLoggedIn.value = await authStore.isAuthenticated()
  await notificationStore.loadStoredNotifications()
  //isMobileLogged.value = mobile.value && isLoggedIn.value
  //isDesktop.value = !mobile.value && (isLoggedIn.value || !isLoggedIn.value)
})
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme">
      <v-app-bar
        class="px-6 navbar-main"
        :color="theme === 'light' ? 'light-blue-lighten-1' : 'light-blue-accent-4'"
        border
        elevation="4"
        height="70"
      >
        <!-- LOGO + HEADER -->
        <div class="d-flex align-center logo-section">
          <div class="logo-container">
            <v-img 
              src="logo.png" 
              :width="mobile ? '40px' : '50px'" 
              class="me-3 logo-image" 
              cover 
            />
          </div>
          <div class="header-text-container">
            <h2 :class="mdAndDown ? 'small-header' : 'large-header'" class="ma-0 header">
              SAN ISIDRO LABRADOR PARISH
            </h2>
            <p v-if="!mobile" class="parish-subtitle ma-0">Faith • Community • Service</p>
          </div>
        </div>

        <v-spacer></v-spacer>

        <!-- Desktop Nav -->
        <div v-if="!mdAndDown" class="d-flex align-center nav">
          <div class="d-flex nav nav-items-container">
            <RouterLink to="/homepage" class="router-link">
              <v-btn 
                class="mr-3 nav-btn home-btn-nav" 
                variant="outlined"
                size="large"
                rounded="lg"
              >
                <v-icon class="nav-icon me-2">mdi-home</v-icon>
                <span class="nav-text">HOME</span>
                <v-ripple />
              </v-btn>
            </RouterLink>

            <RouterLink to="/book-event" class="router-link">
              <v-btn 
                class="mr-3 nav-btn book-event-btn" 
                variant="elevated"
                size="large"
                rounded="lg"
                color="primary"
              >
                <v-icon class="nav-icon me-2">mdi-calendar-plus</v-icon>
                <span class="nav-text">BOOK EVENT</span>
                <v-ripple />
              </v-btn>
            </RouterLink>

            <!-- EVENTS TAB -->
            <RouterLink to="/events" class="router-link">
              <v-btn 
                class="mr-3 nav-btn events-btn" 
                variant="outlined"
                size="large"
                rounded="lg"
              >
                <v-icon class="nav-icon me-2">mdi-calendar-multiselect</v-icon>
                <span class="nav-text">EVENTS</span>
                <v-ripple />
              </v-btn>
            </RouterLink>

            <!-- NOTIFICATIONS TAB -->
            <RouterLink to="/notifications" class="router-link">
              <v-badge
                :model-value="notificationStore.hasUnreadNotifications"
                :content="notificationStore.unreadCount"
                color="error"
                offset-x="10"
                offset-y="10"
                class="notification-badge"
              >
                <v-btn 
                  class="mr-3 nav-btn notifications-btn" 
                  variant="outlined"
                  size="large"
                  rounded="lg"
                >
                  <v-icon class="nav-icon me-2">mdi-bell</v-icon>
                  <span class="nav-text">NOTIFICATIONS</span>
                  <v-ripple />
                </v-btn>
              </v-badge>
            </RouterLink>
          </div>
          <v-spacer></v-spacer>

          <!-- Enhanced Theme Switch -->
          <div class="theme-switch-container me-4">
            <v-btn
              @click="isDark = !isDark; onClick()"
              :color="isDark ? 'amber' : 'indigo'"
              variant="outlined"
              rounded="xl"
              class="theme-toggle-btn"
            >
              <v-icon 
                :class="isDark ? 'theme-icon-rotate' : 'theme-icon-scale'"
                size="20"
              >
                {{ isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
              </v-icon>
              <span class="theme-text ms-2">
                {{ isDark ? 'Dark' : 'Light' }}
              </span>
            </v-btn>
          </div>

          <ProfileHeader v-if="isLoggedIn" :onLogout="onLogout"></ProfileHeader>
        </div>

        <!-- Mobile Nav (Hamburger) -->
        <div v-else class="mobile-nav-container">
          <v-badge
            :model-value="notificationStore.hasUnreadNotifications"
            :content="notificationStore.unreadCount"
            color="error"
            offset-x="5"
            offset-y="5"
            class="mobile-notification-badge"
          >
            <v-btn 
              icon 
              @click="drawer = !drawer"
              size="large"
              variant="outlined"
              class="mobile-menu-btn"
            >
              <v-icon size="28" :class="drawer ? 'menu-icon-rotate' : ''">
                {{ drawer ? 'mdi-close' : 'mdi-menu' }}
              </v-icon>
            </v-btn>
          </v-badge>
        </div>
      </v-app-bar>

      <!-- ENHANCED MOBILE DRAWER MENU -->
      <v-navigation-drawer 
        v-model="drawer" 
        temporary 
        location="right"
        class="mobile-drawer"
        width="300"
      >
        <div class="drawer-header pa-4">
          <div class="d-flex align-center mb-3">
            <v-img src="logo.png" width="35px" class="me-2" />
            <div>
              <h3 class="drawer-title">Parish Menu</h3>
              <p class="drawer-subtitle ma-0">Navigate with ease</p>
            </div>
          </div>
          <v-divider class="mb-3" />
        </div>

        <v-list class="mobile-nav-list">
          <!-- Profile Header -->
          <div v-if="isLoggedIn" class="px-4 pb-3">
            <ProfileHeader></ProfileHeader>
          </div>

          <!-- HOME -->
          <v-list-item 
            @click="drawer = false" 
            class="mobile-nav-item"
            rounded="lg"
            color="primary"
          >
            <RouterLink to="/homepage" class="router-link mobile-link">
              <template v-slot:prepend>
                <v-icon class="mobile-nav-icon">mdi-home</v-icon>
              </template>
              <v-list-item-title class="mobile-nav-text">HOME</v-list-item-title>
            </RouterLink>
          </v-list-item>

          <!-- BOOK EVENT -->
          <v-list-item 
            @click="drawer = false" 
            class="mobile-nav-item"
            rounded="lg"
            color="primary"
          >
            <RouterLink to="/book-event" class="router-link mobile-link">
              <template v-slot:prepend>
                <v-icon class="mobile-nav-icon">mdi-calendar-plus</v-icon>
              </template>
              <v-list-item-title class="mobile-nav-text">BOOK EVENT</v-list-item-title>
            </RouterLink>
          </v-list-item>

          <!-- EVENTS -->
          <v-list-item 
            @click="drawer = false" 
            class="mobile-nav-item"
            rounded="lg"
            color="primary"
          >
            <RouterLink to="/events" class="router-link mobile-link">
              <template v-slot:prepend>
                <v-icon class="mobile-nav-icon">mdi-calendar-multiselect</v-icon>
              </template>
              <v-list-item-title class="mobile-nav-text">EVENTS</v-list-item-title>
            </RouterLink>
          </v-list-item>

          <!-- NOTIFICATIONS -->
          <v-list-item 
            @click="drawer = false" 
            class="mobile-nav-item"
            rounded="lg"
            color="primary"
          >
            <RouterLink to="/notifications" class="router-link mobile-link">
              <template v-slot:prepend>
                <v-badge
                  :model-value="notificationStore.hasUnreadNotifications"
                  :content="notificationStore.unreadCount"
                  color="error"
                  inline
                  class="mobile-drawer-notification-badge"
                >
                  <v-icon class="mobile-nav-icon">mdi-bell</v-icon>
                </v-badge>
              </template>
              <v-list-item-title class="mobile-nav-text">NOTIFICATIONS</v-list-item-title>
            </RouterLink>
          </v-list-item>

          <v-divider class="my-3" />

          <!-- THEME SWITCH -->
          <v-list-item class="mobile-nav-item">
            <v-btn
              @click="isDark = !isDark; onClick()"
              variant="outlined"
              rounded="lg"
              class="mobile-theme-btn w-100"
              :color="isDark ? 'amber' : 'indigo'"
            >
              <v-icon class="me-2" size="20">
                {{ isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
              </v-icon>
              {{ isDark ? 'Switch to Light' : 'Switch to Dark' }}
            </v-btn>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <!-- MAIN CONTENT -->
      <v-main>
        <v-container>
          <slot name="content"></slot>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<style scoped>
/* ===== NAVBAR MAIN CONTAINER ===== */
.navbar-main {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-main:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

/* ===== LOGO SECTION ===== */
.logo-section {
  animation: slideInLeft 0.6s ease-out;
}

.logo-container {
  position: relative;
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.1) rotate(5deg);
}

.logo-image {
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-text-container {
  position: relative;
}

.header {
  font-family: 'Jomolhari', serif;
  font-weight: 600;
  color: #1565c0 !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  transition: color 0.3s ease;
  background: linear-gradient(45deg, #1565c0, #0d47a1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.parish-subtitle {
  font-size: 12px;
  color: #424242;
  font-style: italic;
  font-weight: 300;
  letter-spacing: 1px;
  opacity: 0.8;
  margin-top: -2px;
}

/* ===== NAVIGATION ITEMS ===== */
.nav-items-container {
  animation: slideInDown 0.6s ease-out 0.2s both;
}

.nav-btn {
  position: relative;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  text-transform: none;
  min-width: 120px;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.nav-btn:hover::before {
  left: 100%;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.home-btn-nav:hover {
  border-color: #4caf50 !important;
  color: #4caf50 !important;
  background: rgba(76, 175, 80, 0.1) !important;
}

.book-event-btn {
  background: linear-gradient(45deg, #2196f3, #1976d2) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.book-event-btn:hover {
  background: linear-gradient(45deg, #1976d2, #1565c0) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4);
}

.events-btn:hover {
  border-color: #ff9800 !important;
  color: #ff9800 !important;
  background: rgba(255, 152, 0, 0.1) !important;
}

.notifications-btn:hover {
  border-color: #f44336 !important;
  color: #f44336 !important;
  background: rgba(244, 67, 54, 0.1) !important;
}

.nav-icon {
  transition: all 0.3s ease;
}

.nav-btn:hover .nav-icon {
  transform: scale(1.2) rotate(10deg);
}

.nav-text {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ===== THEME SWITCH ===== */
.theme-switch-container {
  animation: slideInRight 0.6s ease-out 0.4s both;
}

.theme-toggle-btn {
  min-width: 100px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.theme-toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.theme-icon-scale {
  animation: sunPulse 2s ease-in-out infinite;
}

.theme-icon-rotate {
  animation: moonRotate 2s ease-in-out infinite;
}

.theme-text {
  font-size: 13px;
  font-weight: 500;
  text-transform: none;
}

/* ===== MOBILE NAVIGATION ===== */
.mobile-nav-container {
  animation: slideInRight 0.6s ease-out;
}

.mobile-menu-btn {
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  transform: scale(1.1);
}

.menu-icon-rotate {
  animation: rotateIn 0.3s ease-in-out;
}

.mobile-drawer {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.drawer-header {
  color: white;
  margin: -16px -16px 16px -16px;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.drawer-subtitle {
  font-size: 12px;
  opacity: 0.9;
  font-style: italic;
}

.mobile-nav-list {
  padding: 0 16px;
}

.mobile-nav-item {
  margin-bottom: 8px;
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.mobile-nav-item:hover {
  background: rgba(33, 150, 243, 0.1) !important;
  transform: translateX(8px);
}

.mobile-link {
  width: 100%;
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
}

.mobile-nav-icon {
  color: #1976d2;
  transition: all 0.3s ease;
}

.mobile-nav-item:hover .mobile-nav-icon {
  transform: scale(1.2);
  color: #2196f3;
}

.mobile-nav-text {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.5px;
  color: #424242;
}

.mobile-theme-btn {
  transition: all 0.3s ease;
  font-weight: 500;
}

.mobile-theme-btn:hover {
  transform: scale(1.02);
}

/* ===== ANIMATIONS ===== */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes sunPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes moonRotate {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(15deg); }
}

@keyframes notificationPulse {
  0% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% { 
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(244, 67, 54, 0);
  }
  100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

@keyframes rotateIn {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}

/* ===== NOTIFICATION BADGES ===== */
.notification-badge .v-badge__badge {
  animation: notificationPulse 2s infinite;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
}

.mobile-notification-badge .v-badge__badge {
  animation: notificationPulse 2s infinite;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
}

.mobile-drawer-notification-badge .v-badge__badge {
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  animation: notificationPulse 2s infinite;
}

/* ===== ROUTER LINK STYLES ===== */
.router-link {
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.router-link:hover {
  text-decoration: none;
}

/* ===== RESPONSIVE DESIGN ===== */
.large-header {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}

.small-header {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ===== DARK THEME ADJUSTMENTS ===== */
.v-theme--dark .navbar-main {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
}

.v-theme--dark .header {
  color: #e3f2fd !important;
  background: linear-gradient(45deg, #e3f2fd, #bbdefb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.v-theme--dark .parish-subtitle {
  color: #e0e0e0;
}

.v-theme--dark .mobile-drawer {
  background: linear-gradient(135deg, #212121 0%, #424242 100%);
}

.v-theme--dark .mobile-nav-text {
  color: #e0e0e0;
}
</style>
