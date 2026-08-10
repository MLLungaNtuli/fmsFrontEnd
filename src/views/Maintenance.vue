<template>
  <div :class="['dashboard-layout', { dark: isDarkMode }]">
    <!-- Loading Overlay -->
    <div v-if="initialLoad" class="loading-indicator">
      <ProgressSpinner />
    </div>

    <!-- ✅ New AppHeader -->
    <AppHeader
      :is-dark-mode="isDarkMode"
      @toggle-sidebar="toggleSidebar"
      @update:is-dark-mode="isDarkMode = $event"
    />

    <!-- ✅ New Sidebar -->
    <Sidebar
      :is-open="isSidebarOpen"
      :is-dark-mode="isDarkMode"
      @close="isSidebarOpen = false"
    />

    <!-- Global Loader Overlay -->
    <div v-if="globalLoading" class="global-loader-overlay">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <!-- Main Content -->
    <div class="layout-wrapper">
      <div
        class="main-content"
        :class="{
          'sidebar-collapsed': !isSidebarOpen,
        }"
      >
        <div class="content-container">
          <!-- Maintenance Dashboard Header -->
          <div class="dashboard-header">
            <div class="header-content">
              <h1><i class="pi pi-wrench"></i> Maintenance Management</h1>
              <p class="subtitle">South African Fleet Maintenance Tracking & Analytics</p>
            </div>
            <div class="header-actions">
              <Button
                label="Schedule Service"
                icon="pi pi-plus"
                class="p-button-primary"
                @click="showAddDialog"
              />
              <Button
                icon="pi pi-filter"
                class="p-button-text"
                @click="toggleFilterPanel"
                v-tooltip="'Filter records'"
              />
              <Button
                icon="pi pi-download"
                class="p-button-text"
                @click="exportMaintenanceData"
                v-tooltip="'Export data'"
              />
            </div>
          </div>

          <!-- Real-time Maintenance Stats -->
          <div class="maintenance-stats-grid">
            <Card class="stat-card urgent">
              <template #title>
                <div class="stat-header">
                  <i class="pi pi-exclamation-triangle"></i>
                  Urgent Alerts
                </div>
              </template>
              <template #content>
                <div class="stat-content">
                  <div class="stat-value">{{ urgentAlertsCount }}</div>
                  <div class="stat-label">Require Immediate Attention</div>
                  <div class="stat-trend negative">
                    <i class="pi pi-arrow-up"></i>
                    {{ overdueServices }} overdue
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card scheduled">
              <template #title>
                <div class="stat-header">
                  <i class="pi pi-calendar"></i>
                  Scheduled Services
                </div>
              </template>
              <template #content>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.upcomingServices }}</div>
                  <div class="stat-label">Upcoming Maintenance</div>
                  <div class="stat-trend">
                    <i class="pi pi-info-circle"></i>
                    {{ stats.dueThisWeek }} due this week
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card cost">
              <template #title>
                <div class="stat-header">
                  <i class="pi pi-chart-line"></i>
                  Maintenance Cost
                </div>
              </template>
              <template #content>
                <div class="stat-content">
                  <div class="stat-value">R{{ formatCurrency(stats.monthlyCost) }}</div>
                  <div class="stat-label">This Month</div>
                  <div
                    class="stat-trend"
                    :class="stats.costChangeDirection"
                  >
                    <i
                      :class="
                        stats.costChangeDirection === 'positive'
                          ? 'pi pi-arrow-down'
                          : 'pi pi-arrow-up'
                      "
                    ></i>
                    {{ Math.abs(stats.costChangePercent) }}% vs last month
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card warranty">
              <template #title>
                <div class="stat-header">
                  <i class="pi pi-shield"></i>
                  Warranties
                </div>
              </template>
              <template #content>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.activeWarranties }}</div>
                  <div class="stat-label">Active Warranties</div>
                  <div class="stat-trend warning">
                    <i class="pi pi-clock"></i>
                    {{ stats.expiringSoon }} expiring soon
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- South African Service Providers Map -->
          <div class="service-providers-section">
            <Card>
              <template #title>
                <div class="section-title">
                  <i class="pi pi-map-marker"></i>
                  Authorized Service Providers - South Africa
                </div>
              </template>
              <template #content>
                <div class="providers-map-container">
                  <div
                    id="providers-map"
                    style="height: 400px; border-radius: 8px; width: 100%"
                  ></div>
                  <div class="providers-legend">
                    <div class="legend-item">
                      <span class="legend-color toyota"></span>
                      <span>Toyota Service Centers</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-color isuzu"></span>
                      <span>Isuzu Trucks</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-color mercedes"></span>
                      <span>Mercedes-Benz Trucks</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-color independent"></span>
                      <span>Independent Garages</span>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Maintenance Tabs -->
          <div class="tabs-container">
            <TabView>
              <!-- Scheduled Maintenance Tab -->
              <TabPanel header="Scheduled Maintenance">
                <div class="tab-header">
                  <h3>Upcoming Services</h3>
                  <Button
                    label="Generate Service Schedule"
                    icon="pi pi-calendar-plus"
                    class="p-button-outlined"
                    @click="generateServiceSchedule"
                  />
                </div>
                <DataTable
                  :value="scheduledMaintenance"
                  :paginator="true"
                  :rows="scheduledPageSize"
                  :totalRecords="scheduledTotalRecords"
                  :loading="loadingScheduled"
                  @page="onScheduledPageChange"
                  stripedRows
                  responsiveLayout="scroll"
                  class="maintenance-table"
                >
                  <Column field="vehicle.plateNumber" header="Vehicle" :sortable="true">
                    <template #body="{ data }">
                      <div class="vehicle-info">
                        <i class="pi pi-truck"></i>
                        {{ data.vehicle?.plateNumber }}
                        <Tag
                          v-if="data.vehicle?.model"
                          :value="data.vehicle.model"
                          class="vehicle-model-tag"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column field="serviceType" header="Service Type" :sortable="true">
                    <template #body="{ data }">
                      <div class="service-type">
                        <i :class="getServiceTypeIcon(data.serviceType)"></i>
                        {{ data.serviceType }}
                      </div>
                    </template>
                  </Column>
                  <Column field="scheduledDate" header="Due Date" :sortable="true">
                    <template #body="{ data }">
                      <div class="due-date">
                        {{ formatDate(data.scheduledDate) }}
                        <Tag
                          :severity="getDueDateSeverity(data.scheduledDate)"
                          :value="getDueDateStatus(data.scheduledDate)"
                          class="ml-2"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column field="estimatedCost" header="Est. Cost" :sortable="true">
                    <template #body="{ data }">
                      <div class="cost-estimate">
                        R{{ data.estimatedCost?.toFixed(2) || '0.00' }}
                        <small class="cost-note">excl. VAT</small>
                      </div>
                    </template>
                  </Column>
                  <Column header="Service Provider">
                    <template #body="{ data }">
                      <div class="service-provider">
                        {{
                          data.recommendedProvider ||
                          getRecommendedProvider(data.vehicle, data.serviceType)
                        }}
                      </div>
                    </template>
                  </Column>
                  <Column header="Actions" style="min-width: 150px">
                    <template #body="{ data }">
                      <div class="action-buttons">
                        <Button
                          icon="pi pi-check"
                          class="p-button-rounded p-button-success p-button-text"
                          @click="completeService(data)"
                          v-tooltip="'Mark as completed'"
                        />
                        <Button
                          icon="pi pi-pencil"
                          class="p-button-rounded p-button-text"
                          @click="editService(data)"
                          v-tooltip="'Edit service'"
                        />
                        <Button
                          icon="pi pi-map-marker"
                          class="p-button-rounded p-button-info p-button-text"
                          @click="showProviderLocation(data)"
                          v-tooltip="'Find service provider'"
                        />
                      </div>
                    </template>
                  </Column>
                </DataTable>
                <ProgressSpinner
                  v-if="loadingScheduled && !initialLoad"
                  class="table-spinner"
                />
              </TabPanel>

              <!-- Service History Tab -->
              <TabPanel header="Service History">
                <div class="tab-header">
                  <h3>Completed Services</h3>
                  <div class="history-filters">
                    <Dropdown
                      v-model="historyFilter.vehicle"
                      :options="vehicles"
                      optionLabel="plateNumber"
                      placeholder="Filter by Vehicle"
                      class="filter-dropdown"
                    />
                    <Dropdown
                      v-model="historyFilter.serviceType"
                      :options="serviceTypes"
                      placeholder="Service Type"
                      class="filter-dropdown"
                    />
                  </div>
                </div>
                <DataTable
                  :value="filteredServiceHistory"
                  :paginator="true"
                  :rows="historyPageSize"
                  :totalRecords="historyTotalRecords"
                  :loading="loadingHistory"
                  @page="onHistoryPageChange"
                  stripedRows
                  responsiveLayout="scroll"
                  class="maintenance-table"
                >
                  <Column field="vehicle.plateNumber" header="Vehicle" :sortable="true"></Column>
                  <Column field="serviceType" header="Service Type" :sortable="true"></Column>
                  <Column field="completedDate" header="Completed On" :sortable="true">
                    <template #body="{ data }">
                      {{ formatDate(data.completedDate) }}
                    </template>
                  </Column>
                  <Column field="actualCost" header="Actual Cost" :sortable="true">
                    <template #body="{ data }">
                      <div class="actual-cost">
                        <span
                          :class="{
                            'cost-over-budget': data.actualCost > data.estimatedCost,
                          }"
                        >
                          R{{ data.actualCost?.toFixed(2) || '0.00' }}
                        </span>
                        <div
                          v-if="data.actualCost && data.estimatedCost"
                          class="cost-variance"
                        >
                          <Tag
                            :severity="
                              data.actualCost > data.estimatedCost ? 'danger' : 'success'
                            "
                            :value="
                              `${(
                                ((data.actualCost - data.estimatedCost) /
                                  data.estimatedCost) *
                                100
                              ).toFixed(1)}%`
                            "
                          />
                        </div>
                      </div>
                    </template>
                  </Column>
                  <Column field="serviceProvider" header="Provider" :sortable="true"></Column>
                  <Column header="Warranty Claim">
                    <template #body="{ data }">
                      <Button
                        v-if="isUnderWarranty(data)"
                        label="Claim"
                        icon="pi pi-shield"
                        class="p-button-rounded p-button-warning p-button-sm"
                        @click="initiateWarrantyClaim(data)"
                      />
                      <span v-else class="text-muted">Not eligible</span>
                    </template>
                  </Column>
                  <Column header="Receipt">
                    <template #body="{ data }">
                      <Button
                        v-if="data.receiptUrl"
                        icon="pi pi-download"
                        class="p-button-rounded p-button-text"
                        @click="downloadReceipt(data)"
                        v-tooltip="'Download receipt'"
                      />
                      <span v-else class="text-muted">No receipt</span>
                    </template>
                  </Column>
                </DataTable>
                <ProgressSpinner
                  v-if="loadingHistory && !initialLoad"
                  class="table-spinner"
                />
              </TabPanel>

              <!-- Warranty Tracking Tab -->
              <TabPanel header="Warranty Tracking">
                <div class="tab-header">
                  <h3>Vehicle Warranties</h3>
                  <Button
                    label="Add Warranty"
                    icon="pi pi-plus"
                    class="p-button-outlined"
                    @click="showAddWarrantyDialog"
                  />
                </div>
                <DataTable
                  :value="warranties"
                  :paginator="true"
                  :rows="warrantiesPageSize"
                  :totalRecords="warrantiesTotalRecords"
                  :loading="loadingWarranties"
                  @page="onWarrantiesPageChange"
                  stripedRows
                  responsiveLayout="scroll"
                  class="maintenance-table"
                >
                  <Column field="vehicle.plateNumber" header="Vehicle" :sortable="true">
                    <template #body="{ data }">
                      <div class="vehicle-warranty-info">
                        <i class="pi pi-truck"></i>
                        {{ data.vehicle?.plateNumber }}
                        <div class="warranty-vehicle-model">{{ data.vehicle?.model }}</div>
                      </div>
                    </template>
                  </Column>
                  <Column field="warrantyType" header="Warranty Type" :sortable="true">
                    <template #body="{ data }">
                      <Tag
                        :value="data.warrantyType"
                        :severity="getWarrantyTypeSeverity(data.warrantyType)"
                      />
                    </template>
                  </Column>
                  <Column field="startDate" header="Start Date" :sortable="true">
                    <template #body="{ data }">
                      {{ formatDate(data.startDate) }}
                    </template>
                  </Column>
                  <Column field="endDate" header="End Date" :sortable="true">
                    <template #body="{ data }">
                      <div class="warranty-end-date">
                        {{ formatDate(data.endDate) }}
                        <Tag
                          :severity="getWarrantySeverity(data.endDate)"
                          :value="getWarrantyStatus(data.endDate)"
                          class="ml-2"
                        />
                      </div>
                    </template>
                  </Column>
                  <Column field="provider" header="Provider" :sortable="true"></Column>
                  <Column header="Coverage">
                    <template #body="{ data }">
                      <Button
                        icon="pi pi-eye"
                        class="p-button-rounded p-button-text"
                        @click="showCoverageDetails(data)"
                        v-tooltip="'View coverage details'"
                      />
                    </template>
                  </Column>
                  <Column header="Claims">
                    <template #body="{ data }">
                      <div class="warranty-claims">
                        <Chip :label="getWarrantyClaimsCount(data).toString()" />
                      </div>
                    </template>
                  </Column>
                </DataTable>
                <ProgressSpinner
                  v-if="loadingWarranties && !initialLoad"
                  class="table-spinner"
                />
              </TabPanel>

              <!-- Maintenance Analytics Tab -->
              <TabPanel header="Analytics">
                <div class="analytics-container">
                  <div class="analytics-row">
                    <Card class="analytics-card">
                      <template #title>Maintenance Cost Trend</template>
                      <template #content>
                        <div class="chart-container">
                          <div class="chart-placeholder">
                            <i
                              class="pi pi-chart-line"
                              style="font-size: 3rem; color: #6366f1"
                            ></i>
                            <p>Maintenance Cost Chart</p>
                            <small>Chart component would display cost trends over time</small>
                            <div class="mt-3">
                              <Button
                                label="Load Cost Data"
                                icon="pi pi-chart-line"
                                class="p-button-outlined"
                                @click="fetchCostAnalytics"
                              />
                            </div>
                          </div>
                        </div>
                      </template>
                    </Card>
                    <Card class="analytics-card">
                      <template #title>Service Type Distribution</template>
                      <template #content>
                        <div class="chart-container">
                          <div class="chart-placeholder">
                            <i
                              class="pi pi-chart-pie"
                              style="font-size: 3rem; color: #10b981"
                            ></i>
                            <p>Service Type Distribution</p>
                            <small>Chart component would show service type breakdown</small>
                            <div class="mt-3">
                              <Button
                                label="Load Distribution Data"
                                icon="pi pi-chart-pie"
                                class="p-button-outlined"
                                @click="fetchServiceDistribution"
                              />
                            </div>
                          </div>
                        </div>
                      </template>
                    </Card>
                  </div>
                  <div class="analytics-row">
                    <Card class="analytics-card">
                      <template #title>Vehicle Maintenance History</template>
                      <template #content>
                        <DataTable :value="vehicleMaintenanceSummary" stripedRows>
                          <Column field="vehicle" header="Vehicle"></Column>
                          <Column field="totalServices" header="Total Services"></Column>
                          <Column field="totalCost" header="Total Cost">
                            <template #body="{ data }">
                              R{{ data.totalCost?.toFixed(2) || '0.00' }}
                            </template>
                          </Column>
                          <Column field="avgCostPerService" header="Avg Cost/Service">
                            <template #body="{ data }">
                              R{{ data.avgCostPerService?.toFixed(2) || '0.00' }}
                            </template>
                          </Column>
                        </DataTable>
                      </template>
                    </Card>
                  </div>
                </div>
              </TabPanel>
            </TabView>
          </div>

          <!-- Calendar View -->
          <div class="calendar-section">
            <h3>Maintenance Calendar</h3>
            <MaintenanceCalendar
              :maintenance-records="scheduledMaintenance"
              @dateSelected="handleDateSelected"
              @eventSelected="handleEventSelected"
              @viewDetails="viewAlertDetails"
            />
          </div>

          <!-- Urgent Maintenance Alerts -->
          <div v-if="urgentAlerts.length > 0" class="urgent-alerts-section">
            <Card class="urgent-alerts-card">
              <template #title>
                <div class="alerts-title">
                  <i class="pi pi-exclamation-triangle"></i>
                  Urgent Maintenance Alerts
                </div>
              </template>
              <template #content>
                <div class="alerts-list">
                  <div
                    v-for="alert in urgentAlerts"
                    :key="alert.id"
                    class="alert-item"
                  >
                    <div class="alert-icon">
                      <i class="pi pi-clock"></i>
                    </div>
                    <div class="alert-content">
                      <div class="alert-title">
                        {{ alert.vehicle?.plateNumber }} - {{ alert.serviceType }}
                      </div>
                      <div class="alert-message">
                        Scheduled for {{ formatDate(alert.scheduledDate) }}
                      </div>
                      <div class="alert-severity">
                        <Tag
                          :severity="getDueDateSeverity(alert.scheduledDate)"
                          :value="getDueDateStatus(alert.scheduledDate)"
                        />
                      </div>
                    </div>
                    <div class="alert-actions">
                      <Button
                        label="Reschedule"
                        icon="pi pi-calendar"
                        class="p-button-warning p-button-sm"
                        @click="rescheduleService(alert)"
                      />
                      <Button
                        label="Complete"
                        icon="pi pi-check"
                        class="p-button-success p-button-sm"
                        @click="completeService(alert)"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Maintenance Alert Banner -->
          <div v-if="urgentAlerts.length > 0" class="alert-banner p-mb-4">
            <div class="alert-content">
              <i class="pi pi-exclamation-triangle alert-icon"></i>
              <div class="alert-message">
                <strong>Urgent Maintenance Alerts:</strong>
                {{ urgentAlerts.length }} item(s) require immediate attention
              </div>
              <Button
                label="View All"
                class="p-button-text alert-button"
                @click="showAlertDetails"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Maintenance Dialog -->
    <Dialog
      v-model:visible="displayAddDialog"
      header="Schedule Maintenance Service"
      :modal="true"
      :style="{ width: '600px' }"
      @hide="closeDialog"
    >
      <div class="maintenance-form">
        <div class="form-grid">
          <div class="field">
            <label for="vehicle">Vehicle *</label>
            <Dropdown
              v-model="newMaintenance.vehicleId"
              :options="vehicles"
              optionLabel="plateNumber"
              optionValue="id"
              placeholder="Select Vehicle"
              class="w-full"
              :class="{ 'p-invalid': !newMaintenance.vehicleId }"
            />
            <small class="p-error" v-if="!newMaintenance.vehicleId"
              >Vehicle is required</small
            >
          </div>

          <div class="field">
            <label for="serviceType">Service Type *</label>
            <Dropdown
              v-model="newMaintenance.serviceType"
              :options="southAfricanServiceTypes"
              placeholder="Select Service Type"
              class="w-full"
              :class="{ 'p-invalid': !newMaintenance.serviceType }"
            />
            <small class="p-error" v-if="!newMaintenance.serviceType"
              >Service type is required</small
            >
          </div>

          <div class="field">
            <label for="scheduledDate">Scheduled Date *</label>
            <Calendar
              v-model="newMaintenance.scheduledDate"
              :minDate="new Date()"
              dateFormat="yy-mm-dd"
              showIcon
              class="w-full"
              :class="{ 'p-invalid': !newMaintenance.scheduledDate }"
            />
            <small class="p-error" v-if="!newMaintenance.scheduledDate"
              >Scheduled date is required</small
            >
          </div>

          <div class="field">
            <label for="estimatedCost">Estimated Cost (ZAR) *</label>
            <InputNumber
              v-model="newMaintenance.estimatedCost"
              mode="currency"
              currency="ZAR"
              locale="en-ZA"
              class="w-full"
              :class="{
                'p-invalid':
                  !newMaintenance.estimatedCost ||
                  newMaintenance.estimatedCost <= 0,
              }"
            />
            <small
              class="p-error"
              v-if="
                !newMaintenance.estimatedCost || newMaintenance.estimatedCost <= 0
              "
            >
              Estimated cost is required and must be greater than 0
            </small>
          </div>

          <div class="field col-span-2">
            <label for="serviceProvider">Recommended Service Provider</label>
            <small class="p-text-secondary"
              >Available providers: {{ southAfricanServiceProviders.length }}</small
            >
            <Dropdown
              v-model="newMaintenance.serviceProviderId"
              :options="southAfricanServiceProviders"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Service Provider"
              class="w-full"
            />
            <small class="p-text-secondary"
              >Choose from authorized South African service providers</small
            >
          </div>

          <div class="field col-span-2">
            <label for="notes">Service Notes</label>
            <Textarea
              v-model="newMaintenance.notes"
              rows="3"
              class="w-full"
              placeholder="Add any specific instructions or notes for this service..."
            />
          </div>
        </div>

        <div class="form-actions">
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="closeDialog"
            class="p-button-text"
          />
          <Button
            label="Schedule Service"
            icon="pi pi-check"
            @click="saveMaintenance"
            class="p-button-primary"
            :loading="saving"
            :disabled="!isFormValid"
          />
        </div>
      </div>
    </Dialog>

    <!-- Service Provider Locations Dialog -->
    <Dialog
      v-model:visible="showProvidersMap"
      header="Service Provider Locations"
      :modal="true"
      :style="{ width: '800px' }"
    >
      <div class="providers-map-dialog">
        <div
          class="map-placeholder"
          style="
            height: 400px;
            border-radius: 8px;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          "
        >
          <i class="pi pi-map" style="font-size: 3rem; color: #6366f1"></i>
          <p>Service Providers Map</p>
          <small
            >Interactive map would show service provider locations across South
            Africa</small
          >
          <div class="mt-3">
            <Button
              label="View All Providers"
              icon="pi pi-list"
              class="p-button-outlined"
              @click="fetchServiceProviders"
            />
          </div>
        </div>
        <div class="providers-list">
          <h4>Authorized Service Providers</h4>
          <DataTable
            :value="southAfricanServiceProviders"
            selectionMode="single"
            @rowSelect="selectProvider"
          >
            <Column field="name" header="Name"></Column>
            <Column field="type" header="Type">
              <template #body="{ data }">
                <Tag :value="data.type" :severity="getProviderTypeSeverity(data.type)" />
              </template>
            </Column>
            <Column field="specialization" header="Specialization"></Column>
            <Column header="Actions">
              <template #body="{ data }">
                <Button
                  icon="pi pi-map-marker"
                  class="p-button-rounded p-button-text"
                  @click="viewProviderOnMap(data)"
                  v-tooltip="'View on map'"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </Dialog>

    <!-- Coverage Details Dialog -->
    <Dialog
      v-model:visible="showCoverageDialog"
      header="Warranty Coverage Details"
      :modal="true"
      :style="{ width: '700px' }"
    >
      <div class="coverage-details" v-if="selectedWarranty">
        <div class="coverage-header">
          <h4>
            {{ selectedWarranty.vehicle?.plateNumber }} -
            {{ selectedWarranty.warrantyType }} Warranty
          </h4>
          <Tag
            :value="getWarrantyStatus(selectedWarranty.endDate)"
            :severity="getWarrantySeverity(selectedWarranty.endDate)"
          />
        </div>

        <div class="coverage-info">
          <div class="info-grid">
            <div class="info-item">
              <label>Provider:</label>
              <span>{{ selectedWarranty.provider }}</span>
            </div>
            <div class="info-item">
              <label>Contract Number:</label>
              <span>{{ selectedWarranty.contractNumber }}</span>
            </div>
            <div class="info-item">
              <label>Start Date:</label>
              <span>{{ formatDate(selectedWarranty.startDate) }}</span>
            </div>
            <div class="info-item">
              <label>End Date:</label>
              <span>{{ formatDate(selectedWarranty.endDate) }}</span>
            </div>
          </div>
        </div>

        <div class="coverage-content">
          <h5>Coverage Details</h5>
          <div class="coverage-text">
            {{
              selectedWarranty.coverageDetails ||
              'No specific coverage details available.'
            }}
          </div>
        </div>

        <div class="coverage-claims" v-if="warrantyClaims.length > 0">
          <h5>Claim History</h5>
          <DataTable :value="warrantyClaims" stripedRows>
            <Column field="claimDate" header="Date">
              <template #body="{ data }">
                {{ formatDate(data.claimDate) }}
              </template>
            </Column>
            <Column field="claimAmount" header="Amount">
              <template #body="{ data }">
                R{{ data.claimAmount?.toFixed(2) }}
              </template>
            </Column>
            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="getClaimStatusSeverity(data.status)" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </Dialog>

    <!-- Filter Panel -->
    <Sidebar
      v-model:visible="filterPanelVisible"
      position="right"
      header="Filter Maintenance Records"
      class="filter-sidebar"
    >
      <div class="filter-content">
        <div class="filter-section">
          <h4>Vehicle</h4>
          <MultiSelect
            v-model="filters.vehicles"
            :options="vehicles"
            optionLabel="plateNumber"
            optionValue="id"
            placeholder="Select Vehicles"
            display="chip"
          />
        </div>

        <div class="filter-section">
          <h4>Service Type</h4>
          <MultiSelect
            v-model="filters.serviceTypes"
            :options="serviceTypes"
            placeholder="Select Service Types"
            display="chip"
          />
        </div>

        <div class="filter-section">
          <h4>Date Range</h4>
          <div class="date-range">
            <Calendar
              v-model="filters.dateRange[0]"
              placeholder="From Date"
              showIcon
            />
            <span class="date-range-separator">to</span>
            <Calendar
              v-model="filters.dateRange[1]"
              placeholder="To Date"
              showIcon
            />
          </div>
        </div>

        <div class="filter-section">
          <h4>Status</h4>
          <div class="status-filters">
            <div class="field-checkbox">
              <Checkbox v-model="filters.status.upcoming" inputId="upcoming" />
              <label for="upcoming">Upcoming</label>
            </div>
            <div class="field-checkbox">
              <Checkbox v-model="filters.status.overdue" inputId="overdue" />
              <label for="overdue">Overdue</label>
            </div>
            <div class="field-checkbox">
              <Checkbox v-model="filters.status.completed" inputId="completed" />
              <label for="completed">Completed</label>
            </div>
          </div>
        </div>

        <div class="filter-actions">
          <Button
            label="Apply Filters"
            class="p-button-primary"
            @click="applyFilters"
          />
          <Button label="Reset" class="p-button-text" @click="resetFilters" />
        </div>
      </div>
    </Sidebar>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import api from '../axios';
