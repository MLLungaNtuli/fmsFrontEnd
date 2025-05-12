<template>
  <div class="p-5">
    <h2>Welcome to the Dashboard</h2>
    <p>This is a protected route.</p>
  </div>
</template>

<script>
export default {
  mounted() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/');
    }
  },
};
</script>
