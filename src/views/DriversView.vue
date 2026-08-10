<template>
  <div :class="['dashboard-layout', { dark: isDarkMode }]">
    <!-- Loading Overlay -->
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
    <div class="layout-wrapper">
      <div
        class="main-content"
        :class="{
          'sidebar-collapsed': !isSidebarOpen,
        }"
      >
        <div class="content-container">
          <div class="header-section">
            <h1>Driver Management</h1>
            <div class="header-actions">
              <Button
                label="Add Driver"
                icon="pi pi-plus"
                class="p-button-primary"
                @click="showDialog = true"
              />
              <Button
                icon="pi pi-filter"
                class="p-button-text"
                @click="toggleFilterPanel"
                v-tooltip="'Filter drivers'"
              />
            </div>
          </div>

          <TabView>
            <TabPanel header="Driver List">
              <DataTable
                :value="drivers"
                :paginator="true"
                :rows="10"
                :loading="loading"
                stripedRows
              >
                <Column field="fullName" header="Name" :sortable="true">
                  <template #body="{ data }">
                    <router-link :to="`/drivers/${data.id}`" class="driver-link">
                      {{ data.firstName }} {{ data.lastName }}
                    </router-link>
                  </template>
                </Column>
                <Column field="email" header="Email" :sortable="true" />
                <Column field="phoneNumber" header="Phone" :sortable="true" />
                <Column field="hireDate" header="Hire Date" :sortable="true">
                  <template #body="{ data }">
                    {{ formatDate(data.hireDate) }}
                  </template>
                </Column>
                <Column field="licenseNumber" header="License #" :sortable="true" />
                <Column field="emergencyContactName" header="Next Of Kin" :sortable="true" />
                <Column field="emergencyContactPhone" header="Emergency Phone" :sortable="true" />
                <Column header="Actions">
                  <template #body="{ data }">
                    <Button
                      icon="pi pi-eye"
                      class="p-button-rounded p-button-text"
                      @click="viewDriver(data.id)"
                      v-tooltip="'View details'"
                    />
                    <Button
                      icon="pi pi-pencil"
                      class="p-button-rounded p-button-text"
                      @click="editDriver(data.id)"
                      v-tooltip="'Edit driver'"
                    />
                  </template>
                </Column>
              </DataTable>
            </TabPanel>

            <TabPanel header="Performance">
              <div class="performance-grid">
                <div class="performance-card">
                  <h3>Top Performers</h3>
                  <DataTable :value="topPerformers" :loading="loading">
                    <Column field="fullName" header="Driver"></Column>
                    <Column field="safetyScore" header="Safety Score">
                      <template #body="{ data }">
                        <Rating :modelValue="data.safetyScore / 20" readonly :cancel="false" />
                        ({{ data.safetyScore.toFixed(1) }})
                      </template>
                    </Column>
                    <Column field="efficiencyScore" header="Efficiency">
                      <template #body="{ data }">
                        <Rating :modelValue="data.efficiencyScore / 20" readonly :cancel="false" />
                        ({{ data.efficiencyScore.toFixed(1) }})
                      </template>
                    </Column>
                  </DataTable>
                </div>

                <div class="performance-card">
                  <h3>Certification Alerts</h3>
                  <DataTable :value="expiringCertifications" :loading="loading">
                    <Column field="driverName" header="Driver"></Column>
                    <Column field="type" header="Type"></Column>
                    <Column header="Expires">
                      <template #body="{ data }">
                        {{ formatDate(data.expiryDate) }}
                        <Tag
                          :severity="data.daysUntilExpiry <= 7 ? 'danger' : 'warning'"
                          :value="`${data.daysUntilExpiry} days`"
                        />
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </div>
            </TabPanel>
          </TabView>

          <Toast />
          <DriverDialog
            v-model="showDialog"
            :serverErrors="serverErrors"
            @save="handleSaveDriver"
            @cancel="handleCancelDriver"
            @update:serverErrors="serverErrors = $event"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Rating from 'primevue/rating';
import Tag from 'primevue/tag';

// ✅ Import new components
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';
import DriverDialog from '../components/DriverDialog.vue';

import api from '../axios';

const router = useRouter();
const store = useStore();
const toast = useToast();

// ===== State =====
const isSidebarOpen = ref(true);
const isDarkMode = ref(false);
const loading = ref(false);
const drivers = ref([]);
const topPerformers = ref([]);
const expiringCertifications = ref([]);
const showDialog = ref(false);
const serverErrors = ref(null);

// ===== Sidebar Toggle =====
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// ===== Data Fetching =====
const fetchDrivers = async () => {
  try {
    loading.value = true;
    const response = await api.get('/drivers');
    drivers.value = response.data.data;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load drivers',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const fetchPerformanceData = async () => {
  try {
    const response = await api.get('/drivers/performance/top');
    topPerformers.value = response.data.data;
  } catch (error) {
    console.error('Error fetching top performers:', error);
  }
};

const fetchCertificationAlerts = async () => {
  try {
    const response = await api.get('/drivers/expiring-certifications?daysThreshold=30');
    expiringCertifications.value = response.data.data;
  } catch (error) {
    console.error('Error fetching expiring certifications:', error);
  }
};

// ===== Driver Actions =====
const handleSaveDriver = async (driverData) => {
  try {
    loading.value = true;
    const response = await api.post('/drivers', driverData);
    if (response.data.success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Driver created successfully',
        life: 3000,
      });
      drivers.value.unshift(response.data.data);
      showDialog.value = false;
    }
  } catch (err) {
    if (err.response?.data?.errors) {
      serverErrors.value = err.response.data.errors;
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.message || 'Failed to create driver',
        life: 5000,
      });
    }
  } finally {
    loading.value = false;
  }
};

const handleCancelDriver = () => {
  showDialog.value = false;
};

const viewDriver = (id) => {
  router.push(`/drivers/${id}`);
};

const editDriver = (id) => {
  router.push(`/drivers/${id}/edit`);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const toggleFilterPanel = () => {
  // Placeholder for filter panel logic
  toast.add({
    severity: 'info',
    summary: 'Coming Soon',
    detail: 'Filter panel will be available in the next update',
    life: 2000,
  });
};

// ===== Lifecycle =====
onMounted(async () => {
  await Promise.all([
    fetchDrivers(),
    fetchPerformanceData(),
    fetchCertificationAlerts(),
  ]);
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

/* =========================================================
   MAIN CONTENT
   ========================================================= */
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
   HEADER SECTION
   ========================================================= */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-section h1 {
  margin: 0;
  font-weight: 600;
  font-size: 1.75rem;
}

.dark .header-section h1 {
  color: #f1f5f9;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* =========================================================
   DRIVER LINK
   ========================================================= */
.driver-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}
.driver-link:hover {
  text-decoration: underline;
}

.dark .driver-link {
  color: #818cf8;
}

/* =========================================================
   PERFORMANCE GRID
   ========================================================= */
.performance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.performance-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.dark .performance-card {
  background: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.performance-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #1e293b;
}
.dark .performance-card h3 {
  color: #e2e8f0;
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
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  .header-actions {
    justify-content: flex-start;
  }
  .performance-grid {
    grid-template-columns: 1fr;
  }
}
</style>