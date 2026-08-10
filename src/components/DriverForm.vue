<template>
  <Dialog 
    :visible="modelValue" 
    @update:visible="$emit('update:modelValue', $event)"
    header="Add New Driver" 
    :modal="true"
    :style="{ width: '50vw' }"
  >
    <div class="form-grid">
      <div class="field">
      <label for="firstName">First Name *</label>
      <InputText 
        v-model="driver.firstName" 
        placeholder="First Name"
        class="w-full"
        :class="{ 'p-invalid': errors.firstName }"
      />
      <small v-if="errors.firstName" class="p-error">{{ errors.firstName[0] }}</small>
    </div>

      <div class="field">
      <label for="lastName">Last Name *</label>
      <InputText 
        v-model="driver.lastName" 
        placeholder="Last Name"
        class="w-full"
        :class="{ 'p-invalid': errors.lastName }"
      />
      <small v-if="errors.lastName" class="p-error">{{ errors.lastName[0] }}</small>
    </div>

      <div class="field">
        <label for="email">Email *</label>
        <InputText 
          v-model="driver.email" 
          placeholder="Email"
          class="w-full"
          :class="{ 'p-invalid': errors.email }"
        />
       <small v-if="errors.email" class="p-error">{{ errors.email[0] }}</small>

      </div>

      <div class="field">
        <label for="phone">Phone</label>
        <InputMask 
          v-model="driver.phoneNumber" 
          mask="(999) 999-9999" 
          placeholder="(123) 456-7890"
          class="w-full"
          :class="{ 'p-invalid': errors.phoneNumber }"
        />
       <small v-if="errors.phoneNumber" class="p-error">{{ errors.phoneNumber[0] }}</small>
      </div>

      <div class="field col-span-2">
        <label for="address">Address</label>
        <InputText 
          v-model="driver.address" 
          placeholder="Address"
          class="w-full"
          :class="{ 'p-invalid': errors.address }"
        />
       <small v-if="errors.address" class="p-error">{{ errors.address[0] }}</small>
      </div>

      <div class="field">
        <label for="dob">Date of Birth *</label>
        <Calendar 
          v-model="driver.dateOfBirth" 
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': errors.dateFormat }"
        />
       <small v-if="errors.dateFormat" class="p-error">{{ errors.dateFormat[0] }}</small>
      </div>

      <div class="field">
        <label for="hireDate">Hire Date *</label>
        <Calendar 
          v-model="driver.hireDate " 
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': errors.hireDate }"
        />
       <small v-if="errors.hireDate" class="p-error">{{ errors.hireDate[0] }}</small>
      </div>

      <div class="field">
        <label for="license">License Number</label>
        <InputText 
          v-model="driver.licenseNumber" 
          placeholder="License Number"
          class="w-full"
          :class="{ 'p-invalid': errors.licenseNumber }"
        />
       <small v-if="errors.licenseNumber" class="p-error">{{ errors.licenseNumber[0] }}</small>
      </div>

      <div class="field">
        <label for="licenseExpiry">License Expiry</label>
        <Calendar 
          v-model="driver.licenseExpiry" 
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': errors.licenseExpiry }"
        />
       <small v-if="errors.licenseExpiry" class="p-error">{{ errors.licenseExpiry[0] }}</small>
      </div>

      <div class="field">
        <label for="medicalCert">Medical Cert. #</label>
        <InputText 
          v-model="driver.medicalCertificateNumber" 
          placeholder="Certificate Number"
          class="w-full"
          :class="{ 'p-invalid': errors.medicalCertificateNumber }"
        />
       <small v-if="errors.medicalCertificateNumber" class="p-error">{{ errors.medicalCertificateNumber[0] }}</small>
      </div>

      <div class="field">
        <label for="medicalExpiry">Medical Cert. Expiry</label>
        <Calendar 
          v-model="driver.medicalCertificateExpiry" 
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': errors.medicalCertificateExpiry }"
        />
       <small v-if="errors.medicalCertificateExpiry" class="p-error">{{ errors.medicalCertificateExpiry[0] }}</small>
      </div>

      <div class="field">
        <label for="emergencyName">Emergency Contact</label>
        <InputText 
          v-model="driver.emergencyContactName" 
          placeholder="Contact Name"
          class="w-full"
          :class="{ 'p-invalid': errors.emergencyContactName }"
        />
       <small v-if="errors.emergencyContactName" class="p-error">{{ errors.emergencyContactName[0] }}</small>
      </div>

      <div class="field">
        <label for="emergencyPhone">Emergency Phone</label>
        <InputMask 
          v-model="driver.emergencyContactPhone" 
          mask="(999) 999-9999" 
          placeholder="(123) 456-7890"
          class="w-full"
          :class="{ 'p-invalid': errors.emergencyContactPhone }"
        />
       <small v-if="errors.emergencyContactPhone" class="p-error">{{ errors.emergencyContactPhone[0] }}</small>
      </div>

      <div class="field col-span-2">
        <label for="notes">Notes</label>
        <Textarea 
          v-model="driver.notes" 
          rows="3"
          class="w-full"
          :class="{ 'p-invalid': errors.notes }"
        />
       <small v-if="errors.notes" class="p-error">{{ errors.notes[0] }}</small>
      </div>
    </div>

    <template #footer>
      <Button 
        label="Cancel" 
        icon="pi pi-times" 
        @click="$emit('cancel')"
        class="p-button-text"
      />
      <Button 
        label="Save" 
        icon="pi pi-check" 
        @click="handleSave"
        class="p-button-primary"
        :disabled="!isFormValid"
      />
    </template>
  </Dialog>
</template>

<script setup>
defineProps({
  driver: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: Boolean
});


const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

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

const isFormValid = computed(() => {
  return (
    driver.value.firstName &&
    driver.value.lastName &&
    driver.value.email &&
    driver.value.dateOfBirth &&
    driver.value.hireDate
  );
});

const handleSave = () => {
  emit('save', driver.value);
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