import ProgressSpinner from 'primevue/progressspinner';

// ✅ Import new components
import AppHeader from '../components/AppHeader.vue';
import Sidebar from '../components/Sidebar.vue';
import MaintenanceCalendar from '../components/MaintenanceCalendar.vue';

// PrimeVue Components
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import MultiSelect from 'primevue/multiselect';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';

// Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const toast = useToast();
const router = useRouter();

// ===== State =====
const isSidebarOpen = ref(true);
const isDarkMode = ref(false);
const globalLoading = ref(false);
const initialLoad = ref(true);
const displayAddDialog = ref(false);
const showProvidersMap = ref(false);
const filterPanelVisible = ref(false);
const saving = ref(false);
const showCoverageDialog = ref(false);
const selectedWarranty = ref(null);
const warrantyClaims = ref([]);

const vehicles = ref([]);
const scheduledMaintenance = ref([]);
const serviceHistory = ref([]);
const warranties = ref([]);
const urgentAlerts = ref([]);
const nearbyProviders = ref([]);
const southAfricanServiceProviders = ref([]);
let providersMap = null;

// Pagination
const scheduledPage = ref(1);
const scheduledPageSize = ref(10);
const scheduledTotalRecords = ref(0);
const historyPage = ref(1);
const historyPageSize = ref(10);
const historyTotalRecords = ref(0);
const warrantiesPage = ref(1);
const warrantiesPageSize = ref(10);
const warrantiesTotalRecords = ref(0);

