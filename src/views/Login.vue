<template>
  <div class="flex align-items-center justify-content-center min-h-screen bg-gray-100">
    <Card class="w-11 sm:w-6 md:w-4 lg:w-3 shadow-5">
      <template #title>Admin Login</template>
      <template #content>
        <div class="p-fluid">
          <div class="field">
            <label for="email">Username</label>
            <InputText id="email" v-model="email" placeholder="Enter username" />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <Password id="password" v-model="password" toggleMask placeholder="Enter password" />
          </div>

          <Button label="Login" icon="pi pi-sign-in" class="mt-3" @click="login" />
        </div>
      </template>
    </Card>

    <Toast />
  </div>
</template>

<script>
import api from '../axios';
import { useToast } from 'primevue/usetoast';

export default {
  data() {
    return {
      email: '',
      password: '',
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  methods: {
    async login() {
      try {
        const res = await api.post('/Auth/login', {
          email: this.email,
          password: this.password,
        });

        localStorage.setItem('token', res.data.token);
        this.$router.push('/dashboard');
      } catch (err) {
        this.toast.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: err.response?.data || 'Invalid credentials',
          life: 3000,
        });
      }
    },
  },
};
</script>


<style scoped>
.field {
  margin-bottom: 1rem;
}
</style>
