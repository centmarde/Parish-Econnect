<script setup>
import { provide } from 'vue'
import { useMembersManagement } from './composables/membersManagement.js'
import AdminHeader from '@/components/layout/AdminHeader.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import MembersTable from './components/MembersTable.vue'
import ShowMembers from './components/ShowMembers.vue'
import EditMember from './components/EditMember.vue'
import DeleteMembers from './components/DeleteMembers.vue'


// Create the composable instance once
const membersManagement = useMembersManagement()

// Provide it to all child components
provide('membersManagement', membersManagement)

// Destructure all needed properties and methods from the composable
const {
  loading,
  searchQuery,
  selectedRole,
  totalMembers,
  filteredMembers,
  paginatedMembers,
  roleOptions,
  refreshMembers,
} = membersManagement
</script>

<template>
  <PreloaderView v-if="loading" />
  <AdminHeader v-else>
    <template #content>
      <v-container fluid class="pa-4 pa-md-8">
        <!-- Header Section -->
        <div class="glass-card pa-4 pa-md-6 mb-6">
          <div
            class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center ga-4"
          >
            <div>
              <h1 class="header-gradient mb-2 text-h4 text-md-h3">Members Management</h1>
              <p class="text-subtitle-1 text-grey">
                Manage parish members, roles, and view their booking history
              </p>
              <div class="d-flex ga-4 mt-3">
                <v-chip color="primary" variant="outlined" size="small">
                  <v-icon start size="14">mdi-account-group</v-icon>
                  {{ totalMembers }} Total Members
                </v-chip>
                <v-chip color="success" variant="outlined" size="small">
                  <v-icon start size="14">mdi-shield-check</v-icon>
                  {{ filteredMembers.filter(m => m.role === 'admin').length }} Admins
                </v-chip>
              </div>
            </div>

            <div class="d-flex ga-2">
              <v-btn
                color="secondary"
                variant="outlined"
                @click="refreshMembers"
                :loading="loading"
                icon="mdi-refresh"
              />

            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <v-card class="glass-card mb-6">
          <v-card-text class="pa-4 pa-md-6">
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  prepend-inner-icon="mdi-magnify"
                  label="Search members..."
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  placeholder="Name, email, or phone"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedRole"
                  :items="roleOptions"
                  label="Filter by Role"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3" class="text-right">
                <div class="text-body-2 text-grey">
                  Showing {{ paginatedMembers.length }} of {{ filteredMembers.length }} members
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Members Table Component -->
        <MembersTable />

        <!-- Dialog Components -->
        <ShowMembers />
        <EditMember />
        <DeleteMembers />

      </v-container>
    </template>
  </AdminHeader>
</template>
