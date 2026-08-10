<template>
  <div class="login-container">
    <!-- Background Image with Overlay -->
    <div class="background-layer"></div>
    
    <!-- Global Loader Overlay -->
    <div v-if="globalLoading" class="global-loader-overlay">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <p class="mt-3">Authenticating...</p>
    </div>

    <div class="card-container">
      <Card class="login-card">
        <template #title>
          <div class="text-center">
            <i class="pi pi-lock text-xl mr-2"></i>
            <span>Login</span>
          </div>
        </template>
        <template #content>
          <div class="p-fluid">
            <div class="field mb-4">
              <label for="email">Email</label>
              <InputText 
                id="email" 
                v-model="email" 
                placeholder="Enter email"
                class="p-inputtext-lg"
                autocomplete="username"
              />
            </div>

            <div class="field mb-5">
              <label for="password">Password</label>
              <Password 
                id="password" 
                v-model="password" 
                toggleMask 
                placeholder="Enter password" 
                :feedback="false"
                class="p-inputtext-lg"
                autocomplete="current-password"
              />
            </div>

            <Button 
              label="Login" 
              icon="pi pi-sign-in" 
              class="mt-3 login-button"
              @click="login"
              :disabled="globalLoading"
            />
          </div>
        </template>
      </Card>
    </div>

    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useStore } from 'vuex';
import api from '../axios';
import { jwtDecode } from 'jwt-decode';
import ProgressSpinner from 'primevue/progressspinner';

// State
const email = ref('');
const password = ref('');
const globalLoading = ref(false);

// Composables
const toast = useToast();
const router = useRouter();
const store = useStore();

// Dashboard redirect map
const roleDashboardMap = {
  Admin: '/dashboard',
  FleetManager: '/vehicles',
  Driver: '/driver-dashboard',
  FuelClerk: '/refuel-logs',
  MaintenanceManager: '/maintenance'
};

const login = async () => {
  globalLoading.value = true;
  try {
    const res = await api.post('/Auth/login', {
      email: email.value,
      password: password.value,
    });

    const token = res.data.token;
    localStorage.setItem('token', token);

    // ✅ Decode token and extract roles
    const decoded = jwtDecode(token);
    const rawRoles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || '';
    const roles = Array.isArray(rawRoles) ? rawRoles : rawRoles.split(',');

    store.commit('auth/setUserData', { token, roles });

    toast.add({
      severity: 'success',
      summary: 'Login Successful',
      detail: `Welcome, ${roles.join(', ')}`,
      life: 3000,
    });

    // Redirect based on role
    const primaryRole = roles.includes('Admin')
      ? 'Admin'
      : roles.includes('FleetManager')
      ? 'FleetManager'
      : roles[0];

    setTimeout(() => {
      router.push(roleDashboardMap[primaryRole] || '/dashboard');
      globalLoading.value = false;
    }, 1000);
  } catch (err) {
    globalLoading.value = false;
    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: err.response?.data || 'Invalid credentials',
      life: 3000,
    });
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(rgba(0, 35, 70, 0.85), rgba(0, 20, 40, 0.9)),
    url('https://images.unsplash.com/photo-1542744095-291d1f67b221?auto=format&fit=crop&w=1950&q=80');
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.card-container {
  width: 100%;
  max-width: 450px;
  padding: 1rem;
  z-index: 1;
}

.login-card {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.93);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transform: translateY(-5%);
}

.login-card :deep(.p-card-title) {
  color: #2c3e50;
  font-weight: 600;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid #eee;
}

.field label {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.3rem;
  display: block;
}

.login-button {
  background: linear-gradient(135deg, #2c3e50, #1a2a38);
  border: none;
  padding: 0.8rem;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.login-button:disabled {
  opacity: 0.7;
  transform: none !important;
}

.global-loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
  font-weight: 500;
}
</style>
