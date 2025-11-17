<script setup>
import { computed } from 'vue'

const props = defineProps({
  trendData: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const tableData = computed(() => {
  return props.trendData.map(monthData => ({
    month: monthData.month,
    baptism: monthData.baptism,
    wedding: monthData.wedding,
    funeral: monthData.funeral,
    thanksgiving: monthData.thanksgiving,
    others: monthData.others,
    total: monthData.baptism + monthData.wedding + monthData.funeral + monthData.thanksgiving + monthData.others
  }))
})

const columnTotals = computed(() => {
  if (!props.trendData || props.trendData.length === 0) {
    return { baptism: 0, wedding: 0, funeral: 0, thanksgiving: 0, others: 0, total: 0 }
  }

  return props.trendData.reduce((acc, month) => {
    acc.baptism += month.baptism
    acc.wedding += month.wedding
    acc.funeral += month.funeral
    acc.thanksgiving += month.thanksgiving
    acc.others += month.others
    acc.total += month.baptism + month.wedding + month.funeral + month.thanksgiving + month.others
    return acc
  }, { baptism: 0, wedding: 0, funeral: 0, thanksgiving: 0, others: 0, total: 0 })
})
</script>

<template>
  <div>
    <v-table density="compact" class="elevation-1">
      <thead>
        <tr>
          <th class="text-center font-weight-bold" style="background-color: #4A5568; color: white;">Month</th>
          <th class="text-center font-weight-bold" style="background-color: #2196F3; color: white;">Baptism</th>
          <th class="text-center font-weight-bold" style="background-color: #E91E63; color: white;">Wedding</th>
          <th class="text-center font-weight-bold" style="background-color: #795548; color: white;">Funeral</th>
          <th class="text-center font-weight-bold" style="background-color: #9C27B0; color: white;">Thanksgiving</th>
          <th class="text-center font-weight-bold" style="background-color: #FFFFFF; color: black;">Others</th>
          <th class="text-center font-weight-bold" style="background-color: #2D3748; color: white;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in tableData" :key="row.month">
          <td class="text-center font-weight-medium">{{ row.month }}</td>
          <td class="text-center">{{ row.baptism }}</td>
          <td class="text-center">{{ row.wedding }}</td>
          <td class="text-center">{{ row.funeral }}</td>
          <td class="text-center">{{ row.thanksgiving }}</td>
          <td class="text-center">{{ row.others }}</td>
          <td class="text-center font-weight-bold">{{ row.total }}</td>
        </tr>
        <tr v-if="tableData.length > 0" >
          <td class="text-center font-weight-bold">TOTAL</td>
          <td class="text-center font-weight-bold">{{ columnTotals.baptism }}</td>
          <td class="text-center font-weight-bold">{{ columnTotals.wedding }}</td>
          <td class="text-center font-weight-bold">{{ columnTotals.funeral }}</td>
          <td class="text-center font-weight-bold">{{ columnTotals.thanksgiving }}</td>
          <td class="text-center font-weight-bold">{{ columnTotals.others }}</td>
          <td class="text-center font-weight-bold text-primary">{{ columnTotals.total }}</td>
        </tr>
      </tbody>
    </v-table>

    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else-if="tableData.length === 0" class="text-center py-8 text-grey">
      <v-icon size="64" color="grey-lighten-1">mdi-table-remove</v-icon>
      <p class="mt-2">No booking data available</p>
    </div>
  </div>
</template>
