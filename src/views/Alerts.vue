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
          <div class="table-section">
            <div class="table-header">
              <h1>Alerts</h1>
              <Button
                icon="pi pi-refresh"
                class="p-button-text refresh-button"
                @click="fetchAlerts"
                v-tooltip="'Refresh data'"
              />
            </div>

            <DataTable
              :value="alertsData"
              paginator
              :rows="pageSizeAlerts"
              :totalRecords="totalRecordsAlerts"
              :loading="loadingAlerts"
              @page="onAlertsPageChange"
              :first="pageAlerts * pageSizeAlerts"
              stripedRows
              responsiveLayout="scroll"
            >
              <Column field="id" header="ID" />
              <Column field="alertType" header="Type">
                <template #body="{ data }">
                  <span :class="'alert-' + data.alertType.replace(/\s+/g, '')">
                    {{ data.alertType }}
                  </span>
                </template>
              </Column>
              <Column field="message" header="Message" />
              <Column header="Vehicle">
                <template #body="{ data }">
                  {{ data.vehicle?.plateNumber || 'N/A' }}
                </template>
              </Column>
              <Column header="Triggered At">
                <template #body="{ data }">
                  {{ formatDate(data.triggeredAt) }}
                </template>
              </Column>
              <Column header="Actions">
                <template #body="{ data }">
                  <Button
                    icon="pi pi-eye"
                    class="p-button-text"
                    @click="viewAlert(data.id)"
                  />
                  <Button
                    icon="pi pi-trash"
                    class="p-button-text p-button-danger"
                    @click="deleteAlert(data.id)"
                  />
                </template>
              </Column>
            </DataTable>

            <ProgressSpinner
              v-if="loadingAlerts && !initialLoad"
              class="table-spinner"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Detail Modal -->
    <Dialog
      header="Alert Details"
      v-model:visible="showAlertDetail"
      :modal="true"
      :style="{ width: '800px' }"
      :maximizable="true"
    >
      <div v-if="alertDetail">
        <h3>
          {{ alertDetail.alert.alertType }} –
          {{ formatDate(alertDetail.alert.triggeredAt) }}
        </h3>
        <p><strong>Message:</strong> {{ alertDetail.alert.message }}</p>
        <p>
          <strong>Vehicle:</strong>
          {{ alertDetail.alert.vehicle?.plateNumber }}
        </p>

        <!-- Location Information -->
        <div class="location-info" v-if="currentLocation">
          <h4>Current Location</h4>
          <p>
            <strong>Address:</strong>
            {{ currentLocation.display_name || 'Location data loading...' }}
          </p>
          <div v-if="currentLocation.address" class="address-details">
            <p>
              <strong>Area:</strong>
              {{
                currentLocation.address.neighbourhood ||
                currentLocation.address.suburb ||
                'N/A'
              }}
            </p>
            <p>
              <strong>City/Town:</strong>
              {{
                currentLocation.address.city ||
                currentLocation.address.town ||
                currentLocation.address.village ||
                'N/A'
              }}
            </p>
            <p>
              <strong>Province/State:</strong>
              {{ currentLocation.address.state || 'N/A' }}
            </p>
            <p>
              <strong>Country:</strong>
              {{ currentLocation.address.country || 'N/A' }}
            </p>
          </div>
        </div>

        <div v-if="loadingLocation" class="location-loading">
          <ProgressSpinner style="width: 20px; height: 20px" />
          <span>Loading location data...</span>
        </div>

        <h4>Recent Vehicle Logs</h4>
        <div id="map" style="height: 400px; border-radius: 8px;"></div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Swal from 'sweetalert2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ Import new components
import AppHeader from '@/components/AppHeader.vue';
import Sidebar from '@/components/Sidebar.vue';

// PrimeVue components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ProgressSpinner from 'primevue/progressspinner';

import api from '../axios';

// Fix default marker icon paths for Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const toast = useToast();
const router = useRouter();

// ===== Data State =====
const alertsData = ref([]);
const totalRecordsAlerts = ref(0);
const pageAlerts = ref(0);
const pageSizeAlerts = ref(10);
const loadingAlerts = ref(false);
const initialLoad = ref(true);

const showAlertDetail = ref(false);
const alertDetail = ref(null);
const currentLocation = ref(null);
const loadingLocation = ref(false);

// ===== UI State =====
const isSidebarOpen = ref(true);
const isDarkMode = ref(false);
let map = null;

// ===== Sidebar Toggle =====
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// ===== Helper Functions =====
const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

