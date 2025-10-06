import { /*getUserInformation,*/ } from '@/utils/supabase'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthUserStore } from '@/stores/authUser'
import LoginView from '@/views/auth/LoginView.vue'
import HomePage from '@/views/auth/HomePage.vue'
import BookEvent from '@/views/bookingEvents/BookEvent.vue'
import WeddingMassForm from '@/views/auth/WeddingMassView.vue'
import BaptismMass from '@/views/auth/BaptismMassView.vue'
import FuneralMass from '@/views/auth/FuneralMassView.vue'
import ThanksGivingMass from '@/views/auth/ThanksGivingMass.vue'
import TrialHeader from '@/views/TrialHeader.vue'
import AdminDashboard from '@/views/admin/AdminDashboardView.vue'
import AdminBookingsView from '@/views/adminOld/AdminBookingsView.vue'
import AdminMembersView from '@/views/adminOld/AdminMembersView.vue'
import AdminEventsView from '@/views/adminOld/AdminEventsView.vue'
import AdminAlertsView from '@/views/adminOld/AdminAlertsView.vue'
import NotFoundView from '@/views/error/NotFoundView.vue'
import ForbiddenView from '@/views/error/ForbiddenView.vue'
import TrialPage from '@/views/error/TrialPage.vue'
// import CameraView from '@/views/camera/CameraView.vue'
import Events from '@/views/events/EventsView.vue'
import Notifications from '@/views/notifications/NotificationsView.vue'
import Pending from '@/views/PendingView.vue'
import WeddingContinue from '@/views/contWedding/ContWeddingView.vue'
import WeddingContinue2 from '@/views/contWedding/CameraWeddingView.vue'
import FuneralContinue from '@/views/contFuneral/ContFuneralView.vue'
import FuneralContinue2 from '@/views/contFuneral/CameraFunderalView.vue'
import ThanksGivingContinue from '@/views/contThanksGiving/ContThanksGivingView.vue'
import ThanksGivingContinue2 from '@/views/contThanksGiving/CamerraThanksGivingView.vue'
import BaptismContinue from '@/views/contBaptism/ContBaptismView.vue'
import BaptismContinue2 from '@/views/contBaptism/CameraBaptismView.vue'
import FinnishView from '@/views/FinnishView.vue'

import LandingView from '@/views/LandingView.vue'
import AnnouncementView from '@/views/admin/AnnouncementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/trial-page',
      name: 'trial-page',
      component: TrialPage,
    },

    {
      path: '/auth',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/homepage',
      name: 'homepage',
      component: HomePage,
      meta: { requiresUserMode: true },
    },
    {
      path: '/book-event',
      name: 'book-event',
      component: BookEvent,
      meta: { requiresUserMode: true },
    },
    {
      path: '/pending',
      name: 'pending',
      component: Pending,
      meta: { requiresUserMode: true },
    },
    {
      path: '/admin/announcements',
      name: 'announcement',
      component: AnnouncementView,
      meta: { requiresAdmin: true },
    },
    /*   {
      path: '/camera',
      name: 'camera',
      component: CameraView,
       meta: { requiresAuth: true, requiresUserMode: true },
    }, */
    {
      path: '/events',
      name: 'events',
      component: Events,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/wedding-mass-continue',
      name: 'wedding-mass-continue',
      component: WeddingContinue,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/wedding-mass-continue-2',
      name: 'wedding-mass-continue-2',
      component: WeddingContinue2,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/funeral-mass-continue',
      name: 'funeral-mass-continue',
      component: FuneralContinue,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/funeral-mass-continue-2',
      name: 'funeral-mass-continue-2',
      component: FuneralContinue2,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/thanksgiving-mass-continue',
      name: 'thanksgiving-mass-continue',
      component: ThanksGivingContinue,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/thanksgiving-mass-continue-2',
      name: 'thanksgiving-mass-continue-2',
      component: ThanksGivingContinue2,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/baptism-mass-continue',
      name: 'baptism-mass-continue',
      component: BaptismContinue,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/baptism-mass-continue-2',
      name: 'baptism-mass-continue-2',
      component: BaptismContinue2,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/finnish',
      name: 'finnish',
      component: FinnishView,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notifications,
      meta: { requiresAuth: true, requiresUserMode: true },
    },
    {
      path: '/wedding-mass-form',
      name: 'wedding-mass-form',
      component: WeddingMassForm,
      meta: { requiresUserMode: true },
    },
    {
      path: '/baptism-mass',
      name: 'baptism-mass',
      component: BaptismMass,
      meta: { requiresUserMode: true },
    },
    {
      path: '/funeral-mass',
      name: 'funeral-mass',
      component: FuneralMass,
      meta: { requiresUserMode: true },
    },
    {
      path: '/thanks-giving-mass',
      name: 'thanks-giving-mass',
      component: ThanksGivingMass,
      meta: { requiresUserMode: true },
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
      //path: '/admin/admin-members-view',
      path: '/admin-members-view',
      name: 'admin-members-view',
      component: AdminMembersView,
      meta: { requiresAdmin: true },
    },
    {
      //path: '/admin/admin-events-view',
      path: '/admin-events-view',
      name: 'admin-events-view',
      component: AdminEventsView,
      meta: { requiresAdmin: true },
    },
    {
      //path: '/admin/admin-alerts-view',
      path: '/admin-alerts-view',
      name: 'admin-alerts-view',
      component: AdminAlertsView,
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
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'catch-all',
      redirect: '/page-not-found',
    },
  ],
})

