<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)

onMounted(() => {
  // Simulate loading delay
  setTimeout(() => {
    loading.value = false
  }, 3000)
})
</script>

<template>
  <!-- Show loading spinner while loading -->
  <transition name="fade" appear>
    <div v-if="loading" class="preloader-container">
      <div class="loading-spinner">
        <v-img src="/logo.png" alt="Logo" class="spinner-logo" />
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Fade transition classes */
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.preloader-container {
  position: fixed;
  inset: 0;
  background-color: #0087ca;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-logo {
  width: 90px;
  height: 90px;
  object-fit: contain;
  z-index: 1;
}

.loading-spinner::after {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 100%;
  box-shadow: 0 4px 0 0 #eab532;
  animation: lds-eclipse 1s linear infinite;
}
@keyframes lds-eclipse {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
