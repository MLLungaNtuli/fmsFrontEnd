<template>
  <div>
    <h3>Fuel Consumption Over Time</h3>
    <Chart type="line" :data="chartData" :options="chartOptions" />
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
  
  // Sort by date to ensure chronological order
  const sortedData = [...props.data].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return {
    labels: sortedData.map(item => item.date),
    datasets: [
      {
        label: 'Fuel Consumption (L)',
        data: sortedData.map(item => item.litres),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
        fill: true
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Litres'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Date'
      }
    }
  }
};
</script>