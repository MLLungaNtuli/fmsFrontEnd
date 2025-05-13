<template>
  <div class="kpi-card">
    <i :class="icon" class="kpi-icon"></i>
    <div>
      <h3>{{ title }}</h3>
      <p>{{ formattedValue }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  format: {
    type: String,
    default: 'number' // 'number', 'decimal', or 'custom'
  },
  decimalPlaces: {
    type: Number,
    default: 2
  }
});

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value;
  
  switch (props.format) {
    case 'decimal':
      return props.value.toFixed(props.decimalPlaces);
    case 'percent':
      return `${(props.value * 100).toFixed(props.decimalPlaces)}%`;
    default:
      return props.value.toLocaleString();
  }
});
</script>

<style scoped>
.kpi-card {
  display: flex;
  align-items: center;
  background-color: #ecf0f1;
  padding: 20px;
  border-radius: 8px;
  min-width: 200px;
}
.kpi-icon {
  font-size: 2rem;
  margin-right: 15px;
  color: #2c3e50;
}
h3 {
  margin: 0;
  font-size: 1rem;
  color: #7f8c8d;
}
p {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}
</style>