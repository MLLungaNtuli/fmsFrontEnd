<template>
  <aside
    class="app-sidebar"
    :class="{
      collapsed: !isOpen,
      dark: isDarkMode,
    }"
  >
    <div class="sidebar-inner">
      <!-- Logo (expanded/collapsed) -->
      <div class="sidebar-logo" v-if="isOpen">
        <i class="pi pi-car"></i>
        <span>Fleet<span class="highlight">Manager</span></span>
      </div>
      <div class="sidebar-logo collapsed-logo" v-else>
        <i class="pi pi-car"></i>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li
            v-for="item in menuItems"
            :key="item.label"
            class="nav-item"
            :class="{
              active: isActive(item),
              'has-children': item.items,
              'open': isOpen && openSections.includes(item.label),
            }"
          >
            <div
              class="nav-link"
              @click="handleNavClick(item)"
              :title="!isOpen ? item.label : ''"
            >
              <i :class="item.icon"></i>
              <span v-if="isOpen" class="nav-label">{{ item.label }}</span>
              <i
                v-if="item.items && isOpen"
                class="pi pi-chevron-down nav-chevron"
                :class="{ rotated: openSections.includes(item.label) }"
                @click.stop="toggleSection(item.label)"
              ></i>
            </div>

            <!-- Submenu -->
            <transition name="expand">
              <ul v-if="item.items && isOpen && openSections.includes(item.label)" class="subnav-list">
                <li
                  v-for="sub in item.items"
                  :key="sub.label"
                  class="subnav-item"
                  :class="{ active: isActive(sub) }"
                >
                  <router-link :to="sub.route" class="subnav-link">
                    <i :class="sub.icon"></i>
                    <span>{{ sub.label }}</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div v-if="isOpen" class="sidebar-footer">
        <div class="version">v2.4.0</div>
        <div class="help-link">
          <i class="pi pi-question-circle"></i> Help
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';

defineProps({
  isOpen: Boolean,
  isDarkMode: Boolean,
});

const emit = defineEmits(['close']);

const router = useRouter();
const route = useRoute();
const store = useStore();

const openSections = ref([]);

// Build menu items based on user roles
const menuItems = computed(() => {
  const roles = store.getters['auth/userRoles'] || [];
  const items = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Vehicles', icon: 'pi pi-car', route: '/vehicles' },
  ];

  if (roles.some(r => ['Admin', 'FleetManager'].includes(r))) {
    items.push({
      label: 'Drivers',
      icon: 'pi pi-users',
      items: [
        { label: 'All Drivers', icon: 'pi pi-list', route: '/drivers' },
        { label: 'Performance', icon: 'pi pi-chart-bar', route: '/drivers/performance' },
        { label: 'Certifications', icon: 'pi pi-id-card', route: '/drivers/certifications' },
      ],
    });
  }

  if (roles.some(r => ['Admin', 'FuelClerk', 'FleetManager'].includes(r))) {
    items.push({ label: 'Refuel Logs', icon: 'pi pi-align-justify', route: '/refuel-logs' });
  }

  if (roles.some(r => ['Admin', 'MaintenanceManager', 'FleetManager'].includes(r))) {
    items.push({ label: 'Maintenance', icon: 'pi pi-wrench', route: '/maintenance' });
  }

  if (roles.some(r => ['Admin', 'FleetManager'].includes(r))) {
    items.push({ label: 'Alerts', icon: 'pi pi-bell', route: '/alerts' });
  }

  if (roles.includes('Admin')) {
    items.push({ label: 'Settings', icon: 'pi pi-cog', route: '/settings' });
  }

  return items;
});

const isActive = (item) => {
  if (item.route) {
    return route.path === item.route;
  }
  if (item.items) {
    return item.items.some(sub => route.path === sub.route);
  }
  return false;
};

const handleNavClick = (item) => {
  if (item.route) {
    router.push(item.route);
    emit('close');
  }
  if (item.items) {
    toggleSection(item.label);
  }
};

const toggleSection = (label) => {
  const idx = openSections.value.indexOf(label);
  if (idx > -1) {
    openSections.value.splice(idx, 1);
  } else {
    openSections.value.push(label);
  }
};
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 64px; /* header height */
  left: 0;
  bottom: 0;
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background 0.3s;
  z-index: 90;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-sidebar.dark {
  background: #1f2937;
  border-right-color: #374151;
}

.app-sidebar.collapsed {
  width: 72px;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.5rem 0;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #111827;
  transition: opacity 0.2s;
}
.sidebar-logo i {
  font-size: 1.4rem;
  color: #6366f1;
}
.sidebar-logo .highlight {
  color: #6366f1;
}
.collapsed-logo {
  justify-content: center;
  padding: 0.75rem 0;
}
.dark .sidebar-logo {
  color: #f9fafb;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 0.5rem 0.75rem;
}
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-item {
  margin-bottom: 0.15rem;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: background 0.15s, color 0.15s;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  gap: 0.75rem;
}
.nav-link:hover {
  background: #f3f4f6;
  color: #111827;
}
.dark .nav-link:hover {
  background: #374151;
  color: #f3f4f6;
}
.nav-item.active > .nav-link {
  background: #e0e7ff;
  color: #4338ca;
}
.dark .nav-item.active > .nav-link {
  background: #312e81;
  color: #a5b4fc;
}
.nav-link i:first-child {
  font-size: 1.2rem;
  width: 1.5rem;
  text-align: center;
  flex-shrink: 0;
}
.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
}
.nav-chevron {
  font-size: 0.65rem;
  transition: transform 0.2s;
  margin-left: auto;
}
.nav-chevron.rotated {
  transform: rotate(180deg);
}

/* Submenu */
.subnav-list {
  list-style: none;
  padding: 0;
  margin: 0.15rem 0 0.3rem 1.5rem;
  overflow: hidden;
}
.subnav-item {
  margin-bottom: 0.1rem;
}
.subnav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.85rem;
  transition: background 0.15s, color 0.15s;
}
.subnav-link:hover {
  background: #f3f4f6;
  color: #111827;
}
.dark .subnav-link:hover {
  background: #374151;
  color: #f3f4f6;
}
.subnav-item.active .subnav-link {
  background: #e0e7ff;
  color: #4338ca;
}
.dark .subnav-item.active .subnav-link {
  background: #312e81;
  color: #a5b4fc;
}
.subnav-link i {
  font-size: 0.9rem;
  width: 1.25rem;
  text-align: center;
}

/* Expand animation */
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  max-height: 500px;
  opacity: 1;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Sidebar Footer */
.sidebar-footer {
  border-top: 1px solid #e5e7eb;
  padding: 0.75rem 1.25rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: auto;
}
.dark .sidebar-footer {
  border-top-color: #374151;
  color: #9ca3af;
}
.help-link {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: color 0.15s;
}
.help-link:hover {
  color: #111827;
}
.dark .help-link:hover {
  color: #f3f4f6;
}

/* Scrollbar */
.app-sidebar::-webkit-scrollbar {
  width: 4px;
}
.app-sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.app-sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.dark .app-sidebar::-webkit-scrollbar-thumb {
  background: #4b5563;
}

/* Responsive: overlay on mobile */
@media (max-width: 768px) {
  .app-sidebar {
    transform: translateX(-100%);
    width: 280px;
  }
  .app-sidebar.open-mobile {
    transform: translateX(0);
  }
}
</style>