<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { supabase, formActionDefault } from '@/utils/supabase.js'
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmedValidator,
} from '@/utils/validators'
import { ref } from 'vue'
import TermsDialog from '@/components/auth/dialogs/TermsDialog.vue'
import PrivacyDialog from '@/components/auth/dialogs/PrivacyDialog.vue'
import HelpDialog from '@/components/auth/dialogs/HelpDialog.vue'

// Define emits
const emit = defineEmits(['registration-success', 'switch-to-login'])

const termsDialog = ref(false)
const privacyDialog = ref(false)
const helpDialog = ref(false)

const registerDataDefault = {
  email: '',
  password: '',
  password_confirmation: '',
  role: 'user', // default role para sa mga bag-ong users
}

const registerData = ref({ ...registerDataDefault })
const formAction = ref({ ...formActionDefault })
const isPasswordVisible = ref(false)
const isPasswordConfirmationVisible = ref(false)
const refVform = ref()

const onRegisterSubmit = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  // Step 1: Create auth user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: registerData.value.email,
    password: registerData.value.password,
  })

  if (authError) {
    console.log(authError)
    formAction.value.formErrorMessage = authError.message
    formAction.value.formStatus = authError.status
    formAction.value.formProcess = false
    return
  }

  // Step 2: Insert user role into user_roles table kung successful ang auth
  if (authData?.user) {
    // Check if user role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', authData.user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      console.log('Error checking existing role:', checkError)
      formAction.value.formErrorMessage = `Account created but role check failed: ${checkError.message}`
      formAction.value.formProcess = false
      return
    }

    let roleData, roleError

    if (existingRole) {
      // User role exists, update it
      const { data, error } = await supabase
        .from('user_roles')
        .update({ role: registerData.value.role })
        .eq('user_id', authData.user.id)

      roleData = data
      roleError = error
    } else {
      // User role doesn't exist, insert new record
      const { data, error } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: authData.user.id,
            role: registerData.value.role
          }
        ])

      roleData = data
      roleError = error
    }

    if (roleError) {
      console.log('Role assignment error:', roleError)
      formAction.value.formErrorMessage = `Account created but role assignment failed: ${roleError.message}`
      formAction.value.formProcess = false
      return
    }

    // Success - both auth and role assignment completed
    console.log('Registration successful:', { authData, roleData })
    formAction.value.formSuccessMessage = 'Successfully Registered Account!'
    setTimeout(() => {
      // Emit registration success with email for parent to handle
      emit('registration-success', { email: registerData.value.email })
    }, 2000)
  }

  refVform.value?.reset()
  formAction.value.formProcess = false
}



const openHelpDialog = () => {
  helpDialog.value = { isOpen: true, contentType: 'help' }
}

const switchToLogin = () => {
  emit('switch-to-login')
}

const onFormSubmit = () => {
  refVform.value?.validate().then(({ valid }) => {
    if (valid) {
      onRegisterSubmit()
    }
  })
}
</script>

<template>
  <div class="register-container">
    <AlertNotification
      :form-success-message="formAction.formSuccessMessage"
      :form-error-message="formAction.formErrorMessage"
    />

    <v-form class="mt-1" ref="refVform" @submit.prevent="onFormSubmit">
      <!-- Welcome header with animation -->
      <div class="text-center mb-3">
        <v-avatar size="64" class="welcome-avatar">
          <v-icon size="60" color="primary">mdi-account-plus</v-icon>
        </v-avatar>
        <h2 class="text-h4 text-primary mb-2 welcome-text">Create Account</h2>
        <p class="text-body-2 text-medium-emphasis">Join our spiritual community today</p>
      </div>

      <div class="auth-form-content register-content">
        <v-row>
          <v-col cols="12">
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

        <!-- Account Role Selection -->
        <div class="mb-1 mt-4">
          <v-chip color="secondary" variant="tonal" class="mb-3">
            <v-icon left size="small">mdi-shield-account</v-icon>
            Account Type
          </v-chip>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="registerData.role"
              :items="[
                { title: 'Regular User', value: 'user', subtitle: 'Standard parish member access' },
                { title: 'Administrator', value: 'admin', subtitle: 'Full system access and management' }
              ]"
              item-title="title"
              item-value="value"
              label="Select Account Type"
              variant="outlined"
              color="primary"
              density="comfortable"
              prepend-inner-icon="mdi-account-cog"
              :rules="[requiredValidator]"
              class="form-field"
              hide-details="auto"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">

                  <v-list-item-subtitle class="text-caption">{{ item.raw.subtitle }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center">
            <v-alert
              v-if="registerData.role === 'admin'"
              type="warning"
              variant="tonal"
              density="compact"
              class="text-caption"
            >
              <v-icon size="small" class="mr-1">mdi-information</v-icon>
              Admin accounts have access to user management and system settings
            </v-alert>
            <v-alert
              v-else
              type="info"
              variant="tonal"
              density="compact"
              class="text-caption"
            >
              <v-icon size="small" class="mr-1">mdi-check-circle</v-icon>
              Standard user account for parish services
            </v-alert>
          </v-col>
        </v-row>



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
            <a @click="switchToLogin" class="toggle-link">Sign in</a>
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

.form-field {
  transition: all 0.3s ease;
}

.form-field:hover {
  transform: translateY(-2px);
}

.register-btn {
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #1976d2, #42a5f5) !important;
}

.register-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3) !important;
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
