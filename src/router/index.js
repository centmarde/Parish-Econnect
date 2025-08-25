import { /*getUserInformation,*/ supabase, isAuthenticated } from '@/utils/supabase'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import HomePage from '@/views/auth/HomePage.vue'
import BookEvent from '@/views/bookingEvents/BookEvent.vue'
import WeddingMassForm from '@/views/auth/WeddingMassForm.vue'
import BaptismMass from '@/views/auth/BaptismMass.vue'
import FuneralMass from '@/views/auth/FuneralMass.vue'
import ThanksGivingMass from '@/views/auth/ThanksGivingMass.vue'
import TrialHeader from '@/views/TrialHeader.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminBookingsView from '@/views/admin/AdminBookingsView.vue'
import NotFoundView from '@/views/error/NotFoundView.vue'
import FFBookingListView from '@/views/admin/FFBookingListView.vue'
import BFBookingListView from '@/views/admin/BFBookingListView.vue'
import TGBookingListView from '@/views/admin/TGBookingListView.vue'
import ForbiddenView from '@/views/error/ForbiddenView.vue'
import TrialPage from '@/views/error/TrialPage.vue'
// import CameraView from '@/views/camera/CameraView.vue'
import Events from '@/views/events/EventsView.vue'
import Notifications from '@/views/notifications/NotificationsView.vue'
import Pending from '@/views/PendingView.vue'
import WeddingContinue from '@/views/contWedding/ContWeddingView.vue'
import WeddingContinue2 from '@/views/contWedding/CameraWeddingView.vue'
import FinnishView from '@/views/FinnishView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/trial-page',
      name: 'trial-page',
      component: TrialPage,
    },

    {
      path: '/',
       name: 'login',
      component: LoginView,
    },
    {
      path: '/homepage',
      name: 'homepage',
      component: HomePage,
    },
    {
      path: '/book-event',
      name: 'book-event',
      component: BookEvent,
    },
    {
      path: '/pending',
      name: 'pending',
      component: Pending,
    },
   /*   {
      path: '/camera',
      name: 'camera',
      component: CameraView,
       meta: { requiresAuth: true },
    }, */
    {
      path: '/events',
      name: 'events',
      component: Events,
      meta: { requiresAuth: true },
    },
    {
      path: '/wedding-mass-continue',
      name: 'wedding-mass-continue',
      component: WeddingContinue,
      meta: { requiresAuth: true },
    },
     {
      path: '/wedding-mass-continue-2',
      name: 'wedding-mass-continue-2',
      component: WeddingContinue2,
      meta: { requiresAuth: true },
    },
    {
      path: '/finnish',
      name: 'finnish',
      component: FinnishView,
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notifications,
      meta: { requiresAuth: true },
    },
    {
      path: '/wedding-mass-form',
      name: 'wedding-mass-form',
      component: WeddingMassForm,
    },
    {
      path: '/baptism-mass',
      name: 'baptism-mass',
      component: BaptismMass,
    },
    {
      path: '/funeral-mass',
      name: 'funeral-mass',
      component: FuneralMass,
    },
    {
      path: '/thanks-giving-mass',
      name: 'thanks-giving-mass',
      component: ThanksGivingMass,
    },
    {
      //path: '/admin/admin-dashboard',
      path: '/admin-dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
      meta: { requiresAdmin: true },
    },
    {
      //path: '/admin/admin-booking-view',
      path: '/admin-booking-view',
      name: 'admin-booking-view',
      component: AdminBookingsView,
      meta: { requiresAdmin: true },
    },

    {
      path: '/trial-header',
      name: 'trial-header',
      component: TrialHeader,
    },
    {
      path: '/page-not-found',
      name: 'page-not-found',
      component: NotFoundView,
    },
    {
      path: '/funeral-mass-form-bookinglist-view',
      name: 'funeral-mass-form-bookinglist-view',
      component: FFBookingListView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/baptism-mass-form-bookinglist-view',
      name: 'baptism-mass-form-bookinglist-view',
      component: BFBookingListView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/thanksgiving-mass-form-bookinglist-view',
      name: 'thanksgiving-mass-form-bookinglist-view',
      component: TGBookingListView,
      meta: { requiresAdmin: true },
    },
   
    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'catch-all',
      redirect: '/login'
    }
  ],
})

router.beforeEach(async (to) => {
  const isLoggedIn = await isAuthenticated()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to appropriate page if accessing home route
  if (to.name === 'home') {
    return isLoggedIn ? { name: 'homepage' } : { name: 'login' }
  }

  // If not logged in
  if (!isLoggedIn) {
    // Only allow access to login and register
    if (to.name === 'login' || to.name === 'register') {
      return true
    } else if (to.name === 'page-not-found' || to.name === 'forbidden') {
      return true
    } else {
      // any other page (even /homepage) = not allowed
      return { name: 'page-not-found' }
    }
  }

  // If logged in, prevent access to login or register pages
  if (isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    // redirect the user to the dashboard page
    return { name: 'homepage' }
  }

  let userRole = null
  if (user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    userRole = roleData?.role
  }

  const isAdmin = userRole === 'admin'

  if (to.meta.requiresAdmin) {
    if (!isLoggedIn || !isAdmin) {
      return '/forbidden'
    }
  }

  /*
  // Check user if the user is logged in or not admin
  if (isLoggedIn && !isAdmin) {
    if (to.path.startsWith('/admin/users')) {
      return { name: 'forbidden' }
    }
  }

  // If not logged in, prevent access to system pages
  if (!isLoggedIn && to.path.startsWith('/admin')) {
    // redirect the user to the login page
    return { name: 'login' }
  }
*/
  if (router.resolve(to).matched.length === 0) {
    return { name: 'page-not-found' }
  }
})

export default router
