<script setup lang="ts">
// Contact information widget component
// Displays parish contact details in a grid layout with icons
// Blue mirror effect glassmorphism design
</script>

<template>
  <v-container :class="$vuetify.display.mobile ? 'pa-2' : 'pa-4'">
    <!-- Contact Header -->
    <v-card flat color="transparent" :class="$vuetify.display.mobile ? 'mb-4' : 'mb-6'">
      <v-card-title
        class="text-white px-0"
        :class="{
          'text-h5 justify-center': $vuetify.display.xs,
          'text-h4 justify-center': $vuetify.display.sm,
          'text-h4 justify-start': $vuetify.display.mdAndUp
        }"
        style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);"
      >
        Contact Information
      </v-card-title>
    </v-card>

    <v-row>
      <!-- Address -->
      <v-col cols="12" sm="6">
        <v-card
          color="rgba(33, 150, 243, 0.25)"
          :class="$vuetify.display.mobile ? 'pa-3 mb-3' : 'pa-4 mb-4'"
          class="contact-card-blue"
          style="backdrop-filter: blur(10px); border: 1px solid rgba(66, 165, 245, 0.3);"
          elevation="0"
          rounded
          :height="$vuetify.display.mobile ? 'auto' : '140'"
        >
          <v-row no-gutters align="start">
            <v-col cols="auto" :class="$vuetify.display.mobile ? 'mr-2' : 'mr-3'">
              <v-icon
                icon="mdi-map-marker"
                color="white"
                :size="$vuetify.display.mobile ? 'default' : 'large'"
              ></v-icon>
            </v-col>
            <v-col>
              <v-card-title
                class="text-white pa-0 mb-2"
                :class="$vuetify.display.mobile ? 'text-body-2' : 'text-body-1'"
                style="font-weight: 600;"
              >
                Address
              </v-card-title>
              <v-card-text
                class="text-white pa-0"
                :style="$vuetify.display.mobile ? 'opacity: 0.9; font-size: 0.813rem; line-height: 1.5;' : 'opacity: 0.9; font-size: 0.875rem; line-height: 1.5;'"
              >
                P-3 Brgy. Bonbon<br>
                City of Butuan<br>
                Philippines
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Phone -->
      <v-col cols="12" sm="6">
        <v-card
          color="rgba(33, 150, 243, 0.25)"
          :class="$vuetify.display.mobile ? 'pa-3 mb-3' : 'pa-4 mb-4'"
          class="contact-card-blue"
          style="backdrop-filter: blur(10px); border: 1px solid rgba(66, 165, 245, 0.3);"
          elevation="0"
          rounded
          :height="$vuetify.display.mobile ? 'auto' : '140'"
        >
          <v-row no-gutters align="start">
            <v-col cols="auto" :class="$vuetify.display.mobile ? 'mr-2' : 'mr-3'">
              <v-icon
                icon="mdi-phone"
                color="white"
                :size="$vuetify.display.mobile ? 'default' : 'large'"
              ></v-icon>
            </v-col>
            <v-col>
              <v-card-title
                class="text-white pa-0 mb-2"
                :class="$vuetify.display.mobile ? 'text-body-2' : 'text-body-1'"
                style="font-weight: 600;"
              >
                Phone
              </v-card-title>
              <v-card-text class="pa-0">
                <a
                  href="tel:+639925652906"
                  class="text-white text-decoration-none"
                  :style="$vuetify.display.mobile ? 'opacity: 0.9; font-size: 0.813rem;' : 'opacity: 0.9; font-size: 0.875rem;'"
                >
                  0992 565 2906
                </a>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Email -->
      <v-col cols="12" sm="6">
        <v-card
          color="rgba(33, 150, 243, 0.25)"
          :class="$vuetify.display.mobile ? 'pa-3 mb-3' : 'pa-4 mb-4'"
          class="contact-card-blue"
          style="backdrop-filter: blur(10px); border: 1px solid rgba(66, 165, 245, 0.3);"
          elevation="0"
          rounded
          :height="$vuetify.display.mobile ? 'auto' : '140'"
        >
          <v-row no-gutters align="start">
            <v-col cols="auto" :class="$vuetify.display.mobile ? 'mr-2' : 'mr-3'">
              <v-icon
                icon="mdi-email"
                color="white"
                :size="$vuetify.display.mobile ? 'default' : 'large'"
              ></v-icon>
            </v-col>
            <v-col>
              <v-card-title
                class="text-white pa-0 mb-2"
                :class="$vuetify.display.mobile ? 'text-body-2' : 'text-body-1'"
                style="font-weight: 600;"
              >
                Email
              </v-card-title>
              <v-card-text class="pa-0">
                <a
                  href="mailto:silpbonbon23@gmail.com"
                  class="text-white text-decoration-none"
                  :style="$vuetify.display.mobile ? 'opacity: 0.9; font-size: 0.813rem; word-break: break-all;' : 'opacity: 0.9; font-size: 0.875rem;'"
                >
                  silpbonbon23@gmail.com
                </a>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Office Hours -->
      <v-col cols="12" sm="6">
        <v-card
          color="rgba(33, 150, 243, 0.25)"
          :class="$vuetify.display.mobile ? 'pa-3 mb-3' : 'pa-4 mb-4'"
          class="contact-card-blue"
          style="backdrop-filter: blur(10px); border: 1px solid rgba(66, 165, 245, 0.3);"
          elevation="0"
          rounded
          :height="$vuetify.display.mobile ? 'auto' : '140'"
        >
          <v-row no-gutters align="start">
            <v-col cols="auto" :class="$vuetify.display.mobile ? 'mr-2' : 'mr-3'">
              <v-icon
                icon="mdi-clock-outline"
                color="white"
                :size="$vuetify.display.mobile ? 'default' : 'large'"
              ></v-icon>
            </v-col>
            <v-col>
              <v-card-title
                class="text-white pa-0 mb-2"
                :class="$vuetify.display.mobile ? 'text-body-2' : 'text-body-1'"
                style="font-weight: 600;"
              >
                Office Hours
              </v-card-title>
              <v-card-text
                class="text-white pa-0"
                :style="$vuetify.display.mobile ? 'opacity: 0.9; font-size: 0.813rem; line-height: 1.5;' : 'opacity: 0.9; font-size: 0.875rem; line-height: 1.5;'"
              >
                Monday: 8:00 AM - 5:00 PM<br>
                Tuesday: Closed<br>
                Wednesday - Sunday: 8:00 AM - 5:00 PM
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Facebook -->
      <v-col cols="12" sm="6">
        <v-card
          color="rgba(33, 150, 243, 0.25)"
          :class="$vuetify.display.mobile ? 'pa-3 mb-3' : 'pa-4 mb-4'"
          class="contact-card-blue"
          style="backdrop-filter: blur(10px); border: 1px solid rgba(66, 165, 245, 0.3);"
          elevation="0"
          rounded
          :height="$vuetify.display.mobile ? 'auto' : '140'"
        >
          <v-row no-gutters align="start">
            <v-col cols="auto" :class="$vuetify.display.mobile ? 'mr-2' : 'mr-3'">
              <v-icon
                icon="mdi-facebook"
                color="white"
                :size="$vuetify.display.mobile ? 'default' : 'large'"
              ></v-icon>
            </v-col>
            <v-col>
              <v-card-title
                class="text-white pa-0 mb-2"
                :class="$vuetify.display.mobile ? 'text-body-2' : 'text-body-1'"
                style="font-weight: 600;"
              >
                Facebook
              </v-card-title>
              <v-card-text class="pa-0">
                <a
                  href="https://www.facebook.com/SILPBonbon"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-white text-decoration-none"
                  :style="$vuetify.display.mobile ? 'opacity: 0.9; font-size: 0.813rem;' : 'opacity: 0.9; font-size: 0.875rem;'"
                >
                  SILP Bonbon
                </a>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.contact-card-blue {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.25) 0%, rgba(66, 165, 245, 0.15) 100%);
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.contact-card-blue::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: rotate(45deg);
  transition: all 0.6s ease;
}

.contact-card-blue:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.35) 0%, rgba(66, 165, 245, 0.25) 100%);
  transform: translateY(-5px);
  box-shadow:
    0 12px 40px 0 rgba(33, 150, 243, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.3);
  border-color: rgba(100, 181, 246, 0.5) !important;
}

.contact-card-blue:hover::before {
  left: 100%;
}
</style>
