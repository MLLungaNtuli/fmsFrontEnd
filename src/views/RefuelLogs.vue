<template>
  <div class="p-4">
    <h1>Refuel Logs</h1>
    <DataTable :value="refuelLogs" paginator :rows="10" stripedRows responsiveLayout="scroll">
      <Column field="id" header="ID" />
      <Column header="Vehicle">
        <template #body="{ data }">
          {{ data.vehicle?.plateNumber || 'N/A' }}
        </template>
      </Column>
      <Column field="amount" header="Amount (L)" />
      <Column field="fuelLevelAfter" header="Fuel Level After (L)" />
      <Column header="Refueled At">
        <template #body="{ data }">
          {{ new Date(data.refueledAt).toLocaleString() }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../axios'

const refuelLogs = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/refuellogs/all')
    refuelLogs.value = response.data
  } catch (error) {
    console.error('Failed to load refuel logs:', error)
  }
})
</script>

<style scoped>
h1 {
  margin-bottom: 1rem;
  color: #2c3e50;
}
</style>
