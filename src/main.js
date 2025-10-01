/**
 * main.js
 *
 * Bootstraps Vuetify, Ionic and other plugins then mounts the App
 */

//import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as labsComponents from 'vuetify/labs/components'

// Ionic
import 'vue-toastification/dist/index.css'
import { IonicVue } from '@ionic/vue'
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
//import "@ionic/vue/css/structure.css";
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import Toast from 'vue-toastification'

// Vue Simple Calendar
import { CalendarView, CalendarViewHeader } from 'vue-simple-calendar'
import 'vue-simple-calendar/dist/vue-simple-calendar.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi', // This is already the default value - only for display purposes
  },
  components: {
    ...components,
    ...labsComponents,
  },
  directives,
})

// Define custom elements for PWA
import { defineCustomElements } from '@ionic/pwa-elements/loader'
defineCustomElements(window)

app.config.warnHandler = () => {}

// Register vue-simple-calendar components globally
app.component('CalendarView', CalendarView)
app.component('CalendarViewHeader', CalendarViewHeader)

app.use(createPinia())
app.use(IonicVue)
app.use(router)
app.use(vuetify)
app.use(Toast)

// Initialize auth state and set up auth listener
import { useAuthUserStore } from '@/stores/authUser'
import { supabase } from '@/utils/supabase'

router.isReady().then(() => {
  app.mount('#app')

  // Set up auth state listener after app is mounted
  supabase.auth.onAuthStateChange(async (event) => {
    try {
      const authStore = useAuthUserStore()

      if (event === 'SIGNED_OUT') {
        authStore.$reset()
        router.push('/')
      }
      // For SIGNED_IN, let the isAuthenticated method handle state setting
    } catch (error) {
      console.error('Auth state change error:', error)
    }
  })
})
