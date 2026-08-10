<template>
  <div :class="['dashboard-layout', { dark: isDarkMode }]">
    <div v-if="loading" class="loading-indicator">
      <ProgressSpinner />
    </div>

    <header class="app-header">
      <div class="header-left">
        <Button
          icon="pi pi-bars"
          class="p-button-text sidebar-toggle"
          @click="isSidebarOpen = !isSidebarOpen"
        />
        <div class="logo">
          <i class="pi pi-car" /> Fleet Management
        </div>
      </div>
      <div class="header-right">
        <Button
          :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
          class="p-button-text theme-toggle"
          @click="isDarkMode = !isDarkMode"
          :label="isDarkMode ? 'Light Mode' : 'Dark Mode'"
        />
        <div class="user-menu">
          <Avatar icon="pi pi-user" class="user-avatar" />
          <span class="user-name">{{ store.getters['auth/userRoles'][0] || 'User' }}</span>
          <Button
            icon="pi pi-sign-out"
            class="p-button-text logout-button"
            label="Logout"
            @click="handleLogout"
          />
        </div>
      </div>
    </header>

    <div class="layout-wrapper">
      <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

      <div class="main-content" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
        <div class="content-container">
          <div class="header">
            <h1>Driver Performance</h1>
            <div class="actions">
              <Button label="Add Record" icon="pi pi-plus" @click="showAddDialog" class="p-button-primary" />
            </div>
          </div>

          <DataTable
            :value="performanceRecords"
            :paginator="true"
            :rows="10"
            :loading="loading"
            stripedRows
          >
            <Column field="recordDate" header="Date" sortable>
              <template #body="{ data }">{{ formatDate(data.recordDate) }}</template>
            </Column>
            <Column field="safetyScore" header="Safety Score" sortable>
              <template #body="{ data }">
                <Rating :modelValue="data.safetyScore / 20" readonly :cancel="false" />
                <span class="ml-2">{{ data.safetyScore.toFixed(1) }}</span>
              </template>
            </Column>
            <Column field="efficiencyScore" header="Efficiency" sortable>
              <template #body="{ data }">
                <Rating :modelValue="data.efficiencyScore / 20" readonly :cancel="false" />
                <span class="ml-2">{{ data.efficiencyScore.toFixed(1) }}</span>
              </template>
            </Column>
            <Column field="totalTrips" header="Trips" sortable />
            <Column field="totalDistance" header="Distance (km)" sortable>
              <template #body="{ data }">{{ data.totalDistance.toFixed(1) }}</template>
            </Column>
            <Column field="incidents" header="Incidents" sortable />
            <Column header="Actions">
              <template #body="{ data }">
                <Button icon="pi pi-eye" class="p-button-rounded p-button-text" @click="viewRecord(data.id)" v-tooltip="'View details'" />
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="editRecord(data.id)" v-tooltip="'Edit record'" />
              </template>
            </Column>
          </DataTable>

          <!-- Add Performance Dialog -->
          <Dialog v-model:visible="displayAddDialog" header="Add Performance Record" :modal="true" :style="{ width: '50vw' }">
            <div class="form-grid">
              <div class="field"><label>Date *</label><Calendar v-model="newRecord.recordDate" dateFormat="yy-mm-dd" showIcon class="w-full" /></div>
              <div class="field"><label>Safety Score (0-100) *</label><InputNumber v-model="newRecord.safetyScore" mode="decimal" :min="0" :max="100" class="w-full" /></div>
              <div class="field"><label>Efficiency Score (0-100) *</label><InputNumber v-model="newRecord.efficiencyScore" mode="decimal" :min="0" :max="100" class="w-full" /></div>
              <div class="field"><label>Total Trips</label><InputNumber v-model="newRecord.totalTrips" mode="decimal" :min="0" class="w-full" /></div>
              <div class="field"><label>Total Distance (km)</label><InputNumber v-model="newRecord.totalDistance" mode="decimal" :min="0" class="w-full" /></div>
              <div class="field"><label>Avg Fuel Consumption (km/L)</label><InputNumber v-model="newRecord.averageFuelConsumption" mode="decimal" :min="0" class="w-full" /></div>
              <div class="field"><label>Incidents</label><InputNumber v-model="newRecord.incidents" mode="decimal" :min="0" class="w-full" /></div>
              <div class="field col-span-2"><label>Evaluated By *</label><InputText v-model="newRecord.evaluatedBy" placeholder="Evaluator name" class="w-full" /></div>
              <div class="field col-span-2"><label>Notes</label><Textarea v-model="newRecord.notes" rows="3" class="w-full" /></div>
            </div>
            <template #footer>
              <Button label="Cancel" icon="pi pi-times" @click="displayAddDialog = false" class="p-button-text" />
              <Button label="Save" icon="pi pi-check" @click="savePerformanceRecord" class="p-button-primary" :loading="saving" />
            </template>
          </Dialog>

          <!-- View/Edit Dialog -->
          <Dialog v-model:visible="displayRecordDialog" :header="isEditing ? 'Edit Performance Record' : 'Performance Record Details'" :modal="true" :style="{ width: '50vw' }">
            <div class="form-grid">
              <div class="field"><label>Date</label><Calendar v-model="currentRecord.recordDate" dateFormat="yy-mm-dd" showIcon class="w-full" :disabled="!isEditing" /></div>
              <div class="field"><label>Safety Score</label><InputNumber v-model="currentRecord.safetyScore" mode="decimal" :min="0" :max="100" class="w-full" :disabled="!isEditing" /></div>
              <div class="field"><label>Efficiency Score</label><InputNumber v-model="currentRecord.efficiencyScore" mode="decimal" :min="0" :max="100" class="w-full" :disabled="!isEditing" /></div>
              <div class="field"><label>Total Trips</label><InputNumber v-model="currentRecord.totalTrips" mode="decimal" :min="0" class="w-full" :disabled="!isEditing" /></div>
              <div class="field"><label>Total Distance</label><InputNumber v-model="currentRecord.totalDistance" mode="decimal" :min="0" class="w-full" :disabled="!isEditing" /></div>
              <div class="field"><label>Avg Fuel Consumption</label><InputNumber v-model="currentRecord.averageFuelConsumption" mode="decimal" :min="0" class="w-full" :disabled="!isEditing" /></div>
              <div class="field"><label>Incidents</label><InputNumber v-model="currentRecord.incidents" mode="decimal" :min="0" class="w-full" :disabled="!isEditing" /></div>
              <div class="field col-span-2"><label>Evaluated By</label><InputText v-model="currentRecord.evaluatedBy" class="w-full" :disabled="!isEditing" /></div>
              <div class="field col-span-2"><label>Notes</label><Textarea v-model="currentRecord.notes" rows="3" class="w-full" :disabled="!isEditing" /></div>
            </div>
            <template #footer>
              <Button v-if="isEditing" label="Cancel" icon="pi pi-times" @click="cancelEdit" class="p-button-text" />
              <Button v-if="isEditing" label="Save" icon="pi pi-check" @click="updatePerformanceRecord" class="p-button-primary" :loading="saving" />
              <Button v-if="!isEditing" label="Close" icon="pi pi-times" @click="displayRecordDialog = false" class="p-button-text" />
            </template>
          </Dialog>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import api from '../axios';
