<script>
</script>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  imageViewerDialog: Boolean,
  currentImageIndex: Number,
  selectedImages: Array
})

// Emits
const emit = defineEmits(['update:imageViewerDialog', 'update:currentImageIndex', 'close', 'previous', 'next'])

// Local computed properties for v-model support
const imageViewerDialog = computed({
  get: () => props.imageViewerDialog,
  set: (value) => emit('update:imageViewerDialog', value)
})

const currentImageIndex = computed({
  get: () => props.currentImageIndex,
  set: (value) => emit('update:currentImageIndex', value)
})

// Methods
const closeImageViewer = () => {
  emit('close')
}

const previousImage = () => {
  emit('previous')
}

const nextImage = () => {
  emit('next')
}
</script>

<template>
   <!-- Image Viewer Dialog -->
      <v-dialog v-model="imageViewerDialog" max-width="800">
        <v-card class="glass-card">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center">
              <v-icon class="me-2" color="primary">mdi-image-multiple</v-icon>
              Attached Images ({{ props.currentImageIndex + 1 }} of {{ props.selectedImages.length }})
            </div>
            <v-btn icon="mdi-close" variant="text" @click="closeImageViewer" />
          </v-card-title>

          <v-card-text class="pa-0">
            <div class="d-flex justify-center align-center" style="min-height: 400px">
              <v-img
                v-if="props.selectedImages[props.currentImageIndex]"
                :src="props.selectedImages[props.currentImageIndex]"
                :alt="`Attached image ${props.currentImageIndex + 1}`"
                contain
                max-height="500"
                class="mx-auto"
              />
            </div>
          </v-card-text>

          <v-card-actions class="pa-4" v-if="props.selectedImages.length > 1">
            <v-btn @click="previousImage" :disabled="props.currentImageIndex === 0" variant="outlined">
              <v-icon>mdi-chevron-left</v-icon>
              Previous
            </v-btn>
            <v-spacer />
            <div class="text-center">
              <v-pagination
                v-model="currentImageIndex"
                :length="props.selectedImages.length"
                :total-visible="3"
                density="compact"
                @update:model-value="(val) => (currentImageIndex = val - 1)"
              />
            </div>
            <v-spacer />
            <v-btn
              @click="nextImage"
              :disabled="props.currentImageIndex === props.selectedImages.length - 1"
              variant="outlined"
            >
              Next
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>
