<script setup lang="ts">
// Contact information widget component
// Displays parish contact details in a grid layout with icons
// Blue mirror effect glassmorphism design
</script>

<template>
  <v-container :class="$vuetify.display.mobile ? 'pa-2' : 'pa-4'">
    <v-row>
      <!-- Address -->
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-icon
          icon="mdi-map-marker"
          color="#1E3D9B"
          size="large"
          class="mr-4"
        ></v-icon>
        <div>
          <div class="text-white font-weight-bold mb-1">Address</div>
          <div class="text-white" style="opacity: 0.9; font-size: 0.875rem;">
            P-3 Brgy. 25, J.P. Rizal, Butuan City
          </div>
        </div>
      </v-col>

      <!-- Call Me -->
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-icon
          icon="mdi-phone"
          color="#1E3D9B"
          size="large"
          class="mr-4"
        ></v-icon>
        <div>
          <div class="text-white font-weight-bold mb-1">Call Me</div>
          <a
            href="tel:+639197797083"
            class="text-white text-decoration-none"
            style="opacity: 0.9; font-size: 0.875rem;"
          >
            +639 919 797 083
          </a>
        </div>
      </v-col>

      <!-- Email Me -->
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-icon
          icon="mdi-email"
          color="#1E3D9B"
          size="large"
          class="mr-4"
        ></v-icon>
        <div>
          <div class="text-white font-weight-bold mb-1">Email Me</div>
          <a
            href="mailto:rianaiphonandale@gmail.com"
            class="text-white text-decoration-none"
            style="opacity: 0.9; font-size: 0.875rem;"
          >
           silpbonbon@gmail.com
          </a>
        </div>
      </v-col>

      <!-- Social Links -->
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-icon
          icon="mdi-facebook"
          color="#1E3D9B"
          size="large"
          class="mr-4"
        ></v-icon>
        <div>
          <div class="text-white font-weight-bold mb-1">Facebook</div>
          <a
            href="https://www.facebook.com/SILPBonbon"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white text-decoration-none"
            style="opacity: 0.9; font-size: 0.875rem;"
          >
            SILP Bonbon
          </a>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* Removed card styles - using simple grid layout */
</style>
