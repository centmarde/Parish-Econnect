import { supabase } from '@/utils/supabase'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAnnouncementsStore = defineStore('announcement', () => {
  const announcement = ref([])
})
