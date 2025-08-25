<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { supabase, formActionDefault } from '@/utils/supabase.js'
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmedValidator,
} from '@/utils/validators'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TermsDialog from '@/components/auth/dialogs/TermsDialog.vue'
import PrivacyDialog from '@/components/auth/dialogs/PrivacyDialog.vue'
import HelpDialog from '@/components/auth/dialogs/HelpDialog.vue'

const router = useRouter()

const formMode = ref('login')

const termsDialog = ref(false)
const privacyDialog = ref(false)
const helpDialog = ref(false)

const loginDataDefault = {
  email: '',
  password: '',
  userType: 'user',
}

const registerDataDefault = {
  fname: '',
  lname: '',
  email: '',
  gender: '',
  address: '',
  number: '',
  password: '',
  password_confirmation: '',
}

const userTypeOptions = [
  {
    value: 'user',
    title: 'User',
    icon: 'mdi-account',
    description: 'Access member portal',
    color: 'primary',
  },
  {
    value: 'admin',
    title: 'Admin',
    icon: 'mdi-shield-account',
    description: 'Administrative access',
    color: 'warning',
  },
]

const loginData = ref({ ...loginDataDefault })
// computed selected user type and safe icon (avoid undefined access in template)
const selectedUserType = computed(() => {
  const val = loginData.value?.userType
  return userTypeOptions.find((o) => o.value === val) ?? userTypeOptions[0]
})

const selectedUserIcon = computed(() => selectedUserType.value?.icon ?? 'mdi-account')
const registerData = ref({ ...registerDataDefault })

const formAction = ref({ ...formActionDefault })

const isPasswordVisible = ref(false)

const refVform = ref()


const isLoginMode = computed(() => formMode.value === 'login')

// Computed proxy that points to loginData or registerData depending on mode
//const formData = computed(() => (isLoginMode.value ? loginData.value : registerData.value))

const switchMode = (mode) => {
  formMode.value = mode
  formAction.value = { ...formActionDefault }
  refVform.value?.resetValidation()
}

const onLoginSubmit = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.value.email,
      password: loginData.value.password,
    })

    if (error) {
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
      return
    }

    const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
      check_user_id: data.user.id,
    })

    if (roleError) {
      console.error('Role fetch error:', roleError)
      formAction.value.formErrorMessage = 'Could not determine user role'
      return
    }

    const actualUserRole = roleData?.trim().toLowerCase()
    const selectedUserType = loginData.value.userType

    if (selectedUserType === 'admin' && actualUserRole !== 'admin') {
      formAction.value.formErrorMessage = 'Access denied: You do not have admin privileges'
      return
    }

    formAction.value.formSuccessMessage = 'Successfully Logged in!'

    switch (selectedUserType) {
      case 'admin':
        router.replace('/admin-dashboard')
        break
      default:
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

const onRegisterSubmit = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  const { data, error } = await supabase.auth.signUp({
    email: registerData.value.email,
    password: registerData.value.password,
    options: {
      data: {
        fname: registerData.value.fname,
        lname: registerData.value.lname,
        gender: registerData.value.gender,
        address: registerData.value.address,
        number: registerData.value.number,
      },
    },
  })

  if (error) {
    console.log(error)
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    console.log(data)
    formAction.value.formSuccessMessage = 'Successfully Registered Account!'
    setTimeout(() => {
      switchMode('login')
      loginData.value.email = registerData.value.email
    }, 2000)
  }

  refVform.value?.reset()
  formAction.value.formProcess = false
}

// Social sign-in handlers (use Supabase OAuth)
const signInWithGoogle = async () => {
  console.log('Signing in with Google...')
}

const signInWithFacebook = async () => {
  console.log('Signing in with Facebook...')
}

const openTermsDialog = () => {
  termsDialog.value = { isOpen: true, contentType: 'terms' }
}

const openPrivacyDialog = () => {
  privacyDialog.value = { isOpen: true, contentType: 'privacy' }
}

const openHelpDialog = () => {
  helpDialog.value = { isOpen: true, contentType: 'help' }
}

