<template>
  <div class="p-4">
    <h1>Vehicles</h1>
    <DataTable :value="vehicles" paginator :rows="10" stripedRows responsiveLayout="scroll" class="mb-5">
      <Column field="id" header="ID" />
      <Column field="plateNumber" header="Plate Number" />
      <Column field="description" header="Description" />
      <Column field="fuelCapacity" header="Fuel Capacity (L)" />
      <Column field="fuelLevel" header="Fuel Level (L)" />
      <Column header="Created At">
        <template #body="{ data }">
          {{ new Date(data.createdAt).toLocaleString() }}
        </template>
      </Column>
    </DataTable>

    <h2>Vehicle Logs</h2>
    <DataTable :value="vehicleLogs" paginator :rows="10" stripedRows responsiveLayout="scroll">
      <Column field="id" header="ID" />
      <Column header="Vehicle">
        <template #body="{ data }">
          {{ data.vehicle?.plateNumber || 'N/A' }}
        </template>
      </Column>
      <Column field="latitude" header="Latitude" />
      <Column field="longitude" header="Longitude" />
      <Column field="speed" header="Speed (km/h)" />
      <Column field="fuelLevel" header="Fuel Level (L)" />
      <Column header="Timestamp">
        <template #body="{ data }">
          {{ new Date(data.timestamp).toLocaleString() }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../axios'

const vehicles = ref([])
const vehicleLogs = ref([])

onMounted(async () => {
  try {
    const [vehiclesResponse, logsResponse] = await Promise.all([
      api.get('/vehicles/all'),
      api.get('/vehiclelogs/all')
    ])

    vehicles.value = vehiclesResponse.data
    vehicleLogs.value = logsResponse.data
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>

<style scoped>
h1, h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}
</style>
