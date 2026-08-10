import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import auth from './modules/auth';

const store = createStore({
  modules: {
    auth
  },
  plugins: [
    createPersistedState({
      paths: ['auth.token', 'auth.roles']
    })
  ]
});

export default store;
