import { onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useOtherStore } from '@/stores/otherData'

// Composable nga nag-handle sa others bookings logic
export function useOthersHeader() {
	const otherStore = useOtherStore()
	const { mobile } = useDisplay()

	const userBookings = computed(() => otherStore.items)

	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return 'No date'
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: mobile.value ? 'short' : 'long',
			day: 'numeric',
		})
	}

	const getStatusColor = (booking: any) => {
		// Check if booking has ref_number (indicates completion)
		if (booking?.ref_number) {
			return 'success'
		}
		// Explicit denied state should be shown as error (red)
		else if (booking?.is_denied === true) {
			return 'error'
		}
		// Approved but not yet completed
		else if (booking?.is_approved === true) {
			return 'success'
		}
		// Explicit pending/false approval
		else if (booking?.is_approved === false) {
			return 'warning'
		} else {
			return 'info'
		}
	}

	const getStatusText = (booking: any) => {
		if (booking?.ref_number) {
			return 'Completed'
		} else if (booking?.is_denied === true) {
			return 'Denied'
		} else if (booking?.is_approved === true) {
			return 'Approved'
		} else if (booking?.is_approved === false) {
			return 'Pending'
		} else {
			return 'Unknown'
		}
	}

	const handleBookingClick = (booking: any) => {
		// For others bookings, we don't navigate anywhere
		// Just log or show details if needed
		console.log('Others booking clicked:', booking)
	}

	const isClickable = () => {
		// Others bookings are not clickable for now
		return false
	}

	const deleteBooking = async (booking: any) => {
		try {
			const result = await otherStore.remove(booking.id)
			if (result) {
				return { success: true }
			}
			return { success: false, error: 'Failed to delete booking' }
		} catch (error: any) {
			console.error('Error deleting others booking:', error)
			return { success: false, error: error.message || 'Failed to delete booking' }
		}
	}

	const canDelete = (booking: any) => {
		// Allow deletion for all bookings regardless of status
		return booking ? true : false
	}

	onMounted(async () => {
		await otherStore.fetchAll()
	})

	return {
		otherStore,
		mobile,
		userBookings,
		formatDate,
		getStatusColor,
		getStatusText,
		handleBookingClick,
		isClickable,
		deleteBooking,
		canDelete,
	}
}