const loadingScheduled = ref(false);
const loadingHistory = ref(false);
const loadingWarranties = ref(false);

const historyFilter = ref({ vehicle: null, serviceType: null });
const filters = ref({
  vehicles: [],
  serviceTypes: [],
  dateRange: [null, null],
  status: { upcoming: true, overdue: true, completed: true },
});

const newMaintenance = reactive({
  vehicleId: null,
  serviceType: null,
  scheduledDate: null,
  estimatedCost: 0,
  serviceProviderId: null,
  notes: '',
});

const serviceTypes = ref([
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Engine Service',
  'Transmission Service',
  'Suspension Check',
  'Wheel Alignment',
  'Battery Replacement',
  'Air Filter Change',
  'Coolant Flush',
]);

const stats = reactive({
  upcomingServices: 0,
  dueThisWeek: 0,
  monthlyCost: 0,
  lastMonthCost: 0,
  costChangePercent: 0,
  costChangeDirection: 'neutral',
  activeWarranties: 0,
  expiringSoon: 0,
  overdueServices: 0,
});

const southAfricanServiceTypes = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Engine Service',
  'Transmission Service',
  'Suspension Check',
  'Wheel Alignment',
  'Battery Replacement',
  'Air Filter Change',
  'Coolant Flush',
  'Fuel System Service',
  'Exhaust System Check',
  'Electrical Diagnostics',
];

