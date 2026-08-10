<template>
  <div :class="['dashboard-layout', { dark: isDarkMode }]">
    <!-- Full-page Loading -->
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
          <!-- Summary Statistics Cards -->
          <div class="summary-section">
            <div class="summary-cards">
              <Card class="summary-card">
                <template #title>
                  <div class="card-header">
                    <i class="pi pi-chart-line"></i>
                    Today's Refuels
                  </div>
                </template>
                <template #content>
                  <div class="card-content">
                    <div class="stat-number">{{ summaryStats.today?.count || 0 }}</div>
                    <div class="stat-details">
                      <div class="stat-amount">{{ summaryStats.today?.totalAmount?.toFixed(1) || 0 }} L</div>
                      <div class="stat-cost">R{{ summaryStats.today?.totalCost?.toFixed(2) || 0 }}</div>
                    </div>
                  </div>
                </template>
              </Card>

              <Card class="summary-card">
                <template #title>
                  <div class="card-header">
                    <i class="pi pi-calendar"></i>
                    This Week
                  </div>
                </template>
                <template #content>
                  <div class="card-content">
                    <div class="stat-number">{{ summaryStats.thisWeek?.count || 0 }}</div>
                    <div class="stat-details">
                      <div class="stat-amount">{{ summaryStats.thisWeek?.totalAmount?.toFixed(1) || 0 }} L</div>
                      <div class="stat-cost">R{{ summaryStats.thisWeek?.totalCost?.toFixed(2) || 0 }}</div>
                    </div>
                  </div>
                </template>
              </Card>

              <Card class="summary-card">
                <template #title>
                  <div class="card-header">
                    <i class="pi pi-chart-bar"></i>
                    This Month
                  </div>
                </template>
                <template #content>
                  <div class="card-content">
                    <div class="stat-number">{{ summaryStats.thisMonth?.count || 0 }}</div>
                    <div class="stat-details">
                      <div class="stat-amount">{{ summaryStats.thisMonth?.totalAmount?.toFixed(1) || 0 }} L</div>
                      <div class="stat-cost">R{{ summaryStats.thisMonth?.totalCost?.toFixed(2) || 0 }}</div>
                    </div>
                  </div>
                </template>
              </Card>

              <Card class="summary-card">
                <template #title>
                  <div class="card-header">
                    <i class="pi pi-database"></i>
                    All Time
                  </div>
                </template>
                <template #content>
                  <div class="card-content">
                    <div class="stat-number">{{ summaryStats.allTime?.count || 0 }}</div>
                    <div class="stat-details">
                      <div class="stat-amount">{{ summaryStats.allTime?.totalAmount?.toFixed(1) || 0 }} L</div>
                      <div class="stat-cost">R{{ summaryStats.allTime?.totalCost?.toFixed(2) || 0 }}</div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>

          <!-- Fuel Stations Map -->
          <div class="map-section" v-if="fuelStations.length > 0">
            <Card>
              <template #title>
                <div class="section-header">
                  <i class="pi pi-map-marker"></i>
                  Fuel Stations Map
                  <Button
                    icon="pi pi-refresh"
                    class="p-button-text refresh-stations"
                    @click="fetchFuelStations"
                    v-tooltip="'Refresh stations'"
                  />
                </div>
              </template>
              <template #content>
                <div id="stations-map" style="height: 400px; border-radius: 8px;"></div>
                <div class="stations-legend">
                  <div class="legend-item">
                    <span class="legend-color" style="background-color: #e74c3c;"></span>
                    <span>Fuel Stations ({{ fuelStations.length }})</span>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Refuel Logs Table -->
          <div class="table-section">
            <Card>
              <template #title>
                <div class="section-header">
                  <i class="pi pi-list"></i>
                  Refuel Logs
                  <div class="table-actions">
                    <Button
                      icon="pi pi-refresh"
                      class="p-button-text refresh-button"
                      @click="fetchRefuelData"
                      v-tooltip="'Refresh all data'"
                    />
                    <Button
                      icon="pi pi-filter"
                      class="p-button-text filter-button"
                      @click="showFilters = !showFilters"
                      v-tooltip="'Toggle filters'"
                    />
                    <Button
                      icon="pi pi-download"
                      class="p-button-text export-button"
                      @click="exportData"
                      v-tooltip="'Export data'"
                    />
                  </div>
                </div>
              </template>
              <template #content>
                <!-- Filters -->
                <div v-if="showFilters" class="filters-section">
                  <div class="filter-group">
                    <span class="p-float-label">
                      <Calendar
                        v-model="filterStartDate"
                        :showIcon="true"
                        dateFormat="yy-mm-dd"
                        selectionMode="single"
                        placeholder="Start Date"
                      />
                      <label>Start Date</label>
                    </span>
                    <span class="p-float-label">
                      <Calendar
                        v-model="filterEndDate"
                        :showIcon="true"
                        dateFormat="yy-mm-dd"
                        selectionMode="single"
                        placeholder="End Date"
                      />
                      <label>End Date</label>
                    </span>
                    <Dropdown
                      v-model="selectedVehicle"
                      :options="vehicleOptions"
                      optionLabel="plateNumber"
                      placeholder="Select Vehicle"
                      class="vehicle-filter"
                    />
                    <InputText
                      v-model="filterStationName"
                      placeholder="Station name..."
                      class="station-filter"
                    />
                    <Button
                      icon="pi pi-search"
                      label="Apply Filters"
                      @click="applyFilters"
                      class="apply-filters-btn"
                    />
                    <Button
                      icon="pi pi-times"
                      label="Clear Filters"
                      @click="clearFilters"
                      class="p-button-outlined clear-filters"
                    />
                  </div>
                </div>

                <DataTable
                  :value="filteredRefuelLogs"
                  paginator
                  :rows="pageSizeRefuelLogs"
                  :totalRecords="totalRecordsRefuelLogs"
                  :loading="loadingRefuelLogs"
                  @page="onRefuelLogsPageChange"
                  stripedRows
                  responsiveLayout="scroll"
                  class="refuel-logs-table"
                  :rowClass="rowClass"
                >
                  <Column field="id" header="ID" :sortable="true" />
                  <Column header="Vehicle" :sortable="true">
                    <template #body="{ data }">
                      <div class="vehicle-info">
                        <i class="pi pi-car" style="margin-right: 8px;"></i>
                        {{ data.vehicle?.plateNumber || 'N/A' }}
                        <span v-if="data.vehicle?.model" class="vehicle-model">
                          ({{ data.vehicle.model }})
                        </span>
                      </div>
                    </template>
                  </Column>
                  <Column field="amount" header="Amount (L)" :sortable="true">
                    <template #body="{ data }">
                      <span class="fuel-amount">{{ data.amount }} L</span>
                    </template>
                  </Column>
                  <Column field="fuelLevelAfter" header="Fuel Level (L)" :sortable="true">
                    <template #body="{ data }">
                      <div class="fuel-level">
                        <ProgressBar
                          :value="calculateFuelPercentage(data.fuelLevelAfter)"
                          :showValue="false"
                          class="fuel-progress"
                        />
                        <span>{{ data.fuelLevelAfter }} L</span>
                      </div>
                    </template>
                  </Column>
                  <Column field="cost" header="Cost" :sortable="true">
                    <template #body="{ data }">
                      <span class="cost-badge" v-if="data.cost">
                        R{{ data.cost.toFixed(2) }}
                      </span>
                      <span v-else class="no-cost">N/A</span>
                    </template>
                  </Column>
                  <Column header="Refueled At" :sortable="true">
                    <template #body="{ data }">
                      <div class="timestamp">
                        <div class="date">{{ formatDate(data.refueledAt) }}</div>
                        <div class="time">{{ formatTime(data.refueledAt) }}</div>
                      </div>
                    </template>
                  </Column>
                  <Column header="Station" :sortable="true">
                    <template #body="{ data }">
                      <div class="station-info-small">
                        <i class="pi pi-map-marker"></i>
                        {{ data.stationName || 'Unknown Station' }}
                      </div>
                    </template>
                  </Column>
                  <Column header="Odometer" :sortable="true">
                    <template #body="{ data }">
                      <span v-if="data.odometer" class="odometer">
                        {{ data.odometer.toLocaleString() }} km
                      </span>
                      <span v-else class="no-odometer">N/A</span>
                    </template>
                  </Column>
                  <Column header="Actions" :exportable="false" style="min-width: 140px;">
                    <template #body="{ data }">
                      <div class="action-buttons">
                        <Button
                          icon="pi pi-eye"
                          class="p-button-text p-button-info view-button"
                          @click="viewRefuelLog(data)"
                          v-tooltip="'View Details'"
                        />
                        <Button
                          icon="pi pi-map"
                          class="p-button-text p-button-success map-button"
                          @click="viewOnMap(data)"
                          v-tooltip="'View on Map'"
                        />
                        <Button
                          icon="pi pi-chart-line"
                          class="p-button-text p-button-warning stats-button"
                          @click="viewVehicleStats(data.vehicleId)"
                          v-tooltip="'Vehicle Stats'"
                        />
                        <Button
                          icon="pi pi-trash"
                          class="p-button-text p-button-danger delete-button"
                          @click="deleteRefuelLog(data.id)"
                          v-tooltip="'Delete Log'"
                        />
                      </div>
                    </template>
                  </Column>
                </DataTable>

                <!-- Table Loading Spinner -->
                <ProgressSpinner v-if="loadingRefuelLogs && !initialLoad" class="table-spinner" />
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>

    <!-- Refuel Log Detail Modal -->
    <Dialog
      header="Refuel Log Details"
      v-model:visible="showRefuelLogDetail"
      :modal="true"
      :style="{ width: '950px' }"
      :maximizable="true"
    >
      <div v-if="selectedRefuelLog" class="refuel-detail-modal">
        <div class="detail-grid">
          <div class="detail-section">
            <h3>Basic Information</h3>
            <div class="detail-item">
              <label>Log ID:</label>
              <span class="log-id">#{{ selectedRefuelLog.id }}</span>
            </div>
            <div class="detail-item">
              <label>Vehicle:</label>
              <span class="vehicle-detail">
                <i class="pi pi-car"></i>
                {{ selectedRefuelLog.vehicle?.plateNumber || 'N/A' }}
                <span v-if="selectedRefuelLog.vehicle?.model" class="model">
                  ({{ selectedRefuelLog.vehicle.model }})
                </span>
              </span>
            </div>
            <div class="detail-item">
              <label>Refuel Date & Time:</label>
              <span class="timestamp-detail">
                {{ formatDateTime(selectedRefuelLog.refueledAt) }}
              </span>
            </div>
            <div class="detail-item" v-if="selectedRefuelLog.odometer">
              <label>Odometer Reading:</label>
              <span class="odometer-detail">{{ selectedRefuelLog.odometer.toLocaleString() }} km</span>
            </div>
          </div>

          <div class="detail-section">
            <h3>Fuel Information</h3>
            <div class="detail-item">
              <label>Fuel Amount:</label>
              <span class="fuel-amount-detail">{{ selectedRefuelLog.amount }} Liters</span>
            </div>
            <div class="detail-item">
              <label>Fuel Level After Refuel:</label>
              <span class="fuel-level-detail">{{ selectedRefuelLog.fuelLevelAfter }} Liters</span>
            </div>
            <div class="detail-item" v-if="selectedRefuelLog.cost">
              <label>Total Cost:</label>
              <span class="cost-detail">R{{ selectedRefuelLog.cost.toFixed(2) }}</span>
            </div>
            <div class="detail-item" v-if="selectedRefuelLog.cost && selectedRefuelLog.amount">
              <label>Cost per Liter:</label>
              <span class="cost-per-liter">R{{ (selectedRefuelLog.cost / selectedRefuelLog.amount).toFixed(2) }}/L</span>
            </div>
          </div>
        </div>

        <!-- Station Location Section -->
        <div class="location-section">
          <h3>Refuel Station Location</h3>
          <div class="station-details" v-if="selectedRefuelLog.stationName || selectedRefuelLog.stationAddress">
            <div class="station-info" v-if="selectedRefuelLog.stationName">
              <strong>Station Name:</strong> {{ selectedRefuelLog.stationName }}
            </div>
            <div class="station-address" v-if="selectedRefuelLog.stationAddress">
              <strong>Address:</strong> {{ selectedRefuelLog.stationAddress }}
            </div>
          </div>

          <div v-if="selectedRefuelLog.latitude && selectedRefuelLog.longitude" class="location-details">
            <div class="coordinates">
              <strong>Coordinates:</strong>
              {{ selectedRefuelLog.latitude.toFixed(6) }}, {{ selectedRefuelLog.longitude.toFixed(6) }}
            </div>
            <div id="refuel-map" style="height: 300px; margin-top: 1rem; border-radius: 8px;"></div>
          </div>

          <div v-else class="no-location">
            <div class="no-location-content">
              <i class="pi pi-map-marker" style="font-size: 2rem; color: #6c757d;"></i>
              <p>No location data available for this refuel log</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Vehicle Statistics Modal -->
    <Dialog
      header="Vehicle Refuel Statistics"
      v-model:visible="showVehicleStats"
      :modal="true"
      :style="{ width: '800px' }"
    >
      <div v-if="vehicleStats" class="vehicle-stats-modal">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Total Refuels</div>
            <div class="stat-value">{{ vehicleStats.statistics?.totalRefuels || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Total Fuel</div>
            <div class="stat-value">{{ vehicleStats.statistics?.totalFuel?.toFixed(1) || 0 }} L</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Total Cost</div>
            <div class="stat-value">R{{ vehicleStats.statistics?.totalCost?.toFixed(2) || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Avg per Refuel</div>
            <div class="stat-value">{{ vehicleStats.statistics?.averageFuelPerRefuel?.toFixed(1) || 0 }} L</div>
          </div>
        </div>

        <DataTable
          :value="vehicleStats.data"
          :loading="loadingVehicleStats"
          stripedRows
          class="vehicle-stats-table"
        >
          <Column field="amount" header="Amount (L)" />
          <Column field="cost" header="Cost">
            <template #body="{ data }">
              R{{ data.cost?.toFixed(2) || 'N/A' }}
            </template>
          </Column>
          <Column header="Date">
            <template #body="{ data }">
              {{ formatDate(data.refueledAt) }}
            </template>
          </Column>
          <Column field="stationName" header="Station" />
        </DataTable>
      </div>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      header="Confirm Delete"
      v-model:visible="showDeleteConfirm"
      :modal="true"
      :style="{ width: '500px' }"
      :closable="false"
    >
      <div class="delete-confirmation">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e74c3c;"></i>
        <h3>Are you sure you want to delete this refuel log?</h3>
        <p>This action cannot be undone. All data associated with this refuel log will be permanently removed.</p>

        <div class="delete-details" v-if="refuelLogToDelete">
          <p><strong>Log ID:</strong> #{{ refuelLogToDelete.id }}</p>
          <p><strong>Vehicle:</strong> {{ refuelLogToDelete.vehicle?.plateNumber }}</p>
          <p><strong>Date:</strong> {{ formatDate(refuelLogToDelete.refueledAt) }}</p>
          <p><strong>Amount:</strong> {{ refuelLogToDelete.amount }} L</p>
          <p><strong>Cost:</strong> R{{ refuelLogToDelete.cost?.toFixed(2) || 'N/A' }}</p>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="showDeleteConfirm = false"
          class="p-button-text"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          @click="confirmDeleteRefuelLog"
          class="p-button-danger"
          autofocus
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../axios';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ Import new components
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';

// PrimeVue components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Card from 'primevue/card';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';

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

// ===== UI State =====
const isSidebarOpen = ref(true);
const isDarkMode = ref(false);
const initialLoad = ref(true);
const showFilters = ref(false);

// ===== Data State =====
const refuelLogsData = ref([]);
const filteredRefuelLogs = ref([]);
const totalRecordsRefuelLogs = ref(0);
const pageRefuelLogs = ref(0);
const pageSizeRefuelLogs = ref(10);
const loadingRefuelLogs = ref(false);

const summaryStats = ref({});
const fuelStations = ref([]);
const vehicleStats = ref(null);
const loadingVehicleStats = ref(false);

// Modal states
const showRefuelLogDetail = ref(false);
const selectedRefuelLog = ref(null);
const showDeleteConfirm = ref(false);
const showVehicleStats = ref(false);
const refuelLogToDelete = ref(null);

// Filter states
const filterStartDate = ref(null);
const filterEndDate = ref(null);
const selectedVehicle = ref(null);
const filterStationName = ref('');
const vehicleOptions = ref([]);

// Map instances
let refuelMap = null;
let stationsMap = null;

// ===== Sidebar Toggle =====
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// ===== Helper Functions =====
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString();
const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString();

const calculateFuelPercentage = (fuelLevel) => {
  const maxCapacity = 100;
  return Math.min((fuelLevel / maxCapacity) * 100, 100);
};

// ===== Data Fetching =====
const fetchRefuelData = async () => {
  await Promise.all([
    fetchRefuelLogs(),
    fetchSummaryStats(),
    fetchFuelStations(),
  ]);
};

const fetchRefuelLogs = async () => {
  try {
    loadingRefuelLogs.value = true;

    const params = {
      page: pageRefuelLogs.value + 1,
      pageSize: pageSizeRefuelLogs.value,
    };

    // Add filters
    if (filterStartDate.value) params.startDate = filterStartDate.value.toISOString();
    if (filterEndDate.value) params.endDate = filterEndDate.value.toISOString();
    if (selectedVehicle.value) params.vehicleId = selectedVehicle.value.id;
    if (filterStationName.value) params.stationName = filterStationName.value;

    const response = await api.get('/refuellogs/all', { params });

    if (response.data?.data) {
      refuelLogsData.value = response.data.data;
      totalRecordsRefuelLogs.value = response.data.totalCount;
      extractVehicleOptions();
      applyFilters();
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load refuel logs',
      life: 3000,
    });
    console.error('Error loading refuel logs:', error);
  } finally {
    loadingRefuelLogs.value = false;
    initialLoad.value = false;
  }
};

const fetchSummaryStats = async () => {
  try {
    const response = await api.get('/refuellogs/stats/summary');
    summaryStats.value = response.data;
  } catch (error) {
    console.error('Error loading summary stats:', error);
  }
};

const fetchFuelStations = async () => {
  try {
    const response = await api.get('/refuellogs/stations');
    fuelStations.value = response.data;
    initializeStationsMap();
  } catch (error) {
    console.error('Error loading fuel stations:', error);
  }
};

const fetchVehicleStats = async (vehicleId) => {
  try {
    loadingVehicleStats.value = true;
    const response = await api.get(`/refuellogs/vehicle/${vehicleId}`);
    vehicleStats.value = response.data;
    showVehicleStats.value = true;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load vehicle statistics',
      life: 3000,
    });
    console.error('Error loading vehicle stats:', error);
  } finally {
    loadingVehicleStats.value = false;
  }
};

// ===== Filter Functions =====
const extractVehicleOptions = () => {
  const vehicles = refuelLogsData.value
    .filter((log) => log.vehicle)
    .map((log) => log.vehicle)
    .filter(
      (vehicle, index, self) =>
        self.findIndex((v) => v.id === vehicle.id) === index
    );
  vehicleOptions.value = vehicles;
};

const applyFilters = () => {
  let filtered = [...refuelLogsData.value];

  if (filterStartDate.value) {
    const startDate = new Date(filterStartDate.value);
    filtered = filtered.filter((log) => new Date(log.refueledAt) >= startDate);
  }

  if (filterEndDate.value) {
    const endDate = new Date(filterEndDate.value);
    endDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter((log) => new Date(log.refueledAt) <= endDate);
  }

  if (selectedVehicle.value) {
    filtered = filtered.filter(
      (log) => log.vehicle?.id === selectedVehicle.value.id
    );
  }

  if (filterStationName.value) {
    filtered = filtered.filter((log) =>
      log.stationName?.toLowerCase().includes(filterStationName.value.toLowerCase())
    );
  }

  filteredRefuelLogs.value = filtered;
  totalRecordsRefuelLogs.value = filtered.length;
};

const clearFilters = () => {
  filterStartDate.value = null;
  filterEndDate.value = null;
  selectedVehicle.value = null;
  filterStationName.value = '';
  filteredRefuelLogs.value = [...refuelLogsData.value];
  totalRecordsRefuelLogs.value = refuelLogsData.value.length;
};

// ===== Map Functions =====
const initializeStationsMap = () => {
  if (fuelStations.value.length === 0) return;

  if (stationsMap) {
    stationsMap.remove();
    stationsMap = null;
  }

  setTimeout(() => {
    const mapElement = document.getElementById('stations-map');
    if (!mapElement) return;

    const group = new L.featureGroup();
    stationsMap = L.map('stations-map');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(stationsMap);

    fuelStations.value.forEach((station) => {
      if (station.latitude && station.longitude) {
        const marker = L.marker([station.latitude, station.longitude])
          .addTo(stationsMap)
          .bindPopup(`
            <div class="map-popup">
              <strong>${station.stationName}</strong><br>
              <strong>Refuels:</strong> ${station.refuelCount}<br>
              <strong>Last Refuel:</strong> ${formatDate(station.lastRefuel)}<br>
              <strong>Address:</strong> ${station.address || 'N/A'}
            </div>
          `);
        group.addLayer(marker);
      }
    });

    if (group.getLayers().length > 0) {
      stationsMap.fitBounds(group.getBounds().pad(0.1));
    } else {
      stationsMap.setView([-28.4793, 24.6727], 5);
    }
  }, 100);
};

const initializeRefuelMap = () => {
  if (!selectedRefuelLog.value?.latitude || !selectedRefuelLog.value?.longitude) return;

  if (refuelMap) {
    refuelMap.remove();
    refuelMap = null;
  }

  const { latitude, longitude } = selectedRefuelLog.value;

  setTimeout(() => {
    const mapElement = document.getElementById('refuel-map');
    if (!mapElement) return;

    refuelMap = L.map('refuel-map').setView([latitude, longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(refuelMap);

    const fuelIcon = L.divIcon({
      html: '<i class="pi pi-map-marker" style="color: #e74c3c; font-size: 24px;"></i>',
      className: 'fuel-station-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    const marker = L.marker([latitude, longitude], { icon: fuelIcon })
      .addTo(refuelMap)
      .bindPopup(`
        <div class="map-popup">
          <strong>${selectedRefuelLog.value.stationName || 'Fuel Station'}</strong><br>
          <strong>Vehicle:</strong> ${selectedRefuelLog.value.vehicle?.plateNumber || 'N/A'}<br>
          <strong>Date:</strong> ${formatDateTime(selectedRefuelLog.value.refueledAt)}<br>
          <strong>Amount:</strong> ${selectedRefuelLog.value.amount} L<br>
          <strong>Cost:</strong> R${selectedRefuelLog.value.cost?.toFixed(2) || 'N/A'}
        </div>
      `);

    marker.openPopup();
  }, 100);
};

// ===== Event Handlers =====
const onRefuelLogsPageChange = (event) => {
  pageRefuelLogs.value = event.page;
  pageSizeRefuelLogs.value = event.rows;
  fetchRefuelLogs();
};

const viewRefuelLog = (log) => {
  selectedRefuelLog.value = log;
  showRefuelLogDetail.value = true;
  setTimeout(() => initializeRefuelMap(), 300);
};

const viewOnMap = (log) => {
  selectedRefuelLog.value = log;
  showRefuelLogDetail.value = true;
  setTimeout(() => initializeRefuelMap(), 300);
};

const viewVehicleStats = (vehicleId) => {
  fetchVehicleStats(vehicleId);
};

const deleteRefuelLog = (id) => {
  const log = refuelLogsData.value.find((l) => l.id === id);
  if (log) {
    refuelLogToDelete.value = log;
    showDeleteConfirm.value = true;
  }
};

const confirmDeleteRefuelLog = async () => {
  if (!refuelLogToDelete.value) return;

  try {
    await api.delete(`/refuellogs/${refuelLogToDelete.value.id}`);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Refuel log deleted successfully',
      life: 3000,
    });

    showDeleteConfirm.value = false;
    refuelLogToDelete.value = null;
    fetchRefuelData(); // Refresh all data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete refuel log',
      life: 3000,
    });
  }
};

const exportData = () => {
  const headers = ['ID', 'Vehicle', 'Amount (L)', 'Cost (R)', 'Date', 'Station', 'Odometer'];
  const csvData = filteredRefuelLogs.value.map((log) => [
    log.id,
    log.vehicle?.plateNumber || 'N/A',
    log.amount,
    log.cost || 'N/A',
    formatDate(log.refueledAt),
    log.stationName || 'N/A',
    log.odometer || 'N/A',
  ]);

  const csvContent = [headers, ...csvData]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `refuel-logs-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);

  toast.add({
    severity: 'success',
    summary: 'Export Complete',
    detail: 'Refuel logs exported successfully',
    life: 3000,
  });
};

const rowClass = (data) => {
  return data.cost && data.cost > 1000 ? 'high-cost-row' : '';
};

// ===== Logout =====
const handleLogout = () => {
  Swal.fire({
    title: 'Logout?',
    text: 'Are you sure you want to logout?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, logout!',
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('authToken');
      router.push('/');
      toast.add({
        severity: 'success',
        summary: 'Logged Out',
        detail: 'You have been logged out successfully',
        life: 3000,
      });
    }
  });
};

// ===== Lifecycle =====
onMounted(async () => {
  await fetchRefuelData();
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
  margin-left: 260px;
  padding: 2rem 1.5rem;
  width: calc(100% - 260px);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.sidebar-collapsed {
  margin-left: 72px;
  width: calc(100% - 72px);
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* =========================================================
   SUMMARY CARDS
   ========================================================= */
.summary-section {
  margin-bottom: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.summary-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.summary-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.summary-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.card-content {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* =========================================================
   MAP SECTION
   ========================================================= */
.map-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
}

.stations-legend {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 20px;
}
.dark .legend-item {
  background: #1e293b;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* =========================================================
   TABLE SECTION
   ========================================================= */
.table-section {
  margin-bottom: 3rem;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.dark .table-section {
  background: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-button,
.filter-button,
.export-button {
  color: #64748b;
}
.dark .refresh-button,
.dark .filter-button,
.dark .export-button {
  color: #94a3b8;
}

/* =========================================================
   FILTERS
   ========================================================= */
.filters-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
}

.dark .filters-section {
  background: #0f172a;
  border-color: #334155;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group .p-float-label {
  min-width: 200px;
}

.vehicle-filter {
  min-width: 200px;
}

.clear-filters {
  margin-left: auto;
}

/* =========================================================
   TABLE CUSTOM STYLES
   ========================================================= */
.vehicle-info {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.vehicle-model {
  font-size: 0.8rem;
  color: #6c757d;
  margin-left: 0.5rem;
}

.fuel-amount {
  font-weight: 600;
  color: #27ae60;
}

.fuel-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fuel-progress {
  width: 80px;
  height: 6px;
}

.cost-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.no-cost {
  color: #6c757d;
  font-style: italic;
}

.timestamp {
  font-size: 0.9rem;
}

.date {
  font-weight: 500;
}

.time {
  color: #6c757d;
  font-size: 0.8rem;
}

.station-info-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.odometer {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.no-odometer {
  color: #6c757d;
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.view-button,
.map-button,
.delete-button,
.stats-button {
  min-width: 2rem;
  height: 2rem;
}

/* =========================================================
   MODAL STYLES
   ========================================================= */
.refuel-detail-modal {
  padding: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}
.dark .detail-section {
  background: #1e293b;
  border-left-color: #4fc3f7;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}
.dark .detail-item {
  border-bottom-color: #334155;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  font-weight: 600;
  color: #495057;
}
.dark .detail-item label {
  color: #e2e8f0;
}

.log-id {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.vehicle-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.fuel-amount-detail {
  color: #27ae60;
  font-weight: 600;
  font-size: 1.1rem;
}

.fuel-level-detail {
  color: #2980b9;
  font-weight: 600;
}

.cost-detail {
  color: #e67e22;
  font-weight: 600;
  font-size: 1.1rem;
}

.odometer-detail {
  color: #8e44ad;
  font-weight: 600;
}

.location-section {
  margin-top: 2rem;
}

.location-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.dark .location-details {
  background: #1e293b;
}

.coordinates,
.station-address {
  margin-bottom: 0.5rem;
}

.no-location {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 2rem;
}
.dark .no-location {
  background: #1e293b;
}

.no-location-content {
  color: #6c757d;
}

/* =========================================================
   DELETE CONFIRMATION
   ========================================================= */
.delete-confirmation {
  text-align: center;
  padding: 1rem;
}

.delete-confirmation h3 {
  color: #e74c3c;
  margin: 1rem 0;
}

.delete-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: left;
}
.dark .delete-details {
  background: #1e293b;
}

/* =========================================================
   VEHICLE STATS MODAL
   ========================================================= */
.vehicle-stats-modal {
  padding: 1rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #3498db;
}
.dark .stat-item {
  background: #1e293b;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}
.dark .stat-label {
  color: #94a3b8;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
}
.dark .stat-value {
  color: #f1f5f9;
}

.cost-per-liter {
  color: #27ae60;
  font-weight: 600;
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

:deep(.high-cost-row) {
  background-color: #fff3cd !important;
}
.dark :deep(.high-cost-row) {
  background-color: #4a3a1a !important;
}
:deep(.high-cost-row:hover) {
  background-color: #ffeaa7 !important;
}
.dark :deep(.high-cost-row:hover) {
  background-color: #5a4a2a !important;
}

.table-spinner {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
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
  .summary-cards {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .filter-group {
    flex-direction: column;
  }
  .filter-group .p-float-label,
  .vehicle-filter {
    min-width: auto;
    width: 100%;
  }
  .clear-filters {
    margin-left: 0;
  }
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>