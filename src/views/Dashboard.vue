<template>
  <div :class="['dashboard-layout', { dark: isDarkMode }]">
    <Sidebar @toggle="handleSidebarToggle" />

    <main :class="['main-content', { expanded: !isSidebarOpen }]">
      <Button
        icon="pi pi-moon"
        class="p-button-text theme-toggle"
        @click="isDarkMode = !isDarkMode"
        :label="isDarkMode ? 'Light Mode' : 'Dark Mode'"
      />
      <div class="kpi-container">
        <KPI 
          title="Total Vehicles" 
          :value="dashboardData.totalVehicles" 
          icon="pi pi-car" 
          format="number"
        />
        <KPI 
          title="Total Fuel (L)" 
          :value="dashboardData.totalFuel" 
          icon="pi pi-align-justify"
          format="decimal"
        />
        <KPI 
          title="Total Alerts" 
          :value="dashboardData.totalAlerts" 
          icon="pi pi-bell" 
          format="number"
        />
        <KPI 
          title="Total Distance (KM)" 
          :value="dashboardData.totalDistance" 
          icon="pi pi-compass" 
          format="decimal"
        />
        <KPI 
          title="Avg Fuel/Day (L)" 
          :value="dashboardData.avgFuelPerDay" 
          icon="pi pi-chart-line" 
          format="decimal"
        />
        <KPI 
          title="Avg Fuel/Week (L)" 
          :value="dashboardData.avgFuelPerWeek" 
          icon="pi pi-calendar" 
          format="decimal"
        />
      </div>
      
      <div class="charts-container">
        <FuelConsumptionChart 
          v-if="dashboardData.fuelConsumption.length" 
          :data="dashboardData.fuelConsumption" 
        />
        <AlertsPieChart 
          v-if="dashboardData.alertsByType.length" 
          :data="dashboardData.alertsByType" 
        />
      </div>
      
      <div class="charts-container">
        <TripsBarChart 
          v-if="dashboardData.tripsPerVehicle.length" 
          :data="dashboardData.tripsPerVehicle" 
        />
      </div>
      
      <RecentLogsTable 
        v-if="dashboardData.recentLogs.length" 
        :logs="dashboardData.recentLogs" 
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import KPI from '../components/KPI.vue';
import FuelConsumptionChart from '../components/FuelConsumptionChart.vue';
import AlertsPieChart from '../components/AlertsPieChart.vue';
import TripsBarChart from '../components/TripsBarChart.vue';
import RecentLogsTable from '../components/RecentLogsTable.vue';
import api from '../axios';

const isSidebarOpen = ref(true)
const isDarkMode = ref(false)

const handleSidebarToggle = (value) => {
  isSidebarOpen.value = value
}

const dashboardData = ref({
  totalVehicles: 0,
  totalFuel: 0,
  totalAlerts: 0,
  totalDistance: 0,
  fuelConsumption: [],  // Will contain {date, litres}
  alertsByType: [],     // Will contain {type, count}
  tripsPerVehicle: [],  // Will contain {vehicleId, plateNumber, trips}
  recentLogs: [],       // Will contain {vehicleId, plateNumber, type, value, timestamp}
  avgFuelPerDay: 0,
  avgFuelPerWeek: 0
});

// Fetch data from backend API

onMounted(async () => {
  try {
    const response = await api.get('/dashboard');
    const data = response.data;
    
    dashboardData.value = {
      ...data,
      // No transformation needed for alertsByType (already matches)
      // No transformation needed for recentLogs (already matches)
      // Transform fuel consumption data
      fuelConsumption: data.fuelConsumption.map(item => ({
        date: item.date,
        litres: item.litres
      })),
      // Transform trips data
      tripsPerVehicle: data.tripsPerVehicle.map(item => ({
        vehicleId: item.vehicleId,
        plateNumber: item.plateNumber,
        trips: item.trips || item.trips
      }))
    };
  } catch (err) {
    console.error('API Error:', err);
    // You might want to set some error state here
  }
});


</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
}

.main-content {
  margin-left: 250px;
  padding: 20px;
  width: calc(100% - 250px);
  background-color: #f5f7fa;
}

.kpi-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

@media (min-width: 1200px) {
  .charts-container {
    grid-template-columns: 2fr 1fr;
  }
}

h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  color: #333;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dashboard-layout.dark {
  background-color: #f8f8f8; 
  color: rgb(221, 12, 12);
}



.main-content {
  transition: all 0.3s ease;
  margin-left: 250px;
  width: calc(100% - 250px);
  padding: 20px;
}

.main-content.expanded {
  margin-left: 0;
  width: 100%;
}

.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 30;
  background-color: transparent;
  color: inherit;
}
</style>