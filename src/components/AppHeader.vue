<template>
  <header class="app-header" :class="{ dark: isDarkMode }">
    <div class="header-inner">

      <!-- Left -->
      <div class="header-left">
        <Button
          icon="pi pi-bars"
          class="p-button-text sidebar-toggle"
          @click="$emit('toggle-sidebar')"
        />

        <div class="logo">
          <i class="pi pi-car"></i>
          <span>
            Fleet<span class="highlight">Manager</span>
          </span>
        </div>
      </div>

      <!-- Center Search -->
      <div class="header-center">
        <div class="search-wrapper">
          <i class="pi pi-search search-icon"></i>

          <input
            type="text"
            placeholder="Search vehicles, drivers, alerts..."
            class="search-input"
          />

          <kbd class="search-shortcut">⌘K</kbd>
        </div>
      </div>

      <!-- Right -->
      <div class="header-right">

        <!-- Notifications -->
        <Button
          icon="pi pi-bell"
          class="p-button-text icon-btn notification-btn"
          badge="3"
          badgeClass="p-badge-danger"
          v-tooltip="'Notifications'"
        />

        <!-- Dark Mode -->
        <Button
          :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
          class="p-button-text icon-btn theme-toggle"
          @click="toggleDarkMode"
          :aria-label="
            isDarkMode
              ? 'Switch to Light Mode'
              : 'Switch to Dark Mode'
          "
          v-tooltip="
            isDarkMode
              ? 'Switch to Light Mode'
              : 'Switch to Dark Mode'
          "
        />

        <!-- User Menu -->
        <div class="user-menu" @click="toggleUserMenu">

          <Avatar
            :label="userInitials"
            class="user-avatar"
          />

          <span class="user-name">
            {{ userName }}
          </span>

          <i
            class="pi pi-chevron-down user-caret"
            :class="{ rotated: userMenuOpen }"
          ></i>

          <transition name="fade">
            <div
              v-if="userMenuOpen"
              class="user-dropdown"
              @click.stop
            >

              <!-- Dropdown Header -->
              <div class="dropdown-header">
                <Avatar
                  :label="userInitials"
                  class="dropdown-avatar"
                />

                <div>
                  <p class="dropdown-name">
                    {{ userName }}
                  </p>

                  <p class="dropdown-role">
                    {{ userRole }}
                  </p>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <!-- Dropdown Menu -->
              <ul class="dropdown-menu">

                <li @click="goToProfile">
                  <i class="pi pi-user"></i>
                  <span>Profile</span>
                </li>

                <li @click="goToSettings">
                  <i class="pi pi-cog"></i>
                  <span>Settings</span>
                </li>

                <li class="dropdown-divider"></li>

                <li
                  @click="handleLogout"
                  class="logout-item"
                >
                  <i class="pi pi-sign-out"></i>
                  <span>Logout</span>
                </li>

              </ul>
            </div>
          </transition>

        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import { useToast } from 'primevue/usetoast';

/*
 * IMPORTANT:
 * Store the result of defineProps in "props".
 */
const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'toggle-sidebar',
  'update:isDarkMode',
]);

const router = useRouter();
const store = useStore();
const toast = useToast();

const userMenuOpen = ref(false);

/*
 * User information
 */
const userName = computed(
  () => store.getters['auth/userName'] || 'User'
);

const userRole = computed(
  () => store.getters['auth/userRoles']?.[0] || 'User'
);

const userInitials = computed(() =>
  userName.value
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
);

/*
 * Dark mode
 */
const toggleDarkMode = () => {
  emit(
    'update:isDarkMode',
    !props.isDarkMode
  );
};

/*
 * User menu
 */
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

const goToProfile = () => {
  router.push('/profile');
  userMenuOpen.value = false;
};

const goToSettings = () => {
  router.push('/settings');
  userMenuOpen.value = false;
};

const handleLogout = () => {
  store.dispatch('auth/logout');

  router.push('/login');

  userMenuOpen.value = false;

  toast.add({
    severity: 'success',
    summary: 'Logged Out',
    detail: 'You have been logged out successfully',
    life: 3000,
  });
};
</script>

<style scoped>
/* =========================================================
   HEADER
   ========================================================= */

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;

  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;

  backdrop-filter: blur(8px);

  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease;
}

/* DARK */
.app-header.dark {
  background: #111827;
  border-bottom-color: #374151;
}

/* =========================================================
   INNER
   ========================================================= */

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 64px;

  padding: 0 1.5rem;

  max-width: 1440px;
  margin: 0 auto;
}

/* =========================================================
   LEFT
   ========================================================= */

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-toggle {
  color: #6b7280 !important;
  font-size: 1.25rem;

  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.sidebar-toggle:hover {
  color: #111827 !important;
  background: #f3f4f6 !important;
}

.app-header.dark .sidebar-toggle {
  color: #9ca3af !important;
}

.app-header.dark .sidebar-toggle:hover {
  color: #f9fafb !important;
  background: #374151 !important;
}

/* =========================================================
   LOGO
   ========================================================= */

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  font-size: 1.25rem;
  font-weight: 700;

  color: #111827;

  transition: color 0.3s ease;
}

.logo i {
  font-size: 1.5rem;
  color: #6366f1;
}

.logo .highlight {
  color: #6366f1;
}

.app-header.dark .logo {
  color: #f9fafb;
}

/* =========================================================
   SEARCH
   ========================================================= */

