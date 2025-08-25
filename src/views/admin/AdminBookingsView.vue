<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase.js'
import AdminHeader from '@/components/layout/AdminHeader.vue'

const wedding_info = ref([
  {
    bride_firstname: '',
    bride_lastname: '',
    bride_middlename: '',
    bride_birthplace: '',
    bride_birthdate: '',
    bride_age: '',
    bride_citizenship: '',
    bride_religion: '',
    bride_gender: '',
    bride_residence: '',
    bride_motherfullname: '',
    bride_mothercitizenship: '',
    bride_fatherfullname: '',
    bride_fathercitizenship: '',
    groom_firstname: '',
    groom_lastname: '',
    groom_middlename: '',
    groom_birthplace: '',
    groom_birthdate: '',
    groom_age: '',
    groom_citizenship: '',
    groom_religion: '',
    groom_gender: '',
    groom_residence: '',
    groom_motherfullname: '',
    groom_mothercitizenship: '',
    groom_fatherfullname: '',
    groom_fathercitizenship: '',
    wedding_date: '',
    wedding_time: '',
  },
])

const loadWeddingInfo = async () => {
  const { data, error } = await supabase.from('wedding_bookings').select('*')
  if (error) {
    console.error('Error loading wedding form info:', error.message)
  } else {
    wedding_info.value = data
  }
}

onMounted(() => {
  loadWeddingInfo()
})
</script>

<template>
  <AdminHeader>
    <template #content>
      <v-container>
        <h1 class="pb-5">Special Wedding List</h1>
        <v-row>
          <v-col>
            <v-table>
              <thead>
                <tr>
                  <th colspan="14" class="text-left"><b>Bride's Information</b></th>
                  <th colspan="16">
                    <b>Groom's Information</b>
                  </th>
                </tr>
                <tr>
                  <!-- Bride's Info Headers -->
                  <th class="text-left font-weight-bold">First Name</th>
                  <th class="text-left font-weight-bold">Last Name</th>
                  <th class="text-left font-weight-bold">Middle Name</th>
                  <th class="text-left font-weight-bold">Place of Birth</th>
                  <th class="text-left font-weight-bold">Date of Birth</th>
                  <th class="text-left font-weight-bold">Age</th>
                  <th class="text-left font-weight-bold">Citizenship</th>
                  <th class="text-left font-weight-bold">Religion</th>
                  <th class="text-left font-weight-bold">Gender</th>
                  <th class="text-left font-weight-bold">Residence</th>
                  <th class="text-left font-weight-bold">Mother's Full Name</th>
                  <th class="text-left font-weight-bold">Mother's Citizenship</th>
                  <th class="text-left font-weight-bold">Father's Full Name</th>
                  <th class="text-left font-weight-bold">Father's Citizenship</th>

                  <!-- Groom's Info Headers -->
                  <th class="text-left font-weight-bold">First Name</th>
                  <th class="text-left font-weight-bold">Last Name</th>
                  <th class="text-left font-weight-bold">Middle Name</th>
                  <th class="text-left font-weight-bold">Place of Birth</th>
                  <th class="text-left font-weight-bold">Date of Birth</th>
                  <th class="text-left font-weight-bold">Age</th>
                  <th class="text-left font-weight-bold">Citizenship</th>
                  <th class="text-left font-weight-bold">Religion</th>
                  <th class="text-left font-weight-bold">Gender</th>
                  <th class="text-left font-weight-bold">Residence</th>
                  <th class="text-left font-weight-bold">Mother's Full Name</th>
                  <th class="text-left font-weight-bold">Mother's Citizenship</th>
                  <th class="text-left font-weight-bold">Father's Full Name</th>
                  <th class="text-left font-weight-bold">Father's Citizenship</th>
                  <th class="text-left font-weight-bold">Selected Date for the Wedding</th>
                  <th class="text-left font-weight-bold">Selected Time for the Wedding</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in wedding_info" :key="index">
                  <!-- Bride's Info -->
                  <td>{{ item.bride_firstname }}</td>
                  <td>{{ item.bride_lastname }}</td>
                  <td>{{ item.bride_middlename }}</td>
                  <td>{{ item.bride_birthplace }}</td>
                  <td>{{ item.bride_birthdate }}</td>
                  <td>{{ item.bride_age }}</td>
                  <td>{{ item.bride_citizenship }}</td>
                  <td>{{ item.bride_religion }}</td>
                  <td>{{ item.bride_gender }}</td>
                  <td>{{ item.bride_residence }}</td>
                  <td>{{ item.bride_motherfullname }}</td>
                  <td>{{ item.bride_mothercitizenship }}</td>
                  <td>{{ item.bride_fatherfullname }}</td>
                  <td>{{ item.bride_fathercitizenship }}</td>

                  <td>{{ item.groom_firstname }}</td>
                  <td>{{ item.groom_lastname }}</td>
                  <td>{{ item.groom_middlename }}</td>
                  <td>{{ item.groom_birthplace }}</td>
                  <td>{{ item.groom_birthdate }}</td>
                  <td>{{ item.groom_age }}</td>
                  <td>{{ item.groom_citizenship }}</td>
                  <td>{{ item.groom_religion }}</td>
                  <td>{{ item.groom_gender }}</td>
                  <td>{{ item.groom_residence }}</td>
                  <td>{{ item.groom_motherfullname }}</td>
                  <td>{{ item.groom_mothercitizenship }}</td>
                  <td>{{ item.groom_fatherfullname }}</td>
                  <td>{{ item.groom_fathercitizenship }}</td>

                  <td>{{ item.wedding_date }}</td>
                  <td>{{ item.wedding_time }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AdminHeader>
</template>

<style scoped>
.card-shadow {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.flex-grow-1 {
  flex-grow: 1;
}

th,
td {
  white-space: nowrap;
}

th,
td {
  border: 1px solid black;
}

th {
  background: #2a7b9b;
  background: linear-gradient(
    90deg,
    rgba(42, 123, 155, 1) 0%,
    rgba(87, 199, 133, 1) 50%,
    rgba(237, 221, 83, 1) 100%
  );
}

h1 {
  font-family: 'Georgia', 'Times New Roman', serif;
}

th {
  font-family: 'IBM Plex Sans', sans-serif;
  font-optical-sizing: auto;
}
</style>
