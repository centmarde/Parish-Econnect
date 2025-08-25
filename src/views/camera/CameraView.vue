<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import NavBar2 from '@/components/layout/NavBar2.vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { useTheme } from 'vuetify'

// reactive refs
const photo = ref(null)
const isTakingPicture = ref(false)
const theme = useTheme()
const isDarkTheme = computed(() => theme.global.current.value.dark)

const takePicture = async () => {
  try {
    isTakingPicture.value = true
    
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      saveToGallery: true,
      source: CameraSource.Prompt,
      promptLabelCancel: "Cancel",
      promptLabelPhoto: "Choose from Gallery",
      promptLabelPicture: "Take a Picture",
    })

    // image.webPath can be used as the src for an <img>
    photo.value = image.webPath || image.path || null
  } catch (err) {
    console.error('Camera error', err)
    photo.value = null
  } finally {
    isTakingPicture.value = false
  }
}

const clearImage = () => {
  photo.value = null
}

// router navigation
const router = useRouter()
const goBack = () => router.push('/book-event')
</script>

<template>
  <PreloaderView />
  <NavBar2>
    <template #content>
      <v-container
        :class="{
          'pa-4': $vuetify.display.xs,
          'dark-theme': isDarkTheme,
        }"
        fluid
      >
       

        <v-card
          class="mx-auto camera-card"
          :class="[
            {
              'elevation-8': !isTakingPicture,
              'elevation-2': isTakingPicture,
            },
            isDarkTheme ? 'dark-card' : 'light-card',
          ]"
          max-width="500"
          rounded="lg"
        >
          <v-overlay
            v-model="isTakingPicture"
            class="align-center justify-center"
            contained
            scrim="#ffffff"
          >
            <v-card-text class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <div class="text-h6 mt-3 text-primary">Taking picture...</div>
            </v-card-text>
          </v-overlay>

          <!-- Image Display Area -->
          <div v-if="photo" class="pa-4">
            <div class="text-center">
              <img 
                :src="photo" 
                alt="Taken photo" 
                class="captured-image"
                style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" 
              />
            </div>
          </div>

          <!-- Placeholder when no photo -->
          <div v-else class="photo-placeholder">
            <div class="text-center text-grey">
              <v-icon size="72" color="grey-lighten-1" class="mb-3">
                mdi-camera-outline
              </v-icon>
              <div class="text-h6 mb-2">Ready to Capture</div>
              <div class="text-body-2">
                Take a photo or choose from gallery
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <v-card-actions class="pa-4 d-flex flex-column">
            <v-btn
              block
              color="primary"
              size="large"
              rounded="lg"
              :loading="isTakingPicture"
              :disabled="isTakingPicture"
              @click="takePicture"
              class="camera-button text-none mb-3"
              elevation="2"
            >
              <v-icon start size="24" class="mr-2">
                {{ photo ? "mdi-camera-retake" : "mdi-camera" }}
              </v-icon>
              {{ photo ? "Take Another Picture" : "Take Picture" }}
            </v-btn>

            <v-btn
              v-if="photo"
              block
              color="error"
              size="large"
              rounded="lg"
              variant="outlined"
              @click="clearImage"
              class="clear-button"
              elevation="0"
            >
              <v-icon start>mdi-refresh</v-icon>
              Clear Image
            </v-btn>
          </v-card-actions>
        </v-card>
        
        <!-- Tips Card -->
        <v-card class="mt-4 mx-auto tips-card" max-width="500" variant="outlined" rounded="lg">
          <v-list density="compact">
            <v-list-subheader class="text-primary text-caption font-weight-medium">
              Camera Tips
            </v-list-subheader>

            <v-list-item
              prepend-icon="mdi-light-flood-up"
              title="Good Lighting"
              subtitle="Ensure good lighting for better image quality"
              class="text-caption"
            >
            </v-list-item>

            <v-list-item
              prepend-icon="mdi-image-filter-center-focus"
              title="Steady Shot"
              subtitle="Keep the camera steady when taking photos"
              class="text-caption"
            >
            </v-list-item>

            <v-list-item
              prepend-icon="mdi-camera-enhance"
              title="Camera or Gallery"
              subtitle="Choose to take a new photo or select from gallery"
              class="text-caption"
            >
            </v-list-item>
          </v-list>
        </v-card>

         <!-- Back button to return to booking page -->
        <v-btn text color="primary" class="my-4" width="100%" @click="goBack">
          <v-icon left>mdi-arrow-left</v-icon>
          Back to Booking
        </v-btn>
      </v-container>
    </template>
  </NavBar2>
</template>

<style scoped>
.dark-theme {
  background: #1e2124 !important;
}

.dark-card {
  background-color: #2d3035 !important;
  border: 1px solid rgba(80, 80, 80, 0.7) !important;
  color: #e0e0e0 !important;
}

.light-card {
  background-color: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: #000000 !important;
}

.v-container {
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

.camera-card {
  position: relative;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  padding: 10px;
}

.photo-placeholder {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  margin: 16px;
}

.captured-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.camera-button {
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.camera-button:active {
  transform: scale(0.98);
}

.clear-button {
  transition: all 0.3s ease;
}

.tips-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 50px;
}

@media (max-width: 600px) {
  .camera-card {
    margin: 0 !important;
  }
  
  .v-container {
    padding: 16px !important;
  }
}
</style>
