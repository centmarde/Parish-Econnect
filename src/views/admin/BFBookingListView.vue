<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase.js'
import AdminHeader from '@/components/layout/AdminHeader.vue'

const baptism_info = ref([
  {
    first_name: '',
    last_name: '',
    middle_name: '',
    place_of_birth: '',
    birthdate: '',
    date_selected: '',
    time_selected: '',
    mother_fullname: '',
    father_fullname: '',
    sponsor1_fullname: '',
    sponsor2_fullname: '',
    sponsor3_fullname: '',
  },
])

const loadBaptismInfo = async () => {
  const { data, error } = await supabase.from('baptism_bookings').select('*')
  if (error) {
    console.error('Error loading baptism info:', error.message)
  } else {
    baptism_info.value = data
  }
}

onMounted(() => {
  loadBaptismInfo()
})
</script>

<template>
  <AdminHeader>
    <template #content>
      <v-container>
        <h1 class="pb-5">Baptised List</h1>
        <v-row>
          <v-col>
            <v-table>
              <thead>
                <tr>
                  <th colspan="7" class="text-left"><b>Baptised Information</b></th>
                  <th colspan="1">
                    <b>Mother's Information</b>
                  </th>

                  <th colspan="1" class="text-left"><b>Father's Information</b></th>
                  <th colspan="1">
                    <b>Sponsor 1 Information</b>
                  </th>

                  <th colspan="1" class="text-left"><b>Sponsor 2 Information</b></th>
                  <th colspan="1">
                    <b>Sponsor 3 Information</b>
                  </th>
                </tr>
                <tr>
                  <!-- Baptised Information -->
                  <th class="text-left font-weight-bold">First Name</th>
                  <th class="text-left font-weight-bold">Last Name</th>
                  <th class="text-left font-weight-bold">Middle Initial</th>
                  <th class="text-left font-weight-bold">Place of Birth</th>
                  <th class="text-left font-weight-bold">Date of Birth</th>
                  <th class="text-left font-weight-bold">Date Selected</th>
                  <th class="text-left font-weight-bold">Time Selected</th>

                  <!-- Mother's Name -->
                  <th class="text-left font-weight-bold">
                    Complete Name (First Name, Middle Name, Last Name)
                  </th>

                  <!-- Father's Name -->
                  <th class="text-left font-weight-bold">
                    Complete Name (First Name, Middle Name, Last Name)
                  </th>

                  <!-- Sponsored by: -->
                  <th class="text-left font-weight-bold">
                    Complete Name (First Name, Middle Name, Last Name)
                  </th>

                  <!-- Sponsored by: -->
                  <th class="text-left font-weight-bold">
                    Complete Name (First Name, Middle Name, Last Name)
                  </th>

                  <!-- Sponsored by: -->
                  <th class="text-left font-weight-bold">
                    Complete Name (First Name, Middle Name, Last Name)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in baptism_info" :key="index">
                  <!-- Baptised Info -->
                  <td>{{ item.first_name }}</td>
                  <td>{{ item.last_name }}</td>
                  <td>{{ item.middle_name }}</td>
                  <td>{{ item.place_of_birth }}</td>
                  <td>{{ item.birthdate }}</td>
                  <td>{{ item.date_selected }}</td>
                  <td>{{ item.time_selected }}</td>

                  <td>{{ item.mother_fullname }}</td>
                  <td>{{ item.father_fullname }}</td>
                  <td>{{ item.sponsor1_fullname }}</td>
                  <td>{{ item.sponsor2_fullname }}</td>
                  <td>{{ item.sponsor3_fullname }}</td>
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
