<script setup>
import { ref } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'

//Display for mobile & desktop
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

// Form switching state
const authMode = ref('login') // 'login' or 'register'

const switchToRegister = () => {
  authMode.value = 'register'
}

const switchToLogin = () => {
  authMode.value = 'login'
}

const handleRegistrationSuccess = ({ email }) => {
  // Handle successful registration
  console.log('Registration successful for:', email)
  // Switch to login mode after successful registration
  authMode.value = 'login'
  // You could pre-fill the email in login form if needed
}
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
                >{{ authMode === 'login'
                    ? 'Welcome back! Join us as we come together in faith and community, celebrating the spirit of service, devotion, and unity!'
                    : 'Join our spiritual community today! Together we celebrate faith, service, and unity in our parish family!'
                }}</span
              >"
            </h2>
          </v-col>
          <!-- Right Column: Combined Auth Form -->
          <v-col class="cardy" cols="12" md="6" lg="6" xl="6" sm="12">
            <!-- Form Mode Indicator -->


            <v-card
              class="mx-auto pa-8 pb-6"
              elevation="8"
              rounded="lg"
              v-bind:width="mobile ? '110%' : '80%'"
              max-width="600px"
            >
              <Transition name="form-fade" mode="out-in">
                <!-- Login Form -->
                <LoginForm
                  v-if="authMode === 'login'"
                  key="login"
                  @switch-to-register="switchToRegister"
                />

                <!-- Register Form -->
                <RegisterForm
                  v-else
                  key="register"
                  @switch-to-login="switchToLogin"
                  @registration-success="handleRegistrationSuccess"
                />
              </Transition>
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
}

.cardd {
  justify-content: center;
  display: flex;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Form transition animations */
.form-fade-enter-active,
.form-fade-leave-active {
  transition: all 0.4s ease;
}

.form-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.form-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Mode indicator styling */
.mode-indicator {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9) !important;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: slideInDown 0.8s ease-out;
}
</style>
