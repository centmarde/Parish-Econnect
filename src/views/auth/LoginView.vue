<script setup>
import LoginForm from '@/components/auth/LoginForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'

//Display for mobile & desktop
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()
</script>

<template>
  <PreloaderView></PreloaderView>
  <AppLayout>
    <template #content>
      <v-container fluid>
        <div class="bg-wrapper">
          <v-img src="silp.jpg" class="bg-image" cover></v-img>
        </div>

        <v-row>
          <!-- Left Column: Image and Heading -->
          <v-col cols="12" md="6" lg="6" xl="6" sm="12" class="col1">
            <v-img
              max-auto
              src="logo.png"
              v-bind:width="mobile ? '70%' : '56%'"
              class="animated-logo"
            ></v-img>
            <br />
            <br />

            <h2 class="line-1 anim-typewriter pt-1 text-center">
              "<span class="text-span"
                >Join us as we come together in faith and community, where we celebrate the spirit
                of service, devotion, and unity!</span
              >"
            </h2>
          </v-col>
          <!-- Right Column: Combined Auth Form -->
          <v-col class="cardy" cols="12" md="6" lg="6" xl="6" sm="12">
            <v-card
              class="mx-auto pa-8 pb-6"
              elevation="8"
              rounded="lg"
              v-bind:width="mobile ? '110%' : '80%'"
              max-width="600px"
            >
              <LoginForm></LoginForm>
            </v-card>
          </v-col>
        </v-row>
        <br />
        <br />
        <br />
        <br />
        <br />
      </v-container>
    </template>
  </AppLayout>
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

.v-container {
  position: relative;
  z-index: 10;
}

.col1 {
  place-items: center;
}

.animated-logo {
  opacity: 0;
  transform: scale(0.2);
  animation: fadeInScale 1s ease-out forwards;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.col1 h2 {
  position: relative;
  text-align: center;
  font-family:
    Times,
    Times New Roman,
    serif;
  text-shadow:
    -2px 0 2px black,
    0 2px 2px black,
    2px 0 2px black,
    0 -2px 2px;
}
.header {
  font-family:
    Bookman,
    URW Bookman L,
    serifAmerican Typewriter,
    serif;
}
.text-span {
  color: #fcb454;
}

.cardy {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  animation: bounce 4s infinite ease-in-out;
}

.cardd {
  justify-content: center;
  display: flex;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  animation: bounce 4s infinite ease-in-out;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
</style>