// ===== Computed =====
const urgentAlertsCount = computed(() => urgentAlerts.value.length);
const overdueServices = computed(
  () =>
    urgentAlerts.value.filter((alert) => new Date(alert.scheduledDate) < new Date())
      .length,
);

const filteredServiceHistory = computed(() => {
  let filtered = [...serviceHistory.value];
  if (historyFilter.value.vehicle) {
    filtered = filtered.filter(
      (record) => record.vehicleId === historyFilter.value.vehicle.id,
    );
  }
  if (historyFilter.value.serviceType) {
    filtered = filtered.filter(
      (record) => record.serviceType === historyFilter.value.serviceType,
    );
  }
  return filtered;
});

const vehicleMaintenanceSummary = computed(() => {
  const summary = {};
  serviceHistory.value.forEach((record) => {
    if (!summary[record.vehicleId]) {
      summary[record.vehicleId] = {
        vehicle: record.vehicle?.plateNumber || 'Unknown',
        totalServices: 0,
        totalCost: 0,
        services: [],
      };
    }
    summary[record.vehicleId].totalServices++;
    summary[record.vehicleId].totalCost += record.actualCost || 0;
    summary[record.vehicleId].services.push(record);
  });
  return Object.values(summary).map((item) => ({
    ...item,
    avgCostPerService: item.totalCost / item.totalServices,
  }));
});

