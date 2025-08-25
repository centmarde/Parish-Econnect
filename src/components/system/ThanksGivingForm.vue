<script setup>
import { useDisplay } from 'vuetify'
import { ref } from 'vue'
import { supabase, formActionDefault } from '@/utils/supabase.js'
import AlertNotification from '@/components/common/AlertNotification.vue'

const { mdAndDown } = useDisplay()

// Form data refs
const formData = ref({
  first_name: '',
  last_name: '',
  middle_name: '',
  date: '',
  time: '',
  venue: '',
})

// Form action refs
const formAction = ref({ ...formActionDefault })
const valid = ref(false)
const refVform = ref()

const nameRules = [(v) => !!v || 'This field is required']
const dateRules = [(v) => !!v || 'Date is required']
const timeRules = [(v) => !!v || 'Time is required']

// Fetch the authenticated user
const getUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    console.error('Error fetching user:', error.message)
  }
  return user
}

// Insert form data and user_id into the bookings table
const onSubmit = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  // Fetch the authenticated user ID
  const user = await getUser()
  if (!user) {
    formAction.value.formErrorMessage = 'User not authenticated'
    formAction.value.formStatus = 'error'
    return
  }

  // Change 'bookings' to 'thanksgiving_bookings' and add missing fields
  const { data, error } = await supabase.from('thanksgiving_bookings').insert([
    {
      user_id: user.id,
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      middle_name: formData.value.middle_name,
      date: formData.value.date,
      time: formData.value.time,
      venue: formData.value.venue,
      status: 'pending', // Add default status
    },
  ])

  if (error) {
    console.error('Error inserting data:', error.message)
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.code
  } else {
    console.log('Data inserted successfully:', data)
    formAction.value.formSuccessMessage = 'Thanksgiving booking submitted successfully!'
    refVform.value?.reset()
  }

  formAction.value.formProcess = false
}

const onFormSubmit = () => {
  refVform.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}
</script>

<template>
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
  />

  <v-form v-model="valid" ref="refVform" @submit.prevent="onFormSubmit">
    <v-container>
      <v-row class="mt-5">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.first_name"
            :rules="nameRules"
            label="First Name"
            required
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.last_name"
            :rules="nameRules"
            label="Last Name"
            required
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.middle_name"
            :rules="nameRules"
            label="Middle Name"
            required
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.date"
            type="date"
            :rules="dateRules"
            label="Select Date"
            required
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.time"
            type="time"
            :rules="timeRules"
            label="Select Time"
            required
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-text-field v-model="formData.venue" :rules="nameRules" label="Venue" required />
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="auto">
          <v-hover v-slot:default="{ isHovering, props }">
            <v-btn
              v-bind="props"
              class="bg-primary pt-0 mt-0"
              :class="{ 'on-hover': isHovering }"
              :elevation="isHovering ? 16 : 2"
              size="large"
              variant="tonal"
              width="350"
              type="submit"
              v-blind:width="mdAndDown ? '80%' : '10%'"
              block
              :disabled="formAction.formProcess"
              :loading="formAction.formProcess"
            >
              Submit Thanksgiving Mass Form
            </v-btn>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<style scoped>
.green-hover {
  background-color: green !important;
  transition: background-color 0.3s ease;
}

.no-uppercase {
  text-transform: none !important;
}

.info {
  padding-bottom: 20px;
  font-family: 'RocknRoll One';
}
</style>

<!-- <script setup>
import { useDisplay } from 'vuetify'
import { ref } from 'vue'
const { mdAndDown } = useDisplay()

const isHovering = ref(false)
// Validation
const valid = ref(false)
const nameRules = [(v) => !!v || 'This field is required']
const emailRules = [(v) => !!v || 'This field is required']
const dateRules = [(v) => !!v || 'Date is required']
const timeRules = [(v) => !!v || 'Time is required']

const Bfirstname = ref('')
const Blastname = ref('')
const BMI = ref('')

// Wedding date/time
const date = ref('')
const time = ref('')
</script>

<template>
  <v-form v-model="valid" ref="form">
    <v-container>
      //First Row
      <v-row class="mt-5">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="Bfirstname"
            :rules="nameRules"
            label="First name"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="Blastname"
            :rules="nameRules"
            label="Last name"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field v-model="BMI" :rules="emailRules" label="M.I." required></v-text-field>
        </v-col>
      </v-row>

      //2nd Row
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="date"
            :rules="dateRules"
            type="date"
            label="Select date  "
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="time"
            :items="items"
            :item-props="itemProps"
            type="time"
            :rules="timeRules"
            label="Select  time"
            outlined
            dense
          >
          </v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-text-field
            v-model="time"
            :items="items"
            :item-props="itemProps"
            :rules="timeRules"
            label="Venue"
            outlined
            dense
          ></v-text-field>
        </v-col>
      </v-row>

      <br />

      <v-row justify="center" class="my-0">
        <v-col cols="auto">
          <v-btn
            v-model="valid"
            class="bg-primary pt-0"
            :class="{ 'green-hover': isHovering }"
            :elevation="isHovering ? 16 : 2"
            size="large"
            variant="tonal"
            width="300"
            v-blind:width="mdAndDown ? '80%' : '10%'"
            @mouseenter="isHovering = true"
            @mouseleave="isHovering = false"
            @click="valid = $refs.form.validate()"
          >
            <span>SUBMIT</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<style scoped>
.green-hover {
  background-color: green !important;
  transition: background-color 0.3s ease;
}

.no-uppercase {
  text-transform: none !important;
}

.info {
  padding-bottom: 20px;
  font-family: 'RocknRoll One';
}
</style> -->