// Initialize auth state on app startup
let authInitialized = false

router.beforeEach(async (to) => {
  const authUserStore = useAuthUserStore()

  // Only call isAuthenticated once on app startup, then use reactive state
  if (!authInitialized) {
    try {
      await authUserStore.isAuthenticated()
      authInitialized = true
    } catch (error) {
      console.error('Auth initialization error:', error)
      // Fallback to logged out state
      authInitialized = true
    }
  }

  // Use reactive state instead of async method - with null safety
  const isLoggedIn = authUserStore.user !== null && authUserStore.user !== undefined

  // Redirect to appropriate page if accessing home route
  if (to.name === 'home') {
    return isLoggedIn ? { name: 'homepage' } : { name: 'login' }
  }

  // If not logged in
  if (!isLoggedIn) {
    // Only allow access to login, register, and landing
    if (to.name === 'login' || to.name === 'register' || to.name === 'landing') {
      return true
    } else if (to.name === 'page-not-found' || to.name === 'forbidden') {
      return true
    } else {
      // any other page (even /homepage) = not allowed
      return { name: 'page-not-found' }
    }
  }

  // If logged in and trying to access landing page, redirect to appropriate dashboard
  if (isLoggedIn && to.name === 'landing') {
    const isAdmin = authUserStore.isCurrentUserAdmin
    if (isAdmin) {
      return { name: 'admin-dashboard' }
    } else {
      return { name: 'homepage' }
    }
  }

  // If logged in, prevent access to login or register pages
  if (isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    // Redirect based on user's actual role from rolesData store
    const isAdmin = authUserStore.isCurrentUserAdmin
    if (isAdmin) {
      return { name: 'admin-dashboard' }
    } else {
      return { name: 'homepage' }
    }
  }

  // Use authUser store for role checking instead of direct database query
  const isAdmin = authUserStore.isCurrentUserAdmin

  // Strict role separation - admins and users have separate page access

  // Check admin-only routes
  if (to.meta.requiresAdmin) {
    if (!isLoggedIn || !isAdmin) {
      return '/forbidden'
    }
  }

  // Check user-mode-only routes - ONLY regular users can access these
  if (to.meta.requiresUserMode) {
    if (!isLoggedIn) {
      return '/forbidden'
    }
    // Block admins from accessing user-only pages
    if (isAdmin) {
      return '/forbidden'
    }
  }

  // Additional role-based redirection for specific scenarios
  if (isLoggedIn) {
    // If admin tries to access homepage, redirect to admin dashboard
    if (isAdmin && to.name === 'homepage') {
      return { name: 'admin-dashboard' }
    }

    // If regular user tries to access any admin page, block them
    if (!isAdmin && to.path.startsWith('/admin')) {
      return '/forbidden'
    }
  }

  if (router.resolve(to).matched.length === 0) {
    return { name: 'page-not-found' }
  }
})

export default router
