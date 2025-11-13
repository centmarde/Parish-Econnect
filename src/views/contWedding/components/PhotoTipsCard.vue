<script setup lang="ts">
import { photoTips } from '../data/weddingDocuments'
</script>

<template>
  <v-card variant="outlined" class="mt-4">
    <v-list density="compact">
      <v-list-subheader class="text-primary text-caption font-weight-medium">
        Photo Tips para sa Best Quality
      </v-list-subheader>

      <v-list-item
        v-for="(tip, index) in photoTips"
        :key="index"
        :prepend-icon="tip.icon"
        :title="tip.title"
        :subtitle="tip.subtitle"
        class="text-caption"
      />
    </v-list>
  </v-card>
</template>