.header-center {
  flex: 0 1 480px;
  display: none;
}

@media (min-width: 1024px) {
  .header-center {
    display: block;
  }
}

.search-wrapper {
  position: relative;

  display: flex;
  align-items: center;

  background: #f3f4f6;

  border-radius: 8px;

  padding: 0 0.75rem;

  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-wrapper:focus-within {
  background: #ffffff;

  box-shadow:
    0 0 0 3px rgba(99, 102, 241, 0.2);
}

.app-header.dark .search-wrapper {
  background: #374151;
}

.app-header.dark .search-wrapper:focus-within {
  background: #1f2937;
}

.search-icon {
  color: #9ca3af;
  font-size: 0.9rem;
}

.search-input {
  border: none;
  background: transparent;

  padding: 0.5rem 0.75rem;

  width: 100%;

  font-size: 0.9rem;

  color: #111827;

  outline: none;
}

.app-header.dark .search-input {
  color: #f3f4f6;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-shortcut {
  font-size: 0.65rem;

  padding: 0.15rem 0.4rem;

  background: #e5e7eb;

  border-radius: 4px;

  color: #6b7280;

  font-family: inherit;

  border: 1px solid #d1d5db;
}

.app-header.dark .search-shortcut {
  background: #4b5563;
  border-color: #6b7280;
  color: #d1d5db;
}

/* =========================================================
   RIGHT
   ========================================================= */

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-btn {
  color: #6b7280 !important;

  width: 2.5rem;
  height: 2.5rem;

  border-radius: 50% !important;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.icon-btn:hover {
  background: #f3f4f6 !important;
  color: #111827 !important;
}

.app-header.dark .icon-btn {
  color: #d1d5db !important;
}

.app-header.dark .icon-btn:hover {
  background: #374151 !important;
  color: #ffffff !important;
}

/* =========================================================
   USER MENU
   ========================================================= */

.user-menu {
  position: relative;

  display: flex;
  align-items: center;

  gap: 0.5rem;

  padding: 0.25rem 0.5rem 0.25rem 0.25rem;

  border-radius: 32px;

  cursor: pointer;

  transition: background-color 0.2s ease;
}

.user-menu:hover {
  background: #f3f4f6;
}

.app-header.dark .user-menu:hover {
  background: #374151;
}

/* =========================================================
   AVATAR
   ========================================================= */

.user-avatar,
.dropdown-avatar {
  background: #6366f1 !important;
  color: #ffffff !important;
}

.user-avatar {
  width: 2.25rem;
  height: 2.25rem;

  font-size: 0.8rem;
  font-weight: 600;

  border: 2px solid transparent;
}

/* =========================================================
   USER NAME
   ========================================================= */

.user-name {
  font-size: 0.85rem;
  font-weight: 500;

  color: #111827;

  white-space: nowrap;

  transition: color 0.3s ease;
}

.app-header.dark .user-name {
  color: #f3f4f6;
}

.user-caret {
  font-size: 0.65rem;

  color: #6b7280;

  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.app-header.dark .user-caret {
  color: #9ca3af;
}

.user-caret.rotated {
  transform: rotate(180deg);
}

/* =========================================================
   DROPDOWN
   ========================================================= */

.user-dropdown {
  position: absolute;

  top: calc(100% + 0.5rem);
  right: 0;

  min-width: 240px;

  background: #ffffff;

  border: 1px solid #e5e7eb;

  border-radius: 12px;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.1);

  padding: 0.5rem 0;

  z-index: 200;
}

.app-header.dark .user-dropdown {
  background: #1f2937;

  border-color: #374151;

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.3);
}

.dropdown-header {
  display: flex;
  align-items: center;

  gap: 0.75rem;

  padding: 0.5rem 1rem;
}

.dropdown-avatar {
  width: 2.5rem;
  height: 2.5rem;

  font-size: 0.9rem;
  font-weight: 600;
}

.dropdown-name {
  font-weight: 600;

  color: #111827;

  margin: 0;
}

.app-header.dark .dropdown-name {
  color: #f3f4f6;
}

.dropdown-role {
  font-size: 0.75rem;

  color: #6b7280;

  margin: 0;
}

.app-header.dark .dropdown-role {
  color: #9ca3af;
}

/* =========================================================
   DIVIDER
   ========================================================= */

.dropdown-divider {
  height: 1px;

  background: #e5e7eb;

  margin: 0.25rem 0;
}

.app-header.dark .dropdown-divider {
  background: #374151;
}

/* =========================================================
   MENU
   ========================================================= */

.dropdown-menu {
  list-style: none;

  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  display: flex;
  align-items: center;

  gap: 0.75rem;

  padding: 0.6rem 1rem;

  font-size: 0.85rem;

  color: #111827;

  cursor: pointer;

  transition: background-color 0.15s ease;
}

.dropdown-menu li:hover {
  background: #f3f4f6;
}

.app-header.dark .dropdown-menu li {
  color: #f3f4f6;
}

.app-header.dark .dropdown-menu li:hover {
  background: #374151;
}

.dropdown-menu li i {
  font-size: 1rem;

  color: #6b7280;

  width: 1.25rem;
}

.app-header.dark .dropdown-menu li i {
  color: #9ca3af;
}

/* =========================================================
   LOGOUT
   ========================================================= */

.logout-item {
  color: #ef4444 !important;
}

.logout-item i {
  color: #ef4444 !important;
}

/* =========================================================
   TRANSITIONS
   ========================================================= */

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>