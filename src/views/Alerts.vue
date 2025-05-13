<!-- src/views/Alerts.vue -->
<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Alerts</h1>

    <DataTable :value="alerts" :paginator="true" :rows="10" responsiveLayout="scroll">
      <Column field="id" header="ID" />
      <Column field="alertType" header="Type" />
      <Column field="message" header="Message" />
      <Column field="vehicle.plateNumber" header="Vehicle" />
      <Column field="triggeredAt" header="Triggered At">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.triggeredAt) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../axios';

const alerts = ref([]);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString();
};

onMounted(async () => {
  try {
    const response = await api.get('/alerts/all');
    alerts.value = response.data;
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
  }
});
</script>