const isFormValid = computed(() => {
  return (
    newMaintenance.vehicleId &&
    newMaintenance.serviceType &&
    newMaintenance.scheduledDate &&
    newMaintenance.estimatedCost &&
    newMaintenance.estimatedCost > 0
  );
});

// ===== Sidebar Toggle =====
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// ===== Helper functions =====
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getServiceTypeIcon = (serviceType) => {
  const icons = {
    'Oil Change': 'pi pi-filter',
    'Tire Rotation': 'pi pi-circle',
    'Brake Inspection': 'pi pi-stop',
    'Engine Service': 'pi pi-cog',
    'Transmission Service': 'pi pi-sync',
    'Battery Replacement': 'pi pi-bolt',
  };
  return icons[serviceType] || 'pi pi-wrench';
};

const getDueDateSeverity = (dateString) => {
  const today = new Date();
  const dueDate = new Date(dateString);
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'danger';
  if (diffDays <= 3) return 'warning';
  if (diffDays <= 7) return 'info';
  return 'success';
};

const getDueDateStatus = (dateString) => {
  const today = new Date();
  const dueDate = new Date(dateString);
  const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due Today';
  if (diffDays === 1) return 'Due Tomorrow';
  return `Due in ${diffDays} days`;
};

const getRecommendedProvider = (vehicle, serviceType) => {
  if (vehicle?.model?.includes('Toyota')) return 'Toyota South Africa';
  if (vehicle?.model?.includes('Isuzu')) return 'Isuzu Trucks SA';
  if (serviceType.includes('Transmission')) return 'TruckPro Johannesburg';
  return 'AutoZone Centurion';
};

const isUnderWarranty = (service) => {
  const serviceDate = new Date(service.completedDate);
  const warrantyEnd = new Date(serviceDate);
  warrantyEnd.setFullYear(warrantyEnd.getFullYear() + 1);
  return new Date() <= warrantyEnd;
};

const getWarrantyTypeSeverity = (type) => {
  const severities = {
    Manufacturer: 'success',
    Extended: 'info',
    'Third-Party': 'warning',
  };
  return severities[type] || 'secondary';
};

const getWarrantySeverity = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'danger';
  if (diffDays <= 30) return 'warning';
  return 'success';
};

const getWarrantyStatus = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 30) return 'Expiring Soon';
  return 'Active';
};

const getProviderTypeSeverity = (type) => {
  const severities = {
    Dealer: 'success',
    Specialist: 'info',
    Independent: 'warning',
    'Fleet Specialist': 'help',
  };
  return severities[type] || 'secondary';
};

const getClaimStatusSeverity = (status) => {
  const severities = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'danger',
    Paid: 'info',
  };
  return severities[status] || 'secondary';
};

// ===== API Calls =====
const fetchVehicles = async () => {
  try {
    const response = await api.get('/vehicles/dropdown');
    vehicles.value = response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load vehicles',
      life: 3000,
    });
  }
};

const fetchScheduledData = async () => {
  try {
    loadingScheduled.value = true;
    const response = await api.get('/maintenance/scheduled', {
      params: { page: scheduledPage.value, pageSize: scheduledPageSize.value },
    });
    if (response.data?.data) {
      scheduledMaintenance.value = response.data.data;
      scheduledTotalRecords.value = response.data.totalCount;
    } else {
      scheduledMaintenance.value = response.data || [];
      scheduledTotalRecords.value = scheduledMaintenance.value.length;
    }
  } catch (error) {
    console.error('Error loading scheduled maintenance:', error);
    scheduledMaintenance.value = [];
  } finally {
    loadingScheduled.value = false;
  }
};

const fetchHistoryData = async () => {
  try {
    loadingHistory.value = true;
    const response = await api.get('/maintenance/history', {
      params: { page: historyPage.value, pageSize: historyPageSize.value },
    });
    if (response.data?.data) {
      serviceHistory.value = response.data.data;
      historyTotalRecords.value = response.data.totalCount;
    } else {
      serviceHistory.value = response.data || [];
      historyTotalRecords.value = serviceHistory.value.length;
    }
  } catch (error) {
    console.error('Error loading service history:', error);
    serviceHistory.value = [];
  } finally {
    loadingHistory.value = false;
  }
};

