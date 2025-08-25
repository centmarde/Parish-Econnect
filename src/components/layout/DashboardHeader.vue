<script setup>
import { useAuthUserStore } from '@/stores/authUser'
import ProfileHeader from '@/components/layout/ProfileHeader.vue'
import { onMounted } from 'vue'

// Use Pinia Store
const authStore = useAuthUserStore()

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

//Display for mobile & desktop
import { useDisplay } from 'vuetify'
const { mobile, mdAndDown } = useDisplay()

// Load Functions during component rendering
onMounted(async () => {
  isLoggedIn.value = await authStore.isAuthenticated()

  //isMobileLogged.value = mobile.value && isLoggedIn.value
  // isDesktop.value = !mobile.value && (isLoggedIn.value || !isLoggedIn.value)
})
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme">
      <v-app-bar
        class="px-6"
        :color="theme === 'light' ? 'light-blue-lighten-1' : 'light-blue-accent-4'"
        border
      >
        <!-- LOGO + HEADER -->
        <div class="d-flex align-center">
          <v-img src="logo.png" :width="mobile ? '40px' : '45px'" class="me-2" cover />
          <h2 :class="smAndDown ? 'small-header' : 'large-header'" class="ma-0 header">
            SAN ISIDRO LABRADOR PARISH
          </h2>
        </div>

        <v-spacer></v-spacer>

        <!-- Desktop Nav -->
        <div v-if="!mdAndDown" class="d-flex align-center nav">
          <v-spacer></v-spacer>

          <v-switch
            v-model="isDark"
            color="primary"
            hide-details
            class="theme-switch pr-5"
            @change="onClick"
            style="transform: scale(1.5); transform-origin: right center"
          >
            <template #thumb>
              <v-icon size="20">
                {{ isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
              </v-icon>
            </template>
          </v-switch>

          <ProfileHeader v-if="isLoggedIn" :onLogout="onLogout"></ProfileHeader>
        </div>

        <!-- Mobile Nav (Hamburger) -->
        <div v-else>
          <v-btn icon @click="drawer = !drawer">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </div>
      </v-app-bar>

      <!-- MOBILE DRAWER MENU -->
      <v-navigation-drawer v-model="drawer" temporary location="right">
        <v-list>
          <ProfileHeader v-if="isLoggedIn"></ProfileHeader>

          <v-divider></v-divider>
          <!-- THEME SWITCH -->
          <v-list-item>
            <v-btn
              v-model="isDark"
              @click="isDark = !isDark"
              hide-details
              class="theme-switch pl-0"
              @change="onClick"
              flat
            >
              <span>
                <v-icon size="20" class="me-2">
                  {{ isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }} </v-icon
                >{{ isDark ? 'Light Mode' : 'Dark Mode' }}
              </span>
            </v-btn>
          </v-list-item>
          <divider></divider>
          <!-- LOG OUT
          <v-list-item>
            <v-btn flat prepend-icon="mdi-logout" @click="onLogout"> Log Out</v-btn>
          </v-list-item> -->
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
.header {
  font-family: 'Jomolhari', serif;
  font-weight: 500;
  color: black;
}

.nav {
  .poppins-bold {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-style: normal;
  }
}

.hover-underline-animation {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding-bottom: 3px;
  gap: 8px;
  color: black;
  font-weight: 600;
}

.hover-underline-animation::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: white;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease-out;
}

.hover-underline-animation:hover::after {
  transform: scaleX(1);
}

.outlined-btn {
  padding: 4px 12px;
  gap: 8px;
}

.home-btn {
  position: relative;
  border-radius: 12px;
  border: none;
  color: black;
  cursor: default;
  background-color: transparent !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  gap: 20px;
  pointer-events: none;
  padding-bottom: 2px;
  letter-spacing: 2px;
  font-weight: 600;
}

.home-btn:hover {
  background-color: transparent !important;
  color: black !important;
  box-shadow: none !important;
}

.home-icon {
  font-size: 22px;
  margin-right: 5px;
  color: black;
  padding-bottom: 5px;
}

.event-icon {
  font-size: 20px;
  vertical-align: middle;
  margin-right: 5px;
  color: black;
  padding-bottom: 5px;
}

.home-color {
  border-bottom: 2px solid white;
  padding-bottom: 1px;
}

/*added */
.home-color::after {
  content: '';
  position: absolute;
  width: 100%;
  transform: scaleX(0);
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #0087ca;
  transition: transform 0.25s ease-out;
}

.router-link {
  text-decoration: none;
  color: inherit;
}

.router-link:hover {
  text-decoration: none;
}

.large-header {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
}

.small-header {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
