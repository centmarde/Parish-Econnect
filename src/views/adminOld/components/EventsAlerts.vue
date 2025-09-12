<script setup>
// Props nga makuha gikan sa parent component
defineProps({
  errorMessage: String,
  successMessage: String,
})

// Emits para sa parent component interaction
const emit = defineEmits(['clearMessages'])

const clearMessages = () => {
  emit('clearMessages')
}
</script>

<template>
 <!-- Alerts -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          closable
          @click:close="clearMessages"
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          closable
          @click:close="clearMessages"
          class="mb-4"
        >
          {{ successMessage }}
        </v-alert>
</template>
