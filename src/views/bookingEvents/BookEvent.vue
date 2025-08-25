<script setup>
import NavBar2 from '@/components/layout/NavBar2.vue'
import { onMounted } from 'vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import EventGuide from './widgets/EventGuideSteperWidget.vue'
import BookingWidget from './widgets/BookingWidget.vue'
import AppBar from '@/components/layout/AppBar.vue'
import MyForms from '@/components/layout/MyForms.vue'
import { getBackgroundImages, useLoadingState } from './functions/helpers'

const images = getBackgroundImages()
const { triggerLoading } = useLoadingState(500)

onMounted(() => {
  triggerLoading()
})
</script>

<template>
  <PreloaderView></PreloaderView>
  <NavBar2>
    <template #content>
      <v-container fluid class="pa-0">
        <!-- Background Carousel -->
        <!-- Background carousel using Vuetify -->
        <v-carousel
          cycle
          hide-delimiters
          :show-arrows="false"
          height="100vh"
          class="position-fixed top-0 left-0 w-100 bg-wrapper"
        >
          <v-carousel-item v-for="(image, index) in images" :key="index">
            <v-img
              :src="image"
              class="fill-height carousel-image"
              gradient="to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.6)"
              cover
            />
          </v-carousel-item>
        </v-carousel>

        <!-- Content -->
        <v-container class="content-wrapper">
            <v-row>
            <v-col cols="12">
              <MyForms />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <EventGuide />
            </v-col>
          </v-row>
        
          <!-- Booking Widget Section -->
          <v-row class="my-1">
            <v-col cols="12">
              <BookingWidget />
            </v-col>
          </v-row>
        </v-container>
      </v-container>

      <!-- Bottom Navigation -->
      <AppBar />
    </template>
  </NavBar2>
</template>

<style scoped>
.bg-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.carousel-image {
  filter: blur(2px) brightness(0.5);
}

.carousel-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.carousel {
  display: flex;
  transition: transform 1s ease-in-out;
  width: calc(100vw * 5);
  height: 100%;
}

.bg-image {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  flex-shrink: 0;
  filter: brightness(0.7);
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 1;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float var(--duration, 25s) var(--delay, 0s) infinite linear;
}

@keyframes float {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
}

.main-content {
  align-items: center;
}

.welcome-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 300;
  letter-spacing: 2px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}

.welcome-subtitle {
  font-size: clamp(1rem, 2vw, 1.3rem);
  font-weight: 300;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease-out 0.2s;
}

.animate-in .welcome-title,
.animate-in .welcome-subtitle {
  opacity: 1;
  transform: translateY(0);
}

.card-grid {
  gap: 24px;
}

.card-col {
  opacity: 0;
  transform: translateY(50px) scale(0.9);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cards-animate .card-col {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition-delay: var(--delay);
}

.mass-card {
  height: 100%;
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mass-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
}

.card-icon {
  transform: scale(1);
  transition: transform 0.3s ease;
}

.mass-card:hover .card-icon {
  transform: scale(1.1);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.3;
}

.card-description {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.book-btn {
  transform: scale(1);
  transition: all 0.2s ease;
}

.mass-card:hover .book-btn {
  transform: scale(1.05);
}

/* Fixed size card variant for consistent grid layout */
.fixed-size-card {
  width: 260px;
  max-width: 260px;
  height: 320px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
}

.fixed-size-card .v-card-text {
  padding: 20px !important;
}

.fixed-size-card .card-title {
  font-size: 1rem;
}

.fixed-size-card .card-description {
  font-size: 0.95rem;
}

@media (max-width: 960px) {
  .fixed-size-card {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 220px;
  }
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .content-wrapper {
    padding-top: 20px;
  }

  .card-grid {
    gap: 16px;
  }

  .mass-card {
    margin: 0 8px;
  }

  .welcome-title {
    margin-bottom: 1rem;
  }

  .welcome-subtitle {
    margin-bottom: 2rem;
  }
}

@media (max-width: 960px) {
  .card-col {
    padding: 8px;
  }
}

/* Fallback: ensure carousel arrows are hidden */
.v-carousel .v-carousel__controls,
.v-carousel .v-carousel__prev,
.v-carousel .v-carousel__next,
.v-carousel .v-btn--icon {
  display: none !important;
}
</style>
