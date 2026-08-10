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
            <h1>Driver Certifications</h1>
            <div class="controls">
              <Dropdown
                v-model="filterStatus"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Filter by status"
                class="w-full md:w-14rem"
              />
              <InputText
                v-model="searchQuery"
                placeholder="Search drivers..."
                class="w-full md:w-20rem"
              />
            </div>
          </div>

          <DataTable
            :value="filteredCertifications"
            :paginator="true"
            :rows="10"
            :loading="loading"
            stripedRows
          >
            <Column field="fullName" header="Driver" sortable>
              <template #body="{ data }">
                <router-link :to="`/drivers/${data.driverId}`" class="driver-link">
                  {{ data.fullName }}
                </router-link>
              </template>
            </Column>
            <Column field="licenseExpiry" header="License Expiry" sortable>
              <template #body="{ data }">
                <Tag :severity="getStatus(data.licenseExpiry)" :value="formatDate(data.licenseExpiry)" />
              </template>
            </Column>
            <Column field="medicalCertExpiry" header="Medical Cert. Expiry" sortable>
              <template #body="{ data }">
                <Tag :severity="getStatus(data.medicalCertExpiry)" :value="formatDate(data.medicalCertExpiry)" />
              </template>
            </Column>
            <Column header="Actions">
              <template #body="{ data }">
                <Button
                  icon="pi pi-send"
                  class="p-button-rounded p-button-text"
                  v-tooltip="'Send reminder'"
                  @click="sendReminder(data.driverId)"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import api from '../axios';
import Sidebar from '../components/Sidebar.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Avatar from 'primevue/avatar';

const router = useRouter();
const store = useStore();

const certifications = ref([]);
const loading = ref(false);
const filterStatus = ref(null);
const searchQuery = ref('');
const isSidebarOpen = ref(true);
const isDarkMode = ref(false);

const statusOptions = [
  { label: 'All', value: null },
  { label: 'Expired', value: 'expired' },
  { label: 'Expiring Soon', value: 'expiring' },
  { label: 'Valid', value: 'valid' }
];

onMounted(async () => {
  await fetchCertifications();
});

const fetchCertifications = async () => {
  try {
    loading.value = true;
    const response = await api.get('/drivers/certifications');
    certifications.value = response.data.data;
  } catch (error) {
    console.error('Error fetching certifications:', error);
  } finally {
    loading.value = false;
  }
};

const filteredCertifications = computed(() => {
  let result = certifications.value;
  if (filterStatus.value === 'expired') {
    result = result.filter(d =>
      new Date(d.licenseExpiry) < new Date() ||
      new Date(d.medicalCertExpiry) < new Date()
    );
  } else if (filterStatus.value === 'expiring') {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 30);
    result = result.filter(d =>
      (new Date(d.licenseExpiry) < threshold && new Date(d.licenseExpiry) >= new Date()) ||
      (new Date(d.medicalCertExpiry) < threshold && new Date(d.medicalCertExpiry) >= new Date())
    );
  } else if (filterStatus.value === 'valid') {
    result = result.filter(d =>
      new Date(d.licenseExpiry) >= new Date() &&
      new Date(d.medicalCertExpiry) >= new Date()
    );
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(d =>
      d.fullName.toLowerCase().includes(query) ||
      (d.licenseNumber && d.licenseNumber.toLowerCase().includes(query)) ||
      (d.medicalCertificateNumber && d.medicalCertificateNumber.toLowerCase().includes(query))
    );
  }
  return result;
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const getStatus = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'danger';
  if (days < 30) return 'warning';
  return 'success';
};

const sendReminder = (driverId) => {
  console.log('Sending reminder to driver', driverId);
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
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.driver-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}
.driver-link:hover {
  text-decoration: underline;
}
@media (min-width: 768px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
  }
}
</style>