<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalImages: number
  totalDocuments: number
  uploadedDocumentsCount: number
  allComplete: boolean
}>()

const progressPercentage = computed(() =>
  (props.uploadedDocumentsCount / props.totalDocuments) * 100
)

const remainingDocuments = computed(() =>
  props.totalDocuments - props.uploadedDocumentsCount
)
</script>

<template>
  <v-card variant="outlined" class="mb-6">
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="text-subtitle-1 font-weight-medium">
          Upload Progress
        </div>
        <v-chip
          :color="allComplete ? 'success' : 'primary'"
          variant="tonal"
          size="small"
        >
          {{ totalImages }} images uploaded
        </v-chip>
      </div>

      <v-progress-linear
        :model-value="progressPercentage"
        :color="allComplete ? 'success' : 'primary'"
        height="8"
        rounded
        class="mb-2"
      />

      <div class="text-caption text-medium-emphasis">
        {{ allComplete ? 'All documents uploaded!' : `${remainingDocuments} documents remaining` }}
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.v-progress-linear {
  transition: all 0.3s ease;
}
</style>
