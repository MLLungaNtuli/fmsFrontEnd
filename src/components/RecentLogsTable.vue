<template>
  <div class="logs-container">
    <h3>Recent Refuel Logs & Alerts</h3>
    <DataTable 
      :value="logs" 
      :rows="5" 
      paginator 
      responsiveLayout="scroll"
      :paginatorTemplate="paginatorTemplate"
    >
      <Column field="plateNumber" header="Vehicle">
        <template #body="{ data }">
          <div class="vehicle-cell">
            <span class="plate-number">{{ data.plateNumber }}</span>
            <span class="vehicle-id">ID: {{ data.vehicleId }}</span>
          </div>
        </template>
      </Column>
      <Column field="type" header="Type">
        <template #body="{ data }">
          <Tag :value="data.type" 
               :severity="getSeverity(data.type)" />
        </template>
      </Column>
      <Column field="value" header="Details" />
      <Column field="timestamp" header="Time">
        <template #body="{ data }">
          {{ formatTimestamp(data.timestamp) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';

const props = defineProps({ 
  logs: Array 
});

const paginatorTemplate = computed(() => 
  window.innerWidth < 768 
    ? 'PrevPageLink NextPageLink' 
    : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink'
);

const getSeverity = (type) => {
  switch(type) {
    case 'Refuel': return 'success';
    case 'Low Fuel': return 'warning';
    case 'Over Speed': return 'danger';
    case 'Geofence Breach': return 'danger';
    case 'Fuel Theft': return 'danger';
    default: return 'info';
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};
</script>

<style scoped>
.logs-container {
  margin-top: 2rem;
}

.vehicle-cell {
  display: flex;
  flex-direction: column;
}

.plate-number {
  font-weight: bold;
}

.vehicle-id {
  font-size: 0.8rem;
  color: #7f8c8d;
}
</style>