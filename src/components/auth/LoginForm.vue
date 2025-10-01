<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { supabase, formActionDefault } from '@/utils/supabase.js'
import {
  requiredValidator,
  emailValidator,
} from '@/utils/validators'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'

// Define emits
const emit = defineEmits(['switch-to-register'])

const router = useRouter()
const authUserStore = useAuthUserStore()

const loginDataDefault = {
  email: '',
  password: '',
}

const loginData = ref({ ...loginDataDefault })

const formAction = ref({ ...formActionDefault })

const isPasswordVisible = ref(false)

const refVform = ref()

const onLoginSubmit = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.value.email,
      password: loginData.value.password,
    })

    if (error) {
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
      return
    }

    formAction.value.formSuccessMessage = 'Successfully Logged in!'

    // Wait for authUser store to load user role after authentication
    await authUserStore.isAuthenticated()

    // Dynamic routing based on user's actual role from database
    if (authUserStore.isCurrentUserAdmin) {
      router.replace('/admin-dashboard')
    } else {
      router.replace('/homepage')
    }

  } catch (err) {
    console.error('Unexpected error:', err)
    formAction.value.formErrorMessage = 'An unexpected error occurred'
  } finally {
    refVform.value?.reset()
    loginData.value = { ...loginDataDefault }
    formAction.value.formProcess = false
  }
}

// Social sign-in handlers (use Supabase OAuth)
const signInWithGoogle = async () => {
  console.log('Signing in with Google...')
}

const signInWithFacebook = async () => {
  console.log('Signing in with Facebook...')
}

const switchToRegister = () => {
  emit('switch-to-register')
}

const onFormSubmit = () => {
  refVform.value?.validate().then(({ valid }) => {
    if (valid) {
      onLoginSubmit()
    }
  })
}
</script>

<template>
  <div class="login-container">
    <AlertNotification
      :form-success-message="formAction.formSuccessMessage"
      :form-error-message="formAction.formErrorMessage"
    />

    <v-form class="mt-1" ref="refVform" @submit.prevent="onFormSubmit">
      <!-- Welcome header with animation -->
      <div class="text-center mb-3">
        <v-avatar size="64" class="welcome-avatar">
          <v-icon size="60" color="primary">mdi-church</v-icon>
        </v-avatar>
        <h2 class="text-h4 text-primary mb-2 welcome-text">Welcome Back!</h2>
        <p class="text-body-2 text-medium-emphasis">Sign in to continue your spiritual journey</p>
      </div>

      <div class="auth-form-content">
        <!-- Email field with enhanced styling -->
        <div class="text-subtitle-1 text-medium-emphasis mb-2 d-flex align-center">
          <v-icon size="small" class="mr-2">mdi-email</v-icon>
          Email Address
        </div>

        <v-text-field
          v-model="loginData.email"
          density="comfortable"
          placeholder="Enter your email address"
          prepend-inner-icon="mdi-email-outline"
          :rules="[requiredValidator, emailValidator]"
          :counter="50"
          variant="outlined"
          color="primary"
          rounded="lg"
          class="animated-field"
          hide-details="auto"
        ></v-text-field>

        <!-- Password field with enhanced styling -->
        <div
          class="text-subtitle-1 text-medium-emphasis mb-2 d-flex align-center justify-space-between"
        >
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-2">mdi-lock</v-icon>
            Password
          </div>
          <v-btn variant="text" size="small" class="text-caption text-primary" @click="() => {}">
            Forgot password?
          </v-btn>
        </div>

        <v-text-field
          v-model="loginData.password"
          density="comfortable"
          :rules="[requiredValidator]"
          counter="20"
          placeholder="Enter your password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          color="primary"
          rounded="lg"
          :append-inner-icon="isPasswordVisible ? 'mdi-eye' : 'mdi-eye-off'"
          :type="isPasswordVisible ? 'text' : 'password'"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
          class="mb-4 animated-field"
          hide-details="auto"
        ></v-text-field>

        <!-- Enhanced login button with ripple effect -->
        <v-hover v-slot:default="{ isHovering, props }" close-delay="200">
          <v-btn
            v-bind="props"
            :elevation="isHovering ? 8 : 2"
            size="large"
            variant="elevated"
            color="primary"
            type="submit"
            :disabled="formAction.formProcess"
            :loading="formAction.formProcess"
            block
            class="login-btn mb-3"
            rounded="lg"
          >
            <v-icon icon="mdi-login" class="mr-2"></v-icon>
            <span class="text-h6">Sign In</span>
          </v-btn>
        </v-hover>

        <div class="toggle-links mt-3">
          <span>
            Don't have an account?
            <a @click="switchToRegister" class="toggle-link">Sign up</a>
          </span>
        </div>

        <!-- Social login divider -->
        <v-divider class="my-4">
          <span class="text-caption text-medium-emphasis px-3">Or continue with</span>
        </v-divider>

        <!-- Social login icons (replacing buttons) -->
        <v-row class="ma-0 justify-center">
          <v-col cols="6" class="pa-1 d-flex justify-center">
            <v-icon
              size="36"
              class="social-icon google--text"
              role="button"
              tabindex="0"
              @click="signInWithGoogle"
              @keyup.enter="signInWithGoogle"
              title="Sign in with Google"
            >
              mdi-google
            </v-icon>
          </v-col>
          <v-col cols="6" class="pa-1 d-flex justify-center">
            <v-icon
              size="36"
              class="social-icon facebook--text"
              role="button"
              tabindex="0"
              @click="signInWithFacebook"
              @keyup.enter="signInWithFacebook"
              title="Sign in with Facebook"
            >
              mdi-facebook
            </v-icon>
          </v-col>
        </v-row>
      </div>
    </v-form>
  </div>
</template>

<style scoped>
.welcome-avatar {
  animation: pulse 2s infinite;
  transition: all 0.3s ease;
}

.welcome-text {
  animation: slideInDown 0.8s ease-out;
}

.animated-field {
  transition: all 0.3s ease;
}

.animated-field:hover {
  transform: translateY(-2px);
}

.login-btn {
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #1976d2, #42a5f5) !important;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3) !important;
}

.social-btn {
  transition: all 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-2px);
}

.social-icon:hover,
.social-icon:focus {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(16, 24, 40, 0.08);
}

.google--text {
  color: #db4437; /* Google red */
}

.facebook--text {
  color: #1877f2; /* Facebook blue */
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced focus states */
.v-field--focused {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2) !important;
}

/* Loading spinner enhancement */
.v-btn--loading .v-btn__content {
  opacity: 0.6;
}

.cursor-pointer {
  cursor: pointer;
  text-decoration: underline;
}

.cursor-pointer:hover {
  text-decoration: none;
}

.toggle-link {
  color: #1976d2;
  cursor: pointer;
  text-decoration: underline;
}

.toggle-link:hover {
  text-decoration: none;
}
</style>
