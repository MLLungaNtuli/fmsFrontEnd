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
          <Toolbar class="mb-4">
            <template #start>
              <h1>System Settings</h1>
            </template>
            <template #end>
              <Button
                label="Add Admin"
                icon="pi pi-plus"
                class="p-button-success"
                @click="openAdminDialog"
              />
            </template>
          </Toolbar>

          <Card>
            <template #title>Administrators</template>
            <template #content>
              <DataTable :value="admins" :loading="loading">
                <Column field="username" header="Username"></Column>
                <Column field="email" header="Email"></Column>
                <Column field="createdAt" header="Added On">
                  <template #body="{ data }">
                    {{ formatDate(data.createdAt) }}
                  </template>
                </Column>
                <Column header="Actions" style="width: 10rem">
                  <template #body="{ data }">
                    <Button
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-danger"
                      @click="confirmDelete(data)"
                    />
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>

          <!-- Add Admin Dialog -->
          <Dialog
            v-model:visible="adminDialog"
            header="Add Administrator"
            :modal="true"
          >
            <div class="p-fluid">
              <div class="field">
                <label for="username">Username</label>
                <InputText id="username" v-model.trim="newAdmin.username" />
              </div>
              <div class="field">
                <label for="email">Email</label>
                <InputText id="email" v-model.trim="newAdmin.email" />
              </div>
              <div class="field">
                <label for="password">Password</label>
                <Password
                  id="password"
                  v-model="newAdmin.password"
                  :feedback="false"
                  toggleMask
                />
              </div>
            </div>
            <template #footer>
              <Button
                label="Cancel"
                icon="pi pi-times"
                @click="closeAdminDialog"
                class="p-button-text"
              />
              <Button label="Save" icon="pi pi-check" @click="saveAdmin" autofocus />
            </template>
          </Dialog>

          <ConfirmDialog />
          <Toast />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

// ✅ Import new components
import AppHeader from '@/components/AppHeader.vue';
import Sidebar from '@/components/Sidebar.vue';

// PrimeVue components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Toolbar from 'primevue/toolbar';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import ProgressSpinner from 'primevue/progressspinner';

import api from '../axios';

const { proxy } = getCurrentInstance();
const store = useStore();
const router = useRouter();
const toast = useToast();

// Roles (using Vuex getter)
const userRoles = computed(() => store.getters['auth/userRoles']);

// ===== Local State =====
const admins = ref([]);
const loading = ref(false);
const adminDialog = ref(false);
const isSidebarOpen = ref(true);
const isDarkMode = ref(false);

const newAdmin = ref({
  username: '',
  email: '',
  password: '',
});

// ===== Sidebar Toggle =====
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// ===== Data Fetching – FIXED PATHS =====
const fetchAdmins = async () => {
  loading.value = true;
  try {
    const response = await api.get('/Admin'); // ✅ no /api prefix
    admins.value = response.data;
  } catch (error) {
    showError('Failed to load administrators');
  } finally {
    loading.value = false;
  }
};

// ===== Admin Dialog =====
const openAdminDialog = () => {
  newAdmin.value = { username: '', email: '', password: '' };
  adminDialog.value = true;
};

const closeAdminDialog = () => {
  adminDialog.value = false;
};

// ===== Save Admin – FIXED PATH =====
const saveAdmin = async () => {
  try {
    await api.post('/Admin', newAdmin.value); // ✅ no /api prefix
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Administrator added',
      life: 3000,
    });
    await fetchAdmins();
    closeAdminDialog();
  } catch (error) {
    showError('Failed to add administrator');
  }
};

// ===== Confirm Delete =====
const confirmDelete = (admin) => {
  proxy.$confirm.require({
    message: `Are you sure you want to delete ${admin.username}?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteAdmin(admin.id),
  });
};

// ===== Delete Admin – FIXED PATH =====
const deleteAdmin = async (id) => {
  try {
    await api.delete(`/Admin/${id}`); // ✅ no /api prefix
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Administrator removed',
      life: 3000,
    });
    await fetchAdmins();
  } catch (error) {
    showError('Failed to delete administrator');
  }
};

// ===== Helpers =====
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const showError = (message) => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  });
};

// ===== Role-based Access Control =====
onMounted(() => {
  const isAdmin = userRoles.value.includes('Admin');
  if (!isAdmin) {
    router.push('/unauthorized');
  } else {
    fetchAdmins();
  }
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
   TOOLBAR & CARD
   ========================================================= */
.mb-4 {
  margin-bottom: 1.5rem;
}

:deep(.p-toolbar) {
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.dark :deep(.p-toolbar) {
  background: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

h1 {
  margin: 0;
  font-weight: 600;
  font-size: 1.75rem;
}

.dark h1 {
  color: #f1f5f9;
}

:deep(.p-card) {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.dark :deep(.p-card) {
  background: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

:deep(.p-card .p-card-title) {
  color: #1e293b;
  font-weight: 600;
}
.dark :deep(.p-card .p-card-title) {
  color: #f1f5f9;
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

/* =========================================================
   DIALOG FORM
   ========================================================= */
.p-fluid .field {
  margin-bottom: 1rem;
}

.p-fluid .field label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.p-fluid .field input {
  width: 100%;
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
  .main-content {
    padding: 0.75rem;
  }
  :deep(.p-toolbar) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  :deep(.p-toolbar .p-toolbar-group-start),
  :deep(.p-toolbar .p-toolbar-group-end) {
    flex-wrap: wrap;
  }
}
</style>