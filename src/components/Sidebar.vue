<template>
  <div class="layout-wrapper">
    <!-- Top bar for toggle button -->
    <div>
      <Button
        icon="pi pi-bars"
        class="p-button-text toggle-button"
        @click="toggleSidebar"
      />
    </div>

    <!-- Sidebar transition and container -->
    <transition name="slide">
      <aside v-if="isOpen" class="sidebar">
        <PanelMenu :model="menuItems" class="custom-panel" />
      </aside>
    </transition>
  </div>
</template>


<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import PanelMenu from 'primevue/panelmenu'

const emit = defineEmits(['toggle'])

const isOpen = ref(true)

const toggleSidebar = () => {
  isOpen.value = !isOpen.value
  emit('toggle', isOpen.value)
}

const router = useRouter()

const menuItems = [
  { label: 'Dashboard', icon: 'pi pi-home', command: () => router.push('/dashboard') },
  { label: 'Vehicles', icon: 'pi pi-car', command: () => router.push('/vehicles') },
  { label: 'Refuel Logs', icon:'pi pi-align-justify', command: () => router.push('/refuel-logs') },
  { label: 'Alerts', icon: 'pi pi-bell', command: () => router.push('/alerts') },
  { label: 'Settings', icon: 'pi pi-cog', command: () => router.push('/settings') },
]
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: #ecf0f1;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  overflow-y: auto;
  padding: 1rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    width: 80%;
    max-width: 300px;
    z-index: 30;
  }

  .main-content {
    margin-left: 0 !important;
    width: 100% !important;
  }
}

.toggle-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 20;
  background-color: #2c3e50;
  color: #ecf0f1;
}

.custom-panel ::v-deep(.p-panelmenu .p-menuitem-link) {
  color: #ecf0f1;
  padding: 1rem;
}

.custom-panel ::v-deep(.p-panelmenu .p-menuitem-link:hover) {
  background-color: #34495e;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
}

.top-bar {
  background-color: #2c3e50;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  height: 50px;
  z-index: 20;
  position: sticky;
  top: 0;
}

.toggle-button {
  color: #fff;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: #ecf0f1;
  height: 100vh;
  overflow-y: auto;
  padding: 1rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: fixed;
  top: 50px; /* Moves sidebar below the top bar */
  left: 0;
}

.custom-panel ::v-deep(.p-panelmenu .p-menuitem-link) {
  color: #ecf0f1;
  padding: 1rem;
}

.custom-panel ::v-deep(.p-panelmenu .p-menuitem-link:hover) {
  background-color: #34495e;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}



</style>
