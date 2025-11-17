<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'

const route = useRoute()
const authStore = useAuthUserStore()

const theme = ref(localStorage.getItem('theme') ?? 'light')

const isDark = computed({
  get: () => theme.value === 'dark',
  set: (val) => {
    theme.value = val ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
  },
})

// Computed property to determine if login button should be shown
const showLoginButton = computed(() => {
  return !authStore.user && route.path !== '/auth'
})

function onClick() {
  localStorage.setItem('theme', theme.value)
}

//Display for desktop & mobile
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()
const { smAndDown } = useDisplay()
</script>

<!--Layout For Login/Register-->
<template>
  <v-responsive class="border rounded">
    <!--Toggle-->
    <v-app :theme="theme">
      <v-app-bar class="px-6" :color="theme === 'light' ? 'blue-darken-1' : 'blue-darken-3'" border>
        <div class="d-flex align-center">
          <!--Image Logo-->
          <v-img src="logo.png" :width="mobile ? '40px' : '45px'" class="me-2" cover></v-img>

          <!--Header Title-->
          <h2 :class="smAndDown ? 'text-subtitle-2' : 'text-h5'" class="ma-0 header">
            San Isidro Labrador Parish
          </h2>
        </div>
        <v-spacer></v-spacer>
        <!--Login Button - only show when user is not authenticated and not on auth page-->
        <v-btn
          v-if="showLoginButton"
          variant="text"
          class="me-5"
          @click="$router.push('/auth')"
          :size="smAndDown ? 'small' : 'default'"
        >
          Login
        </v-btn>
        <!--Toggle Switch-->
        <v-switch
          v-model="isDark"
          color="primary"
          hide-details
          class="theme-switch"
          @change="onClick"
          style="transform: scale(1.5); transform-origin: right center"
        >
          <template #thumb>
            <v-icon size="20  ">
              {{ isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
            </v-icon>
          </template>
        </v-switch>
      </v-app-bar>

      <v-main>
        <v-container>
          <slot name="content"></slot>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<style scoped>
h2 {
  font-weight: 500;
}
</style>
