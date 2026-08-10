import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import Vehicles from '@/views/Vehicles.vue';
import RefuelLogs from '@/views/RefuelLogs.vue';
import Alerts from '@/views/Alerts.vue';
import Maintenance from '@/views/Maintenance.vue';
import Settings from '@/views/Settings.vue';

const routes = [
  { 
    path: '/', 
    name: 'Login', 
    component: Login 
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/vehicles', 
    name: 'Vehicles', 
    component: Vehicles,
    meta: { requiresAuth: true, roles: ['FleetManager', 'Admin'] }
  },
  {
    path: '/drivers',
    name: 'Drivers',
    component: () => import('@/views/DriversView.vue'),
    meta: { requiresAuth: true, roles: ['FleetManager', 'Admin'] },
    children: [
      {
        path: ':id',
        name: 'DriverDetail',
        component: () => import('@/views/DriverDetailView.vue'),
        props: true
      },
      {
        path: ':id/edit',
        name: 'DriverEdit',
        component: () => import('@/views/DriverEditView.vue'),
        props: true
      },
      {
        path: ':id/performance',
        name: 'DriverPerformance',
        component: () => import('@/views/DriverPerformanceView.vue'),
        props: true
      },
      {
        path: 'certifications',
        name: 'DriverCertifications',
        component: () => import('@/views/DriverCertificationsView.vue')
      }
    ]
  },
  { 
    path: '/refuel-logs', 
    name: 'RefuelLogs', 
    component: RefuelLogs,
    meta: { requiresAuth: true, roles: ['FuelClerk', 'Admin'] }
  },
  { 
    path: '/alerts', 
    name: 'Alerts', 
    component: Alerts,
    meta: { requiresAuth: true }
  },
  { 
    path: '/maintenance', 
    name: 'Maintenance', 
    component: Maintenance,
    meta: { requiresAuth: true, roles: ['MaintenanceManager', 'Admin'] }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true, roles: ['Admin'] }
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/Unauthorized.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth) {
    if (!token) {
      return next('/'); // redirect to login
    }

    try {
      const decoded = jwtDecode(token);
      const rolesRaw = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
      const roles = Array.isArray(rolesRaw) ? rolesRaw : rolesRaw?.split(',') || [];

      if (to.meta.roles && to.meta.roles.length > 0) {
        const allowed = to.meta.roles.some(role => roles.includes(role));
        if (!allowed) {
          return next('/unauthorized');
        }
      }
    } catch (error) {
      console.error('JWT Decode Error:', error);
      return next('/'); // invalid token, redirect login
    }
  }

  next();
});

export default router;
