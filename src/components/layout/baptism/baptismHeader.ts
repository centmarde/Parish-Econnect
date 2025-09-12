import { onMounted, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { useBaptismStore } from '@/stores/baptismBookingData.js'

// Composable nga nag-handle sa baptism bookings logic
export function useBaptismHeader() {
	const baptismStore = useBaptismStore()
	const { mobile } = useDisplay()
	const router = useRouter()

	const userBookings = computed(() => baptismStore.bookings)

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
		// Click lang kung approved ang booking ug dili pa kompleto - redirect to baptism form para ma-continue
		// Use isClickable so the same rule is applied consistently
		if (isClickable(booking)) {
			// store the selected booking id sa store para magamit sa next view
			baptismStore.selectBooking(booking.id)
			// navigate and pass booking id as a query param
			router.push({ path: '/baptism-mass-continue', query: { bookingId: String(booking.id) } })
		}
	}

	const isClickable = (booking: any) => {
		// Only clickable when approved and NOT completed
		if (!booking) return false
		// Not clickable if booking already completed or explicitly denied
		if (booking?.ref_number) return false
		if (booking?.is_denied === true) return false
		return booking?.is_approved === true
	}

	// Watch para sa mga changes sa bookings especially kung naa na'y completion status
	watch(
		() => baptismStore.bookings,
		(newBookings) => {
			const completedBookings = newBookings.filter(booking => booking.ref_number)
			if (completedBookings.length > 0) {
				console.log('May mga completed baptism bookings na:', completedBookings)
			}
		},
		{ deep: true }
	)

	onMounted(async () => {
		await baptismStore.fetchUserBaptismBookings()
	})

	return {
		baptismStore,
		mobile,
		userBookings,
		formatDate,
		getStatusColor,
		getStatusText,
		handleBookingClick,
		isClickable,
	}
}
