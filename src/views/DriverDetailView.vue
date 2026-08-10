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
            <h1>{{ driver.fullName }}</h1>
            <div class="actions">
              <Button label="Edit" icon="pi pi-pencil" @click="editDriver" class="p-button-primary" />
              <Button label="Back" icon="pi pi-arrow-left" @click="goBack" class="p-button-secondary" />
            </div>
          </div>

          <TabView>
            <TabPanel header="Overview">
              <div class="grid">
                <div class="col-12 md:col-6">
                  <Card>
                    <template #title>Personal Information</template>
                    <template #content>
                      <div class="field"><label>Email:</label><p>{{ driver.email }}</p></div>
                      <div class="field"><label>Phone:</label><p>{{ driver.phoneNumber || 'N/A' }}</p></div>
                      <div class="field"><label>Date of Birth:</label><p>{{ formatDate(driver.dateOfBirth) }}</p></div>
                      <div class="field"><label>Address:</label><p>{{ driver.address || 'N/A' }}</p></div>
                    </template>
                  </Card>
                </div>
                <div class="col-12 md:col-6">
                  <Card>
                    <template #title>Certifications</template>
                    <template #content>
                      <div class="field">
                        <label>License:</label>
                        <p>
                          {{ driver.licenseNumber || 'N/A' }}
                          <Tag :severity="getLicenseStatus(driver.licenseExpiry)" :value="formatDate(driver.licenseExpiry)" class="ml-2" />
                        </p>
                      </div>
                      <div class="field">
                        <label>Medical Certificate:</label>
                        <p>
                          {{ driver.medicalCertificateNumber || 'N/A' }}
                          <Tag :severity="getCertStatus(driver.medicalCertificateExpiry)" :value="formatDate(driver.medicalCertificateExpiry)" class="ml-2" />
                        </p>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Performance">
              <router-link :to="`/drivers/${id}/performance`" class="p-button p-button-text">
                View Full Performance History
              </router-link>
              <PerformanceChart :driverId="id" />
            </TabPanel>

            <TabPanel header="Certifications">
              <CertificationTimeline :driverId="id" />
            </TabPanel>
          </TabView>
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
const id = route.params.id;
const driver = ref({});
const loading = ref(false);
const isSidebarOpen = ref(true);
const isDarkMode = ref(false);

onMounted(async () => {
  await fetchDriver();
});

const fetchDriver = async () => {
  try {
    loading.value = true;
    const response = await api.get(`/drivers/${id}`);
    driver.value = response.data.data;
    driver.value.fullName = `${driver.value.firstName} ${driver.value.lastName}`;
  } catch (error) {
    console.error('Error fetching driver:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const getLicenseStatus = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'danger';
  if (days < 30) return 'warning';
  return 'success';
};

const getCertStatus = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'danger';
  if (days < 30) return 'warning';
  return 'success';
};

const editDriver = () => {
  router.push(`/drivers/${id}/edit`);
};

const goBack = () => {
  router.push('/drivers');
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
.field {
  margin-bottom: 1rem;
}
.field label {
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-color-secondary);
}
.field p {
  margin: 0;
}
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
  }
}
</style>