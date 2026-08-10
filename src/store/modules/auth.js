// store/modules/auth.js
import { jwtDecode } from 'jwt-decode';
import api from '@/axios';

export default {
  namespaced: true,
  state: () => ({
    token: localStorage.getItem('token') || null,
    roles: [],
  }),
  mutations: {
    setUserData(state, { token, roles }) {
      state.token = token;
      state.roles = roles;
      localStorage.setItem('token', token);
    },
    clearUserData(state) {
      state.token = null;
      state.roles = [];
      localStorage.removeItem('token');
    }
  },
  actions: {
    login({ commit }, { token }) {
      const decoded = jwtDecode(token);

      let roles = [];
      const claim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (Array.isArray(claim)) {
        roles = claim;
      } else if (typeof claim === 'string') {
        roles = claim.split(',');
      }

      commit('setUserData', { token, roles });
    },

    logout({ commit }) {
      commit('clearUserData');
    },

    async refreshToken({ state, commit }) {
      if (!state.token) return;

      try {
        const response = await api.post('/auth/refresh');
        const newToken = response.data.token;
        const decoded = jwtDecode(newToken);

        let roles = [];
        const claim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        if (Array.isArray(claim)) {
          roles = claim;
        } else if (typeof claim === 'string') {
          roles = claim.split(',');
        }

        commit('setUserData', { token: newToken, roles });
        return newToken; // ✅ Return new token
      } catch (error) {
        commit('clearUserData');
        throw error; // ✅ Allow caller to handle failure
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.roles,
    hasRole: (state) => (role) => state.roles.includes(role),
    hasAnyRole: (state) => (roles) => roles.some(r => state.roles.includes(r)),
  }
};
