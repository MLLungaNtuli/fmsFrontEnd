<template>
  <div :class="['dashboard-layout', { dark: isDarkMode }]">
    <!-- Loading Overlay -->
    <div v-if="initialLoad" class="loading-indicator">
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
    <div class="layout-wrapper">
      <div
        class="main-content"
        :class="{
          'sidebar-collapsed': !isSidebarOpen,
        }"
      >
        <div class="content-container">
          <!-- Vehicles Table -->
          <div class="table-section">
            <div class="table-header">
              <h1>Vehicles</h1>
              <Button
                icon="pi pi-refresh"
                class="p-button-text refresh-button"
                @click="fetchVehicles"
                v-tooltip="'Refresh data'"
              />
            </div>
            <DataTable
              :value="vehiclesData"
              paginator
              :rows="pageSizeVehicles"
              :totalRecords="totalRecordsVehicles"
              :loading="loadingVehicles"
              @page="onVehiclesPageChange"
            >
              <Column field="id" header="ID" />
              <Column field="plateNumber" header="Plate Number" :sortable="true" />
              <Column field="description" header="Description" />
              <Column field="fuelCapacity" header="Fuel Capacity (L)" :sortable="true" />
              <Column field="fuelLevel" header="Fuel Level (L)" :sortable="true" />
              <Column header="Created At" :sortable="true">
                <template #body="{ data }">
                  {{ new Date(data.createdAt).toLocaleString() }}
                </template>
              </Column>
            </DataTable>
            <ProgressSpinner
              v-if="loadingVehicles && !initialLoad"
              class="table-spinner"
            />
          </div>

          <!-- Vehicle Logs Table -->
          <div class="table-section">
            <div class="table-header">
              <h2>Vehicle Logs</h2>
              <Button
                icon="pi pi-refresh"
                class="p-button-text refresh-button"
                @click="fetchVehicleLogs"
                v-tooltip="'Refresh data'"
              />
            </div>
            <DataTable
              :value="logsData"
              paginator
              :rows="pageSizeLogs"
              :totalRecords="totalRecordsLogs"
              :loading="loadingLogs"
              @page="onLogsPageChange"
            >
              <Column field="id" header="ID" />
              <Column header="Vehicle" :sortable="true">
                <template #body="{ data }">
                  {{ data.vehicle?.plateNumber || 'N/A' }}
                </template>
              </Column>
              <Column field="latitude" header="Latitude" :sortable="true" />
              <Column field="longitude" header="Longitude" :sortable="true" />
              <Column field="speed" header="Speed (km/h)" :sortable="true" />
              <Column field="fuelLevel" header="Fuel Level (L)" :sortable="true" />
              <Column header="Timestamp" :sortable="true">
                <template #body="{ data }">
                  {{ new Date(data.timestamp).toLocaleString() }}
                </template>
              </Column>
            </DataTable>
            <ProgressSpinner
              v-if="loadingLogs && !initialLoad"
              class="table-spinner"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../axios';
import { useToast } from 'primevue/usetoast';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';

// ✅ Import new components
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';

const toast = useToast();
const router = useRouter();

// ===== State =====
const vehiclesData = ref([]);
const totalRecordsVehicles = ref(0);
const pageVehicles = ref(1);
const pageSizeVehicles = ref(10);

const logsData = ref([]);
const totalRecordsLogs = ref(0);
const pageLogs = ref(1);
const pageSizeLogs = ref(10);

const isSidebarOpen = ref(true);
const initialLoad = ref(true);
const loadingVehicles = ref(false);
const loadingLogs = ref(false);
const isDarkMode = ref(false);

// ===== Sidebar Toggle =====
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// ===== Data Fetching =====
const fetchVehicles = async () => {
  try {
    loadingVehicles.value = true;
    const response = await api.get('/vehicles/all', {
      params: {
        page: pageVehicles.value,
        pageSize: pageSizeVehicles.value,
      },
    });

    if (response.data?.vehicles) {
      vehiclesData.value = response.data.vehicles;
      totalRecordsVehicles.value = response.data.totalCount || 0;
    } else if (response.data?.Vehicles) {
      vehiclesData.value = response.data.Vehicles;
      totalRecordsVehicles.value = response.data.TotalCount || 0;
    } else if (response.data?.data?.vehicles) {
      vehiclesData.value = response.data.data.vehicles;
      totalRecordsVehicles.value = response.data.data.totalCount || 0;
    } else if (Array.isArray(response.data)) {
      vehiclesData.value = response.data;
      totalRecordsVehicles.value = response.data.length;
    } else {
      throw new Error('Unrecognized vehicles response structure');
    }
  } catch (error) {
    console.error('Error loading vehicles:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load vehicles',
      life: 3000,
    });
  } finally {
    loadingVehicles.value = false;
  }
};