import Sidebar from '../components/Sidebar.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Avatar from 'primevue/avatar';

const route = useRoute();
const router = useRouter();
const store = useStore();
const driverId = route.params.id;

const performanceRecords = ref([]);
const loading = ref(false);
const saving = ref(false);
const displayAddDialog = ref(false);
const displayRecordDialog = ref(false);
const isEditing = ref(false);
const isSidebarOpen = ref(true);
const isDarkMode = ref(false);

const newRecord = ref({
  driverId: driverId,
  recordDate: new Date(),
  safetyScore: 0,
  efficiencyScore: 0,
  totalTrips: 0,
  totalDistance: 0,
  averageFuelConsumption: 0,
  incidents: 0,
  notes: '',
  evaluatedBy: ''
});

const currentRecord = ref({});

onMounted(async () => {
  await fetchPerformanceRecords();
});

const fetchPerformanceRecords = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/drivers/${driverId}/performance`);
    performanceRecords.value = response.data.data;
  } catch (error) {
    console.error('Error fetching performance records:', error);
  } finally {
    loading.value = false;
  }
};

const showAddDialog = () => {
  newRecord.value = {
    driverId: driverId,
    recordDate: new Date(),
    safetyScore: 0,
    efficiencyScore: 0,
    totalTrips: 0,
    totalDistance: 0,
    averageFuelConsumption: 0,
    incidents: 0,
    notes: '',
    evaluatedBy: ''
  };
  displayAddDialog.value = true;
};

const savePerformanceRecord = async () => {
  try {
    saving.value = true;
    await api.post(`/drivers/${driverId}/performance`, newRecord.value);
    await fetchPerformanceRecords();
    displayAddDialog.value = false;
  } catch (error) {
    console.error('Error saving performance record:', error);
  } finally {
    saving.value = false;
  }
};

const viewRecord = async (recordId) => {
  try {
    const response = await api.get(`/drivers/${driverId}/performance/${recordId}`);
    currentRecord.value = response.data.data;
    isEditing.value = false;
    displayRecordDialog.value = true;
  } catch (error) {
    console.error('Error fetching performance record:', error);
  }
};

const editRecord = async (recordId) => {
  try {
    const response = await api.get(`/drivers/${driverId}/performance/${recordId}`);
    currentRecord.value = response.data.data;
    isEditing.value = true;
    displayRecordDialog.value = true;
  } catch (error) {
    console.error('Error fetching performance record:', error);
  }
};

const updatePerformanceRecord = async () => {
  try {
    saving.value = true;
    await api.put(`/drivers/${driverId}/performance/${currentRecord.value.id}`, currentRecord.value);
    await fetchPerformanceRecords();
    displayRecordDialog.value = false;
  } catch (error) {
    console.error('Error updating performance record:', error);
  } finally {
    saving.value = false;
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  displayRecordDialog.value = false;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const handleLogout = () => {
  store.dispatch('auth/logout');
  router.push('/login');
};
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: rgb(198, 239, 252);
  color: #2c3e50;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.dashboard-layout.dark {
  background-color: #1a1d28;
  color: #e4e6eb;
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
  background-color: rgba(255,255,255,0.7);
  z-index: 1000;
}
.dark .loading-indicator {
  background-color: rgba(26,29,40,0.7);
}
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
}
.dark .app-header {
  background-color: #252836;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #3498db;
}
.dark .logo {
  color: #4fc3f7;
}
.user-menu {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.user-avatar {
  background-color: #e3f2fd;
  color: #1976d2;
}
.dark .user-avatar {
  background-color: #2c387e;
  color: #bbdefb;
}
.user-name {
  font-weight: 500;
  white-space: nowrap;
}
.logout-button {
  color: #e74c3c;
}
.dark .logout-button {
  color: #ff8a80;
}
.theme-toggle {
  color: #5a6268;
}
.dark .theme-toggle {
  color: #a0aec0;
}
.sidebar-toggle {
  color: #5a6268;
}
.layout-wrapper {
  display: flex;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
}
.main-content {
  margin-left: 250px;
  padding: 1.5rem;
  width: calc(100% - 250px);
  transition: all 0.3s ease;
}
.main-content.sidebar-collapsed {
  margin-left: 0;
  width: 100%;
}
.content-container {
  max-width: 1400px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.field.col-span-2 {
  grid-column: span 2;
}
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .field.col-span-2 {
    grid-column: span 1;
  }
}
</style>