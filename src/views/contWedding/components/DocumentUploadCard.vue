<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import FormCamera from '@/components/common/FormCamera.vue'
import { WeddingDocument } from '../data/weddingDocuments'

const props = defineProps<{
  document: WeddingDocument
  modelValue: any[]
  hasImages: boolean
  imageCount: number
}>()
const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

const theme = useTheme()

const cardVariant = computed(() =>
  theme.global.current.value.dark ? 'tonal' : 'elevated'
)

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <v-card
    :variant="cardVariant"
    class="h-100"
    :class="{ 'border-success': hasImages }"
  >
    <!-- Document Header -->
    <v-card-title class="pa-4 d-flex align-center">
      <v-avatar
        :color="document.color"
        size="40"
        variant="tonal"
        class="mr-3"
      >
        <v-icon :color="document.color" size="20">{{ document.icon }}</v-icon>
      </v-avatar>

      <div class="grow">
        <div class="text-subtitle-1 font-weight-medium d-flex align-center gap-2">
          {{ document.name }}

        </div>
        <div class="text-caption text-medium-emphasis">
          {{ document.description }}
        </div>
      </div>

      <!-- Status indicator -->
      <div class="text-right ml-2">
        <v-chip
          v-if="hasImages"
          color="success"
          variant="tonal"
          size="x-small"
          prepend-icon="mdi-check"
        >
          ✓
        </v-chip>

      </div>
    </v-card-title>

    <v-divider />

    <!-- Camera Upload Component -->
    <v-card-text class="pa-4">
      <FormCamera
        v-model="localValue"
        :label="`${document.name} Images`"
        :max-images="5"
        :required="document.required !== false"
      />

      <div v-if="hasImages" class="text-caption text-medium-emphasis mt-2">
        {{ imageCount }} image{{ imageCount !== 1 ? 's' : '' }} uploaded
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.border-success {
  border: 2px solid rgb(var(--v-theme-success)) !important;
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.h-100 {
  height: 100%;
}
</style>
