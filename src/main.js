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

import App from './App.vue'
import router from './router'

const app = createApp(App)

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi', // This is already the default value - only for display purposes
  },
  components,
  directives,
})

// Define custom elements for PWA
import { defineCustomElements } from '@ionic/pwa-elements/loader'
defineCustomElements(window)

app.config.warnHandler = () => {}

app.use(createPinia())
app.use(IonicVue)
app.use(router)
app.use(vuetify)
app.use(Toast)

router.isReady().then(() => {
  app.mount('#app')
})
