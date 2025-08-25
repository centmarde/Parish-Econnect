<script setup>
import { useRouter } from 'vue-router'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import NavBar2 from '@/components/layout/NavBar2.vue'
import AppBar from '@/components/layout/AppBar.vue'
// Router
const router = useRouter()

// Navigate to book-event
const goToBookEvent = () => {
  router.push('/book-event')
}
</script>

<template>
  <PreloaderView></PreloaderView>
  <NavBar2>
    <template #content>
      <v-container class="pa-6">
        <div class="text-h5 text-success mb-4 text-center">
          <v-icon start size="large">mdi-check-circle</v-icon>
          Wedding Application Submitted Successfully!
        </div>

        <v-divider class="my-4" />

        <div class="text-center">
          <v-icon color="success" size="80" class="mb-4"> mdi-clock-check-outline </v-icon>

          <h3 class="text-h6 mb-3 text-grey-darken-2">Your Application is Pending Approval</h3>

          <p class="text-body-1 text-grey-darken-1 mb-4 mx-auto" style="max-width: 500px">
            Thank you for submitting your wedding mass application. Our parish office will review
            your request and contact you within 2-3 business days for the next steps.
          </p>

          <v-alert type="info" variant="tonal" class="ma-4 text-left">
            <template #prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <div class="text-body-2">
              <strong>What happens next?</strong><br />
              • Parish staff will verify your information<br />
              • You'll receive a confirmation call or email<br />
              • Required documents will be discussed during confirmation<br />
              • Wedding preparation schedule will be arranged
            </div>
          </v-alert>

          <div class="mt-6">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              @click="goToBookEvent"
              class="px-8"
            >
              <v-icon start>mdi-calendar-plus</v-icon>
              Book Another Event
            </v-btn>
          </div>

          <p class="text-caption text-grey mt-4">
            For inquiries, please contact the parish office during business hours.
          </p>
        </div>
        <AppBar />
      </v-container></template
    >
  </NavBar2>
</template>
