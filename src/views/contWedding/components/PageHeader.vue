<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()

const headerGradient = computed(() =>
  theme.global.current.value.dark
    ? 'linear-gradient(135deg, #1E1E1E 0%, #2C2C2C 100%)'
    : 'linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)'
)

const cardVariant = computed(() =>
  theme.global.current.value.dark ? 'tonal' : 'elevated'
)
</script>

<template>
  <v-card
    :variant="cardVariant"
    class="mb-6 overflow-hidden"
    :style="{ background: headerGradient }"
  >
    <v-card-text class="text-center pa-8">
      <v-avatar
        size="80"
        color="white"
        class="mb-4 elevation-4"
      >
        <v-icon size="48" color="primary">mdi-camera-plus</v-icon>
      </v-avatar>

      <h1 class="text-h4 font-weight-bold text-white mb-2">
        Document Photos
      </h1>
      <p class="text-h6 text-white opacity-90 mb-0">
        Upload photos ng filled-out wedding documents
      </p>
    </v-card-text>
  </v-card>
</template>

<style scoped>
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }
}
</style>
