<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBookingStats } from '../composables/bookingStats.js'
import { exportBookingTrendsReport, exportBookingTrendsExcel } from '../utils/exportReport.js'
import BookingTrendsTable from './BookingTrendsTable.vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const { currentMonthCounts, trendData, loading, error, loadCurrentMonthStats, loadTrendData } = useBookingStats()

const selectedPeriod = ref(6) // months
const showTableView = ref(false)
const exporting = ref(false)
const exportSuccess = ref(false)
const exportDialog = ref(false)
const selectedFormat = ref('docx')

const chartData = computed(() => {
  if (!trendData.value || trendData.value.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: trendData.value.map(d => d.month),
    datasets: [
      {
        label: 'Baptism',
        data: trendData.value.map(d => d.baptism),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Wedding',
        data: trendData.value.map(d => d.wedding),
        borderColor: '#f093fb',
        backgroundColor: 'rgba(240, 147, 251, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Funeral',
        data: trendData.value.map(d => d.funeral),
        borderColor: '#4facfe',
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Thanksgiving',
        data: trendData.value.map(d => d.thanksgiving),
        borderColor: '#43e97b',
        backgroundColor: 'rgba(67, 233, 123, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Others',
        data: trendData.value.map(d => d.others),
        borderColor: '#fa709a',
        backgroundColor: 'rgba(250, 112, 154, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 13
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}

const currentMonthStats = computed(() => {
  const counts = currentMonthCounts.value
  return [
    { type: 'Baptism', count: counts.baptism, color: '#667eea', icon: 'mdi-water' },
    { type: 'Wedding', count: counts.wedding, color: '#f093fb', icon: 'mdi-heart' },
    { type: 'Funeral', count: counts.funeral, color: '#4facfe', icon: 'mdi-candle' },
    { type: 'Thanksgiving', count: counts.thanksgiving, color: '#43e97b', icon: 'mdi-hands-pray' },
    { type: 'Others', count: counts.others, color: '#fa709a', icon: 'mdi-dots-horizontal' }
  ]
})

const totalCurrentMonth = computed(() => {
  return Object.values(currentMonthCounts.value).reduce((sum, count) => sum + count, 0)
})

async function handlePeriodChange() {
  await loadTrendData(selectedPeriod.value)
}

function handleExport() {
  exportDialog.value = true
}

async function confirmExport() {
  exporting.value = true
  exportSuccess.value = false
  exportDialog.value = false

  try {
    if (selectedFormat.value === 'docx') {
      await exportBookingTrendsReport(trendData.value, currentMonthCounts.value)
    } else if (selectedFormat.value === 'excel') {
      await exportBookingTrendsExcel(trendData.value, currentMonthCounts.value)
    }
    exportSuccess.value = true
    setTimeout(() => {
      exportSuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Error exporting report:', err)
    alert('Failed to export report. Please try again.')
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadCurrentMonthStats(),
    loadTrendData(selectedPeriod.value)
  ])
})
</script>

<template>
  <v-card class="rounded-lg elevation-2">
    <v-card-title class="d-flex align-center justify-space-between pa-4 flex-wrap">
      <div class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-chart-line</v-icon>
        <span class="text-h6 font-weight-bold">Booking Trends</span>
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn-toggle
          v-model="showTableView"
          mandatory
          density="compact"
          variant="outlined"
          color="primary"
        >
          <v-btn :value="false" size="small">
            <v-icon>mdi-chart-line</v-icon>
          </v-btn>
          <v-btn :value="true" size="small">
            <v-icon>mdi-table</v-icon>
          </v-btn>
        </v-btn-toggle>

        <v-select
          v-model="selectedPeriod"
          :items="[3, 6, 12]"
          label="Period"
          suffix="months"
          density="compact"
          variant="outlined"
          hide-details
          @update:model-value="handlePeriodChange"
          style="max-width: 150px"
        ></v-select>

        <v-btn
          color="success"
          :disabled="loading || !trendData || trendData.length === 0"
          @click="handleExport"
          prepend-icon="mdi-download"
          size="small"
        >
          Export
        </v-btn>
      </div>
    </v-card-title>

    <!-- Export Format Dialog -->
    <v-dialog v-model="exportDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          <v-icon color="primary" class="mr-2">mdi-file-export</v-icon>
          Export Report
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="py-4">
          <p class="mb-4 text-body-2">Choose the format for your booking trends report:</p>

          <v-radio-group v-model="selectedFormat">
            <v-radio
              value="docx"
              color="primary"
            >
              <template #label>
                <div class="d-flex align-center">
                  <v-icon color="blue" class="mr-2">mdi-file-word</v-icon>
                  <div>
                    <div class="font-weight-medium">Word Document (.docx)</div>
                    <div class="text-caption text-grey">Professional formatted report</div>
                  </div>
                </div>
              </template>
            </v-radio>

            <v-radio
              value="excel"
              color="success"
            >
              <template #label>
                <div class="d-flex align-center">
                  <v-icon color="green" class="mr-2">mdi-file-excel</v-icon>
                  <div>
                    <div class="font-weight-medium">Excel Spreadsheet (.xlsx)</div>
                    <div class="text-caption text-grey">Editable data tables</div>
                  </div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="exportDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            :loading="exporting"
            @click="confirmExport"
          >
            Export
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="exportSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <v-icon>mdi-check-circle</v-icon>
      Report exported successfully!
    </v-snackbar>

    <v-divider></v-divider>

    <v-card-text>
      <!-- Current Month Stats -->
      <div class="mb-6">
        <h3 class="text-subtitle-1 font-weight-bold mb-3">
          Current Month Summary ({{ new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) }})
        </h3>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          {{ error }}
        </v-alert>

        <v-row v-if="!loading" dense>
          <v-col
            v-for="stat in currentMonthStats"
            :key="stat.type"
            cols="6"
            sm="4"
            md="2"
          >
            <div
              class="pa-3 rounded-lg text-center"
              :style="{ backgroundColor: stat.color + '15', border: `2px solid ${stat.color}40` }"
            >
              <v-icon :color="stat.color" size="28" class="mb-1">{{ stat.icon }}</v-icon>
              <div class="text-h5 font-weight-bold" :style="{ color: stat.color }">
                {{ stat.count }}
              </div>
              <div class="text-caption text-grey-darken-1">{{ stat.type }}</div>
            </div>
          </v-col>
          <v-col cols="12" sm="4" md="2">
            <div
              class="pa-3 rounded-lg text-center"
              style="background: linear-gradient(135deg, #667eea15, #764ba215); border: 2px solid #667eea40"
            >
              <v-icon color="primary" size="28" class="mb-1">mdi-sigma</v-icon>
              <div class="text-h5 font-weight-bold text-primary">
                {{ totalCurrentMonth }}
              </div>
              <div class="text-caption text-grey-darken-1">Total</div>
            </div>
          </v-col>
        </v-row>

        <div v-else class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </div>

      <!-- Table View -->
      <BookingTrendsTable
        v-if="showTableView"
        :trend-data="trendData"
        :loading="loading"
      />

      <!-- Trends Chart -->
      <div v-else class="chart-container" style="height: 350px; position: relative">
        <div v-if="loading" class="d-flex align-center justify-center" style="height: 100%">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>
        <Line
          v-else-if="chartData.labels.length > 0"
          :data="chartData"
          :options="chartOptions"
        />
        <div v-else class="d-flex align-center justify-center text-grey" style="height: 100%">
          <div class="text-center">
            <v-icon size="64" color="grey-lighten-1">mdi-chart-line-variant</v-icon>
            <p class="mt-2">No booking data available</p>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.chart-container {
  width: 100%;
}

.gap-2 {
  gap: 8px;
}
</style>