const onFormSubmit = () => {
  refVform.value?.validate().then(({ valid }) => {
    if (valid) {
      if (isLoginMode.value) {
        onLoginSubmit()
      } else {
        onRegisterSubmit()
      }
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


      <div v-if="isLoginMode" class="auth-form-content">
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

        <v-select
          v-model="loginData.userType"
          :items="userTypeOptions"
          item-title="title"
          item-value="value"
          color="primary"
          density="comfortable"
          variant="outlined"
          rounded="lg"
          prepend-inner-icon="mdi-account-switch"
          label="Login as"
          class="my-4 animated-field"
          hide-details
        >
          <template #selection="{ item }">
            <div class="d-flex align-center">
              <v-icon :icon="item.raw.icon" size="18" class="mr-2"></v-icon>
              {{ item.raw.title }}
            </div>
          </template>
          <template #item="{ props, item }">
            <v-list-item v-bind="props" :prepend-icon="item.raw.icon">
              <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-select>

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
            <v-icon :icon="selectedUserIcon" class="mr-2"></v-icon>

            <span class="text-h6">Sign In</span>
          </v-btn>
        </v-hover>
        <div class="toggle-links">
          <span>
            Don't have an account?
            <a @click="switchMode('register')" class="toggle-link">Sign up</a>
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

      <div v-else class="auth-form-content register-content">
        <div class="mb-1">
          <v-chip color="primary" variant="tonal" class="mb-3">
            <v-icon left size="small">mdi-account</v-icon>
            Personal Information
          </v-chip>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="registerData.fname"
              :rules="[requiredValidator]"
              label="First Name"
              variant="outlined"
              color="primary"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              class="form-field"
              hide-details="auto"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="registerData.lname"
              :rules="[requiredValidator]"
              label="Last Name"
              variant="outlined"
              color="primary"
              density="comfortable"
              prepend-inner-icon="mdi-account"
              class="form-field"
              hide-details="auto"
              required
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="registerData.number"
              :rules="[requiredValidator]"
              label="Phone Number"
              variant="outlined"
              color="primary"
              density="comfortable"
              prepend-inner-icon="mdi-phone"
              class="form-field"
              hide-details="auto"
              type="tel"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="registerData.email"
              :rules="[requiredValidator, emailValidator]"
              placeholder="example@gmail.com"
              label="Email Address"
              variant="outlined"
              color="primary"
              density="comfortable"
              prepend-inner-icon="mdi-email"
              class="form-field"
              hide-details="auto"
              type="email"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="registerData.password"
              label="Create Password"
              :rules="[requiredValidator, passwordValidator]"
              variant="outlined"
              color="primary"
              density="comfortable"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="isPasswordVisible ? 'mdi-eye' : 'mdi-eye-off'"
              :type="isPasswordVisible ? 'text' : 'password'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
              class="form-field"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="registerData.password_confirmation"
              :rules="[
                requiredValidator,
                confirmedValidator(registerData.password_confirmation, registerData.password),
              ]"
              label="Confirm Password"
              variant="outlined"
              color="primary"
              density="comfortable"
              prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="isPasswordConfirmationVisible ? 'mdi-eye' : 'mdi-eye-off'"
              :type="isPasswordConfirmationVisible ? 'text' : 'password'"
              @click:append-inner="isPasswordConfirmationVisible = !isPasswordConfirmationVisible"
              class="form-field"
              hide-details="auto"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="registerData.address"
              :rules="[requiredValidator]"
              counter="25"
              label="Complete Address"
              variant="outlined"
              color="primary"
              density="comfortable"
              prepend-inner-icon="mdi-map-marker"
              class="form-field"
              hide-details="auto"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="registerData.gender"
              :items="['Male', 'Female']"
              label="Gender"
              variant="outlined"
              color="primary"
              density="comfortable"
              prepend-inner-icon="mdi-gender-male-female"
              :rules="[requiredValidator]"
              class="form-field"
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <!-- Terms and Conditions -->
        <v-card class="mt-2 mb-4" variant="tonal" color="primary">
          <v-card-text class="text-center pa-4">
            <v-icon size="24" color="primary" class="mb-2">mdi-information</v-icon>
            <p class="text-body-2 mb-0">
              By creating an account, you agree to our
              <a @click="openTermsDialog(termsDialog)" class="text-primary cursor-pointer"
                >Terms of Service</a
              >
              and
              <a @click="openPrivacyDialog(privacyDialog)" class="text-primary cursor-pointer"
                >Privacy Policy</a
              >
            </p>
          </v-card-text>
        </v-card>

        <!-- Enhanced Submit Button -->
        <v-hover v-slot:default="{ isHovering, props }" close-delay="200">
          <v-btn
            v-bind="props"
            :elevation="isHovering ? 12 : 4"
            size="x-large"
            variant="elevated"
            color="primary"
            type="submit"
            block
            :disabled="formAction.formProcess"
            :loading="formAction.formProcess"
            class="register-btn mt-4"
            rounded="lg"
          >
            <v-icon left class="mr-2">mdi-account-plus</v-icon>
            <span class="text-h6">Create My Account</span>
          </v-btn>
        </v-hover>

        <div class="toggle-links mt-3">
          <span>
            Already have an account?
            <a @click="switchMode('login')" class="toggle-link">Sign in</a>
          </span>
        </div>

        <!-- Registration Help -->
        <v-row class="mt-2" no-gutters>
          <v-col cols="12" class="text-center">
            <v-btn
              variant="text"
              size="small"
              color="primary"
              prepend-icon="mdi-help-circle"
              @click="openHelpDialog(helpDialog)"
            >
              Need help with registration?
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-form>

    <!-- Dialogs -->
    <TermsDialog v-model:isOpen="termsDialog.isOpen" />
    <PrivacyDialog v-model:isOpen="privacyDialog.isOpen" />
    <HelpDialog v-model:isOpen="helpDialog.isOpen" />

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
</style>
