<script setup>
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

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
  // Pre-fill email in login form if needed
  authMode.value = 'login'
  // You could pass the email as a prop to LoginForm if needed
}
</script>

<template>
  <div class="auth-wrapper">
    <v-container class="fill-height" fluid>
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="elevation-12 auth-card" rounded="xl">
            <v-card-text class="pa-8">
              <!-- Login Form -->
              <LoginForm
                v-if="authMode === 'login'"
                @switch-to-register="switchToRegister"
              />

              <!-- Register Form -->
              <RegisterForm
                v-else
                @switch-to-login="switchToLogin"
                @registration-success="handleRegistrationSuccess"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
}

.fill-height {
  min-height: 100vh;
}
</style>
