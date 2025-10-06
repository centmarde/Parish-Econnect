<script setup>
import { inject } from 'vue'

// Inject the shared composable instance from parent
const membersManagement = inject('membersManagement')

// Destructure needed properties and methods from the composable
const {
  loading,
  paginatedMembers,
  filteredMembers,
  searchQuery,
  selectedRole,
  page,
  totalPages,
  viewMemberDetails,
  editMember,
  updateMemberRole,
  confirmDelete,
  getRoleColor
} = membersManagement
</script>

<template>
 <!-- Members Table -->
        <v-card class="glass-card">
          <v-data-table
            :items="paginatedMembers"
            :headers="[
              { title: 'Member', key: 'member', sortable: false },
              { title: 'Email', key: 'email', sortable: true },
              { title: 'Role', key: 'role', sortable: true },
              { title: 'Total Bookings', key: 'bookings.total', sortable: true },
              { title: 'Last Sign In', key: 'last_sign_in', sortable: true },
              { title: 'Joined', key: 'created_at', sortable: true },
              { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
            ]"
            class="members-table"
            :loading="loading"
            loading-text="Loading members..."
            hide-default-footer
            no-data-text="No members found"
          >
            <!-- Member Info -->
            <template #[`item.member`]="{ item }">
              <div class="d-flex align-center ga-3">
                <v-avatar size="40" :color="item.image_url ? undefined : 'primary'">
                  <v-img v-if="item.image_url" :src="item.image_url" />
                  <span v-else class="text-white font-weight-bold">
                    {{ (item.first_name?.[0] || '') + (item.last_name?.[0] || '') }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-semibold">{{ item.first_name }} {{ item.last_name }}</div>
                  <div class="text-caption text-grey-darken-2" v-if="item.phone">
                    {{ item.phone }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Email -->
            <template #[`item.email`]="{ item }">
              <div class="text-body-2">{{ item.email }}</div>
            </template>

            <!-- Role -->
            <template #[`item.role`]="{ item }">
              <v-chip
                :color="getRoleColor(item.role)"
                size="small"
                variant="tonal"
                class="text-capitalize"
              >
                <v-icon start size="14">
                  {{
                    item.role === 'admin'
                      ? 'mdi-shield-crown'
                      : item.role === 'moderator'
                        ? 'mdi-shield-check'
                        : 'mdi-account'
                  }}
                </v-icon>
                {{ item.role }}
              </v-chip>
            </template>

            <!-- Total Bookings -->
            <template #[`item.bookings.total`]="{ item }">
              <v-chip color="purple" variant="outlined" size="small">
                {{ item.bookings.total }}
              </v-chip>
            </template>

            <!-- Last Sign In -->
            <template #[`item.last_sign_in`]="{ item }">
              <div class="text-body-2">
                {{ item.last_sign_in ? new Date(item.last_sign_in).toLocaleDateString() : 'Never' }}
              </div>
            </template>

            <!-- Joined Date -->
            <template #[`item.created_at`]="{ item }">
              <div class="text-body-2">
                {{ new Date(item.created_at).toLocaleDateString() }}
              </div>
            </template>

            <!-- Actions -->
            <template #[`item.actions`]="{ item }">
              <div class="d-flex ga-2 justify-center">
                <v-tooltip text="View Details">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-eye"
                      variant="text"
                      size="small"
                      color="primary"
                      @click.stop="viewMemberDetails(item)"
                    />
                  </template>
                </v-tooltip>

                <v-menu>
                  <template #activator="{ props }">
                    <v-tooltip text="More Actions">
                      <template #activator="{ props: tooltipProps }">
                        <v-btn
                          v-bind="{ ...props, ...tooltipProps }"
                          icon="mdi-dots-vertical"
                          variant="text"
                          size="small"
                        />
                      </template>
                    </v-tooltip>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="editMember(item)">
                      <template #prepend>
                        <v-icon>mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Edit Member</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      @click="updateMemberRole(item.id, item.role === 'admin' ? 'user' : 'admin')"
                    >
                      <template #prepend>
                        <v-icon>{{
                          item.role === 'admin' ? 'mdi-account-arrow-down' : 'mdi-account-arrow-up'
                        }}</v-icon>
                      </template>
                      <v-list-item-title>
                        {{ item.role === 'admin' ? 'Remove Admin Rights' : 'Grant Admin Rights' }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider />
                    <v-list-item @click="confirmDelete(item)" class="text-red">
                      <template #prepend>
                        <v-icon color="red">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>Delete Member</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-data-table>

          <!-- Pagination and Empty State -->
          <div v-if="filteredMembers.length === 0 && !loading" class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-search</v-icon>
            <h3 class="text-h6 text-grey">No members found</h3>
            <p class="text-body-2 text-grey mb-4">
              {{
                searchQuery || selectedRole !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No members found'
              }}
            </p>
          </div>

          <v-card-actions v-else class="justify-center pa-6">
            <v-pagination
              v-model="page"
              :length="totalPages"
              :total-visible="7"
              circle
              color="primary"
            />
          </v-card-actions>
        </v-card>
</template>
