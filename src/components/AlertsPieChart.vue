<template>
  <div class="alerts-pie-chart" style="height: 400px">
    <h3>Alerts by Type</h3>
    <Chart type="pie" :data="chartData" :options="chartOptions" />
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
    labels: props.data.map(item => item.type),
    datasets: [
      {
        data: props.data.map(item => item.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'] // Added extra color
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right'
    }
  }
};
</script>