const fetchWarrantiesData = async () => {
  try {
    loadingWarranties.value = true;
    const response = await api.get('/maintenance/warranties', {
      params: { page: warrantiesPage.value, pageSize: warrantiesPageSize.value },
    });
    if (response.data?.data) {
      warranties.value = response.data.data;
      warrantiesTotalRecords.value = response.data.totalCount;
    } else {
      warranties.value = response.data || [];
      warrantiesTotalRecords.value = warranties.value.length;
    }
  } catch (error) {
    console.error('Error loading warranties:', error);
    warranties.value = [];
  } finally {
    loadingWarranties.value = false;
  }
};

const fetchMaintenanceStats = async () => {
  try {
    const response = await api.get('/maintenance/stats');
    Object.assign(stats, response.data);
    if (stats.lastMonthCost > 0) {
      const change = ((stats.monthlyCost - stats.lastMonthCost) / stats.lastMonthCost) *
        100;
      stats.costChangePercent = Math.abs(Math.round(change));
      stats.costChangeDirection = change <= 0 ? 'positive' : 'negative';
    }
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
  }
};

const fetchAlerts = async () => {
  try {
    const response = await api.get('/maintenance/alerts/urgent');
    urgentAlerts.value = [
      ...(response.data.OverdueMaintenance || []),
      ...(response.data.DueSoonMaintenance || []),
      ...(response.data.ExpiringWarranties || []),
    ];
  } catch (error) {
    console.error('Error loading alerts:', error);
  }
};

const fetchServiceProviders = async () => {
  try {
    const response = await api.get('/maintenance/service-providers');
    southAfricanServiceProviders.value = response.data || [];
    await nextTick();
    initializeProvidersMap();
  } catch (error) {
    console.error('Error fetching service providers:', error);
    // Fallback static data (South African)
    southAfricanServiceProviders.value = [
      {
        id: 1,
        name: 'Toyota South Africa - Sandton',
        type: 'Dealer',
        specialization: 'All Toyota Models',
        latitude: -26.1076,
        longitude: 28.0567,
        address: 'Rivonia Road, Sandton',
        phone: '+27 11 883 9000',
        rating: 4.5,
      },
      {
        id: 2,
        name: 'Isuzu Trucks SA - Centurion',
        type: 'Dealer',
        specialization: 'Commercial Vehicles',
        latitude: -25.86,
        longitude: 28.18,
        address: 'Old Johannesburg Road, Centurion',
        phone: '+27 12 671 9000',
        rating: 4.3,
      },
      {
        id: 3,
        name: 'Mercedes-Benz Trucks - Midrand',
        type: 'Dealer',
        specialization: 'Heavy Duty Trucks',
        latitude: -25.9896,
        longitude: 28.128,
        address: 'Allandale Road, Midrand',
        phone: '+27 11 254 7000',
        rating: 4.6,
      },
      {
        id: 4,
        name: 'AutoZone Centurion',
        type: 'Independent',
        specialization: 'General Maintenance',
        latitude: -25.8589,
        longitude: 28.1855,
        address: 'Lenchen Avenue, Centurion',
        phone: '+27 12 663 1500',
        rating: 4.2,
      },
      {
        id: 5,
        name: 'TruckPro Johannesburg',
        type: 'Specialist',
        specialization: 'Commercial Vehicles',
        latitude: -26.2357,
        longitude: 28.1733,
        address: 'Rosettenville Road, Johannesburg',
        phone: '+27 11 493 1400',
        rating: 4.4,
      },
      {
        id: 6,
        name: 'FleetCare Pretoria',
        type: 'Fleet Specialist',
        specialization: 'Fleet Maintenance',
        latitude: -25.7456,
        longitude: 28.187,
        address: 'Soutpan Road, Pretoria',
        phone: '+27 12 546 7800',
        rating: 4.7,
      },
    ];
    await nextTick();
    initializeProvidersMap();
  }
};

// ===== Map Initialization =====
const initializeProvidersMap = () => {
  if (providersMap) {
    providersMap.remove();
    providersMap = null;
  }

  const mapElement = document.getElementById('providers-map');
  if (!mapElement) return;

  providersMap = L.map('providers-map');
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(providersMap);

  const providers = southAfricanServiceProviders.value;
  if (!providers.length) return;

  const group = L.featureGroup();

  providers.forEach((provider) => {
    if (!provider.latitude || !provider.longitude) return;
    const markerColor =
      provider.type === 'Dealer'
        ? '#EB0A1E'
        : provider.type === 'Specialist'
        ? '#003399'
        : provider.type === 'Fleet Specialist'
        ? '#00A4A6'
        : '#666666';

    const icon = L.divIcon({
      html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-marker',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const marker = L.marker([provider.latitude, provider.longitude], { icon })
      .addTo(providersMap)
      .bindPopup(`
        <div style="min-width: 200px;">
          <strong>${provider.name}</strong><br>
          <strong>Type:</strong> ${provider.type}<br>
          <strong>Specialization:</strong> ${provider.specialization || 'N/A'}<br>
          <strong>Address:</strong> ${provider.address || 'N/A'}<br>
          <strong>Phone:</strong> ${provider.phone || 'N/A'}<br>
          <strong>Rating:</strong> ⭐ ${provider.rating || 'N/A'}
        </div>
      `);
    group.addLayer(marker);
  });

  if (group.getLayers().length > 0) {
    providersMap.fitBounds(group.getBounds().pad(0.1));
  } else {
    providersMap.setView([-28.4793, 24.6727], 5);
  }
};

// ===== Event Handlers =====
const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};

const toggleFilterPanel = () => {
  filterPanelVisible.value = !filterPanelVisible.value;
};

const showAddDialog = () => {
  displayAddDialog.value = true;
  fetchVehicles();
  fetchServiceProviders();
};

const saveMaintenance = async () => {
  try {
    saving.value = true;
    const selectedProvider = southAfricanServiceProviders.value.find(
      (p) => p.id === newMaintenance.serviceProviderId,
    );
    const maintenanceData = {
      vehicleId: newMaintenance.vehicleId,
      serviceType: newMaintenance.serviceType,
      scheduledDate: newMaintenance.scheduledDate
        ? new Date(newMaintenance.scheduledDate).toISOString()
        : null,
      estimatedCost: newMaintenance.estimatedCost,
      notes: newMaintenance.notes,
      recommendedProvider: selectedProvider?.name || null,
    };
    await api.post('/maintenance', maintenanceData);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Maintenance service scheduled successfully',
      life: 3000,
    });
    resetForm();
    displayAddDialog.value = false;
    await fetchScheduledData();
  } catch (error) {
    console.error('Error saving maintenance:', error);
    let errorMessage = 'Failed to schedule maintenance service';
    if (error.response?.data?.message) errorMessage = error.response.data.message;
    else if (error.response?.data?.errors)
      errorMessage = Object.values(error.response.data.errors).flat().join(', ');
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    });
  } finally {
    saving.value = false;
  }
};

