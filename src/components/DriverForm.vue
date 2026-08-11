<template>
  <Dialog
    :visible="modelValue"
    header="Add New Driver"
    :modal="true"
    :closable="!isLoading"
    :style="{ width: '50vw' }"
    :breakpoints="{ '960px': '75vw', '641px': '95vw' }"
    @update:visible="onDialogUpdate"
  >
    <div class="form-grid">
      <!-- First Name -->
      <div class="field">
        <label for="firstName">First Name *</label>
        <InputText
          id="firstName"
          v-model="formData.firstName"
          placeholder="First Name"
          class="w-full"
          :class="{ 'p-invalid': hasError('firstName') }"
          :disabled="isLoading"
          autocomplete="given-name"
          required
        />
        <small v-if="hasError('firstName')" class="p-error">
          {{ getError('firstName') }}
        </small>
      </div>

      <!-- Last Name -->
      <div class="field">
        <label for="lastName">Last Name *</label>
        <InputText
          id="lastName"
          v-model="formData.lastName"
          placeholder="Last Name"
          class="w-full"
          :class="{ 'p-invalid': hasError('lastName') }"
          :disabled="isLoading"
          autocomplete="family-name"
          required
        />
        <small v-if="hasError('lastName')" class="p-error">
          {{ getError('lastName') }}
        </small>
      </div>

      <!-- Email -->
      <div class="field">
        <label for="email">Email *</label>
        <InputText
          id="email"
          v-model="formData.email"
          type="email"
          placeholder="Email"
          class="w-full"
          :class="{ 'p-invalid': hasError('email') }"
          :disabled="isLoading"
          autocomplete="email"
          required
        />
        <small v-if="hasError('email')" class="p-error">
          {{ getError('email') }}
        </small>
      </div>

      <!-- Phone -->
      <div class="field">
        <label for="phoneNumber">Phone</label>
        <InputMask
          id="phoneNumber"
          v-model="formData.phoneNumber"
          mask="(999) 999-9999"
          placeholder="(123) 456-7890"
          class="w-full"
          :class="{ 'p-invalid': hasError('phoneNumber') }"
          :disabled="isLoading"
          autocomplete="tel"
        />
        <small v-if="hasError('phoneNumber')" class="p-error">
          {{ getError('phoneNumber') }}
        </small>
      </div>

      <!-- Address -->
      <div class="field col-span-2">
        <label for="address">Address</label>
        <InputText
          id="address"
          v-model="formData.address"
          placeholder="Address"
          class="w-full"
          :class="{ 'p-invalid': hasError('address') }"
          :disabled="isLoading"
          autocomplete="street-address"
        />
        <small v-if="hasError('address')" class="p-error">
          {{ getError('address') }}
        </small>
      </div>

      <!-- Date of Birth -->
      <div class="field">
        <label for="dateOfBirth">Date of Birth *</label>
        <Calendar
          id="dateOfBirth"
          v-model="formData.dateOfBirth"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': hasError('dateOfBirth') }"
          :disabled="isLoading"
          :maxDate="today"
          required
        />
        <small v-if="hasError('dateOfBirth')" class="p-error">
          {{ getError('dateOfBirth') }}
        </small>
      </div>

      <!-- Hire Date -->
      <div class="field">
        <label for="hireDate">Hire Date *</label>
        <Calendar
          id="hireDate"
          v-model="formData.hireDate"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': hasError('hireDate') }"
          :disabled="isLoading"
          required
        />
        <small v-if="hasError('hireDate')" class="p-error">
          {{ getError('hireDate') }}
        </small>
      </div>

      <!-- License Number -->
      <div class="field">
        <label for="licenseNumber">License Number</label>
        <InputText
          id="licenseNumber"
          v-model="formData.licenseNumber"
          placeholder="License Number"
          class="w-full"
          :class="{ 'p-invalid': hasError('licenseNumber') }"
          :disabled="isLoading"
        />
        <small v-if="hasError('licenseNumber')" class="p-error">
          {{ getError('licenseNumber') }}
        </small>
      </div>

      <!-- License Expiry -->
      <div class="field">
        <label for="licenseExpiry">License Expiry</label>
        <Calendar
          id="licenseExpiry"
          v-model="formData.licenseExpiry"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': hasError('licenseExpiry') }"
          :disabled="isLoading"
        />
        <small v-if="hasError('licenseExpiry')" class="p-error">
          {{ getError('licenseExpiry') }}
        </small>
      </div>

      <!-- Medical Certificate Number -->
      <div class="field">
        <label for="medicalCertificateNumber">
          Medical Cert. #
        </label>
        <InputText
          id="medicalCertificateNumber"
          v-model="formData.medicalCertificateNumber"
          placeholder="Certificate Number"
          class="w-full"
          :class="{ 'p-invalid': hasError('medicalCertificateNumber') }"
          :disabled="isLoading"
        />
        <small v-if="hasError('medicalCertificateNumber')" class="p-error">
          {{ getError('medicalCertificateNumber') }}
        </small>
      </div>

      <!-- Medical Certificate Expiry -->
      <div class="field">
        <label for="medicalCertificateExpiry">
          Medical Cert. Expiry
        </label>
        <Calendar
          id="medicalCertificateExpiry"
          v-model="formData.medicalCertificateExpiry"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': hasError('medicalCertificateExpiry') }"
          :disabled="isLoading"
        />
        <small v-if="hasError('medicalCertificateExpiry')" class="p-error">
          {{ getError('medicalCertificateExpiry') }}
        </small>
      </div>

      <!-- Emergency Contact -->
      <div class="field">
        <label for="emergencyContactName">
          Emergency Contact
        </label>
        <InputText
          id="emergencyContactName"
          v-model="formData.emergencyContactName"
          placeholder="Contact Name"
          class="w-full"
          :class="{ 'p-invalid': hasError('emergencyContactName') }"
          :disabled="isLoading"
          autocomplete="name"
        />
        <small v-if="hasError('emergencyContactName')" class="p-error">
          {{ getError('emergencyContactName') }}
        </small>
      </div>

      <!-- Emergency Phone -->
      <div class="field">
        <label for="emergencyContactPhone">
          Emergency Phone
        </label>
        <InputMask
          id="emergencyContactPhone"
          v-model="formData.emergencyContactPhone"
          mask="(999) 999-9999"
          placeholder="(123) 456-7890"
          class="w-full"
          :class="{ 'p-invalid': hasError('emergencyContactPhone') }"
          :disabled="isLoading"
          autocomplete="tel"
        />
        <small v-if="hasError('emergencyContactPhone')" class="p-error">
          {{ getError('emergencyContactPhone') }}
        </small>
      </div>

      <!-- Notes -->
      <div class="field col-span-2">
        <label for="notes">Notes</label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          rows="3"
          placeholder="Additional notes"
          class="w-full"
          :class="{ 'p-invalid': hasError('notes') }"
          :disabled="isLoading"
        />
        <small v-if="hasError('notes')" class="p-error">
          {{ getError('notes') }}
        </small>
      </div>
    </div>

    <!-- Dialog Footer -->
    <template #footer>
      <Button
        type="button"
        label="Cancel"
        icon="pi pi-times"
        severity="secondary"
        text
        @click="handleCancel"
        :disabled="isLoading"
      />
      <Button
        type="button"
        label="Save"
        icon="pi pi-check"
        @click="handleSave"
        :loading="isLoading"
        :disabled="!isFormValid || isLoading"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface DriverForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: Date | null;
  hireDate: Date | null;
  licenseNumber: string;
  licenseExpiry: Date | null;
  medicalCertificateNumber: string;
  medicalCertificateExpiry: Date | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
}

