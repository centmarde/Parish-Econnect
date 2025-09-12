<script setup>
import NavBar2 from '@/components/layout/NavBar2.vue'
import BaptismForm from '@/components/system/BaptismForm.vue'

import { useDisplay } from 'vuetify'
const { smAndDown } = useDisplay()
</script>

<template>
  <NavBar2>
    <template #content>
      <v-container fluid>
        <div class="bg-wrapper">
          <v-img src="baptism.jpg" class="bg-image" cover></v-img>
        </div>

        <div class="overlay-content pa-10" :class="smAndDown ? 'small-icon' : 'large-icon'">
          <v-row>
            <v-col cols="2" class="back">
              <RouterLink to="/book-event" class="router-link">
                <v-btn class="rounded-circle" color="indigo" icon>
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
              </RouterLink> </v-col
            ><v-col cols="8" class="title">
              <h1 :class="smAndDown ? 'small-header' : 'large-header'">
                <i>Baptism Mass</i>
              </h1></v-col
            ></v-row
          >
        </div>

        <v-card class="mt-15" :width="smAndDown ? '100%' : '100%'">
          <BaptismForm></BaptismForm>
        </v-card>
      </v-container>
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
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(3px);
}

.overlay-content {
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 1;
  color: white;
  padding-top: 20px;
}

h1 {
  font-family: 'Segoe Script', cursive;
  text-shadow:
    -2px 0 2px white,
    0 2px 2px white,
    2px 0 2px white,
    0 -2px 2px;
  color: #000;
}

.large-header {
  font-size: 40px;
  text-align: center;
}

.small-header {
  font-size: 28px;
  text-align: center;
  white-space: nowrap;
}
</style>
