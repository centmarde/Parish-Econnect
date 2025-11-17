import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export type OtherRecord = {
	id?: number | null
	created_at?: string | null
	title?: string | null
	description?: string | null
	user_id?: string | null
	comment?: string | null
	is_approved?: boolean | null
	is_denied?: boolean | null
	ref_number?: string | null
	starting_time?: string | null
	ending_time?: string | null
  date?: string | null
}

export const useOtherStore = defineStore('otherData', () => {
	const items = ref<OtherRecord[]>([])
	const loading = ref(false)
	const error = ref<string | null>(null)

	async function fetchAll() {
		loading.value = true
		error.value = null
		try {
			const { data, error: err } = await supabase
				.from('others')
				.select('*')
				.order('created_at', { ascending: false })

			if (err) throw err
			items.value = (data as OtherRecord[]) || []
			return items.value
		} catch (e: any) {
			error.value = e.message || String(e)
			throw e
		} finally {
			loading.value = false
		}
	}

	async function fetchById(id: number) {
		loading.value = true
		error.value = null
		try {
			const { data, error: err } = await supabase
				.from('others')
				.select('*')
				.eq('id', id)
				.single()

			if (err) throw err
			return data as OtherRecord
		} catch (e: any) {
			error.value = e.message || String(e)
			throw e
		} finally {
			loading.value = false
		}
	}

	async function create(payload: Partial<OtherRecord>) {
		loading.value = true
		error.value = null
		try {
			// Get authenticated user
			const { data: { user }, error: authError } = await supabase.auth.getUser()

			if (authError || !user) {
				throw new Error('User not authenticated')
			}

			// Attach user_id to payload
			const insertPayload = {
				...payload,
				user_id: user.id,
			}

			const { data, error: err } = await supabase
				.from('others')
				.insert([insertPayload])
				.select()

			if (err) throw err
			// append returned row(s)
			const created = (data as OtherRecord[])[0]
			if (created) items.value.unshift(created)
			return created
		} catch (e: any) {
			error.value = e.message || String(e)
			throw e
		} finally {
			loading.value = false
		}
	}

	async function update(id: number, payload: Partial<OtherRecord>) {
		loading.value = true
		error.value = null
		try {
			const { data, error: err } = await supabase
				.from('others')
				.update(payload)
				.eq('id', id)
				.select()

			if (err) throw err
			const updated = (data as OtherRecord[])[0]
			if (updated) {
				const idx = items.value.findIndex((i) => i.id === updated.id)
				if (idx !== -1) items.value.splice(idx, 1, updated)
			}
			return updated
		} catch (e: any) {
			error.value = e.message || String(e)
			throw e
		} finally {
			loading.value = false
		}
	}

	async function remove(id: number) {
		loading.value = true
		error.value = null
		try {
			const { error: err } = await supabase
				.from('others')
				.delete()
				.eq('id', id)

			if (err) throw err
			const idx = items.value.findIndex((i) => i.id === id)
			if (idx !== -1) items.value.splice(idx, 1)
			return true
		} catch (e: any) {
			error.value = e.message || String(e)
			throw e
		} finally {
			loading.value = false
		}
	}

	return {
		items,
		loading,
		error,
		fetchAll,
		fetchById,
		create,
		update,
		remove,
	}
})

export default useOtherStore
