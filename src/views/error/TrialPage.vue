<!-- <script setup>
import { ref } from 'vue'

const pets = ref([])
const name = ref('')
const breed = ref('')
const age = ref('')
const error = ref('')

const addPet = () => {
  if (!name.value || !breed.value || !age.value) {
    error.value = 'All fields are required.'
    return
  }

  pets.value.push({
    id: Date.now(),
    name: name.value,
    breed: breed.value,
    age: parseInt(age.value),
  })

  // Reset form
  name.value = ''
  breed.value = ''
  age.value = ''
  error.value = ''
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
    <h1 class="text-3xl font-bold mb-6 text-center">Pet Registration</h1>

    <form @submit.prevent="addPet" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
      <input v-model="name" type="text" placeholder="Pet Name" class="border rounded p-2 w-full" />
      <input v-model="breed" type="text" placeholder="Breed" class="border rounded p-2 w-full" />
      <input v-model="age" type="number" placeholder="Age" class="border rounded p-2 w-full" />
      <div class="sm:col-span-2 lg:col-span-3 text-right">
        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Pet
        </button>
      </div>
    </form>

    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="pet in pets" :key="pet.id" class="p-4 border rounded-lg shadow bg-white">
        <h2 class="text-xl font-semibold">{{ pet.name }}</h2>
        <p class="text-gray-700">Breed: {{ pet.breed }}</p>
        <p class="text-gray-600">Age: {{ pet.age }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add transitions or mobile tweaks here if needed */
</style> -->
<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'

import { formActionDefault } from '@/utils/supabase'
import { getAvatarText } from '@/utils/helpers'
import { useDisplay } from 'vuetify'
import { useDate } from 'vuetify'
import { ref } from 'vue'

// Utilize pre-defined vue functions
const date = useDate()
const { mobile } = useDisplay()

// Use Pinia Store
const productsStore = useProductsStore()

// Load Variables
const tableOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  isLoading: false,
})
const tableFilters = ref({
  search: '',
})
const isDialogVisible = ref(false)
const isConfirmDeleteDialog = ref(false)
const itemData = ref(null)
const deleteId = ref('')
const formAction = ref({
  ...formActionDefault,
})

// Trigger Update Btn
const onUpdate = (item) => {
  itemData.value = item
  isDialogVisible.value = true
}

// Trigger Add Btn
const onAdd = () => {
  itemData.value = null
  isDialogVisible.value = true
}

// Trigger Delete Btn
const onDelete = (id) => {
  deleteId.value = id
  isConfirmDeleteDialog.value = true
}

// Confirm Delete
const onConfirmDelete = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  const { error } = await productsStore.deleteProduct(deleteId.value)

  // Turn off processing
  formAction.value.formProcess = false

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    return
  }

  // Add Success Message
  formAction.value.formSuccessMessage = 'Successfully Deleted Product.'

  // Retrieve Data
  onLoadItems(tableOptions.value, tableFilters.value)
  await productsStore.getProducts()
}

// Retrieve Data based on Search
const onSearchItems = () => {
  if (
    tableFilters.value.search?.length >= 2 ||
    tableFilters.value.search?.length == 0 ||
    tableFilters.value.search === null
  )
    onLoadItems(tableOptions.value, tableFilters.value)
}

// Load Tables Data
const onLoadItems = async ({ page, itemsPerPage, sortBy }) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  await productsStore.getProductsTable({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}
</script>

<template>
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
  ></AlertNotification>

  <v-row>
    <v-col cols="12">
      <!-- eslint-disable vue/valid-v-slot -->
      <v-data-table-server
        v-model:items-per-page="tableOptions.itemsPerPage"
        v-model:page="tableOptions.page"
        v-model:sort-by="tableOptions.sortBy"
        :loading="tableOptions.isLoading"
        :headers="tableHeaders"
        :items="productsStore.productsTable"
        :items-length="productsStore.productsTotal"
        @update:options="onLoadItems"
        :hide-default-header="mobile"
        :mobile="mobile"
      >
        <template #top>
          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" sm="5">
              <v-text-field
                v-model="tableFilters.search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search"
                clearable
                @click:clear="onSearchItems"
                @input="onSearchItems"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="3">
              <v-btn class="my-1" prepend-icon="mdi-plus" color="red-darken-4" block @click="onAdd">
                Add Product
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>
        </template>

        <template #item.name="{ item }">
          <div
            class="td-first"
            :class="mobile ? '' : 'd-flex align-center'"
            :style="mobile ? 'height: auto' : ''"
          >
            <div class="me-2">
              <v-img
                v-if="item.image_url"
                class="rounded-circle td-first-img"
                :class="mobile ? 'ml-auto my-2' : ''"
                color="red-darken-4"
                aspect-ratio="1"
                :src="item.image_url"
                alt="Product Picture"
                cover
              >
              </v-img>

              <v-avatar v-else color="red-darken-4" size="x-large">
                <span class="text-h5">
                  {{ getAvatarText(item.name) }}
                </span>
              </v-avatar>
            </div>

            <span class="font-weight-bold">
              {{ item.name }}
            </span>
          </div>
        </template>

        <template #item.created_at="{ item }">
          <span class="font-weight-bold">
            {{ date.format(item.created_at, 'fullDate') }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center" :class="mobile ? 'justify-end' : 'justify-center'">
            <v-btn variant="text" density="comfortable" @click="onUpdate(item)" icon>
              <v-icon icon="mdi-pencil"></v-icon>
              <v-tooltip activator="parent" location="top">Edit Product</v-tooltip>
            </v-btn>

            <v-btn variant="text" density="comfortable" @click="onDelete(item.id)" icon>
              <v-icon icon="mdi-trash-can" color="red-darken-4"></v-icon>
              <v-tooltip activator="parent" location="top">Delete Product</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>

  <ProductsFormDialog
    v-model:is-dialog-visible="isDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
    :table-filters="tableFilters"
  ></ProductsFormDialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to delete product?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>
</template>

<style scoped>
.td-first {
  height: 100px;
  min-width: 200px;
}

.td-first-img {
  width: 65px;
}
</style>