type ValidationErrors = Record<string, string[]>;

const props = defineProps<{
  modelValue: boolean;
  driver: DriverForm;
  errors?: ValidationErrors;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:driver': [driver: DriverForm];
  save: [driver: DriverForm];
  cancel: [];
}>();

// Create a local reactive copy of the driver data
const formData = ref<DriverForm>({ ...props.driver });

const today = ref(new Date());
const isLoading = computed(() => props.isLoading ?? false);

// Watch for changes to the driver prop and update the local copy
watch(
  () => props.driver,
  (newDriver) => {
    formData.value = { ...newDriver };
  },
  { deep: true }
);

// Watch for dialog visibility changes to reset form when opened
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      formData.value = { ...props.driver };
    }
  }
);

// Emit updates to the parent whenever form data changes
watch(
  formData,
  (newData) => {
    emit('update:driver', newData);
  },
  { deep: true }
);

const isFormValid = computed(() => {
  return Boolean(
    formData.value.firstName?.trim() &&
    formData.value.lastName?.trim() &&
    formData.value.email?.trim() &&
    formData.value.dateOfBirth &&
    formData.value.hireDate
  );
});

const hasError = (field: string): boolean => {
  return Boolean(
    props.errors?.[field] && 
    props.errors[field].length > 0
  );
};

const getError = (field: string): string => {
  return props.errors?.[field]?.[0] ?? '';
};

const onDialogUpdate = (value: boolean): void => {
  emit('update:modelValue', value);
  if (!value) {
    // Reset form when dialog closes
    formData.value = { ...props.driver };
  }
};

const handleCancel = (): void => {
  if (isLoading.value) {
    return;
  }
  emit('cancel');
  emit('update:modelValue', false);
};

const handleSave = (): void => {
  if (!isFormValid.value || isLoading.value) {
    return;
  }
  emit('save', formData.value);
};
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.field label {
  font-weight: 500;
}

.field.col-span-2 {
  grid-column: span 2;
}

.w-full {
  width: 100%;
}

.p-error {
  display: block;
  margin-top: 0.25rem;
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