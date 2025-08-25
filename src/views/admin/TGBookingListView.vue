<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase.js'
import AdminHeader from '@/components/layout/AdminHeader.vue'

const thanks_giving_info = ref([
  {
    first_name: '',
    last_name: '',
    middle_name: '',
    date: '',
    time: '',
    venue: '',
  },
])

const loadThanksGivingInfo = async () => {
  const { data, error } = await supabase.from('bookings').select('*')
  if (error) {
    console.error('Error loading thanksgiving form info:', error.message)
  } else {
    thanks_giving_info.value = data
  }
}

onMounted(() => {
  loadThanksGivingInfo()
})
</script>

<template>
  <AdminHeader>
    <template #content>
      <v-container>
        <h1 class="pb-5">Thanks Giving List</h1>
        <v-row>
          <v-col>
            <v-table>
              <thead>
                <tr>
                  <th colspan="6" class="text-left"><b>Thanksgiving Mass</b></th>
                </tr>
                <tr>
                  <!-- Bride's Info Headers -->
                  <th class="text-left font-weight-bold">First Name</th>
                  <th class="text-left font-weight-bold">Last Name</th>
                  <th class="text-left font-weight-bold">Middle Initial</th>
                  <th class="text-left font-weight-bold">Selected Date</th>
                  <th class="text-left font-weight-bold">Selected Time</th>
                  <th class="text-left font-weight-bold">Venue</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in thanks_giving_info" :key="index">
                  <!-- Bride's Info -->
                  <td>{{ item.first_name }}</td>
                  <td>{{ item.last_name }}</td>
                  <td>{{ item.middle_name }}</td>
                  <td>{{ item.date }}</td>
                  <td>{{ item.time }}</td>
                  <td>{{ item.venue }}</td>
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
