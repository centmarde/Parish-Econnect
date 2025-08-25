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
  birth_date: '',
  death_date: '',
  age: '',
  funeral_date: '',
  funeral_time: '',
  contact_fullname: '',
  relationship: '',
  email: '',
  number: '',
})

// Form action refs
const formAction = ref({ ...formActionDefault })
const refVform = ref()

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

  const { data, error } = await supabase.from('funeral_bookings').insert([
    {
      user_id: user.id,
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
      middle_name: formData.value.middle_name,
      birth_date: formData.value.birth_date,
      death_date: formData.value.death_date,
      age: formData.value.age,
      funeral_date: formData.value.funeral_date,
      funeral_time: formData.value.funeral_time,
      contact_fullname: formData.value.contact_fullname,
      relationship: formData.value.relationship,
      email: formData.value.email,
      number: formData.value.number,
    },
  ])

  if (error) {
    console.error('Error inserting data:', error.message)
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.code
  } else {
    console.log('Data inserted successfully:', data)
    formAction.value.formSuccessMessage = 'Funeral mass booking submitted successfully!'
    refVform.value?.reset()
  }

  formAction.value.formProcess = false
}

const showRequirements = ref(false)
const requirements = ref(['Birth Certificate', 'Death Certificates '])
// Validation
const valid = ref(false)
const nameRules = [(v) => !!v || 'This field is required']
const emailRules = [(v) => !!v || 'This field is required']
const dateRules = [(v) => !!v || 'Date is required']
const timeRules = [(v) => !!v || 'Time is required']

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
      <h2 class="info mt-7">Deceased Information</h2>

      <!--First Row-->
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.first_name"
            :rules="nameRules"
            label="First name"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.last_name"
            :rules="nameRules"
            label="Last name"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.middle_name"
            :rules="nameRules"
            label="Middle Name"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <!--Second Row-->
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.birth_date"
            :rules="nameRules"
            label="Date of Birth "
            type="date"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.death_date"
            :rules="dateRules"
            type="date"
            label="Date of Death"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.age"
            :rules="dateRules"
            type="number"
            label="Age"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <!--3rd Row-->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.funeral_date"
            :rules="dateRules"
            type="date"
            label="Select funeral date  "
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.funeral_time"
            :items="items"
            :item-props="itemProps"
            type="time"
            :rules="timeRules"
            label="Select funeral time"
            outlined
            dense
          >
          </v-text-field>
        </v-col>
      </v-row>

      <!--4th Row-->

      <h2 class="info mt-7">Contact Person</h2>
      <v-row>
        <v-col cols="12" md="12">
          <v-text-field
            v-model="formData.contact_fullname"
            :rules="nameRules"
            label="Complete Name"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <!--5th Row-->

      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.relationship"
            :rules="nameRules"
            label="Relationship"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.email"
            :rules="emailRules"
            label="Email"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="formData.number"
            :rules="emailRules"
            type="number"
            label="Phone Number"
            inputmode="+63"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <v-btn @click="showRequirements = true" flat class="no-uppercase text-blue-darken-2">
        <u> Click to view the following requirements</u>
      </v-btn>

      <v-dialog v-model="showRequirements" max-width="500px">
        <v-card class="pa-4" elevation="2">
          <v-card-title class="text-h6">Required Documents</v-card-title>
          <v-card-text>
            <p>Please make sure to submit the following documents at the parish:</p>
            <v-list dense>
              <v-list-item v-for="(item, index) in requirements" :key="index">
                <v-list-item-content>
                  <v-list-item-title>• {{ item }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text></v-card
        ></v-dialog
      >

      <br />

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
              Submit Funeral Mass Form
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