const completeService = async (service) => {
  try {
    const completionData = {
      actualCost: service.estimatedCost,
      serviceProvider: service.recommendedProvider || 'AutoZone Centurion',
      receiptUrl: `/receipts/${service.id}.pdf`,
    };
    await api.put(`/maintenance/${service.id}/complete`, completionData);
    toast.add({
      severity: 'success',
      summary: 'Service Completed',
      detail: 'Maintenance service marked as completed',
      life: 3000,
    });
    await fetchScheduledData();
    await fetchHistoryData();
  } catch (error) {
    console.error('Error completing service:', error);
    toast.add({
      severity: 'error',
      summary: 'Completion Failed',
      detail: 'Failed to mark service as completed',
      life: 3000,
    });
  }
};

const editService = (service) => {
  newMaintenance.vehicleId = service.vehicleId;
  newMaintenance.serviceType = service.serviceType;
  newMaintenance.scheduledDate = new Date(service.scheduledDate);
  newMaintenance.estimatedCost = service.estimatedCost;
  const provider = southAfricanServiceProviders.value.find(
    (p) => p.name === service.recommendedProvider,
  );
  newMaintenance.serviceProviderId = provider?.id || null;
  newMaintenance.notes = service.notes;
  displayAddDialog.value = true;
};

const rescheduleService = (service) => editService(service);

const showProviderLocation = (service) => {
  showProvidersMap.value = true;
  loadNearbyProviders(service);
};

const selectProvider = (event) => {
  console.log('Selected provider:', event.data);
};

const showAddWarrantyDialog = () => {
  console.log('Show add warranty dialog');
};

const showCoverageDetails = (warranty) => {
  toast.add({
    severity: 'info',
    summary: 'Coverage Details',
    detail: warranty.coverageDetails || 'No coverage details available',
    life: 5000,
  });
};

const initiateWarrantyClaim = async (service) => {
  try {
    const vehicleWarranty = warranties.value.find(
      (w) => w.vehicleId === service.vehicleId && new Date(w.endDate) > new Date(),
    );
    if (!vehicleWarranty) {
      toast.add({
        severity: 'warn',
        summary: 'No Active Warranty',
        detail: 'No active warranty found for this vehicle',
        life: 3000,
      });
      return;
    }
    const claimData = {
      warrantyId: vehicleWarranty.id,
      maintenanceRecordId: service.id,
      claimAmount: service.actualCost || service.estimatedCost,
      description: `Warranty claim for ${service.serviceType} on ${service.vehicle?.plateNumber}`,
      notes: 'Automated warranty claim submission',
    };
    await api.post('/maintenance/warranty-claims', claimData);
    toast.add({
      severity: 'success',
      summary: 'Claim Submitted',
      detail: 'Warranty claim submitted successfully',
      life: 3000,
    });
    await fetchWarrantiesData();
  } catch (error) {
    console.error('Error initiating warranty claim:', error);
    toast.add({
      severity: 'error',
      summary: 'Claim Failed',
      detail: 'Failed to submit warranty claim',
      life: 3000,
    });
  }
};

const downloadReceipt = (service) => {
  if (service.receiptUrl) window.open(service.receiptUrl, '_blank');
};

const showAlertDetails = () => {
  console.log('Showing alert details:', urgentAlerts.value);
};

const loadNearbyProviders = (service) => {
  nearbyProviders.value = [
    { name: 'Toyota Sandton', type: 'Dealer', distance: 2.5, rating: 4.5 },
    { name: 'AutoZone Randburg', type: 'Independent', distance: 3.2, rating: 4.2 },
    { name: 'FleetCare Midrand', type: 'Fleet Specialist', distance: 5.1, rating: 4.7 },
  ];
};

const generateServiceSchedule = async () => {
  try {
    const scheduleData = {
      region: 'south_africa',
      roadConditions: 'mixed',
      climate: 'subtropical',
      serviceIntervals: { oilChange: 15000, tireRotation: 10000, brakeInspection: 20000 },
    };
    const response = await api.post('/maintenance/generate-schedule', scheduleData);
    toast.add({
      severity: 'success',
      summary: 'Schedule Generated',
      detail: response.data.message || 'Maintenance schedule created successfully',
      life: 3000,
    });
    await fetchScheduledData();
  } catch (error) {
    console.error('Error generating schedule:', error);
    toast.add({
      severity: 'error',
      summary: 'Schedule Error',
      detail: 'Failed to generate maintenance schedule',
      life: 3000,
    });
  }
};

const loadWarrantyClaims = async (warranty) => {
  try {
    const response = await api.get(`/maintenance/warranty-claims/${warranty.id}`);
    return response.data;
  } catch (error) {
    console.error('Error loading warranty claims:', error);
    return [];
  }
};

const getWarrantyClaimsCount = async (warranty) => {
  try {
    const claims = await loadWarrantyClaims(warranty);
    return claims.length;
  } catch (error) {
    return 0;
  }
};

