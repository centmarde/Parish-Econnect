<script setup lang="ts">
import { WeddingDocument } from '../data/weddingDocuments'

defineProps<{
  missingPrimaryDocs: WeddingDocument[]
  missingAdditionalDocs: WeddingDocument[]
  totalDocuments: number
}>()
</script>

<template>
  <v-expand-transition>
    <v-alert
      v-if="missingPrimaryDocs.length > 0"
      type="warning"
      variant="tonal"
      class="mb-6"
      prepend-icon="mdi-alert-outline"
    >
      <v-alert-title class="text-h6 mb-2">Required Documents Missing</v-alert-title>
      Please upload images for all {{ totalDocuments }} required wedding documents before proceeding.

      <v-row class="mt-3">
        <v-col v-if="missingPrimaryDocs.length > 0" cols="12">
          <div class="text-subtitle-2 mb-2 text-error">Missing Required Documents</div>
          <v-list density="compact" class="bg-transparent">
            <v-list-item
              v-for="doc in missingPrimaryDocs"
              :key="doc.filename"
              prepend-icon="mdi-alert-circle"
              :title="doc.name"
              class="text-body-2 pl-0"
            />
          </v-list>
        </v-col>
      </v-row>
    </v-alert>
  </v-expand-transition>
</template>