// ===== API Calls =====
const fetchAlerts = async () => {
  try {
    loadingAlerts.value = true;
    const backendPage = pageAlerts.value + 1;

    const res = await api.get('/alerts/all', {
      params: { page: backendPage, pageSize: pageSizeAlerts.value },
    });

    console.log('Alerts API response:', res.data);

    let alerts = [];
    let total = 0;

    if (res.data?.data && Array.isArray(res.data.data)) {
      alerts = res.data.data;
      total = res.data.totalCount || 0;
    } else if (res.data?.alerts && Array.isArray(res.data.alerts)) {
      alerts = res.data.alerts;
      total = res.data.totalCount || 0;
    } else if (res.data?.items && Array.isArray(res.data.items)) {
      alerts = res.data.items;
      total = res.data.totalCount || 0;
    } else if (Array.isArray(res.data)) {
      alerts = res.data;
      total = res.data.length;
    } else if (res.data?.data?.data) {
      alerts = res.data.data.data;
      total = res.data.data.totalCount || 0;
    } else {
      throw new Error('Unrecognized alerts response structure');
    }

    alertsData.value = alerts;
    totalRecordsAlerts.value = total;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        'Failed to load alerts: ' +
        (error.response?.data?.message || error.message),
      life: 5000,
    });
  } finally {
    loadingAlerts.value = false;
    initialLoad.value = false;
  }
};

const onAlertsPageChange = (event) => {
  pageAlerts.value = event.page;
  pageSizeAlerts.value = event.rows;
  fetchAlerts();
};

// ===== Reverse Geocoding =====
const getLocationFromCoords = async (lat, lng) => {
  try {
    loadingLocation.value = true;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    if (!response.ok) throw new Error('Failed to fetch location');
    return await response.json();
  } catch (error) {
    console.error('Location fetch error:', error);
    return {
      display_name: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      address: {},
    };
  } finally {
    loadingLocation.value = false;
  }
};

// ===== Alert Actions =====
const viewAlert = async (id) => {
  try {
    const res = await api.get(`/alerts/${id}`);
    alertDetail.value = res.data;
    showAlertDetail.value = true;

    currentLocation.value = null;
    loadingLocation.value = true;

    setTimeout(async () => {
      if (alertDetail.value.vehicleLogs?.length > 0) {
        const latestLog = alertDetail.value.vehicleLogs[0];
        if (latestLog.latitude && latestLog.longitude) {
          currentLocation.value = await getLocationFromCoords(
            latestLog.latitude,
            latestLog.longitude
          );
        }
        initializeMap();
      }
    }, 300);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load alert details',
      life: 3000,
    });
  }
};

const initializeMap = () => {
  if (!alertDetail.value?.vehicleLogs?.length) return;

  if (map) {
    map.remove();
    map = null;
  }

  const firstLog = alertDetail.value.vehicleLogs[0];
  map = L.map('map').setView([firstLog.latitude, firstLog.longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  const latlngs = alertDetail.value.vehicleLogs.map((log) => [
    log.latitude,
    log.longitude,
  ]);
  L.polyline(latlngs, { color: 'blue', weight: 4 }).addTo(map);

  alertDetail.value.vehicleLogs.forEach((log, index) => {
    const marker = L.marker([log.latitude, log.longitude]).addTo(map);
    let popupContent = `
      <div class="map-popup">
        <strong>Time:</strong> ${formatDate(log.timestamp)}<br>
        <strong>Speed:</strong> ${log.speed} km/h<br>
        <strong>Coordinates:</strong> ${log.latitude.toFixed(6)}, ${log.longitude.toFixed(6)}
    `;
    if (index === 0 && currentLocation.value?.address) {
      const addr = currentLocation.value.address;
      popupContent += `<br><strong>Area:</strong> ${
        addr.neighbourhood || addr.suburb || 'N/A'
      }`;
      popupContent += `<br><strong>City:</strong> ${
        addr.city || addr.town || addr.village || 'N/A'
      }`;
    }
    popupContent += `</div>`;
    marker.bindPopup(popupContent);
  });

  map.fitBounds(latlngs);
};

const deleteAlert = async (id) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This alert will be permanently deleted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/alerts/${id}`);
      await Swal.fire({
        title: 'Deleted!',
        text: 'Alert has been deleted successfully.',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        showConfirmButton: false,
      });
      fetchAlerts();
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete alert. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    }
  }
};

// ===== Lifecycle =====
onMounted(() => {
  fetchAlerts();
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

.layout-wrapper {
  display: flex;
  min-height: 100vh;
  margin-top: 64px; /* header height */
}

.main-content {
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
   TABLE SECTION
   ========================================================= */
.table-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
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

h1 {
  margin: 0;
  font-weight: 600;
  font-size: 1.75rem;
}

.dark h1 {
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
   ALERT TYPE COLOURS
   ========================================================= */
.alert-FuelTheft {
  color: #e74c3c;
  font-weight: bold;
}
.alert-OverSpeed {
  color: #f39c12;
  font-weight: bold;
}
.alert-Geofence {
  color: #3498db;
  font-weight: bold;
}
.alert-LowFuel {
  color: #2ecc71;
  font-weight: bold;
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

.table-spinner {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

/* =========================================================
   DETAIL MODAL
   ========================================================= */
.location-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border-left: 4px solid #3498db;
}

.dark .location-info {
  background: #1e293b;
  border-left-color: #4fc3f7;
}

.address-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.address-details p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.location-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
  color: #6c757d;
}

.dark .location-loading {
  background: #1e293b;
  color: #94a3b8;
}

#map {
  margin-top: 1rem;
  border-radius: 8px;
}

:deep(.map-popup) {
  font-family: inherit;
  min-width: 200px;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
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
  .address-details {
    grid-template-columns: 1fr;
  }
}
</style>