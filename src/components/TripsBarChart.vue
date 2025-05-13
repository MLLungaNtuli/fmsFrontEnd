<template>
  <div>
    <h3>Trips per Vehicle</h3>
    <Chart type="bar" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({ data: Array });

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }
  
  return {
    labels: props.data.map(item => item.plateNumber), // Use plateNumber instead of type
    datasets: [
      {
        label: 'Trips',
        data: props.data.map(item => item.trips || item.trips), // Handle both spellings
        backgroundColor: '#36A2EB' // Single color for all bars
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false // Hide legend since we only have one dataset
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
</script>