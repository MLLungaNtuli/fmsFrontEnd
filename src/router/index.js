// src/router/index.js or router.js
import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import Vehicles from '@/views/Vehicles.vue';
import RefuelLogs from '@/views/RefuelLogs.vue';
import Alerts from '@/views/Alerts.vue';

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/vehicles', name: 'Vehicles', component: Vehicles },
  { path: '/refuel-logs', name: 'RefuelLogs', component: RefuelLogs },
  { path: '/alerts', name: 'Alerts', component: Alerts },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