const exportMaintenanceData = () => {
  const data = {
    scheduled: scheduledMaintenance.value,
    history: serviceHistory.value,
    warranties: warranties.value,
    exportDate: new Date().toISOString(),
    region: 'South Africa',
    currency: 'ZAR',
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `maintenance-data-sa-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
  toast.add({
    severity: 'success',
    summary: 'Data Exported',
    detail: 'Maintenance data exported successfully',
    life: 3000,
  });
};

const applyFilters = async () => {
  try {
    loadingScheduled.value = true;
    loadingHistory.value = true;
    filterPanelVisible.value = false;
    await Promise.all([fetchScheduledData(), fetchHistoryData()]);
  } catch (error) {
    console.error('Error applying filters:', error);
  } finally {
    loadingScheduled.value = false;
    loadingHistory.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    vehicles: [],
    serviceTypes: [],
    dateRange: [null, null],
    status: { upcoming: true, overdue: true, completed: true },
  };
};

const resetForm = () => {
  Object.assign(newMaintenance, {
    vehicleId: null,
    serviceType: null,
    scheduledDate: null,
    estimatedCost: 0,
    serviceProviderId: null,
    notes: '',
  });
};

const closeDialog = () => {
  displayAddDialog.value = false;
  resetForm();
};

const onScheduledPageChange = (event) => {
  scheduledPage.value = event.page + 1;
  scheduledPageSize.value = event.rows;
  fetchScheduledData();
};

const onHistoryPageChange = (event) => {
  historyPage.value = event.page + 1;
  historyPageSize.value = event.rows;
  fetchHistoryData();
};

const onWarrantiesPageChange = (event) => {
  warrantiesPage.value = event.page + 1;
  warrantiesPageSize.value = event.rows;
  fetchWarrantiesData();
};

const viewProviderOnMap = (provider) => {
  console.log('View provider on map:', provider);
};

const fetchCostAnalytics = async () => {
  try {
    const response = await api.get('/maintenance/analytics/cost-trend');
    console.log('Cost analytics:', response.data);
    toast.add({
      severity: 'success',
      summary: 'Analytics Loaded',
      detail: 'Cost trend data loaded successfully',
      life: 3000,
    });
  } catch (error) {
    console.error('Error fetching cost analytics:', error);
  }
};

const fetchServiceDistribution = async () => {
  try {
    const response = await api.get('/maintenance/analytics/service-distribution');
    console.log('Service distribution:', response.data);
    toast.add({
      severity: 'success',
      summary: 'Analytics Loaded',
      detail: 'Service distribution data loaded successfully',
      life: 3000,
    });
  } catch (error) {
    console.error('Error fetching service distribution:', error);
  }
};

// Calendar event handlers
const handleDateSelected = (date) => {
  console.log('Date selected:', date);
};

const handleEventSelected = (event) => {
  console.log('Event selected:', event);
};

const viewAlertDetails = (record) => {
  console.log('View details for record:', record);
};

const fetchMaintenanceData = async () => {
  try {
    await Promise.all([
      fetchVehicles(),
      fetchAlerts(),
      fetchMaintenanceStats(),
      fetchScheduledData(),
      fetchHistoryData(),
      fetchWarrantiesData(),
      fetchServiceProviders(),
    ]);
  } catch (error) {
    console.error('Error fetching maintenance data:', error);
    toast.add({
      severity: 'error',
      summary: 'Data Load Error',
      detail: 'Failed to load maintenance data',
      life: 3000,
    });
  }
};

// ===== Lifecycle =====
onMounted(async () => {
  globalLoading.value = true;
  initialLoad.value = true;
  try {
    await fetchMaintenanceData();
  } catch (error) {
    console.error('Error initializing maintenance view:', error);
    toast.add({
      severity: 'error',
      summary: 'Initialization Error',
      detail: 'Failed to load maintenance data',
      life: 3000,
    });
  } finally {
    globalLoading.value = false;
    initialLoad.value = false;
  }
});
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dashboard-layout.dark {
  background-color: #0f172a;
  color: #e2e8f0;
}

.loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  z-index: 999;
}

.dark .loading-indicator {
  background: rgba(15, 23, 42, 0.8);
}

.global-loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dark .global-loader-overlay {
  background-color: rgba(26, 29, 40, 0.7);
}

.layout-wrapper {
  display: flex;
  min-height: 100vh;
  margin-top: 64px; /* header height */
}

.main-content {
  margin-left: 260px;
  padding: 2rem 1.5rem;
  width: calc(100% - 260px);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.sidebar-collapsed {
  margin-left: 72px;
  width: calc(100% - 72px);
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Dashboard Header ===== */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  color: white;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subtitle {
  opacity: 0.9;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* ===== Stats Cards ===== */
.maintenance-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.urgent {
  border-left: 4px solid #ef4444;
}
.stat-card.scheduled {
  border-left: 4px solid #3b82f6;
}
.stat-card.cost {
  border-left: 4px solid #10b981;
}
.stat-card.warranty {
  border-left: 4px solid #f59e0b;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-content {
  text-align: center;
  padding: 1rem 0;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-label {
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.stat-trend.positive {
  color: #10b981;
}
.stat-trend.negative {
  color: #ef4444;
}
.stat-trend.warning {
  color: #f59e0b;
}

/* ===== Map Section ===== */
.service-providers-section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.providers-map-container {
  position: relative;
}

#providers-map {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  z-index: 1;
}

.custom-marker {
  background: transparent;
  border: none;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

:deep(.leaflet-popup-content) {
  min-width: 200px;
  font-size: 0.9rem;
}

.providers-legend {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #ddd;
}

.legend-color.toyota {
  background-color: #eb0a1e;
}
.legend-color.isuzu {
  background-color: #003399;
}
.legend-color.mercedes {
  background-color: #00a4a6;
}
.legend-color.independent {
  background-color: #666666;
}

/* ===== Tabs ===== */
.tabs-container {
  margin-bottom: 2rem;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.history-filters {
  display: flex;
  gap: 1rem;
}

.filter-dropdown {
  min-width: 200px;
}

/* ===== Tables ===== */
.maintenance-table {
  background: var(--surface-card);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.p-datatable) {
  box-shadow: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.dark :deep(.p-datatable) {
  border-color: #334155;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f1f5f9;
  color: #1e293b;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.dark :deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #1e293b;
  color: #e2e8f0;
  border-bottom-color: #334155;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.15s;
}
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}
.dark :deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #1e293b;
}

:deep(.p-paginator) {
  background: transparent;
  border: none;
  padding-top: 1rem;
}

.vehicle-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vehicle-model-tag {
  font-size: 0.7rem;
}

.service-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cost-estimate {
  font-weight: 600;
}
.cost-note {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
  margin-left: 0.25rem;
}

.service-provider {
  color: var(--primary-color);
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.actual-cost {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cost-over-budget {
  color: #ef4444;
  font-weight: 600;
}

.cost-variance {
  margin-left: auto;
}

.vehicle-warranty-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.warranty-vehicle-model {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

.warranty-end-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.warranty-claims {
  display: flex;
  justify-content: center;
}

.table-spinner {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

/* ===== Analytics ===== */
.analytics-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.analytics-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.analytics-card {
  height: 100%;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: var(--text-color-secondary);
}

.chart-placeholder i {
  margin-bottom: 1rem;
}

/* ===== Calendar ===== */
.calendar-section {
  background: var(--surface-card);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

/* ===== Urgent Alerts ===== */
.urgent-alerts-section {
  margin-bottom: 2rem;
}

.urgent-alerts-card {
  border-left: 4px solid #ef4444;
}

.alerts-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 4px solid #ef4444;
}

.alert-icon {
  color: #ef4444;
  font-size: 1.2rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.alert-message {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.alert-actions {
  display: flex;
  gap: 0.5rem;
}

/* ===== Form ===== */
.maintenance-form {
  padding: 1rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field.col-span-2 {
  grid-column: span 2;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.w-full {
  width: 100%;
}
.ml-2 {
  margin-left: 0.5rem;
}
.mt-3 {
  margin-top: 1rem;
}

/* ===== Filter Sidebar ===== */
.filter-content {
  padding: 1rem 0;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-section h4 {
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-range-separator {
  color: var(--text-color-secondary);
}

.status-filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

/* ===== Providers Map Dialog ===== */
.providers-map-dialog {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.providers-list h4 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.map-placeholder {
  text-align: center;
  color: var(--text-color-secondary);
}

/* ===== Coverage Dialog ===== */
.coverage-details {
  padding: 0.5rem 0;
}

.coverage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.coverage-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.dark .coverage-info {
  background: #1e293b;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}
.info-item label {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}
.info-item span {
  font-weight: 500;
}

.coverage-content {
  margin-bottom: 1rem;
}

.coverage-text {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.6;
}
.dark .coverage-text {
  background: #1e293b;
}

.coverage-claims {
  margin-top: 1rem;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0 !important;
    width: 100% !important;
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  .maintenance-stats-grid {
    grid-template-columns: 1fr;
  }
  .analytics-row {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .field.col-span-2 {
    grid-column: span 1;
  }
  .tab-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  .history-filters {
    flex-direction: column;
    width: 100%;
  }
  .alert-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .alert-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>