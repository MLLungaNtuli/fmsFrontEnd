<template>
  <div>
    <h3>Vehicles</h3>
    <ul>
      <li v-for="v in vehicles" :key="v.id">
        {{ v.plateNumber }} - Fuel Level: {{ v.fuelLevel }}
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../axios';

export default {
  data() {
    return {
      vehicles: [],
    };
  },
  async mounted() {
    const token = localStorage.getItem('token');
    const res = await api.get('/Vehicles/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    this.vehicles = res.data;
  },
};
</script>
