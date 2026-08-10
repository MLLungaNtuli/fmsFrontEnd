<template>
  <Dialog
    :visible="modelValue"
    @update:visible="$emit('update:modelValue', $event)"
    header="Add New Driver"
    :modal="true"
    :style="{ width: '50vw' }"
  >
    <div class="form-grid">
      <!-- First Name -->
      <div class="field">
        <label>First Name *</label>
        <InputText
          v-model="driver.firstName"
          placeholder="First Name"
          class="w-full"
          :class="{ 'p-invalid': errors.firstName }"
        />
        <small v-if="errors.firstName" class="p-error">{{ errors.firstName[0] }}</small>
      </div>

      <!-- Last Name -->
      <div class="field">
        <label>Last Name *</label>
        <InputText
          v-model="driver.lastName"
          placeholder="Last Name"
          class="w-full"
          :class="{ 'p-invalid': errors.lastName }"
        />
        <small v-if="errors.lastName" class="p-error">{{ errors.lastName[0] }}</small>
      </div>

      <!-- Email -->
      <div class="field">
        <label>Email *</label>
        <InputText
          v-model="driver.email"
          placeholder="Email"
          class="w-full"
          :class="{ 'p-invalid': errors.email }"
        />
        <small v-if="errors.email" class="p-error">{{ errors.email[0] }}</small>
      </div>

      <!-- Phone -->
      <div class="field">
        <label>Phone</label>
        <InputMask
          v-model="driver.phoneNumber"
          mask="(999) 999-9999"
          placeholder="(123) 456-7890"
          class="w-full"
          :class="{ 'p-invalid': errors.phoneNumber }"
        />
        <small v-if="errors.phoneNumber" class="p-error">{{ errors.phoneNumber[0] }}</small>
      </div>

      <!-- Address -->
      <div class="field col-span-2">
        <label>Address</label>
        <InputText
          v-model="driver.address"
          placeholder="Address"
          class="w-full"
          :class="{ 'p-invalid': errors.address }"
        />
        <small v-if="errors.address" class="p-error">{{ errors.address[0] }}</small>
      </div>

      <!-- Date of Birth -->
      <div class="field">
        <label>Date of Birth *</label>
        <Calendar
          v-model="driver.dateOfBirth"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': errors.dateOfBirth }"
        />
        <small v-if="errors.dateOfBirth" class="p-error">{{ errors.dateOfBirth[0] }}</small>
      </div>

      <!-- Hire Date -->
      <div class="field">
        <label>Hire Date *</label>
        <Calendar
          v-model="driver.hireDate"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': errors.hireDate }"
        />
        <small v-if="errors.hireDate" class="p-error">{{ errors.hireDate[0] }}</small>
      </div>

      <!-- License Number -->
      <div class="field">
        <label>License Number</label>
        <InputText v-model="driver.licenseNumber" class="w-full" />
      </div>

      <!-- License Expiry -->
      <div class="field">
        <label>License Expiry</label>
        <Calendar v-model="driver.licenseExpiry" dateFormat="yy-mm-dd" showIcon class="w-full" />
      </div>

      <!-- Medical Certificate Number -->
      <div class="field">
        <label>Medical Certificate #</label>
        <InputText v-model="driver.medicalCertificateNumber" class="w-full" />
      </div>

      <!-- Medical Certificate Expiry -->
      <div class="field">
        <label>Medical Certificate Expiry</label>
        <Calendar v-model="driver.medicalCertificateExpiry" dateFormat="yy-mm-dd" showIcon class="w-full" />
      </div>

      <!-- Emergency Contact Name -->
      <div class="field">
        <label>Emergency Contact Name</label>
        <InputText v-model="driver.emergencyContactName" class="w-full" />
      </div>

      <!-- Emergency Contact Phone -->
      <div class="field">
        <label>Emergency Contact Phone</label>
        <InputMask v-model="driver.emergencyContactPhone" mask="(999) 999-9999" class="w-full" />
      </div>

      <!-- Notes -->
      <div class="field col-span-2">
        <label>Notes</label>
        <InputText v-model="driver.notes" class="w-full" />
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="onCancel" />
      <Button label="Save" icon="pi pi-check" class="p-button-primary" :disabled="saving" @click="onSave" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const props = defineProps({ 
  modelValue: Boolean,
  serverErrors: Object
});
const emit = defineEmits(['update:modelValue', 'save', 'cancel', 'update:serverErrors']);

const driver = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  address: '',
  dateOfBirth: null,
  hireDate: null,
  licenseNumber: '',
  licenseExpiry: null,
  medicalCertificateNumber: '',
  medicalCertificateExpiry: null,
  emergencyContactName: '',
  emergencyContactPhone: '',
  notes: ''
});

const errors = ref({});
const saving = ref(false);

// Watch for server errors and update local errors
watch(() => props.serverErrors, (newErrors) => {
  if (newErrors) {
    errors.value = { ...newErrors };
  }
});

// Reset form when dialog opens
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    driver.value = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: null,
      hireDate: null,
      licenseNumber: '',
      licenseExpiry: null,
      medicalCertificateNumber: '',
      medicalCertificateExpiry: null,
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: ''
    };
    errors.value = {};
    emit('update:serverErrors', null);
  }
});

const validateForm = () => {
  errors.value = {};

  if (!driver.value.firstName) errors.value.firstName = ['First name is required'];
  if (!driver.value.lastName) errors.value.lastName = ['Last name is required'];
  if (!driver.value.email) {
    errors.value.email = ['Email is required'];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.value.email)) {
    errors.value.email = ['Email is invalid'];
  }
  if (!driver.value.dateOfBirth) errors.value.dateOfBirth = ['Date of Birth is required'];
  if (!driver.value.hireDate) errors.value.hireDate = ['Hire Date is required'];

  return Object.keys(errors.value).length === 0;
};

const onSave = () => {
  if (validateForm()) {
    saving.value = true;
    emit('save', { ...driver.value });
  }
};

const onCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 500;
}

.field.col-span-2 {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .field.col-span-2 {
    grid-column: span 1;
  }
}
</style>