const fetchVehicleLogs = async () => {
  try {
    loadingLogs.value = true;
    const response = await api.get('/vehiclelogs/all', {
      params: {
        page: pageLogs.value,
        pageSize: pageSizeLogs.value,
      },
    });

    if (response.data?.data && Array.isArray(response.data.data)) {
      logsData.value = response.data.data;
      totalRecordsLogs.value = response.data.totalCount || 0;
    } else if (response.data?.logs) {
      logsData.value = response.data.logs;
      totalRecordsLogs.value = response.data.totalCount || 0;
    } else if (Array.isArray(response.data)) {
      logsData.value = response.data;
      totalRecordsLogs.value = response.data.length;
    } else {
      throw new Error('Unrecognized logs response structure');
    }
  } catch (error) {
    console.error('Error loading vehicle logs:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load vehicle logs',
      life: 3000,
    });
  } finally {
    loadingLogs.value = false;
  }
};

// ===== Pagination =====
const onVehiclesPageChange = (event) => {
  pageVehicles.value = event.page + 1;
  pageSizeVehicles.value = event.rows;
  fetchVehicles();
};

const onLogsPageChange = (event) => {
  pageLogs.value = event.page + 1;
  pageSizeLogs.value = event.rows;
  fetchVehicleLogs();
};

// ===== Lifecycle =====
onMounted(async () => {
  await Promise.all([fetchVehicles(), fetchVehicleLogs()]);
  initialLoad.value = false;
});
</script>

<style scoped>
/* =========================================================
   LAYOUT
   ========================================================= */
.dashboard-layout {
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dashboard-layout.dark {
  background-color: #0f172a;
  color: #e2e8f0;
}

.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

/* =========================================================
   MAIN CONTENT
   ========================================================= */
.main-content {
  margin-top: 64px; /* header height */
  margin-left: 260px; /* sidebar open width */
  padding: 2rem 1.5rem;
  width: calc(100% - 260px);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.sidebar-collapsed {
  margin-left: 72px; /* sidebar collapsed width */
  width: calc(100% - 72px);
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* =========================================================
   TABLE SECTIONS
   ========================================================= */
.table-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.dark .table-section {
  background: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h1,
h2 {
  margin: 0;
  font-weight: 600;
}

h1 {
  font-size: 1.75rem;
}
h2 {
  font-size: 1.4rem;
}

.dark h1,
.dark h2 {
  color: #f1f5f9;
}

.refresh-button {
  color: #64748b !important;
  transition: color 0.2s;
}
.refresh-button:hover {
  color: #1e293b !important;
}
.dark .refresh-button {
  color: #94a3b8 !important;
}
.dark .refresh-button:hover {
  color: #e2e8f0 !important;
}

/* =========================================================
   TABLE OVERRIDES (PrimeVue)
   ========================================================= */
:deep(.p-datatable) {
  box-shadow: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.dark :deep(.p-datatable) {
  border-color: #334155;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f1f5f9;
  color: #1e293b;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.dark :deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #1e293b;
  color: #e2e8f0;
  border-bottom-color: #334155;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.15s;
}
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}
.dark :deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #1e293b;
}

:deep(.p-paginator) {
  background: transparent;
  border: none;
  padding-top: 1rem;
}

/* =========================================================
   LOADING SPINNER
   ========================================================= */
.loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  z-index: 999;
}
.dark .loading-indicator {
  background: rgba(15, 23, 42, 0.8);
}

.table-spinner {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0 !important;
    width: 100% !important;
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .table-section {
    padding: 1rem;
  }
  h1 {
    font-size: 1.4rem;
  }
  h2 {
    font-size: 1.2rem;
  }
}
</style>