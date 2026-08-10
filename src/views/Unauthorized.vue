<template>
  <div class="unauthorized-container">
    <div class="content">
      <i class="pi pi-ban" style="font-size: 5rem; color: #e74c3c;"></i>
      <h1>Access Denied</h1>
      <p>You don't have permission to access this resource</p>
      <Button 
        label="Go to Dashboard" 
        @click="goToDashboard" 
        class="p-button-text"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();

const goToDashboard = () => {
  router.push('/dashboard');
};
</script>

<style scoped>
.unauthorized-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8f9fa;
}

.content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
