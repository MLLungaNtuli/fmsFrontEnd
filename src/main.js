import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Card from 'primevue/card';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice'
import Toast from 'primevue/toast';
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'


import InputMask from 'primevue/inputmask';
import Textarea from 'primevue/textarea';



import 'primevue/resources/themes/lara-light-indigo/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tooltip from 'primevue/tooltip';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(PrimeVue);
app.directive('tooltip', Tooltip);
app.use(ToastService);
app.use(ConfirmationService);

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Password', Password);
app.component('Card', Card);
app.component('Toast', Toast);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Calendar', Calendar);
app.component('Dialog', Dialog);
app.component('InputMask', InputMask);
app.component('Textarea', Textarea);

app.mount('#app');
