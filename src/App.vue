<script setup>
import { RouterView } from 'vue-router'
import { useRealTimeNotifications } from '@/views/notifications/composables/useRealTimeNotifications.js'

// Initialize real-time notifications globally
useRealTimeNotifications()
</script>

<template>
  <RouterView />

  <!-- <div>test</div> -->

</template>
