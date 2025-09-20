import { onMounted, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { useFuneralStore } from '@/stores/funeralBookingData.js'

// Composable nga nag-handle sa funeral bookings logic
export function useFuneralHeader() {
	const funeralStore = useFuneralStore()
	const { mobile } = useDisplay()
	const router = useRouter()

	const userBookings = computed(() => funeralStore.bookings)

	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return 'No date'
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: mobile.value ? 'short' : 'long',
			day: 'numeric',
		})
	}

	const getStatusColor = (booking: any) => {
		// Check if booking is completed (either by ref_number or is_completed flag)
		if (booking?.is_completed === true || booking?.ref_number) {
			return 'success'
		}
		// Explicit denied state should be shown as error (red)
		else if (booking?.is_denied === true) {
			return 'error'
		}
		// Approved but not yet completed
		else if (booking?.is_approved === true) {
			return 'primary'
		}
		// Explicit pending/false approval
		else if (booking?.is_approved === false) {
			return 'warning'
		} else {
			return 'info'
		}
	}

	const getStatusText = (booking: any) => {
		if (booking?.is_completed === true || booking?.ref_number) {
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
		// Click lang kung approved ang booking ug dili pa kompleto - redirect to funeral form para ma-continue
		// Use isClickable so the same rule is applied consistently
		if (isClickable(booking)) {
			// store the selected booking id sa store para magamit sa next view
			funeralStore.selectBooking(booking.id)
			// navigate and pass booking id as a query param
			router.push({ path: '/funeral-mass-continue', query: { bookingId: String(booking.id) } })
		}
	}

	const isClickable = (booking: any) => {
		// Only clickable when approved and NOT completed
		if (!booking) return false
		// Not clickable if booking already completed (either by ref_number or is_completed flag)
		if (booking?.is_completed === true) return false
		if (booking?.ref_number) return false
		// Not clickable if booking is explicitly denied
		if (booking?.is_denied === true) return false
		// Only clickable if approved and not completed
		return booking?.is_approved === true
	}

	const deleteBooking = async (booking: any) => {
		try {
			const result = await funeralStore.deleteBooking(booking.id)
			return result
		} catch (error) {
			console.error('Error deleting funeral booking:', error)
			return { success: false, error: error.message || 'Failed to delete booking' }
		}
	}

	const canDelete = (booking: any) => {
		// Allow deletion for all bookings regardless of status
		return booking ? true : false
	}

	// Watch para sa mga changes sa bookings especially kung naa na'y completion status
	watch(
		() => funeralStore.bookings,
		(newBookings) => {
			const completedBookings = newBookings.filter(booking => booking.is_completed === true)
			if (completedBookings.length > 0) {
				console.log('May mga completed funeral bookings na:', completedBookings)
			}
		},
		{ deep: true }
	)

	onMounted(async () => {
		await funeralStore.fetchUserFuneralBookings()
	})

	return {
		funeralStore,
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
