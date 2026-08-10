<template>
  <Card>
    <template #title>Set New Password</template>
    <template #content>
      <Password v-model="newPassword" toggleMask />
      <Button label="Reset Password" @click="submit" />
    </template>
  </Card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/axios';

const newPassword = ref('');
const route = useRoute();

const submit = async () => {
  await api.post('/auth/reset-password', {
    email: route.query.email,
    token: route.query.token,
    newPassword: newPassword.value
  });
};
</script>
