<script setup>
import CalendarWidget from '@/views/events/components/CalendarWidget.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Handle dialog close
const handleDialogClose = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <!-- Calendar Widget Dialog with proper scrolling -->
  <v-dialog
    :model-value="props.modelValue"
    max-width="1200px"
    max-height="90vh"
    scrollable
    transition="dialog-bottom-transition"
    @update:model-value="emit('update:modelValue', $event)"
    @click:outside="handleDialogClose"
  >
    <v-card
      class="d-flex flex-column"
      height="85vh"
    >
      <v-card-title
        class="d-flex justify-end pa-2 text-white flex-shrink-0"
        style="position: sticky; top: 0; z-index: 1;"
      >
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          size="small"
          @click="handleDialogClose"
        />
      </v-card-title>

      <v-card-text
        class="pa-0 flex-grow-1 overflow-y-auto"
        style="max-height: calc(85vh - 80px);"
      >
        <CalendarWidget />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
