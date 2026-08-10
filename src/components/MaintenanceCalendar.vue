<template>
  <div class="maintenance-calendar">
    <Calendar 
      v-model="selectedDate" 
      :inline="true"
      :showWeek="true"
      @date-select="onDateSelect"
    >
      <template #date="slotProps">
        <div 
          class="calendar-date"
          :class="{ 'has-events': getEventsForDate(slotProps.date).length > 0 }"
          @click="slotProps.onClick"
        >
          <span class="day-number">{{ slotProps.date.day }}</span>
          <div v-if="getEventsForDate(slotProps.date).length > 0" class="event-markers">
            <div 
              v-for="(event, index) in getEventsForDate(slotProps.date)" 
              :key="index" 
              class="event-marker" 
              :style="{ backgroundColor: event.color }"
              :title="event.title"
              @click.stop="onEventClick(event)"
            ></div>
          </div>
        </div>
      </template>
    </Calendar>

    <!-- Event Details Dialog -->
    <Dialog 
      v-model:visible="eventDialogVisible" 
      header="Maintenance Details" 
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div v-if="selectedEvent" class="event-details">
        <div class="detail-row">
          <label>Vehicle:</label>
          <span>{{ selectedEvent.vehiclePlate || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <label>Service Type:</label>
          <span>{{ selectedEvent.serviceType || 'N/A' }}</span>
        </div>
        <div class="detail-row">
          <label>Date:</label>
          <span>{{ formatDate(selectedEvent.start) }}</span>
        </div>
        <div class="detail-row">
          <label>Status:</label>
          <Tag 
            :severity="getDueDateSeverity(selectedEvent.start)" 
            :value="getDueDateStatus(selectedEvent.start)"
          />
        </div>
        <div class="detail-row" v-if="selectedEvent.originalData?.notes">
          <label>Notes:</label>
          <span>{{ selectedEvent.originalData.notes }}</span>
        </div>
        <div class="detail-row" v-if="selectedEvent.originalData?.estimatedCost">
          <label>Est. Cost:</label>
          <span>R{{ selectedEvent.originalData.estimatedCost.toFixed(2) }}</span>
        </div>
      </div>
      <template #footer>
        <Button 
          label="View Full Details" 
          icon="pi pi-eye"
          class="p-button-text"
          @click="viewDetails"
        />
        <Button 
          label="Close" 
          icon="pi pi-times"
          class="p-button-text"
          @click="eventDialogVisible = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

// Props
const props = defineProps({
  maintenanceRecords: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['dateSelected', 'eventSelected', 'viewDetails'])

// State
const selectedDate = ref(new Date())
const eventDialogVisible = ref(false)
const selectedEvent = ref(null)

// Computed: formatted events for the calendar
const formattedEvents = computed(() => {
  return props.maintenanceRecords.map(record => {
    const eventDate = new Date(record.scheduledDate)
    // Ensure date is valid
    if (isNaN(eventDate.getTime())) return null
    return {
      id: record.id,
      title: `${record.vehicle?.plateNumber || 'No Vehicle'} - ${record.serviceType || 'Service'}`,
      start: eventDate,
      end: eventDate,
      allDay: true,
      color: getDueDateSeverity(record.scheduledDate) === 'danger' ? '#ef4444' : 
             getDueDateSeverity(record.scheduledDate) === 'warning' ? '#f59e0b' : '#6366f1',
      serviceType: record.serviceType,
      vehiclePlate: record.vehicle?.plateNumber,
      originalData: record
    }
  }).filter(event => event !== null) // Remove invalid entries
})

// Map events by date (for quick lookup in the day slot)
const eventsByDate = computed(() => {
  const map = new Map()
  formattedEvents.value.forEach(event => {
    const dateKey = event.start.toDateString()
    if (!map.has(dateKey)) {
      map.set(dateKey, [])
    }
    map.get(dateKey).push(event)
  })
  return map
})

// Helper to get events for a specific date object from the calendar slot
const getEventsForDate = (dateObj) => {
  // The dateObj from the slot has properties: day, month, year, today, etc.
  // Construct a proper Date object from year, month, day
  const date = new Date(dateObj.year, dateObj.month, dateObj.day)
  const dateKey = date.toDateString()
  return eventsByDate.value.get(dateKey) || []
}

// Event handlers
const onDateSelect = (date) => {
  emit('dateSelected', date)
}

const onEventClick = (event) => {
  selectedEvent.value = event
  eventDialogVisible.value = true
  emit('eventSelected', event)
}

const viewDetails = () => {
  if (selectedEvent.value) {
    emit('viewDetails', selectedEvent.value.originalData)
    eventDialogVisible.value = false
  }
}

// Helper functions
const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getDueDateSeverity = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'danger'
  if (diffDays <= 3) return 'warning'
  return 'success'
}

const getDueDateStatus = (date) => {
  const today = new Date()
  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Due Today'
  if (diffDays <= 7) return `Due in ${diffDays} days`
  return 'Scheduled'
}
</script>

<style scoped>
.maintenance-calendar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-calendar .p-datepicker) {
  width: 100%;
  border: none;
}

:deep(.p-datepicker table td) {
  padding: 0.2rem;
}

:deep(.p-datepicker table td .p-datepicker-day) {
  width: 100%;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

:deep(.p-datepicker table td .p-datepicker-day:hover) {
  background-color: #f0f0f0;
}

:deep(.p-datepicker table td .p-datepicker-day.p-highlight) {
  background-color: #e3f2fd;
}

.calendar-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

.day-number {
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.2;
}

.event-markers {
  display: flex;
  gap: 3px;
  margin-top: 2px;
  flex-wrap: wrap;
  justify-content: center;
}

.event-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.5);
  cursor: pointer;
  transition: transform 0.15s;
}

.event-marker:hover {
  transform: scale(1.3);
}

.has-events .day-number {
  font-weight: 600;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-row label {
  font-weight: 600;
  min-width: 100px;
  color: #495057;
}

.detail-row span {
  color: #212529;
}

/* Dark mode support */
.dark .maintenance-calendar {
  background: #252836;
}

.dark .detail-row label {
  color: #e4e6eb;
}

.dark .detail-row span {
  color: #f8f9fa;
}

:deep(.dark .p-datepicker table td .p-datepicker-day:hover) {
  background-color: #2a2d3a;
}

:deep(.dark .p-datepicker table td .p-datepicker-day.p-highlight) {
  background-color: #1a2530;
}
</style>