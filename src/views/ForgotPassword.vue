<template>
  <Card>
    <template #title>Reset Password</template>
    <template #content>
      <InputText v-model="email" placeholder="Email" />
      <Button label="Send Reset Link" @click="submit" />
    </template>
  </Card>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/axios';

const email = ref('');

const submit = async () => {
  await api.post('/auth/forgot-password', { email: email.value });
};
</script>