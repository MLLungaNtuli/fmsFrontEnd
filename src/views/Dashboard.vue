<template>
  <div :class="['dashboard-layout', { dark: isDarkMode }]">
    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-indicator">
      <ProgressSpinner />
    </div>

    <!-- ✅ New AppHeader -->
    <AppHeader
      :is-dark-mode="isDarkMode"
      @toggle-sidebar="toggleSidebar"
      @update:is-dark-mode="isDarkMode = $event"
    />

    <!-- ✅ New Sidebar -->
    <Sidebar
      :is-open="isSidebarOpen"
      :is-dark-mode="isDarkMode"
      @close="isSidebarOpen = false"
    />

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
      <div class="content-container">
        <!-- Dashboard KPIs -->
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

        <!-- Charts Container -->
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

        <!-- Recent Activity -->
        <div class="section">
          <div class="section-header">
            <h3>Recent Activity</h3>
            <Button
              label="View All"
              icon="pi pi-arrow-right"
              class="p-button-text view-all"
            />
          </div>
          <RecentLogsTable
            v-if="dashboardData.recentLogs.length"
            :logs="dashboardData.recentLogs"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import api from '../axios';
import AppHeader from '@/components/AppHeader.vue';
import Sidebar from '@/components/Sidebar.vue';
import KPI from '@/components/KPI.vue';
import FuelConsumptionChart from '@/components/FuelConsumptionChart.vue';
import AlertsPieChart from '@/components/AlertsPieChart.vue';
import TripsBarChart from '@/components/TripsBarChart.vue';
import RecentLogsTable from '@/components/RecentLogsTable.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';

const store = useStore();
const router = useRouter();

// UI State
const isSidebarOpen = ref(true);
const isDarkMode = ref(false);
const loading = ref(true);

// Dashboard data
const dashboardData = ref({
  totalVehicles: 0,
  totalFuel: 0,
  totalAlerts: 0,
  totalDistance: 0,
  fuelConsumption: [],
  alertsByType: [],
  tripsPerVehicle: [],
  recentLogs: [],
  avgFuelPerDay: 0,
  avgFuelPerWeek: 0,
});

// Toggle sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Logout (if needed)
const handleLogout = () => {
  store.dispatch('auth/logout');
  router.push('/login');
};

// Fetch dashboard data
onMounted(async () => {
  try {
    const response = await api.get('/dashboard');
    const data = response.data;

    dashboardData.value = {
      ...data,
      fuelConsumption: data.fuelConsumption.map((item) => ({
        date: item.date,
        litres: item.litres,
      })),
      tripsPerVehicle: data.tripsPerVehicle.map((item) => ({
        vehicleId: item.vehicleId,
        plateNumber: item.plateNumber,
        trips: item.trips || 0,
      })),
    };
  } catch (err) {
    console.error('API Error:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
  color: #2c3e50;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dashboard-layout.dark {
  background-color: #1a1d28;
  color: #e4e6eb;
}

/* Main content area */
.main-content {
  margin-left: 260px;
  padding: 2rem;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: calc(100vh - 64px);
  background-color: #f5f7fa;
}

.dark .main-content {
  background-color: #1a1d28;
}

.main-content.sidebar-collapsed {
  margin-left: 72px;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* KPI Grid */
.kpi-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

/* Charts */
.charts-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 1200px) {
  .charts-container {
    grid-template-columns: 2fr 1fr;
  }
}

/* Section */
.section {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.dark .section {
  background: #252836;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.view-all {
  color: #3498db;
  padding: 0.25rem 0.5rem;
}

.dark .view-all {
  color: #4fc3f7;
}

/* Loading Indicator */
.loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1000;
}

.dark .loading-indicator {
  background-color: rgba(26, 29, 40, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
    padding: 1rem;
  }

  .kpi-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .charts-container {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .kpi-container {
    grid-template-columns: 1fr;
  }
}
</style>